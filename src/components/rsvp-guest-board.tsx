"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Search, UserCheck, UserX, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Rsvp, RsvpStatus } from "@/types";

type RsvpPayload = {
  rsvps: Rsvp[];
  stats: {
    total: number;
    attending: number;
    notAttending: number;
    guests: number;
  };
};

type Filter = "all" | RsvpStatus;

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "Hammasi" },
  { value: "attending", label: "Kelaman" },
  { value: "not_attending", label: "Kelmayman" }
];

const emptyRsvps: Rsvp[] = [];

export function RsvpGuestBoard({ slug }: { slug: string }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-rsvps", slug],
    queryFn: async () => {
      const response = await fetch(`/api/public/invitations/${slug}/rsvp`, { cache: "no-store" });
      if (!response.ok) throw new Error("RSVP list olinmadi");
      return (await response.json()) as RsvpPayload;
    },
    refetchInterval: 15000
  });

  const rsvps = data?.rsvps ?? emptyRsvps;
  const stats = data?.stats ?? { total: 0, attending: 0, notAttending: 0, guests: 0 };

  const filteredRsvps = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rsvps.filter((rsvp) => {
      const matchesStatus = filter === "all" || rsvp.status === filter;
      const matchesQuery = normalizedQuery.length === 0 || rsvp.guestName.toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [filter, query, rsvps]);

  return (
    <Card className="overflow-hidden border-primary/15 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(241,246,241,0.92))] shadow-xl shadow-primary/5">
      <CardHeader className="border-b bg-[radial-gradient(circle_at_10%_0%,rgba(31,122,102,0.14),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.82),rgba(244,238,228,0.7))]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-primary/70">Mehmonlar javobi</p>
            <CardTitle className="mt-2 text-xl">So'rovnoma ro'yxati</CardTitle>
          </div>
          <Badge className="rounded-full bg-primary px-3 py-1 text-primary-foreground">{stats.total} javob</Badge>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Metric icon={<UserCheck className="h-4 w-4" />} label="Kelaman" value={stats.attending} />
          <Metric icon={<UserX className="h-4 w-4" />} label="Kelmayman" value={stats.notAttending} />
          <Metric icon={<Users className="h-4 w-4" />} label="Mehmon" value={stats.guests} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <div className="flex rounded-full border bg-background/70 p-1">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={cn(
                "h-9 flex-1 rounded-full text-xs font-semibold transition",
                filter === item.value ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="rounded-full pl-9"
            placeholder="Ism bo'yicha qidirish"
          />
        </label>

        <div className="max-h-[360px] space-y-2 overflow-auto pr-1">
          {isLoading ? (
            <StateText text="Javoblar yuklanmoqda..." />
          ) : isError ? (
            <StateText text="Ro'yxatni olib bo'lmadi." />
          ) : filteredRsvps.length === 0 ? (
            <StateText text="Bu filterda javob yo'q." />
          ) : (
            filteredRsvps.map((rsvp) => <RsvpRow key={rsvp.id} rsvp={rsvp} />)
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-white/70 p-3 shadow-sm">
      <div className="flex items-center gap-2 text-primary">{icon}<span className="text-lg font-bold">{value}</span></div>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
    </div>
  );
}

function RsvpRow({ rsvp }: { rsvp: Rsvp }) {
  const attending = rsvp.status === "attending";
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border bg-white/75 p-3 shadow-sm">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{rsvp.guestName}</p>
        <p className="mt-1 text-xs text-muted-foreground">{new Date(rsvp.createdAt).toLocaleString("uz-Latn-UZ")}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {rsvp.reminderEnabled ? (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-sky-100 text-sky-700" title="Eslatma yoqilgan">
            <Bell className="h-3.5 w-3.5" />
          </span>
        ) : null}
        {attending ? <Badge className="bg-emerald-100 text-emerald-800">Kelaman</Badge> : <Badge className="bg-rose-100 text-rose-800">Kelmayman</Badge>}
        {attending ? <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold">{rsvp.guestCount}</span> : null}
      </div>
    </div>
  );
}

function StateText({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed bg-muted/30 p-5 text-center text-sm text-muted-foreground">{text}</div>;
}
