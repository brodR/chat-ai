// server/ai-service.ts
import { aiService, OpenAIProvider, OpenRouterProvider, OllamaProvider } from "./ai-providers";
import { availableModels } from "@shared/schema";

// Инициализация провайдеров
if (process.env.OPENAI_API_KEY) {
  aiService.registerProvider("openai", new OpenAIProvider(process.env.OPENAI_API_KEY));
  console.log("✅ OpenAI provider registered");
} else {
  console.log("❌ OPENAI_API_KEY not found");
}

if (process.env.OPENROUTER_API_KEY) {
  aiService.registerProvider("openrouter", new OpenRouterProvider(process.env.OPENROUTER_API_KEY));
  console.log("✅ OpenRouter provider registered");
} else {
  console.log("❌ OPENROUTER_API_KEY not found");
}

if (process.env.OLLAMA_BASE_URL) {
  aiService.registerProvider("ollama", new OllamaProvider(process.env.OLLAMA_BASE_URL));
  console.log("✅ Ollama provider registered");
} else {
  // Попробуем стандартный URL для Ollama
  aiService.registerProvider("ollama", new OllamaProvider());
  console.log("ℹ️ Ollama provider registered with default URL");
}

export async function generateAIResponse(
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  modelId: string
): Promise<string> {
  try {
    // Находим модель в списке доступных
    const model = availableModels.find(m => m.id === modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    console.log(`🔄 Using model: ${modelId} from provider: ${model.provider}`);

    // Проверяем доступность провайдера
    const provider = aiService.getProvider(model.provider);
    if (!provider) {
      throw new Error(`Provider ${model.provider} is not configured. Please check your environment variables.`);
    }

    const response = await aiService.generateResponse(model.provider, conversationHistory, modelId);
    console.log(`✅ Successfully generated response for model: ${modelId}`);
    return response;
    
  } catch (error) {
    console.error("❌ AI Service error:", error);
    
    if (error instanceof Error) {
      // Более информативные сообщения об ошибках
      if (error.message.includes("API key") || error.message.includes("401")) {
        return `⚠️ Ошибка API ключа для ${modelId}. Проверьте настройки окружения.`;
      }
      if (error.message.includes("not configured")) {
        return `⚠️ Провайдер не настроен для ${modelId}. Проверьте переменные окружения.`;
      }
      if (error.message.includes("connect") || error.message.includes("ECONNREFUSED")) {
        return `⚠️ Не удалось подключиться к сервису для ${modelId}. Проверьте запущен ли сервис или доступность API.`;
      }
      if (error.message.includes("timeout")) {
        return `⚠️ Превышено время ожидания ответа от ${modelId}. Попробуйте еще раз.`;
      }
    }
    
    return "Извините, произошла ошибка при обращении к ИИ. Попробуйте еще раз или выберите другую модель.";
  }
}