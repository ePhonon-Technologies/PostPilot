import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { SocialPlatform } from "@prisma/client";
import { AuthedRequest } from "../../types/auth";
import { prisma } from "../../config/db";
import {
  buildAuthUrl,
  dispatchOAuthCallback,
} from "../../services/social/oauth/OauthCallback.service";
import { buildFacebookAuthUrl } from "../../services/social/facebook/facebook.service";

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

  const platformKey = platform.toUpperCase() as SocialPlatform;

  let authUrl: string;
  try {
    authUrl = buildAuthUrl(platformKey, state);
  } catch {
    return res
      .status(400)
      .json({ message: `Unsupported platform: ${platform}` });
  }

  return res.redirect(authUrl);
}

// ---------------------------------------------------------------------------
// GET /auth/linkedin/callback
// LinkedIn redirects here after the user approves the connection.
// ---------------------------------------------------------------------------

export async function platformCallback(req: Request, res: Response) {
  const { code, state, error, error_description } = req.query;
  const { platform } = req.params;

  const frontendBase = process.env.CLIENT_URL!;

  // Narrow platform to a plain string before using it — same reasoning as
  // the code/state narrowing below: Express types route params as
  // string | string[] for certain patterns, and .toUpperCase() only exists
  // on the string branch.
  if (typeof platform !== "string") {
    return res.redirect(
      `${frontendBase}/settings/connections?error=invalid_platform`,
    );
  }

  const platformKey = platform.toUpperCase();
  const validPlatforms: SocialPlatform[] = [
    "LINKEDIN",
    "FACEBOOK",
    "TWITTER",
    "INSTAGRAM",
  ];

  if (!validPlatforms.includes(platformKey as SocialPlatform)) {
    return res.redirect(
      `${frontendBase}/settings/connections?${platform}=error&reason=unsupported_platform`,
    );
  }

  if (error) {
    console.error(`${platform} OAuth error:`, error, error_description);
    return res.redirect(
      `${frontendBase}/settings/connections?${platform}=error&reason=${encodeURIComponent(
        String(error_description ?? error),
      )}`,
    );
  }

  // Explicit narrowing instead of `!code || !state` — Express types query
  // values as string | string[] | ParsedQs | ParsedQs[], and this both
  // rejects malformed requests AND properly narrows the type to `string`
  // for everything used below.
  if (typeof code !== "string" || typeof state !== "string") {
    return res.redirect(
      `${frontendBase}/settings/connections?${platform}=error&reason=missing_params`,
    );
  }

  let profileId: string;
  try {
    ({ profileId } = verifyState(state));
  } catch {
    return res.redirect(
      `${frontendBase}/settings/connections?${platform}=error&reason=invalid_state`,
    );
  }

  try {
    const { redirectPath } = await dispatchOAuthCallback(
      platformKey as SocialPlatform,
      code,
      profileId,
    );
    return res.redirect(`${frontendBase}${redirectPath}`);
  } catch (err) {
    console.error(`${platform} callback failed:`, err);
    return res.redirect(
      `${frontendBase}/settings/connections?${platform}=error&reason=token_exchange_failed`,
    );
  }
}
