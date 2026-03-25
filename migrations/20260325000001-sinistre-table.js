'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('Sinistre', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        utilisateur_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'User', key: 'id' }
        },
        immatriculation: {
          type: Sequelize.STRING,
          allowNull: false
        },
        conducteur_nom: {
          type: Sequelize.STRING,
          allowNull: false
        },
        conducteur_prenom: {
          type: Sequelize.STRING,
          allowNull: false
        },
        conducteur_est_assure: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        date_appel: {
          type: Sequelize.DATE,
          allowNull: false
        },
        date_accident: {
          type: Sequelize.DATE,
          allowNull: false
        },
        contexte: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        responsabilite_engagee: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        pourcentage_responsabilite: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        statut: {
          type: Sequelize.ENUM('en_cours', 'complet', 'clos'),
          allowNull: false,
          defaultValue: 'en_cours'
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
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
    await queryInterface.dropTable('Sinistre');
  }
};
