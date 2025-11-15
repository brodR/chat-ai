import { ModelOption } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentModel: string;
  onModelChange: (modelId: string) => void;
}

const availableModels: ModelOption[] = [
  {
    id: "gpt-5",
    name: "GPT-5",
    provider: "openai",
    description: "Самая новая модель OpenAI с улучшенными возможностями",
    available: true,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    description: "Мультимодальная модель с поддержкой изображений",
    available: true,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    description: "Быстрая и экономичная версия GPT-4o",
    available: true,
  },
  {
    id: "local",
    name: "Локальная модель",
    provider: "local",
    description: "Локальная модель (требует настройки)",
    available: false,
  },
];

export function SettingsDialog({
  open,
  onOpenChange,
  currentModel,
  onModelChange,
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-settings">
        <DialogHeader>
          <DialogTitle>Настройки</DialogTitle>
          <DialogDescription>
            Выберите модель ИИ для общения
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label className="text-base font-medium">Облачные модели</Label>
            <RadioGroup value={currentModel} onValueChange={onModelChange}>
              {availableModels
                .filter((model) => model.provider === "openai")
                .map((model) => (
                  <div
                    key={model.id}
                    className="flex items-start space-x-3 rounded-lg border p-4 hover-elevate"
                  >
                    <RadioGroupItem
                      value={model.id}
                      id={model.id}
                      disabled={!model.available}
                      data-testid={`radio-model-${model.id}`}
                    />
                    <div className="flex-1 space-y-1">
                      <Label
                        htmlFor={model.id}
                        className="font-medium cursor-pointer flex items-center gap-2"
                      >
                        {model.name}
                        {model.id === "gpt-5" && (
                          <Badge variant="default" className="text-xs">
                            Рекомендуем
                          </Badge>
                        )}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {model.description}
                      </p>
                    </div>
                  </div>
                ))}
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">Локальные модели</Label>
            <RadioGroup value={currentModel} onValueChange={onModelChange}>
              {availableModels
                .filter((model) => model.provider === "local")
                .map((model) => (
                  <div
                    key={model.id}
                    className="flex items-start space-x-3 rounded-lg border p-4 opacity-50"
                  >
                    <RadioGroupItem
                      value={model.id}
                      id={model.id}
                      disabled={!model.available}
                      data-testid={`radio-model-${model.id}`}
                    />
                    <div className="flex-1 space-y-1">
                      <Label
                        htmlFor={model.id}
                        className="font-medium flex items-center gap-2"
                      >
                        {model.name}
                        <Badge variant="secondary" className="text-xs">
                          Скоро
                        </Badge>
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {model.description}
                      </p>
                    </div>
                  </div>
                ))}
            </RadioGroup>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
