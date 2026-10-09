'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      "SELECT id, email FROM Users WHERE role = 'student'",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const quizzes = await queryInterface.sequelize.query(
      "SELECT id FROM Quizzes",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const challenges = await queryInterface.sequelize.query(
      "SELECT id FROM CodingChallenges",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0) return;

    const progressEntries = [];

    if (quizzes.length > 0) {
      progressEntries.push({
        user_id: users[0].id,
        task_id: quizzes[0].id,
        task_type: 'quiz',
        score: 46,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      if (users.length > 1) {
        progressEntries.push({
          user_id: users[1].id,
          task_id: quizzes[0].id,
          task_type: 'quiz',
          score: 42,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    if (challenges.length > 0) {
      progressEntries.push({
        user_id: users[0].id,
        task_id: challenges[0].id,
        task_type: 'coding',
        score: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    if (progressEntries.length > 0) {
      await queryInterface.bulkInsert('StudentProgresses', progressEntries, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('StudentProgresses', null, {});
  }
};
