import axios from 'axios';
import { SocialPlatform } from '@prisma/client';

import fs from 'fs/promises';
import { LinkedInTokenExpiredError, LinkedInTokenResponse, LinkedInUserInfo, PublishInput } from '../../../types/social';
import { prisma } from '../../../config/db';
import { decrypt, encrypt } from '../../../utils/crypto';
import { getMimeTypeFromPath, isVideoFilePath } from '../../../utils/multer';


// ---------------------------------------------------------------------------
// OAuth: build the authorization URL the user is redirected to
// ---------------------------------------------------------------------------

export function buildLinkedInAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
    scope: 'openid profile email w_member_social',
    state,
  });

  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// OAuth: exchange the authorization code for an access token
// ---------------------------------------------------------------------------

export async function exchangeCodeForToken(
  code: string
): Promise<LinkedInTokenResponse> {
  const res = await axios.post<LinkedInTokenResponse>(
    'https://www.linkedin.com/oauth/v2/accessToken',
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  return res.data;
}

// ---------------------------------------------------------------------------
// Fetch the connected member's LinkedIn profile info (need the "sub" / ID)
// ---------------------------------------------------------------------------

export async function fetchLinkedInUserInfo(
  accessToken: string
): Promise<LinkedInUserInfo> {
  const res = await axios.get<LinkedInUserInfo>(
    `${process.env.LINKEDIN_API_BASE}/v2/userinfo`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return res.data;
}

// ---------------------------------------------------------------------------
// Persist (or update) the connected LinkedIn account for a profile
// ---------------------------------------------------------------------------

export async function saveLinkedInAccount(
  profileId: string,
  tokenData: LinkedInTokenResponse,
  userInfo: LinkedInUserInfo
) {
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

  return prisma.socialAccount.upsert({
    where: {
      profileId_platform_externalId: {
        profileId,
        platform: SocialPlatform.LINKEDIN,
        externalId: userInfo.sub,
      },
    },
    update: {
      accountName: userInfo.name,
      accessToken: encrypt(tokenData.access_token),
      refreshToken: tokenData.refresh_token
        ? encrypt(tokenData.refresh_token)
        : null,
      expiresAt,
      isActive: true,
    },
    create: {
      profileId,
      platform: SocialPlatform.LINKEDIN,
      accountName: userInfo.name,
      externalId: userInfo.sub,
      accessToken: encrypt(tokenData.access_token),
      refreshToken: tokenData.refresh_token
        ? encrypt(tokenData.refresh_token)
        : null,
      expiresAt,
    },
  });
}

// ---------------------------------------------------------------------------
// Image upload (2-step: register the upload, then PUT the binary)
// ---------------------------------------------------------------------------
export async function uploadMediaToLinkedIn(
  authorUrn: string,
  filePath: string,
  accessToken: string,
  mediaType: 'image' | 'video'
): Promise<string> {
  const buffer = await fs.readFile(filePath);
  const mimeType = getMimeTypeFromPath(filePath);
  const apiVersion = process.env.LINKEDIN_VERSION || '202401';

  // =========================================================
  // 1. IMAGE UPLOAD PATH (/rest/images)
  // =========================================================
  if (mediaType === 'image') {
    // A. Initialize Image Upload
    const initRes = await axios.post(
      'https://api.linkedin.com/rest/images?action=initializeUpload',
      {
        initializeUploadRequest: {
          owner: authorUrn,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'LinkedIn-Version': apiVersion,
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': 'application/json',
        },
      }
    );

    const uploadUrl = initRes.data.value.uploadUrl;
    const imageUrn = initRes.data.value.image as string; // urn:li:image:...

    // B. Upload Binary Data (NO Authorization header on pre-signed URLs)
    await axios.put(uploadUrl, buffer, {
      headers: {
        'Content-Type': mimeType,
      },
    });

    return imageUrn;
  }

  // =========================================================
  // 2. VIDEO UPLOAD PATH (/rest/videos)
  // =========================================================
  const fileSizeBytes = buffer.length;

  // A. Initialize Video Upload
  const initRes = await axios.post(
    'https://api.linkedin.com/rest/videos?action=initializeUpload',
    {
      initializeUploadRequest: {
        owner: authorUrn,
        fileSizeBytes: fileSizeBytes,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'LinkedIn-Version': apiVersion,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
    }
  );

  const { uploadInstructions, uploadToken, video } = initRes.data.value;
  const videoUrn = video as string;
  const eTags: string[] = [];

  // B. Upload Video Chunks & Collect ETags
  for (const instruction of uploadInstructions) {
    const chunk = buffer.subarray(instruction.firstByte, instruction.lastByte + 1);

    const uploadRes = await axios.put(instruction.uploadUrl, chunk, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });

    // Capture ETag header returned by LinkedIn S3/media storage
    const rawEtag = uploadRes.headers['etag'] || uploadRes.headers['ETag'];
    if (rawEtag) {
      // Strip surrounding quotes if present (e.g. '"12345"' -> '12345')
      eTags.push((rawEtag as string).replace(/"/g, ''));
    }
  }

  // C. Finalize Video Upload (THIS WAS MISSING!)
  await axios.post(
    'https://api.linkedin.com/rest/videos?action=finalizeUpload',
    {
      finalizeUploadRequest: {
        video: videoUrn,
        uploadToken: uploadToken || '',
        uploadedPartIds: eTags,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'LinkedIn-Version': apiVersion,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
    }
  );

  console.log('Video upload finalized. Polling for processing completion...');

  // D. Poll LinkedIn Status Until 'AVAILABLE'
  const videoId = encodeURIComponent(videoUrn);
  let isAvailable = false;
  let attempts = 0;
  const maxAttempts = 15;

  while (!isAvailable && attempts < maxAttempts) {
    attempts++;
    console.log(`Checking LinkedIn video status (attempt ${attempts}/${maxAttempts})...`);
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3s between checks

    const statusRes = await axios.get(
      `https://api.linkedin.com/rest/videos/${videoId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'LinkedIn-Version': apiVersion,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    const videoStatus = statusRes.data?.status;
    console.log(`Video status: ${videoStatus}`);

    if (videoStatus === 'AVAILABLE') {
      isAvailable = true;
    } else if (videoStatus === 'PROCESSING_FAILED') {
      const reason = statusRes.data?.processingFailureReason || 'Unknown error';
      throw new Error(`LinkedIn failed to encode video: ${reason}`);
    }
  }

  if (!isAvailable) {
    throw new Error('LinkedIn video processing timed out. Please try again.');
  }

  return videoUrn;
}

async function getValidAccessToken(socialAccountId: string): Promise<{
  accessToken: string;
  authorUrn: string;
}> {
  const account = await prisma.socialAccount.findUniqueOrThrow({
    where: { id: socialAccountId },
  });

  if (account.platform !== SocialPlatform.LINKEDIN) {
    throw new Error(`Account ${socialAccountId} is not a LinkedIn account`);
  }

  if (!account.isActive) {
    throw new LinkedInTokenExpiredError(socialAccountId);
  }

  if (account.expiresAt && account.expiresAt.getTime() < Date.now()) {
    // Mark it inactive so the UI can surface "reconnect LinkedIn" without
    // needing to re-check expiry on every read.
    await prisma.socialAccount.update({
      where: { id: socialAccountId },
      data: { isActive: false },
    });
    throw new LinkedInTokenExpiredError(socialAccountId);
  }

  return {
    accessToken: decrypt(account.accessToken),
    authorUrn: `urn:li:person:${account.externalId}`,
  };
}

// ---------------------------------------------------------------------------
// Publish a post to LinkedIn on behalf of a connected account

// ---------------------------------------------------------------------------
export async function postToLinkedIn(
  input: PublishInput
): Promise<{ externalPostId: string }> {
  const { socialAccountId, content, mediaUrls } = input;

  const { accessToken, authorUrn } = await getValidAccessToken(socialAccountId);
  const apiVersion = process.env.LINKEDIN_VERSION;

  const body: Record<string, unknown> = {
    author: authorUrn,
    commentary: content,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: 'PUBLISHED',
  };

  const mediaPaths = mediaUrls || [];

  if (mediaPaths.length > 0) {
    const videoPaths = mediaPaths.filter((path) => isVideoFilePath(path));

    // Case 1: Single Video
    if (videoPaths.length === 1) {
      const videoUrn = await uploadMediaToLinkedIn(
        authorUrn,
        videoPaths[0],
        accessToken,
        'video'
      );

      body.content = {
        media: {
          id: videoUrn,
        },
      };
    } 
    // Case 2: Single or Multiple Images
    else {
      const uploadedAssetUrns = await Promise.all(
        mediaPaths.map((filePath) =>
          uploadMediaToLinkedIn(authorUrn, filePath, accessToken, 'image')
        )
      );

      if (uploadedAssetUrns.length === 1) {
        body.content = {
          media: {
            id: uploadedAssetUrns[0],
          },
        };
      } else {
        body.content = {
          multiImage: {
            images: uploadedAssetUrns.map((urn) => ({ id: urn })),
          },
        };
      }
    }
  }

  const res = await axios.post(
    `${process.env.LINKEDIN_API_BASE}/rest/posts`,
    body,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': apiVersion,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    }
  );

  const externalPostId =
    (res.headers['x-restli-id'] as string) ||
    (res.headers['x-linkedin-id'] as string);

  console.log('Successfully published to LinkedIn. Post ID:', externalPostId);

  return { externalPostId };
}

export { LinkedInTokenExpiredError };