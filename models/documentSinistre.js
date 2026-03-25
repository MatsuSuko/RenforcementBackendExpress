const { Model, DataTypes } = require('sequelize')

const DocumentSinistre = (dbInstance, DataTypes) => {
    class DocumentSinistre extends Model {
        static associate(models) {
            this.belongsTo(models.Sinistre, {
                foreignKey: 'sinistre_id',
                as: 'Sinistre'
            });
        }
    }

    DocumentSinistre.init(
        {
            sinistre_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            type: {
                type: DataTypes.ENUM('attestation_assurance', 'carte_grise', 'piece_identite'),
                allowNull: false
            },
            chemin_fichier: {
                type: DataTypes.STRING,
                allowNull: false
            }
        },
        {
            sequelize: dbInstance,
            modelName: 'DocumentSinistre',
            tableName: 'DocumentSinistre',
            timestamps: true,
            createdAt: 'uploaded_at',
            updatedAt: false
        }
    );

    return DocumentSinistre;
};

module.exports = DocumentSinistre;
