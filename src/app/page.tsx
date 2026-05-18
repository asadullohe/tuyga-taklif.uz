import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle2, QrCode, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InvitationPreview } from "@/components/invitation-preview";
import { defaultWeddingData } from "@/lib/templates";

export default function HomePage() {
  return (
    <main>
      <header className="border-b bg-background/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold text-primary">
            tuyga-taklif.uz
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/login">Kirish</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/new">Taklifnoma yaratish</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1fr_430px]">
        <div>
          <Badge>
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            To'y taklifnomalari uchun MVP
          </Badge>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-normal text-foreground sm:text-6xl">
            To'yingiz uchun online taklifnomani bir necha daqiqada yarating.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Template tanlang, ma'lumotlarni forma orqali kiriting, o'ng tomonda live preview ko'ring va public linkni
            mehmonlarga yuboring.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/dashboard/new">
                Boshlash
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Telegram orqali kirish</Link>
            </Button>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              ["Live preview", CheckCircle2],
              ["RSVP", BarChart3],
              ["QR code", QrCode]
            ].map(([label, Icon]) => (
              <Card key={String(label)}>
                <CardContent className="flex items-center gap-3 p-4">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{String(label)}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="hidden lg:block">
          <InvitationPreview data={defaultWeddingData} />
        </div>
      </section>

      <section className="border-t bg-white/55 py-12">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 md:grid-cols-3">
          {[
            ["Template asosida", "Dastlab to'y kategoriyasi uchun tayyor dizaynlar."],
            ["Telegram auth", "Login Widget va Mini App oqimlari bitta session modelga ulanadi."],
            ["Admin panel", "Template, invitation va RSVP yozuvlarini boshqarish uchun."],
          ].map(([title, description]) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
