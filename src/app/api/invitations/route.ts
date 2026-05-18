import { NextResponse } from "next/server";
import { createInvitation, listUserInvitations } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { createInvitationSchema } from "@/lib/validations";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const invitations = await listUserInvitations(user.id);
  return NextResponse.json({ invitations });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const input = createInvitationSchema.parse(await request.json());
  const invitation = await createInvitation(user.id, input.templateId, input.formData);
  return NextResponse.json({ invitation }, { status: 201 });
}
