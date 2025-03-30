require("dotenv").config()
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const setupGoogleAuth = () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.FRONTEND_URL+'/api/auth/google/callback'
    }, (accessToken, refreshToken, profile, done) => {
        console.log('User Profile:', profile);
        return done(null, profile);
    }));

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((obj, done) => {
        done(null, obj);
    });
};

const loginWithGoogle = passport.authenticate('google', { scope: ['profile', 'email'] });

const logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
};

module.exports = {
    setupGoogleAuth,
    loginWithGoogle,
    logout
};