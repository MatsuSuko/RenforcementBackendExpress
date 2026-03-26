const { Model, DataTypes } = require('sequelize');

const User = (dbInstance, DataTypes) => {
    class User extends Model {
        static associate(models) {
            this.hasMany(models.Sinistre, { foreignKey: 'utilisateur_id', as: 'Sinistres' });
            this.hasMany(models.Dossier, { foreignKey: 'charge_suivi_id', as: 'Dossiers' });
        }

        clean() {
            const { password, token, refresh_token, two_step_code, reset_token, reset_token_expiration, ...cleanUser } = this.dataValues;
            return cleanUser;
        }
    }

    User.init(
        {
            username: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false
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
            email: DataTypes.STRING,
            role: {
                type: DataTypes.ENUM('superadmin', 'manager', 'sinister_manager', 'request_manager', 'insured'),
                allowNull: false,
                defaultValue: 'insured'
            },
            token: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            refresh_token: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            two_step_code: {
                type: DataTypes.STRING,
                allowNull: true
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
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