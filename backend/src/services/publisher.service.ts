import { PostStatus, SocialPlatform } from "@prisma/client";
import { prisma } from "../config/db";
import { PublishInput, PublishResult } from "../types/social";
import {
  isImageFilePath,
  isTokenExpiredError,
  isVideoFilePath,
} from "../utils/multer";
import { postToLinkedIn } from "./linkedin/linkedin.service";

/**
 * Central dispatcher: Validates platform media restrictions and dispatches to platform publishers.
 */
export async function dispatchPublish(
  platform: SocialPlatform,
  input: PublishInput,
): Promise<PublishResult> {
  const mediaPaths = input.mediaUrls || [];
  const videoPaths = mediaPaths.filter((path) => isVideoFilePath(path));
  const imagePaths = mediaPaths.filter((path) => isImageFilePath(path));

  try {
    switch (platform) {
      case "LINKEDIN": {
        if (videoPaths.length > 0 && imagePaths.length > 0) {
          throw new Error(
            "LinkedIn does not support mixing videos and images in a single post.",
          );
        }
        if (videoPaths.length > 1) {
          throw new Error(
            `LinkedIn allows a maximum of 1 video per post. Attached: ${videoPaths.length}`,
          );
        }
        if (imagePaths.length > 9) {
          throw new Error(
            `LinkedIn allows a maximum of 9 images per post. Attached: ${imagePaths.length}`,
          );
        }

        return await postToLinkedIn(input);
      }

      case "TWITTER": {
        if (mediaPaths.length > 4) {
          throw new Error(
            `Twitter/X allows a maximum of 4 media items per post. Attached: ${mediaPaths.length}`,
          );
        }

        return await postToLinkedIn(input);
      }

      case "FACEBOOK": {
        if (videoPaths.length > 0 && imagePaths.length > 0) {
          throw new Error(
            "Facebook Graph API does not support mixing videos and photos in a single post.",
          );
        }
        if (videoPaths.length > 1) {
          throw new Error(
            `Facebook API allows a maximum of 1 video per feed post. Attached: ${videoPaths.length}`,
          );
        }

        return await postToLinkedIn(input);
      }

      case "INSTAGRAM": {
        if (mediaPaths.length === 0) {
          throw new Error(
            "Instagram requires at least one image or video to create a post.",
          );
        }
        if (mediaPaths.length > 20) {
          throw new Error(
            `Instagram allows a maximum of 20 media items per post. Attached: ${mediaPaths.length}`,
          );
        }

        return await postToLinkedIn(input);
      }

      default:
        throw new Error(`No publisher implemented for platform: ${platform}`);
    }
  } catch (error: any) {
    // 1. If it's an API error (Axios / External HTTP request)
    if (error.response) {
      const status = error.response.status;
      const apiData = error.response.data;

      console.error(`[${platform} API Error ${status}]:`, apiData);

      // Extract LinkedIn / platform specific error message strings
      const detailedMessage =
        apiData?.message ||
        apiData?.error_description ||
        apiData?.error?.message ||
        JSON.stringify(apiData);

      throw new Error(`Failed to publish on ${platform}: ${detailedMessage}`);
    }

    // 2. If it's a validation error or standard JavaScript Error thrown above
    if (error instanceof Error) {
      throw error;
    }

    // 3. Fallback for unexpected error types
    throw new Error(
      `An unexpected error occurred while publishing to ${platform}.`,
    );
  }
}

export async function publishPostTarget(postId: string, postTargetId: string) {
  const target = await prisma.postTarget.findUniqueOrThrow({
    where: { id: postTargetId },
    include: { post: true, socialAccount: true },
  });

  // 1. Mark THIS TARGET as PUBLISHING
  await prisma.postTarget.update({
    where: { id: postTargetId },
    data: { status: PostStatus.PENDING },
  });

  try {
    // 2. Dispatch to the platform API
    const { externalPostId } = await dispatchPublish(
      target.socialAccount.platform,
      {
        profileId: target.post.profileId,
        socialAccountId: target.socialAccountId,
        content: target.post.content,
        mediaUrls: Array.isArray(target.post.mediaUrls)
          ? (target.post.mediaUrls as string[])
          : undefined,
      },
    );

    // 3. Mark ONLY THIS TARGET as PUBLISHED
    await prisma.postTarget.update({
      where: { id: postTargetId },
      data: {
        status: PostStatus.PUBLISHED,
        externalPostId,
        publishedAt: new Date(),
        errorMessage: null,
      },
    });

    return {
      targetId: postTargetId,
      externalPostId,
      platform: target.socialAccount.platform,
    };
  } catch (err) {
    const tokenExpired = isTokenExpiredError(err);
    const errorMessage = tokenExpired
      ? `${target.socialAccount.platform} account needs to be reconnected.`
      : ((err as Error).message?.slice(0, 1000) ?? "Unknown error");

    // 4. Mark ONLY THIS TARGET as FAILED
    try {
      await prisma.postTarget.update({
        where: { id: postTargetId },
        data: {
          status: "FAILED",
          errorMessage,
        },
      });
    } catch (dbErr) {
      console.error(
        `Failed to update PostTarget ${postTargetId} error status in DB:`,
        dbErr,
      );
    }

    throw new Error(errorMessage);
  }
}