import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * Distributed rate limiter.
 * - If UPSTASH_REDIS_REST_URL/TOKEN are set → durable, cross-instance (Upstash Redis).
 * - Otherwise → in-memory fallback (per serverless instance; fine for dev / low volume).
 */

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN

let upstash: Ratelimit | null = null
if (hasUpstash) {
  upstash = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(60, '60 s'),
    prefix: 'fitboard:rl',
    analytics: true,
  })
}

// In-memory fallback
const mem = new Map<string, { count: number; resetAt: number }>()
function memLimit(key: string, max = 60, windowMs = 60_000): boolean {
  const now = Date.now()
  const e = mem.get(key)
  if (!e || now > e.resetAt) {
    mem.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (e.count >= max) return false
  e.count++
  return true
}

/** Returns true if the request is allowed, false if rate-limited. */
export async function rateLimit(identifier: string): Promise<boolean> {
  if (upstash) {
    const { success } = await upstash.limit(identifier)
    return success
  }
  return memLimit(identifier)
}

export const rateLimitBackend = hasUpstash ? 'upstash' : 'memory'
