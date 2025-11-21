import { config } from "./config";

export async function* generateAIResponseStream(
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
    username?: string;
  }>,
  model: string = "tngtech/deepseek-r1t2-chimera:free"
): AsyncGenerator<string> {
  try {
    const apiKey = config.OPENROUTER_API_KEY;
    if (!apiKey) {
      yield "❌ Ошибка: API ключ не настроен";
      return;
    }

    // Форматируем историю с именами пользователей
    const messages = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.username 
        ? `${msg.username}: ${msg.content}`
        : msg.content
    }));

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-app.com",
        "X-Title": "Chat App"
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 4000,
        temperature: 0.7,
        stream: true  // ← Включаем потоковую передачу
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", errorText);
      yield "❌ Ошибка при подключении к API";
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      yield "❌ Ошибка чтения потока";
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Последняя строка может быть неполной

        for (const line of lines) {
          const trimmedLine = line.trim();
          
          if (trimmedLine === "") continue;
          if (trimmedLine === "data: [DONE]") break;
          
          if (trimmedLine.startsWith("data: ")) {
            try {
              const jsonData = JSON.parse(trimmedLine.slice(6));
              const chunk = jsonData.choices[0]?.delta?.content;
              
              if (chunk) {
                yield chunk;
              }
            } catch (e) {
              // Игнорируем ошибки парсинга
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

  } catch (error) {
    console.error("Stream error:", error);
    yield "❌ Ошибка при генерации ответа";
  }
}