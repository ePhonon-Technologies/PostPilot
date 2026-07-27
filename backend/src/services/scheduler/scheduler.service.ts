import cron from "node-cron";
import { prisma } from "../../config/db";
import { JobType, Prisma, QueueStatus } from "@prisma/client";
import { queueState } from "../../utils/queueState";
import { processJob } from "../job/jobhandler";

export function startCronWorker() {
  console.log("[Cron Worker] Initialized.");

  // Runs every minute
  cron.schedule("* * * * *", async () => {
    // 1. Skip DB query completely if in-memory flag says queue is empty
    if (!queueState.canCheckDb) return;

    try {
      const now = new Date();

      // 2. Fetch pending jobs whose publish time has arrived
      const pendingJobs = await prisma.queue.findMany({
        where: {
          status: QueueStatus.PENDING,
          publishAt: { lte: now },
        },
        take: 10,
      });

      if (pendingJobs.length === 0) {
        queueState.setHasJobs(false);
        return;
      }

      for (const job of pendingJobs) {
        // 3. Lock job in state PROCESSING so no other process grabs it
        await prisma.queue.update({
          where: { id: job.id },
          data: { status: QueueStatus.PROCESSING },
        });

        try {
          // -------------------------------------------------------------
          // 4. HERE IS WHERE YOU USE THE JOB HANDLER!
          // Pass the jobType ("PUBLISH_POST") and payload ({ postId })
          // -------------------------------------------------------------
          await processJob(job.jobType, job.payload);

          // SUCCESS: Remove from Queue and wipe old FailedQueue logs for this entity
          await prisma.$transaction([
            prisma.failedQueue.deleteMany({
              where: { entityKey: job.entityKey },
            }),
            prisma.queue.delete({
              where: { id: job.id },
            }),
          ]);

          console.log(
            `[Queue Success] Job ${job.id} (${job.jobType}) executed cleanly.`,
          );
        } catch (err: any) {
          // FAILURE: Move details to FailedQueue and remove from active Queue
          await prisma.$transaction([
            prisma.failedQueue.create({
              data: {
                jobType: job.jobType,
                entityKey: job.entityKey,
                payload: job.payload as Prisma.InputJsonValue,
                errorMessage: err?.message || "Execution failed",
              },
            }),
            prisma.queue.delete({
              where: { id: job.id },
            }),
          ]);

          console.error(`[Queue Failure] Job ${job.id} failed:`, err?.message);
        }
      }
    } catch (error) {
      console.error("[Cron Worker System Error]:", error);
    }
  });
}

export async function schedulePostService(
  postId: string,
  userId: string,
  scheduledAt: string,
) {
  const targetDate = new Date(scheduledAt);

  if (isNaN(targetDate.getTime()) || targetDate <= new Date()) {
    throw new Error("Invalid schedule date. Time must be in the future.");
  }

  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      userId: userId,
    },
  });

  if (!post) {
    throw new Error("Post not found or unauthorized.");
  }

  // 3. Atomic Transaction: Update Post & Upsert into Generic Queue
  const [updatedPost, queueEntry] = await prisma.$transaction([
    // Update main Post status
    prisma.post.update({
      where: { id: postId },
      data: {
        status: "SCHEDULED",
        scheduledAt: targetDate,
      },
    }),

    // Insert or update existing job in Queue
    prisma.queue.upsert({
      where: {
        entityKey: `POST_${postId}`, // Prevents duplicate scheduling of the same post
      },
      update: {
        publishAt: targetDate,
        status: "PENDING",
        payload: { postId },
      },
      create: {
        jobType: JobType.PUBLISH_POST,
        entityKey: `POST_${postId}`,
        payload: { postId },
        publishAt: targetDate,
        status: "PENDING",
      },
    }),
  ]);

  // 4. Signal to memory flag that jobs exist so the cron worker starts polling
  queueState.setHasJobs(true);

  return { updatedPost, queueEntry };
}
