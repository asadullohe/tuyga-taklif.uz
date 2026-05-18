import { CalendarDays, Clock, Heart, MapPin } from "lucide-react";
import type { WeddingFormData } from "@/types";
import { cn, formatDateTime, getUzDateParts } from "@/lib/utils";

type InvitationPreviewProps = {
  data: WeddingFormData;
  variant?: "classic-rose" | "modern-minimal" | string;
  className?: string;
};

export function InvitationPreview({ data, variant = "classic-rose", className }: InvitationPreviewProps) {
  const isModern = variant === "modern-minimal";
  const dateParts = data.eventDate ? getUzDateParts(data.eventDate) : null;
  const day = dateParts?.day ?? "21";
  const weekday = dateParts?.weekday ?? "yakshanba";
  const monthYear = dateParts ? `${dateParts.monthName} · ${dateParts.year}` : "iyun · 2026";

  return (
    <section className={cn("wedding-backdrop relative mx-auto w-full max-w-[560px] overflow-hidden rounded-lg p-4 shadow-2xl sm:p-8", className)}>
      {data.coverImageUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(90deg, rgba(10,13,14,.78), rgba(25,20,19,.45), rgba(10,13,14,.78)), url(${data.coverImageUrl})` }}
        />
      ) : null}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {["♥", "❤", "💗", "💕", "♥", "❤", "💗", "♥"].map((heart, index) => (
          <span
            key={`${heart}-${index}`}
            className="floating-heart absolute text-rose-300"
            style={{
              left: `${8 + index * 12}%`,
              top: `${index % 2 === 0 ? 5 : 14}%`,
              animationDelay: `${index * 0.7}s`,
              fontSize: `${14 + (index % 3) * 5}px`
            }}
          >
            {heart}
          </span>
        ))}
      </div>

      <article className="invitation-paper relative mx-auto min-h-[720px] max-w-[430px] overflow-hidden rounded-[1.65rem] border border-white/70 px-7 py-8 text-center shadow-[0_28px_90px_rgba(0,0,0,0.35)] sm:px-10">
        <div className="absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg">
          <Heart className="h-6 w-6 fill-rose-500 text-rose-500" />
        </div>

        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-rose-500">
          Sizni hayotimizdagi eng baxtli kunga taklif qilamiz
        </p>
        <h1 className="wedding-script mt-5 text-6xl leading-none text-slate-950 sm:text-7xl">Bizning to'yimiz</h1>
        <p className="wedding-script mt-5 text-4xl leading-tight text-slate-950">
          {data.groomName || "Kuyov"} <span className="text-rose-500">&</span> {data.brideName || "Kelin"}
        </p>

        <div className="mx-auto mt-10 h-px w-32 bg-gradient-to-r from-transparent via-rose-200 to-transparent" />

        <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          <span>{weekday}</span>
          <span className="wedding-script text-5xl font-normal tracking-normal text-rose-500">{day}</span>
          <span>{data.eventTime ? `Soat ${data.eventTime}` : "Soat 18:00"}</span>
        </div>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">{monthYear}</p>

        <div className="mt-8 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-500">
          <Clock className="h-4 w-4" />
          Bizning unutilmas kunimizgacha
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            ["34", "Kun"],
            ["02", "Soat"],
            ["35", "Daqiqa"],
            ["00", "Soniya"]
          ].map(([value, label]) => (
            <div key={label} className={cn("rounded-md px-2 py-3", isModern ? "bg-emerald-50" : "bg-rose-50")}>
              <p className="wedding-script text-3xl leading-none text-rose-500">{value}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-9 space-y-2">
          <p className="text-2xl leading-none text-slate-950" dir="rtl">وَخَلَقْنَاكُمْ أَزْوَاجًا</p>
          <p className="font-serif text-sm italic text-slate-500">Biz sizlarni juft-juft qilib yaratdik</p>
        </div>

        <p className="mx-auto mt-7 max-w-xs text-sm leading-7 text-slate-600">{data.hostText}</p>

        <div className="mt-7 rounded-lg border border-rose-100 bg-white/70 p-4 text-left">
          <div className="flex gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-rose-500" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Manzil</p>
              <p className="mt-1 font-semibold text-slate-950">{data.venueName || "To'yxona"}</p>
              <p className="mt-1 text-sm text-slate-600">{data.venueAddress || "Manzil"}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200">
          <MapPin className="h-4 w-4" />
          Manzil joylashuvini ochish
        </div>

        <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-500">
          <CalendarDays className="h-4 w-4" />
          {formatDateTime(data.eventDate, data.eventTime) || "Sana tanlanmagan"}
        </div>
      </article>
    </section>
  );
}
