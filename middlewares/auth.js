const jwt = require('jsonwebtoken');
const { User } = require('../models');

async function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ where: { id: decoded.id } });

        if (!user) {
            return res.status(401).json({ message: 'Utilisateur introuvable' });
        }

        if (!user.actif) {
            return res.status(403).json({ message: 'Compte désactivé' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token invalide ou expiré' });
    }
}

module.exports = { authMiddleware };