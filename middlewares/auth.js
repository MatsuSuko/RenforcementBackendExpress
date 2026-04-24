const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const validateAuthentication = (req, res, next) => {
    const authorizationHeader = req.header('authorization');
    const token = authorizationHeader?.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Wrong JWT token' });

        const user = await User.findOne({ where: { token } });

        if (!user) return res.status(403).json({ message: 'Session expired' });

        if (!user.active) return res.status(403).json({ message: 'Account disabled' });

        if (Date.now() >= (decoded.exp * 1000)) {
            user.token = null;
            await user.save();
            return res.status(403).json({ message: 'Token expired' });
        }

        req.user = user;
        next();
    });
};

// ── Restriction : seul le créateur ou un gestionnaire peut modifier ───────────
const MANAGER_ROLES = ['superadmin', 'manager', 'sinister_manager', 'request_manager'];

const canModifySinistre = async (req, res, next) => {
    try {
        const { Sinistre } = require('../models');
        const sinistre = await Sinistre.findOne({ where: { id: req.params.id } });

        if (!sinistre) return res.status(404).json({ message: 'Sinistre introuvable' });

        const isOwner   = sinistre.utilisateur_id === req.user.id;
        const isManager = MANAGER_ROLES.includes(req.user.role);

        if (!isOwner && !isManager) {
            return res.status(403).json({ message: 'Vous ne pouvez pas modifier le sinistre d\'un autre utilisateur' });
        }

        req.sinistre = sinistre; // dispo dans le controller si besoin
        next();
    } catch (err) {
        return res.status(500).json({ message: 'Erreur lors de la vérification des droits' });
    }
};

// ── Restriction : rôle gestionnaire uniquement ────────────────────────────────
const isManager = (req, res, next) => {
    if (!MANAGER_ROLES.includes(req.user?.role)) {
        return res.status(403).json({ message: 'Accès réservé aux gestionnaires' });
    }
    next();
};

module.exports = { validateAuthentication, canModifySinistre, isManager };