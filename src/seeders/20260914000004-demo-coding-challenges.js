'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('CodingChallenges', [
      {
        title: 'Two Sum Problem',
        type: 'practice',
        month: 'September',
        problem_statement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Reverse a Linked List',
        type: 'practice',
        month: 'September',
        problem_statement: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Competitive Sprint: Longest Substring Without Repeating Characters',
        type: 'competitive',
        month: 'October',
        problem_statement: 'Given a string s, find the length of the longest substring without repeating characters.',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CodingChallenges', null, {});
  }
};
