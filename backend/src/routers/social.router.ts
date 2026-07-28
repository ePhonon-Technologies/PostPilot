
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { connectPlatform, platformCallback } from '../controllers/social/socialConnection.controller';
import { disconnectProvider, disconnectSocialAccount, listSocialAccounts } from '../controllers/social/socialAccount.controller';
import { connectFacebookPage, getSocialProvider, listFacebookPages } from '../controllers/social/facebook.controler';


const router = Router();
 
// Requires the user to be logged into PostPilot — starts the OAuth dance
router.get('/auth/:platform/connect', requireAuth, connectPlatform);
 
// Public — LinkedIn redirects the browser here directly, no PostPilot session
// cookie guaranteed to be attached depending on browser/redirect behavior,
// which is exactly why we verify identity via the signed `state` param instead.
router.get('/auth/:platform/callback', platformCallback);
router.get('/facebook/pages', requireAuth, listFacebookPages)

router.get('/social-accounts', requireAuth, listSocialAccounts);
// router.get('/social-accounts/:id', requireAuth, getSocialAccount);

router.get('/social-providers', requireAuth, getSocialProvider);
router.delete('/social-accounts/:id', requireAuth, disconnectSocialAccount);
router.delete('/social-providers/disconnect', requireAuth, disconnectProvider);


router.post('/facebook/pages/connect', requireAuth, connectFacebookPage)
 
// router.post('/posts', requireAuth, createPost);

export default router;