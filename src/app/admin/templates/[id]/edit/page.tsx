import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TemplateStudioClient } from "@/app/admin/templates/new/template-studio-client";
import { Button } from "@/components/ui/button";
import { getTemplateById } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTemplatePage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const template = await getTemplateById(id);
  if (!template) notFound();

  return (
    <main className="min-h-screen bg-[#171b19] text-white xl:h-dvh xl:overflow-hidden">
      <header className="flex h-16 items-center justify-between border-b border-white/10 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button asChild variant="ghost" className="shrink-0 text-white hover:bg-white/10 hover:text-white">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
              Admin
            </Link>
          </Button>
          <div className="h-6 w-px shrink-0 bg-white/15" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{template.name}</p>
            <p className="text-xs text-white/50">Template tahrirlash · revision {template.revision ?? 1}</p>
          </div>
        </div>
      </header>

      <TemplateStudioClient initialTemplate={template} />
    </main>
  );
}
