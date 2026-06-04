import crypto from "node:crypto";

export type TelegramLoginPayload = {
  id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: string;
  hash: string;
};

export type VerifiedTelegramUser = {
  telegramId: string;
  firstName: string;
  lastName?: string | null;
  username?: string | null;
  photoUrl?: string | null;
};

const TELEGRAM_MAX_AGE_SECONDS = 60 * 60 * 24;

export function getAuthErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;

  if (typeof error === "object" && error !== null) {
    const payload = error as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown };
    const message = typeof payload.message === "string" ? payload.message : "";
    const details = typeof payload.details === "string" ? payload.details : "";
    const hint = typeof payload.hint === "string" ? payload.hint : "";
    const code = typeof payload.code === "string" ? payload.code : "";
    const parts = [message, details, hint, code ? `Code: ${code}` : ""].filter(Boolean);
    if (parts.length > 0) return parts.join(" ");
  }

  return fallback;
}

function requireBotToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }
  return token;
}

export async function sendTelegramMessage(chatId: string, text: string) {
  const token = requireBotToken();
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true
    })
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Telegram sendMessage failed: ${payload}`);
  }
}

function timingSafeHexEqual(a: string, b: string) {
  if (!/^[a-f0-9]+$/i.test(a) || !/^[a-f0-9]+$/i.test(b)) return false;

  const aBuffer = Buffer.from(a, "hex");
  const bBuffer = Buffer.from(b, "hex");
  return aBuffer.length === bBuffer.length && crypto.timingSafeEqual(aBuffer, bBuffer);
}

function ensureFresh(authDate: string) {
  const timestamp = Number(authDate);
  if (!Number.isFinite(timestamp)) return false;
  const ageSeconds = Math.floor(Date.now() / 1000) - timestamp;
  return ageSeconds >= 0 && ageSeconds <= TELEGRAM_MAX_AGE_SECONDS;
}

export function verifyLoginWidgetPayload(payload: TelegramLoginPayload): VerifiedTelegramUser {
  const token = requireBotToken();
  const { hash, ...rest } = payload;

  if (!hash || !ensureFresh(rest.auth_date)) {
    throw new Error("Telegram login payload is expired or missing hash");
  }

  const dataCheckString = Object.entries(rest)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secret = crypto.createHash("sha256").update(token).digest();
  const expectedHash = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");

  if (!timingSafeHexEqual(hash, expectedHash)) {
    throw new Error("Telegram login hash is invalid");
  }

  return {
    telegramId: String(rest.id),
    firstName: rest.first_name,
    lastName: rest.last_name || null,
    username: rest.username || null,
    photoUrl: rest.photo_url || null
  };
}

export function verifyMiniAppInitData(initData: string): VerifiedTelegramUser {
  const token = requireBotToken();
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  const authDate = params.get("auth_date");
  const userJson = params.get("user");

  if (!hash || !authDate || !userJson || !ensureFresh(authDate)) {
    throw new Error("Telegram Mini App initData is expired or incomplete");
  }

  params.delete("hash");
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secret = crypto.createHmac("sha256", "WebAppData").update(token).digest();
  const expectedHash = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");

  if (!timingSafeHexEqual(hash, expectedHash)) {
    throw new Error("Telegram Mini App hash is invalid");
  }

  const user = JSON.parse(userJson) as {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  };

  return {
    telegramId: String(user.id),
    firstName: user.first_name,
    lastName: user.last_name || null,
    username: user.username || null,
    photoUrl: user.photo_url || null
  };
}
