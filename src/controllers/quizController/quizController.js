const { Quiz, Question } = require('../../models');
const { Op } = require('sequelize');

// Helper to normalize options
const formatOptions = (options) => {
  if (!options) return options;
  if (typeof options === 'string') {
    try {
      return JSON.parse(options);
    } catch {
      return options;
    }
  }
  return options;
};

// Create a new quiz (supports optional nested questions)
const createQuiz = async (req, res) => {
  try {
    const {
      title,
      field,
      month,
      total_marks,
      questions
    } = req.body;

    const quizTitle = title || field;

    if (!quizTitle) {
      return res.status(400).json({
        message: 'Quiz title or field is required'
      });
    }

    // Compute total_marks if not provided but questions exist
    let computedTotalMarks = total_marks;
    if (computedTotalMarks === undefined && Array.isArray(questions) && questions.length > 0) {
      computedTotalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
    }

    const quiz = await Quiz.create({
      title: quizTitle,
      month: month || 'Unassigned',
      total_marks: computedTotalMarks !== undefined ? computedTotalMarks : 0
    });

    // If initial questions were provided, create them in bulk
    let createdQuestions = [];
    if (Array.isArray(questions) && questions.length > 0) {
      const questionRecords = questions.map(q => ({
        quiz_id: quiz.id,
        question_text: q.question_text || q.question,
        options: typeof q.options === 'object' ? JSON.stringify(q.options) : q.options,
        correct_answer: q.correct_answer || q.answer,
        marks: q.marks !== undefined ? q.marks : 1,
        explanation: q.explanation || null
      }));

      createdQuestions = await Question.bulkCreate(questionRecords);
    }

    const responseQuiz = quiz.toJSON();
    if (createdQuestions.length > 0) {
      responseQuiz.questions = createdQuestions.map(q => {
        const item = q.toJSON();
        item.options = formatOptions(item.options);
        return item;
      });
    }

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz: responseQuiz
    });
  } catch (error) {
    console.error('Error in createQuiz:', error);
    res.status(500).json({
      message: 'Failed to create quiz',
      error: error.message
    });
  }
};

// Get all quizzes with optional filtering by field/title, month, or search keyword
const getAllQuizzes = async (req, res) => {
  try {
    const { field, title, month, search, includeQuestions } = req.query;
    const where = {};

    const targetField = field || title || search;
    if (targetField) {
      where.title = {
        [Op.like]: `%${targetField.trim()}%`
      };
    }

    if (month) {
      where.month = month.trim();
    }

    const includeOptions = [];
    if (includeQuestions === 'true' || includeQuestions === '1') {
      includeOptions.push({
        model: Question,
        as: 'questions'
      });
    }

    const quizzes = await Quiz.findAll({
      where,
      include: includeOptions,
      order: [['id', 'ASC']]
    });

    const formattedQuizzes = quizzes.map(quiz => {
      const q = quiz.toJSON();
      if (q.questions) {
        q.questions = q.questions.map(question => ({
          ...question,
          options: formatOptions(question.options)
        }));
      }
      return q;
    });

    res.status(200).json({
      message: 'Quizzes fetched successfully',
      total: formattedQuizzes.length,
      quizzes: formattedQuizzes
    });
  } catch (error) {
    console.error('Error in getAllQuizzes:', error);
    res.status(500).json({
      message: 'Failed to fetch quizzes',
      error: error.message
    });
  }
};

// Get single quiz by ID (includes its questions)
const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findByPk(id, {
      include: [{
        model: Question,
        as: 'questions'
      }]
    });

    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found'
      });
    }

    const quizData = quiz.toJSON();
    if (quizData.questions) {
      quizData.questions = quizData.questions.map(q => ({
        ...q,
        options: formatOptions(q.options)
      }));
    }

    res.status(200).json({
      message: 'Quiz fetched successfully',
      quiz: quizData
    });
  } catch (error) {
    console.error('Error in getQuizById:', error);
    res.status(500).json({
      message: 'Failed to fetch quiz',
      error: error.message
    });
  }
};

// Get quizzes by specific field or title
const getQuizzesByField = async (req, res) => {
  try {
    const field = req.params.field || req.query.field;

    if (!field) {
      return res.status(400).json({
        message: 'Field parameter is required'
      });
    }

    const quizzes = await Quiz.findAll({
      where: {
        title: {
          [Op.like]: `%${field.trim()}%`
        }
      },
      include: [{
        model: Question,
        as: 'questions'
      }],
      order: [['id', 'ASC']]
    });

    const formattedQuizzes = quizzes.map(quiz => {
      const q = quiz.toJSON();
      if (q.questions) {
        q.questions = q.questions.map(question => ({
          ...question,
          options: formatOptions(question.options)
        }));
      }
      return q;
    });

    res.status(200).json({
      message: `Quizzes for field "${field}" fetched successfully`,
      total: formattedQuizzes.length,
      quizzes: formattedQuizzes
    });
  } catch (error) {
    console.error('Error in getQuizzesByField:', error);
    res.status(500).json({
      message: 'Failed to fetch quizzes by field',
      error: error.message
    });
  }
};

// Update quiz by ID
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, field, month, total_marks } = req.body;

    const quiz = await Quiz.findByPk(id);

    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found'
      });
    }

    const updatedTitle = title !== undefined ? title : (field !== undefined ? field : quiz.title);
    const updatedMonth = month !== undefined ? month : quiz.month;
    const updatedMarks = total_marks !== undefined ? total_marks : quiz.total_marks;

    await quiz.update({
      title: updatedTitle,
      month: updatedMonth,
      total_marks: updatedMarks
    });

    res.status(200).json({
      message: 'Quiz updated successfully',
      quiz
    });
  } catch (error) {
    console.error('Error in updateQuiz:', error);
    res.status(500).json({
      message: 'Failed to update quiz',
      error: error.message
    });
  }
};

// Delete quiz by ID (cascades to associated questions)
const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findByPk(id);

    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found'
      });
    }

    await quiz.destroy();

    res.status(200).json({
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteQuiz:', error);
    res.status(500).json({
      message: 'Failed to delete quiz',
      error: error.message
    });
  }
};

module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  getQuizzesByField,
  updateQuiz,
  deleteQuiz
};
