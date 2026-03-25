'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('DocumentSinistre', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        sinistre_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'Sinistre', key: 'id' }
        },
        type: {
          type: Sequelize.ENUM('attestation_assurance', 'carte_grise', 'piece_identite'),
          allowNull: false
        },
        chemin_fichier: {
          type: Sequelize.STRING,
          allowNull: false
        },
        uploaded_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });
      transaction.commit();
    } catch (err) {
      transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('DocumentSinistre');
  }
};
