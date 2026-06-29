import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { CalendarDays, Clock, Heart, MapPin, Sparkles } from "lucide-react";
import { TemplateDocumentPreview } from "@/components/template-canvas";
import type { TemplateDocument, WeddingFormData } from "@/types";
import { getCalendarModel, getMomentoText } from "@/lib/momento-light";
import { cn, formatDateTime, getUzDateParts } from "@/lib/utils";

type InvitationPreviewProps = {
  data: WeddingFormData;
  variant?: string;
  designDocument?: TemplateDocument | null;
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
  layout: keyof typeof layouts;
  shellClassName?: string;
};

type PreviewModel = {
  data: WeddingFormData;
  theme: InviteTheme;
  day: string;
  weekday: string;
  monthYear: string;
  time: string;
  formattedDate: string;
  names: string;
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
    layout: "rose"
  },
  "photo-collage": {
    id: "photo-collage",
    label: "Editorial collage",
    accent: "#b88945",
    accentSoft: "#f7ead8",
    ink: "#2d241a",
    muted: "#766a5d",
    card: "linear-gradient(180deg, #fffaf2, #f2e4d1)",
    stage:
      "linear-gradient(135deg, #221910 0%, #8c6c47 52%, #f8ead8 100%)",
    border: "rgba(184,137,69,.30)",
    shadow: "0 30px 90px rgba(66, 46, 25, .34)",
    particle: "rgba(255,246,232,.72)",
    motif: "collage-dust",
    layout: "collage",
    shellClassName: "aspect-square"
  },
  "blue-ink-a4": {
    id: "blue-ink-a4",
    label: "Blue ink",
    accent: "#2f6fba",
    accentSoft: "#e8f0fb",
    ink: "#121722",
    muted: "#647083",
    card: "linear-gradient(180deg, #ffffff, #f4f8ff)",
    stage:
      "linear-gradient(135deg, #111827 0%, #1d4774 48%, #f5f8ff 100%)",
    border: "rgba(47,111,186,.22)",
    shadow: "0 30px 90px rgba(17, 39, 72, .34)",
    particle: "rgba(47,111,186,.28)",
    motif: "blue-ink-sprigs",
    layout: "blueInk"
  },
  "gallery-collage": {
    id: "gallery-collage",
    label: "Gallery collage",
    accent: "#9f6b32",
    accentSoft: "#f3e0c8",
    ink: "#261c16",
    muted: "#7a6758",
    card: "linear-gradient(150deg, rgba(255,253,247,.98), rgba(239,226,210,.96))",
    stage:
      "radial-gradient(circle at 22% 18%, rgba(255,255,255,.72), transparent 22%), linear-gradient(135deg, #6e4b2c 0%, #e9d2b2 46%, #fffaf4 100%)",
    border: "rgba(159,107,50,.28)",
    shadow: "0 30px 90px rgba(78, 49, 24, .28)",
    particle: "rgba(159,107,50,.28)",
    motif: "collage-dust",
    layout: "gallery"
  },
  "modern-minimal": {
    id: "modern-minimal",
    label: "Pure line",
    accent: "#111111",
    accentSoft: "#ece8de",
    ink: "#111111",
    muted: "#6f6a62",
    card: "linear-gradient(180deg, #fffdf8, #f3eee4)",
    stage: "linear-gradient(135deg, #101010 0%, #2a251f 46%, #e9dfd0 100%)",
    border: "rgba(17,17,17,.16)",
    shadow: "0 28px 80px rgba(17, 17, 17, .24)",
    particle: "rgba(255,255,255,.24)",
    motif: "line-rain",
    layout: "minimal"
  },
  "royal-emerald": {
    id: "royal-emerald",
    label: "Royal majlis",
    accent: "#d7b46a",
    accentSoft: "#f7edd2",
    ink: "#0d261d",
    muted: "#66766d",
    card: "linear-gradient(145deg, #fffaf0, #edf6ef)",
    stage:
      "radial-gradient(circle at 20% 10%, rgba(214,168,79,.35), transparent 26%), linear-gradient(135deg, #06281f 0%, #114537 55%, #08231c 100%)",
    border: "rgba(214,168,79,.45)",
    shadow: "0 30px 95px rgba(3, 30, 24, .45)",
    particle: "rgba(214,168,79,.38)",
    motif: "gold-dust",
    layout: "royal"
  },
  "golden-noor": {
    id: "golden-noor",
    label: "Noor light",
    accent: "#bd8126",
    accentSoft: "#fff0c9",
    ink: "#2b1d0d",
    muted: "#7c684e",
    card: "linear-gradient(160deg, #fffdf4, #f6e7c7)",
    stage:
      "radial-gradient(circle at 50% 16%, rgba(255,214,128,.72), transparent 28%), linear-gradient(135deg, #22160b 0%, #8c5b1f 52%, #1f160f 100%)",
    border: "rgba(183,121,31,.28)",
    shadow: "0 30px 90px rgba(97, 55, 12, .38)",
    particle: "rgba(255,222,145,.46)",
    motif: "noor-rays",
    layout: "noor"
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
    layout: "pearl"
  },
  "midnight-starry": {
    id: "midnight-starry",
    label: "Midnight vow",
    accent: "#f0c36f",
    accentSoft: "#1e2d49",
    ink: "#f8fafc",
    muted: "#cbd5e1",
    card: "linear-gradient(160deg, rgba(7,12,24,.98), rgba(20,31,52,.96))",
    stage:
      "radial-gradient(circle at 20% 20%, rgba(246,199,111,.2), transparent 20%), linear-gradient(135deg, #020617 0%, #13213b 58%, #050815 100%)",
    border: "rgba(246,199,111,.24)",
    shadow: "0 32px 100px rgba(2, 6, 23, .55)",
    particle: "rgba(246,199,111,.52)",
    motif: "star-field",
    layout: "midnight"
  },
  "garden-bloom": {
    id: "garden-bloom",
    label: "Garden bloom",
    accent: "#3f7b55",
    accentSoft: "#e8f1e5",
    ink: "#1f2f24",
    muted: "#657166",
    card: "linear-gradient(150deg, #fffdf6, #eef5eb)",
    stage:
      "radial-gradient(circle at 15% 12%, rgba(247,167,181,.34), transparent 22%), linear-gradient(135deg, #dcefdc 0%, #fff8ef 46%, #cfe9d6 100%)",
    border: "rgba(63,143,95,.22)",
    shadow: "0 28px 86px rgba(30, 94, 54, .24)",
    particle: "rgba(63,143,95,.34)",
    motif: "leaf-drift",
    layout: "garden"
  },
  "silk-lilac": {
    id: "silk-lilac",
    label: "Silk whisper",
    accent: "#8a617f",
    accentSoft: "#f0e6ee",
    ink: "#2b2230",
    muted: "#786b78",
    card: "linear-gradient(145deg, #fffafc, #efe4ee)",
    stage:
      "linear-gradient(120deg, rgba(255,255,255,.72), transparent 38%), linear-gradient(135deg, #eadfeb 0%, #fffaf8 48%, #d9c3db 100%)",
    border: "rgba(139,90,131,.24)",
    shadow: "0 28px 88px rgba(73, 43, 80, .22)",
    particle: "rgba(139,90,131,.28)",
    motif: "silk-waves",
    layout: "silk"
  },
  "desert-saffron": {
    id: "desert-saffron",
    label: "Saffron dusk",
    accent: "#c86b2f",
    accentSoft: "#f7dfc9",
    ink: "#331d12",
    muted: "#795d4d",
    card: "linear-gradient(150deg, #fff8ee, #f4dcc5)",
    stage:
      "radial-gradient(circle at 70% 20%, rgba(255,202,107,.44), transparent 24%), linear-gradient(135deg, #5a2d0d 0%, #d19042 50%, #6a320f 100%)",
    border: "rgba(217,119,6,.24)",
    shadow: "0 30px 90px rgba(97, 50, 9, .36)",
    particle: "rgba(255,217,153,.42)",
    motif: "sand-lines",
    layout: "desert"
  },
  "ocean-glass": {
    id: "ocean-glass",
    label: "Ocean glass",
    accent: "#167c89",
    accentSoft: "#dff4f5",
    ink: "#07323a",
    muted: "#5d7579",
    card: "linear-gradient(145deg, rgba(255,255,255,.9), rgba(221,244,246,.82))",
    stage:
      "radial-gradient(circle at 30% 15%, rgba(255,255,255,.62), transparent 20%), linear-gradient(135deg, #083344 0%, #22a0b6 52%, #d8fbff 100%)",
    border: "rgba(255,255,255,.62)",
    shadow: "0 30px 90px rgba(8, 51, 68, .32)",
    particle: "rgba(209,250,254,.48)",
    motif: "glass-shimmer",
    layout: "ocean"
  },
  "velvet-ruby": {
    id: "velvet-ruby",
    label: "Velvet lights",
    accent: "#d8aa58",
    accentSoft: "#f6e3bd",
    ink: "#fff8ee",
    muted: "#f4d6bc",
    card: "linear-gradient(160deg, rgba(87,10,23,.98), rgba(31,7,14,.97))",
    stage:
      "radial-gradient(circle at 50% 8%, rgba(255,210,128,.38), transparent 24%), linear-gradient(135deg, #2a0610 0%, #8f1730 50%, #1b0710 100%)",
    border: "rgba(216,170,88,.42)",
    shadow: "0 34px 100px rgba(54, 4, 17, .54)",
    particle: "rgba(255,218,143,.46)",
    motif: "velvet-sparks",
    layout: "velvet"
  }
};

