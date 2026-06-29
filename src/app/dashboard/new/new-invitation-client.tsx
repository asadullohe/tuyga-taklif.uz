"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { InvitationPreview } from "@/components/invitation-preview";
import { TemplateFormFields } from "@/components/template-form-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultWeddingData } from "@/lib/templates";
import { weddingFormSchema, type WeddingFormInput } from "@/lib/validations";
import type { InvitationTemplate } from "@/types";

export function NewInvitationClient({ templates }: { templates: InvitationTemplate[] }) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === templateId) ?? templates[0],
    [templateId, templates]
  );

  const form = useForm<WeddingFormInput>({
    resolver: zodResolver(weddingFormSchema),
    defaultValues: defaultWeddingData
  });
  const previewData = form.watch();

  const mutation = useMutation({
    mutationFn: async (values: WeddingFormInput) => {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, formData: values })
      });
      if (!response.ok) throw new Error("Taklifnoma saqlanmadi");
      return (await response.json()) as { invitation: { id: string } };
    },
    onSuccess: ({ invitation }) => router.push(`/dashboard/${invitation.id}/edit`)
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-5 flex items-center justify-between">
        <Button asChild variant="ghost">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <Button form="invitation-form" disabled={mutation.isPending || !templateId}>
          <Save className="h-4 w-4" />
          Saqlash
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_460px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template tanlash</CardTitle>
              <CardDescription>
                User template tanlaydi, keyin faqat ruxsat berilgan joylarni sayt ichida tahrirlaydi.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setTemplateId(template.id)}
                  className={`group overflow-hidden rounded-lg border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    templateId === template.id ? "border-primary ring-2 ring-primary/15" : "hover:bg-muted/20"
                  }`}
                >
                  <div className={`h-28 ${getTemplateSwatch(template.id)}`} />
                  <div className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold">{template.name}</p>
                      <Badge className="bg-emerald-50 text-emerald-700">Premium</Badge>
                    </div>
                    <p className="text-sm leading-5 text-muted-foreground">{template.description}</p>
                    <p className="text-xs font-semibold text-emerald-700">
                      {template.schema.length} ta editable maydon
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {getTemplateTags(template.id).map((tag) => (
                        <span key={tag} className="rounded-md bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template editor</CardTitle>
              <CardDescription>Maydonlar o'zgarganda preview darhol yangilanadi.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                id="invitation-form"
                className="space-y-4"
                onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
              >
                {selectedTemplate ? <TemplateFormFields form={form} fields={selectedTemplate.schema} /> : null}
                {mutation.isError ? <p className="text-sm text-destructive">Saqlashda xatolik.</p> : null}
              </form>
            </CardContent>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <InvitationPreview
            data={previewData}
            variant={selectedTemplate?.id}
            designDocument={selectedTemplate?.designDocument}
          />
        </aside>
      </div>
    </main>
  );
}

function getTemplateTags(id: string) {
  if (id === "momento-light") return ["Multi-section", "Light luxury", "RSVP"];
  if (id.includes("fotiha")) return ["Fotiha", "Blue", "Formal"];
  if (id.includes("anniversary")) return ["Yubiley", "Midnight", "Gold"];
  if (id.includes("editorial-mono")) return ["Nikoh", "Editorial", "Mono"];
  if (id.includes("blush-photo")) return ["Nikoh", "Photo", "Blush"];
  if (id.includes("emerald-arch")) return ["Nikoh", "Emerald", "Gold"];
  if (id.includes("collage")) return ["Photo", "Collage", "Luxury"];
  if (id.includes("velvet")) return ["Ruby", "Gold", "Dramatic"];
  if (id.includes("noor") || id.includes("emerald")) return ["Gold", "Ornament", "Formal"];
  if (id.includes("minimal")) return ["Editorial", "Clean", "Typography"];
  if (id.includes("garden")) return ["Botanical", "Soft", "Photo"];
  if (id.includes("midnight")) return ["Noir", "Gold", "Evening"];
  if (id.includes("silk") || id.includes("pearl")) return ["Soft luxury", "Photo", "Pearl"];
  return ["Wedding", "Premium", "Ready"];
}

function getTemplateSwatch(id: string) {
  if (id === "momento-light") return "bg-[radial-gradient(circle_at_26%_22%,rgba(255,255,255,.9),transparent_24%),repeating-linear-gradient(105deg,rgba(120,94,58,.14)_0_1px,transparent_1px_18px),linear-gradient(135deg,#fffaf2,#eadcc8_48%,#f8efe1)]";
  if (id.includes("blue-fotiha")) return "bg-[radial-gradient(circle_at_50%_45%,#f6f2e9_0_34%,transparent_35%),linear-gradient(135deg,#102b4e,#294f72)]";
  if (id.includes("midnight-anniversary")) return "bg-[radial-gradient(circle_at_50%_42%,#caa45d_0_14%,transparent_15%),radial-gradient(circle_at_50%_42%,transparent_0_36%,#6d5936_37%_38%,transparent_39%),#111018]";
  if (id.includes("editorial-mono")) return "bg-[linear-gradient(90deg,#161616_0_20%,#f3efe6_20%_100%)]";
  if (id.includes("blush-photo")) return "bg-[radial-gradient(circle_at_50%_42%,#9c5360_0_24%,#fffaf5_25%_50%,#f2dfe1_51%)]";
  if (id.includes("emerald-arch")) return "bg-[radial-gradient(circle_at_50%_45%,#f6eddb_0_34%,#0b483b_35%_72%,#07372d_73%)]";
  if (id.includes("velvet")) return "bg-[radial-gradient(circle_at_50%_12%,rgba(216,170,88,.72),transparent_22%),linear-gradient(135deg,#2a0610,#8f1730_52%,#1b0710)]";
  if (id.includes("emerald")) return "bg-[radial-gradient(circle_at_50%_0%,rgba(215,180,106,.55),transparent_35%),linear-gradient(135deg,#06281f,#114537)]";
  if (id.includes("midnight")) return "bg-[radial-gradient(circle_at_75%_18%,rgba(240,195,111,.7),transparent_18%),linear-gradient(135deg,#020617,#13213b)]";
  if (id.includes("collage")) return "bg-[linear-gradient(135deg,#6e4b2c,#e9d2b2_46%,#fffaf4)]";
  if (id.includes("garden")) return "bg-[radial-gradient(circle_at_20%_20%,rgba(247,167,181,.65),transparent_20%),linear-gradient(135deg,#dcefdc,#fff8ef,#cfe9d6)]";
  if (id.includes("silk") || id.includes("pearl")) return "bg-[radial-gradient(circle_at_78%_16%,rgba(244,180,196,.65),transparent_24%),linear-gradient(135deg,#fffaf7,#eadfeb,#d9c3db)]";
  if (id.includes("minimal")) return "bg-[linear-gradient(90deg,rgba(17,17,17,.08)_1px,transparent_1px),linear-gradient(180deg,rgba(17,17,17,.08)_1px,transparent_1px),linear-gradient(135deg,#fffdf8,#e9dfd0)] bg-[length:22px_22px,22px_22px,auto]";
  return "bg-[linear-gradient(135deg,#fffaf4,#f6e7c7,#f9e8ee)]";
}
