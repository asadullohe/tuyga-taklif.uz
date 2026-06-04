import { NextResponse } from "next/server";
import { connectRsvpReminder } from "@/lib/db";
import { sendTelegramMessage } from "@/lib/telegram";
import { formatDateTime } from "@/lib/utils";

type TelegramWebhookUpdate = {
  message?: {
    text?: string;
    chat?: {
      id?: number | string;
    };
  };
};

export async function POST(request: Request) {
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (webhookSecret && request.headers.get("x-telegram-bot-api-secret-token") !== webhookSecret) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const update = (await request.json().catch(() => ({}))) as TelegramWebhookUpdate;
  const chatId = update.message?.chat?.id;
  const text = update.message?.text?.trim() ?? "";

  if (!chatId) {
    return NextResponse.json({ ok: true });
  }

  const reminderToken = getReminderToken(text);
  if (!reminderToken) {
    if (text.startsWith("/start")) {
      await sendSafeMessage(
        String(chatId),
        "Eslatma ulash uchun taklifnomadagi maxsus Telegram tugmasini bosing."
      );
    }
    return NextResponse.json({ ok: true });
  }

  const linked = await connectRsvpReminder(reminderToken, String(chatId));
  if (!linked) {
    await sendSafeMessage(
      String(chatId),
      "Bu eslatma havolasi topilmadi yoki eskirgan. Taklifnomadan qayta javob yuboring."
    );
    return NextResponse.json({ ok: true });
  }

  const message = [
    "🔔 <b>Eslatma ulandi</b>",
    "",
    `${escapeTelegramHtml(linked.invitation.formData.groomName)} va ${escapeTelegramHtml(linked.invitation.formData.brideName)} to'yiga 24 soat qolganda xabar yuboramiz.`,
    `<b>Vaqt:</b> ${escapeTelegramHtml(formatDateTime(linked.invitation.formData.eventDate, linked.invitation.formData.eventTime))}`,
    `<b>Manzil:</b> ${escapeTelegramHtml(linked.invitation.formData.venueName)}`
  ].join("\n");

  await sendSafeMessage(String(chatId), message);
  return NextResponse.json({ ok: true });
}

function getReminderToken(text: string) {
  const match = text.match(/^\/start(?:@\w+)?\s+rsvp_([A-Za-z0-9_-]{20,64})$/);
  return match?.[1] ?? null;
}

async function sendSafeMessage(chatId: string, message: string) {
  try {
    await sendTelegramMessage(chatId, message);
  } catch (error) {
    console.error("[telegram-webhook-send]", error instanceof Error ? error.message : error);
  }
}

function escapeTelegramHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
