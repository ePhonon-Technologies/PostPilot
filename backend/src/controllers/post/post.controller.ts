import { Response } from "express";
import { AuthedRequest } from "../../types/auth";
import {
  createPostRecord,
  publishPost,
} from "../../services/post/post.service";
import { schedulePostService } from "../../services/scheduler/scheduler.service";
import { queueState } from "../../utils/queueState";
import { JobType, PostStatus, QueueStatus } from "@prisma/client";
import { prisma } from "../../config/db";

// ---------------------------------------------------------------------------
// POST /posts/:postId/publish
// ---------------------------------------------------------------------------

export async function publishPostNow(req: AuthedRequest, res: Response) {
  const userId = req.auth?.userId;
  const { postId } = req.params;

  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const result = await publishPost(userId, postId as string);

  if (!result.ok) {
    return res.status(result.status).json({ message: result.message });
  }

  const { overallStatus, results, hasFailures } = result.data;

  return res.status(hasFailures ? 207 : 200).json({
    message: hasFailures
      ? "Some targets failed to publish"
      : "Published successfully to all targets",
    overallStatus,
    results,
  });
}

// ---------------------------------------------------------------------------
// POST /posts
// ---------------------------------------------------------------------------

export async function createPost(req: AuthedRequest, res: Response) {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { content, scheduledAt } = req.body;

    // Normalize targetAccountIds — FormData can deliver this as either a
    // single string or an array depending on how many were selected.
    let targetAccountIds: string[] = [];
    if (req.body.targetAccountIds) {
      targetAccountIds = Array.isArray(req.body.targetAccountIds)
        ? req.body.targetAccountIds
        : [req.body.targetAccountIds];
    }

    const files = (req.files as Express.Multer.File[]) || [];
    const mediaUrls = files.map((file) => file.path);

    // 1. Create the Post in the DB via your existing service helper
    const result = await createPostRecord({
      userId,
      content,
      targetAccountIds,
      mediaUrls,
      scheduledAt,
    });

    if (!result.ok) {
      return res.status(result.status).json({ message: result.message });
    }

    const post = result.data;
    const isScheduled = post.status === PostStatus.SCHEDULED;

    // 2. If it is scheduled, insert a job into the Queue and flip queueState
    if (isScheduled && post.scheduledAt) {
      await prisma.queue.upsert({
        where: {
          entityKey: `POST_${post.id}`, // Prevents duplicate jobs for the same post ID
        },
        update: {
          publishAt: new Date(post.scheduledAt),
          status: QueueStatus.PENDING,
          payload: { postId: post.id },
        },
        create: {
          jobType: JobType.PUBLISH_POST,
          entityKey: `POST_${post.id}`,
          payload: { postId: post.id },
          publishAt: new Date(post.scheduledAt),
          status: QueueStatus.PENDING,
        },
      });

      // Signal the cron worker to start polling the DB
      queueState.setHasJobs(true);
    }

    return res.status(201).json({
      message: isScheduled
        ? "Post scheduled successfully"
        : "Post created successfully",
      post: post,
    });
  } catch (error: any) {
    console.error("Error in createPost:", error);
    return res.status(500).json({
      message: error.message || "Failed to create post",
    });
  }
}

export async function schedulePostController(
  req: AuthedRequest,
  res: Response,
) {
  try {
    const { postId } = req.params;
    const { scheduledAt } = req.body;
    const userId = req.auth?.userId;

    if (!scheduledAt) {
      return res
        .status(400)
        .json({ error: "scheduledAt timestamp is required." });
    }

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const result = await schedulePostService(
      postId as string,
      userId,
      scheduledAt,
    );

    return res.status(200).json({
      message: "Post successfully scheduled!",
      post: result.updatedPost,
      queue: result.queueEntry,
    });
  } catch (error: any) {
    if (
      error.message.includes("Invalid schedule date") ||
      error.message.includes("Post not found")
    ) {
      return res.status(400).json({ error: error.message });
    }

    console.error("[Schedule Post Error]:", error);
    return res.status(500).json({ error: "Failed to schedule post." });
  }
}
