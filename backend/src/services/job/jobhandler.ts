// services/jobHandlers.ts
import { JobType } from '@prisma/client';
import { prisma } from '../../config/db';
import { publishPostTarget } from '../publisher.service';

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

type JobHandler = (payload: any) => Promise<void>;

export const handlers: Record<JobType, JobHandler> = {
  [JobType.PUBLISH_POST]: async (payload: { postId: string }) => {
    const post = await prisma.post.findUnique({
      where: { id: payload.postId },
      include: { targets: true },
    });

    if (!post) {
      throw new Error(`Post with ID ${payload.postId} not found.`);
    }

    // Publish to all social platforms attached to this post
    for (const target of post.targets) {
      await publishPostTarget(post.id, target.id);
      await sleep(2000); // Throttling delay between social network API calls
    }

    // Update main Post status to PUBLISHED upon success
    await prisma.post.update({
      where: { id: post.id },
      data: { status: 'PUBLISHED' },
    });
  },

  [JobType.SEND_EMAIL]: async (payload: any) => {
    // Placeholder for future job types
  },

};

export async function processJob(jobType: JobType, payload: any) {
  const handler = handlers[jobType];
  if (!handler) {
    throw new Error(`No handler found for job type: ${jobType}`);
  }
  await handler(payload);
}