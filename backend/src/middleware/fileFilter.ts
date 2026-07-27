
// the filter function

import { FileFilterCallback } from "multer";
import { ALLOWED_MIME_TYPES, AllowedMimeType } from "../utils/multer";

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype as AllowedMimeType)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  }
};
export default fileFilter;
