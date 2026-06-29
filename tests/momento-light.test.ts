import assert from "node:assert/strict";
import test from "node:test";
import {
  getCalendarModel,
  getCountdownParts,
  getEventDateTimeMs,
  getMomentoText,
  momentoLightFallbacks
} from "../src/lib/momento-light";
import type { WeddingFormData } from "../src/types";

const baseData: WeddingFormData = {
  brideName: "Safiya",
  groomName: "Timur",
  eventDate: "2026-07-25",
  eventTime: "17:00",
  venueName: "AFROSIYOB",
  venueAddress: "Farg'ona",
  hostText: "Sizni to'yimizga taklif qilamiz."
};

test("getCalendarModel builds an event month and highlights the wedding day", () => {
  const calendar = getCalendarModel("2026-07-25");
  const eventDay = calendar.days.find((day) => day.isEventDay);

  assert.equal(calendar.monthLabel, "IYUL 2026");
  assert.equal(eventDay?.day, 25);
  assert.equal(calendar.days.filter((day) => day.day === null).length, 2);
});

test("getCountdownParts returns remaining time before the event", () => {
  const eventMs = getEventDateTimeMs("2026-07-25", "17:00", 300);
  const nowMs = getEventDateTimeMs("2026-07-24", "15:30", 300);

  assert.deepEqual(getCountdownParts(eventMs, nowMs!), {
    days: 1,
    hours: 1,
    minutes: 30,
    seconds: 0,
    isPast: false
  });
});

test("getCountdownParts returns zero state after the event", () => {
  const eventMs = getEventDateTimeMs("2026-07-25", "17:00", 300);
  const nowMs = getEventDateTimeMs("2026-07-26", "17:00", 300);

  assert.deepEqual(getCountdownParts(eventMs, nowMs!), {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: true
  });
});

test("getMomentoText falls back when optional fields are empty", () => {
  assert.equal(getMomentoText(baseData, "openingQuote"), momentoLightFallbacks.openingQuote);
  assert.equal(
    getMomentoText({ ...baseData, openingQuote: "Biz bilan bo'ling" }, "openingQuote"),
    "Biz bilan bo'ling"
  );
});
