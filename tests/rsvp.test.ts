import assert from "node:assert/strict";
import test from "node:test";
import {
  findDuplicateRsvp,
  getRsvpStats,
  normalizeRsvpGuestName,
  toPublicRsvps
} from "../src/lib/rsvp";
import type { Rsvp } from "../src/types";

function makeRsvp(patch: Partial<Rsvp> = {}): Rsvp {
  return {
    id: patch.id ?? "rsvp-1",
    invitationId: patch.invitationId ?? "invitation-1",
    guestName: patch.guestName ?? "Ali Valiyev",
    status: patch.status ?? "attending",
    guestCount: patch.guestCount ?? 1,
    reminderEnabled: patch.reminderEnabled ?? false,
    telegramChatId: patch.telegramChatId ?? null,
    reminderSentAt: patch.reminderSentAt ?? null,
    createdAt: patch.createdAt ?? "2026-06-25T05:00:00.000Z"
  };
}

test("normalizeRsvpGuestName collapses whitespace and ignores case", () => {
  assert.equal(normalizeRsvpGuestName("  ALI   Valiyev  "), "ali valiyev");
});

test("findDuplicateRsvp matches guests by normalized name", () => {
  const existing = makeRsvp({ guestName: "Ali   Valiyev" });
  assert.equal(findDuplicateRsvp([existing], " ali valiyev "), existing);
});

test("getRsvpStats counts responses and attending guests", () => {
  assert.deepEqual(
    getRsvpStats([
      makeRsvp({ status: "attending", guestCount: 2 }),
      makeRsvp({ status: "not_attending", guestCount: 0 }),
      makeRsvp({ status: "attending", guestCount: 1 })
    ]),
    { total: 3, attending: 2, notAttending: 1, guests: 3 }
  );
});

test("toPublicRsvps anonymizes guest names and hides telegram chat ids", () => {
  const publicRsvps = toPublicRsvps([
    makeRsvp({ id: "one", guestName: "Ali", reminderEnabled: true, telegramChatId: "123" }),
    makeRsvp({ id: "two", guestName: "Vali", reminderEnabled: true, telegramChatId: null })
  ]);

  assert.equal(publicRsvps[0].guestName, "Mehmon #1");
  assert.equal(publicRsvps[0].telegramChatId, null);
  assert.equal(publicRsvps[0].reminderEnabled, true);
  assert.equal(publicRsvps[1].guestName, "Mehmon #2");
  assert.equal(publicRsvps[1].telegramChatId, null);
  assert.equal(publicRsvps[1].reminderEnabled, false);
});
