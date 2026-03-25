const userRoutes = require('./users');
const sinistreRoutes = require('./sinistres');
const dossierRoutes = require('./dossiers');
const etapeRoutes = require('./etapes');

function initRoutes(app) {
    app.use('/user', userRoutes);
    app.use('/sinistre', sinistreRoutes);
    app.use('/dossier', dossierRoutes);
    app.use('/etape', etapeRoutes);

    app.get('/', (req, res) => {
        res.status(200).json({ message: "Bienvenu sur AssurMoi API" });
    });
}

module.exports = initRoutes;