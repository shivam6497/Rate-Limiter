import redis from "../redis/client.js";
const WISHLIST = [];
const rateLimiter = (options, name) => {
    return async (req, res, next) => {
        const ip = req.ip;
        const normalizeIp = ip === "::1" ? "127.0.0.1" : ip;
        if (WISHLIST.includes(normalizeIp)) {
            console.log(`IP ${normalizeIp} is whitelisted. Skipping rate limiting.`);
            next();
            return;
        }
        const key = `rate_limit:${name}:${normalizeIp}`;
        const requests = await redis.incr(key);
        if (requests == 1) {
            await redis.expire(key, options.windowInSeconds);
        }
        const ttl = await redis.ttl(key);
        res.setHeader("X-RateLimit-Limit", options.maxRequests.toString());
        res.setHeader("X-RateLimit-Remaining", Math.max(options.maxRequests - requests, 0).toString());
        res.setHeader("X-RateLimit-Reset", (Date.now() + ttl * 1000).toString());
        res.setHeader("Retry-After", ttl);
        if (requests > options.maxRequests) {
            res.status(429).json({
                success: false,
                message: "Too many requests. Please try again later.",
                retryAfter: ttl,
                requestMade: requests,
                limit: options.maxRequests,
            });
            return;
        }
        next();
    };
};
export default rateLimiter;
//# sourceMappingURL=rateLimiter.js.map