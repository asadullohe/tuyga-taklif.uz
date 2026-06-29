"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Copy,
  Gift,
  Heart,
  LockKeyhole,
  MapPin,
  Music2,
  Pause,
  Send,
  Shirt,
  Sparkles,
  Timer,
  Users
} from "lucide-react";
import { RsvpForm } from "@/components/rsvp-form";
import { RsvpGuestBoard } from "@/components/rsvp-guest-board";
import {
  getCalendarModel,
  getCountdownParts,
  getEventDateTimeMs,
  getMomentoText
} from "@/lib/momento-light";
import { cn, formatDateTime } from "@/lib/utils";
import type { WeddingFormData } from "@/types";

type MomentoLightInvitationProps = {
  data: WeddingFormData;
  slug: string;
  publicUrl: string;
};

const weekdays = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
const dressCodeSwatches = ["#f6ead8", "#d7c1a0", "#fffaf1", "#a99478"];

export function MomentoLightInvitation({ data, slug, publicUrl }: MomentoLightInvitationProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const eventMs = useMemo(() => getEventDateTimeMs(data.eventDate, data.eventTime), [data.eventDate, data.eventTime]);
  const countdown = useMemo(() => getCountdownParts(eventMs, nowMs), [eventMs, nowMs]);
  const calendar = useMemo(() => getCalendarModel(data.eventDate), [data.eventDate]);
  const names = `${data.groomName} & ${data.brideName}`;
  const openingQuote = getMomentoText(data, "openingQuote");
  const hasHeroVideo = Boolean(data.heroVideoUrl);
  const heroImage = data.heroImageUrl || data.coverImageUrl || "";
  const coupleImage = data.coupleImageUrl || data.coverImageUrl || "";

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicPlaying) {
      audio.play().catch(() => setMusicPlaying(false));
    } else {
      audio.pause();
    }
  }, [musicPlaying]);

  const unlock = () => {
    setUnlocked(true);
    if (data.musicUrl) setMusicPlaying(true);
  };

  const toggleMusic = () => {
    if (!data.musicUrl) return;
    setMusicPlaying((value) => !value);
  };

  const share = async (target: "native" | "telegram" | "whatsapp" | "copy") => {
    await fetch(`/api/public/invitations/${slug}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "share_clicked" })
    }).catch(() => null);

    const text = `${names} to'y taklifnomasi`;
    if (target === "telegram") {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(publicUrl)}&text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
      return;
    }
    if (target === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text}: ${publicUrl}`)}`, "_blank", "noopener,noreferrer");
      return;
    }
    if (target === "native" && navigator.share) {
      await navigator.share({ title: text, url: publicUrl });
      return;
    }
    await navigator.clipboard.writeText(publicUrl);
    setShareCopied(true);
    window.setTimeout(() => setShareCopied(false), 1800);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f9f4ea] text-[#27221d]">
      {data.musicUrl ? <audio ref={audioRef} src={data.musicUrl} loop preload="none" /> : null}

      {!unlocked ? (
        <section className="fixed inset-0 z-50 grid place-items-center bg-[#f9f4ea] px-5 text-center">
          <FabricBackdrop imageUrl={heroImage} />
          <div className="relative z-10 flex min-h-[620px] w-full max-w-md flex-col items-center justify-center rounded-[2rem] border border-[#d8c6aa]/70 bg-[#fffaf2]/78 px-6 py-10 shadow-[0_30px_100px_rgba(82,61,40,.22)] backdrop-blur-md">
            <div className="mb-8 h-24 w-px bg-gradient-to-b from-transparent via-[#b69a72] to-transparent" />
            <Heart className="h-8 w-8 fill-[#25211d] text-[#25211d]" />
            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8c7353]">
              Sizga taklifnoma keldi
            </p>
            <h1 className="mt-5 font-['Cormorant_Garamond',serif] text-5xl font-semibold leading-none text-[#27221d]">
              {names}
            </h1>
            <button
              type="button"
              onClick={unlock}
              className="mt-10 grid h-16 w-16 place-items-center rounded-full border border-[#bda37c] bg-[#27221d] text-[#fff8ec] shadow-[0_16px_40px_rgba(39,34,29,.22)] transition hover:-translate-y-0.5 hover:bg-[#493d30]"
              aria-label="Taklifnomani ochish"
            >
              <LockKeyhole className="h-6 w-6" />
            </button>
            <p className="mt-5 max-w-60 text-sm leading-6 text-[#746650]">Qulfchani bosib, taklifnomani oching</p>
          </div>
        </section>
      ) : null}

      <FloatingControls
        hasMusic={Boolean(data.musicUrl)}
        musicPlaying={musicPlaying}
        onMusic={toggleMusic}
        onShare={() => void share("native")}
      />

      <section className="relative flex min-h-screen items-center justify-center px-4 py-16 text-center">
        {hasHeroVideo ? (
          <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline>
            <source src={data.heroVideoUrl} />
          </video>
        ) : (
          <FabricBackdrop imageUrl={heroImage} />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,250,241,.62),rgba(249,244,234,.92))]" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <div className="mx-auto mb-8 flex w-fit items-center gap-3 rounded-full border border-[#cdb58d]/60 bg-white/45 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7f6847] backdrop-blur">
            <Sparkles className="h-4 w-4" />
            To'yga taklifnoma
          </div>
          <h2 className="font-['Great_Vibes',cursive] text-[clamp(4.2rem,15vw,10rem)] leading-none text-[#2d251d]">
            {data.groomName}
            <span className="mx-3 font-['Cormorant_Garamond',serif] text-[0.42em] text-[#b18d58]">&</span>
            {data.brideName}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl font-['Cormorant_Garamond',serif] text-2xl leading-8 text-[#6b5a43]">
            {openingQuote}
          </p>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-[#8c7353]">
            {formatDateTime(data.eventDate, data.eventTime)}
          </p>
          <CountdownGrid countdown={countdown} />
        </div>
      </section>

      <section className="relative px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div className="rounded-[2rem] border border-[#dfcfb7] bg-[#fffaf2] p-8 shadow-[0_20px_70px_rgba(91,68,43,.12)]">
            <SectionEyebrow>Hurmatli mehmonlar</SectionEyebrow>
            <h2 className="mt-4 font-['Cormorant_Garamond',serif] text-4xl font-semibold text-[#2d251d]">
              Quvonchimizga sherik bo'ling
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#6d5f4d]">{data.hostText}</p>
          </div>
          <ImageFrame imageUrl={coupleImage} caption={names} className="min-h-[420px]" />
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#dfcfb7] bg-white/70 p-6 shadow-[0_20px_70px_rgba(91,68,43,.10)] backdrop-blur">
          <div className="text-center">
            <SectionEyebrow>Sanoqli kunlar</SectionEyebrow>
            <h2 className="mt-3 font-['Cormorant_Garamond',serif] text-4xl font-semibold">To'y kalendari</h2>
          </div>
          <div className="mt-8 rounded-[1.5rem] bg-[#fffaf2] p-5">
            <div className="text-center text-sm font-semibold uppercase tracking-[0.24em] text-[#8c7353]">
              {calendar.monthLabel}
            </div>
            <div className="mt-6 grid grid-cols-7 gap-2 text-center">
              {weekdays.map((weekday) => (
                <div key={weekday} className="text-xs font-semibold uppercase text-[#99866a]">{weekday}</div>
              ))}
              {calendar.days.map((day) => (
                <div
                  key={day.key}
                  className={cn(
                    "relative grid aspect-square place-items-center rounded-full text-sm font-medium",
                    day.day === null && "opacity-0",
                    day.isEventDay ? "bg-[#2d251d] text-[#fff8ec] shadow-[0_12px_32px_rgba(45,37,29,.24)]" : "bg-white text-[#554835]"
                  )}
                >
                  {day.day}
                  {day.isEventDay ? <Heart className="absolute -right-1 -top-1 h-4 w-4 fill-[#c69d62] text-[#c69d62]" /> : null}
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-[#7c6d58]">{getMomentoText(data, "calendarNote")}</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <SectionEyebrow>To'yimiz haqida qisqacha</SectionEyebrow>
            <h2 className="mt-3 font-['Cormorant_Garamond',serif] text-4xl font-semibold">Tadbir tafsilotlari</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <DetailCard icon={<MapPin />} title="Manzil" text={`${data.venueName}, ${data.venueAddress}`} />
            <DetailCard icon={<Timer />} title="Vaqt" text={formatDateTime(data.eventDate, data.eventTime)} note="Eshiklar oldindan ochiq" />
            <DetailCard icon={<Shirt />} title="Kiyinish kodi" text={getMomentoText(data, "dressCodeText")} swatches />
            <DetailCard icon={<Sparkles />} title="Format" text={getMomentoText(data, "formatText")} />
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <SectionEyebrow>Restoran manzili</SectionEyebrow>
            <h2 className="mt-3 font-['Cormorant_Garamond',serif] text-4xl font-semibold">Restoran fotosuratlari</h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <ImageFrame imageUrl={data.venueImageUrl1} caption={data.venueName} className="min-h-[360px]" />
            <ImageFrame imageUrl={data.venueImageUrl2} caption={data.venueAddress} className="min-h-[360px]" />
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto grid max-w-5xl gap-6 rounded-[2rem] border border-[#dfcfb7] bg-[#fffaf2] p-6 shadow-[0_20px_70px_rgba(91,68,43,.12)] md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <SectionEyebrow>Joylashuv va yo'nalish</SectionEyebrow>
            <h2 className="mt-3 font-['Cormorant_Garamond',serif] text-4xl font-semibold">{data.venueName}</h2>
            <p className="mt-3 text-[#6d5f4d]">{data.venueAddress}</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <MapButton href={data.googleMapsUrl} label="Google Maps" />
            <MapButton href={data.yandexMapsUrl} label="Yandex Maps" />
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div>
            <div className="rounded-[2rem] border border-[#dfcfb7] bg-white/70 p-6 shadow-[0_20px_70px_rgba(91,68,43,.10)]">
              <div className="text-center">
                <SectionEyebrow>Ishtirokingizni tasdiqlang</SectionEyebrow>
                <h2 className="mt-3 font-['Cormorant_Garamond',serif] text-4xl font-semibold">Biz bilan bo'ling</h2>
              </div>
              <div className="mt-6">
                <RsvpForm slug={slug} />
              </div>
            </div>
          </div>
          <RsvpGuestBoard slug={slug} />
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#dfcfb7] bg-[#27221d] p-8 text-center text-[#fff8ec] shadow-[0_24px_80px_rgba(39,34,29,.22)]">
          <Gift className="mx-auto h-8 w-8 text-[#d6b57f]" />
          <h2 className="mt-5 font-['Cormorant_Garamond',serif] text-4xl font-semibold">Mehmonlarga iltimoslar</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#eadcc8]">{getMomentoText(data, "giftText")}</p>
          {data.telegramGroupUrl ? (
            <a
              href={data.telegramGroupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#fff8ec] px-6 py-3 text-sm font-semibold text-[#27221d] transition hover:bg-white"
            >
              <Send className="h-4 w-4" />
              Telegramga o'tish
            </a>
          ) : null}
        </div>
      </section>

      <section className="px-4 py-16 text-center">
        <SectionEyebrow>Taklifnomani ulashing</SectionEyebrow>
        <h2 className="mt-3 font-['Cormorant_Garamond',serif] text-4xl font-semibold">Do'stlaringizga yetkazing</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <SharePill label="Telegram" onClick={() => void share("telegram")} />
          <SharePill label="WhatsApp" onClick={() => void share("whatsapp")} />
          <SharePill label={shareCopied ? "Nusxalandi" : "Nusxa olish"} icon={<Copy />} onClick={() => void share("copy")} />
        </div>
        <footer className="mt-16 text-[#7c6d58]">
          <p className="font-['Great_Vibes',cursive] text-5xl text-[#2d251d]">{names}</p>
          <p className="mt-4 text-sm uppercase tracking-[0.2em]">{formatDateTime(data.eventDate, data.eventTime)}</p>
          <p className="mt-5">Bu baxtli kunda biz bilan birga bo'lganingiz uchun samimiy minnatdorchilik bildiramiz.</p>
        </footer>
      </section>
    </main>
  );
}

function FloatingControls({
  hasMusic,
  musicPlaying,
  onMusic,
  onShare
}: {
  hasMusic: boolean;
  musicPlaying: boolean;
  onMusic: () => void;
  onShare: () => void;
}) {
  return (
    <div className="fixed right-4 top-4 z-40 flex gap-2">
      {hasMusic ? (
        <button type="button" onClick={onMusic} className="grid h-11 w-11 place-items-center rounded-full border border-[#d8c6aa] bg-[#fffaf2]/85 text-[#2d251d] shadow-lg backdrop-blur" aria-label="Musiqa">
          {musicPlaying ? <Pause className="h-4 w-4" /> : <Music2 className="h-4 w-4" />}
        </button>
      ) : null}
      <button type="button" onClick={onShare} className="grid h-11 w-11 place-items-center rounded-full border border-[#d8c6aa] bg-[#fffaf2]/85 text-[#2d251d] shadow-lg backdrop-blur" aria-label="Ulashish">
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
}

function FabricBackdrop({ imageUrl }: { imageUrl?: string }) {
  return (
    <div
      className="absolute inset-0 bg-[#f9f4ea]"
      style={{
        backgroundImage: imageUrl
          ? `linear-gradient(120deg, rgba(255,250,242,.76), rgba(249,244,234,.62)), url(${imageUrl})`
          : "radial-gradient(circle at 20% 20%, rgba(255,255,255,.9), transparent 28%), linear-gradient(135deg,#fffaf2,#eadcc8 48%,#f8efe1)",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="absolute inset-0 opacity-35 [background-image:repeating-linear-gradient(105deg,rgba(120,94,58,.10)_0_1px,transparent_1px_18px)]" />
    </div>
  );
}

function CountdownGrid({ countdown }: { countdown: ReturnType<typeof getCountdownParts> }) {
  const units = [
    ["kun", countdown.days],
    ["soat", countdown.hours],
    ["daqiqa", countdown.minutes],
    ["soniya", countdown.seconds]
  ] as const;

  return (
    <div className="mx-auto mt-10 grid max-w-3xl grid-cols-4 gap-2 rounded-[1.5rem] border border-[#d8c6aa]/70 bg-[#fffaf2]/70 p-3 shadow-[0_20px_60px_rgba(91,68,43,.12)] backdrop-blur">
      {units.map(([label, value]) => (
        <div key={label} className="rounded-[1.1rem] bg-white/70 px-2 py-4">
          <div className="font-['Cormorant_Garamond',serif] text-3xl font-semibold text-[#2d251d] sm:text-5xl">
            {String(value).padStart(2, "0")}
          </div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#947c59]">{label}</div>
        </div>
      ))}
    </div>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9b7b50]">{children}</p>;
}

function ImageFrame({ imageUrl, caption, className }: { imageUrl?: string; caption: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-[2rem] border border-[#dfcfb7] bg-[#efe2cf]", className)}>
      {imageUrl ? (
        <div
          role="img"
          aria-label={caption}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,.78),transparent_28%),linear-gradient(135deg,#eadcc8,#fffaf2_52%,#d8c3a4)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#2d251d]/45 via-transparent to-transparent" />
      <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/40 bg-white/55 px-4 py-3 text-sm font-semibold text-[#2d251d] backdrop-blur">
        {caption}
      </div>
    </div>
  );
}

function DetailCard({
  icon,
  title,
  text,
  note,
  swatches
}: {
  icon: ReactNode;
  title: string;
  text: string;
  note?: string;
  swatches?: boolean;
}) {
  return (
    <div className="rounded-[1.5rem] border border-[#dfcfb7] bg-[#fffaf2] p-5 shadow-[0_12px_40px_rgba(91,68,43,.08)]">
      <div className="flex gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#2d251d] text-[#fff8ec] [&_svg]:h-5 [&_svg]:w-5">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-[#2d251d]">{title}</h3>
          <p className="mt-2 leading-7 text-[#6d5f4d]">{text}</p>
          {note ? <p className="mt-2 text-sm text-[#9b7b50]">{note}</p> : null}
          {swatches ? (
            <div className="mt-3 flex gap-2">
              {dressCodeSwatches.map((color) => (
                <span key={color} className="h-6 w-6 rounded-full border border-[#dfcfb7]" style={{ backgroundColor: color }} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MapButton({ href, label }: { href?: string; label: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-[#2d251d] px-5 py-3 text-sm font-semibold text-[#fff8ec] transition hover:-translate-y-0.5 hover:bg-[#4d3f30]"
    >
      <MapPin className="h-4 w-4" />
      {label}
    </a>
  );
}

function SharePill({
  label,
  icon,
  onClick
}: {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-[#d8c6aa] bg-[#fffaf2] px-5 py-3 text-sm font-semibold text-[#2d251d] shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
    >
      {icon ?? <Users className="h-4 w-4" />}
      {label}
    </button>
  );
}
