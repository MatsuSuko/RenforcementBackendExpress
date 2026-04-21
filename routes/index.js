const userRoutes = require('./users');
const authRoutes = require('./auth');
const sinistreRoutes = require('./sinistres');
const dossierRoutes = require('./dossiers');
const etapeRoutes = require('./etapes');
const mailRoutes = require('./mail');
const { validateAuthentication } = require('../middlewares/auth');

function initRoutes(app) {
    // Routes publiques
    app.use('/', authRoutes);
    app.use('/', mailRoutes);

    // Routes protégées
    app.use('/user', validateAuthentication, userRoutes);
    app.use('/sinistre', validateAuthentication, sinistreRoutes);
    app.use('/dossier', validateAuthentication, dossierRoutes);
    app.use('/etape', validateAuthentication, etapeRoutes);

    app.get('/', (req, res) => {
        res.status(200).json({ message: "Bienvenu sur AssurMoi API" });
    });
}

module.exports = initRoutes;