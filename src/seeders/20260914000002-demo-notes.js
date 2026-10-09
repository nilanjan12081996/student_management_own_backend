'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Notes', [
      {
        title: 'Introduction to Data Structures',
        topic: 'Arrays and Linked Lists',
        class: 'Computer Science',
        semester: 'Semester 1',
        content_type: 'text',
        content_url: 'An introduction to primitive and non-primitive data structures with focus on linear arrays.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Operating Systems - Concurrency & Threads',
        topic: 'Process Management',
        class: 'Computer Science',
        semester: 'Semester 2',
        content_type: 'pdf',
        content_url: 'https://storage.example.com/notes/os-concurrency.pdf',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Database Normalization Guide',
        topic: 'Relational Database Design',
        class: 'Information Technology',
        semester: 'Semester 1',
        content_type: 'pdf',
        content_url: 'https://storage.example.com/notes/db-normalization.pdf',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Notes', null, {});
  }
};
