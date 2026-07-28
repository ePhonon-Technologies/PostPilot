import { Response } from "express";
import { prisma } from "../../config/db";
import {
  fetchUserPages,
  getAvailableFacebookPages,
  saveFacebookPage,
} from "../../services/social/facebook/facebook.service";
import { AuthedRequest } from "../../types/auth";
import { decrypt } from "../../utils/crypto";
import { SocialPlatform } from "@prisma/client";

// controllers/facebook.controller.ts
export async function listFacebookPages(req: AuthedRequest, res: Response) {
  const userId = req.auth?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });

  if (!profile) {
    return res.status(404).json({ message: "No profile exists for this user" });
  }

  const connection = await prisma.socialProviderConnection.findFirst({
    where: { profileId: profile.id, platform: "FACEBOOK" },
  });

  if (!connection) {
    return res.status(404).json({
      message:
        "No Facebook connection found — connect Facebook before listing pages.",
    });
  }

  const userAccessToken = decrypt(connection.userAccessToken);
  const pages = await fetchUserPages(userAccessToken);

  const safePages = pages.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
  }));
  res.json(safePages);
}

export async function connectFacebookPage(req: AuthedRequest, res: Response) {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    // Extract pages array (from frontend modal) or single pageId
    const { pages: selectedPages, pageId } = req.body;

    const availablePages = await getAvailableFacebookPages(profile.id);

    // Case 1: Frontend sent an array of pages ({ pages: [...] })
    if (Array.isArray(selectedPages) && selectedPages.length > 0) {
      const savePromises = selectedPages.map(
        async (selectedPage: { id: string }) => {
          const pageToSave = availablePages.find(
            (p) => String(p.id) === String(selectedPage.id),
          );
          if (pageToSave) {
            await saveFacebookPage(profile.id, pageToSave);
          }
        },
      );

      await Promise.all(savePromises);

      return res.json({
        success: true,
        message: "Pages connected successfully",
      });
    }

    // Case 2: Endpoint called with single pageId ({ pageId: "..." })
    if (pageId) {
      const pageToSave = availablePages.find(
        (p) => String(p.id) === String(pageId),
      );

      if (!pageToSave) {
        return res.status(404).json({
          message: "Page not found or not available",
        });
      }

      await saveFacebookPage(profile.id, pageToSave);

      return res.json({
        success: true,
        message: "Page connected successfully",
      });
    }

    return res.status(400).json({
      message: "Invalid request payload. Expected 'pages' array or 'pageId'.",
    });
  } catch (err: any) {
    console.error("Error in connectFacebookPage:", err);

    return res.status(500).json({
      message: err.message || "Failed to connect Facebook page",
    });
  }
}

export async function getFacebookPages(req: AuthedRequest, res: Response) {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    const pages = await getAvailableFacebookPages(profile.id);

    res.json({
      pages,
    });
  } catch (err: any) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
}


export async function getSocialProvider (req: AuthedRequest, res: Response) {
    try {
      const userId = req.auth?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

      // Extract profileId (or userId) from auth middleware session/JWT
      const profileId = profile.id

      if (!profileId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Fetch provider connections without exposing sensitive tokens to frontend
      const connections = await prisma.socialProviderConnection.findMany({
        where: {
          profileId,
        },
        select: {
          id: true,
          profileId: true,
          platform: true,
          externalUserId: true,
          createdAt: true,
          // Exclude accessToken / refreshToken for security
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.json(connections);
    } catch (error) {
      console.error('Error fetching provider connections:', error);
      return res.status(500).json({
        message: 'Failed to fetch provider connections',
      });
    }
  }