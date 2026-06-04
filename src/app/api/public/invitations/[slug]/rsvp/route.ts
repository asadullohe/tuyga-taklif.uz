import { NextResponse } from "next/server";
import { createRsvp, getInvitationBySlug, listRsvpsForInvitation, trackEvent } from "@/lib/db";
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
    guestCount: input.status === "attending" ? input.guestCount : 0
  });
  await trackEvent(invitation.id, "rsvp_submitted", { rsvpId: rsvp.id });

  return NextResponse.json({ rsvp }, { status: 201 });
}
