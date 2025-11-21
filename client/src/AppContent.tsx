import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Conversation } from "@shared/schema";
import { apiRequest } from "./lib/queryClient";
import { useToast } from "./hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { ChatPage } from "./pages/chat-page";
import { SettingsDialog } from "./components/settings-dialog";
import { AccountPage } from "./pages/account-page"; // ← Импортируем личный кабинет
import { Sparkles, User, Settings } from "lucide-react"; // ← Добавляем иконки
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Dialog, DialogContent } from "./components/ui/dialog"; // ← Импортируем Dialog
import { queryClient } from "./lib/queryClient";

interface AppContentProps {
  onLogout: () => void;
}

interface UserProfile {
  id: string;
  username: string;
  plan: 'free' | 'premium';
  tokensUsed: number;
  tokensLimit: number;
}

export default function AppContent({ onLogout }: AppContentProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false); // ← Состояние для личного кабинета
  const [currentModel, setCurrentModel] = useState("tngtech/deepseek-r1t2-chimera:free");
  const { toast } = useToast();

  // // Функция для красивого отображения названий моделей
  // function getModelDisplayName(modelId: string): string {
  //   const modelNames: { [key: string]: string } = {
  //     "meta-llama/llama-3.3-70b-instruct:free": "Ллама 3.3 70B",
  //     "deepseek/deepseek-chat-v3.1:free": "DeepSeek V3.1",
  //     "google/gemini-flash-1.5:free": "Gemini Flash 1.5",
  //     "llama3.1:8b": "Ллама 3.1 8B",
  //     "llama3.1:70b": "Ллама 3.1 70B",
  //     "mistral-nemo": "Mistral Nemo",
  //     "anthropic/claude-3.5-sonnet": "Claude 3.5",
  //     "google/gemini-flash-1.5": "Gemini Flash 1.5",
  //     "gpt-4": "GPT-4",
  //     "gpt-3.5-turbo": "GPT-3.5 Turbo"
  //   };
    
  //   return modelNames[modelId] || modelId;
  // }

  // Загрузка userId
  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => {
        if (res.ok) {
          return res.json().then(data => setUserId(data.user.id));
        } else {
          setUserId(null);
        }
      })
      .catch(() => setUserId(null));
  }, []);

  // Загрузка профиля
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/user/profile"],
    enabled: !!userId,
  });

  // Загрузка диалогов
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  // И добавь функцию для автоматического переключения модели при выборе диалога
  // const handleSelectConversation = (id: string) => {
  //   setActiveConversationId(id);
    
  //   // Находим выбранный диалог и устанавливаем его модель
  //   const selectedConversation = conversations.find(conv => conv.id === id);
  //   if (selectedConversation && selectedConversation.model) {
  //     setCurrentModel(selectedConversation.model);
  //   }
  // };

  const createConversationMutation = useMutation({
    mutationFn: async (): Promise<Conversation> => {
      const payload: any = {
        title: "Новый диалог",
        model: currentModel,
      };
      if (userId) payload.userId = userId;
      
      const response = await apiRequest("POST", "/api/conversations", payload);
      return await response.json();
    },
    onSuccess: (newConversation: Conversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setActiveConversationId(newConversation.id);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать новый диалог",
        variant: "destructive",
      });
    },
  });

  const handleNewChat = () => {
    // Раскомментируй проверку лимитов когда настроишь логику
    // if (profile && profile.plan === 'free' && profile.tokensUsed >= profile.tokensLimit) {
    //   toast({
    //     title: "Лимит токенов исчерпан",
    //     description: "Купите премиум для продолжения.",
    //     variant: "destructive",
    //   });
    //   return;
    // }
    createConversationMutation.mutate();
  };

  const deleteConversationMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/conversations/${id}`);
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      if (activeConversationId === deletedId) {
        setActiveConversationId(null);
      }
      toast({
        title: "Диалог удален",
        description: "Диалог был успешно удален",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить диалог",
        variant: "destructive",
      });
    },
  });

  // И добавь функцию для автоматического переключения модели при выборе диалога
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    
    // Находим выбранный диалог и устанавливаем его модель
    const selectedConversation = conversations.find(conv => conv.id === id);
    if (selectedConversation && selectedConversation.model) {
      setCurrentModel(selectedConversation.model);
    }
  };

  // const handleSelectConversation = (id: string) => {
  //   setActiveConversationId(id);
  // };

  // Добавь эту функцию в AppContent.tsx
  const handleModelChange = async (newModel: string) => {
    setCurrentModel(newModel);
    
    // Если есть активный диалог - обновляем его модель в базе
    if (activeConversationId) {
      try {
        await apiRequest("PATCH", `/api/conversations/${activeConversationId}`, {
          model: newModel
        });
        queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      } catch (error) {
        console.error("Failed to update conversation model:", error);
      }
    }
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversationMutation.mutate(id);
  };

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onOpenSettings={() => setSettingsOpen(true)}
          currentModel={currentModel} // ← передаём модель
        />

        <div className="flex flex-col flex-1">
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-semibold">Чат Окно</h1>
            </div>
          </div>
            <div className="flex items-center gap-4">
              {profile && (
                <div className="flex items-center gap-3">
                  {/* Кнопка личного кабинета */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setAccountOpen(true)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Личный кабинет
                  </Button>

                  <span className="text-sm text-muted-foreground">
                    {profile.username}
                  </span>
                  <Badge variant={profile.plan === 'premium' ? 'default' : 'secondary'}>
                    {profile.plan === 'premium' ? 'Премиум' : 'Бесплатный'}
                  </Badge>
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Настройки
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-hidden">
            <ChatPage
              conversationId={activeConversationId}
              currentModel={currentModel} // ← передаём модель
            />
          </main>
        </div>
      </div>

      {/* Диалог настроек */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        currentModel={currentModel}
        // onModelChange={setCurrentModel}
        onModelChange={handleModelChange} // ← используем новую функцию
      />

      {/* Диалог личного кабинета */}
      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <AccountPage />
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}











// // src/AppContent.tsx
// import React, { useState, useEffect } from "react";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import { Conversation } from "@shared/schema";
// import { apiRequest } from "./lib/queryClient";
// import { useToast } from "./hooks/use-toast";
// import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
// import { AppSidebar } from "./components/app-sidebar";
// import { ChatPage } from "./pages/chat-page";
// import { SettingsDialog } from "./components/settings-dialog";
// import { Sparkles } from "lucide-react";
// import { queryClient } from "./lib/queryClient";

// interface AppContentProps {
//   onLogout: () => void;
// }

// interface UserProfile {
//   id: string;
//   username: string;
//   plan: 'free' | 'premium';
//   tokensUsed: number;
//   tokensLimit: number;
// }

// export default function AppContent({ onLogout }: AppContentProps) {
//   const [userId, setUserId] = useState<string | null>(null);
//   const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
//   const [settingsOpen, setSettingsOpen] = useState(false);
//   const [currentModel, setCurrentModel] = useState("meta-llama/llama-3.3-70b-instruct:free");
//   const { toast } = useToast();

//   // Загрузка userId
//   useEffect(() => {
//     fetch("/api/auth/me")
//       .then(res => {
//         if (res.ok) {
//           res.json().then(data => setUserId(data.user.id));
//         } else {
//           setUserId(null);
//         }
//       })
//       .catch(() => setUserId(null));
//   }, []);

//   // Загрузка профиля (токены, план)
//   const { data: profile } = useQuery<UserProfile>({
//     queryKey: ["/api/user/profile"],
//     enabled: !!userId,
//   });

//   const { data: conversations = [] } = useQuery<Conversation[]>({
//     queryKey: ["/api/conversations"],
//   });

//   const createConversationMutation = useMutation({
//     mutationFn: async (): Promise<Conversation> => {
//       const payload: any = {
//         title: "Новый диалог",
//         model: currentModel,
//       };
//       if (userId) payload.userId = userId;
//       const response = await apiRequest("POST", "/api/conversations", payload);
//       return await response.json();
//     },
//     onSuccess: (newConversation: Conversation) => {
//       queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
//       setActiveConversationId(newConversation.id);
//     },
//     onError: () => {
//       toast({
//         title: "Ошибка",
//         description: "Не удалось создать новый диалог",
//         variant: "destructive",
//       });
//     },
//   });

//   const handleNewChat = () => {
//     // Проверка лимита перед созданием чата
//     // if (profile && profile.tokensUsed >= profile.tokensLimit) {
//     //   toast({
//     //     // title: "Лимит токенов исчерпан",
//     //     // description: "Купите премиум для продолжения.",
//     //     // variant: "destructive",
//     //   });
//     //   return;
//     // }
//     createConversationMutation.mutate();
//   };

//   const deleteConversationMutation = useMutation({
//     mutationFn: async (id: string) => {
//       return await apiRequest("DELETE", `/api/conversations/${id}`, undefined);
//     },
//     onSuccess: (_, deletedId) => {
//       queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
//       if (activeConversationId === deletedId) {
//         setActiveConversationId(null);
//       }
//       toast({
//         title: "Диалог удален",
//         description: "Диалог был успешно удален",
//       });
//     },
//     onError: () => {
//       toast({
//         title: "Ошибка",
//         description: "Не удалось удалить диалог",
//         variant: "destructive",
//       });
//     },
//   });

//   const handleSelectConversation = (id: string) => {
//     setActiveConversationId(id);
//   };

//   const handleDeleteConversation = (id: string) => {
//     deleteConversationMutation.mutate(id);
//   };

//   const style = {
//     "--sidebar-width": "20rem",
//     "--sidebar-width-icon": "4rem",
//   };

//   return (
//     <SidebarProvider style={style as React.CSSProperties}>
//       <div className="flex h-screen w-full">
//         <AppSidebar
//           conversations={conversations}
//           activeConversationId={activeConversationId}
//           onNewChat={handleNewChat}
//           onSelectConversation={handleSelectConversation}
//           onDeleteConversation={handleDeleteConversation}
//           onOpenSettings={() => setSettingsOpen(true)}
//         />

//         <div className="flex flex-col flex-1">
//           <header className="flex items-center justify-between p-4 border-b">
//             <div className="flex items-center gap-3">
//               <SidebarTrigger data-testid="button-sidebar-toggle" />
//               <div className="flex items-center gap-2">
//                 <Sparkles className="w-5 h-5 text-primary" />
//                 <h1 className="text-lg font-semibold">Чат Окно</h1>
//               </div>
//             </div>
//           </header>

//           <main className="flex-1 overflow-hidden">
//             <ChatPage conversationId={activeConversationId} />
//           </main>
//         </div>
//       </div>

//       <SettingsDialog
//         open={settingsOpen}
//         onOpenChange={setSettingsOpen}
//         currentModel={currentModel}
//         onModelChange={setCurrentModel}
//       />
//     </SidebarProvider>
//   );
// }












// import React, { useState, useEffect } from "react";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import { Conversation } from "@shared/schema";
// import { apiRequest } from "./lib/queryClient";
// import { useToast } from "./hooks/use-toast";
// import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
// import { AppSidebar } from "./components/app-sidebar";
// import { ChatPage } from "./pages/chat-page";
// import { SettingsDialog } from "./components/settings-dialog";
// import { Sparkles } from "lucide-react";
// import { queryClient } from "./lib/queryClient";

// interface AppContentProps {
//   onLogout: () => void;
// }

// export default function AppContent({ onLogout }: AppContentProps) {

//   // Добавляем состояние userId
//   const [userId, setUserId] = useState<string | null>(null);

//   const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
//   const [settingsOpen, setSettingsOpen] = useState(false);
//   const [currentModel, setCurrentModel] = useState("meta-llama/llama-3.3-70b-instruct:free");
//   const { toast } = useToast();

//     // Загружаем userId при старте
//     useEffect(() => {
//         fetch("/api/auth/me")
//         .then(res => {
//             if (res.ok) {
//             res.json().then(data => {
//                 setUserId(data.user.id);
//             });
//             } else {
//             setUserId(null); // анонимус
//             }
//         })
//         .catch(() => setUserId(null));
//     }, []);

//     const {  data: conversations = [], isLoading, error } = useQuery<Conversation[]>({
//     queryKey: ["/api/conversations"],
//     });

//   const createConversationMutation = useMutation({
//     mutationFn: async (): Promise<Conversation> => {
//     //   const model = currentModel || "meta-llama/llama-3.3-70b-instruct:free";
//       const response = await apiRequest("POST", "/api/conversations", {
//         title: "Новый диалог",
//         model: currentModel,
//         ...(userId && { userId }), // ← отправляем только если есть
//       });
//       return await response.json();
//     },
//     onSuccess: (data: Conversation) => {
//       queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
//       setActiveConversationId(data.id);
//     },
//     onError: () => {
//       toast({
//         title: "Ошибка",
//         description: "Не удалось создать новый диалог",
//         variant: "destructive",
//       });
//     },
//   });

//   const deleteConversationMutation = useMutation({
//     mutationFn: async (id: string) => {
//       return await apiRequest("DELETE", `/api/conversations/${id}`, undefined);
//     },
//     onSuccess: (_, deletedId) => {
//       queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
//       if (activeConversationId === deletedId) {
//         setActiveConversationId(null);
//       }
//       toast({
//         title: "Диалог удален",
//         description: "Диалог был успешно удален",
//       });
//     },
//     onError: () => {
//       toast({
//         title: "Ошибка",
//         description: "Не удалось удалить диалог",
//         variant: "destructive",
//       });
//     },
//   });

//   const handleNewChat = () => {
//     createConversationMutation.mutate();
//   };

//   const handleSelectConversation = (id: string) => {
//     setActiveConversationId(id);
//   };

//   const handleDeleteConversation = (id: string) => {
//     deleteConversationMutation.mutate(id);
//   };

//   const style = {
//     "--sidebar-width": "20rem",
//     "--sidebar-width-icon": "4rem",
//   };

//   return (
//     <SidebarProvider style={style as React.CSSProperties}>
//       <div className="flex h-screen w-full">
//         <AppSidebar
//           conversations={conversations}
//           activeConversationId={activeConversationId}
//           onNewChat={handleNewChat}
//           onSelectConversation={handleSelectConversation}
//           onDeleteConversation={handleDeleteConversation}
//           onOpenSettings={() => setSettingsOpen(true)}
//         />

//         <div className="flex flex-col flex-1">
//           <header className="flex items-center justify-between p-4 border-b">
//             <div className="flex items-center gap-3">
//               <SidebarTrigger data-testid="button-sidebar-toggle" />
//               <div className="flex items-center gap-2">
//                 <Sparkles className="w-5 h-5 text-primary" />
//                 <h1 className="text-lg font-semibold">Чат Окно</h1>
//               </div>
//             </div>
//           </header>

//           <main className="flex-1 overflow-hidden">
//             <ChatPage conversationId={activeConversationId} />
//           </main>
//         </div>
//       </div>

//       <SettingsDialog
//         open={settingsOpen}
//         onOpenChange={setSettingsOpen}
//         currentModel={currentModel}
//         onModelChange={setCurrentModel}
//       />
//     </SidebarProvider>
//   );
// }