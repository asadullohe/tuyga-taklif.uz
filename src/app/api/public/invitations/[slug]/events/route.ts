import { NextResponse } from "next/server";
import { getInvitationBySlug, trackEvent } from "@/lib/db";

type Params = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;
  const invitation = await getInvitationBySlug(slug);
  if (!invitation) return NextResponse.json({ message: "Invitation not found" }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as { eventType?: "share_clicked" };
  if (body.eventType !== "share_clicked") {
    return NextResponse.json({ message: "Unsupported event" }, { status: 400 });
  }

  await trackEvent(invitation.id, "share_clicked");
  return NextResponse.json({ ok: true });
}
