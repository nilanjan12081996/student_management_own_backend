const express = require('express');
const questionController = require('../../controllers/questionController');

const router = express.Router();

// CREATE QUESTION
router.post('/createQuestion', questionController.createQuestion);
router.post('/create', questionController.createQuestion);
router.post('/', questionController.createQuestion);

// GET QUESTIONS BY QUIZ ID
router.get('/quiz/:quizId', questionController.getQuestionsByQuizId);

// GET QUESTION BY ID
router.get('/getQuestionById/:id', questionController.getQuestionById);
router.get('/getById/:id', questionController.getQuestionById);
router.get('/:id', questionController.getQuestionById);

// UPDATE QUESTION
router.put('/updateQuestion/:id', questionController.updateQuestion);
router.put('/update/:id', questionController.updateQuestion);
router.put('/:id', questionController.updateQuestion);

// DELETE QUESTION
router.delete('/deleteQuestion/:id', questionController.deleteQuestion);
router.delete('/delete/:id', questionController.deleteQuestion);
router.delete('/:id', questionController.deleteQuestion);

module.exports = router;
