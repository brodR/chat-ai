import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || ""
});

export async function generateAIResponse(
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  model: string = "gpt-5"
): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return "⚠️ OpenAI API ключ не настроен. Пожалуйста, добавьте OPENAI_API_KEY в переменные окружения.\n\nПока ключ не настроен, я не могу генерировать ответы. Это демо-ответ.";
    }

    const response = await openai.chat.completions.create({
      model: model,
      messages: conversationHistory.map(msg => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content
      })),
    });

    return response.choices[0].message.content || "Извините, не удалось сгенерировать ответ.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    
    if (error instanceof Error && error.message.includes("API key")) {
      return "⚠️ Ошибка API ключа OpenAI. Проверьте правильность ключа в настройках.";
    }
    
    return "Извините, произошла ошибка при обращении к ИИ. Попробуйте еще раз.";
  }
}

export async function analyzeImage(base64Image: string, prompt: string): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return "⚠️ OpenAI API ключ не настроен. Анализ изображений недоступен.";
    }

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ],
        },
      ],
    });

    return response.choices[0].message.content || "Не удалось проанализировать изображение.";
  } catch (error) {
    console.error("Image analysis error:", error);
    return "Ошибка при анализе изображения.";
  }
}
