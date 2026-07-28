import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { NextFunction, Request, Response } from 'express';
import fileFilter from './fileFilter';
import { MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } from '../utils/multer';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_VIDEO_SIZE, // Global fallback limit
  },
}).array('media', 9);

// Helper function to safely delete files if validation fails
const deleteUploadedFiles = (files?: Express.Multer.File[]) => {
  if (!files || files.length === 0) return;
  
  files.forEach((file) => {
    fs.unlink(file.path, (err) => {
      if (err) console.error(`[Multer Cleanup Error] Failed to delete ${file.path}:`, err);
    });
  });
};

/**
 * Custom Middleware Wrapper: Enforces strict per-file size checks
 */
export const uploadMedia = (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, (err: any) => {
    const files = req.files as Express.Multer.File[];

    // 1. Handle Multer standard errors
    if (err instanceof multer.MulterError) {
      deleteUploadedFiles(files);
      if (err.code === 'LIMIT_FILE_SIZE') {
        const limitInMB = (MAX_VIDEO_SIZE / (1024 * 1024)).toFixed(0);
        return res.status(400).json({
          message: `File is too large. Maximum allowed size is ${limitInMB}MB.`,
        });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      deleteUploadedFiles(files);
      return res.status(400).json({ message: err.message });
    }

    // 2. Perform granular size checks for images vs videos
    if (files && files.length > 0) {
      for (const file of files) {
        const isImage = file.mimetype.startsWith('image/');
        const isVideo = file.mimetype.startsWith('video/');
        // Enforce specific limit for images
        if (isImage && file.size > MAX_IMAGE_SIZE) {
          deleteUploadedFiles(files); // Clean up disk space!
          const maxImgMB = (MAX_IMAGE_SIZE / (1024 * 1024)).toFixed(0);
          return res.status(400).json({
            message: `Image "${file.originalname}" exceeds the ${maxImgMB}MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
          });
        }

        // Enforce specific limit for videos
        if (isVideo && file.size > MAX_VIDEO_SIZE) {
          deleteUploadedFiles(files); // Clean up disk space!
          const maxVidMB = (MAX_VIDEO_SIZE / (1024 * 1024)).toFixed(0);
          return res.status(400).json({
            message: `Video "${file.originalname}" exceeds the ${maxVidMB}MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
          });
        }
      }
    }

    // 3. All checks passed
    next();
  });
};