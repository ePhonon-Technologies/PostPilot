import { SocialPlatform } from '@prisma/client';
import { buildLinkedInAuthUrl, exchangeCodeForToken, fetchLinkedInUserInfo, saveLinkedInAccount } from '../linkedin/linkedin.service';
import { buildFacebookAuthUrl, exchangeCodeForUserToken, fetchFacebookUserId, saveProviderConnection } from '../facebook/facebook.service';

// ---------------------------------------------------------------------------
// Every platform's callback handler does whatever OAuth work it needs, then
// returns where the browser should end up next. This is the key reason a
// single shared function can't just call the same three steps for every
// platform: LinkedIn finishes by connecting an account directly, Facebook
// finishes by sending the user to pick which Pages to connect — genuinely
// different outcomes, not just different function names for the same steps.
// ---------------------------------------------------------------------------

interface CallbackResult {
  redirectPath: string; // relative path + query string, e.g. "/settings/connections?linkedin=connected"
}

async function handleLinkedInCallback(code: string, profileId: string): Promise<CallbackResult> {
  const tokenData = await exchangeCodeForToken(code);
  const userInfo = await fetchLinkedInUserInfo(tokenData.access_token);

  await saveLinkedInAccount(profileId, tokenData, userInfo);

  return { redirectPath: '/settings?linkedin=connected' };
}

async function handleFacebookCallback(code: string, profileId: string): Promise<CallbackResult> {
  const { accessToken, expiresIn } = await exchangeCodeForUserToken(code);
  const externalUserId = await fetchFacebookUserId(accessToken);

  await saveProviderConnection(profileId, externalUserId, accessToken, expiresIn);

  // Facebook has no single "the" account to connect yet — the user still
  // needs to pick which Page(s), so this goes to a different screen than
  // LinkedIn's "already connected" redirect.
  return { redirectPath: '/settings?facebook=authorized' };
}

// ---------------------------------------------------------------------------
// Add a new platform by adding one case here, plus its own *.service.ts
// file — the controller below never needs to change again.
// --------------------------------------------------------------------------

export async function dispatchOAuthCallback(
  platform: SocialPlatform,
  code: string,
  profileId: string
): Promise<CallbackResult> {
  switch (platform) {
    case 'LINKEDIN':
      return handleLinkedInCallback(code, profileId);

    case 'FACEBOOK':
      return handleFacebookCallback(code, profileId);

    // case 'TWITTER':
    //   return handleTwitterCallback(code, profileId);

    default:
      throw new Error(`No OAuth callback handler implemented for platform: ${platform}`);
  }
}


// oauthCallback.service.ts — add this alongside dispatchOAuthCallback
export function buildAuthUrl(platform: SocialPlatform, state: string): string {
  switch (platform) {
    case 'LINKEDIN':
      return buildLinkedInAuthUrl(state);
    case 'FACEBOOK':
      return buildFacebookAuthUrl(state);
    default:
      throw new Error(`No auth URL builder for platform: ${platform}`);
  }
}