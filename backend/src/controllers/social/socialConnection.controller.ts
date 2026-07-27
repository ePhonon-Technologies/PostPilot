import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  buildLinkedInAuthUrl,
  exchangeCodeForToken,
  fetchLinkedInUserInfo,
  saveLinkedInAccount,

} from "../../services/linkedin/linkedin.service";
import {  SocialPlatform } from "@prisma/client";
import { AuthedRequest } from "../../types/auth";
import { prisma } from "../../config/db";

// State token is a short-lived JWT carrying the profileId, so the callback
// (which LinkedIn hits, not the browser session directly) can be tied back
// to the right PostPilot profile without trusting an unsigned query param.
const STATE_SECRET = process.env.OAUTH_STATE_SECRET!;

function generateState(profileId: string): string {
  return jwt.sign({ profileId }, STATE_SECRET, { expiresIn: "10m" });
}

function verifyState(state: string): { profileId: string } {
  return jwt.verify(state, STATE_SECRET) as { profileId: string };
}

// ---------------------------------------------------------------------------
// GET /auth/linkedin/connect
// Kicks off the OAuth flow for the currently logged-in user's profile.
// ---------------------------------------------------------------------------

export async function connectPlatform(req: AuthedRequest, res: Response) {
  const userId = req.auth?.userId;
  const { platform } = req.params;

  if (!userId) {
    return res.status(401).json({
      message: "Not authenticated",
    });
  }

  if (typeof platform !== "string") {
    return res.status(400).json({
      message: "Platform is required",
    });
  }

  const profile = await prisma.profile.findUnique({
    where: {
      userId,
    },
  });

  if (!profile) {
    return res.status(404).json({
      message: "Profile not found for this user",
    });
  }

  const state = generateState(profile.id);

  let authUrl: string;

  if (platform.toUpperCase() === SocialPlatform.LINKEDIN) {
    authUrl = buildLinkedInAuthUrl(state);
  } else {
    return res.status(400).json({
      message: `Unsupported platform: ${platform}`,
    });
  }

  return res.redirect(authUrl);
}

// ---------------------------------------------------------------------------
// GET /auth/linkedin/callback
// LinkedIn redirects here after the user approves the connection.
// ---------------------------------------------------------------------------

export async function platformCallback(req: Request, res: Response) {
  const { code, state, error, error_description } = req.query;
  const {platform} = req.params;

  const frontendBase = process.env.CLIENT_URL!;

  if (error) {
    console.error("LinkedIn OAuth error:", error, error_description);
    return res.redirect(
      `${frontendBase}/settings/connections?${platform}=error&reason=${encodeURIComponent(
        String(error_description ?? error),
      )}`,
    );
  }

  if (!code || !state) {
    return res.redirect(
      `${frontendBase}/settings/connections?${platform}=error&reason=missing_params`,
    );
  }

  let profileId: string;
  try {
    ({ profileId } = verifyState(state as string));
  } catch {
    return res.redirect(
      `${frontendBase}/settings/connections?${platform}=error&reason=invalid_state`,
    );
  }

  try {
    const tokenData = await exchangeCodeForToken(code as string);
    const userInfo = await fetchLinkedInUserInfo(tokenData.access_token);

    await saveLinkedInAccount(profileId, tokenData, userInfo);

    return res.redirect(
      `${frontendBase}/settings/connections?${platform}=connected`,
    );
  } catch (err) {
    console.error("LinkedIn callback failed:", err);
    return res.redirect(
      `${frontendBase}/settings/connections?${platform}=error&reason=token_exchange_failed`,
    );
  }
}

