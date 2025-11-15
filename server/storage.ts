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

const CONVERSATIONS_DIR = path.join(process.cwd(), "data", "conversations");

async function ensureDataDir() {
  await fs.mkdir(CONVERSATIONS_DIR, { recursive: true });
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, data: Partial<Conversation>): Promise<Conversation>;
  deleteConversation(id: string): Promise<void>;
  
  getMessages(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

interface ConversationData {
  conversation: Conversation;
  messages: Message[];
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
    ensureDataDir().catch(console.error);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  private async getConversationFilePath(id: string): string {
    return path.join(CONVERSATIONS_DIR, `${id}.json`);
  }

  private async loadConversationData(id: string): Promise<ConversationData | null> {
    try {
      const filePath = await this.getConversationFilePath(id);
      const data = await fs.readFile(filePath, "utf-8");
      const parsed = JSON.parse(data);
      
      // Convert string dates back to Date objects
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
    const filePath = await this.getConversationFilePath(id);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  async getConversations(): Promise<Conversation[]> {
    try {
      await ensureDataDir();
      const files = await fs.readdir(CONVERSATIONS_DIR);
      const conversations: Conversation[] = [];

      for (const file of files) {
        if (file.endsWith(".json")) {
          const id = file.replace(".json", "");
          const data = await this.loadConversationData(id);
          if (data) {
            conversations.push(data.conversation);
          }
        }
      }

      return conversations.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      return [];
    }
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const data = await this.loadConversationData(id);
    return data?.conversation;
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const now = new Date();
    const conversation: Conversation = {
      ...insertConversation,
      id,
      createdAt: now,
      updatedAt: now,
    };

    const data: ConversationData = {
      conversation,
      messages: [],
    };

    await this.saveConversationData(id, data);
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
      const filePath = await this.getConversationFilePath(id);
      await fs.unlink(filePath);
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const data = await this.loadConversationData(conversationId);
    return data?.messages || [];
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const data = await this.loadConversationData(insertMessage.conversationId);
    if (!data) {
      throw new Error("Conversation not found");
    }

    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };

    data.messages.push(message);
    data.conversation.updatedAt = new Date();
    
    if (data.messages.length === 1 && insertMessage.role === "user") {
      const firstMessage = insertMessage.content.slice(0, 50);
      data.conversation.title = firstMessage + (insertMessage.content.length > 50 ? "..." : "");
    }

    await this.saveConversationData(insertMessage.conversationId, data);
    return message;
  }
}

export const storage = new MemStorage();
