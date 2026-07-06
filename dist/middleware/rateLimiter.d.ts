import type { Request, Response, NextFunction } from "express";
interface RateLimitOptions {
    maxRequests: number;
    windowInSeconds: number;
}
declare const rateLimiter: (options: RateLimitOptions, name: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export default rateLimiter;
//# sourceMappingURL=rateLimiter.d.ts.map