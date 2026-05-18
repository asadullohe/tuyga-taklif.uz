import { NextResponse } from "next/server";
import { upsertTelegramUser } from "@/lib/db";
import { setSessionCookie } from "@/lib/session";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Dev login is disabled in production" }, { status: 404 });
  }

  const user = await upsertTelegramUser({
    telegramId: "1000001",
    firstName: "Demo",
    lastName: "Admin",
    username: "demo_admin",
    photoUrl: null
  });
  const response = NextResponse.json({ user });
  setSessionCookie(response, user);
  return response;
}
