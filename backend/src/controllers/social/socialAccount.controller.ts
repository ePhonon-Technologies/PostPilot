import { Response } from 'express';
import { PrismaClient, SocialPlatform } from '@prisma/client';
import { AuthedRequest } from '../../types/auth';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// GET /social-accounts?platform=LINKEDIN
// Lists the current profile's connected accounts, optionally filtered by
// platform. Read-only — no OAuth mechanics here, that lives in
// socialConnection.controller.ts.
// ---------------------------------------------------------------------------

export async function listSocialAccounts(req: AuthedRequest, res: Response) {
  const userId = req.auth?.userId;
  const { platform } = req.query;

  if (!userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return res.status(404).json({ message: 'No profile exists for this user' });
  }

  const accounts = await prisma.socialAccount.findMany({
    where: {
      profileId: profile.id,
      ...(platform ? { platform: platform as SocialPlatform } : {}),
    },
  });

  res.json(accounts);
}

// ---------------------------------------------------------------------------
// GET /social-accounts/:id
// Fetch a single connected account — useful for a detail view, or for
// confirming ownership before allowing an action on it elsewhere.
// ---------------------------------------------------------------------------

export async function getSocialAccount(req: AuthedRequest, res: Response) {
  const profileId = req.auth?.profileId;
  const { id } = req.params;

  if (!profileId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const account = await prisma.socialAccount.findUnique({ where: { id: id as string } });

  if (!account || account.profileId !== profileId) {
    return res.status(404).json({ message: 'Social account not found' });
  }

  res.json(account);
}


// ---------------------------------------------------------------------------
// DELETE /social-accounts/:id
// Disconnects a LinkedIn (or other platform) account.
// ---------------------------------------------------------------------------

export async function disconnectSocialAccount(
  req: AuthedRequest,
  res: Response,
) {
  const userId = req.auth?.userId;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({
      message: "Not authenticated",
    });
  }

  if (typeof id !== "string") {
    return res.status(400).json({
      message: "Invalid social account id",
    });
  }

  console.log('disconnecting',userId, id);

  const profile = await prisma.profile.findUnique({
    where: {
      userId,
    },
  });

  if (!profile) {
    return res.status(404).json({
      message: "Profile not found",
    });
  }

  const account = await prisma.socialAccount.findFirst({
    where: {
      id,
      profileId: profile.id,
    },

  });

  if (!account) {
    return res.status(404).json({
      message: "Social account not found",
    });
  }

  await prisma.socialAccount.delete({
    where: {
      id: account.id,
    },
  });

  return res.status(204).send();
}
