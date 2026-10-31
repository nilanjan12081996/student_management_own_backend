'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('Users', 'reset_password_token', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (e) {
      // ignore if exists
    }

    try {
      await queryInterface.addColumn('Users', 'reset_password_expires', {
        type: Sequelize.DATE,
        allowNull: true
      });
    } catch (e) {
      // ignore if exists
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('Users', 'reset_password_token');
    } catch (e) {}
    try {
      await queryInterface.removeColumn('Users', 'reset_password_expires');
    } catch (e) {}
  }
};
