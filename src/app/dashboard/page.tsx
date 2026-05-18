import Link from "next/link";
import { CalendarDays, ExternalLink, Heart, MapPin, Plus, Shield, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listUserInvitations } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await requireUser();
  const invitations = await listUserInvitations(user.id);
  const publishedCount = invitations.filter((invitation) => invitation.status === "published").length;
  const draftCount = invitations.length - publishedCount;

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#fff8f5_0%,#f7fbf8_48%,#fff1f5_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <section className="relative overflow-hidden rounded-lg border bg-white/80 p-6 shadow-sm sm:p-8">
          <div className="absolute right-8 top-6 hidden h-32 w-32 rounded-full border border-rose-100 bg-rose-50/60 sm:block" />
          <div className="absolute -bottom-10 right-28 hidden h-28 w-28 rounded-full border border-emerald-100 bg-emerald-50/70 sm:block" />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-600">
                <Sparkles className="h-4 w-4" />
                Bugungi ijod paneli
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
                Salom, {user.firstName}. Taklifnomalaringiz tayyorlanmoqda.
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                Template tanlang, formani to'ldiring, live preview orqali ko'ring va mehmonlarga chiroyli link yuboring.
              </p>
            </div>
            <div className="flex gap-2">
              {user.role === "admin" ? (
                <Button asChild variant="outline">
                  <Link href="/admin">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              ) : null}
              <Button asChild size="lg">
                <Link href="/dashboard/new">
                  <Plus className="h-4 w-4" />
                  Yangi taklifnoma
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <MetricCard label="Jami taklifnoma" value={invitations.length} icon={<Heart className="h-5 w-5" />} />
          <MetricCard label="Published" value={publishedCount} icon={<ExternalLink className="h-5 w-5" />} />
          <MetricCard label="Draft" value={draftCount} icon={<CalendarDays className="h-5 w-5" />} />
        </section>

        <div className="mt-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Mening taklifnomalarim</h2>
            <p className="text-sm text-muted-foreground">Har bir karta bitta to'y taklifnomasi oqimini bildiradi.</p>
          </div>
        </div>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        {invitations.length === 0 ? (
          <Card className="lg:col-span-2">
            <CardHeader className="items-center py-12 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                <Heart className="h-7 w-7" />
              </div>
              <CardTitle>Hali taklifnoma yo'q</CardTitle>
              <CardDescription>Template tanlab birinchi to'y taklifnomangizni yarating.</CardDescription>
              <Button asChild className="mt-4">
                <Link href="/dashboard/new">Boshlash</Link>
              </Button>
            </CardHeader>
          </Card>
        ) : null}

        {invitations.map((invitation) => (
          <Card key={invitation.id} className="overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-500" />
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">Nikoh to'yi</p>
                  <h3 className="wedding-script mt-2 text-4xl leading-none text-slate-950">
                    {invitation.formData.groomName} & {invitation.formData.brideName}
                  </h3>
                </div>
                <Badge>{invitation.status}</Badge>
              </div>

              <div className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="flex gap-2 rounded-md bg-muted/55 p-3">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span>
                    {invitation.formData.eventDate} · {invitation.formData.eventTime}
                  </span>
                </div>
                <div className="flex gap-2 rounded-md bg-muted/55 p-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{invitation.formData.venueName}</span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{invitation.template?.name ?? "Template"}</span>
                </div>
                <div className="flex gap-2">
                  {invitation.slug ? (
                    <Button asChild variant="outline">
                      <Link href={`/a/${invitation.slug}`}>
                        <ExternalLink className="h-4 w-4" />
                        Ochish
                      </Link>
                    </Button>
                  ) : null}
                  <Button asChild>
                    <Link href={`/dashboard/${invitation.id}/edit`}>Tahrirlash</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card className="bg-white/80">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-semibold">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">{icon}</div>
      </CardContent>
    </Card>
  );
}
