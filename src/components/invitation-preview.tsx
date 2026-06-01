import type { CSSProperties } from "react";
import { CalendarDays, Clock, Heart, MapPin, Sparkles } from "lucide-react";
import type { WeddingFormData } from "@/types";
import { cn, formatDateTime, getUzDateParts } from "@/lib/utils";

type InvitationPreviewProps = {
  data: WeddingFormData;
  variant?: string;
  className?: string;
};

type InviteTheme = {
  id: string;
  label: string;
  accent: string;
  accentSoft: string;
  ink: string;
  muted: string;
  card: string;
  stage: string;
  border: string;
  shadow: string;
  particle: string;
  motif: string;
  frame: string;
  icon: "heart" | "sparkles";
};

const themes: Record<string, InviteTheme> = {
  "classic-rose": {
    id: "classic-rose",
    label: "Rose ceremony",
    accent: "#e8395a",
    accentSoft: "#fde7ec",
    ink: "#17172b",
    muted: "#777488",
    card: "linear-gradient(145deg, rgba(255,255,255,.98), rgba(255,247,250,.96))",
    stage:
      "linear-gradient(90deg, rgba(12,12,18,.78), rgba(28,20,24,.48), rgba(12,12,18,.78)), url('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=80')",
    border: "rgba(255,255,255,.72)",
    shadow: "0 28px 90px rgba(95, 12, 32, .34)",
    particle: "rgba(232,57,90,.32)",
    motif: "floating-hearts",
    frame: "rounded-[1.65rem]",
    icon: "heart"
  },
  "modern-minimal": {
    id: "modern-minimal",
    label: "Pure line",
    accent: "#0f766e",
    accentSoft: "#e7f6f1",
    ink: "#111827",
    muted: "#64748b",
    card: "linear-gradient(180deg, rgba(255,255,255,.98), rgba(248,250,252,.96))",
    stage: "linear-gradient(135deg, #f8fafc 0%, #e8f3ee 48%, #fff7ed 100%)",
    border: "rgba(15,118,110,.18)",
    shadow: "0 24px 80px rgba(15, 76, 70, .18)",
    particle: "rgba(15,118,110,.24)",
    motif: "line-rain",
    frame: "rounded-xl",
    icon: "sparkles"
  },
  "royal-emerald": {
    id: "royal-emerald",
    label: "Royal majlis",
    accent: "#d6a84f",
    accentSoft: "#f8edcf",
    ink: "#10261f",
    muted: "#66746c",
    card: "linear-gradient(145deg, rgba(255,253,247,.98), rgba(239,249,243,.96))",
    stage:
      "radial-gradient(circle at 20% 10%, rgba(214,168,79,.35), transparent 26%), linear-gradient(135deg, #06281f 0%, #114537 55%, #08231c 100%)",
    border: "rgba(214,168,79,.45)",
    shadow: "0 30px 95px rgba(3, 30, 24, .45)",
    particle: "rgba(214,168,79,.38)",
    motif: "gold-dust",
    frame: "rounded-[2rem]",
    icon: "sparkles"
  },
  "golden-noor": {
    id: "golden-noor",
    label: "Noor light",
    accent: "#b7791f",
    accentSoft: "#fff3d6",
    ink: "#2a1e0d",
    muted: "#806f54",
    card: "linear-gradient(160deg, rgba(255,252,241,.98), rgba(255,247,224,.95))",
    stage:
      "radial-gradient(circle at 50% 16%, rgba(255,214,128,.72), transparent 28%), linear-gradient(135deg, #22160b 0%, #8c5b1f 52%, #1f160f 100%)",
    border: "rgba(183,121,31,.28)",
    shadow: "0 30px 90px rgba(97, 55, 12, .38)",
    particle: "rgba(255,222,145,.46)",
    motif: "noor-rays",
    frame: "rounded-[1.35rem]",
    icon: "sparkles"
  },
  "pearl-blush": {
    id: "pearl-blush",
    label: "Pearl blush",
    accent: "#c45b7c",
    accentSoft: "#f9e8ee",
    ink: "#35242d",
    muted: "#7d6872",
    card: "linear-gradient(145deg, rgba(255,255,255,.98), rgba(255,244,247,.96))",
    stage:
      "radial-gradient(circle at 24% 25%, rgba(255,255,255,.8), transparent 18%), radial-gradient(circle at 78% 16%, rgba(244,180,196,.55), transparent 24%), linear-gradient(135deg, #f8e9ee 0%, #fffaf7 48%, #ecd4dc 100%)",
    border: "rgba(196,91,124,.20)",
    shadow: "0 28px 90px rgba(99, 54, 72, .22)",
    particle: "rgba(196,91,124,.26)",
    motif: "pearl-bubbles",
    frame: "rounded-[2.25rem]",
    icon: "heart"
  },
  "midnight-starry": {
    id: "midnight-starry",
    label: "Midnight vow",
    accent: "#f6c76f",
    accentSoft: "#263753",
    ink: "#f8fafc",
    muted: "#cbd5e1",
    card: "linear-gradient(160deg, rgba(12,23,42,.96), rgba(20,32,57,.94))",
    stage:
      "radial-gradient(circle at 20% 20%, rgba(246,199,111,.2), transparent 20%), linear-gradient(135deg, #020617 0%, #13213b 58%, #050815 100%)",
    border: "rgba(246,199,111,.24)",
    shadow: "0 32px 100px rgba(2, 6, 23, .55)",
    particle: "rgba(246,199,111,.52)",
    motif: "star-field",
    frame: "rounded-[1.75rem]",
    icon: "sparkles"
  },
  "garden-bloom": {
    id: "garden-bloom",
    label: "Garden bloom",
    accent: "#3f8f5f",
    accentSoft: "#e8f6e8",
    ink: "#183322",
    muted: "#637467",
    card: "linear-gradient(150deg, rgba(255,255,250,.98), rgba(240,250,239,.96))",
    stage:
      "radial-gradient(circle at 15% 12%, rgba(247,167,181,.34), transparent 22%), linear-gradient(135deg, #dcefdc 0%, #fff8ef 46%, #cfe9d6 100%)",
    border: "rgba(63,143,95,.22)",
    shadow: "0 28px 86px rgba(30, 94, 54, .24)",
    particle: "rgba(63,143,95,.34)",
    motif: "leaf-drift",
    frame: "rounded-[1.5rem]",
    icon: "heart"
  },
  "silk-lilac": {
    id: "silk-lilac",
    label: "Silk whisper",
    accent: "#8b5a83",
    accentSoft: "#f2e8f1",
    ink: "#2c2230",
    muted: "#766477",
    card: "linear-gradient(145deg, rgba(255,252,255,.98), rgba(246,238,247,.96))",
    stage:
      "linear-gradient(120deg, rgba(255,255,255,.72), transparent 38%), linear-gradient(135deg, #eadfeb 0%, #fffaf8 48%, #d9c3db 100%)",
    border: "rgba(139,90,131,.24)",
    shadow: "0 28px 88px rgba(73, 43, 80, .22)",
    particle: "rgba(139,90,131,.28)",
    motif: "silk-waves",
    frame: "rounded-[2rem]",
    icon: "sparkles"
  },
  "desert-saffron": {
    id: "desert-saffron",
    label: "Saffron dusk",
    accent: "#d97706",
    accentSoft: "#fff0d0",
    ink: "#35200f",
    muted: "#7a6047",
    card: "linear-gradient(150deg, rgba(255,251,240,.98), rgba(255,241,214,.96))",
    stage:
      "radial-gradient(circle at 70% 20%, rgba(255,202,107,.44), transparent 24%), linear-gradient(135deg, #5a2d0d 0%, #d19042 50%, #6a320f 100%)",
    border: "rgba(217,119,6,.24)",
    shadow: "0 30px 90px rgba(97, 50, 9, .36)",
    particle: "rgba(255,217,153,.42)",
    motif: "sand-lines",
    frame: "rounded-[1.3rem]",
    icon: "sparkles"
  },
  "ocean-glass": {
    id: "ocean-glass",
    label: "Ocean glass",
    accent: "#0e7490",
    accentSoft: "#ddf7fb",
    ink: "#07313c",
    muted: "#5c7780",
    card: "linear-gradient(145deg, rgba(255,255,255,.88), rgba(228,248,252,.78))",
    stage:
      "radial-gradient(circle at 30% 15%, rgba(255,255,255,.62), transparent 20%), linear-gradient(135deg, #083344 0%, #22a0b6 52%, #d8fbff 100%)",
    border: "rgba(255,255,255,.62)",
    shadow: "0 30px 90px rgba(8, 51, 68, .32)",
    particle: "rgba(209,250,254,.48)",
    motif: "glass-shimmer",
    frame: "rounded-[1.75rem]",
    icon: "heart"
  }
};

