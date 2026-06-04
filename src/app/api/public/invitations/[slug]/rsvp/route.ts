import { NextResponse } from "next/server";
import {
  createReminderToken,
  createRsvp,
  getInvitationBySlug,
  getUserById,
  listRsvpsForInvitation,
  trackEvent
} from "@/lib/db";
import { appUrl } from "@/lib/utils";
import { sendTelegramMessage } from "@/lib/telegram";
import { rsvpSchema } from "@/lib/validations";
import type { Rsvp } from "@/types";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const invitation = await getInvitationBySlug(slug);
  if (!invitation) return NextResponse.json({ message: "Invitation not found" }, { status: 404 });

  const rsvps = await listRsvpsForInvitation(invitation.id);
  const stats = rsvps.reduce(
    (acc, rsvp) => {
      acc.total += 1;
      if (rsvp.status === "attending") {
        acc.attending += 1;
        acc.guests += rsvp.guestCount;
      } else {
        acc.notAttending += 1;
      }
      return acc;
    },
    { total: 0, attending: 0, notAttending: 0, guests: 0 }
  );

  return NextResponse.json({ rsvps: rsvps.map(toPublicRsvp), stats });
}

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;
  const invitation = await getInvitationBySlug(slug);
  if (!invitation) return NextResponse.json({ message: "Invitation not found" }, { status: 404 });

  const input = rsvpSchema.parse(await request.json());
  const wantsReminder = input.status === "attending" && input.reminderEnabled;
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  const reminderToken = wantsReminder && botUsername ? createReminderToken() : null;
  const rsvp = await createRsvp(invitation.id, {
    guestName: input.guestName,
    status: input.status,
    guestCount: input.status === "attending" ? input.guestCount : 0,
    reminderEnabled: Boolean(reminderToken),
    telegramChatId: null,
    reminderToken
  });
  await trackEvent(invitation.id, "rsvp_submitted", { rsvpId: rsvp.id });

  if (rsvp.status === "attending") {
    const owner = await getUserById(invitation.userId);
    if (owner?.telegramId) {
      const invitationUrl = invitation.slug ? `${appUrl()}/a/${invitation.slug}` : appUrl();
      const message = [
        "✅ <b>Yangi RSVP: kelaman</b>",
        "",
        `<b>Mehmon:</b> ${escapeTelegramHtml(rsvp.guestName)}`,
        `<b>Soni:</b> ${rsvp.guestCount}`,
        `<b>Taklifnoma:</b> ${escapeTelegramHtml(invitation.formData.groomName)} va ${escapeTelegramHtml(invitation.formData.brideName)}`,
        "",
        invitationUrl
      ].join("\n");

      sendTelegramMessage(owner.telegramId, message).catch((error) => {
        console.error("[rsvp-telegram-notify]", error instanceof Error ? error.message : error);
      });
    }
  }

  return NextResponse.json(
    {
      rsvp: toPublicRsvp(rsvp),
      reminder:
        reminderToken && botUsername
          ? {
              status: "pending_bot_link",
              link: `https://t.me/${botUsername}?start=rsvp_${reminderToken}`
            }
          : null
    },
    { status: 201 }
  );
}

function escapeTelegramHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function toPublicRsvp(rsvp: Rsvp): Rsvp {
  return {
    ...rsvp,
    reminderEnabled: Boolean(rsvp.reminderEnabled && rsvp.telegramChatId),
    telegramChatId: null
  };
}
