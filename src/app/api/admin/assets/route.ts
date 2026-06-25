import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

const bucketName = "template-assets";
const folderName = "library";
const maxFileSize = 10 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
  ["image/svg+xml", "svg"]
]);

type StorageFile = {
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
  metadata?: {
    mimetype?: string;
    size?: number;
  } | null;
};

async function requireAdminApi() {
  const user = await getCurrentUser();
  return user?.role === "admin" ? user : null;
}

async function getStorage() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: bucket } = await supabase.storage.getBucket(bucketName);
  if (!bucket) {
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: maxFileSize,
      allowedMimeTypes: [...allowedTypes.keys()]
    });
    if (error && !error.message.toLowerCase().includes("already exists")) throw error;
  }

  return supabase;
}

function toAsset(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  file: StorageFile
) {
  const path = `${folderName}/${file.name}`;
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  return {
    id: path,
    name: file.name.replace(/^[a-f0-9-]+-/, ""),
    url: data.publicUrl,
    type: file.metadata?.mimetype ?? "image",
    size: file.metadata?.size ?? 0,
    createdAt: file.created_at ?? file.updated_at ?? new Date().toISOString()
  };
}

export async function GET() {
  const user = await requireAdminApi();
  if (!user) {
    return NextResponse.json({ message: "Admin access required" }, { status: 403 });
  }

  try {
    const supabase = await getStorage();
    if (!supabase) {
      return NextResponse.json({ message: "Supabase Storage sozlanmagan" }, { status: 503 });
    }

    const { data, error } = await supabase.storage.from(bucketName).list(folderName, {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" }
    });
    if (error) throw error;

    const files = (data ?? []).filter((file) => file.name !== ".emptyFolderPlaceholder");
    const fallbackAssets = files.map((file) => toAsset(supabase, file));
    const { data: metadata, error: metadataError } = await supabase
      .from("template_assets")
      .select("*")
      .order("created_at", { ascending: false });
    if (metadataError?.code === "42P01") return NextResponse.json({ assets: fallbackAssets });
    if (metadataError) throw metadataError;

    const metadataByPath = new Map((metadata ?? []).map((row) => [row.storage_path, row]));
    return NextResponse.json({
      assets: fallbackAssets.map((asset) => {
        const row = metadataByPath.get(asset.id);
        return {
          ...asset,
          name: row?.name ?? asset.name,
          category: row?.category ?? "image",
          tags: row?.tags ?? []
        };
      })
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Assetlar olinmadi" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const user = await requireAdminApi();
  if (!user) {
    return NextResponse.json({ message: "Admin access required" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const category = String(formData.get("category") ?? "image").slice(0, 32);
    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Fayl topilmadi" }, { status: 400 });
    }
    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ message: "Faqat PNG, JPG, WebP yoki SVG mumkin" }, { status: 415 });
    }
    if (file.size > maxFileSize) {
      return NextResponse.json({ message: "Fayl 10 MB dan katta bo'lmasligi kerak" }, { status: 413 });
    }
    const bytes = await file.arrayBuffer();
    if (file.type === "image/svg+xml") {
      const svg = new TextDecoder().decode(bytes);
      const unsafeSvgPattern =
        /<script|<foreignObject|<iframe|<object|<embed|javascript:|\son[a-z]+\s*=|(?:href|xlink:href)\s*=\s*["']https?:/i;
      if (!/<svg[\s>]/i.test(svg) || unsafeSvgPattern.test(svg)) {
        return NextResponse.json({ message: "SVG ichida xavfli yoki tashqi kontent bor" }, { status: 400 });
      }
    }

    const supabase = await getStorage();
    if (!supabase) {
      return NextResponse.json({ message: "Supabase Storage sozlanmagan" }, { status: 503 });
    }

    const safeName = file.name
      .normalize("NFKD")
      .replace(/[^\w.-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
    const extension = allowedTypes.get(file.type)!;
    const baseName = safeName.replace(/\.[^.]+$/, "") || "asset";
    const fileName = `${crypto.randomUUID()}-${baseName}.${extension}`;
    const path = `${folderName}/${fileName}`;
    const { data, error } = await supabase.storage.from(bucketName).upload(path, bytes, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false
    });
    if (error) throw error;

    const { error: metadataError } = await supabase.from("template_assets").insert({
      storage_path: data.path,
      name: file.name,
      category,
      tags: [],
      mime_type: file.type,
      size_bytes: file.size,
      created_by: user.id
    });
    if (metadataError && metadataError.code !== "42P01") throw metadataError;

    return NextResponse.json(
      {
        asset: toAsset(supabase, {
          name: data.path.replace(`${folderName}/`, ""),
          created_at: new Date().toISOString(),
          metadata: { mimetype: file.type, size: file.size }
        })
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Asset yuklanmadi" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const user = await requireAdminApi();
  if (!user) {
    return NextResponse.json({ message: "Admin access required" }, { status: 403 });
  }

  const path = new URL(request.url).searchParams.get("path");
  if (!path?.startsWith(`${folderName}/`) || path.includes("..")) {
    return NextResponse.json({ message: "Asset path noto'g'ri" }, { status: 400 });
  }

  try {
    const supabase = await getStorage();
    if (!supabase) return NextResponse.json({ message: "Supabase Storage sozlanmagan" }, { status: 503 });
    const { error } = await supabase.storage.from(bucketName).remove([path]);
    if (error) throw error;
    const { error: metadataError } = await supabase.from("template_assets").delete().eq("storage_path", path);
    if (metadataError && metadataError.code !== "42P01") throw metadataError;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Asset o'chirilmadi" },
      { status: 500 }
    );
  }
}
