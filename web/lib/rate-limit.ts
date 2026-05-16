/**
 * In-memory sliding-window rate limiter.
 *
 * Works per Vercel serverless instance — not globally shared across
 * all instances. At editorial traffic levels this is fine; abuse from
 * a single IP is still caught within the instance that receives
 * their requests (Vercel routes repeat callers to the same region).
 *
 * Usage:
 *   const result = rateLimit(req, { limit: 5, windowMs: 60_000 })
 *   if (!result.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
 */

interface Entry {
  timestamps: number[]
}

const store = new Map<string, Entry>()

// Prune expired entries every 5 minutes to prevent memory growth
let lastPrune = Date.now()
function maybePrune(windowMs: number) {
  const now = Date.now()
  if (now - lastPrune < 5 * 60 * 1000) return
  lastPrune = now
  const cutoff = now - windowMs
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff)
    if (entry.timestamps.length === 0) store.delete(key)
  }
}

/**
 * Extract the real client IP from a Next.js request.
 * Cloudflare sets CF-Connecting-IP; Vercel sets x-forwarded-for.
 */
export function clientIp(req: { headers: { get(key: string): string | null } }): string {
  return (
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

interface RateLimitOptions {
  /** Maximum number of requests allowed within the window */
  limit: number
  /** Window size in milliseconds */
  windowMs: number
  /**
   * Namespace to distinguish separate limiters on the same IP.
   * Defaults to 'default'.
   */
  namespace?: string
}

interface RateLimitResult {
  ok: boolean
  /** Remaining requests in the current window */
  remaining: number
  /** Epoch ms when the oldest in-window request expires */
  resetAt: number
}

export function rateLimit(
  req: { headers: { get(key: string): string | null } },
  options: RateLimitOptions,
): RateLimitResult {
  const { limit, windowMs, namespace = 'default' } = options

  maybePrune(windowMs)

  const ip = clientIp(req)
  const key = `${namespace}:${ip}`
  const now = Date.now()
  const cutoff = now - windowMs

  let entry = store.get(key)
  if (!entry) {
    entry = { timestamps: [] }
    store.set(key, entry)
  }

  // Drop timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff)

  const remaining = Math.max(0, limit - entry.timestamps.length - 1)
  const resetAt = entry.timestamps.length > 0 ? entry.timestamps[0] + windowMs : now + windowMs

  if (entry.timestamps.length >= limit) {
    return { ok: false, remaining: 0, resetAt }
  }

  entry.timestamps.push(now)
  return { ok: true, remaining, resetAt }
}
