const express = require('express');
const questionController = require('../../controllers/questionController');
const { authenticateToken, requireAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();

// ==========================================
// ADMIN / TUTOR ONLY QUESTION MODIFICATIONS
// ==========================================
// CREATE QUESTION (Admin/Tutor only)
router.post('/createQuestion', authenticateToken, requireAdmin, questionController.createQuestion);
router.post('/create', authenticateToken, requireAdmin, questionController.createQuestion);
router.post('/', authenticateToken, requireAdmin, questionController.createQuestion);

// UPDATE QUESTION (Admin/Tutor only)
router.put('/updateQuestion/:id', authenticateToken, requireAdmin, questionController.updateQuestion);
router.put('/update/:id', authenticateToken, requireAdmin, questionController.updateQuestion);
router.put('/:id', authenticateToken, requireAdmin, questionController.updateQuestion);

// DELETE QUESTION (Admin/Tutor only)
router.delete('/deleteQuestion/:id', authenticateToken, requireAdmin, questionController.deleteQuestion);
router.delete('/delete/:id', authenticateToken, requireAdmin, questionController.deleteQuestion);
router.delete('/:id', authenticateToken, requireAdmin, questionController.deleteQuestion);

// ==========================================
// STUDENT & SHARED QUESTION ACCESS
// ==========================================
// GET QUESTIONS BY QUIZ ID (Students taking quiz)
router.get('/quiz/:quizId', authenticateToken, questionController.getQuestionsByQuizId);

// GET QUESTION BY ID
router.get('/getQuestionById/:id', authenticateToken, questionController.getQuestionById);
router.get('/getById/:id', authenticateToken, questionController.getQuestionById);
router.get('/:id', authenticateToken, questionController.getQuestionById);

module.exports = router;
