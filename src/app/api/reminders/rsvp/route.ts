import { NextResponse } from "next/server";
import { listPendingRsvpReminders, markRsvpReminderSent } from "@/lib/db";
import { sendTelegramMessage } from "@/lib/telegram";
import { appUrl, formatDateTime } from "@/lib/utils";

export async function GET(request: Request) {
  return runRsvpReminders(request);
}

export async function POST(request: Request) {
  return runRsvpReminders(request);
}

async function runRsvpReminders(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (token !== cronSecret) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  }

  const pending = await listPendingRsvpReminders();
  let sent = 0;
  const failed: string[] = [];

  for (const item of pending) {
    if (!item.rsvp.telegramChatId) continue;

    const invitationUrl = item.invitation.slug ? `${appUrl()}/a/${item.invitation.slug}` : appUrl();
    const message = [
      "🔔 <b>To'y eslatmasi</b>",
      "",
      `${escapeTelegramHtml(item.invitation.formData.groomName)} va ${escapeTelegramHtml(item.invitation.formData.brideName)}larning to'yiga 24 soatdan kam vaqt qoldi. To'yga tayyorgarlikni boshlayvering .`,
      `<b>Vaqt:</b> ${escapeTelegramHtml(formatDateTime(item.invitation.formData.eventDate, item.invitation.formData.eventTime))}`,
      `<b>Manzil:</b> ${escapeTelegramHtml(item.invitation.formData.venueName)} · ${escapeTelegramHtml(item.invitation.formData.venueAddress)}`,
      "",
      invitationUrl
    ].join("\n");

    try {
      await sendTelegramMessage(item.rsvp.telegramChatId, message);
      await markRsvpReminderSent(item.rsvp.id);
      sent += 1;
    } catch (error) {
      failed.push(item.rsvp.id);
      console.error("[rsvp-reminder-send]", error instanceof Error ? error.message : error);
    }
  }

  return NextResponse.json({ checked: pending.length, sent, failed });
}

function escapeTelegramHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
