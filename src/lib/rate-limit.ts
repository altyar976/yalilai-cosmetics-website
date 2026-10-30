/**
 * Small in-memory sliding-window limiter. Good for a single Node process (local preview, one VPS
 * instance). For multi-instance/serverless hosting, swap in a shared store (e.g. Redis/Upstash).
 */
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, limits: { windowMs: number; max: number }[]) {
  const now = Date.now();
  const longest = Math.max(...limits.map((l) => l.windowMs));
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < longest);
  for (const l of limits) {
    if (hits.filter((t) => now - t < l.windowMs).length >= l.max) {
      buckets.set(key, hits);
      return false;
    }
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < longest)) buckets.delete(k);
  }
  return true;
}
