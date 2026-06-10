import { NextResponse } from "next/server";
import { getTemplateById, updateTemplate } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { templateSchema } from "@/lib/validations";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ message: "Admin access required" }, { status: 403 });
  }

  const { id } = await params;
  const input = templateSchema.partial().parse(await request.json());
  const current = await getTemplateById(id);
  if (!current) return NextResponse.json({ message: "Template not found" }, { status: 404 });
  if (input.revision && input.revision !== (current.revision ?? 1)) {
    return NextResponse.json(
      { message: "Template boshqa oynada yangilangan", template: current },
      { status: 409 }
    );
  }
  const template = await updateTemplate(id, {
    name: input.name,
    description: input.description,
    previewImageUrl: input.previewImageUrl,
    designDocument: input.designDocument,
    status: input.status
  });
  if (!template) return NextResponse.json({ message: "Template not found" }, { status: 404 });

  return NextResponse.json({ template });
}
