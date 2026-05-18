import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminTemplatesClient } from "@/app/admin/templates-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listAdminOverview } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export default async function AdminPage() {
  await requireAdmin();
  const overview = await listAdminOverview();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button asChild variant="ghost" className="-ml-3">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <h1 className="mt-2 text-3xl font-semibold">Admin panel</h1>
          <p className="text-sm text-muted-foreground">Template, taklifnoma va RSVP yozuvlari.</p>
        </div>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Metric title="Templatelar" value={overview.templates.length} />
        <Metric title="Taklifnomalar" value={overview.invitations.length} />
        <Metric title="RSVP" value={overview.rsvps.length} />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <AdminTemplatesClient templates={overview.templates} />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Oxirgi taklifnomalar</CardTitle>
              <CardDescription>So'nggi 100 ta yozuv ko'rsatiladi.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="border-b text-muted-foreground">
                  <tr>
                    <th className="py-2">Juftlik</th>
                    <th className="py-2">Template</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Slug</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.invitations.map((invitation) => (
                    <tr key={invitation.id} className="border-b">
                      <td className="py-3 font-medium">
                        {invitation.formData.groomName} va {invitation.formData.brideName}
                      </td>
                      <td className="py-3">{invitation.template?.name ?? invitation.templateId}</td>
                      <td className="py-3">
                        <Badge>{invitation.status}</Badge>
                      </td>
                      <td className="py-3">{invitation.slug ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>RSVP javoblari</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="border-b text-muted-foreground">
                  <tr>
                    <th className="py-2">Mehmon</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Soni</th>
                    <th className="py-2">Vaqt</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.rsvps.map((rsvp) => (
                    <tr key={rsvp.id} className="border-b">
                      <td className="py-3 font-medium">{rsvp.guestName}</td>
                      <td className="py-3">{rsvp.status}</td>
                      <td className="py-3">{rsvp.guestCount}</td>
                      <td className="py-3">{new Date(rsvp.createdAt).toLocaleString("uz-Latn-UZ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
