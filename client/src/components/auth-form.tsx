// components/auth-form.tsx
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "../hooks/use-toast";

interface AuthFormProps {
  onSuccess: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const validate = () => {
    if (username.length < 3) {
      toast({
        title: "Недопустимое имя",
        description: "Имя пользователя должно быть не короче 3 символов",
        variant: "destructive",
      });
      return false;
    }
    if (password.length < 6) {
      toast({
        title: "Слабый пароль",
        description: "Пароль должен содержать минимум 6 символов",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/${isLogin ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: isLogin ? "Вход выполнен" : "Регистрация успешна",
          description: isLogin ? "Добро пожаловать!" : "Вы можете войти в свой аккаунт",
        });
        onSuccess();
      } else {
        toast({
          title: "Ошибка",
          description: result.message || "Неизвестная ошибка",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Сетевая ошибка",
        description: "Проверьте подключение к серверу",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">
          {isLogin ? "Вход в аккаунт" : "Регистрация"}
        </CardTitle>
        <CardDescription>
          {isLogin ? "Войдите, чтобы продолжить работу" : "Создайте аккаунт за 30 секунд"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value.trim())}
            minLength={3}
            required
          />
          <Input
            type="password"
            placeholder="Пароль (минимум 6 символов)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Загрузка..." : isLogin ? "Войти" : "Зарегистрироваться"}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm"
          >
            {isLogin ? "Нет аккаунта? Зарегистрируйтесь" : "Уже есть аккаунт? Войдите"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
