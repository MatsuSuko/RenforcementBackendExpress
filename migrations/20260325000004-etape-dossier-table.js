'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('EtapeDossier', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        dossier_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'Dossier', key: 'id' }
        },
        validateur_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'User', key: 'id' }
        },
        libelle: {
          type: Sequelize.STRING,
          allowNull: false
        },
        statut: {
          type: Sequelize.ENUM('en_attente', 'en_cours', 'complete', 'validee'),
          allowNull: false,
          defaultValue: 'en_attente'
        },
        validation_requise: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        valide: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        commentaire: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        date_echeance: {
          type: Sequelize.DATE,
          allowNull: true
        },
        completed_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        created_at: {
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
    await queryInterface.dropTable('EtapeDossier');
  }
};
