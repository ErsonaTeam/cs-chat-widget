import Redis from 'ioredis';
import { randomBytes } from 'crypto';

// Singleton Redis instance
let redisClient: Redis | null = null;

/**
 * Initialize and return Redis client
 */
export async function getRedisClient(): Promise<Redis> {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });
  }

  return redisClient;
}

/**
 * Generate a unique key for storing message data
 */
export function generateMessageKey(): string {
  return `msg_${Date.now()}_${randomBytes(8).toString('hex')}`;
}

/**
 * Store message data in Redis with TTL
 * @param key - Unique key for the message
 * @param data - Message data to store
 * @param ttlSeconds - Time to live in seconds (default: 300 = 5 minutes)
 */
export async function storeMessageData(
  key: string,
  data: Record<string, unknown>,
  ttlSeconds: number = 300
): Promise<void> {
  const redis = await getRedisClient();
  await redis.setex(key, ttlSeconds, JSON.stringify(data));
}

/**
 * Retrieve message data from Redis
 * @param key - Unique key for the message
 * @returns Message data or null if not found/expired
 */
export async function getMessageData(key: string): Promise<Record<string, unknown> | null> {
  const redis = await getRedisClient();
  const data = await redis.get(key);

  if (!data) {
    return null;
  }

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to parse message data from Redis:', error);
    return null;
  }
}

/**
 * Delete message data from Redis
 * @param key - Unique key for the message
 */
export async function deleteMessageData(key: string): Promise<void> {
  const redis = await getRedisClient();
  await redis.del(key);
}
