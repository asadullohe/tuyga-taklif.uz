"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Rocket, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { InvitationDeleteButton } from "@/components/invitation-delete-button";
import { InvitationPreview } from "@/components/invitation-preview";
import { VenuePicker } from "@/components/venue-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { appUrl } from "@/lib/utils";
import { findVenueOption } from "@/lib/venues";
import { weddingFormSchema, type WeddingFormInput } from "@/lib/validations";
import type { Invitation } from "@/types";

export function EditInvitationClient({ invitation }: { invitation: Invitation }) {
  const router = useRouter();
  const form = useForm<WeddingFormInput>({
    resolver: zodResolver(weddingFormSchema),
    defaultValues: invitation.formData
  });
  const previewData = form.watch();
  const selectedVenue = findVenueOption(previewData.venueName, previewData.venueAddress);

  const saveMutation = useMutation({
    mutationFn: async (values: WeddingFormInput) => {
      const response = await fetch(`/api/invitations/${invitation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: values })
      });
      if (!response.ok) throw new Error("Saqlanmadi");
      return response.json();
    },
    onSuccess: () => router.refresh()
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const values = form.getValues();
      const saveResponse = await fetch(`/api/invitations/${invitation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: values })
      });
      if (!saveResponse.ok) throw new Error("Saqlanmadi");

      const response = await fetch(`/api/invitations/${invitation.id}/publish`, { method: "POST" });
      if (!response.ok) throw new Error("Publish qilinmadi");
      return (await response.json()) as { invitation: Invitation };
    },
    onSuccess: ({ invitation: published }) => {
      router.refresh();
      if (published.slug) router.push(`/a/${published.slug}`);
    }
  });

  const publicUrl = invitation.slug ? `${appUrl()}/a/${invitation.slug}` : null;
  const title = `${invitation.formData.groomName} va ${invitation.formData.brideName}`;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <div className="flex gap-2">
          {publicUrl ? (
            <Button asChild variant="outline">
              <Link href={`/a/${invitation.slug}`}>
                <ExternalLink className="h-4 w-4" />
                Public
              </Link>
            </Button>
          ) : null}
          <Button form="edit-invitation-form" variant="outline" disabled={saveMutation.isPending}>
            <Save className="h-4 w-4" />
            Saqlash
          </Button>
          <Button type="button" onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending}>
            <Rocket className="h-4 w-4" />
            Publish
          </Button>
          <InvitationDeleteButton invitationId={invitation.id} title={title} redirectTo="/dashboard" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_460px]">
        <Card>
          <CardHeader>
            <CardTitle>Taklifnomani tahrirlash</CardTitle>
            <CardDescription>
              {publicUrl ? `Public link: ${publicUrl}` : "Publish qilingandan keyin public link yaratiladi."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id="edit-invitation-form"
              className="grid gap-4 md:grid-cols-2"
              onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
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
              {saveMutation.isError || publishMutation.isError ? (
                <p className="text-sm text-destructive md:col-span-2">Amal bajarilmadi.</p>
              ) : null}
            </form>
          </CardContent>
        </Card>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <InvitationPreview data={previewData} variant={invitation.templateId} />
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
