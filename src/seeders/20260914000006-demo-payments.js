'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      "SELECT id, email FROM Users WHERE role = 'student'",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0) return;

    const payments = [
      {
        user_id: users[0].id,
        amount: 5000.00,
        status: 'success',
        transaction_id: 'TXN_' + Date.now() + '_01',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    if (users.length > 1) {
      payments.push({
        user_id: users[1].id,
        amount: 5000.00,
        status: 'pending',
        transaction_id: 'TXN_' + Date.now() + '_02',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await queryInterface.bulkInsert('Payments', payments, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Payments', null, {});
  }
};
