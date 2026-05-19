import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

type Limiter = { limit: (key: string) => Promise<{ success: boolean }> }

function build(): Limiter {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    // Dev fallback: no rate limiting when Upstash creds are absent.
    return { limit: async () => ({ success: true }) }
  }
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(3, "60 m"),
    analytics: false,
  })
}

export const ratelimit: Limiter = build()
