import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BarChart3, CheckCircle2, QrCode, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InvitationPreview } from "@/components/invitation-preview";
import { defaultWeddingData } from "@/lib/templates";

export default function HomePage() {
  return (
    <>
      <AppHeader />
      <main>
        <section className="mx-auto grid min-h-[calc(100vh-65px)] max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1fr_430px]">
          <div>
            <Image
              src="/taklifnoma-stacked-transparent.svg"
              alt=""
              width={96}
              height={96}
              className="mb-4 h-20 w-20"
            />
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
          <div className="mx-auto max-w-6xl px-4">
            <Image
              src="/taklifnoma-footer-dark-transparent.svg"
              alt="Taklifnoma"
              width={220}
              height={54}
              className="mb-6 h-12 w-auto opacity-90"
            />
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["Template asosida", "Dastlab to'y kategoriyasi uchun tayyor dizaynlar."],
                ["Telegram auth", "Login Widget va Mini App oqimlari bitta session modelga ulanadi."],
                ["Admin panel", "Template, invitation va RSVP yozuvlarini boshqarish uchun."]
              ].map(([title, description]) => (
                <Card key={title}>
                  <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
