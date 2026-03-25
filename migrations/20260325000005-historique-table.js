'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('Historique', {
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
        entite_type: {
          type: Sequelize.ENUM('sinistre', 'dossier', 'etape'),
          allowNull: false
        },
        entite_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        action: {
          type: Sequelize.STRING,
          allowNull: false
        },
        detail: {
          type: Sequelize.TEXT,
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
    await queryInterface.dropTable('Historique');
  }
};
