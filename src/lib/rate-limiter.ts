/**
 * IP 限流器 + 全域每日總量上限。
 * - IP 限流：每個 IP 每天最多 10 次（僅使用預設 Key 時）
 * - 全域上限：預設 Key 每天最多被呼叫 300 次，超過則關閉服務
 *
 * 使用檔案持久化，server 重啟不歸零。
 */

import fs from "fs";
import path from "path";

const IP_DAILY_LIMIT = 10;
const GLOBAL_DAILY_LIMIT = 300;

// 持久化檔案路徑
const DATA_DIR = path.join(process.cwd(), ".rate-limit-data");
const GLOBAL_FILE = path.join(DATA_DIR, "global.json");
const IP_FILE = path.join(DATA_DIR, "ip.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getNextMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
}

// --- 全域計數器（持久化） ---

interface GlobalData {
  count: number;
  resetAt: number;
}

function loadGlobal(): GlobalData {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(GLOBAL_FILE, "utf-8");
    return JSON.parse(raw) as GlobalData;
  } catch {
    return { count: 0, resetAt: getNextMidnight() };
  }
}

function saveGlobal(data: GlobalData) {
  ensureDataDir();
  fs.writeFileSync(GLOBAL_FILE, JSON.stringify(data));
}

// --- IP 計數器（持久化） ---

interface IpStore {
  resetAt: number;
  entries: Record<string, number>;
}

function loadIpStore(): IpStore {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(IP_FILE, "utf-8");
    return JSON.parse(raw) as IpStore;
  } catch {
    return { resetAt: getNextMidnight(), entries: {} };
  }
}

function saveIpStore(data: IpStore) {
  ensureDataDir();
  fs.writeFileSync(IP_FILE, JSON.stringify(data));
}

// --- 公開 API ---

export function checkGlobalLimit(): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const data = loadGlobal();

  // 過了午夜，重置
  if (now >= data.resetAt) {
    const fresh: GlobalData = { count: 1, resetAt: getNextMidnight() };
    saveGlobal(fresh);
    return { allowed: true, remaining: GLOBAL_DAILY_LIMIT - 1 };
  }

  if (data.count >= GLOBAL_DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  data.count += 1;
  saveGlobal(data);
  return { allowed: true, remaining: GLOBAL_DAILY_LIMIT - data.count };
}

export function checkIpLimit(ip: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const store = loadIpStore();

  // 過了午夜，清空所有 IP 記錄
  if (now >= store.resetAt) {
    const fresh: IpStore = {
      resetAt: getNextMidnight(),
      entries: { [ip]: 1 },
    };
    saveIpStore(fresh);
    return { allowed: true, remaining: IP_DAILY_LIMIT - 1 };
  }

  const count = store.entries[ip] || 0;

  if (count >= IP_DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  store.entries[ip] = count + 1;
  saveIpStore(store);
  return { allowed: true, remaining: IP_DAILY_LIMIT - (count + 1) };
}
