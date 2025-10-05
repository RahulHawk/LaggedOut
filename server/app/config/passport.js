const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../model/userModel');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:7000/api/auth/google/callback"
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const firstName = profile.name?.givenName || profile.displayName?.split(" ")[0] || "";
      const lastName = profile.name?.familyName || profile.displayName?.split(" ")[1] || "";

      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        user = await User.findOne({ email });

        if (user) {
          if (!user.authProviders.some(p => p.provider === "google")) {
            user.authProviders.push({ provider: "google", providerId: profile.id });
          }
          user.googleId = profile.id;
          user.isEmailVerified = true;
          await user.save();
        } else {
          user = new User({
            firstName,
            lastName,
            email,
            googleId: profile.id,
            password: null,
            authProviders: [{ provider: "google", providerId: profile.id }],
            isEmailVerified: true,
            avatar: profile.photos?.[0]?.value || ""
          });
          await user.save();
        }
      }

      return done(null, user);
    } catch (err) {
      console.error("Google OAuth Error:", err);
      return done(err, null);
    }
  }
));


passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
