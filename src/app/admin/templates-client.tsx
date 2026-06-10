"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { BadgeCheck, FileJson, Palette, PenTool, UploadCloud } from "lucide-react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { templateSchema } from "@/lib/validations";
import type { InvitationTemplate } from "@/types";

type TemplateInput = z.infer<typeof templateSchema>;

export function AdminTemplatesClient({ templates }: { templates: InvitationTemplate[] }) {
  const router = useRouter();
  const form = useForm<TemplateInput>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      description: "",
      previewImageUrl: "",
      status: "active"
    }
  });

  const createMutation = useMutation({
    mutationFn: async (values: TemplateInput) => {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      if (!response.ok) throw new Error("Template yaratilmadi");
      return response.json();
    },
    onSuccess: () => {
      form.reset({ name: "", description: "", previewImageUrl: "", status: "active" });
      router.refresh();
    }
  });

  const statusMutation = useMutation({
    mutationFn: async (template: InvitationTemplate) => {
      const response = await fetch(`/api/admin/templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: template.status === "active" ? "inactive" : "active" })
      });
      if (!response.ok) throw new Error("Template yangilanmadi");
      return response.json();
    },
    onSuccess: () => router.refresh()
  });

  return (
    <div className="space-y-6">
      <Card className="border-emerald-950/10 bg-[#f8f4ec]">
        <CardHeader>
          <CardTitle>Template studio modeli</CardTitle>
          <CardDescription>
            Shablon ichki layer editorida tayyorlanadi, user tahriri va publish sayt ichida ishlaydi.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-3">
          <StudioStep
            icon={<Palette className="h-4 w-4" />}
            title="1. Dizayn"
            text="Template ichki layer editorida tayyorlanadi."
          />
          <StudioStep
            icon={<FileJson className="h-4 w-4" />}
            title="2. Schema"
            text="Editable fieldlar belgilanadi: ism, sana, joy, matn, rasm."
          />
          <StudioStep
            icon={<BadgeCheck className="h-4 w-4" />}
            title="3. Publish"
            text="User sayt ichida o'zgartiradi, preview ko'radi va public link chiqaradi."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Template qo'shish</CardTitle>
              <CardDescription className="mt-1">
                Layer editor orqali kodsiz shablon yarating yoki eski tezkor formadan foydalaning.
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/admin/templates/new">
                <PenTool className="h-4 w-4" />
                Studio ochish
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}>
            <div className="space-y-2">
              <Label>Nomi</Label>
              <Input {...form.register("name")} />
            </div>
            <div className="space-y-2">
              <Label>Tavsif</Label>
              <Textarea {...form.register("description")} />
            </div>
            <div className="space-y-2">
              <Label>Preview image URL</Label>
              <Input {...form.register("previewImageUrl")} />
            </div>
            <Button type="submit" disabled={createMutation.isPending}>
              <UploadCloud className="h-4 w-4" />
              Qo'shish
            </Button>
            {createMutation.isError ? <p className="text-sm text-destructive">Template yaratilmadi.</p> : null}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Templatelar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {templates.map((template) => (
            <div key={template.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{template.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
                </div>
                <Badge>{template.status}</Badge>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => statusMutation.mutate(template)}
              >
                {template.status === "active" ? "Noaktiv qilish" : "Aktiv qilish"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StudioStep({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-emerald-950/10 bg-white p-4">
      <div className="flex items-center gap-2 font-semibold text-slate-950">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-900 text-white">{icon}</span>
        {title}
      </div>
      <p className="mt-3 leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
