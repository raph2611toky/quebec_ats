const jwt = require('../utils/securite/jwt');
const { decryptAES } = require("../utils/securite/cryptographie");
const User = require('../models/user.model');
const Candidat = require("../models/candidat.model")

module.exports.IsAuthenticatedCandidat = async (req, res, next) => {    
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Pas de token fourni.' });
    
    try {
        const decoded = await jwt.verifyToken(token);
        
        if(decryptAES(decoded.role) !== "CANDIDAT"){
            return res.status(401).json({ message: 'Token non autorisé , vous n\'etes pas un candidats.' });
        }
        req.candidat = await Candidat.getById(decoded.id, req.base_url);
        
        next();
    } catch (err) {
        console.log(err);
        
        return res.status(401).json({ message: 'Token invalide.' });
    }
};

module.exports.IsAuthenticated = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Pas de token fourni.' });

    try {
        const decoded = jwt.verifyToken(token);
        if(decryptAES(decoded.role) !== "ADMINISTRATEUR" && decryptAES(decoded.role) !== "MODERATEUR"){
            return res.status(401).json({ message: 'Token non autorisé.' });
        }
        req.user = await User.getById(decoded.id);
        
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token invalide.' });
    }
};

module.exports.IsAuthenticatedAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Pas de token fourni.' });

    try {
        const decoded = jwt.verifyToken(token);
        
        if(decryptAES(decoded.role) !== "ADMINISTRATEUR"){
            return res.status(401).json({ message: 'Token non autorisé.' });
        }
        const user = await User.getById(decoded.id);
        if (!user || user.role !== "ADMINISTRATEUR") {
            return res.status(403).json({ message: "Accès interdit : vous n'êtes pas administrateur." });
        }
        req.user = user;
        next();
    } catch (err) {
        console.log(err);
        
        return res.status(401).json({ message: 'Token invalide.' });
    }
};