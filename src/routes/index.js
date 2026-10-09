const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoute/userRoute');
const noteRoutes = require('./noteRoute/noteRoute');
const quizRoutes = require('./quizRoute/quizRoute');
const questionRoutes = require('./questionRoute/questionRoute');
const organisationsRoutes = require('./organizationsRoute/organizationsRoute');
const batchRoutes = require('./batchRoute/batchRoute');
const tuitionPassRoutes = require('./tuitionPassRoute/tuitionPassRoute');
const aiRoutes = require('./aiRoute/aiRoute');

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'API is healthy' });
});

// Mount routes
router.use('/users', userRoutes);
router.use('/notes', noteRoutes);
router.use('/quizzes', quizRoutes);
router.use('/quiz', quizRoutes); // Alias for convenience
router.use('/questions', questionRoutes);
router.use('/organizations', organisationsRoutes); // Standard US spelling
router.use('/organisations', organisationsRoutes); // UK spelling alias
router.use('/batches', batchRoutes);
router.use('/tuition-passes', tuitionPassRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
