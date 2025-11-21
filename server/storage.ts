// server/storage.ts
import { 
  type User, 
  type InsertUser,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import bcrypt from 'bcryptjs';

const CONVERSATIONS_DIR = path.join(process.cwd(), "data", "conversations");
const USERS_FILE = path.join(process.cwd(), "data", "users.json");

async function ensureDataDir() {
  await fs.mkdir(CONVERSATIONS_DIR, { recursive: true });
  await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  getConversations(userId?: string): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation>;
  deleteConversation(id: string): Promise<void>;
  
  getMessages(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: string, data: Partial<Message>): Promise<Message>;

}

interface ConversationData {
  conversation: Conversation;
  messages: Message[];
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private usersFile: string;

  constructor() {
    this.users = new Map();
    this.usersFile = USERS_FILE;
    this.loadUsers().catch(console.error);
    ensureDataDir().catch(console.error);
  }

  private async loadUsers(): Promise<void> {
    try {
      const data = await fs.readFile(this.usersFile, 'utf-8');
      const usersArray = JSON.parse(data);
      this.users.clear();
      for (const user of usersArray) {
        this.users.set(user.id, {
          ...user,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
          lastActivity: user.lastActivity ? new Date(user.lastActivity) : new Date(),
        });
      }
    } catch (error) {
      await this.saveUsers();
    }
  }

  private async saveUsers(): Promise<void> {
    const usersArray = Array.from(this.users.values()).map(user => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastActivity: user.lastActivity.toISOString(),
    }));
    await fs.writeFile(this.usersFile, JSON.stringify(usersArray, null, 2), 'utf-8');
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const hashedPassword = await bcrypt.hash(insertUser.password, 12);
    
    const user: User = {
      id,
      username: insertUser.username,
      password: hashedPassword,
      role: 'user',
      tokensUsed: 0,
      tokensLimit: 1000,
      plan: 'free',
      lastActivity: now,
      createdAt: now,
      updatedAt: now,
    };
    
    this.users.set(id, user);
    await this.saveUsers();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);
    await this.saveUsers();
    return updatedUser;
  }

  private getConversationFilePath(id: string): string {
    return path.join(CONVERSATIONS_DIR, `${id}.json`);
  }

  private async loadConversationData(id: string): Promise<ConversationData | null> {
    try {
      const filePath = this.getConversationFilePath(id);
      const data = await fs.readFile(filePath, "utf-8");
      const parsed = JSON.parse(data);

      parsed.conversation.createdAt = new Date(parsed.conversation.createdAt);
      parsed.conversation.updatedAt = new Date(parsed.conversation.updatedAt);
      parsed.messages = parsed.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
      
      return parsed;
    } catch (error) {
      return null;
    }
  }

  private async saveConversationData(id: string, data: ConversationData): Promise<void> {
    await ensureDataDir();
    const filePath = this.getConversationFilePath(id);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  async getConversations(userId?: string): Promise<Conversation[]> {
    try {
      await ensureDataDir();
      const files = await fs.readdir(CONVERSATIONS_DIR);
      const conversations: Conversation[] = [];

      for (const file of files) {
        if (file.endsWith(".json")) {
          const id = file.replace(".json", "");
          const data = await this.loadConversationData(id);
          if (data && (!userId || data.conversation.userId === userId)) {
            conversations.push(data.conversation);
          }
        }
      }

      return conversations.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      console.error("Error in getConversations:", error);
      return [];
    }
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const data = await this.loadConversationData(id);
    return data?.conversation;
  }

  async createConversation(
    insertConversation: InsertConversation
  ): Promise<Conversation> {
    const id = randomUUID();
    const now = new Date();
    const conversation: Conversation = {

      id,
      userId: insertConversation.userId || 'anonymous',
      title: insertConversation.title,
      model: insertConversation.model || "tngtech/deepseek-r1t2-chimera:free",
      createdAt: now,
      updatedAt: now,
    };

    const conversationData: ConversationData = {
      conversation,
      messages: [],
    };

    await this.saveConversationData(id, conversationData);
    return conversation;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    const data = await this.loadConversationData(id);
    if (!data) {
      throw new Error("Conversation not found");
    }

    const updatedConversation: Conversation = {
      ...data.conversation,
      ...updates,
      id,
      updatedAt: new Date(),
    };

    data.conversation = updatedConversation;
    await this.saveConversationData(id, data);
    return updatedConversation;
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      const filePath = this.getConversationFilePath(id);
      await fs.unlink(filePath);
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const data = await this.loadConversationData(insertMessage.conversationId);
    if (!data) {
      throw new Error("Conversation not found");
    }

    const id = randomUUID();
    const message: Message = {

      id,
      conversationId: insertMessage.conversationId,
      role: insertMessage.role,
      content: insertMessage.content,
      files: insertMessage.files || null,
      username: insertMessage.username || (insertMessage.role === "user" ? "Пользователь" : "Ассистент"), // ← добавляем имя
      timestamp: new Date(),

    };

    data.messages.push(message);
    data.conversation.updatedAt = new Date();
    
    if (data.messages.length === 1 && message.role === "user") {
      const firstMessage = message.content.trim().slice(0, 50);
      data.conversation.title = firstMessage + (message.content.length > 50 ? "..." : "");
    }

    await this.saveConversationData(insertMessage.conversationId, data);

    // === Обновление статистики пользователя ===
    if (data.conversation.userId && data.conversation.userId !== 'anonymous') {
      const user = await this.getUser(data.conversation.userId);
      if (user) {
        // Простая оценка: 1 токен ≈ 4 символа
        const tokens = Math.ceil(message.content.length / 4);
        await this.updateUser(user.id, {
          tokensUsed: user.tokensUsed + tokens,
          lastActivity: new Date(),
        });
      }
    }

    return message;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const data = await this.loadConversationData(conversationId);
    return data?.messages || [];
  }

  async updateMessage(id: string, updates: Partial<Message>): Promise<Message> {
    // Нужно найти и обновить сообщение во всех диалогах
    const conversations = await this.getConversations();
    
    for (const conversation of conversations) {
      const data = await this.loadConversationData(conversation.id);
      if (data) {
        const messageIndex = data.messages.findIndex(msg => msg.id === id);
        if (messageIndex !== -1) {
          data.messages[messageIndex] = {
            ...data.messages[messageIndex],
            ...updates,
            id // Сохраняем оригинальный ID
          };
          await this.saveConversationData(conversation.id, data);
          return data.messages[messageIndex];
        }
      }
    }
    
    throw new Error("Message not found");
  }

}

export const storage = new MemStorage();

