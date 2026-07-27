
// ---------------------------------------------------------------------------
// Shared result type pattern: every service function returns a discriminated
// union instead of throwing for "expected" failure cases (not authenticated,
// not found, forbidden, validation). This keeps the controller's job to a
// single job — map `result.status` straight onto an HTTP status code — and
// keeps the service itself free of any Express/HTTP knowledge, so it stays
// callable from anywhere (a script, a test, a future admin tool).
//
// Genuinely unexpected errors (a DB connection drop, a bug) still throw
// normally and should be caught by the controller's own try/catch, same as
// your original createPost did.
// ---------------------------------------------------------------------------

import { PostStatus } from "@prisma/client";
import { prisma } from "../../config/db";
import { publishPostTarget } from "../publisher.service";
import { CreatePostInput, PublishPostOutcome } from "../../types/post";

type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

// ---------------------------------------------------------------------------
// createPostRecord — validates ownership of the target accounts, then
// creates the Post + its PostTargets in one write.
// ---------------------------------------------------------------------------


export async function createPostRecord(
  input: CreatePostInput
): Promise<ServiceResult<Awaited<ReturnType<typeof prisma.post.create>>>> {
  const { userId, content, targetAccountIds, mediaUrls, scheduledAt } = input;

  if (!targetAccountIds || targetAccountIds.length === 0) {
    return { ok: false, status: 400, message: 'At least one target account is required' };
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });

  if (!profile) {
    return { ok: false, status: 404, message: 'Profile not found' };
  }

  // Confirm every requested account actually belongs to this profile —
  // prevents posting through someone else's connected account.
  const ownedAccounts = await prisma.socialAccount.findMany({
    where: { id: { in: targetAccountIds }, profileId: profile.id },
  });

  if (ownedAccounts.length !== targetAccountIds.length) {
    return { ok: false, status: 403, message: 'One or more accounts do not belong to you' };
  }

  const isScheduled = Boolean(
    scheduledAt && scheduledAt !== 'null' && scheduledAt !== 'undefined'
  );
  const initialStatus: PostStatus = isScheduled ? 'SCHEDULED' : 'DRAFT';

  const post = await prisma.post.create({
    data: {
      profileId: profile.id,
      content: content || '',
      mediaUrls,
      status: initialStatus,
      scheduledAt: isScheduled ? new Date(scheduledAt as string) : null,
      targets: {
        create: ownedAccounts.map((account) => ({
          socialAccountId: account.id,
          status: initialStatus,
        })),
      },
    },
    include: { targets: { include: { socialAccount: true } } },
  });

  return { ok: true, data: post };
}

// ---------------------------------------------------------------------------
// publishPost — fetches an existing post (verifying ownership), publishes
// every target in parallel, and updates the Post's overall status based on
// how many targets succeeded/failed.
// ---------------------------------------------------------------------------


export async function publishPost(
  userId: string,
  postId: string
): Promise<ServiceResult<PublishPostOutcome>> {
  const profile = await prisma.profile.findUnique({ where: { userId } });

  if (!profile) {
    return { ok: false, status: 404, message: 'No profile exists for this user' };
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { targets: { include: { socialAccount: true } } },
  });

  if (!post || post.profileId !== profile.id) {
    return { ok: false, status: 404, message: 'Post not found' };
  }

  if (!post.targets || post.targets.length === 0) {
    return { ok: false, status: 400, message: 'No social accounts targeted for this post' };
  }

  const results = await Promise.allSettled(
    post.targets.map((target) => publishPostTarget(post.id, target.id))
  );

  const failures = results.filter((r) => r.status === 'rejected');
  const allFailed = failures.length === post.targets.length;

  const overallStatus: PostStatus = allFailed
    ? PostStatus.FAILED
    : failures.length > 0
      ? PostStatus.PARTIALLY_PUBLISHED
      : PostStatus.PUBLISHED;

  await prisma.post.update({
    where: { id: post.id },
    data: {
      status: overallStatus,
      publishedAt: overallStatus !== PostStatus.FAILED ? new Date() : null,
    },
  });

  const formattedResults = results.map((result, index) => ({
    targetId: post.targets[index].id,
    platform: post.targets[index].socialAccount.platform,
    status: result.status,
    ...(result.status === 'fulfilled'
      ? { data: result.value }
      : { error: (result.reason as Error)?.message || 'Publishing failed' }),
  }));

  return {
    ok: true,
    data: {
      overallStatus,
      results: formattedResults,
      hasFailures: failures.length > 0,
    },
  };
}