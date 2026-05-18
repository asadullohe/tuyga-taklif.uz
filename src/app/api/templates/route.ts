import { NextResponse } from "next/server";
import { createTemplate, getActiveTemplates } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { templateSchema } from "@/lib/validations";

export async function GET() {
  const templates = await getActiveTemplates();
  return NextResponse.json({ templates });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ message: "Admin access required" }, { status: 403 });
  }

  const input = templateSchema.parse(await request.json());
  const template = await createTemplate(input);
  return NextResponse.json({ template }, { status: 201 });
}
