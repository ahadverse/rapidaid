import { Redis } from 'ioredis';
import { config } from '../../config';

// Caching is opt-in: with no REDIS_URL every helper below degrades to a miss so
// the API keeps serving from Postgres instead of failing.
let client: Redis | null = null;

if (config.redisUrl) {
  client = new Redis(config.redisUrl, {
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
    lazyConnect: true,
  });

  client.on('error', (error: Error) => {
    console.error(`Redis unavailable, serving uncached: ${error.message}`);
  });

  client.connect().catch(() => undefined);
}

export const isCacheEnabled = (): boolean => client !== null;

export const getCached = async <T>(key: string): Promise<T | null> => {
  if (!client) {
    return null;
  }

  try {
    const cached = await client.get(key);

    return cached ? (JSON.parse(cached) as T) : null;
  } catch {
    return null;
  }
};

export const setCached = async (key: string, value: unknown, ttlSeconds: number): Promise<void> => {
  if (!client) {
    return;
  }

  try {
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    return;
  }
};

export const invalidateCache = async (prefix: string): Promise<void> => {
  if (!client) {
    return;
  }

  try {
    const keys = await client.keys(`${prefix}*`);

    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch {
    return;
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (client) {
    await client.quit().catch(() => undefined);
  }
};

export default client;
