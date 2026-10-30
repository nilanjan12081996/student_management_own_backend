const { Quiz, Question, Submission, StudentProgress, User } = require('../../models');
const { Op } = require('sequelize');
const http = require('http');

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

// AI Microservice Helper for Quiz Performance Analysis
async function callAiAnalyze(payload) {
  try {
    const postData = JSON.stringify(payload);
    const options = {
      hostname: '127.0.0.1',
      port: process.env.PYTHON_PORT || 5001,
      path: '/ai/analyze-quiz',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 6000
    };

    return await new Promise((resolve) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.analysis || parsed);
          } catch {
            resolve(null);
          }
        });
      });
      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });
      req.write(postData);
      req.end();
    });
  } catch {
    return null;
  }
}

// Fallback Multi-Layer Analysis
function generateLocalAnalysis(studentName, quizTitle, score, totalMarks, wrongQuestions) {
  const pct = Math.round((score / Math.max(totalMarks, 1)) * 100);
  const name = studentName || 'Student';

  let badge = '';
  let feedback = '';
  let strengths = [];
  let actionPlan = [];

  if (pct >= 85) {
    badge = 'Mastery Achieved! Exceptional Performance';
    feedback = `Outstanding work, ${name}! You earned ${score}/${totalMarks} (${pct}%). You demonstrated strong command over the core and applied principles in '${quizTitle}'.`;
    strengths = [
      'Strong conceptual discernment between correct options and subtle distractors.',
      'Demonstrated high accuracy on core problem formulations.',
      'Excellent readiness for subsequent advanced modules.'
    ];
    actionPlan = [
      'Deepen knowledge with the advanced case study section in your batch study notes.',
      'Help peer cohorts by explaining tricky concepts — teaching solidifies mastery.',
      'Take on advanced problem sets to challenge your boundary thinking.'
    ];
  } else if (pct >= 60) {
    badge = 'Solid Foundation — Target Specific Gap Areas';
    feedback = `Great effort, ${name}! You scored ${score}/${totalMarks} (${pct}%). You have a solid grasp of fundamental concepts, but a few edge cases and subtle rules caught you off guard.`;
    strengths = [
      'Familiarity with standard patterns and primary terminology.',
      'Good foundational recall of main principles.',
      'Successfully answered standard questions without hesitation.'
    ];
    actionPlan = [
      'Review the explanations for the questions you missed in the detailed review below.',
      'Open your Study Notes tab and re-read the sections addressing edge cases.',
      'Retake this quiz in 48 hours to confirm these gaps are resolved.'
    ];
  } else {
    badge = 'Action Required: Core Concepts Need Focused Review';
    feedback = `Keep your head up, ${name}! You scored ${score}/${totalMarks} (${pct}%). Mistakes are the best learning opportunities. With a targeted review of the highlighted topics, you will see a big jump in marks.`;
    strengths = [
      'Showed willingness to attempt challenging questions under assessment conditions.',
      'Identified a clear diagnostic map of topics requiring reinforcement.'
    ];
    actionPlan = [
      'Step 1: Open the Study Notes tab and review the foundational layers for your weak topics.',
      'Step 2: Note down the correct principles in your personal revision notebook.',
      'Step 3: Solve practice drills before taking subsequent quizzes.'
    ];
  }

  const topicTally = {};
  const misconceptions = [];
  const focusGuidance = [];

  (wrongQuestions || []).forEach(q => {
    const qText = q.question_text || 'Question';
    const chosen = q.student_answer || 'Selected answer';
    const correct = q.correct_answer || 'Correct principle';
    const tag = q.topic_tag || q.topic || `${quizTitle} Concepts`;

    topicTally[tag] = (topicTally[tag] || 0) + 1;
    misconceptions.push(`On '${qText.substring(0, 60)}...', you chose '${chosen}'. Remember: '${correct}' is the required principle.`);
  });

  Object.entries(topicTally).forEach(([tag, count]) => {
    focusGuidance.push({
      topic: tag,
      urgency: pct < 60 || count >= 2 ? 'High Priority Focus' : 'Moderate Reinforcement',
      missed_count: count,
      guidance: `Review the '${tag}' study notes. Focus on edge-case exceptions and core definitions.`
    });
  });

  if (focusGuidance.length === 0) {
    focusGuidance.push({
      topic: `${quizTitle} Core Principles`,
      urgency: 'Mastery Confirmed',
      missed_count: 0,
      guidance: 'Excellent comprehension demonstrated. Maintain knowledge through periodic review.'
    });
  }

  const recommendedTopics = focusGuidance.map(g => g.topic);

  return {
    summary_badge: badge,
    percentage: pct,
    score,
    total_marks: totalMarks,
    overall_feedback: feedback,
    strengths,
    critical_misconceptions: misconceptions.slice(0, 4),
    action_plan: actionPlan,
    focus_guidance: focusGuidance,
    recommended_topics: [...new Set(recommendedTopics)].slice(0, 4)
  };
}

