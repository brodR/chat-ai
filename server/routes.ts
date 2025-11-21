// server/routes.ts
import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { generateAIResponse } from "./openai";
import { z } from "zod";
import { insertConversationSchema, insertMessageSchema } from "@shared/schema";
import { authRouter } from "./auth";
import { generateAIResponseStream } from "./streaming";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

async function ensureUploadsDir() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: async (_req, _file, cb) => {
      await ensureUploadsDir();
      cb(null, UPLOADS_DIR);
    },
    filename: (_req, file, cb) => {
      const uniqueName = `${randomUUID()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use('/api/auth', authRouter);
  await ensureUploadsDir();

  app.use("/uploads", express.static(UPLOADS_DIR));

  // GET /api/conversations — список диалогов (анонимусы видят все, авторизованные — свои)
  app.get("/api/conversations", async (req, res) => {
    try {
      const userId = req.session?.userId;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // app.get("/api/user/profile", async (req, res) => {
  //   if (!req.session.userId) {
  //     return res.status(401).json({ error: "Not authenticated" });
  //   }
  //   try {
  //     const user = await storage.getUser(req.session.userId);
  //     if (!user) {
  //       return res.status(404).json({ error: "User not found" });
  //     }
  //     res.json({
  //       id: user.id,
  //       username: user.username,
  //       plan: user.plan,
  //       tokensUsed: user.tokensUsed,
  //       tokensLimit: user.tokensLimit,
  //       tokensRemaining: user.tokensLimit - user.tokensUsed,
  //       lastActivity: user.lastActivity,
  //     });
  //   } catch (error) {
  //     res.status(500).json({ error: "Failed to fetch profile" });
  //   }
  // });

  // // В server/routes.ts
  // app.post("/api/user/upgrade", async (req, res) => {
  //   if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
  //   try {
  //     await storage.updateUser(req.session.userId, {
  //       plan: 'premium',
  //       tokensLimit: 100000, // или Infinity
  //     });
  //     res.json({ success: true });
  //   } catch (error) {
  //     res.status(500).json({ error: "Failed to upgrade" });
  //   }
  // });

  // GET /api/conversations/:id
  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // POST /api/conversations — создание нового диалога
  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation({
        ...validatedData,
        userId: req.session?.userId || 'anonymous',
      });
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // DELETE /api/conversations/:id
  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      await storage.deleteConversation(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // GET /api/conversations/:conversationId/messages
  app.get("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // PATCH /api/conversations/:id - обновление диалога
  app.patch("/api/conversations/:id", async (req, res) => {
    try {
      const { model } = req.body;
      const conversation = await storage.updateConversation(req.params.id, {
        model: model
      });
      res.json(conversation);
    } catch (error) {
      console.error("Error updating conversation:", error);
      res.status(500).json({ error: "Failed to update conversation" });
    }
  });

  // POST /api/messages
  app.post("/api/messages", upload.array("files", 10), async (req, res) => {
    try {
      // ПРОВЕРКА ЛИМИТОВ
      if (req.session.userId) {
        const user = await storage.getUser(req.session.userId);
        if (user && user.plan === 'free' && user.tokensUsed >= user.tokensLimit) {
          return res.status(403).json({ 
            error: "Лимит токенов исчерпан. Перейдите на премиум для продолжения." 
          });
        }
      }

      const { content, conversationId } = req.body;

      if (!content || !conversationId) {
        return res.status(400).json({ error: "Content and conversationId are required" });
      }

      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Получаем пользователя для имени
      let username = "Пользователь";
      if (req.session.userId) {
        const user = await storage.getUser(req.session.userId);
        if (user) {
          username = user.username;
        }
      }

      const files = req.files as Express.Multer.File[];
      console.log("Received files:", files); // ← добавь для отладки
      
      const fileAttachments = files?.map(file => ({
        id: randomUUID(),
        name: file.originalname,
        type: file.mimetype.split("/")[0],
        size: file.size,
        url: `/uploads/${file.filename}`,
        mimeType: file.mimetype,
      })) || [];

      const userMessage = await storage.createMessage({
        conversationId,
        role: "user",
        content,
        files: fileAttachments.length > 0 ? fileAttachments : undefined,
        username: username,
      });

      const allMessages = await storage.getMessages(conversationId);

      const conversationHistory = allMessages.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
        ...(msg.username && { username: msg.username }),
        //username: msg.username || undefined, // || (msg.role === "user" ? "Пользователь" : "Ассистент"),
      }));

      // СОЗДАЕМ ПУСТОЕ СООБЩЕНИЕ АССИСТЕНТА
      const assistantMessage = await storage.createMessage({
        conversationId,
        role: "assistant",
        content: "", // начинаем с пустого
        username: "Ассистент",
      });

      // СРАЗУ ОТПРАВЛЯЕМ ОТВЕТ КЛИЕНТУ
      res.status(201).json({
        userMessage,
        assistantMessage,
      });

      // ПОТОМ ГЕНЕРИРУЕМ ОТВЕТ ПОТОКОМ
      try {
        let fullResponse = "";
        
        for await (const chunk of generateAIResponseStream(
          conversationHistory,
          conversation.model || "tngtech/deepseek-r1t2-chimera:free"
        )) {
          fullResponse += chunk;
          
          // ОБНОВЛЯЕМ СООБЩЕНИЕ В БАЗЕ
          await storage.updateMessage(assistantMessage.id, {
            content: fullResponse
          });
        }
        
      } catch (error) {
        console.error("Stream generation error:", error);
        await storage.updateMessage(assistantMessage.id, {
          content: "❌ Ошибка при генерации ответа"
        });
      }

    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // // POST /api/messages
  // app.post("/api/messages", upload.array("files", 10), async (req, res) => {
  //   try {
  //     // ДОБАВЬ ПРОВЕРКУ ЛИМИТОВ
  //     if (req.session.userId) {
  //       const user = await storage.getUser(req.session.userId);
  //       if (user && user.plan === 'free' && user.tokensUsed >= user.tokensLimit) {
  //         return res.status(403).json({ 
  //           error: "Лимит токенов исчерпан. Перейдите на премиум для продолжения." 
  //         });
  //       }
  //     }

  //     const { content, conversationId } = req.body;

  //     if (!content || !conversationId) {
  //       return res.status(400).json({ error: "Content and conversationId are required" });
  //     }

  //     const conversation = await storage.getConversation(conversationId);
  //     if (!conversation) {
  //       return res.status(404).json({ error: "Conversation not found" });
  //     }

  //         // Получаем пользователя для имени
  //     let username = "Пользователь";
  //     if (req.session.userId) {
  //       const user = await storage.getUser(req.session.userId);
  //       if (user) {
  //         username = user.username;
  //       }
  //     }

  //     const files = req.files as Express.Multer.File[];
  //     const fileAttachments = files?.map(file => ({
  //       id: randomUUID(),
  //       name: file.originalname,
  //       type: file.mimetype.split("/")[0],
  //       size: file.size,
  //       url: `/uploads/${file.filename}`,
  //       mimeType: file.mimetype,
  //     })) || [];

  //     const userMessage = await storage.createMessage({
  //       conversationId,
  //       role: "user",
  //       content,
  //       files: fileAttachments.length > 0 ? fileAttachments : undefined,
  //       username: username, // ← добавляем имя пользователя
  //     });

  //     const allMessages = await storage.getMessages(conversationId);

  //     const conversationHistory = allMessages.map(msg => ({
  //       role: msg.role as "user" | "assistant",
  //       content: msg.content,
  //       username: msg.username || (msg.role === "user" ? "Пользователь" : "Ассистент"), // ← передаём имена
  //     }));

  //     const aiResponse = await generateAIResponse(
  //       conversationHistory,
  //       conversation.model || "meta-llama/llama-3.3-70b-instruct:free"
  //     );

  //     const assistantMessage = await storage.createMessage({
  //       conversationId,
  //       role: "assistant",
  //       content: aiResponse,
  //       username: "Ассистент", // ← имя для ассистента
  //     });

  //     res.status(201).json({
  //       userMessage,
  //       assistantMessage,
  //     });
  //   } catch (error) {
  //     console.error("Error creating message:", error);
  //     res.status(500).json({ error: "Failed to create message" });
  //   }
  // });

  // Добавь в server/routes.ts (внутри registerRoutes, после других роутов)

    // GET /api/user/profile
    app.get("/api/user/profile", async (req, res) => {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      try {
        const user = await storage.getUser(req.session.userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        res.json({
          id: user.id,
          username: user.username,
          plan: user.plan,
          tokensUsed: user.tokensUsed,
          tokensLimit: user.tokensLimit,
        });
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch profile" });
      }
    });

    // POST /api/user/upgrade
    app.post("/api/user/upgrade", async (req, res) => {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      try {
        await storage.updateUser(req.session.userId, {
          plan: 'premium',
          tokensLimit: 100000,
        });
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: "Failed to upgrade" });
      }
    });

  const httpServer = createServer(app);

  return httpServer;
}