const fallbackTheme = themes["classic-rose"];

export function InvitationPreview({ data, variant = "classic-rose", className }: InvitationPreviewProps) {
  const theme = themes[variant] ?? fallbackTheme;
  const dateParts = data.eventDate ? getUzDateParts(data.eventDate) : null;
  const day = dateParts?.day ?? "21";
  const weekday = dateParts?.weekday ?? "yakshanba";
  const monthYear = dateParts ? `${dateParts.monthName} · ${dateParts.year}` : "iyun · 2026";
  const style = {
    "--invite-accent": theme.accent,
    "--invite-accent-soft": theme.accentSoft,
    "--invite-ink": theme.ink,
    "--invite-muted": theme.muted,
    "--invite-card": theme.card,
    "--invite-stage": theme.stage,
    "--invite-border": theme.border,
    "--invite-shadow": theme.shadow,
    "--invite-particle": theme.particle
  } as CSSProperties;

  return (
    <section
      className={cn(
        "invite-stage relative mx-auto w-full max-w-[560px] overflow-hidden rounded-lg p-4 shadow-2xl sm:p-8",
        `invite-theme-${theme.id}`,
        className
      )}
      style={style}
    >
      {data.coverImageUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(10,13,14,.76), rgba(25,20,19,.38), rgba(10,13,14,.76)), url(${data.coverImageUrl})`
          }}
        />
      ) : null}

      <DecorativeMotion motif={theme.motif} />

      <article
        className={cn(
          "invite-card relative mx-auto min-h-[720px] max-w-[430px] overflow-hidden border px-7 py-8 text-center sm:px-10",
          theme.frame
        )}
      >
        <div className="invite-seal absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg">
          {theme.icon === "heart" ? (
            <Heart className="h-6 w-6 fill-[var(--invite-accent)] text-[var(--invite-accent)]" />
          ) : (
            <Sparkles className="h-6 w-6 text-[var(--invite-accent)]" />
          )}
        </div>

        <div className="invite-content relative z-10">
          <p className="invite-reveal mt-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--invite-accent)]">
            Sizni hayotimizdagi eng baxtli kunga taklif qilamiz
          </p>
          <h1 className="invite-reveal wedding-script mt-5 text-6xl leading-none text-[var(--invite-ink)] sm:text-7xl">
            Bizning to'yimiz
          </h1>
          <p className="invite-reveal wedding-script mt-5 text-4xl leading-tight text-[var(--invite-ink)]">
            {data.groomName || "Kuyov"} <span className="text-[var(--invite-accent)]">&</span>{" "}
            {data.brideName || "Kelin"}
          </p>

          <div className="invite-divider invite-reveal mx-auto mt-10 flex max-w-[260px] items-center gap-3">
            <span />
            <b>{theme.label}</b>
            <span />
          </div>

          <div className="invite-reveal mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--invite-muted)]">
            <span>{weekday}</span>
            <span className="wedding-script text-5xl font-normal tracking-normal text-[var(--invite-accent)]">
              {day}
            </span>
            <span>{data.eventTime ? `Soat ${data.eventTime}` : "Soat 18:00"}</span>
          </div>
          <p className="invite-reveal mt-2 text-xs font-semibold uppercase tracking-[0.32em] text-[var(--invite-muted)]">
            {monthYear}
          </p>

          <div className="invite-reveal mt-8 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--invite-accent)]">
            <Clock className="h-4 w-4" />
            Bizning unutilmas kunimizgacha
          </div>
          <div className="invite-reveal mt-4 grid grid-cols-4 gap-2">
            {[
              ["34", "Kun"],
              ["02", "Soat"],
              ["35", "Daqiqa"],
              ["00", "Soniya"]
            ].map(([value, label]) => (
              <div key={label} className="invite-count rounded-md px-2 py-3">
                <p className="wedding-script text-3xl leading-none text-[var(--invite-accent)]">{value}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--invite-muted)]">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="invite-reveal mt-9 space-y-2">
            <p className="text-2xl leading-none text-[var(--invite-ink)]" dir="rtl">
              وَخَلَقْنَاكُمْ أَزْوَاجًا
            </p>
            <p className="font-serif text-sm italic text-[var(--invite-muted)]">
              Biz sizlarni juft-juft qilib yaratdik
            </p>
          </div>

          <p className="invite-reveal mx-auto mt-7 max-w-xs text-sm leading-7 text-[var(--invite-muted)]">
            {data.hostText}
          </p>

          <div className="invite-reveal mt-7 rounded-lg border bg-white/60 p-4 text-left backdrop-blur">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--invite-accent)]" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--invite-muted)]">Manzil</p>
                <p className="mt-1 font-semibold text-[var(--invite-ink)]">{data.venueName || "To'yxona"}</p>
                <p className="mt-1 text-sm text-[var(--invite-muted)]">{data.venueAddress || "Manzil"}</p>
              </div>
            </div>
          </div>

          <div className="invite-reveal mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--invite-accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg">
            <MapPin className="h-4 w-4" />
            Manzil joylashuvini ochish
          </div>

          <div className="invite-reveal mt-7 flex items-center justify-center gap-2 text-xs text-[var(--invite-muted)]">
            <CalendarDays className="h-4 w-4" />
            {formatDateTime(data.eventDate, data.eventTime) || "Sana tanlanmagan"}
          </div>
        </div>
      </article>
    </section>
  );
}

function DecorativeMotion({ motif }: { motif: string }) {
  return (
    <div className={cn("invite-motion pointer-events-none absolute inset-0 overflow-hidden", motif)}>
      {Array.from({ length: 16 }).map((_, index) => (
        <span
          key={index}
          className="invite-particle absolute"
          style={{
            left: `${6 + ((index * 19) % 92)}%`,
            top: `${8 + ((index * 13) % 78)}%`,
            animationDelay: `${index * 0.35}s`,
            animationDuration: `${6 + (index % 5)}s`
          }}
        />
      ))}
    </div>
  );
}