// Create a new quiz (supports optional nested questions)
const createQuiz = async (req, res) => {
  try {
    const { title, field, month, total_marks, questions, organization_id } = req.body;
    const quizTitle = title || field;

    if (!quizTitle) {
      return res.status(400).json({ message: 'Quiz title or field is required' });
    }

    let computedTotalMarks = total_marks;
    if (computedTotalMarks === undefined && Array.isArray(questions) && questions.length > 0) {
      computedTotalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);
    }

    const quiz = await Quiz.create({
      organization_id: organization_id || 1,
      title: quizTitle,
      month: month || 'Unassigned',
      total_marks: computedTotalMarks !== undefined ? computedTotalMarks : 0
    });

    let createdQuestions = [];
    if (Array.isArray(questions) && questions.length > 0) {
      const questionRecords = questions.map(q => ({
        organization_id: organization_id || 1,
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
    res.status(500).json({ message: 'Failed to create quiz', error: error.message });
  }
};

// Get all quizzes
const getAllQuizzes = async (req, res) => {
  try {
    const { field, title, month, search, includeQuestions } = req.query;
    const where = {};

    const targetField = field || title || search;
    if (targetField) {
      where.title = { [Op.like]: `%${targetField.trim()}%` };
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
    res.status(500).json({ message: 'Failed to fetch quizzes', error: error.message });
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
      return res.status(404).json({ message: 'Quiz not found' });
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
    res.status(500).json({ message: 'Failed to fetch quiz', error: error.message });
  }
};

// Get quizzes by specific field or title
const getQuizzesByField = async (req, res) => {
  try {
    const field = req.params.field || req.query.field;
    if (!field) {
      return res.status(400).json({ message: 'Field parameter is required' });
    }

    const quizzes = await Quiz.findAll({
      where: {
        title: { [Op.like]: `%${field.trim()}%` }
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
    res.status(500).json({ message: 'Failed to fetch quizzes by field', error: error.message });
  }
};

// Update quiz by ID
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, field, month, total_marks } = req.body;

    const quiz = await Quiz.findByPk(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
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
    res.status(500).json({ message: 'Failed to update quiz', error: error.message });
  }
};

// Delete quiz by ID
const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findByPk(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    await quiz.destroy();
    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error in deleteQuiz:', error);
    res.status(500).json({ message: 'Failed to delete quiz', error: error.message });
  }
};

// =====================================================================
// SUBMIT QUIZ & AI PERFORMANCE ANALYSIS
// =====================================================================
const submitQuiz = async (req, res) => {
  try {
    const quizId = req.params.id || req.body.quiz_id;
    const { user_id, answers, student_name, organization_id } = req.body;

    if (!quizId) {
      return res.status(400).json({ message: 'quiz_id is required' });
    }

    const quiz = await Quiz.findByPk(quizId, {
      include: [{
        model: Question,
        as: 'questions'
      }]
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const questionsList = quiz.questions || [];
    let earnedMarks = 0;
    let totalMarks = 0;
    const wrongQuestions = [];
    const questionsReview = [];

    questionsList.forEach((q, idx) => {
      const qMarks = Number(q.marks || 1);
      totalMarks += qMarks;

      const studentAnswer = (answers && (answers[q.id] !== undefined ? answers[q.id] : answers[idx])) || '';
      const correctAnswer = q.correct_answer || '';
      const isCorrect = String(studentAnswer).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase();

      if (isCorrect) {
        earnedMarks += qMarks;
      } else {
        wrongQuestions.push({
          question_text: q.question_text,
          student_answer: studentAnswer || 'No answer provided',
          correct_answer: correctAnswer,
          explanation: q.explanation || 'Review the core concept and definition.',
          topic_tag: quiz.title,
          marks: qMarks
        });
      }

      questionsReview.push({
        id: q.id,
        question_text: q.question_text,
        options: formatOptions(q.options),
        student_answer: studentAnswer,
        correct_answer: correctAnswer,
        is_correct: isCorrect,
        marks: qMarks,
        explanation: q.explanation
      });
    });

    if (totalMarks === 0) totalMarks = quiz.total_marks || 10;

    // Run AI diagnostic mentor
    const mentorPayload = {
      student_name: student_name || 'Student',
      quiz_title: quiz.title,
      score: earnedMarks,
      total_marks: totalMarks,
      wrong_questions: wrongQuestions
    };

    let aiAnalysis = await callAiAnalyze(mentorPayload);
    if (!aiAnalysis) {
      aiAnalysis = generateLocalAnalysis(student_name, quiz.title, earnedMarks, totalMarks, wrongQuestions);
    }

    // Save into Submission & StudentProgress if database is active
    let submissionRecord = null;
    try {
      if (Submission && user_id) {
        submissionRecord = await Submission.create({
          organization_id: organization_id || quiz.organization_id || 1,
          quiz_id: quiz.id,
          user_id: Number(user_id),
          score: earnedMarks,
          total_marks: totalMarks,
          answers_json: JSON.stringify(answers || {}),
          feedback: aiAnalysis.overall_feedback || 'Completed assessment.',
          graded_at: new Date()
        });
      }

      if (StudentProgress && user_id) {
        await StudentProgress.create({
          organization_id: organization_id || quiz.organization_id || 1,
          user_id: Number(user_id),
          task_id: quiz.id,
          task_type: 'quiz',
          score: earnedMarks
        });
      }
    } catch (dbErr) {
      console.warn('Could not persist submission to SQL (fallback mode active):', dbErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Quiz submitted and evaluated successfully',
      submission: {
        id: submissionRecord ? submissionRecord.id : Date.now(),
        quiz_id: quiz.id,
        quiz_title: quiz.title,
        user_id: user_id || null,
        student_name: student_name || 'Student',
        score: earnedMarks,
        total_marks: totalMarks,
        percentage: Math.round((earnedMarks / Math.max(totalMarks, 1)) * 100),
        graded_at: new Date().toISOString()
      },
      ai_analysis: aiAnalysis,
      questions_review: questionsReview
    });
  } catch (error) {
    console.error('Error in submitQuiz:', error);
    res.status(500).json({ message: 'Failed to submit quiz', error: error.message });
  }
};

// Get Submissions for a Quiz
const getQuizSubmissions = async (req, res) => {
  try {
    const { id } = req.params;
    if (!Submission) {
      return res.status(200).json({ submissions: [] });
    }

    const submissions = await Submission.findAll({
      where: { quiz_id: id },
      include: User ? [{ model: User, attributes: ['id', 'name', 'email', 'class'] }] : [],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      total: submissions.length,
      submissions
    });
  } catch (error) {
    console.error('Error in getQuizSubmissions:', error);
    res.status(500).json({ message: 'Failed to fetch submissions', error: error.message });
  }
};

// Get Student Progress & Topic Focus Guidance
const getStudentProgress = async (req, res) => {
  try {
    const rawUserId = req.params.userId || req.query.user_id;
    const isCohort = !rawUserId || rawUserId === 'all' || rawUserId === 'cohort';
    const where = isCohort ? {} : { user_id: Number(rawUserId) };

    let submissions = [];
    if (Submission) {
      submissions = await Submission.findAll({
        where,
        include: [
          { model: Quiz, attributes: ['id', 'title', 'month'] },
          User ? { model: User, attributes: ['id', 'name', 'email', 'class'] } : null
        ].filter(Boolean),
        order: [['createdAt', 'DESC']]
      });
    }

    const formatted = submissions.map(s => {
      const item = s.toJSON();
      return {
        id: item.id,
        user_id: item.user_id,
        student_name: item.User ? item.User.name : (item.student_name || 'Student'),
        student_email: item.User ? item.User.email : '',
        quiz_id: item.quiz_id,
        quiz_title: item.Quiz ? item.Quiz.title : 'Assessment',
        score: item.score,
        total_marks: item.total_marks,
        percentage: Math.round((item.score / Math.max(item.total_marks, 1)) * 100),
        feedback: item.feedback,
        graded_at: item.graded_at || item.createdAt
      };
    });

    // Compute metrics
    const totalScore = formatted.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const totalPossible = formatted.reduce((acc, curr) => acc + (curr.total_marks || 10), 0);
    const avgPercentage = formatted.length > 0 ? Math.round((totalScore / Math.max(totalPossible, 1)) * 100) : 0;

    // Group by topic
    const topicStats = {};
    formatted.forEach(sub => {
      const topicName = sub.quiz_title;
      if (!topicStats[topicName]) {
        topicStats[topicName] = { score: 0, total: 0, count: 0 };
      }
      topicStats[topicName].score += sub.score;
      topicStats[topicName].total += sub.total_marks;
      topicStats[topicName].count += 1;
    });

    const topicMastery = Object.entries(topicStats).map(([topic, stat]) => ({
      topic,
      percentage: Math.round((stat.score / Math.max(stat.total, 1)) * 100),
      attempts: stat.count,
      score: stat.score,
      total_marks: stat.total
    }));

    const topicsToFocus = topicMastery
      .filter(t => t.percentage < 80)
      .sort((a, b) => a.percentage - b.percentage)
      .map(t => ({
        topic: t.topic,
        percentage: t.percentage,
        urgency: t.percentage < 60 ? 'Critical Focus Required' : 'Reinforcement Recommended',
        recommendation: `Your score is ${t.percentage}%. Spend 30 minutes revising study notes on '${t.topic}'.`
      }));

    res.status(200).json({
      success: true,
      user_id: isCohort ? 'all' : Number(rawUserId),
      is_cohort: isCohort,
      total_quizzes_opted: formatted.length,
      overall_percentage: avgPercentage,
      total_score: totalScore,
      total_possible: totalPossible,
      topic_mastery: topicMastery,
      topics_to_focus: topicsToFocus,
      history: formatted
    });
  } catch (error) {
    console.error('Error in getStudentProgress:', error);
    res.status(500).json({ message: 'Failed to fetch student progress', error: error.message });
  }
};

module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  getQuizzesByField,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizSubmissions,
  getStudentProgress
};
