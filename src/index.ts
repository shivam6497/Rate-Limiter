import express from "express";
import rateLimiter from "./middleware/rateLimiter.js";

const app = express();
app.use(express.json());

const PORT = 3000;

const globalRateLimiter = rateLimiter({
    maxRequests: 10,
    windowInSeconds: 60,
}, "global");

const strictRateLimiter = rateLimiter({
    maxRequests: 3,
    windowInSeconds: 60,
}, "strict");

app.use(globalRateLimiter);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Request successful",
    });
});

app.get("/api/data", strictRateLimiter, (req, res) => {
    res.json({
        success: true,
        data: "Here is your data",
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})