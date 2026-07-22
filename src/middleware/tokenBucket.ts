import redisClient from "../redis/client.js";

const MAX_TOKENS = 10;        // bucket capacity
const REFILL_RATE = 2;        // tokens added per second
const TTL = 3600;             // expire bucket after 1hr of inactivity

export async function tokenBucketLimiter(userId: string): Promise<boolean> {
    const key = `token_bucket:${userId}`;
    const now = Date.now() / 1000; // current time in seconds

    // Get current bucket state
    const data = await redisClient.hgetall(key);

    let tokens: number;
    let lastRefill: number;

    if (!data || !data.tokens) {
        // First request — start with a full bucket
        tokens = MAX_TOKENS;
        lastRefill = now;
    } else {
        tokens = parseFloat(data.tokens);
        lastRefill = parseFloat(data.lastRefill ?? String(now));

        // How many seconds have passed since last request?
        const elapsed = now - lastRefill;

        // Add tokens based on elapsed time
        tokens = Math.min(MAX_TOKENS, tokens + elapsed * REFILL_RATE);
        lastRefill = now;
    }

    if (tokens < 1) {
        // Bucket empty — deny request
        await redisClient.hset(key, { tokens, lastRefill });
        await redisClient.expire(key, TTL);
        return false;
    }

    // Consume one token — allow request
    tokens -= 1;
    await redisClient.hset(key, { tokens, lastRefill });
    await redisClient.expire(key, TTL);
    return true;
}