"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

declare global {
  interface Window {
    onTelegramAuth?: (user: unknown) => void;
    Telegram?: {
      WebApp?: {
        initData?: string;
        ready?: () => void;
      };
    };
  }
}

export function LoginClient() {
  const router = useRouter();
  const widgetRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  const completeLogin = useCallback(async (endpoint: string, body?: unknown) => {
    setError(null);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.message || "Login amalga oshmadi");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }, [router]);

  useEffect(() => {
    window.onTelegramAuth = (user) => completeLogin("/api/auth/telegram/login-widget", user);

    if (!botUsername || !widgetRef.current) return;
    widgetRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-userpic", "false");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    widgetRef.current.appendChild(script);
  }, [botUsername, completeLogin]);

  async function loginWithMiniApp() {
    const initData = window.Telegram?.WebApp?.initData;
    if (!initData) {
      setError("Telegram Mini App initData topilmadi. Sahifani Telegram ichida oching.");
      return;
    }
    window.Telegram?.WebApp?.ready?.();
    await completeLogin("/api/auth/telegram/mini-app", { initData });
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Telegram orqali kirish</CardTitle>
        <CardDescription>Dashboard va taklifnoma yaratish uchun Telegram profilingiz bilan tasdiqlaning.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex min-h-12 items-center justify-center rounded-md border bg-muted/40 p-3" ref={widgetRef}>
          {botUsername ? <span className="text-sm text-muted-foreground">Telegram widget yuklanmoqda...</span> : null}
          {!botUsername ? <span className="text-sm text-muted-foreground">Bot username .env.local’da berilmagan.</span> : null}
        </div>

        <Button type="button" variant="outline" className="w-full" onClick={loginWithMiniApp}>
          <Bot className="h-4 w-4" />
          Telegram Mini App orqali kirish
        </Button>

        {process.env.NODE_ENV !== "production" ? (
          <Button type="button" variant="secondary" className="w-full" onClick={() => completeLogin("/api/auth/dev")}>
            <Code2 className="h-4 w-4" />
            Dev login
          </Button>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
