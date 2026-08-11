import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router";

import { Button } from "@/components/ui/button";
import { authClient } from "@/features/auth/auth-client";
import { queryKeys } from "@/lib/query-keys";

export function meta() {
  return [{ title: "ログイン | nkmz 精算" }];
}

export default function Login() {
  const currentUserQuery = useQuery({
    queryKey: queryKeys.auth,
    queryFn: () => authClient.getCurrentUser(),
    retry: false,
  });

  if (currentUserQuery.isPending) {
    return (
      <main className="flex min-h-[calc(100svh-3rem)] items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">認証状態を確認しています。</p>
      </main>
    );
  }

  if (currentUserQuery.isError) {
    return (
      <main className="flex min-h-[calc(100svh-3rem)] items-center justify-center p-4">
        <p role="alert" className="text-sm text-destructive">
          認証状態の確認に失敗しました。
        </p>
      </main>
    );
  }

  if (currentUserQuery.data) {
    return <Navigate replace to="/groups" />;
  }

  function handleDiscordLogin() {
    authClient.startDiscordLogin(`${window.location.origin}/login`);
  }

  return (
    <main className="flex min-h-[calc(100svh-3rem)] items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">nkmz 精算</h1>
          <p className="text-sm text-muted-foreground">Discordアカウントでログインしてください。</p>
        </div>
        <Button className="w-full" onClick={handleDiscordLogin} size="lg" type="button">
          Discordでログイン
        </Button>
      </div>
    </main>
  );
}
