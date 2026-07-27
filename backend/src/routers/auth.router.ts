import express from "express";
import { getMe, login, logoutUser, register } from "../controllers/auth/auth.controller";
import passport from "passport";
import { generateToken, MAX_AGE } from "../utils/auth";
import { Role } from "@prisma/client";
import { requireAuth } from "../middleware/auth.middleware";
const router = express.Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
// POST /auth/logout — clears the httpOnly cookie server-side
router.post("/auth/logout", logoutUser);

// before getMe runs
router.get("/auth/me", requireAuth, getMe);
 

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  (req, res) => {
    const user = req.user as
      | { id: string; email: string; role: string }
      | undefined;

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MAX_AGE,
    });
    res.redirect(`${process.env.CLIENT_URL}/auth/success`);
  },
);

export default router;
