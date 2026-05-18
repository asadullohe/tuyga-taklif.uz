import { NextResponse } from "next/server";
import { getInvitationForUser, updateInvitation } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { updateInvitationSchema } from "@/lib/validations";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const invitation = await getInvitationForUser(id, user.id);
  if (!invitation) return NextResponse.json({ message: "Invitation not found" }, { status: 404 });

  return NextResponse.json({ invitation });
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const input = updateInvitationSchema.parse(await request.json());
  const invitation = await updateInvitation(id, user.id, input.formData);
  if (!invitation) return NextResponse.json({ message: "Invitation not found" }, { status: 404 });

  return NextResponse.json({ invitation });
}
