import React from "react";
import { availableModels, type ModelOption } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
// import { Label } from "../components/ui/label";
// import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
// import { Badge } from "../components/ui/badge";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentModel: string;
  onModelChange: (modelId: string) => void;
}

function getProviderSetupHint(provider: string): string {
  switch (provider) {
    case "openai":
      return "Требуется OPENAI_API_KEY в переменных окружения";
    case "ollama":
      return "Убедитесь, что Ollama запущен на localhost:11434";
    case "openrouter":
      return "Требуется OPENROUTER_API_KEY в переменных окружения";
    default:
      return "Требуется настройка провайдера";
  }
}

export function SettingsDialog({
  open,
  onOpenChange,
  currentModel,
  onModelChange,
}: SettingsDialogProps) {
  const groupedModels = availableModels.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, ModelOption[]>);

  const providerLabels = {
    openai: "OpenAI модели",
    openrouter: "OpenRouter модели",
    ollama: "Локальные модели (Ollama)",
    local: "Другие локальные модели"
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col" data-testid="dialog-settings">
        <DialogHeader>
          <DialogTitle>Настройки</DialogTitle>
          <DialogDescription>
            Выберите модель ИИ для общения.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-4 py-2">
            {availableModels
              .filter(model => model.available)
              .map((model) => (
                <div
                  key={model.id}
                  className={cn(
                    "flex flex-col p-3 border rounded-lg cursor-pointer transition-colors",
                    currentModel === model.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent"
                  )}
                  onClick={() => onModelChange(model.id)}
                >
                  <div className="font-medium">{model.name}</div>
                  <div className="text-sm text-muted-foreground">{model.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Провайдер: {model.provider}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

