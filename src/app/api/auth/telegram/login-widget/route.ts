import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/session";
import { getAuthErrorMessage, type TelegramLoginPayload, verifyLoginWidgetPayload } from "@/lib/telegram";
import { upsertTelegramUser } from "@/lib/db";

function loginRedirect(request: Request, path: string) {
  return new URL(path, request.url);
}

async function completeTelegramLogin(payload: TelegramLoginPayload) {
  const telegramUser = verifyLoginWidgetPayload(payload);
  return upsertTelegramUser(telegramUser);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const payload = Object.fromEntries(url.searchParams.entries()) as TelegramLoginPayload;
    const user = await completeTelegramLogin(payload);
    const response = NextResponse.redirect(loginRedirect(request, "/dashboard"));
    setSessionCookie(response, user);
    return response;
  } catch (error) {
    const message = getAuthErrorMessage(error, "Telegram login failed");
    console.error("[telegram-login-widget]", message);
    const url = loginRedirect(request, "/login");
    url.searchParams.set("error", message);
    return NextResponse.redirect(url);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const user = await completeTelegramLogin(payload);
    const response = NextResponse.json({ user });
    setSessionCookie(response, user);
    return response;
  } catch (error) {
    const message = getAuthErrorMessage(error, "Telegram login failed");
    console.error("[telegram-login-widget]", message);
    return NextResponse.json({ message }, { status: 401 });
  }
}
