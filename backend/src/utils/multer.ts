import path from "path";
import { LinkedInTokenExpiredError, MediaPayload } from "../types/social";
import fs from 'fs/promises';

export const MIME_TYPES = Object.freeze({
  PDF: 'application/pdf',
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  GIF: 'image/gif',
  WEBP: 'image/webp',
  SVG: 'image/svg+xml',
  // Video formats
  MP4: 'video/mp4',
  MOV: 'video/quicktime',
  AVI: 'video/x-msvideo', // also commonly video/avi
  WEBM: 'video/webm',
  MKV: 'video/x-matroska',
} as const);

export type AllowedMimeType = (typeof MIME_TYPES)[keyof typeof MIME_TYPES];
export const ALLOWED_MIME_TYPES = Object.values(MIME_TYPES);

// Standard size limits (in bytes)
export const MAX_IMAGE_SIZE = 8 * 1024 * 1024;  // 8MB for Images
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB for Videos

// Helper utilities for file extensions
export function isVideoFilePath(filePath: string): boolean {
  return /\.(mp4|mov|avi|webm|mkv)$/i.test(filePath);
}

export function isImageFilePath(filePath: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(filePath);
}


async function getFilePayload(filePathOrUrl: string): Promise<MediaPayload> {
  const mimeType = getMimeTypeFromPath(filePathOrUrl);

  if (filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://')) {
    return {
      isRemoteUrl: true,
      url: filePathOrUrl,
      mimeType,
    };
  }

  // Resolve local filesystem path
  const absolutePath = path.isAbsolute(filePathOrUrl)
    ? filePathOrUrl
    : path.join(process.cwd(), filePathOrUrl);

  const buffer = await fs.readFile(absolutePath);
  return {
    buffer,
    isRemoteUrl: false,
    url: absolutePath,
    mimeType,
  };
}

// Check for platform token expiry errors
export function isTokenExpiredError(err: unknown): boolean {
  return (
    err instanceof LinkedInTokenExpiredError
    // || err instanceof TwitterTokenExpiredError
    // || err instanceof FacebookTokenExpiredError
  );
}

export function getMimeTypeFromPath(filePath: string): AllowedMimeType {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return MIME_TYPES.JPEG;
    case '.png':
      return MIME_TYPES.PNG;
    case '.gif':
      return MIME_TYPES.GIF;
    case '.webp':
      return MIME_TYPES.WEBP;
    case '.svg':
      return MIME_TYPES.SVG;
    case '.pdf':
      return MIME_TYPES.PDF;
    case '.mp4':
      return MIME_TYPES.MP4;
    case '.mov':
      return MIME_TYPES.MOV;
    case '.avi':
      return MIME_TYPES.AVI;
    case '.webm':
      return MIME_TYPES.WEBM;
    case '.mkv':
      return MIME_TYPES.MKV;
    default:
      return MIME_TYPES.JPEG; // Fallback
  }
}


