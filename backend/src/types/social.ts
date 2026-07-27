
export interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number; // seconds
  refresh_token?: string;
  scope: string;
}

export interface LinkedInUserInfo {
  sub: string; // this is the LinkedIn person ID you need for the author URN
  name: string;
  email?: string;
  picture?: string;
}

export interface PublishResult {
  externalPostId: string;
}

export interface PublishInput {
  profileId: string;
  socialAccountId: string;
  content: string;
  mediaUrls?: string[];
}

// ---------------------------------------------------------------------------
// Ensure we have a usable (non-expired) access token for this account.
// LinkedIn tokens generally do NOT support refresh for most consumer scopes,
// so if it's expired we throw a specific error the caller can use to prompt
// the user to reconnect, rather than silently failing mid-post.
// ---------------------------------------------------------------------------

export class LinkedInTokenExpiredError extends Error {
  constructor(public socialAccountId: string) {
    super('LinkedIn access token has expired — the account needs to be reconnected.');
    this.name = 'LinkedInTokenExpiredError';
  }
}

