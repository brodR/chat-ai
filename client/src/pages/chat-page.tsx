import React from "react";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Conversation, Message } from "@shared/schema";
import { ChatMessage } from "../components/chat-message";
import { MessageInput } from "../components/message-input";
import { EmptyState } from "../components/empty-state";
import { ScrollArea } from "../components/ui/scroll-area";
import { Skeleton } from "../components/ui/skeleton";
import { apiRequest, queryClient } from "./../lib/queryClient";
import { useToast } from "./../hooks/use-toast";
import { Sparkles, Loader2 } from "lucide-react";

// Правильно определи интерфейс
interface ChatPageProps {
  conversationId: string | null;
  currentModel: string;
}

export function ChatPage({ conversationId, currentModel }: ChatPageProps) {
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const { 
    data: messages = [], 
    isLoading, 
    error 
  } = useQuery<Message[]>({
    queryKey: ["/api/conversations", conversationId, "messages"],
    enabled: !!conversationId,
  });

  // Функция для красивого отображения названия модели
  const getModelDisplayName = (modelId: string): string => {
    const modelMap: { [key: string]: string } = {
      "tngtech/deepseek-r1t2-chimera:free": "DepS r1t2",
      "meta-llama/llama-3.3-70b-instruct:free": "Lla 3.3",
      "google/gemini-flash-1.5:free": "GemiFlash 1.5",
      "llama3.1:8b": "Llama 3.1 8B",
      "llama3.1:70b": "Llama 3.1 70B",
      "mistral-nemo": "Mistral Nemo",
      "anthropic/claude-3.5-sonnet": "Claude 3.5 Sonnet",
      "google/gemini-flash-1.5": "Gemini Flash 1.5"
    };
    
    return modelMap[modelId] || modelId;
  };

  // Добавь обработку ошибок
  useEffect(() => {
    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить сообщения",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, files }: { content: string; files: File[] }) => {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("conversationId", conversationId!);
      files.forEach((file) => {
        formData.append("files", file);
      });
      
      const response = await fetch("/api/messages", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId, "messages"] });
      
      setAutoScroll(true);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (sendMessageMutation.isSuccess) {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", conversationId, "messages"] 
      });
    }
  }, [sendMessageMutation.isSuccess, conversationId, queryClient]);

  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, autoScroll, sendMessageMutation.isPending]);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleSendMessage = (content: string, files: File[]) => {
    if (!conversationId) {
      toast({ title: "Выберите чат", variant: "destructive" });
        // title: "Выберите чат",
        // description: "Создайте новый чат в сайдбаре, чтобы начать общение",
        // variant: "destructive",
      // });
      return;
    }
    if (!content.trim() && files.length === 0) return;

    setIsGenerating(true); // ← показываем что идёт генерация
    sendMessageMutation.mutate({ content, files });
    // НЕ блокируем интерфейс - поле ввода само сбросится
  };

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt, []);
  };

  const showEmptyState = !conversationId || messages.length === 0;

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Заголовок чата с моделью */}
      {conversationId && (
        <div className="border-b p-2 bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Модель: {getModelDisplayName(currentModel)}
            </span>
            {/* Можно добавить кнопку смены модели */}
          </div>
        </div>
      )}

      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        {isLoading ? (
          <div className="space-y-4 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : showEmptyState ? (
          <div className="h-full flex items-center justify-center">
            <EmptyState onPromptClick={handlePromptClick} />
          </div>
        ) : (
          <div className="py-4" data-testid="messages-container">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {/* 👇 ДОБАВЬ ЭТОТ БЛОК - индикатор "Ассистент печатает..." */}
            {sendMessageMutation.isPending && (
              <div className="flex gap-3 px-4 py-3">
                <div className="w-8 h-8 flex-shrink-0 bg-accent rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-accent-foreground" />
                </div>
                <div className="flex flex-col gap-1 max-w-3xl">
                  <div className="rounded-2xl px-4 py-3 bg-muted">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Ассистент печатает...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={false} // ← ВСЕГДА разрешаем ввод
        // disabled={sendMessageMutation.isPending}
        isLoading={sendMessageMutation.isPending}
      />
    </div>
  );
}










// // src/pages/chat-page.tsx
// import React from "react";
// import { useState, useEffect, useRef } from "react";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import { Conversation, Message } from "@shared/schema";
// import { ChatMessage } from "../components/chat-message";
// import { MessageInput } from "../components/message-input";
// import { EmptyState } from "../components/empty-state";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Skeleton } from "@/components/ui/skeleton";
// import { apiRequest, queryClient } from "./../lib/queryClient";
// import { useToast } from "./../hooks/use-toast";

// interface ChatPageProps {
//   conversationId: string | null;
// }

// export function ChatPage({ conversationId , currentModel }: ChatPageProps) {
//   const { toast } = useToast();
//   const scrollAreaRef = useRef<HTMLDivElement>(null);
//   const [autoScroll, setAutoScroll] = useState(true);

//   const { 
//     data: messages = [], 
//     isLoading, 
//     error 
//   } = useQuery<Message[]>({
//     queryKey: ["/api/conversations", conversationId, "messages"],
//     enabled: !!conversationId,
//   });

//   // Добавь эту функцию в ChatPage.tsx или в отдельный хелпер
//   function getModelDisplayName(modelId: string): string {
//     const modelMap: { [key: string]: string } = {
//       "meta-llama/llama-3.3-70b-instruct:free": "Llama 3.3 70B (Free)",
//       "deepseek/deepseek-chat-v3.1:free": "DeepSeek Chat V3.1 (Free)",
//       "google/gemini-flash-1.5:free": "Gemini Flash 1.5 (Free)",
//       "llama3.1:8b": "Llama 3.1 8B",
//       "llama3.1:70b": "Llama 3.1 70B",
//       "mistral-nemo": "Mistral Nemo",
//       "anthropic/claude-3.5-sonnet": "Claude 3.5 Sonnet",
//       "google/gemini-flash-1.5": "Gemini Flash 1.5"
//     };
    
//     return modelMap[modelId] || modelId;
//   }

//     // Добавьте обработку ошибок
//   useEffect(() => {
//     if (error) {
//       toast({
//         title: "Ошибка",
//         description: "Не удалось загрузить сообщения",
//         variant: "destructive",
//       });
//     }
//   }, [error, toast]);

//   const sendMessageMutation = useMutation({
//     mutationFn: async ({ content, files }: { content: string; files: File[] }) => {
//       const formData = new FormData();
//       formData.append("content", content);
//       formData.append("conversationId", conversationId!);
//       files.forEach((file) => {
//         formData.append("files", file);
//       });
      
//       const response = await fetch("/api/messages", {
//         method: "POST",
//         body: formData,
//       });
//       if (!response.ok) throw new Error("Failed to send message");
//       return response.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["/api/conversations", conversationId, "messages"] });
      
//       setAutoScroll(true);
//     },
//     onError: () => {
//       toast({
//         title: "Ошибка",
//         description: "Не удалось отправить сообщение",
//         variant: "destructive",
//       });
//     },
//   });

//   useEffect(() => {
//     if (autoScroll && scrollAreaRef.current) {
//       const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
//       if (scrollContainer) {
//         scrollContainer.scrollTop = scrollContainer.scrollHeight;
//       }
//     }
//   }, [messages, autoScroll]);

//   const handleSendMessage = (content: string, files: File[]) => {
//     if (!conversationId) {
//       toast({
//         title: "Выберите чат",
//         description: "Создайте новый чат в сайдбаре, чтобы начать общение",
//         variant: "destructive",
//       });
//       return;
//     }
//     if (!content.trim() && files.length === 0) return;
//     sendMessageMutation.mutate({ content, files });
//   };

//   const handlePromptClick = (prompt: string) => {
//     handleSendMessage(prompt, []);
//   };

//   const showEmptyState = !conversationId || messages.length === 0;

//   return (
//     <div className="flex-1 flex flex-col h-full">
//         {/* Заголовок чата с моделью */}
//       {conversationId && (
//         <div className="border-b p-2 bg-muted/50">
//           <div className="flex items-center justify-between">
//             <span className="text-sm font-medium">
//               Модель: {getModelDisplayName(currentModel)}
//               {/* Модель: {currentModel} */}
//               </span>
//             {/* Можно добавить кнопку смены модели */}
//           </div>
//         </div>
//       )}

//       <ScrollArea className="flex-1" ref={scrollAreaRef}>
//         {isLoading ? (
//           <div className="space-y-4 p-4">
//             {[1, 2, 3].map((i) => (
//               <div key={i} className="flex gap-3">
//                 <Skeleton className="w-8 h-8 rounded-full" />
//                 <div className="space-y-2 flex-1">
//                   <Skeleton className="h-4 w-3/4" />
//                   <Skeleton className="h-4 w-1/2" />
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : showEmptyState ? (
//           <div className="h-full flex items-center justify-center">
//             <EmptyState onPromptClick={handlePromptClick} />
//           </div>
//         ) : (
//           <div className="py-4" data-testid="messages-container">
//             {messages.map((message) => (
//               <ChatMessage key={message.id} message={message} />
//             ))}
//           </div>
//         )}
//       </ScrollArea>

//       {/* Поле ввода ВСЕГДА отображается и ВСЕГДА активно */}
//       <MessageInput
//         onSendMessage={handleSendMessage}
//         disabled={sendMessageMutation.isPending}
//         isLoading={sendMessageMutation.isPending}
//       />
//     </div>
//   );
// }
