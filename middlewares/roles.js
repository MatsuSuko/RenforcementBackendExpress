function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: 'Non authentifié' });
        if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Accès refusé : rôle insuffisant' });
        next();
    };
}

const isSuperAdmin = requireRole('superadmin');
const isManager = requireRole('superadmin', 'manager');
const isSinisterManager = requireRole('superadmin', 'manager', 'sinister_manager');
const isRequestManager = requireRole('superadmin', 'manager', 'request_manager');

module.exports = { requireRole, isSuperAdmin, isManager, isSinisterManager, isRequestManager };