const fallbackTheme = themes["classic-rose"];

const countdown = [
  ["34", "Kun"],
  ["02", "Soat"],
  ["35", "Daqiqa"],
  ["00", "Soniya"]
];

export function InvitationPreview({
  data,
  variant = "classic-rose",
  designDocument,
  className
}: InvitationPreviewProps) {
  if (designDocument) {
    return <TemplateDocumentPreview document={designDocument} data={data} className={className} />;
  }

  if (variant === "momento-light") {
    return <MomentoLightPreview data={data} className={className} />;
  }

  const theme = themes[variant] ?? fallbackTheme;
  const dateParts = data.eventDate ? getUzDateParts(data.eventDate) : null;
  const model: PreviewModel = {
    data,
    theme,
    day: dateParts?.day ?? "21",
    weekday: dateParts?.weekday ?? "yakshanba",
    monthYear: dateParts ? `${dateParts.monthName} · ${dateParts.year}` : "iyun · 2026",
    time: data.eventTime ? `Soat ${data.eventTime}` : "Soat 18:00",
    formattedDate: formatDateTime(data.eventDate, data.eventTime) || "Sana tanlanmagan",
    names: `${data.groomName || "Kuyov"} & ${data.brideName || "Kelin"}`
  };
  const Layout = layouts[theme.layout] ?? layouts.rose;
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
        theme.shellClassName,
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
      <Layout model={model} />
    </section>
  );
}

