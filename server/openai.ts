// server/openai.ts
import OpenAI from "openai";
import { config } from "./config";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:8080",
    "X-Title": "Chat App",
  },
});

interface AIResponseOptions {
  model: string;
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
    username?: string;
  }>;
}

// export async function generateAIResponse(
//   conversationHistory: { role: "user" | "assistant"; content: string }[],
//   model: string = "meta-llama/llama-3.3-70b-instruct:free"
// ): Promise<string> {
//   try {
//     if (!process.env.OPENROUTER_API_KEY) {
//       return "⚠️ OpenRouter API ключ не настроен. Добавьте OPENROUTER_API_KEY в .env файл.";
//     }

//     const response = await openai.chat.completions.create({
//       model: model,
//       messages: conversationHistory.map(msg => ({
//         role: msg.role,
//         content: msg.content
//       })),
//     });

//     const responseText = response.choices[0]?.message?.content;
    
//     if (!responseText) {
//       return "Извините, не удалось сгенерировать ответ.";
//     }

//     return responseText;
//   } catch (error) {
//     console.error("OpenRouter API error:", error);
//     return "Извините, произошла ошибка при обращении к ИИ. Попробуйте еще раз.";
//   }
// }

// Определяем провайдера по ID модели
function getProviderByModel(modelId: string): "openrouter" | "ollama" | "openai" {
  if (modelId.includes("ollama") || modelId.includes(":")) {
    return "ollama";
  }
  if (modelId.includes("openrouter") || modelId.includes("/")) {
    return "openrouter";
  }
  return "openrouter"; // по умолчанию
}

export async function generateAIResponse(
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
    username?: string;
  }>,
  model: string = "tngtech/deepseek-r1t2-chimera:free"
): Promise<string> {
  try {
    const provider = getProviderByModel(model);
    
    switch (provider) {
      case "openrouter":
        return await generateOpenRouterResponse(conversationHistory, model);
      case "ollama":
        return await generateOllamaResponse(conversationHistory, model);
      default:
        return await generateOpenRouterResponse(conversationHistory, model);
    }
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Извините, произошла ошибка при генерации ответа.";
  }
}

// Функция для OpenRouter
async function generateOpenRouterResponse(
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
    username?: string;
  }>,
  model: string
): Promise<string> {
  const apiKey = config.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OpenRouter API key not configured");
  }

  // Форматируем историю с именами пользователей
  const messages = conversationHistory.map(msg => ({
    role: msg.role,
    content: msg.username && msg.role === "user" 
      ? `[${msg.username}]: ${msg.content}`  // ← добавляем имя только для пользователя
      : msg.content
  }));

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://your-app.com", // Замени на свой домен
      "X-Title": "ChatAlis" // Замени на название своего приложения
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      max_tokens: 4000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenRouter API error:", errorText);
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "Нет ответа от модели";
}

// Функция для Ollama (если нужно)
async function generateOllamaResponse(
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
    username?: string;
  }>,
  model: string
): Promise<string> {
  // Очищаем модель от префиксов для Ollama
  const ollamaModel = model.replace("ollama/", "").split(":")[0];
  
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: ollamaModel,
      prompt: conversationHistory[conversationHistory.length - 1]?.content || "",
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status}`);
  }

  const data = await response.json();
  return data.response || "Нет ответа от модели";
}

export async function analyzeImage(base64Image: string, prompt: string): Promise<string> {
  return "Анализ изображений временно недоступен.";
}