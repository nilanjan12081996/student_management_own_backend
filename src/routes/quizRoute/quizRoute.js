const express = require('express');
const quizController = require('../../controllers/quizController');
const questionController = require('../../controllers/questionController');
const { authenticateToken, requireAdmin } = require('../../middleware/authMiddleware');

const router = express.Router();

// ==========================================
// ADMIN / TUTOR ONLY QUIZ CREATION
// ==========================================
// CREATE QUIZ (Admin/Tutor only)
router.post('/createQuiz', authenticateToken, requireAdmin, quizController.createQuiz);
router.post('/create', authenticateToken, requireAdmin, quizController.createQuiz);
router.post('/', authenticateToken, requireAdmin, quizController.createQuiz);

// SUB-ROUTE: ADD QUESTION TO QUIZ (Admin/Tutor only)
router.post('/:quizId/questions', authenticateToken, requireAdmin, questionController.createQuestion);

// SUBMISSIONS FOR A SPECIFIC QUIZ (Admin/Tutor only)
router.get('/:id/submissions', authenticateToken, requireAdmin, quizController.getQuizSubmissions);

// UPDATE QUIZ (Admin/Tutor only)
router.put('/updateQuiz/:id', authenticateToken, requireAdmin, quizController.updateQuiz);
router.put('/update/:id', authenticateToken, requireAdmin, quizController.updateQuiz);
router.put('/:id', authenticateToken, requireAdmin, quizController.updateQuiz);

// DELETE QUIZ (Admin/Tutor only)
router.delete('/deleteQuiz/:id', authenticateToken, requireAdmin, quizController.deleteQuiz);
router.delete('/delete/:id', authenticateToken, requireAdmin, quizController.deleteQuiz);
router.delete('/:id', authenticateToken, requireAdmin, quizController.deleteQuiz);

// ==========================================
// STUDENT & SHARED QUIZ ROUTES
// ==========================================
// SUBMIT QUIZ & AI EVALUATION (Students & Admins)
router.post('/submit', authenticateToken, quizController.submitQuiz);
router.post('/:id/submit', authenticateToken, quizController.submitQuiz);

// STUDENT PROGRESS & TOPIC FOCUS GUIDANCE
router.get('/student-progress/:userId', authenticateToken, quizController.getStudentProgress);
router.get('/progress/:userId', authenticateToken, quizController.getStudentProgress);

// GET ALL QUIZZES (Students & Admins)
router.get('/getAllQuizzes', authenticateToken, quizController.getAllQuizzes);
router.get('/getAll', authenticateToken, quizController.getAllQuizzes);
router.get('/', authenticateToken, quizController.getAllQuizzes);

// GET QUIZZES BY FIELD / TITLE
router.get('/field/:field', authenticateToken, quizController.getQuizzesByField);
router.get('/getByField/:field', authenticateToken, quizController.getQuizzesByField);

// SUB-ROUTE: GET QUESTIONS FOR A QUIZ (Students taking quiz)
router.get('/:quizId/questions', authenticateToken, questionController.getQuestionsByQuizId);

// GET QUIZ BY ID (Must be after specific named routes)
router.get('/getQuizById/:id', authenticateToken, quizController.getQuizById);
router.get('/getById/:id', authenticateToken, quizController.getQuizById);
router.get('/:id', authenticateToken, quizController.getQuizById);

module.exports = router;
