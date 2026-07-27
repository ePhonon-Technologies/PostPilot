import { PostStatus } from "@prisma/client";

export interface CreatePostInput {
  userId: string;
  content: string;
  targetAccountIds: string[];
  mediaUrls: string[];
  scheduledAt?: string | null;
}

export interface PublishPostOutcome {
  overallStatus: PostStatus;
  results: Array<{
    targetId: string;
    platform: string;
    status: 'fulfilled' | 'rejected';
    data?: unknown;
    error?: string;
  }>;
  hasFailures: boolean;
}
