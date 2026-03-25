const { Model, DataTypes } = require('sequelize')

const Historique = (dbInstance, DataTypes) => {
    class Historique extends Model {
        static associate(models) {
            this.belongsTo(models.User, {
                foreignKey: 'utilisateur_id',
                as: 'Utilisateur'
            });
        }
    }

    Historique.init(
        {
            utilisateur_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            entite_type: {
                type: DataTypes.ENUM('sinistre', 'dossier', 'etape'),
                allowNull: false
            },
            entite_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            action: {
                type: DataTypes.STRING,
                allowNull: false
            },
            detail: {
                type: DataTypes.TEXT,
                allowNull: true
            }
        },
        {
            sequelize: dbInstance,
            modelName: 'Historique',
            tableName: 'Historique',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: false
        }
    );

    return Historique;
};

module.exports = Historique;
