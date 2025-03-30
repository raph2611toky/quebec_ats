const passport = require('passport');
const Candidat = require('../models/candidat.model');

module.exports.googleCallback = async (req, res, next) => {
    passport.authenticate('google', { failureRedirect: '/api/auth/login' }, async (err, user) => {
        try {
            if (err) {
                return res.status(500).json({ error: 'Erreur d\'authentification' });
            }
            if (!user) {
                return res.status(401).json({ error: 'Échec de l\'authentification' });
            }

            const email = user.emails[0].value;
            let candidat = await Candidat.findByEmail(email);

            if (!candidat) {
                candidat = await Candidat.create({
                    email: email,
                    nom: user.displayName || 'Utilisateur Google',
                    is_email_active: true
                });
            }

            req.candidat = candidat;
            next();
        } catch (error) {
            console.error('Erreur dans googleCallback:', error);
            res.status(500).json({ error: 'Erreur serveur lors de l\'authentification' });
        }
    })(req, res, next);
};