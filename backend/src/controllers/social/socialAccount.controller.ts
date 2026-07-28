import { Response } from 'express';
import { PrismaClient, SocialPlatform } from '@prisma/client';
import { AuthedRequest } from '../../types/auth';
import { prisma } from '../../config/db';


// ---------------------------------------------------------------------------
// GET /social-accounts?platform=LINKEDIN
// Lists the current profile's connected accounts, optionally filtered by
// platform. Read-only — no OAuth mechanics here, that lives in
// socialConnection.controller.ts.
// ---------------------------------------------------------------------------

export async function listSocialAccounts(req: AuthedRequest, res: Response) {
  const userId = req.auth?.userId;

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
   const userId = req.auth?.userId;

  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return res.status(404).json({ message: 'No profile exists for this user' });
  }


  const account = await prisma.socialAccount.findUnique({ where: { id: id as string } });

  if (!account || account.profileId !== profile.id) {
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



export const disconnectProvider = async (
  req: AuthedRequest,
  res: Response,
) => {
  try {
    // Assuming profileId is attached via your auth middleware (e.g., req.user.profileId)
    console.log('I am here')
    const userId = req.auth?.userId;
    const { platform } = req.body;

     if (!userId) {
    return res.status(401).json({
      message: "Not authenticated",
    });
  }

    if (!platform) {
      return res.status(400).json({ message: 'Platform is required' });
    }

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

    // Run in a transaction so both provider connection and pages are deleted together
    await prisma.$transaction([
      // 1. Delete all connected pages/profiles for this platform under the user's profile
      prisma.socialAccount.deleteMany({
        where: {
          profileId: profile.id,
          platform,
        },
      }),

      // 2. Delete the SocialProviderConnection record storing the userAccessToken
      prisma.socialProviderConnection.deleteMany({
        where: {
          profileId: profile.id,
          platform,
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: `${platform} connection removed successfully`,
    });
  } catch (error) {
    console.error('Error disconnecting social provider:', error);
    return res.status(500).json({ message: 'Failed to disconnect provider' });
  }
};