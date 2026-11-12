const { Question, Quiz } = require('../../models');

let questionColumnsEnsured = false;
const ensureQuestionColumns = async () => {
  if (questionColumnsEnsured) return;
  try {
    const sequelize = Question.sequelize;
    const alterQueries = [
      "ALTER TABLE Questions MODIFY COLUMN correct_answer TEXT NOT NULL",
      "ALTER TABLE questions MODIFY COLUMN correct_answer TEXT NOT NULL",
      "ALTER TABLE Questions ADD COLUMN organization_id INT NOT NULL DEFAULT 1",
      "ALTER TABLE questions ADD COLUMN organization_id INT NOT NULL DEFAULT 1"
    ];
    for (const sql of alterQueries) {
      try {
        await sequelize.query(sql);
      } catch (_) {}
    }
    questionColumnsEnsured = true;
  } catch (err) {
    console.warn('ensureQuestionColumns note:', err.message);
    questionColumnsEnsured = true;
  }
};

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

// Create a new question for a quiz
const createQuestion = async (req, res) => {
  try {
    await ensureQuestionColumns();
    const rawQuizId = req.params.quizId || req.body.quiz_id;
    const quiz_id = Number(rawQuizId);
    const {
      question_text,
      question,
      options,
      correct_answer,
      answer,
      marks,
      explanation,
      organization_id
    } = req.body;

    const resolvedText = (question_text || question || '').trim();
    const resolvedAnswer = String(correct_answer || answer || '').trim();

    if (!rawQuizId || !Number.isInteger(quiz_id) || quiz_id <= 0) {
      return res.status(400).json({
        message: 'Valid numeric quiz_id is required'
      });
    }

    if (!resolvedText) {
      return res.status(400).json({
        message: 'question_text is required'
      });
    }

    if (!resolvedAnswer) {
      return res.status(400).json({
        message: 'correct_answer is required'
      });
    }

    // Verify the quiz exists
    const quiz = await Quiz.findByPk(quiz_id);
    if (!quiz) {
      return res.status(404).json({
        message: `Quiz with id ${quiz_id} not found`
      });
    }

    const resolvedOrganizationId =
      Number(organization_id || quiz.organization_id || req.user?.organization_id || 1) || 1;
    const parsedMarks =
      marks !== undefined && marks !== null && String(marks).trim() !== '' && Number.isFinite(Number(marks))
        ? parseInt(marks, 10)
        : 1;

    const formattedOptions = options !== undefined && options !== null
      ? (typeof options === 'object' ? JSON.stringify(options) : options)
      : null;

    const newQuestion = await Question.create({
      organization_id: resolvedOrganizationId,
      quiz_id,
      question_text: resolvedText,
      options: formattedOptions,
      correct_answer: resolvedAnswer,
      marks: parsedMarks,
      explanation: explanation || null
    });

    const responseQuestion = newQuestion.toJSON();
    responseQuestion.options = formatOptions(responseQuestion.options);

    res.status(201).json({
      message: 'Question created successfully',
      question: responseQuestion
    });
  } catch (error) {
    console.error('Error in createQuestion:', error);
    res.status(500).json({
      message: 'Failed to create question',
      error: error.message
    });
  }
};

// Get all questions for a specific quiz
const getQuestionsByQuizId = async (req, res) => {
  try {
    const quiz_id = req.params.quizId || req.query.quizId;

    if (!quiz_id) {
      return res.status(400).json({
        message: 'quiz_id is required'
      });
    }

    const quiz = await Quiz.findByPk(quiz_id);
    if (!quiz) {
      return res.status(404).json({
        message: `Quiz with id ${quiz_id} not found`
      });
    }

    const questions = await Question.findAll({
      where: { quiz_id },
      order: [['id', 'ASC']]
    });

    const formattedQuestions = questions.map(q => {
      const item = q.toJSON();
      item.options = formatOptions(item.options);
      return item;
    });

    res.status(200).json({
      message: `Questions for quiz "${quiz.title}" fetched successfully`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      total: formattedQuestions.length,
      questions: formattedQuestions
    });
  } catch (error) {
    console.error('Error in getQuestionsByQuizId:', error);
    res.status(500).json({
      message: 'Failed to fetch questions',
      error: error.message
    });
  }
};

