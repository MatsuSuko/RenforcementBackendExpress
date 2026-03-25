'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('Dossier', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        sinistre_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: { model: 'Sinistre', key: 'id' }
        },
        charge_suivi_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'User', key: 'id' }
        },
        numero_dossier: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        statut: {
          type: Sequelize.ENUM(
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
          type: Sequelize.ENUM('reparable', 'perte_totale'),
          allowNull: true
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
    await queryInterface.dropTable('Dossier');
  }
};
