import { NextResponse } from "next/server";
import { updateTemplate } from "@/lib/db";
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
  const template = await updateTemplate(id, input);
  if (!template) return NextResponse.json({ message: "Template not found" }, { status: 404 });

  return NextResponse.json({ template });
}
