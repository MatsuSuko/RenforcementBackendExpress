const { Model, DataTypes } = require('sequelize')

const Dossier = (dbInstance, DataTypes) => {
    class Dossier extends Model {
        static associate(models) {
            this.belongsTo(models.Sinistre, {
                foreignKey: 'sinistre_id',
                as: 'Sinistre'
            });
            this.belongsTo(models.User, {
                foreignKey: 'charge_suivi_id',
                as: 'ChargeSuivi'
            });
            this.hasMany(models.EtapeDossier, {
                foreignKey: 'dossier_id',
                as: 'Etapes'
            });
        }
    }

    Dossier.init(
        {
            sinistre_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: true
            },
            charge_suivi_id: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            numero_dossier: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            statut: {
                type: DataTypes.ENUM(
                    'initialise',
                    'expertise_en_attente',
                    'expertise_planifiee',
                    'expertise_realisee',
                    'intervention_en_cours',
                    'vehicule_restitue',
                    'en_attente_facturation',
                    'en_attente_reglement',
                    'clos'
                ),
                allowNull: false,
                defaultValue: 'initialise'
            },
            scenario: {
                type: DataTypes.ENUM('reparable', 'perte_totale'),
                allowNull: true
            }
        },
        {
            sequelize: dbInstance,
            modelName: 'Dossier',
            tableName: 'Dossier',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );

    return Dossier;
};

module.exports = Dossier;
