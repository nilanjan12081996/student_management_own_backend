const express = require('express');
const quizController = require('../../controllers/quizController');
const questionController = require('../../controllers/questionController');

const router = express.Router();

// CREATE QUIZ
router.post('/createQuiz', quizController.createQuiz);
router.post('/create', quizController.createQuiz);
router.post('/', quizController.createQuiz);

// GET ALL QUIZZES (supports query filters ?field=, ?title=, ?month=, ?search=, ?includeQuestions=true)
router.get('/getAllQuizzes', quizController.getAllQuizzes);
router.get('/getAll', quizController.getAllQuizzes);
router.get('/', quizController.getAllQuizzes);

// GET QUIZZES BY FIELD / TITLE
router.get('/field/:field', quizController.getQuizzesByField);
router.get('/getByField/:field', quizController.getQuizzesByField);

// SUB-ROUTES: QUESTIONS FOR A SPECIFIC QUIZ
router.post('/:quizId/questions', questionController.createQuestion);
router.get('/:quizId/questions', questionController.getQuestionsByQuizId);

// GET QUIZ BY ID
router.get('/getQuizById/:id', quizController.getQuizById);
router.get('/getById/:id', quizController.getQuizById);
router.get('/:id', quizController.getQuizById);

// UPDATE QUIZ
router.put('/updateQuiz/:id', quizController.updateQuiz);
router.put('/update/:id', quizController.updateQuiz);
router.put('/:id', quizController.updateQuiz);

// DELETE QUIZ
router.delete('/deleteQuiz/:id', quizController.deleteQuiz);
router.delete('/delete/:id', quizController.deleteQuiz);
router.delete('/:id', quizController.deleteQuiz);

module.exports = router;
