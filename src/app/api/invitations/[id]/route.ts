import { NextResponse } from "next/server";
import { deleteInvitation, getInvitationForUser, updateInvitation } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { sanitizeUserDesignDocument } from "@/lib/template-document";
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

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const deleted = await deleteInvitation(id, user.id);
  if (!deleted) return NextResponse.json({ message: "Invitation not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const input = updateInvitationSchema.parse(await request.json());
  const existing = await getInvitationForUser(id, user.id);
  if (!existing) return NextResponse.json({ message: "Invitation not found" }, { status: 404 });

  const currentDocument = existing.designDocument ?? existing.template?.designDocument;
  const designDocument =
    input.designDocument && currentDocument
      ? sanitizeUserDesignDocument(currentDocument, input.designDocument)
      : input.designDocument;
  const invitation = await updateInvitation(id, user.id, input.formData, designDocument);
  if (!invitation) return NextResponse.json({ message: "Invitation not found" }, { status: 404 });

  return NextResponse.json({ invitation });
}
