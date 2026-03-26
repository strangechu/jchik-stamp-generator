/**
 * 簡易的記憶體內 IP 限流器。
 * 當使用者未提供自己的 API Key 而使用預設 Key 時啟用。
 * 限制：每個 IP 每天最多 10 次。
 */

const DAILY_LIMIT = 10;

interface RateEntry {
  count: number;
  resetAt: number; // timestamp
}

const store = new Map<string, RateEntry>();

function getNextMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
}

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now >= entry.resetAt) {
    store.set(ip, { count: 1, resetAt: getNextMidnight() });
    return { allowed: true, remaining: DAILY_LIMIT - 1 };
  }

  if (entry.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: DAILY_LIMIT - entry.count };
}
