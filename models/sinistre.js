const { Model, DataTypes } = require('sequelize')

const Sinistre = (dbInstance, DataTypes) => {
    class Sinistre extends Model {
        static associate(models) {
            this.belongsTo(models.User, {
                foreignKey: 'utilisateur_id',
                as: 'Createur'
            });
            this.hasMany(models.DocumentSinistre, {
                foreignKey: 'sinistre_id',
                as: 'Documents'
            });
            this.hasOne(models.Dossier, {
                foreignKey: 'sinistre_id',
                as: 'Dossier'
            });
        }
    }

    Sinistre.init(
        {
            utilisateur_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            immatriculation: {
                type: DataTypes.STRING,
                allowNull: false
            },
            conducteur_nom: {
                type: DataTypes.STRING,
                allowNull: false
            },
            conducteur_prenom: {
                type: DataTypes.STRING,
                allowNull: false
            },
            conducteur_est_assure: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            date_appel: {
                type: DataTypes.DATE,
                allowNull: false
            },
            date_accident: {
                type: DataTypes.DATE,
                allowNull: false
            },
            contexte: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            responsabilite_engagee: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            pourcentage_responsabilite: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            statut: {
                type: DataTypes.ENUM('en_cours', 'complet', 'clos'),
                allowNull: false,
                defaultValue: 'en_cours'
            }
        },
        {
            sequelize: dbInstance,
            modelName: 'Sinistre',
            tableName: 'Sinistre',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );

    return Sinistre;
};

module.exports = Sinistre;
