// src/App.tsx
import React, { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./components/theme-provider";
import { AuthForm } from "./components/auth-form";
import "./index.css";
// import { AccountPage } from "./pages/account-page";

// Lazy-load основного контента, чтобы избежать циклических зависимостей
const AppContent = React.lazy(() => import("./AppContent"));

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Проверка сессии при запуске
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          // data.user теперь содержит tokensUsed и tokensLimit вместо tokens
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout failed", error);
      setIsAuthenticated(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-foreground">Загрузка...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <AuthForm onSuccess={handleAuthSuccess} />
      </div>
    );
  }


  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Загрузка приложения...</div>}>
            <AppContent onLogout={handleLogout} />
          </React.Suspense>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
