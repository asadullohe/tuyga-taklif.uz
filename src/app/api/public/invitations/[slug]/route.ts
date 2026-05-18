import { NextResponse } from "next/server";
import { getInvitationBySlug, trackEvent } from "@/lib/db";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const invitation = await getInvitationBySlug(slug);
  if (!invitation) return NextResponse.json({ message: "Invitation not found" }, { status: 404 });

  await trackEvent(invitation.id, "opened");
  return NextResponse.json({ invitation });
}
