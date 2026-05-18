import { NextResponse } from "next/server";
import { upsertTelegramUser } from "@/lib/db";
import { setSessionCookie } from "@/lib/session";
import { verifyMiniAppInitData } from "@/lib/telegram";

export async function POST(request: Request) {
  try {
    const { initData } = (await request.json()) as { initData?: string };
    if (!initData) {
      return NextResponse.json({ message: "initData is required" }, { status: 400 });
    }

    const telegramUser = verifyMiniAppInitData(initData);
    const user = await upsertTelegramUser(telegramUser);
    const response = NextResponse.json({ user });
    setSessionCookie(response, user);
    return response;
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Telegram Mini App login failed" },
      { status: 401 }
    );
  }
}
