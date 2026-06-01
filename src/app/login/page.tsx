import Link from "next/link";
import { LoginClient } from "@/app/login/login-client";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(244,114,182,0.18),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(20,184,166,0.18),transparent_24%),linear-gradient(135deg,#fffaf4_0%,#f6fbf8_52%,#fff1f5_100%)] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col">
        <Link href="/" className="w-fit text-sm font-semibold text-primary">
          tuyga-taklif.uz
        </Link>
        <div className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_440px]">
          <section className="hidden lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-500">Telegram auth</p>
            <h1 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.03] tracking-normal text-slate-950">
              Taklifnoma kabinetiga xavfsiz kirish.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-8 text-slate-600">
              Web Login uchun bot domeni BotFather’da ruxsat qilinadi. Telegram ichida ochilganda Mini App initData
              orqali sessiya avtomatik tasdiqlanadi.
            </p>
          </section>
          <LoginClient botUsername={botUsername} initialError={error} />
        </div>
      </div>
    </main>
  );
}
