
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { connectPlatform, platformCallback } from '../controllers/social/socialConnection.controller';
import { disconnectSocialAccount, listSocialAccounts } from '../controllers/social/socialAccount.controller';
import { publishPostNow } from '../controllers/post/post.controller';


const router = Router();
 
// Requires the user to be logged into PostPilot — starts the OAuth dance
router.get('/auth/:platform/connect', requireAuth, connectPlatform);
 
// Public — LinkedIn redirects the browser here directly, no PostPilot session
// cookie guaranteed to be attached depending on browser/redirect behavior,
// which is exactly why we verify identity via the signed `state` param instead.
router.get('/auth/:platform/callback', platformCallback);

router.get('/social-accounts', requireAuth, listSocialAccounts);
// router.get('/social-accounts/:id', requireAuth, getSocialAccount);

router.delete('/social-accounts/:id', requireAuth, disconnectSocialAccount);
 
// router.post('/posts', requireAuth, createPost);

export default router;