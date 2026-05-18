import { NextResponse } from "next/server";
import { publishInvitation } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const invitation = await publishInvitation(id, user.id);
  if (!invitation) return NextResponse.json({ message: "Invitation not found" }, { status: 404 });

  return NextResponse.json({ invitation });
}
