import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/session";
import { verifyLoginWidgetPayload } from "@/lib/telegram";
import { upsertTelegramUser } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const telegramUser = verifyLoginWidgetPayload(payload);
    const user = await upsertTelegramUser(telegramUser);
    const response = NextResponse.json({ user });
    setSessionCookie(response, user);
    return response;
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Telegram login failed" },
      { status: 401 }
    );
  }
}
