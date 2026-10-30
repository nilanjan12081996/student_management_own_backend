'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const quizzes = await queryInterface.sequelize.query(
      "SELECT id, title FROM Quizzes;",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const orgs = await queryInterface.sequelize.query(
      "SELECT id FROM Organizations LIMIT 1;",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const defaultOrgId = (orgs && orgs.length > 0) ? orgs[0].id : 1;

    const quizMap = {};
    (quizzes || []).forEach(q => {
      quizMap[q.title] = q.id;
    });

    const defaultQuizId = (quizzes && quizzes.length > 0) ? quizzes[0].id : 1;
    const jsQuizId = quizMap['JavaScript Fundamentals & ES6+'] || defaultQuizId;
    const diagQuizId = quizMap['Student Progress Diagnostic Assessment'] || defaultQuizId;

    await queryInterface.bulkInsert('Questions', [
      {
        quiz_id: jsQuizId,
        organization_id: defaultOrgId,
        question_text: 'Which keyword declares a block-scoped variable in modern JavaScript?',
        options: JSON.stringify(['var', 'let', 'global', 'define']),
        correct_answer: 'let',
        marks: 5,
        explanation: 'The "let" keyword declares a block-scoped local variable, whereas "var" is function-scoped.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quiz_id: jsQuizId,
        organization_id: defaultOrgId,
        question_text: 'What will typeof NaN return in JavaScript?',
        options: JSON.stringify(['number', 'NaN', 'undefined', 'object']),
        correct_answer: 'number',
        marks: 5,
        explanation: 'In JavaScript, NaN is a special numeric value, so typeof NaN is "number".',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quiz_id: jsQuizId,
        organization_id: defaultOrgId,
        question_text: 'What is a closure in JavaScript?',
        options: JSON.stringify([
          'A function bundled with references to its surrounding lexical state',
          'A built-in method to close browser tabs',
          'A syntax rule that terminates loops',
          'An encrypted JSON token'
        ]),
        correct_answer: 'A function bundled with references to its surrounding lexical state',
        marks: 5,
        explanation: 'A closure gives an inner function access to an outer function’s scope.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quiz_id: diagQuizId,
        organization_id: defaultOrgId,
        question_text: 'Which JavaScript operator provides a safe way to access deeply nested object properties without throwing TypeError if an intermediate reference is null or undefined?',
        options: JSON.stringify(['Optional chaining (?.)', 'Nullish coalescing (??)', 'Spread operator (...)', 'Logical OR (||)']),
        correct_answer: 'Optional chaining (?.)',
        marks: 5,
        explanation: 'Optional chaining (?.) short-circuits to undefined if the reference before ?. is null or undefined.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quiz_id: diagQuizId,
        organization_id: defaultOrgId,
        question_text: 'In Python, what is the key difference between "==" and "is"?',
        options: JSON.stringify([
          '"==" checks value equality; "is" checks object identity in memory',
          '"==" is for numbers; "is" is for strings',
          '"is" converts types automatically; "==" does not',
          'They are identical and interchangeable synonyms in Python 3'
        ]),
        correct_answer: '"==" checks value equality; "is" checks object identity in memory',
        marks: 5,
        explanation: '== compares the values using __eq__, whereas "is" checks if both references point to the same id() memory address.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quiz_id: diagQuizId,
        organization_id: defaultOrgId,
        question_text: 'Which normal form is violated if a non-key attribute depends on another non-key attribute (Transitive Dependency)?',
        options: JSON.stringify(['Third Normal Form (3NF)', 'First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Boyce-Codd Normal Form (BCNF)']),
        correct_answer: 'Third Normal Form (3NF)',
        marks: 5,
        explanation: '3NF requires being in 2NF and eliminating all transitive functional dependencies among non-prime attributes.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quiz_id: diagQuizId,
        organization_id: defaultOrgId,
        question_text: 'What will happen if you call a React state setter with the exact same primitive value as current state (e.g. setCount(5) when count is 5)?',
        options: JSON.stringify([
          'React bails out of re-rendering the component and its children',
          'React throws an infinite loop warning in the console',
          'The component unmounts and remounts immediately',
          'The component state resets to the initial useState default'
        ]),
        correct_answer: 'React bails out of re-rendering the component and its children',
        marks: 5,
        explanation: 'Using Object.is equality, React detects identical values and bails out without re-rendering children.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        quiz_id: diagQuizId,
        organization_id: defaultOrgId,
        question_text: 'What is the average time complexity of finding an item in a balanced Binary Search Tree (AVL or Red-Black Tree)?',
        options: JSON.stringify(['O(log N)', 'O(1)', 'O(N)', 'O(N log N)']),
        correct_answer: 'O(log N)',
        marks: 5,
        explanation: 'Balanced BSTs maintain a height of O(log N), guaranteeing logarithmic search time.',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Questions', null, {});
  }
};
