import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { prisma } from '../config/db';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (err: any, user?: Express.User | false) => void
    ) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email found in Google profile"), false);
        }

        // find or create the user
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              providerName: "GOOGLE",
              // no password for OAuth users — make sure your schema allows null here
              profiles: {
                create: {
                  firstName: profile.name?.givenName ?? "",
                  lastName: profile.name?.familyName ?? "",
                  avatarUrl: profile.photos?.[0]?.value ?? null,
                },
              },
            },
            include: {
              profile: true,
            },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err as Error, false);
      }
    }
  )
);

// Real Express middleware — this is what actually needs to run before any
// routes that call passport.authenticate(). It calls next() correctly,
// unlike the old PassPortAuthenticate function which returned a Strategy
// object and silently swallowed every request.
export const PassPortAuthenticate = passport.initialize();