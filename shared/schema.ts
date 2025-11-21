// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default('user'),
  tokensUsed: integer("tokens_used").notNull().default(0),     // ← использовано токенов
  tokensLimit: integer("tokens_limit").notNull().default(1000), // ← лимит (1000 для free)
  plan: text("plan").notNull().default('free'),                // 'free' | 'premium'
  lastActivity: timestamp("last_activity").defaultNow(),        // ← время последней активности
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
}).extend({
  plan: z.enum(['free', 'premium']).default('free'),
  tokensUsed: z.number().optional().default(0),
  tokensLimit: z.number().optional().default(1000),
  // tokensUsed: z.number().default(0),
  // tokensLimit: z.number().default(1000),
});

// Убедитесь, что у вас есть все необходимые типы
export interface User {
  id: string;
  username: string;
  password: string;
  role: 'user' | 'admin';
  tokensUsed: number;
  tokensLimit: number;
  plan: 'free' | 'premium';
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type InsertUser = z.infer<typeof insertUserSchema>;

// export type InsertUser = z.infer<typeof insertUserSchema>;
// export type User = typeof users.$inferSelect;

// export interface UserStats {
//   totalMessages: number;
//   tokensUsed: number;
//   conversationsCount: number;
//   tokensRemaining: number;
// }

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // userId: varchar("user_id").notNull(), // Теперь обязательно
  userId: varchar("user_id"),
  title: text("title").notNull(),
  model: text("model").notNull().default("tngtech/deepseek-r1t2-chimera:free"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations)
.omit({ id: true, createdAt: true, updatedAt: true })
.extend({
  model: z.string().default("tngtech/deepseek-r1t2-chimera:free"),
  userId: z.string().optional() // ← добавлено
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  files: jsonb("files").$type<FileAttachment[]>(),
  username: text("username"), // ← добавляем поле имени
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  mimeType?: string;
}

// Добавьте в shared/schema.ts
export interface ModelOption {
  
  id: string;
  name: string;
  provider: "openrouter" | "ollama" | "openai" | "local";
  description: string;
  available: boolean;
  contextLength?: number;
}

export const availableModels: ModelOption[] = [
  // OpenRouter модели (бесплатные)
  {
    id: "tngtech/deepseek-r1t2-chimera:free",
    name: "DeepSeek Chat r1t2",
    provider: "openrouter",
    description: "Качественная бесплатная модель от DeepSeek",
    available: true,
  },
  {
    id: "openai/gpt-oss-20b:free", 
    name: "GPT OSS 20B",
    provider: "openrouter",
    description: "Open source версия GPT от OpenAI",
    available: true,
  },
  {
    id: "nvidia/nemotron-nano-12b-v2-vl:free",
    name: "Nemotron Nano 12B",
    provider: "openrouter", 
    description: "Компактная модель от NVIDIA с поддержкой зрения",
    available: true,
  },
  // Существующие модели
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B",
    provider: "openrouter",
    description: "Мощная модель от Meta",
    available: true,
  },
  // Ollama модели
  {
    id: "llama3.1:8b",
    name: "Llama 3.1 8B",
    provider: "ollama",
    description: "Эффективная локальная модель",
    available: true,
  },
  {
    id: "llama3.1:70b", 
    name: "Llama 3.1 70B",
    provider: "ollama",
    description: "Мощная локальная модель от Meta",
    available: true,
  },
  {
    id: "mistral-nemo",
    name: "Mistral Nemo",
    provider: "ollama", 
    description: "Качественная модель от Mistral AI",
    available: true,
  },
  // OpenRouter Models
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "openrouter",
    description: "Продвинутая модель от Anthropic",
    available: true,
  },
  {
    id: "google/gemini-flash-1.5",
    name: "Gemini Flash 1.5",
    provider: "openrouter",
    description: "Быстрая модель от Google",
    available: true,
  }
];
