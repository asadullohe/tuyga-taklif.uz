export type RateLimitOptions = {
  limit: number;
  windowMs: number;
  nowMs?: number;
};

export type RateLimitBucket = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

export type RateLimitStore = Map<string, RateLimitBucket>;

const defaultStore: RateLimitStore = new Map();

export function createRateLimitStore(): RateLimitStore {
  return new Map();
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions,
  store: RateLimitStore = defaultStore
): RateLimitResult {
  const nowMs = options.nowMs ?? Date.now();
  const safeKey = key || "anonymous";
  const bucket = store.get(safeKey);

  if (!bucket || nowMs >= bucket.resetAt) {
    const resetAt = nowMs + options.windowMs;
    store.set(safeKey, { count: 1, resetAt });
    return {
      allowed: true,
      limit: options.limit,
      remaining: Math.max(0, options.limit - 1),
      resetAt,
      retryAfterSeconds: 0
    };
  }

  if (bucket.count >= options.limit) {
    return {
      allowed: false,
      limit: options.limit,
      remaining: 0,
      resetAt: bucket.resetAt,
      retryAfterSeconds: getRetryAfterSeconds(bucket.resetAt, nowMs)
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    limit: options.limit,
    remaining: Math.max(0, options.limit - bucket.count),
    resetAt: bucket.resetAt,
    retryAfterSeconds: 0
  };
}

function getRetryAfterSeconds(resetAt: number, nowMs: number) {
  return Math.max(1, Math.ceil((resetAt - nowMs) / 1000));
}
