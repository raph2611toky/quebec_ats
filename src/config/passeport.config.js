require("dotenv").config()
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Candidat = require('../models/candidat.model');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.FRONTEND_URL}/api/candidats/auth/google/callback`
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      let candidat = await Candidat.findByEmail(email);

      if (!candidat) {
        candidat = await Candidat.create({
          email: email,
          nom: profile.displayName || 'Utilisateur Google',
          is_email_active: true
        });
      }

      return done(null, candidat);
    } catch (error) {
      return done(error, null);
    }
  }
));

passport.serializeUser((candidat, done) => {
  done(null, candidat.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const candidat = await Candidat.getById(id);
    done(null, candidat);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;