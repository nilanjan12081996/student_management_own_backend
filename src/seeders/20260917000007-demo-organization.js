'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Organizations', [
      {
        name: 'Default Organization',
        slug: 'default-org',
        owner_name: 'System',
        email: 'admin@default.org',
        plan: 'starter',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Organizations', { slug: 'default-org' }, {});
  }
};
