import React from 'react';
import { Conversation } from "@shared/schema";
import { MessageSquare, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { useState } from "react";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export function ConversationItem({ 
  conversation, 
  isActive, 
  onClick,
  onDelete 
}: ConversationItemProps) {
  const [showDelete, setShowDelete] = useState(false);
  
  const formattedDate = new Date(conversation.updatedAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });

  return (
    <div
      className={cn(
        "group relative rounded-lg p-3 cursor-pointer hover-elevate transition-all",
        isActive && "bg-sidebar-accent"
      )}
      onClick={onClick}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      data-testid={`conversation-${conversation.id}`}
    >
      <div className="flex items-start gap-3">
        <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-medium truncate" data-testid={`text-title-${conversation.id}`}>
            {conversation.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {formattedDate}
          </p>
        </div>

        {showDelete && (
          <Button
            size="icon"
            variant="ghost"
            className="flex-shrink-0 w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            data-testid={`button-delete-${conversation.id}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
