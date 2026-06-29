import assert from "node:assert/strict";
import test from "node:test";
import { checkRateLimit, createRateLimitStore } from "../src/lib/rate-limit";

test("checkRateLimit allows requests under the limit", () => {
  const store = createRateLimitStore();

  const first = checkRateLimit("rsvp:demo:127.0.0.1", { limit: 2, windowMs: 60_000, nowMs: 1_000 }, store);
  const second = checkRateLimit("rsvp:demo:127.0.0.1", { limit: 2, windowMs: 60_000, nowMs: 2_000 }, store);

  assert.equal(first.allowed, true);
  assert.equal(first.remaining, 1);
  assert.equal(second.allowed, true);
  assert.equal(second.remaining, 0);
});

test("checkRateLimit blocks requests over the limit", () => {
  const store = createRateLimitStore();

  checkRateLimit("rsvp:demo:127.0.0.1", { limit: 1, windowMs: 60_000, nowMs: 1_000 }, store);
  const blocked = checkRateLimit("rsvp:demo:127.0.0.1", { limit: 1, windowMs: 60_000, nowMs: 2_000 }, store);

  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
  assert.equal(blocked.retryAfterSeconds, 59);
});

test("checkRateLimit resets after the window expires", () => {
  const store = createRateLimitStore();

  checkRateLimit("rsvp:demo:127.0.0.1", { limit: 1, windowMs: 60_000, nowMs: 1_000 }, store);
  const afterWindow = checkRateLimit("rsvp:demo:127.0.0.1", { limit: 1, windowMs: 60_000, nowMs: 61_000 }, store);

  assert.equal(afterWindow.allowed, true);
  assert.equal(afterWindow.remaining, 0);
});
