import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";

// Cache middleware: reads from Redis, else lets request continue
export async function cacheMiddleware(
  req: NextRequest,
  keyBuilder: (req: NextRequest) => string
) {
  const cacheKey = keyBuilder(req);
  const cachedData = await redis.get<string>(cacheKey);

  if (cachedData) {
  try {
    const parsed = JSON.parse(cachedData);

    if (!parsed || !Array.isArray(parsed.products)) {
      console.warn(`[CACHE INVALID] Key: ${cacheKey} — clearing`);
      await redis.del(cacheKey);
      return null; // Let route handler run fresh
    }

    console.log(`[CACHE HIT] Key: ${cacheKey}`);
    return NextResponse.json(parsed, { status: 200 });
  } catch {
    await redis.del(cacheKey);
    return null;
  }
}
  return null;
}

// Save data to Redis
export async function setCache(key: string, data: any, ttlSeconds = 60) {
  const serialized =
    typeof data === "string" ? data : JSON.stringify(data);
  await redis.set(key, serialized, {
    ex: ttlSeconds,
  });
}

// Delete cache keys matching a pattern
export async function invalidateCache(keyPattern: string) {
  // This works with local Redis (ioredis)
  if ("keys" in redis) {
    const keys = await (redis as any).keys(keyPattern);
    if (keys.length > 0) {
      await (redis as any).del(keys);
    }
  } else {
    // Upstash doesn't support KEYS pattern, you must track keys manually
    console.warn(
      "Pattern-based deletion is not supported in Upstash Redis — store keys explicitly if needed."
    );
  }
}
