import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getInvitationForUser } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

const bucketName = "invitation-assets";
const maxFileSize = 8 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"]
]);

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const invitation = await getInvitationForUser(id, user.id);
  if (!invitation) return NextResponse.json({ message: "Invitation not found" }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Fayl topilmadi" }, { status: 400 });
  }
  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ message: "Faqat PNG, JPG yoki WebP mumkin" }, { status: 415 });
  }
  if (file.size > maxFileSize) {
    return NextResponse.json({ message: "Fayl 8 MB dan katta bo'lmasligi kerak" }, { status: 413 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ message: "Supabase Storage sozlanmagan" }, { status: 503 });
  }

  const { data: bucket } = await supabase.storage.getBucket(bucketName);
  if (!bucket) {
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: maxFileSize,
      allowedMimeTypes: [...allowedTypes.keys()]
    });
    if (error && !error.message.toLowerCase().includes("already exists")) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }

  const extension = allowedTypes.get(file.type)!;
  const path = `${user.id}/${id}/${crypto.randomUUID()}.${extension}`;
  const bytes = await file.arrayBuffer();
  const { error } = await supabase.storage.from(bucketName).upload(path, bytes, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false
  });
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl }, { status: 201 });
}
