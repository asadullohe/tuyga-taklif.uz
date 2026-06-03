"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { rsvpSchema, type RsvpInput } from "@/lib/validations";

export function RsvpForm({ slug }: { slug: string }) {
  const form = useForm<RsvpInput>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      guestName: "",
      status: "attending",
      guestCount: 1
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: RsvpInput) => {
      const response = await fetch(`/api/public/invitations/${slug}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      if (!response.ok) throw new Error("RSVP yuborilmadi");
      return response.json();
    }
  });

  if (mutation.isSuccess) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 p-5">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <p className="font-medium">Javobingiz qabul qilindi.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kelishingizni belgilang</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <div className="space-y-2">
            <Label htmlFor="guestName">Ism</Label>
            <Input id="guestName" {...form.register("guestName")} placeholder="Ismingiz" />
            {form.formState.errors.guestName ? (
              <p className="text-sm text-destructive">{form.formState.errors.guestName.message}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm">
              <input type="radio" value="attending" {...form.register("status")} />
              Boraman
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm">
              <input type="radio" value="not_attending" {...form.register("status")} />
              Bora olmayman
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestCount">Mehmon soni</Label>
            <Input id="guestCount" type="number" min={0} max={10} {...form.register("guestCount")} />
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Yuborilmoqda..." : "Javob yuborish"}
          </Button>
          {mutation.isError ? <p className="text-sm text-destructive">Xatolik yuz berdi.</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
