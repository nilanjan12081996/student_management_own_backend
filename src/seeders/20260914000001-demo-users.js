'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        class: null,
        semester: null,
        course: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'student',
        class: 'Computer Science',
        semester: 'Semester 1',
        course: 'B.Tech Computer Science and Engineering',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: 'password123',
        role: 'student',
        class: 'Computer Science',
        semester: 'Semester 2',
        course: 'B.Tech Computer Science and Engineering',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Alex Johnson',
        email: 'alex.j@example.com',
        password: 'password123',
        role: 'student',
        class: 'Information Technology',
        semester: 'Semester 1',
        course: 'B.Tech Information Technology',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
