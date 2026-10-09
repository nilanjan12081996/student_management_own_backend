'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Organizations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING,
        unique: true
      },
      owner_name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      plan: {
        type: Sequelize.ENUM('starter', 'pro', 'enterprise'),
        defaultValue: 'pro'
      },
      status: {
        type: Sequelize.ENUM('active', 'suspended'),
        defaultValue: 'active'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Organizations');
  }
};
