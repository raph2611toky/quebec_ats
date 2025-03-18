const jwt = require('../utils/securite/jwt');
const User = require('../models/user.model');

module.exports.IsAuthenticated = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Pas de token fourni.' });

    try {
        const decoded = jwt.verifyToken(token);
        req.user = decoded; 
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token invalide.' });
    }
};

module.exports.IsAuthenticatedAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Pas de token fourni.' });

    try {
        const decoded = jwt.verifyToken(token);
        const user = await User.getById(decoded.id);
        if (!user || user.role !== "ADMINISTRATEUR") {
            return res.status(403).json({ message: "Accès interdit : vous n'êtes pas administrateur." });
        }
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token invalide.' });
    }
};