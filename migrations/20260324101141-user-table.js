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
          unique: true,
          allowNull: false
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
          type: Sequelize.STRING
        },
        role: {
          type: Sequelize.ENUM,
          values: ['superadmin', 'manager', 'sinister_manager', 'request_manager', 'insured'],
          allowNull: false,
          defaultValue: 'insured'
        },
        token: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        refresh_token: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        two_step_code: {
          type: Sequelize.STRING,
          allowNull: true
        },
        active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
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
