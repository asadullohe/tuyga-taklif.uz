"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Rocket, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { InvitationDesignEditor } from "@/components/invitation-design-editor";
import { InvitationDeleteButton } from "@/components/invitation-delete-button";
import { InvitationPreview } from "@/components/invitation-preview";
import { TemplateFormFields } from "@/components/template-form-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { weddingTemplateFields } from "@/lib/templates";
import { appUrl } from "@/lib/utils";
import { weddingFormSchema, type WeddingFormInput } from "@/lib/validations";
import type { Invitation } from "@/types";

export function EditInvitationClient({ invitation }: { invitation: Invitation }) {
  const router = useRouter();
  const [designDocument, setDesignDocument] = useState(
    () => structuredClone(invitation.designDocument ?? invitation.template?.designDocument ?? null)
  );
  const form = useForm<WeddingFormInput>({
    resolver: zodResolver(weddingFormSchema),
    defaultValues: invitation.formData
  });
  const previewData = form.watch();
  const previewFingerprint = JSON.stringify(previewData);
  const templateFields = invitation.template?.schema ?? weddingTemplateFields;
  const [autoSaveState, setAutoSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const initialRenderRef = useRef(true);

  const saveMutation = useMutation({
    mutationFn: async (values: WeddingFormInput) => {
      const response = await fetch(`/api/invitations/${invitation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: values, designDocument })
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
        body: JSON.stringify({ formData: values, designDocument })
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

  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
    const timer = window.setTimeout(async () => {
      setAutoSaveState("saving");
      try {
        const response = await fetch(`/api/invitations/${invitation.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formData: form.getValues(), designDocument })
        });
        if (!response.ok) throw new Error("Autosave failed");
        setAutoSaveState("saved");
      } catch {
        setAutoSaveState("error");
      }
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [designDocument, form, invitation.id, previewFingerprint]);

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
          <span className="hidden self-center text-xs text-muted-foreground sm:inline">
            {autoSaveState === "saving" ? "Saqlanmoqda..." : autoSaveState === "saved" ? "Saqlandi" : autoSaveState === "error" ? "Autosave xato" : "Draft"}
          </span>
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

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="lg:sticky lg:top-6 lg:self-start">
          <CardHeader>
            <CardTitle>Template editor</CardTitle>
            <CardDescription>
              {publicUrl ? `Public link: ${publicUrl}` : "Publish qilingandan keyin public link yaratiladi."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              id="edit-invitation-form"
              className="space-y-4"
              onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
            >
              <TemplateFormFields form={form} fields={templateFields} />
              {saveMutation.isError || publishMutation.isError ? (
                <p className="text-sm text-destructive">Amal bajarilmadi.</p>
              ) : null}
            </form>
          </CardContent>
        </Card>

        <aside className="min-w-0 space-y-4">
          {designDocument ? (
            <InvitationDesignEditor
              invitationId={invitation.id}
              document={designDocument}
              data={previewData}
              onChange={setDesignDocument}
            />
          ) : (
            <InvitationPreview data={previewData} variant={invitation.templateId} />
          )}
        </aside>
      </div>
    </main>
  );
}
