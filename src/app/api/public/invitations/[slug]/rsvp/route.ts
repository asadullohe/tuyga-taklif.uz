import { NextResponse } from "next/server";
import { createRsvp, getInvitationBySlug, trackEvent } from "@/lib/db";
import { rsvpSchema } from "@/lib/validations";

type Params = {
  params: Promise<{ slug: string }>;
};

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
