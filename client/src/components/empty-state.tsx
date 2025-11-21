import React from "react";
import { Sparkles, Image, FileText, Music } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

interface EmptyStateProps {
  onPromptClick: (prompt: string) => void;
}

const suggestedPrompts = [
  "Помоги мне написать код на JavaScript",
  "Расскажи интересный факт о космосе",
  "Объясни квантовую физику простыми словами",
  "Создай план тренировок на неделю",
];

export function EmptyState({ onPromptClick }: EmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Добро пожаловать в Чат Окно</h2>
          <p className="text-muted-foreground">
            Начните беседу с ИИ. Вы можете отправлять текст, изображения, видео, аудио и документы.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestedPrompts.map((prompt, index) => (
            <Card
              key={index}
              className="p-4 cursor-pointer hover-elevate active-elevate-2 transition-all"
              onClick={() => onPromptClick(prompt)}
              data-testid={`prompt-${index}`}
            >
              <p className="text-sm text-left">{prompt}</p>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            <span>Изображения</span>
          </div>
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            <span>Аудио</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Документы</span>
          </div>
        </div>
      </div>
    </div>
  );
}
