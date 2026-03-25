'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('User', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        username: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false
        },
        firstname: {
          type: Sequelize.STRING,
          allowNull: true
        },
        lastname: {
          type: Sequelize.STRING,
          allowNull: true
        },
        email: {
          type: Sequelize.STRING,
          allowNull: true
        },
        role: {
          type: Sequelize.ENUM('administrateur', 'gestionnaire', 'charge_suivi', 'charge_clientele'),
          allowNull: false,
          defaultValue: 'charge_clientele'
        },
        actif: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        deux_facteurs_actif: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        deux_facteurs_code: {
          type: Sequelize.STRING,
          allowNull: true
        },
        deux_facteurs_expiration: {
          type: Sequelize.DATE,
          allowNull: true
        },
        reset_token: {
          type: Sequelize.STRING,
          allowNull: true
        },
        reset_token_expiration: {
          type: Sequelize.DATE,
          allowNull: true
        }
      }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('User');
  }
};
