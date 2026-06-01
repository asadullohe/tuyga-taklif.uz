"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Bot, CheckCircle2, Code2, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

type WidgetStatus = "idle" | "loading" | "ready" | "error" | "missing_bot";

export function LoginClient({
  appUrl,
  botUsername,
  initialError
}: {
  appUrl?: string;
  botUsername?: string;
  initialError?: string;
}) {
  const router = useRouter();
  const widgetRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [widgetStatus, setWidgetStatus] = useState<WidgetStatus>("idle");
  const [origin, setOrigin] = useState("");
  const [authOrigin, setAuthOrigin] = useState("");
  const [hasMiniAppInitData, setHasMiniAppInitData] = useState(false);
  const [redirectingToPrimaryDomain, setRedirectingToPrimaryDomain] = useState(false);

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
    const currentOrigin = window.location.origin;
    const primaryOrigin = getOrigin(appUrl) || currentOrigin;

    setOrigin(currentOrigin);
    setAuthOrigin(primaryOrigin);

    if (shouldUsePrimaryDomain(currentOrigin, primaryOrigin)) {
      setRedirectingToPrimaryDomain(true);
      window.location.replace(`${primaryOrigin}/login`);
      return;
    }

    window.onTelegramAuth = (user) => completeLogin("/api/auth/telegram/login-widget", user);

    return () => {
      delete window.onTelegramAuth;
    };
  }, [appUrl, completeLogin]);

  useEffect(() => {
    const initData = window.Telegram?.WebApp?.initData;
    setHasMiniAppInitData(Boolean(initData));

    if (initData) {
      window.Telegram?.WebApp?.ready?.();
      void completeLogin("/api/auth/telegram/mini-app", { initData });
    }
  }, [completeLogin]);

  useEffect(() => {
    if (!botUsername) {
      setWidgetStatus("missing_bot");
      return;
    }
    if (!widgetRef.current || !origin || !authOrigin || redirectingToPrimaryDomain) return;

    setWidgetStatus("loading");
    widgetRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-userpic", "false");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-auth-url", `${authOrigin}/api/auth/telegram/login-widget`);
    script.onload = () => setWidgetStatus("ready");
    script.onerror = () => {
      setWidgetStatus("error");
      setError("Telegram widget yuklanmadi. Internet yoki domen sozlamasini tekshiring.");
    };
    widgetRef.current.appendChild(script);

    const timeout = window.setTimeout(() => {
      if (!widgetRef.current?.querySelector("iframe")) {
        setWidgetStatus("error");
        setError("Telegram widget chiqmasa, BotFather Web Login uchun shu domenni ruxsat qiling.");
      }
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [authOrigin, botUsername, origin, redirectingToPrimaryDomain]);

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
    <Card className="w-full border-white/70 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-lg shadow-emerald-900/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <Badge className="bg-emerald-50 text-emerald-700">Secure session</Badge>
        </div>
        <div>
          <CardTitle className="text-2xl">Telegram orqali kirish</CardTitle>
          <CardDescription className="mt-2 leading-6">
            Bot bilan tasdiqlang. Sessiya server cookie orqali saqlanadi.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-white p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Web Login Widget</p>
              <p className="mt-1 text-xs text-muted-foreground">{authOrigin || origin || "Origin aniqlanmoqda..."}</p>
            </div>
            <StatusBadge status={widgetStatus} />
          </div>
          <div
            className="flex min-h-14 items-center justify-center rounded-md border border-dashed bg-muted/30 p-3"
            ref={widgetRef}
          >
            {widgetStatus === "loading" ? (
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Telegram widget yuklanmoqda...
              </span>
            ) : null}
            {widgetStatus === "missing_bot" ? (
              <span className="text-sm text-muted-foreground">Bot username .env.local’da berilmagan.</span>
            ) : null}
            {redirectingToPrimaryDomain ? (
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Asosiy domenga o‘tilmoqda...
              </span>
            ) : null}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full justify-between"
          onClick={loginWithMiniApp}
          disabled={!hasMiniAppInitData}
        >
          <span className="inline-flex items-center gap-2">
            <Bot className="h-4 w-4" />
            {hasMiniAppInitData ? "Telegram Mini App orqali kirish" : "Mini App faqat Telegram ichida"}
          </span>
          <ExternalLink className="h-4 w-4" />
        </Button>

        <div className="rounded-md border bg-amber-50/70 p-3 text-sm leading-6 text-amber-900">
          <Bot className="h-4 w-4" />
          <p className="mt-2">
            Agar web widget chiqmasa, BotFather’da <span className="font-semibold">Web Login / Allowed URLs</span> ga{" "}
            <span className="font-semibold">{authOrigin || origin || "shu domen"}</span> qo‘shing. Netlify branch
            domainlari Telegram’da alohida domen hisoblanadi.
          </p>
        </div>

        {process.env.NODE_ENV !== "production" ? (
          <Button type="button" variant="secondary" className="w-full" onClick={() => completeLogin("/api/auth/dev")}>
            <Code2 className="h-4 w-4" />
            Dev login
          </Button>
        ) : null}

        {error ? (
          <div className="flex gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function getOrigin(value?: string) {
  if (!value) return "";

  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
}

function shouldUsePrimaryDomain(currentOrigin: string, primaryOrigin: string) {
  if (!primaryOrigin || currentOrigin === primaryOrigin) return false;

  const hostname = new URL(currentOrigin).hostname;
  return !["localhost", "127.0.0.1", "::1"].includes(hostname);
}

function StatusBadge({ status }: { status: WidgetStatus }) {
  if (status === "missing_bot") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
        <AlertCircle className="h-3.5 w-3.5" />
        Setup
      </span>
    );
  }

  if (status === "ready") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Ready
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
        <AlertCircle className="h-3.5 w-3.5" />
        Error
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      Loading
    </span>
  );
}
