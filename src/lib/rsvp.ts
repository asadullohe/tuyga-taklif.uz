import type { Rsvp } from "@/types";

export type RsvpStats = {
  total: number;
  attending: number;
  notAttending: number;
  guests: number;
};

export type PublicRsvp = Rsvp & {
  telegramChatId: null;
};

const emptyStats: RsvpStats = {
  total: 0,
  attending: 0,
  notAttending: 0,
  guests: 0
};

export function normalizeRsvpGuestName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("uz-Latn-UZ");
}

export function findDuplicateRsvp<T extends { guestName: string }>(rsvps: T[], guestName: string) {
  const normalizedGuestName = normalizeRsvpGuestName(guestName);
  if (!normalizedGuestName) return undefined;

  return rsvps.find((rsvp) => normalizeRsvpGuestName(rsvp.guestName) === normalizedGuestName);
}

export function getRsvpStats(rsvps: Pick<Rsvp, "status" | "guestCount">[]): RsvpStats {
  return rsvps.reduce<RsvpStats>((acc, rsvp) => {
    acc.total += 1;
    if (rsvp.status === "attending") {
      acc.attending += 1;
      acc.guests += rsvp.guestCount;
    } else {
      acc.notAttending += 1;
    }
    return acc;
  }, { ...emptyStats });
}

export function toPublicRsvps(rsvps: Rsvp[]): PublicRsvp[] {
  return rsvps.map((rsvp, index) => ({
    ...rsvp,
    guestName: `Mehmon #${index + 1}`,
    reminderEnabled: Boolean(rsvp.reminderEnabled && rsvp.telegramChatId),
    telegramChatId: null
  }));
}
