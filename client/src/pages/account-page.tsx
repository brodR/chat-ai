import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "../lib/queryClient";

interface UserProfile {
  id: string;
  username: string;
  plan: 'free' | 'premium';
  tokensUsed: number;
  tokensLimit: number;
}

export function AccountPage() {
  const { toast } = useToast();
  
  const { data: profile, isLoading, error } = useQuery<UserProfile>({
    queryKey: ["/api/user/profile"],
  });

  const upgradeMutation = useMutation({
    mutationFn: () => fetch("/api/user/upgrade", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({ title: "Успех", description: "Вы перешли на премиум!" });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось обновить подписку", variant: "destructive" });
    }
  });

  if (isLoading) return <div className="p-6">Загрузка профиля...</div>;
  
  if (error) return <div className="p-6 text-destructive">Ошибка загрузки профиля</div>;
  
  if (!profile) return <div className="p-6">Профиль не найден</div>;

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Личный кабинет</h1>

      {/* Добавь карточку с информацией о пользователе */}
      <Card>
        <CardHeader>
          <CardTitle>Профиль пользователя</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Имя пользователя:</span> {profile.username}
            </p>
            <p className="text-sm">
              <span className="font-medium">ID:</span> {profile.id}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Подписка</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant={profile.plan === 'premium' ? 'default' : 'secondary'}>
            {profile.plan === 'premium' ? 'Премиум' : 'Бесплатный'}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Токены</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={profile.tokensUsed} max={profile.tokensLimit} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            {profile.tokensUsed} / {profile.tokensLimit} использовано
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Осталось: {profile.tokensLimit - profile.tokensUsed} токенов
          </p>
        </CardContent>
      </Card>

      {profile.plan === 'free' && (
        <Button 
          onClick={() => upgradeMutation.mutate()}
          disabled={upgradeMutation.isPending}
          className="w-full"
        >
          {upgradeMutation.isPending ? "Обработка..." : "Купить премиум (100 ₽)"}
        </Button>
      )}
    </div>
  );
}














// // src/pages/account-page.tsx
// import React from 'react';
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { Button } from "@/components/ui/button";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import { useToast } from "@/hooks/use-toast";
// import { queryClient } from "../lib/queryClient";

// export function AccountPage() {
//   const { toast } = useToast();
  
//   const { profile } = useQuery({
//     queryKey: ["/api/user/profile"],
//   });

//   const upgradeMutation = useMutation({
//     mutationFn: () => fetch("/api/user/upgrade", { method: "POST" }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
//       toast({ title: "Успех", description: "Вы перешли на премиум!" });
//     },
//     onError: () => {
//       toast({ title: "Ошибка", description: "Не удалось обновить подписку", variant: "destructive" });
//     }
//   });

//   if (!profile) return <div className="p-6">Загрузка...</div>;

//   return (
//     <div className="p-6 space-y-6 max-w-2xl mx-auto">
//       <h1 className="text-2xl font-bold">Личный кабинет</h1>

//       <Card>
//         <CardHeader>
//           <CardTitle>Подписка</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Badge variant={profile.plan === 'premium' ? 'default' : 'secondary'}>
//             {profile.plan === 'premium' ? 'Премиум' : 'Бесплатный'}
//           </Badge>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Токены</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Progress value={profile.tokensUsed} max={profile.tokensLimit} className="mb-2" />
//           <p className="text-sm text-muted-foreground">
//             {profile.tokensUsed} / {profile.tokensLimit} использовано
//           </p>
//         </CardContent>
//       </Card>

//       {profile.plan === 'free' && (
//         <Button 
//           onClick={() => upgradeMutation.mutate()}
//           disabled={upgradeMutation.isPending}
//         >
//           {upgradeMutation.isPending ? "Обработка..." : "Купить премиум (100 ₽)"}
//         </Button>
//       )}
//     </div>
//   );
// }