function MomentoLightPreview({ data, className }: { data: WeddingFormData; className?: string }) {
  const names = `${data.groomName || "Kuyov"} & ${data.brideName || "Kelin"}`;
  const formattedDate = formatDateTime(data.eventDate, data.eventTime) || "Sana tanlanmagan";
  const calendar = data.eventDate ? getCalendarModel(data.eventDate) : null;
  const heroImage = data.heroImageUrl || data.coupleImageUrl || data.coverImageUrl;
  const venueImage = data.venueImageUrl1 || data.venueImageUrl2 || data.coverImageUrl;
  const eventDay = calendar?.days.find((day) => day.isEventDay)?.day ?? "21";
  const previewDays = calendar?.days.slice(0, 35) ?? [];

  return (
    <section
      className={cn(
        "relative mx-auto w-full max-w-[560px] overflow-hidden rounded-lg border border-stone-200 bg-[#f8f1e7] p-4 text-stone-900 shadow-2xl sm:p-8",
        className
      )}
    >
      <div className="absolute inset-0 bg-[repeating-linear-gradient(105deg,rgba(120,94,58,.10)_0_1px,transparent_1px_18px),radial-gradient(circle_at_24%_18%,rgba(255,255,255,.85),transparent_28%),linear-gradient(135deg,#fffaf2,#eadcc8_52%,#f8efe1)]" />
      <div className="absolute left-[-12%] top-[-6%] h-52 w-[124%] rotate-[-7deg] bg-white/35 blur-sm" />

      <article className="relative mx-auto min-h-[720px] max-w-[430px] overflow-hidden rounded-[1.4rem] border border-white/80 bg-white/62 shadow-[0_30px_90px_rgba(104,79,45,.22)] backdrop-blur">
        <div
          className="relative min-h-[310px] overflow-hidden bg-[linear-gradient(135deg,#d8c2a3,#fff6ea_54%,#b59670)]"
          style={heroImage ? { backgroundImage: `linear-gradient(180deg, rgba(31,24,17,.18), rgba(31,24,17,.58)), url(${heroImage})`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}
        >
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/55 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-semibold uppercase backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Momento Light
            </div>
            <h1 className="wedding-script text-6xl leading-none drop-shadow">{names}</h1>
            <p className="mt-4 flex items-center gap-2 text-sm font-semibold">
              <CalendarDays className="h-4 w-4" />
              {formattedDate}
            </p>
          </div>
        </div>

        <div className="space-y-6 px-6 py-7">
          <div className="rounded-lg border border-stone-200/80 bg-white/70 p-5 text-center">
            <p className="text-[11px] font-semibold uppercase text-stone-500">Sizga taklifnoma keldi</p>
            <p className="mx-auto mt-3 max-w-[260px] text-sm leading-6 text-stone-600">
              {getMomentoText(data, "openingQuote")}
            </p>
          </div>

          <div className="grid grid-cols-[1fr_120px] gap-4">
            <div className="rounded-lg border border-stone-200/80 bg-white/70 p-4">
              <p className="text-[11px] font-semibold uppercase text-stone-500">{calendar?.monthLabel || "TO'Y OYI"}</p>
              <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] text-stone-500">
                {["D", "S", "Ch", "P", "J", "Sh", "Y"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
                {previewDays.map((day) => (
                  <span
                    key={day.key}
                    className={cn(
                      "flex h-6 items-center justify-center rounded-full text-[11px]",
                      day.isEventDay && "bg-stone-900 text-white"
                    )}
                  >
                    {day.day}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-center rounded-lg bg-stone-900 p-4 text-center text-white">
              <Heart className="mx-auto h-5 w-5 fill-white" />
              <b className="mt-3 text-4xl leading-none">{eventDay}</b>
              <span className="mt-1 text-[10px] uppercase text-white/65">to'y kuni</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <PreviewInfo icon={<Clock className="h-4 w-4" />} label="Vaqt" value={data.eventTime || "18:00"} />
            <PreviewInfo icon={<MapPin className="h-4 w-4" />} label="Manzil" value={data.venueName || "To'yxona"} />
          </div>

          <div className="grid grid-cols-[1fr_96px] gap-3">
            <div className="rounded-lg border border-stone-200/80 bg-white/70 p-4">
              <p className="text-[11px] font-semibold uppercase text-stone-500">Dress code</p>
              <p className="mt-2 text-sm font-medium leading-6 text-stone-700">{getMomentoText(data, "dressCodeText")}</p>
            </div>
            <div
              className="rounded-lg border border-white/80 bg-[linear-gradient(135deg,#dfcfb8,#fff7eb)]"
              style={venueImage ? { backgroundImage: `linear-gradient(180deg, rgba(255,255,255,.1), rgba(76,56,34,.22)), url(${venueImage})`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {["Unlock", "Countdown", "Calendar", "RSVP", "Guest board"].map((item) => (
              <span key={item} className="rounded-full border border-stone-200 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-stone-600">
                {item}
              </span>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}

function PreviewInfo({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200/80 bg-white/70 p-4">
      <div className="flex items-center gap-2 text-stone-500">
        {icon}
        <span className="text-[11px] font-semibold uppercase">{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold leading-5 text-stone-800">{value}</p>
    </div>
  );
}

function RoseLayout({ model }: { model: PreviewModel }) {
  return (
    <Frame className="invite-layout-rose rounded-[1.65rem] px-7 py-8 text-center sm:px-10">
      <Seal icon="heart" />
      <Eyebrow>Sizni hayotimizdagi eng baxtli kunga taklif qilamiz</Eyebrow>
      <h1 className="invite-reveal wedding-script mt-5 text-6xl leading-none sm:text-7xl">Bizning to'yimiz</h1>
      <p className="invite-reveal wedding-script mt-5 text-4xl leading-tight">
        {model.data.groomName || "Kuyov"} <span className="text-[var(--invite-accent)]">&</span>{" "}
        {model.data.brideName || "Kelin"}
      </p>
      <Divider label={model.theme.label} />
      <DateTriplet model={model} />
      <CountdownGrid />
      <Verse />
      <HostText text={model.data.hostText} />
      <VenueBox model={model} />
      <LocationButton model={model} />
      <FooterDate value={model.formattedDate} />
    </Frame>
  );
}

function CollageLayout({ model }: { model: PreviewModel }) {
  const cover = model.data.coverImageUrl || "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80";
  const altOne = "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1200&q=80";
  const altTwo = "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=1200&q=80";
  const hero = `${cover}${cover.includes("?") ? "&" : "?"}fit=crop&w=1600&q=88`;

  return (
    <Frame className="invite-layout-collage aspect-square min-h-0 max-w-none p-0">
      <div className="invite-collage-shell invite-premium-font">
        <div className="invite-collage-titleblock invite-reveal">
          <span>Wedding invitation</span>
          <h1>{model.data.groomName || "Kuyov"} <em>&</em> {model.data.brideName || "Kelin"}</h1>
        </div>
        <div className="invite-collage-board">
          <div className="invite-collage-photo invite-collage-photo-main invite-reveal" style={{ backgroundImage: `url(${hero})` }} />
          <div className="invite-collage-photo invite-collage-photo-left invite-reveal" style={{ backgroundImage: `url(${altOne})` }} />
          <div className="invite-collage-photo invite-collage-photo-right invite-reveal" style={{ backgroundImage: `url(${altTwo})` }} />
          <div className="invite-collage-date invite-reveal">
            <b>{model.day}</b>
            <span>{model.monthYear}</span>
          </div>
        </div>
        <a className="invite-collage-detail invite-reveal" href={getMapHref(model)} target="_blank" rel="noopener noreferrer">
          <span>{model.time}</span>
          <p>{model.data.venueName || "To'yxona"} · {model.data.venueAddress || "Manzil"}</p>
        </a>
      </div>
    </Frame>
  );
}

function BlueInkLayout({ model }: { model: PreviewModel }) {
  return (
    <Frame className="invite-layout-blue-ink rounded-sm px-8 py-10 text-center">
      <div className="invite-blue-ink-corner invite-blue-ink-corner-tl" />
      <div className="invite-blue-ink-corner invite-blue-ink-corner-br" />
      <div className="invite-blue-ink-monogram invite-reveal">
        {(model.data.groomName || "K").slice(0, 1)}{(model.data.brideName || "K").slice(0, 1)}
      </div>
      <p className="invite-reveal invite-blue-ink-label">Wedding invitation</p>
      <h1 className="invite-reveal invite-blue-ink-title">
        {model.data.groomName || "Kuyov"}
        <span>&</span>
        {model.data.brideName || "Kelin"}
      </h1>
      <div className="invite-blue-ink-date invite-reveal">
        <span>{model.weekday}</span>
        <b>{model.day}</b>
        <span>{model.monthYear}</span>
      </div>
      <p className="invite-reveal invite-blue-ink-copy">{model.data.hostText}</p>
      <div className="invite-blue-ink-info invite-reveal">
        <Meta label="Vaqt" value={model.time} />
        <MapMeta label="Manzil" model={model} value={`${model.data.venueName || "To'yxona"} · ${model.data.venueAddress || "Manzil"}`} />
      </div>
    </Frame>
  );
}

function GalleryLayout({ model }: { model: PreviewModel }) {
  const cover = model.data.coverImageUrl || "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1200&q=86";
  const altOne = "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=86";
  const altTwo = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=86";

  return (
    <Frame className="invite-layout-gallery rounded-[1.6rem] p-0">
      <div className="invite-gallery-rail invite-reveal">
        <span>Gallery</span>
        <b>{model.day}</b>
        <span>{model.monthYear}</span>
      </div>
      <div className="invite-gallery-stack">
        <div className="invite-gallery-photo invite-gallery-photo-a invite-reveal" style={{ backgroundImage: `url(${cover})` }} />
        <div className="invite-gallery-photo invite-gallery-photo-b invite-reveal" style={{ backgroundImage: `url(${altOne})` }} />
        <div className="invite-gallery-photo invite-gallery-photo-c invite-reveal" style={{ backgroundImage: `url(${altTwo})` }} />
      </div>
      <div className="invite-gallery-panel invite-reveal">
        <p>Wedding day</p>
        <h1>{model.data.groomName || "Kuyov"}<span>&</span>{model.data.brideName || "Kelin"}</h1>
        <small>{model.data.hostText}</small>
        <a href={getMapHref(model)} target="_blank" rel="noopener noreferrer">
          {model.time} · {model.data.venueName || "To'yxona"}
        </a>
      </div>
    </Frame>
  );
}

function MinimalLayout({ model }: { model: PreviewModel }) {
  return (
    <Frame className="invite-layout-minimal rounded-xl p-0 text-left">
      <div className="invite-minimal-grid invite-premium-font">
        <div className="invite-minimal-top invite-reveal">
          <span>Save the date</span>
          <b>{model.formattedDate}</b>
        </div>
        <div className="invite-minimal-copy">
          <p className="invite-reveal text-[10px] font-bold uppercase tracking-[0.38em] text-[var(--invite-muted)]">Modern vow</p>
          <h1 className="invite-reveal">
            {model.data.groomName || "Kuyov"}
            <span>and</span>
            {model.data.brideName || "Kelin"}
          </h1>
          <p className="invite-reveal">{model.data.hostText}</p>
        </div>
        <div className="invite-minimal-meta invite-reveal">
          <Meta label="Vaqt" value={model.time} />
          <Meta label="Joy" value={model.data.venueName || "To'yxona"} />
        <MapMeta label="Manzil" model={model} value={model.data.venueAddress || "Manzil"} />
        </div>
      </div>
    </Frame>
  );
}

function RoyalLayout({ model }: { model: PreviewModel }) {
  return (
    <Frame className="invite-layout-royal rounded-[1.4rem] px-7 py-9 text-center sm:px-10">
      <div className="invite-royal-gate" />
      <div className="invite-royal-crest invite-reveal">
        <Image src="/taklifnoma-emblem-transparent.svg" alt="" width={46} height={46} className="h-11 w-11" />
      </div>
      <p className="invite-reveal invite-royal-eyebrow">Royal nikoh majlisi</p>
      <h1 className="invite-reveal invite-royal-title">
        {model.data.groomName || "Kuyov"}
        <span>
          bilan
        </span>
        {model.data.brideName || "Kelin"}
      </h1>
      <Quote text="Kelishingiz biz uchun sharaf, duolaringiz hayotimizga baraka." />
      <div className="invite-royal-date invite-reveal">
        <span>{model.weekday}</span>
        <b>{model.day}</b>
        <span>{model.time}</span>
      </div>
      <HostText text={model.data.hostText} />
      <VenueBox model={model} />
      <LocationButton model={model} />
    </Frame>
  );
}

function NoorLayout({ model }: { model: PreviewModel }) {
  return (
    <Frame className="invite-layout-noor rounded-[1.35rem] px-6 py-8 text-center">
      <div className="invite-noor-dome invite-reveal">
        <div className="invite-noor-lamp"><Sparkles className="h-6 w-6" /></div>
        <p className="invite-noor-arabic" dir="rtl">وَخَلَقْنَاكُمْ أَزْوَاجًا</p>
        <p className="invite-noor-sub">Bismillahir rohmanir rohiym</p>
      </div>
      <h1 className="invite-reveal invite-noor-title">{model.names}</h1>
      <div className="invite-noor-date invite-reveal">
        <span>{model.weekday}</span>
        <b>{model.day}</b>
        <span>{model.monthYear}</span>
      </div>
      <p className="invite-reveal mx-auto mt-7 max-w-xs text-sm leading-7 text-[var(--invite-muted)]">{model.data.hostText}</p>
      <div className="invite-reveal mt-7 grid gap-3 text-left">
        <Pill icon={<Clock className="h-4 w-4" />} text={model.time} />
        <Pill icon={<MapPin className="h-4 w-4" />} text={`${model.data.venueName || "To'yxona"} · ${model.data.venueAddress || "Manzil"}`} href={getMapHref(model)} />
      </div>
    </Frame>
  );
}

function PearlLayout({ model }: { model: PreviewModel }) {
  return (
    <Frame className="invite-layout-pearl rounded-[2.25rem] p-0 text-center">
      <div className="invite-pearl-hero invite-reveal">
        <div className="invite-pearl-photo"><Heart className="h-12 w-12 fill-white text-white" /></div>
        <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-white/90">Pearl blush</p>
        <h1 className="wedding-script mt-3 text-6xl leading-none text-white">{model.names}</h1>
      </div>
      <div className="px-7 pb-8 pt-6">
        <Quote text="Ikki oila birlashadigan muborak kunimizda sizni kutamiz." />
        <div className="invite-reveal mx-auto mt-5 flex max-w-xs items-center justify-center gap-3 rounded-full border bg-white/60 px-4 py-3">
          <CalendarDays className="h-4 w-4 text-[var(--invite-accent)]" />
          <span className="text-sm font-semibold">{model.formattedDate}</span>
        </div>
        <HostText text={model.data.hostText} />
        <div className="invite-reveal mt-6 grid gap-3 text-left">
          <Pill icon={<Clock className="h-4 w-4" />} text={model.time} />
          <Pill icon={<MapPin className="h-4 w-4" />} text={`${model.data.venueName || "To'yxona"} · ${model.data.venueAddress || "Manzil"}`} href={getMapHref(model)} />
        </div>
      </div>
    </Frame>
  );
}

function MidnightLayout({ model }: { model: PreviewModel }) {
  return (
    <Frame className="invite-layout-midnight rounded-[1.75rem] px-7 py-8 text-left">
      <div className="invite-moon invite-reveal" />
      <p className="invite-reveal invite-midnight-label">Midnight ceremony</p>
      <h1 className="invite-reveal invite-midnight-title">
        {model.data.groomName || "Kuyov"}
        <span>&</span>
        {model.data.brideName || "Kelin"}
      </h1>
      <div className="invite-starry-strip invite-reveal">
        <b>{model.day}</b>
        <span>{model.monthYear}</span>
        <span>{model.time}</span>
      </div>
      <p className="invite-reveal mt-10 border-l border-[var(--invite-accent)] pl-5 text-sm leading-7 text-[var(--invite-muted)]">
        {model.data.hostText}
      </p>
      <div className="invite-reveal mt-7 grid gap-3">
        <Pill icon={<MapPin className="h-4 w-4" />} text={`${model.data.venueName || "To'yxona"} · ${model.data.venueAddress || "Manzil"}`} href={getMapHref(model)} />
      </div>
      <LocationButton model={model} />
    </Frame>
  );
}

function GardenLayout({ model }: { model: PreviewModel }) {
  return (
    <Frame className="invite-layout-garden rounded-[1.5rem] px-6 py-7 text-center">
      <div className="invite-garden-canopy invite-reveal">
        <div className="invite-flower-ring">
          <span>{model.day}</span>
        </div>
      </div>
      <p className="invite-reveal invite-garden-label">Garden bloom</p>
      <h1 className="invite-reveal invite-garden-title">{model.names}</h1>
      <Quote text="Baxtli kunimizga guldek niyatlar bilan tashrif buyuring." />
      <p className="invite-reveal mx-auto mt-5 max-w-xs text-sm leading-7 text-[var(--invite-muted)]">{model.data.hostText}</p>
      <div className="invite-reveal mt-6 grid grid-cols-2 gap-3 text-left">
        <GardenTile label="Sana" value={model.formattedDate} />
        <GardenTile label="Vaqt" value={model.time} />
        <GardenTile label="To'yxona" value={model.data.venueName || "To'yxona"} wide />
        <GardenTile label="Manzil" value={model.data.venueAddress || "Manzil"} wide href={getMapHref(model)} />
      </div>
    </Frame>
  );
}

function SilkLayout({ model }: { model: PreviewModel }) {
  return (
    <Frame className="invite-layout-silk rounded-[2rem] p-0 text-left">
      <div className="invite-silk-cover invite-reveal">
        <p>Silk editorial</p>
        <b>{model.day}</b>
      </div>
      <div className="px-8 pb-8 pt-7">
        <h1 className="invite-reveal invite-silk-title">
          {model.data.groomName || "Kuyov"}
          <span>meets</span>
          {model.data.brideName || "Kelin"}
        </h1>
        <div className="invite-reveal mt-7 grid grid-cols-[1fr_104px] gap-5">
          <p className="text-sm leading-7 text-[var(--invite-muted)]">{model.data.hostText}</p>
          <div className="rounded-lg bg-[var(--invite-accent-soft)] p-4 text-center">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--invite-muted)]">{model.monthYear}</p>
            <p className="mt-2 text-sm font-semibold text-[var(--invite-accent)]">{model.time}</p>
          </div>
        </div>
        <div className="invite-reveal mt-7 border-t pt-6">
          <MapMeta label="Venue" model={model} value={`${model.data.venueName || "To'yxona"} · ${model.data.venueAddress || "Manzil"}`} />
        </div>
      </div>
    </Frame>
  );
}

function DesertLayout({ model }: { model: PreviewModel }) {
  return (
    <Frame className="invite-layout-desert rounded-[1.3rem] px-7 py-8 text-center">
      <div className="invite-scroll invite-reveal">
        <p className="text-xs uppercase tracking-[0.32em] text-[var(--invite-muted)]">Saffron dusk</p>
        <h1 className="invite-desert-title">{model.names}</h1>
        <div className="invite-desert-ornament" />
        <p className="mt-6 text-sm leading-7 text-[var(--invite-muted)]">{model.data.hostText}</p>
      </div>
      <div className="invite-reveal mt-7 flex items-stretch justify-center gap-3">
        <DesertMark value={model.weekday} label="Kun" />
        <DesertMark value={model.day} label={model.monthYear} strong />
        <DesertMark value={model.time.replace("Soat ", "")} label="Vaqt" />
      </div>
      <VenueBox model={model} />
    </Frame>
  );
}

function OceanLayout({ model }: { model: PreviewModel }) {
  return (
    <Frame className="invite-layout-ocean rounded-[1.75rem] px-6 py-7 text-center">
      <div className="invite-wave-mark invite-reveal" />
      <div className="invite-glass-panel invite-reveal">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[var(--invite-accent)]">Ocean glass</p>
        <h1 className="invite-ocean-title">{model.names}</h1>
        <p className="mt-6 text-sm leading-7 text-[var(--invite-muted)]">{model.data.hostText}</p>
      </div>
      <div className="invite-reveal mt-5 grid gap-3 text-left">
        <Pill icon={<CalendarDays className="h-4 w-4" />} text={model.formattedDate} />
        <Pill icon={<Clock className="h-4 w-4" />} text={model.time} />
        <Pill icon={<MapPin className="h-4 w-4" />} text={`${model.data.venueName || "To'yxona"} · ${model.data.venueAddress || "Manzil"}`} href={getMapHref(model)} />
      </div>
      <LocationButton model={model} />
    </Frame>
  );
}

function VelvetLayout({ model }: { model: PreviewModel }) {
  return (
    <Frame className="invite-layout-velvet rounded-[1.75rem] px-6 py-7 text-center">
      <div className="invite-velvet-curtain" />
      <div className="invite-velvet-monogram invite-reveal">
        {(model.data.groomName || "K").slice(0, 1)}
        <span>&</span>
        {(model.data.brideName || "K").slice(0, 1)}
      </div>
      <p className="invite-reveal invite-velvet-label">Velvet ceremony</p>
      <h1 className="invite-reveal invite-velvet-title">
        {model.data.groomName || "Kuyov"}
        <span>&</span>
        {model.data.brideName || "Kelin"}
      </h1>
      <div className="invite-reveal invite-velvet-ticket">
        <Meta label={model.weekday} value={`${model.day} · ${model.monthYear}`} />
        <Meta label="Boshlanish" value={model.time} />
      </div>
      <p className="invite-reveal mx-auto mt-7 max-w-xs text-sm leading-7 text-[var(--invite-muted)]">{model.data.hostText}</p>
      <div className="invite-reveal mt-7 grid gap-3 text-left">
        <Pill icon={<MapPin className="h-4 w-4" />} text={`${model.data.venueName || "To'yxona"} · ${model.data.venueAddress || "Manzil"}`} href={getMapHref(model)} />
      </div>
      <LocationButton model={model} />
    </Frame>
  );
}

const layouts = {
  rose: RoseLayout,
  blueInk: BlueInkLayout,
  collage: CollageLayout,
  gallery: GalleryLayout,
  minimal: MinimalLayout,
  royal: RoyalLayout,
  noor: NoorLayout,
  pearl: PearlLayout,
  midnight: MidnightLayout,
  garden: GardenLayout,
  silk: SilkLayout,
  desert: DesertLayout,
  ocean: OceanLayout,
  velvet: VelvetLayout
};

function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <article
      className={cn(
        "invite-card relative mx-auto min-h-[720px] max-w-[430px] overflow-hidden border text-[var(--invite-ink)]",
        className
      )}
    >
      <div className="invite-content relative z-10">{children}</div>
    </article>
  );
}

function Seal({ icon }: { icon: "heart" | "sparkles" }) {
  return (
    <div className="invite-seal absolute left-1/2 top-[-14px] flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-white shadow-lg">
      {icon === "heart" ? (
        <Image src="/taklifnoma-monogram-transparent.svg" alt="" width={34} height={34} className="h-8 w-8" />
      ) : (
        <Sparkles className="h-6 w-6 text-[var(--invite-accent)]" />
      )}
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="invite-reveal mt-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--invite-accent)]">{children}</p>;
}

function Divider({ label }: { label: string }) {
  return (
    <div className="invite-divider invite-reveal mx-auto mt-10 flex max-w-[260px] items-center gap-3">
      <span />
      <b>{label}</b>
      <span />
    </div>
  );
}

function DateTriplet({ model }: { model: PreviewModel }) {
  return (
    <>
      <div className="invite-reveal mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--invite-muted)]">
        <span>{model.weekday}</span>
        <span className="wedding-script text-5xl font-normal tracking-normal text-[var(--invite-accent)]">{model.day}</span>
        <span>{model.time}</span>
      </div>
      <p className="invite-reveal mt-2 text-xs font-semibold uppercase tracking-[0.32em] text-[var(--invite-muted)]">
        {model.monthYear}
      </p>
    </>
  );
}

function CountdownGrid() {
  return (
    <>
      <div className="invite-reveal mt-8 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--invite-accent)]">
        <Clock className="h-4 w-4" />
        Bizning unutilmas kunimizgacha
      </div>
      <div className="invite-reveal mt-4 grid grid-cols-4 gap-2">
        {countdown.map(([value, label]) => (
          <div key={label} className="invite-count rounded-md px-2 py-3 text-center">
            <p className="wedding-script text-3xl leading-none text-[var(--invite-accent)]">{value}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--invite-muted)]">{label}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function Verse() {
  return (
    <div className="invite-reveal mt-9 space-y-2 text-center">
      <p className="text-2xl leading-none" dir="rtl">
        وَخَلَقْنَاكُمْ أَزْوَاجًا
      </p>
      <p className="font-serif text-sm italic text-[var(--invite-muted)]">Biz sizlarni juft-juft qilib yaratdik</p>
    </div>
  );
}

function HostText({ text }: { text: string }) {
  return <p className="invite-reveal mx-auto mt-7 max-w-xs text-sm leading-7 text-[var(--invite-muted)]">{text}</p>;
}

function getMapHref(model: PreviewModel) {
  const query = [model.data.venueName, model.data.venueAddress].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || "Toshkent")}`;
}

function VenueBox({ model }: { model: PreviewModel }) {
  return (
    <a
      className="invite-reveal mt-7 block rounded-lg border bg-white/60 p-4 text-left backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--invite-accent)] hover:bg-white/75"
      href={getMapHref(model)}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="flex gap-3">
        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--invite-accent)]" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--invite-muted)]">Manzil</p>
          <p className="mt-1 font-semibold">{model.data.venueName || "To'yxona"}</p>
          <p className="mt-1 text-sm text-[var(--invite-muted)]">{model.data.venueAddress || "Manzil"}</p>
        </div>
      </div>
    </a>
  );
}

function Quote({ text }: { text: string }) {
  return (
    <div className="invite-quote invite-reveal">
      {text}
    </div>
  );
}

function LocationButton({ model, compact = false }: { model: PreviewModel; compact?: boolean }) {
  return (
    <a
      className={cn(
        "invite-reveal inline-flex items-center justify-center gap-2 rounded-full bg-[var(--invite-accent)] text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl",
        compact ? "px-4 py-2" : "mt-5 px-5 py-3"
      )}
      href={getMapHref(model)}
      target="_blank"
      rel="noopener noreferrer"
    >
      <MapPin className="h-4 w-4" />
      Manzil
    </a>
  );
}

function FooterDate({ value }: { value: string }) {
  return (
    <div className="invite-reveal mt-7 flex items-center justify-center gap-2 text-xs text-[var(--invite-muted)]">
      <CalendarDays className="h-4 w-4" />
      {value}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--invite-accent)]">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-[var(--invite-ink)]">{value}</p>
    </div>
  );
}

function MapMeta({ label, value, model }: { label: string; value: string; model: PreviewModel }) {
  return (
    <a href={getMapHref(model)} target="_blank" rel="noopener noreferrer" className="block rounded-md transition hover:text-[var(--invite-accent)]">
      <Meta label={label} value={value} />
    </a>
  );
}

function Pill({ icon, text, href }: { icon: ReactNode; text: string; href?: string }) {
  const className = "flex items-center gap-3 rounded-full border bg-white/55 px-4 py-3 text-sm font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--invite-accent)] hover:bg-white/70";
  if (href) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        <span className="text-[var(--invite-accent)]">{icon}</span>
        <span>{text}</span>
      </a>
    );
  }

  return (
    <div className={className}>
      <span className="text-[var(--invite-accent)]">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function GardenTile({ label, value, wide, href }: { label: string; value: string; wide?: boolean; href?: string }) {
  const className = cn("rounded-lg border bg-white/60 p-4 transition hover:border-[var(--invite-accent)] hover:bg-white/75", wide && "col-span-2");
  if (href) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer">
        <Meta label={label} value={value} />
      </a>
    );
  }

  return (
    <div className={className}>
      <Meta label={label} value={value} />
    </div>
  );
}

function DesertMark({ value, label, strong }: { value: string; label: string; strong?: boolean }) {
  return (
    <div className={cn("flex min-h-24 flex-1 flex-col justify-center rounded-lg border bg-white/50 p-3", strong && "scale-110 bg-[var(--invite-accent-soft)]")}>
      <p className={cn("font-serif leading-none text-[var(--invite-accent)]", strong ? "text-5xl" : "text-xl")}>{value}</p>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--invite-muted)]">{label}</p>
    </div>
  );
}

function DecorativeMotion({ motif }: { motif: string }) {
  return (
    <div className={cn("invite-motion pointer-events-none absolute inset-0 overflow-hidden", motif)}>
      {Array.from({ length: 18 }).map((_, index) => (
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
