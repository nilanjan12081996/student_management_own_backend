'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('Notes');

    if (!tableDescription.batch_id) {
      await queryInterface.addColumn('Notes', 'batch_id', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    }

    if (!tableDescription.batch_name) {
      await queryInterface.addColumn('Notes', 'batch_name', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('Notes');

    if (tableDescription.batch_id) {
      await queryInterface.removeColumn('Notes', 'batch_id');
    }

    if (tableDescription.batch_name) {
      await queryInterface.removeColumn('Notes', 'batch_name');
    }
  }
};

