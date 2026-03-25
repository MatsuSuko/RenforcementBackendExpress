function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Non authentifié' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Accès refusé : rôle insuffisant' });
        }

        next();
    };
}

// Raccourcis pratiques
const isAdmin = requireRole('administrateur');
const isGestionnaire = requireRole('administrateur', 'gestionnaire');
const isChargeSuivi = requireRole('administrateur', 'gestionnaire', 'charge_suivi');
const isChargeClientele = requireRole('administrateur', 'gestionnaire', 'charge_clientele');

module.exports = { requireRole, isAdmin, isGestionnaire, isChargeSuivi, isChargeClientele };