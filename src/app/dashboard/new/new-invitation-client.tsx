"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { InvitationPreview } from "@/components/invitation-preview";
import { VenuePicker } from "@/components/venue-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { defaultWeddingData } from "@/lib/templates";
import { findVenueOption } from "@/lib/venues";
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
  const selectedVenue = findVenueOption(previewData.venueName, previewData.venueAddress);

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
              <CardDescription>MVP hozircha to'y kategoriyasi bilan boshlanadi.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setTemplateId(template.id)}
                  className={`rounded-lg border p-4 text-left transition ${
                    templateId === template.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                >
                  <p className="font-semibold">{template.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Taklifnoma ma'lumotlari</CardTitle>
              <CardDescription>Maydonlar o'zgarganda preview darhol yangilanadi.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                id="invitation-form"
                className="grid gap-4 md:grid-cols-2"
                onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
              >
                <Field label="Kuyov ismi" error={form.formState.errors.groomName?.message}>
                  <Input {...form.register("groomName")} />
                </Field>
                <Field label="Kelin ismi" error={form.formState.errors.brideName?.message}>
                  <Input {...form.register("brideName")} />
                </Field>
                <Field label="Sana" error={form.formState.errors.eventDate?.message}>
                  <Input type="date" {...form.register("eventDate")} />
                </Field>
              <Field label="Vaqt" error={form.formState.errors.eventTime?.message}>
                <Input type="time" {...form.register("eventTime")} />
              </Field>
              <Field label="Rasm URL" error={form.formState.errors.coverImageUrl?.message}>
                <Input {...form.register("coverImageUrl")} />
              </Field>
              <VenuePicker
                selectedId={selectedVenue?.id}
                onSelect={(venue) => {
                  form.setValue("venueName", venue.name, { shouldDirty: true, shouldValidate: true });
                  form.setValue("venueAddress", venue.address, { shouldDirty: true, shouldValidate: true });
                }}
              />
              <div className="md:col-span-2 rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                Tanlangan manzil: <span className="font-semibold text-foreground">{previewData.venueName}</span> ·{" "}
                {previewData.venueAddress}
              </div>
              <Field label="Taklif matni" className="md:col-span-2" error={form.formState.errors.hostText?.message}>
                <Textarea {...form.register("hostText")} />
              </Field>
                {mutation.isError ? <p className="text-sm text-destructive md:col-span-2">Saqlashda xatolik.</p> : null}
              </form>
            </CardContent>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <InvitationPreview data={previewData} variant={selectedTemplate?.id} />
        </aside>
      </div>
    </main>
  );
}

function Field({
  label,
  error,
  className,
  children
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
