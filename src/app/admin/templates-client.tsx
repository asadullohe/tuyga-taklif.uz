"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
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
      <Card>
        <CardHeader>
          <CardTitle>Template qo'shish</CardTitle>
          <CardDescription>Hozircha barcha templatelar to'y kategoriyasiga tegishli.</CardDescription>
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
              <Plus className="h-4 w-4" />
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
