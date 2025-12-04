const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userRepository = require('../repositories/user.repository');
const logger = require('../utils/logger');

// JWT Strategy
// Extract JWT from Authorization header OR query parameter (?token=<jwt>)
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),           // Standard: Authorization: Bearer <token>
    ExtractJwt.fromUrlQueryParameter('token')          // Alternative: ?token=<token>
  ]),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await userRepository.findById(payload.id);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      logger.error('JWT Strategy error:', error);
      return done(error, false);
    }
  })
);

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract user data from Google profile
          const googleData = {
            googleId: profile.id,
            email: profile.emails[0].value,
            fullName: profile.displayName,
            avatarUrl: profile.photos[0]?.value || null
          };

          // Check if user exists
          let user = await userRepository.findByGoogleId(googleData.googleId);

          if (!user) {
            // Check if email already exists
            user = await userRepository.findByEmail(googleData.email);

            if (user) {
              // Link Google account to existing user
              await userRepository.updateGoogleId(user.id, googleData.googleId);
              user.google_id = googleData.googleId;
            } else {
              // Create new user
              user = await userRepository.createGoogleUser(googleData);
            }
          }

          return done(null, user);
        } catch (error) {
          logger.error('Google OAuth error:', error);
          return done(error, false);
        }
      }
    )
  );
}

module.exports = passport;

