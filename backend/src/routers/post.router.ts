import { Router } from 'express';
import { createPost, publishPostNow, schedulePostController } from '../controllers/post/post.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { uploadMedia } from '../middleware/upload';
const router = Router();

router.post('/posts/:postId/publish', requireAuth, uploadMedia, publishPostNow);
router.post('/post/:postId/schedule', requireAuth, uploadMedia, schedulePostController);
router.post('/posts', requireAuth, uploadMedia, createPost);



export default router;