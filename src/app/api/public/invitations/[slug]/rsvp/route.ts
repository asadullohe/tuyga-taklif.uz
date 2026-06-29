import { NextResponse } from "next/server";
import {
  createReminderToken,
  getInvitationBySlug,
  getUserById,
  listRsvpsForInvitation,
  saveRsvpResponse,
  trackEvent
} from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRsvpStats, toPublicRsvps } from "@/lib/rsvp";
import { appUrl } from "@/lib/utils";
import { sendTelegramMessage } from "@/lib/telegram";
import { rsvpSchema } from "@/lib/validations";

type Params = {
  params: Promise<{ slug: string }>;
};

const rsvpRateLimit = {
  limit: 8,
  windowMs: 60 * 1000
};

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const invitation = await getInvitationBySlug(slug);
  if (!invitation) return NextResponse.json({ message: "Invitation not found" }, { status: 404 });

  const rsvps = await listRsvpsForInvitation(invitation.id);
  const stats = getRsvpStats(rsvps);

  return NextResponse.json({ rsvps: toPublicRsvps(rsvps), stats });
}

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;
  const rateLimit = checkRateLimit(getRsvpRateLimitKey(request, slug), rsvpRateLimit);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Too many RSVP attempts. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetAt / 1000))
        }
      }
    );
  }

  const invitation = await getInvitationBySlug(slug);
  if (!invitation) return NextResponse.json({ message: "Invitation not found" }, { status: 404 });

  const input = rsvpSchema.parse(await request.json());
  const wantsReminder = input.status === "attending" && input.reminderEnabled;
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  const reminderToken = wantsReminder && botUsername ? createReminderToken() : null;
  const result = await saveRsvpResponse(invitation.id, {
    guestName: input.guestName,
    status: input.status,
    guestCount: input.status === "attending" ? input.guestCount : 0,
    reminderEnabled: Boolean(reminderToken),
    telegramChatId: null,
    reminderToken
  });
  const { rsvp, previousRsvp } = result;
  await trackEvent(invitation.id, "rsvp_submitted", { rsvpId: rsvp.id, duplicate: !result.created });

  const shouldNotifyOwner =
    rsvp.status === "attending" &&
    (result.created || previousRsvp?.status !== rsvp.status || previousRsvp?.guestCount !== rsvp.guestCount);

  if (shouldNotifyOwner) {
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
      rsvp: toPublicRsvps([rsvp])[0],
      reminder:
        reminderToken && botUsername && !rsvp.telegramChatId
          ? {
              status: "pending_bot_link",
              link: `https://t.me/${botUsername}?start=rsvp_${reminderToken}`
            }
          : null
    },
    { status: result.created ? 201 : 200 }
  );
}

function escapeTelegramHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getRsvpRateLimitKey(request: Request, slug: string) {
  return `rsvp:${slug}:${getClientIp(request)}`;
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    forwardedFor ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "anonymous"
  );
}
