import { Conversation } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";
import { ConversationItem } from "./conversation-item";
import { Plus, Settings, Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "./theme-provider"; // ← правильный импорт

// Функция для красивого отображения названий моделей
function getModelDisplayName(modelId: string): string {
  const modelNames: { [key: string]: string } = {
    "tngtech/deepseek-r1t2-chimera:free": "DeepSeek r1t2",
    "meta-llama/llama-3.3-70b-instruct:free": "Ллама 3.3 70B",
    "google/gemini-flash-1.5:free": "Gemini Flash 1.5",
    "llama3.1:8b": "Ллама 3.1 8B",
    "llama3.1:70b": "Ллама 3.1 70B",
    "mistral-nemo": "Mistral Nemo",
    "anthropic/claude-3.5-sonnet": "Claude 3.5",
    "google/gemini-flash-1.5": "Gemini Flash 1.5",
    "gpt-4": "GPT-4",
    "gpt-3.5-turbo": "GPT-3.5 Turbo"
  };
  
  return modelNames[modelId] || modelId;
}

interface AppSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onOpenSettings: () => void;
  currentModel: string;
}

export function AppSidebar({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onOpenSettings,
  currentModel
}: AppSidebarProps) {
  const { theme, toggleTheme } = useTheme();
  // const { theme, setTheme } = useTheme();

  // const toggleTheme = () => {
  //   setTheme(theme === "light" ? "dark" : "light");
  // };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="space-y-3">
          <Button 
            onClick={onNewChat} 
            className="w-full justify-start gap-2"
            data-testid="button-new-chat"
          >
            <Plus className="w-4 h-4" />
            Новый чат
          </Button>
          
          {/* Блок с текущей моделью */}
          {activeConversationId && (
            <div className="px-2 py-1 bg-muted/30 rounded-md">
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Модель:</span> {getModelDisplayName(currentModel)}
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Диалоги</SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-1 px-2">
                {conversations.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-3 text-center">
                    Пока нет диалогов
                  </p>
                ) : (
                  conversations.map((conversation) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      isActive={conversation.id === activeConversationId}
                      onClick={() => onSelectConversation(conversation.id)}
                      onDelete={() => onDeleteConversation(conversation.id)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={toggleTheme}
          data-testid="button-theme-toggle"
        >
          {theme === "light" ? (
            <>
              <Moon className="w-4 h-4" />
              Темная тема
            </>
          ) : (
            <>
              <Sun className="w-4 h-4" />
              Светлая тема
            </>
          )}
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={onOpenSettings}
          data-testid="button-settings"
        >
          <Settings className="w-4 h-4" />
          Настройки
        </Button>

        {/* Кнопка выхода */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={async () => {
            try {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.reload(); // Перезагружаем страницу для перехода на форму входа
            } catch (error) {
              console.error("Logout failed", error);
              window.location.reload();
            }
          }}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
          Выйти
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}













// import React from "react";
// import { Plus, Settings, Moon, Sun, LogOut } from "lucide-react";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
// } from "../components/ui/sidebar";
// import { Button } from "../components/ui/button";
// import { ScrollArea } from "../components/ui/scroll-area";
// import { useTheme } from "./theme-provider";
// import { Conversation } from "@shared/schema";
// import { ConversationItem } from "./conversation-item";

// // В начале файла добавь функцию
// function getModelDisplayName(modelId: string): string {
//   const modelNames: { [key: string]: string } = {
//     "meta-llama/llama-3.3-70b-instruct:free": "Ллама 3.3 70B",
//     "deepseek/deepseek-chat-v3.1:free": "DeepSeek V3.1", 
//     "google/gemini-flash-1.5:free": "Gemini Flash 1.5",
//     "llama3.1:8b": "Ллама 3.1 8B",
//     "llama3.1:70b": "Ллама 3.1 70B",
//     "mistral-nemo": "Mistral Nemo",
//     "anthropic/claude-3.5-sonnet": "Claude 3.5",
//     "google/gemini-flash-1.5": "Gemini Flash 1.5"
//   };
  
//   return modelNames[modelId] || modelId;
// }

// interface AppSidebarProps {
//   conversations: Conversation[];
//   activeConversationId: string | null;
//   onNewChat: () => void;
//   onSelectConversation: (id: string) => void;
//   onDeleteConversation: (id: string) => void;
//   onOpenSettings: () => void;
//   currentModel: string; // ← добавь этот пропс
// }

// export function AppSidebar({
//   conversations,
//   activeConversationId,
//   onNewChat,
//   onSelectConversation,
//   onDeleteConversation,
//   onOpenSettings,
//   currentModel // ← добавь сюда
// }: AppSidebarProps) {
//   const { theme, toggleTheme } = useTheme();

//   return (
//     <Sidebar>
//       <SidebarHeader className="p-4">
//         <Button 
//           onClick={onNewChat} 
//           className="w-full justify-start gap-2"
//           data-testid="button-new-chat"
//         >
//           <Plus className="w-4 h-4" />
//           Новый чат
//         </Button>
//       </SidebarHeader>

//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupLabel>Диалоги</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <ScrollArea className="h-[calc(100vh-280px)]">
//               <div className="space-y-1 px-2">
//                 {conversations.length === 0 ? (
//                   <p className="text-sm text-muted-foreground p-3 text-center">
//                     Пока нет диалогов
//                   </p>
//                 ) : (
//                   conversations.map((conversation) => (
//                     <ConversationItem
//                       key={conversation.id}
//                       conversation={conversation}
//                       isActive={conversation.id === activeConversationId}
//                       onClick={() => onSelectConversation(conversation.id)}
//                       onDelete={() => onDeleteConversation(conversation.id)}
//                     />
//                   ))
//                 )}
//               </div>
//             </ScrollArea>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>

//       <SidebarFooter className="p-4 space-y-2">
//         <Button
//           variant="ghost"
//           className="w-full justify-start gap-2"
//           onClick={toggleTheme}
//           data-testid="button-theme-toggle"
//         >
//           {theme === "light" ? (
//             <>
//               <Moon className="w-4 h-4" />
//               Темная тема
//             </>
//           ) : (
//             <>
//               <Sun className="w-4 h-4" />
//               Светлая тема
//             </>
//           )}
//         </Button>
        
//         <Button
//           variant="ghost"
//           className="w-full justify-start gap-2"
//           onClick={onOpenSettings}
//           data-testid="button-settings"
//         >
//           <Settings className="w-4 h-4" />
//           Настройки
//         </Button>

//         {/* Кнопка выхода */}
//         <Button
//           variant="ghost"
//           className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
//           onClick={async () => {
//             try {
//               await fetch("/api/auth/logout", { method: "POST" });
//               window.location.reload(); // Перезагружаем страницу для перехода на форму входа
//             } catch (error) {
//               console.error("Logout failed", error);
//               window.location.reload();
//             }
//           }}
//           data-testid="button-logout"
//         >
//           <LogOut className="w-4 h-4" />
//           Выйти
//         </Button>
//       </SidebarFooter>
//     </Sidebar>
//   );
// }
