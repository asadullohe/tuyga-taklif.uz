import Link from "next/link";
import {
  CalendarDays,
  ExternalLink,
  FilePenLine,
  GalleryVerticalEnd,
  MapPin,
  Plus,
  Shield,
  Sparkles,
  TimerReset
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listUserInvitations } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { cn, formatDateTime } from "@/lib/utils";
import type { AppUser, Invitation } from "@/types";

export default async function DashboardPage() {
  const user = await requireUser();
  const invitations = await listUserInvitations(user.id);
  const publishedCount = invitations.filter((invitation) => invitation.status === "published").length;
  const draftCount = invitations.length - publishedCount;
  const latestInvitation = invitations[0];

  return (
    <main className="min-h-screen bg-[#f6f4ef] text-slate-950">
      <DashboardHeader user={user} />

      <section className="border-b border-emerald-950/10 bg-[#12382f] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-50">
              <Sparkles className="h-4 w-4 text-[#ffb86b]" />
              Ijod paneli
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-normal sm:text-5xl">
              Salom, {user.firstName}. Taklifnomalar nazoratda.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50/75">
              Draft, publish va public linklar bitta joyda. Har bir taklifnoma holati tez ko‘rinadi.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-lg border border-white/15 bg-white/10 p-2 backdrop-blur">
            <StatTile label="Jami" value={invitations.length} />
            <StatTile label="Published" value={publishedCount} />
            <StatTile label="Draft" value={draftCount} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">Taklifnomalar</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-normal">Mening loyihalarim</h2>
              </div>
              <Button asChild>
                <Link href="/dashboard/new">
                  <Plus className="h-4 w-4" />
                  Yangi taklifnoma
                </Link>
              </Button>
            </div>

            {invitations.length === 0 ? <EmptyState /> : null}

            <div className="grid gap-3">
              {invitations.map((invitation) => (
                <InvitationRow key={invitation.id} invitation={invitation} />
              ))}
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-5 lg:self-start">
            <Card className="overflow-hidden border-emerald-950/10 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Profil</p>
                    <h3 className="mt-2 text-lg font-semibold">{user.firstName}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {user.username ? `@${user.username}` : user.role === "admin" ? "Admin" : "User"}
                    </p>
                  </div>
                  <UserAvatar user={user} />
                </div>

                <div className="mt-5 grid gap-2">
                  {user.role === "admin" ? (
                    <Button asChild variant="outline" className="justify-between">
                      <Link href="/admin">
                        <span className="inline-flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Admin panel
                        </span>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : null}
                  <Button asChild variant="outline" className="justify-between">
                    <Link href="/dashboard/new">
                      <span className="inline-flex items-center gap-2">
                        <GalleryVerticalEnd className="h-4 w-4" />
                        Template tanlash
                      </span>
                      <Plus className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-950/10 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#12382f] text-white">
                    <TimerReset className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Oxirgi ish</p>
                    <p className="text-sm text-slate-500">
                      {latestInvitation
                        ? `${latestInvitation.formData.groomName} va ${latestInvitation.formData.brideName}`
                        : "Hali loyiha yo‘q"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </section>
      </div>
    </main>
  );
}

function DashboardHeader({ user }: { user: AppUser }) {
  return (
    <header className="border-b border-emerald-950/10 bg-[#fdfbf7]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-base font-semibold text-[#12382f]">
          tuyga-taklif.uz
        </Link>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-slate-500 sm:inline">{user.firstName}</span>
          <Button asChild size="sm">
            <Link href="/dashboard/new">
              <Plus className="h-4 w-4" />
              Yangi
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-white/10 p-4">
      <p className="text-xs font-medium text-emerald-50/70">{label}</p>
      <p className="mt-2 text-3xl font-semibold leading-none">{value}</p>
    </div>
  );
}

function InvitationRow({ invitation }: { invitation: Invitation }) {
  const isPublished = invitation.status === "published";
  const formattedDate = formatDateTime(invitation.formData.eventDate, invitation.formData.eventTime);

  return (
    <Card className="group overflow-hidden border-emerald-950/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={invitation.status} />
            <span className="text-xs font-medium text-slate-500">{invitation.template?.name ?? "Template"}</span>
          </div>
          <h3 className="mt-3 text-2xl font-semibold tracking-normal text-slate-950">
            {invitation.formData.groomName} va {invitation.formData.brideName}
          </h3>
          <div className="mt-3 grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
            <div className="flex min-w-0 items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-rose-500" />
              <span className="truncate">{formattedDate || "Sana tanlanmagan"}</span>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-emerald-700" />
              <span className="truncate">{invitation.formData.venueName || "To‘yxona"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 md:justify-end">
          {isPublished && invitation.slug ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/a/${invitation.slug}`}>
                <ExternalLink className="h-4 w-4" />
                Ochish
              </Link>
            </Button>
          ) : null}
          <Button asChild size="sm">
            <Link href={`/dashboard/${invitation.id}/edit`}>
              <FilePenLine className="h-4 w-4" />
              Tahrirlash
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: Invitation["status"] }) {
  return (
    <Badge
      className={cn(
        "uppercase tracking-[0.14em]",
        status === "published"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-800"
      )}
    >
      {status}
    </Badge>
  );
}

function EmptyState() {
  return (
    <Card className="border-dashed border-emerald-950/20 bg-white shadow-sm">
      <CardContent className="flex flex-col items-center px-5 py-14 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-md bg-[#12382f] text-white">
          <Sparkles className="h-7 w-7" />
        </div>
        <h3 className="mt-5 text-xl font-semibold">Hali taklifnoma yo‘q</h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
          Birinchi to‘y sahifasini yarating, keyin public link va holat shu yerda chiqadi.
        </p>
        <Button asChild className="mt-5">
          <Link href="/dashboard/new">
            <Plus className="h-4 w-4" />
            Boshlash
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function UserAvatar({ user }: { user: AppUser }) {
  return (
    <div
      aria-label={user.firstName}
      className="flex h-12 w-12 items-center justify-center rounded-md bg-[#12382f] text-lg font-semibold text-white"
    >
      {user.firstName.slice(0, 1).toUpperCase()}
    </div>
  );
}
