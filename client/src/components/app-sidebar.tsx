import { Plus, Settings, Moon, Sun } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "./theme-provider";
import { Conversation } from "@shared/schema";
import { ConversationItem } from "./conversation-item";

interface AppSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onOpenSettings: () => void;
}

export function AppSidebar({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onOpenSettings,
}: AppSidebarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Button 
          onClick={onNewChat} 
          className="w-full justify-start gap-2"
          data-testid="button-new-chat"
        >
          <Plus className="w-4 h-4" />
          Новый чат
        </Button>
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
      </SidebarFooter>
    </Sidebar>
  );
}
