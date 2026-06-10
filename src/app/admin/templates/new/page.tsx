import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TemplateStudioClient } from "@/app/admin/templates/new/template-studio-client";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/session";

export default async function NewTemplatePage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-[#171b19] text-white xl:h-dvh xl:overflow-hidden">
      <header className="flex h-16 items-center justify-between border-b border-white/10 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
              Admin
            </Link>
          </Button>
          <div className="h-6 w-px bg-white/15" />
          <div>
            <p className="text-sm font-semibold">Template Studio</p>
            <p className="text-xs text-white/50">Layer-based invitation builder</p>
          </div>
        </div>
      </header>

      <TemplateStudioClient />
    </main>
  );
}
