/** USDC on Arc's ERC-20 view uses 6 decimals. Demo amounts are bigint micro-units. */
export function formatUSDC(micro: bigint, opts: { decimals?: number; compact?: boolean } = {}): string {
  const { decimals = 2, compact = false } = opts;
  const whole = micro / 1_000_000n;
  const frac = micro % 1_000_000n;
  const fracStr = frac.toString().padStart(6, "0").slice(0, decimals).padEnd(decimals, "0");
  const wholeNum = Number(whole);
  const grouped = compact && wholeNum >= 1_000_000
    ? (wholeNum / 1_000_000).toFixed(1) + "M"
    : compact && wholeNum >= 1_000
      ? (wholeNum / 1_000).toFixed(1) + "K"
      : wholeNum.toLocaleString("en-US");
  return decimals > 0 ? `${grouped}.${fracStr}` : grouped;
}

/** "2500" (USDC) -> 2500000000n micro-units */
export function parseUSDC(input: string): bigint {
  const clean = input.replace(/[^0-9.]/g, "");
  if (!clean) return 0n;
  const [w, f = ""] = clean.split(".");
  return BigInt(w || "0") * 1_000_000n + BigInt((f + "000000").slice(0, 6));
}

export function shortenAddress(addr: string, chars = 4): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 2 + chars)}…${addr.slice(-chars)}`;
}

export function timeAgo(ts: number): string {
  const s = Math.max(1, Math.floor(Date.now() / 1000) - ts);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

export function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function deadlineLabel(ts: number): string {
  const diff = ts - Math.floor(Date.now() / 1000);
  if (diff <= 0) return "overdue";
  const d = Math.floor(diff / 86400);
  if (d === 0) return "today";
  if (d === 1) return "tomorrow";
  if (d < 30) return `in ${d}d`;
  return `in ${Math.floor(d / 30)}mo`;
}

export function fakeTxHash(seed: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, "0");
  let out = "";
  let s = seed;
  for (let i = 0; i < 8; i++) {
    for (const c of s) {
      h ^= c.charCodeAt(0);
      h = Math.imul(h, 0x01000193);
    }
    out += hex(h);
    s = out;
  }
  return "0x" + out.slice(0, 64);
}
