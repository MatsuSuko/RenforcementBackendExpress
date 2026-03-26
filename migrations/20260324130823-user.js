'use strict';
const bcrypt = require('bcrypt');
require('dotenv').config();

module.exports = {
  async up(queryInterface) {
    const hashedPassword = await bcrypt.hash('MotDeP@ss123', parseInt(process.env.BCRYPT_SALT) || 10);
    await queryInterface.bulkInsert('User', [
      {
        username: 'admin',
        password: hashedPassword,
        firstname: 'Admin',
        lastname: 'AssurMoi',
        email: 'admin@assurmoi.fr',
        role: 'superadmin',
        active: true
      }
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('User', { username: 'admin' });
  }
};
