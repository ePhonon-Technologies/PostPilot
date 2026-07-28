// facebook.service.ts — add this after exchangeCodeForUserToken succeeds

import axios from "axios";
import { prisma } from "../../../config/db";
import {
  FacebookPage,
  FacebookPublishInput,
  FacebookTokenExpiredError,
  FacebookTokenResponse,
} from "../../../types/social";
import { decrypt, encrypt } from "../../../utils/crypto";
import { SocialPlatform } from "@prisma/client";
import { getMimeTypeFromPath, isVideoFilePath } from "../../../utils/multer";
import fs from 'fs/promises';

const GRAPH_API_VERSION = process.env.FACEBOOK_GRAPH_API_VERSION; // current as of Feb 2026 — Meta releases roughly twice a year, ~2yr support window
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

// ---------------------------------------------------------------------------
// OAuth: build the authorization URL
// ---------------------------------------------------------------------------

export function buildFacebookAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID!,
    redirect_uri: process.env.FACEBOOK_REDIRECT_URI!,
    // Cleaned scope list for page publishing:
    scope: "public_profile,pages_show_list,pages_read_engagement,pages_manage_posts,business_management",
    state,
    response_type: "code",
  });

  return `https://www.facebook.com/${GRAPH_API_VERSION}/dialog/oauth?${params}`;
}

export async function exchangeCodeForUserToken(
  code: string,
): Promise<{ accessToken: string; expiresIn?: number }> {


  const shortLivedRes = await axios.get<FacebookTokenResponse>(
    `${GRAPH_API_BASE}/oauth/access_token`,
    {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
        code,
      },
    },
  );

  const longLivedRes = await axios.get<FacebookTokenResponse>(
    `${GRAPH_API_BASE}/oauth/access_token`,
    {
      params: {
        grant_type: "fb_exchange_token",
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        fb_exchange_token: shortLivedRes.data.access_token,
      },
    },
  );

  return {
    accessToken: longLivedRes.data.access_token,
    expiresIn: longLivedRes.data.expires_in,
  };
}

// ---------------------------------------------------------------------------
// Fetch the authenticated user's own Facebook ID — needed as the
// externalUserId key for SocialProviderConnection (distinct from any Page's
// own ID, which is what SocialAccount.externalId stores instead).
// ---------------------------------------------------------------------------

export async function fetchFacebookUserId(
  userAccessToken: string,
): Promise<string> {
  const res = await axios.get<{ id: string }>(`${GRAPH_API_BASE}/me`, {
    params: { access_token: userAccessToken, fields: "id" },
  });
  return res.data.id;
}

// ---------------------------------------------------------------------------
// Persist the discovery-level user token, so a future "connect another
// Page" doesn't require sending the user through the OAuth consent screen
// again. This is distinct from SocialAccount, which stores the per-Page
// posting token — see the SocialProviderConnection vs SocialAccount split.
// ---------------------------------------------------------------------------

export async function saveProviderConnection(
  profileId: string,
  externalUserId: string,
  userAccessToken: string,
  expiresIn?: number,
) {
  return prisma.socialProviderConnection.upsert({
    where: {
      profileId_platform_externalUserId: {
        profileId,
        platform: SocialPlatform.FACEBOOK,
        externalUserId,
      },
    },
    update: {
      userAccessToken: encrypt(userAccessToken),
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
    },
    create: {
      profileId,
      platform: SocialPlatform.FACEBOOK,
      externalUserId,
      userAccessToken: encrypt(userAccessToken),
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
    },
  });
}

// ---------------------------------------------------------------------------
// Fetch every Page this user administers, with each Page's own access
// token. A Page token derived from a long-lived user token effectively
// does not expire, which is why the long-lived exchange above matters.
// ---------------------------------------------------------------------------

export async function fetchUserPages(
  userAccessToken: string,
): Promise<FacebookPage[]> {
  try {
    
    // 1. Await decryption to ensure we get a plain string token

    // 2. Query Meta Graph API
    const res = await axios.get<{ data: FacebookPage[] }>(
      `${GRAPH_API_BASE}/me/accounts`,
      {
        params: { access_token: userAccessToken },
      },
    );

    return res.data.data || [];
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Meta Graph API Error Response:', error.response.data);
    } else {
      console.error('Error while getting Facebook page:', error.message);
    }

    // Re-throw the complete error object for downstream catch blocks
    throw error.message;
  }
}

// ---------------------------------------------------------------------------
// Persist a chosen Page as a connected SocialAccount. Called once per Page
// the user selects on your "choose which Pages to connect" screen —
// this is the step that doesn't exist for LinkedIn, since LinkedIn has
// exactly one identity per connection, not a list to choose from.
// ---------------------------------------------------------------------------

export async function saveFacebookPage(profileId: string, page: FacebookPage) {
  console.log('facebook page', page);
  return prisma.socialAccount.upsert({
    where: {
      profileId_platform_externalId: {
        profileId,
        platform: SocialPlatform.FACEBOOK,
        externalId: page.id,
      },
    },
    update: {
      accountName: page.name,
      accessToken: encrypt(page.access_token),
      isActive: true,
      expiresAt: null, // Page tokens from a long-lived user token don't expire
    },
    create: {
      profileId,
      platform: SocialPlatform.FACEBOOK,
      accountName: page.name,
      externalId: page.id,
      accessToken: encrypt(page.access_token),
      expiresAt: null,
    },
  });
}



