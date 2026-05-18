"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareButton({ slug, url }: { slug: string; url: string }) {
  async function share() {
    await fetch(`/api/public/invitations/${slug}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "share_clicked" })
    }).catch(() => null);

    if (navigator.share) {
      await navigator.share({ title: "To'y taklifnomasi", url });
      return;
    }

    await navigator.clipboard.writeText(url);
  }

  return (
    <Button type="button" onClick={share}>
      <Send className="h-4 w-4" />
      Ulashish
    </Button>
  );
}
