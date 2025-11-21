// server/ai-providers.ts
import OpenAI from "openai";
import axios from "axios";

export interface AIProvider {
  generateResponse(
    conversationHistory: { role: "user" | "assistant"; content: string }[],
    model: string
  ): Promise<string>;
}

// OpenAI Provider
export class OpenAIProvider implements AIProvider {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async generateResponse(
    conversationHistory: { role: "user" | "assistant"; content: string }[],
    model: string
  ): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: model,
        messages: conversationHistory.map(msg => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content
        })),
      });

      return response.choices[0].message.content || "Не удалось сгенерировать ответ.";
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// OpenRouter Provider (исправленная версия)
export class OpenRouterProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(
    conversationHistory: { role: "user" | "assistant"; content: string }[],
    model: string
  ): Promise<string> {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: model,
          messages: conversationHistory,
        },
        {
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Chat App",
            "Content-Type": "application/json"
          },
          timeout: 30000
        }
      );

      return response.data.choices[0]?.message?.content || "Не удалось сгенерировать ответ.";
    } catch (error: any) {
      console.error("OpenRouter API error:", error.response?.data || error.message);
      throw new Error(`OpenRouter Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

// Ollama Provider
export class OllamaProvider implements AIProvider {
  private baseUrl: string;

  constructor(baseUrl: string = "http://localhost:11434") {
    this.baseUrl = baseUrl;
  }

  async generateResponse(
    conversationHistory: { role: "user" | "assistant"; content: string }[],
    model: string
  ): Promise<string> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/chat`,
        {
          model: model,
          messages: conversationHistory,
          stream: false
        },
        {
          timeout: 30000
        }
      );

      return response.data.message?.content || "Не удалось сгенерировать ответ.";
    } catch (error: any) {
      console.error("Ollama API error:", error.response?.data || error.message);
      throw new Error(`Ollama Error: ${error.response?.data?.error || error.message}`);
    }
  }
}

// Unified AI Service
export class AIService {
  private providers: Map<string, AIProvider> = new Map();

  registerProvider(name: string, provider: AIProvider) {
    this.providers.set(name, provider);
  }

  getProvider(name: string): AIProvider | undefined {
    return this.providers.get(name);
  }

  async generateResponse(
    providerName: string,
    conversationHistory: { role: "user" | "assistant"; content: string }[],
    model: string
  ): Promise<string> {
    const provider = this.getProvider(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    return await provider.generateResponse(conversationHistory, model);
  }
}

export const aiService = new AIService();
