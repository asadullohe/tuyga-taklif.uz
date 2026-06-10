"use client";

import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import { LockKeyhole, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VenuePicker } from "@/components/venue-picker";
import { findVenueOption } from "@/lib/venues";
import type { WeddingFormInput } from "@/lib/validations";
import type { TemplateField } from "@/types";
import { cn } from "@/lib/utils";

type TemplateFormFieldsProps = {
  form: UseFormReturn<WeddingFormInput>;
  fields: TemplateField[];
  className?: string;
};

const venueFieldNames = new Set<TemplateField["name"]>(["venueName", "venueAddress"]);

const builtInLockedElements = ["Layout", "Tipografiya", "Animatsiya", "Ornament"];

export function TemplateFormFields({ form, fields, className }: TemplateFormFieldsProps) {
  const previewData = form.watch();
  const selectedVenue = findVenueOption(previewData.venueName, previewData.venueAddress);
  const hasVenuePicker = fields.some((field) => venueFieldNames.has(field.name));
  const customFields = fields.filter((field) => !venueFieldNames.has(field.name));

  return (
    <div className={cn("space-y-5", className)}>
      <div className="rounded-lg border border-emerald-950/10 bg-[#f8f4ec] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <SlidersHorizontal className="h-4 w-4 text-emerald-700" />
              User o'zgartira oladigan joylar
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Template dizayni saqlanadi, faqat schema ichidagi maydonlar tahrirlanadi.
            </p>
          </div>
          <Badge className="bg-emerald-50 text-emerald-700">{fields.length} ta maydon</Badge>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {fields.map((field) => (
            <span
              key={field.name}
              className="rounded-md border border-emerald-950/10 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700"
            >
              {field.label}
            </span>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
          <LockKeyhole className="h-3.5 w-3.5" />
          {builtInLockedElements.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {customFields.map((field) => (
          <TemplateFieldControl key={field.name} field={field} form={form} />
        ))}

        {hasVenuePicker ? (
          <>
            <VenuePicker
              selectedId={selectedVenue?.id}
              onSelect={(venue) => {
                form.setValue("venueName", venue.name, { shouldDirty: true, shouldValidate: true });
                form.setValue("venueAddress", venue.address, { shouldDirty: true, shouldValidate: true });
              }}
            />
            <div className="rounded-lg border border-emerald-950/10 bg-muted/20 p-4 text-sm leading-6 text-muted-foreground md:col-span-2">
              Tanlangan manzil: <span className="font-semibold text-foreground">{previewData.venueName}</span> ·{" "}
              {previewData.venueAddress}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function TemplateFieldControl({ field, form }: { field: TemplateField; form: UseFormReturn<WeddingFormInput> }) {
  const error = form.formState.errors[field.name]?.message;
  const isWide = field.type === "textarea" || field.name === "hostText" || field.name === "musicUrl";

  return (
    <Field label={field.label} error={typeof error === "string" ? error : undefined} className={isWide ? "md:col-span-2" : undefined}>
      {field.type === "textarea" ? (
        <Textarea placeholder={field.placeholder} {...form.register(field.name)} />
      ) : (
        <Input type={field.type === "url" ? "url" : field.type} placeholder={field.placeholder} {...form.register(field.name)} />
      )}
    </Field>
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
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
