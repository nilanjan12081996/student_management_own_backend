'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Quizzes', [
      {
        organization_id: 1,
        title: 'JavaScript Fundamentals & ES6+',
        month: 'September',
        total_marks: 25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        organization_id: 1,
        title: 'Node.js & Express REST Architecture',
        month: 'October',
        total_marks: 25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        organization_id: 2,
        title: 'Algebra II & Quadratic Functions',
        month: 'November',
        total_marks: 25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        organization_id: 1,
        title: 'Python Programming & Data Structures',
        month: 'October',
        total_marks: 25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        organization_id: 1,
        title: 'Relational Databases & SQL Queries',
        month: 'September',
        total_marks: 25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        organization_id: 1,
        title: 'React & Modern Frontend Engineering',
        month: 'October',
        total_marks: 25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        organization_id: 1,
        title: 'Object-Oriented Programming (OOP) in Java',
        month: 'November',
        total_marks: 25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        organization_id: 1,
        title: 'Data Structures & Algorithms Basics',
        month: 'December',
        total_marks: 25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        organization_id: 1,
        title: 'Student Progress Diagnostic Assessment',
        month: 'October',
        total_marks: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Quizzes', null, {});
  }
};
