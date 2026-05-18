import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(date: string, time: string) {
  if (!date) return "";

  const parts = getUzDateParts(date);
  if (!parts) return "";
  return `${parts.day}-${parts.monthName}, ${parts.year}${time ? `, ${time}` : ""}`;
}

const uzMonths = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr"
];

const uzWeekdays = ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"];

export function getUzDateParts(date: string) {
  const [yearText, monthText, dayText] = date.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  const day = Number(dayText);

  if (!year || monthIndex < 0 || monthIndex > 11 || !day) return null;

  const utcDate = new Date(Date.UTC(year, monthIndex, day));
  return {
    day: String(day).padStart(2, "0"),
    weekday: uzWeekdays[utcDate.getUTCDay()],
    monthName: uzMonths[monthIndex],
    year: String(year)
  };
}

export function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
