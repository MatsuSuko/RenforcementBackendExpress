const { Model, DataTypes } = require('sequelize')

const EtapeDossier = (dbInstance, DataTypes) => {
    class EtapeDossier extends Model {
        static associate(models) {
            this.belongsTo(models.Dossier, {
                foreignKey: 'dossier_id',
                as: 'Dossier'
            });
            this.belongsTo(models.User, {
                foreignKey: 'validateur_id',
                as: 'Validateur'
            });
        }
    }

    EtapeDossier.init(
        {
            dossier_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            validateur_id: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            libelle: {
                type: DataTypes.STRING,
                allowNull: false
            },
            statut: {
                type: DataTypes.ENUM('en_attente', 'en_cours', 'complete', 'validee'),
                allowNull: false,
                defaultValue: 'en_attente'
            },
            validation_requise: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            valide: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            commentaire: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            date_echeance: {
                type: DataTypes.DATE,
                allowNull: true
            },
            completed_at: {
                type: DataTypes.DATE,
                allowNull: true
            }
        },
        {
            sequelize: dbInstance,
            modelName: 'EtapeDossier',
            tableName: 'EtapeDossier',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: false
        }
    );

    return EtapeDossier;
};

module.exports = EtapeDossier;
