import type { WeddingFormData } from "@/types";

export type CalendarDay = {
  key: string;
  day: number | null;
  isEventDay: boolean;
};

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
};

export const momentoLightFallbacks = {
  openingQuote: "Sizning ishtirokingiz — biz uchun eng qadrli sovg'a",
  dressCodeText: "Rasmiy, yorug' ranglar afzal.",
  formatText: "Halol, tantanali tadbir.",
  giftText: "Biz uchun eng muhimi — to'y oqshomida yonimizda bo'lishingiz.",
  calendarNote: "yurak — to'y kuni"
};

const uzMonths = [
  "YANVAR",
  "FEVRAL",
  "MART",
  "APREL",
  "MAY",
  "IYUN",
  "IYUL",
  "AVGUST",
  "SENTYABR",
  "OKTYABR",
  "NOYABR",
  "DEKABR"
];

export function getMomentoText(data: WeddingFormData, key: keyof typeof momentoLightFallbacks) {
  const value = data[key];
  return typeof value === "string" && value.trim() ? value : momentoLightFallbacks[key];
}

export function getEventDateTimeMs(eventDate: string, eventTime = "00:00", timezoneOffsetMinutes = 300) {
  if (!eventDate) return null;
  const [year, month, day] = eventDate.split("-").map(Number);
  const [hour = 0, minute = 0] = eventTime.split(":").map(Number);
  if (![year, month, day, hour, minute].every(Number.isFinite)) return null;
  return Date.UTC(year, month - 1, day, hour, minute) - timezoneOffsetMinutes * 60 * 1000;
}

export function getCountdownParts(eventMs: number | null, nowMs: number): CountdownParts {
  const diff = eventMs === null ? 0 : Math.max(0, eventMs - nowMs);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isPast: diff === 0
  };
}

export function getCalendarModel(eventDate: string): { monthLabel: string; days: CalendarDay[] } {
  const [year, month, eventDay] = eventDate.split("-").map(Number);
  if (![year, month, eventDay].every(Number.isFinite)) {
    return { monthLabel: "", days: [] };
  }

  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const mondayOffset = (firstDay.getUTCDay() + 6) % 7;
  const days: CalendarDay[] = [];

  for (let index = 0; index < mondayOffset; index += 1) {
    days.push({ key: `empty-${index}`, day: null, isEventDay: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push({ key: `day-${day}`, day, isEventDay: day === eventDay });
  }

  return {
    monthLabel: `${uzMonths[month - 1] ?? ""} ${year}`.trim(),
    days
  };
}
