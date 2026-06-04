import { NextResponse } from "next/server";
import { createRsvp, getInvitationBySlug, getUserById, listRsvpsForInvitation, trackEvent } from "@/lib/db";
import { appUrl } from "@/lib/utils";
import { sendTelegramMessage } from "@/lib/telegram";
import { rsvpSchema } from "@/lib/validations";

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

  return NextResponse.json({ rsvps, stats });
}

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;
  const invitation = await getInvitationBySlug(slug);
  if (!invitation) return NextResponse.json({ message: "Invitation not found" }, { status: 404 });

  const input = rsvpSchema.parse(await request.json());
  const rsvp = await createRsvp(invitation.id, {
    guestName: input.guestName,
    status: input.status,
    guestCount: input.status === "attending" ? input.guestCount : 0,
    reminderEnabled: input.status === "attending" ? input.reminderEnabled : false,
    telegramChatId: input.status === "attending" && input.reminderEnabled ? input.telegramChatId : null
  });
  await trackEvent(invitation.id, "rsvp_submitted", { rsvpId: rsvp.id });

  if (rsvp.reminderEnabled && rsvp.telegramChatId) {
    const message = [
      "🔔 <b>Eslatma yoqildi</b>",
      "",
      `${escapeTelegramHtml(invitation.formData.groomName)} va ${escapeTelegramHtml(invitation.formData.brideName)} to'yiga 24 soat qolganda eslatma yuboramiz.`,
      `<b>Manzil:</b> ${escapeTelegramHtml(invitation.formData.venueName)}`
    ].join("\n");

    sendTelegramMessage(rsvp.telegramChatId, message).catch((error) => {
      console.error("[rsvp-reminder-test]", error instanceof Error ? error.message : error);
    });
  }

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

  return NextResponse.json({ rsvp }, { status: 201 });
}

function escapeTelegramHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
