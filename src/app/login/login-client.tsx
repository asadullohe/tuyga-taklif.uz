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
type AuthPendingSource = "widget" | "mini-app" | "dev";

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
  const pendingRef = useRef(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [widgetStatus, setWidgetStatus] = useState<WidgetStatus>("idle");
  const [authPending, setAuthPending] = useState<AuthPendingSource | null>(null);
  const [origin, setOrigin] = useState("");
  const [authOrigin, setAuthOrigin] = useState("");
  const [hasMiniAppInitData, setHasMiniAppInitData] = useState(false);
  const [redirectingToPrimaryDomain, setRedirectingToPrimaryDomain] = useState(false);

  const completeLogin = useCallback(async (endpoint: string, body: unknown, source: AuthPendingSource) => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setAuthPending(source);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.message || "Login amalga oshmadi");
        pendingRef.current = false;
        setAuthPending(null);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Login so'rovi yuborilmadi. Internet aloqasini tekshiring.");
      pendingRef.current = false;
      setAuthPending(null);
    }
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

    window.onTelegramAuth = (user) => completeLogin("/api/auth/telegram/login-widget", user, "widget");

    return () => {
      delete window.onTelegramAuth;
    };
  }, [appUrl, completeLogin]);

  useEffect(() => {
    const initData = window.Telegram?.WebApp?.initData;
    setHasMiniAppInitData(Boolean(initData));

    if (initData) {
      window.Telegram?.WebApp?.ready?.();
      void completeLogin("/api/auth/telegram/mini-app", { initData }, "mini-app");
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
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.onload = () => setWidgetStatus("ready");
    script.onerror = () => {
      setWidgetStatus("error");
      setError("Telegram widget yuklanmadi. Internet yoki domen sozlamasini tekshiring.");
    };
    widgetRef.current.appendChild(script);

    const timeout = window.setTimeout(() => {
      if (!widgetRef.current?.querySelector("iframe")) {
        setWidgetStatus("error");
        setError("Telegram widget yuklanmadi.");
      }
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [authOrigin, botUsername, origin, redirectingToPrimaryDomain]);

  async function loginWithMiniApp() {
    const initData = window.Telegram?.WebApp?.initData;
    if (!initData) return;
    window.Telegram?.WebApp?.ready?.();
    await completeLogin("/api/auth/telegram/mini-app", { initData }, "mini-app");
  }

  const pendingLabel = authPending ? getPendingLabel(authPending) : null;

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
        {pendingLabel ? (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800" role="status" aria-live="polite">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            <span>{pendingLabel}</span>
          </div>
        ) : null}

        <div className="rounded-lg border bg-white p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Web Login Widget</p>
              <p className="mt-1 text-xs text-muted-foreground">{authOrigin || origin || "Origin aniqlanmoqda..."}</p>
            </div>
            <StatusBadge status={widgetStatus} />
          </div>
          <div
            className="relative flex min-h-14 items-center justify-center rounded-md border border-dashed bg-muted/30 p-3"
            ref={widgetRef}
          >
            {authPending === "widget" ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/85 text-sm font-medium text-slate-700 backdrop-blur-sm">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Telegram login tekshirilmoqda...
              </div>
            ) : null}
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

        {hasMiniAppInitData ? (
          <Button type="button" variant="outline" className="w-full justify-between" onClick={loginWithMiniApp} disabled={Boolean(authPending)}>
            <span className="inline-flex items-center gap-2">
              {authPending === "mini-app" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
              {authPending === "mini-app" ? "Mini App tekshirilmoqda..." : "Telegram Mini App orqali kirish"}
            </span>
            <ExternalLink className="h-4 w-4" />
          </Button>
        ) : null}

        {process.env.NODE_ENV !== "production" ? (
          <Button type="button" variant="secondary" className="w-full" onClick={() => completeLogin("/api/auth/dev", undefined, "dev")} disabled={Boolean(authPending)}>
            {authPending === "dev" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Code2 className="h-4 w-4" />}
            {authPending === "dev" ? "Dev login ochilmoqda..." : "Dev login"}
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

function getPendingLabel(source: AuthPendingSource) {
  if (source === "widget") return "Telegram profilingiz tekshirilmoqda...";
  if (source === "mini-app") return "Mini App sessiyasi tasdiqlanmoqda...";
  return "Dev sessiya ochilmoqda...";
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
