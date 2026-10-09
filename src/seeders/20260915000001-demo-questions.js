'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const quizzes = await queryInterface.sequelize.query(
      "SELECT id FROM Quizzes WHERE title = 'JavaScript Fundamentals Assessment' LIMIT 1;",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const quizId = quizzes.length > 0 ? quizzes[0].id : 1;

    await queryInterface.bulkInsert('Questions', [
      {
        quiz_id: quizId,
        question_text: 'Which keyword declares a block-scoped variable that cannot be reassigned?',
        options: JSON.stringify(['var', 'let', 'const', 'static']),
        correct_answer: 'const',
        marks: 5,
        explanation: 'const creates a block-scoped immutable binding in JavaScript.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quiz_id: quizId,
        question_text: 'What will typeof NaN return in JavaScript?',
        options: JSON.stringify(['number', 'NaN', 'undefined', 'object']),
        correct_answer: 'number',
        marks: 5,
        explanation: 'In JavaScript, NaN is a special numeric value, so typeof NaN is "number".',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quiz_id: quizId,
        question_text: 'What is a closure in JavaScript?',
        options: JSON.stringify([
          'A function bundled with references to its surrounding lexical state',
          'A built-in method to close browser tabs',
          'A syntax rule that terminates loops',
          'An encrypted JSON token'
        ]),
        correct_answer: 'A function bundled with references to its surrounding lexical state',
        marks: 10,
        explanation: 'A closure gives an inner function access to an outer function’s scope.',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Questions', null, {});
  }
};
