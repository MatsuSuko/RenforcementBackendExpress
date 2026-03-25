const userRoutes = require('./users');
const authRoutes = require('./auth');
const sinistreRoutes = require('./sinistres');
const dossierRoutes = require('./dossiers');
const etapeRoutes = require('./etapes');
const { authMiddleware } = require('../middlewares/auth');

function initRoutes(app) {
    // Routes publiques (sans auth)
    app.use('/auth', authRoutes);

    // Routes protégées
    app.use('/user', authMiddleware, userRoutes);
    app.use('/sinistre', authMiddleware, sinistreRoutes);
    app.use('/dossier', authMiddleware, dossierRoutes);
    app.use('/etape', authMiddleware, etapeRoutes);

    app.get('/', (req, res) => {
        res.status(200).json({ message: "Bienvenu sur AssurMoi API" });
    });
}

module.exports = initRoutes;