export async function uploadMediaToFacebook(
  pageId: string,
  filePath: string,
  accessToken: string,
  mediaType: 'image' | 'video',
  options: {
    published?: boolean;
    caption?: string;
  } = {},
): Promise<string> {
  try {
    const buffer = await fs.readFile(filePath);
    const mimeType = getMimeTypeFromPath(filePath);

    const FormData = (await import('form-data')).default;
    const form = new FormData();

    form.append(
      'source',
      buffer,
      {
        filename:
          mediaType === 'image'
            ? 'image.jpg'
            : 'video.mp4',
        contentType: mimeType,
      },
    );

    form.append('access_token', accessToken);

    if (options.caption) {
      if (mediaType === 'image') {
        form.append('caption', options.caption);
      } else {
        form.append('description', options.caption);
      }
    }

    if (mediaType === 'image') {
      form.append(
        'published',
        String(options.published ?? true),
      );

      const res = await axios.post(
        `${GRAPH_API_BASE}/${pageId}/photos`,
        form,
        {
          headers: form.getHeaders(),
        },
      );

          console.log('media upload', res.data);

      return res.data.id;
    }


    const res = await axios.post(
      `${GRAPH_API_BASE}/${pageId}/videos`,
      form,
      {
        headers: form.getHeaders(),
      },
    );
              console.log('media upload', res.data);


    return res.data.id;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error(
        'Facebook Upload Error:',
        error.response?.data,
      );
    }

    throw new Error(
      error.response?.data?.error?.message ??
        error.message ??
        'Facebook upload failed',
    );
  }
}

export async function postToFacebook(
  input: FacebookPublishInput,
): Promise<{ externalPostId: string }> {
  try {
    const account =
      await prisma.socialAccount.findUniqueOrThrow({
        where: {
          id: input.socialAccountId,
        },
      });

    if (!account.isActive) {
      throw new FacebookTokenExpiredError(account.id);
    }

    const accessToken = decrypt(account.accessToken);
    const pageId = account.externalId;

    const mediaPaths = input.mediaUrls ?? [];

    // --------------------------
    // Text Post
    // --------------------------
          console.log('media path', mediaPaths);

    if (mediaPaths.length === 0) {
      const res = await axios.post(
        `${GRAPH_API_BASE}/${pageId}/feed`,
        {
          message: input.content,
          access_token: accessToken,
        },
      );

      return {
        externalPostId: res.data.id,
      };
    }

    const videoPaths = mediaPaths.filter(isVideoFilePath);

    // --------------------------
    // Video
    // --------------------------

    if (videoPaths.length === 1) {
      const videoId =
        await uploadMediaToFacebook(
          pageId,
          videoPaths[0],
          accessToken,
          'video',
          {
            caption: input.content,
          },
        );

      return {
        externalPostId: videoId,
      };
    }

    // --------------------------
    // Single Image
    // --------------------------

    if (mediaPaths.length === 1) {
      const photoId =
        await uploadMediaToFacebook(
          pageId,
          mediaPaths[0],
          accessToken,
          'image',
          {
            caption: input.content,
            published: true,
          },
        );

      return {
        externalPostId: photoId,
      };
    }

    // --------------------------
    // Multiple Images
    // --------------------------

    const photoIds = await Promise.all(
      mediaPaths.map((path) =>
        uploadMediaToFacebook(
          pageId,
          path,
          accessToken,
          'image',
          {
            published: false,
          },
        ),
      ),
    );

    console.log('photo ids', photoIds);
    const attachedMedia = photoIds.map((id) => ({
      media_fbid: id,
    }));

    const res = await axios.post(
      `${GRAPH_API_BASE}/${pageId}/feed`,
      {
        message: input.content,
        attached_media: attachedMedia,
        access_token: accessToken,
      },
    );

    console.log('final response', res.data);
    return {
      externalPostId: res.data.id,
    };
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error(
        'Facebook Publish Error:',
        error.response?.data,
      );
    }

    throw new Error(
      error.response?.data?.error?.message ??
        error.message ??
        'Facebook publish failed',
    );
  }
}
export async function getAvailableFacebookPages(profileId: string) {
  try {
    const provider = await prisma.socialProviderConnection.findFirst({
      where: {
        profileId,
        platform: SocialPlatform.FACEBOOK,
      },
    });

    if (!provider) {
      throw new Error("Facebook account not connected");
    }

    const userAccessToken = decrypt(provider.userAccessToken);

    const pages = await fetchUserPages(userAccessToken);
    console.log('page int the getavailable', pages);

    const connectedPages = await prisma.socialAccount.findMany({
      where: {
        profileId,
        platform: SocialPlatform.FACEBOOK,
      },
      select: {
        externalId: true,
      },
    });

    const connectedIds = new Set(
      connectedPages.map((page) => page.externalId),
    );

    return pages.map((page) => ({
      ...page,
      connected: connectedIds.has(page.id),
    }));
  } catch (error) {
    console.error("Error fetching available Facebook pages:", error);

    // Re-throw custom message or exact error if it's an instance of Error
    if (error instanceof Error) {
      throw new Error(`Failed to get Facebook pages: ${error.message}`);
    }

    throw new Error("An unknown error occurred while fetching Facebook pages.");
  }
}

