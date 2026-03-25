const { Model, DataTypes } = require('sequelize');

const User = (dbInstance, DataTypes) => {
    class User extends Model {
        static associate(models) {
            this.hasMany(models.Sinistre, {
                foreignKey: 'utilisateur_id',
                as: 'Sinistres'
            });
            this.hasMany(models.Dossier, {
                foreignKey: 'charge_suivi_id',
                as: 'Dossiers'
            });
        }
    }

    User.init(
        {
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            firstname: {
                type: DataTypes.STRING,
                allowNull: true
            },
            lastname: {
                type: DataTypes.STRING,
                allowNull: true
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true
            },
            role: {
                type: DataTypes.ENUM('administrateur', 'gestionnaire', 'charge_suivi', 'charge_clientele'),
                allowNull: false,
                defaultValue: 'charge_clientele'
            },
            actif: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            deux_facteurs_actif: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            deux_facteurs_code: {
                type: DataTypes.STRING,
                allowNull: true
            },
            deux_facteurs_expiration: {
                type: DataTypes.DATE,
                allowNull: true
            },
            reset_token: {
                type: DataTypes.STRING,
                allowNull: true
            },
            reset_token_expiration: {
                type: DataTypes.DATE,
                allowNull: true
            }
        },
        {
            sequelize: dbInstance,
            modelName: 'User',
            tableName: 'User',
            timestamps: false
        }
    );

    return User;
};

module.exports = User;