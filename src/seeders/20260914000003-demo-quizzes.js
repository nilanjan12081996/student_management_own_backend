'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Quizzes', [
      {
        title: 'JavaScript Fundamentals Assessment',
        month: 'September',
        total_marks: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Data Structures & Algorithms Midterm Quiz',
        month: 'October',
        total_marks: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'SQL & Database Design Quiz',
        month: 'September',
        total_marks: 40,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Quizzes', null, {});
  }
};
