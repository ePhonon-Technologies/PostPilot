import express from "express";
import { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRouter from "./routers/auth.router";
import socialRoutes from "./routers/social.router";
import postRouter from "./routers/post.router";

import { errorHandler } from "./middleware/error.middleware";
import { PassPortAuthenticate } from "./middleware/passport";
import { prisma } from "./config/db";
import { queueState } from "./utils/queueState";
import { startCronWorker } from "./services/scheduler/scheduler.service";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cookieParser());

// credentials: true is required for the browser to send/accept the httpOnly
// auth cookie cross-origin. origin can't be "*" when credentials is true —
// it must be the exact client URL.
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

// Must run BEFORE any routes that call passport.authenticate(), otherwise
// req.login/req.user setup from Passport isn't available yet and the
// /google and /google/callback routes will throw at runtime.

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Server is running" });
});

app.use(PassPortAuthenticate);
app.use("/", authRouter);
app.use("/", socialRoutes);
app.use('/', postRouter);

// errorHandler must stay last so it catches errors from every route above it
app.use(errorHandler);

app.listen(PORT, async () => {
  try {
    // 1. Sync memory flag with DB on startup
    const initialPendingCount = await prisma.queue.count({
      where: { status: 'PENDING' },
    });

    if (initialPendingCount > 0) {
      queueState.setHasJobs(true);
      console.log(`[Queue] Found ${initialPendingCount} pending job(s) in DB.`);
    }

    // 2. Start cron worker
    startCronWorker();

    console.log(`Server running on http://localhost:${PORT}`);
  } catch (error) {
    console.error('[Startup Error] Failed to initialize queue worker:', error);
  }
});