// Get single question by ID
const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findByPk(id, {
      include: [{
        model: Quiz,
        as: 'quiz',
        attributes: ['id', 'title', 'month', 'total_marks']
      }]
    });

    if (!question) {
      return res.status(404).json({
        message: 'Question not found'
      });
    }

    const item = question.toJSON();
    item.options = formatOptions(item.options);

    res.status(200).json({
      message: 'Question fetched successfully',
      question: item
    });
  } catch (error) {
    console.error('Error in getQuestionById:', error);
    res.status(500).json({
      message: 'Failed to fetch question',
      error: error.message
    });
  }
};

// Update question by ID
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      question_text,
      question,
      options,
      correct_answer,
      answer,
      marks,
      explanation,
      quiz_id
    } = req.body;

    const existingQuestion = await Question.findByPk(id);
    if (!existingQuestion) {
      return res.status(404).json({
        message: 'Question not found'
      });
    }

    if (quiz_id) {
      const quiz = await Quiz.findByPk(quiz_id);
      if (!quiz) {
        return res.status(404).json({
          message: `Target quiz with id ${quiz_id} not found`
        });
      }
    }

    const resolvedText = question_text !== undefined ? question_text : (question !== undefined ? question : existingQuestion.question_text);
    const resolvedAnswer = correct_answer !== undefined ? correct_answer : (answer !== undefined ? answer : existingQuestion.correct_answer);
    const resolvedMarks = marks !== undefined && String(marks).trim() !== '' && Number.isFinite(Number(marks))
      ? parseInt(marks, 10)
      : existingQuestion.marks;
    const resolvedExplanation = explanation !== undefined ? explanation : existingQuestion.explanation;
    const resolvedQuizId = quiz_id !== undefined ? Number(quiz_id) : existingQuestion.quiz_id;

    let formattedOptions = existingQuestion.options;
    if (options !== undefined) {
      formattedOptions = typeof options === 'object' ? JSON.stringify(options) : options;
    }

    await existingQuestion.update({
      quiz_id: resolvedQuizId,
      question_text: resolvedText,
      options: formattedOptions,
      correct_answer: resolvedAnswer,
      marks: resolvedMarks,
      explanation: resolvedExplanation
    });

    const responseItem = existingQuestion.toJSON();
    responseItem.options = formatOptions(responseItem.options);

    res.status(200).json({
      message: 'Question updated successfully',
      question: responseItem
    });
  } catch (error) {
    console.error('Error in updateQuestion:', error);
    res.status(500).json({
      message: 'Failed to update question',
      error: error.message
    });
  }
};

// Delete question by ID
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findByPk(id);
    if (!question) {
      return res.status(404).json({
        message: 'Question not found'
      });
    }

    await question.destroy();

    res.status(200).json({
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteQuestion:', error);
    res.status(500).json({
      message: 'Failed to delete question',
      error: error.message
    });
  }
};

// Delete all questions for a specific quiz
const deleteQuestionsByQuizId = async (req, res) => {
  try {
    const rawQuizId = req.params.quizId || req.body.quiz_id;
    const quiz_id = Number(rawQuizId);

    if (!rawQuizId || !Number.isInteger(quiz_id) || quiz_id <= 0) {
      return res.status(400).json({
        message: 'Valid numeric quizId is required'
      });
    }

    const quiz = await Quiz.findByPk(quiz_id);
    if (!quiz) {
      return res.status(404).json({
        message: `Quiz with id ${quiz_id} not found`
      });
    }

    const deletedCount = await Question.destroy({
      where: { quiz_id }
    });

    res.status(200).json({
      message: 'All questions for quiz deleted successfully',
      deletedCount
    });
  } catch (error) {
    console.error('Error in deleteQuestionsByQuizId:', error);
    res.status(500).json({
      message: 'Failed to delete quiz questions',
      error: error.message
    });
  }
};

module.exports = {
  createQuestion,
  getQuestionsByQuizId,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  deleteQuestionsByQuizId
};
