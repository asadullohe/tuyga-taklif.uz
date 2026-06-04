"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { rsvpSchema, type RsvpInput } from "@/lib/validations";

export function RsvpForm({ slug }: { slug: string }) {
  const queryClient = useQueryClient();
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  const form = useForm<RsvpInput>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      guestName: "",
      status: "attending",
      guestCount: 1,
      reminderEnabled: false
    }
  });
  const status = form.watch("status");
  const reminderEnabled = form.watch("reminderEnabled");

  type RsvpResponse = {
    reminder?: {
      link: string;
      status: "pending_bot_link";
    } | null;
  };

  const mutation = useMutation({
    mutationFn: async (values: RsvpInput) => {
      const response = await fetch(`/api/public/invitations/${slug}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });
      if (!response.ok) throw new Error("RSVP yuborilmadi");
      return response.json() as Promise<RsvpResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-rsvps", slug] });
    }
  });

  if (mutation.isSuccess) {
    const reminderLink = mutation.data?.reminder?.link;

    return (
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <p className="font-medium">Javobingiz qabul qilindi.</p>
          </div>
          {reminderLink ? (
            <div className="rounded-xl border bg-muted/25 p-4">
              <p className="text-sm font-semibold">Eslatmani Telegramda ulang</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Tugmani bosing va botda <b>Start</b> qiling. Chat ID avtomatik ulanadi.
              </p>
              <Button asChild className="mt-3 w-full">
                <a href={reminderLink} target="_blank" rel="noopener noreferrer">
                  <Bell className="h-4 w-4" />
                  Telegramda eslatmani ulash
                </a>
              </Button>
            </div>
          ) : null}
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

          {status === "attending" ? (
            <div className="rounded-2xl border bg-muted/20 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input className="mt-1" type="checkbox" {...form.register("reminderEnabled")} />
                <span>
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Bell className="h-4 w-4 text-primary" />
                    To'ydan oldin Telegramda eslatma olaymi?
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    Javob yuborgandan keyin botni ochib eslatmani ulaysiz.
                  </span>
                </span>
              </label>

              {reminderEnabled ? (
                <div className="mt-3 rounded-xl border bg-background/70 p-3 text-xs leading-5 text-muted-foreground">
                  {botUsername ? (
                    <p>
                      RSVP saqlangandan keyin maxsus Telegram tugmasi chiqadi. Bot chatni o'zi taniydi.
                    </p>
                  ) : (
                    <p>Bot username sozlanmagan, shuning uchun eslatma linki hozir chiqmaydi.</p>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Yuborilmoqda..." : "Javob yuborish"}
          </Button>
          {mutation.isError ? <p className="text-sm text-destructive">Xatolik yuz berdi.</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
