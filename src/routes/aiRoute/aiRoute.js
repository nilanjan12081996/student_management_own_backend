const express = require('express');
const router = express.Router();
const zlib = require('zlib');
const path = require('path');
const { authenticateToken, requireAdmin } = require('../../middleware/authMiddleware');
const { generateSmartQuestions } = require('../../utils/curriculumQuestions');

const PYTHON_PORT = process.env.PYTHON_PORT || 5001;

// =====================================================================
// 1. PDF TEXT EXTRACTION UTILITY (Built-in Node.js Zlib)
// =====================================================================
function extractTextFromPdfBase64(base64Data) {
  if (!base64Data) return '';
  try {
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const content = buffer.toString('binary');
    let extracted = '';

    const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    let match;
    let streamCount = 0;
    while ((match = streamRegex.exec(content)) !== null && streamCount < 350 && extracted.length < 45000) {
      streamCount++;
      if (!match[1] || match[1].length > 150000) continue;
      let streamData = Buffer.from(match[1], 'binary');
      try {
        streamData = zlib.inflateSync(streamData);
      } catch (e) {}

      const textBlock = streamData.toString('latin1');
      const tjRegex = /\(([\s\S]*?)\)\s*Tj/g;
      let m;
      while ((m = tjRegex.exec(textBlock)) !== null) {
        extracted += m[1] + ' ';
      }

      const tjArrayRegex = /\[([\s\S]*?)\]\s*TJ/g;
      while ((m = tjArrayRegex.exec(textBlock)) !== null) {
        const innerTj = /\(([\s\S]*?)\)/g;
        let im;
        while ((im = innerTj.exec(m[1])) !== null) {
          extracted += im[1] + ' ';
        }
      }
    }

    extracted = extracted
      .replace(/\\([()\\])/g, '$1')
      .replace(/\\r|\\n|\\t/g, ' ')
      .replace(/[^\x20-\x7E\r\n]/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .trim();

    return extracted;
  } catch (err) {
    console.warn('PDF stream extraction warning:', err.message);
    return '';
  }
}

// =====================================================================
// 2. GOOGLE GEMINI MULTIMODAL API CALLER (REST)
// =====================================================================
const GEMINI_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest'
];

async function callGeminiApi(prompt, fileBase64 = null, customKey = null, options = {}) {
  const apiKey = (customKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
  if (!apiKey) return { data: null, model: null, error: 'GEMINI_API_KEY is not configured' };

  const { expectJson = true, maxOutputTokens = 8192, temperature = 0.35, timeoutMs = 50000 } = options;

  const parts = [];
  if (fileBase64 && typeof fileBase64 === 'string') {
    const mimeMatch = fileBase64.match(/^data:([^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'application/pdf';
    const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '').trim();
    if (cleanBase64 && (mimeType === 'application/pdf' || mimeType.startsWith('text/') || mimeType.startsWith('image/'))) {
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: cleanBase64
        }
      });
    }
  }
  parts.push({ text: prompt });

  const generationConfig = {
    temperature,
    topK: 40,
    topP: 0.95,
    maxOutputTokens
  };
  if (expectJson) {
    generationConfig.responseMimeType = 'application/json';
  }

  let lastError = 'Unknown Gemini API error';

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig
        }),
        signal: AbortSignal.timeout(timeoutMs)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let parsedErr = errorText;
        try {
          const errJson = JSON.parse(errorText);
          parsedErr = errJson?.error?.message || errorText;
        } catch (_) {}
        lastError = `HTTP ${response.status}: ${parsedErr}`;
        console.warn(`Gemini (${model}) REST error:`, response.status, parsedErr);
        // Only abort if key itself is unauthorized or forbidden
        if (response.status === 401 || response.status === 403) {
          break;
        }
        continue;
      }

      const jsonRes = await response.json();
      const rawText = jsonRes?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        lastError = `Empty response from ${model}`;
        continue;
      }

      if (!expectJson) {
        return { data: rawText.trim(), model, error: null };
      }

      const cleaned = rawText
        .replace(/```(?:json)?\s*/gi, '')
        .replace(/```/g, '')
        .trim();

      try {
        return { data: JSON.parse(cleaned), model, error: null };
      } catch (parseErr) {
        const arrayMatch = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (arrayMatch) {
          return { data: JSON.parse(arrayMatch[0]), model, error: null };
        }
        lastError = `Invalid JSON returned by ${model}`;
      }
    } catch (err) {
      lastError = err.message || 'Network/timeout reaching Gemini API';
      console.warn(`Gemini (${model}) call warning:`, lastError);
    }
  }

  return { data: null, model: null, error: lastError };
}

// =====================================================================
// 3. CONTEXTUAL REFERENCE-BASED QUESTION SYNTHESIZER (Guaranteed Fallback)
// =====================================================================
function synthesizeMcqsFromReference(referenceText, topic, count = 5, difficulty = 'Intermediate', cognitiveLayer = 'Multi-Layer Balanced') {
  const text = (referenceText || '').trim();
  const sentences = text
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 25 && s.length < 280);

  const cognitiveLayers = [
    'Concept Foundation & Syntax',
    'Execution Dynamics & Flow',
    'Diagnostic Debugging & Tracing',
    'Edge Cases & Trap Detection'
  ];

  const questions = [];

  // Key academic fact regex patterns
  const patterns = [
    { regex: /([^.?!]+?)\s+(?:is defined as|refers to|is a|means|represents)\s+([^.?!]+)/i, type: 'definition' },
    { regex: /([^.?!]+?)\s+(?:is used to|is used for|enables|allows)\s+([^.?!]+)/i, type: 'purpose' },
    { regex: /([^.?!]+?)\s+(?:consists of|contains|is composed of|includes)\s+([^.?!]+)/i, type: 'composition' },
    { regex: /([^.?!]+?)\s+(?:provides|ensures|guarantees|prevents)\s+([^.?!]+)/i, type: 'benefit' },
    { regex: /([^.?!]+?)\s+(?:must|should|is required to|always|never)\s+([^.?!]+)/i, type: 'rule' }
  ];

  const extractedFacts = [];

  for (const sentence of sentences) {
    for (const p of patterns) {
      const match = sentence.match(p.regex);
      if (match && match[1] && match[2]) {
        const subject = match[1].trim();
        const predicate = match[2].trim();
        if (subject.length > 3 && subject.length < 60 && predicate.length > 10) {
          extractedFacts.push({ subject, predicate, sentence, type: p.type });
        }
      }
    }
  }

  // 1. Formulate questions from extracted factual pairs
  for (let i = 0; i < Math.min(count, extractedFacts.length); i++) {
    const fact = extractedFacts[i];
    const layer = cognitiveLayers[i % cognitiveLayers.length];

    let qText = '';
    let correct = '';
    let distractors = [];

    if (fact.type === 'definition' || fact.type === 'purpose') {
      qText = `Which statement accurately describes "${fact.subject}" in ${topic}?`;
      correct = `${fact.subject} ${fact.predicate.endsWith('.') ? fact.predicate.slice(0, -1) : fact.predicate}`;
      distractors = [
        `${fact.subject} strictly bypasses validation rules and operates without state boundaries`,
        `${fact.subject} is deprecated in modern architecture in favor of unverified scripts`,
        `${fact.subject} executes exclusively during compile-time without runtime persistence`
      ];
    } else if (fact.type === 'composition') {
      qText = `In ${topic}, what primarily characterizes or defines "${fact.subject}"?`;
      correct = `${fact.predicate}`;
      distractors = [
        `Static immutable strings without structural elements`,
        `Unbound asynchronous threads running without error bounds`,
        `Arbitrary external plugins decoupled from the primary architecture`
      ];
    } else {
      qText = `In the context of ${topic || 'Computer Science'}, what is the primary significance of "${fact.subject}"?`;
      correct = `${fact.predicate}`;
      distractors = [
        `It limits scalability and introduces non-deterministic thread contention`,
        `It invalidates cached state and forces full application reboots`,
        `It acts only as a cosmetic linter directive with no runtime impact`
      ];
    }

    const options = [correct, ...distractors].sort(() => 0.5 - Math.random());

    questions.push({
      question_text: qText,
      options,
      correct_answer: correct,
      marks: 2,
      cognitive_layer: layer,
      topic_tag: fact.subject.slice(0, 30),
      explanation: `Core Concept: "${fact.sentence.slice(0, 180)}..." Distractors present conflicting or erroneous assertions.`
    });
  }

  // 2. Formulate additional questions from prominent sentences if needed
  let sIdx = 0;
  const generalPhrasings = [
    `Which of the following statements regarding ${topic} is correct?`,
    `In the context of ${topic}, which of the following statements is TRUE?`,
    `Regarding ${topic}, which statement correctly highlights its key characteristics?`,
    `Which of the following is a verified technical principle in ${topic}?`
  ];

  while (questions.length < count && sIdx < sentences.length) {
    const s = sentences[sIdx++];
    const layer = cognitiveLayers[questions.length % cognitiveLayers.length];

    const qText = generalPhrasings[questions.length % generalPhrasings.length];
    const correct = s.length > 120 ? s.slice(0, 117) + '...' : s;
    const distractors = [
      `It strictly prohibits structured abstractions and eliminates compile-time validation`,
      `It forces all unrelated runtime logic into a single global unvalidated script`,
      `The architecture described is limited to single-threaded offline execution without state isolation`
    ];

    const options = [correct, ...distractors].sort(() => 0.5 - Math.random());

    questions.push({
      question_text: qText,
      options,
      correct_answer: correct,
      marks: 2,
      cognitive_layer: layer,
      topic_tag: topic || 'Core Concept',
      explanation: `Core Principle: "${s.slice(0, 160)}..." Distractors represent conflicting models or incorrect constraints.`
    });
  }

  // 3. Fallback when text is too short or empty: delegate to domain-aware curriculum synthesizer
  if (questions.length < count) {
    const extra = generateSmartQuestions({
      topic: topic || 'Computer Science',
      referenceText: text,
      count: count - questions.length,
      difficulty,
      cognitiveLayer
    });
    questions.push(...extra);
  }

  return questions.slice(0, count);
}

// Optional helper to check Python microservice if available
async function forwardToPython(endpoint, method, payload) {
  const baseUrl = process.env.PYTHON_URL || ('http://' + (process.env.PYTHON_HOST || '127.0.0.1') + ':' + (process.env.PYTHON_PORT || 5001));
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
  const targetUrl = new URL(cleanEndpoint, cleanBase);

  const response = await fetch(targetUrl.toString(), {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: payload && method !== 'GET' ? JSON.stringify(payload) : undefined,
    signal: AbortSignal.timeout(3000) // Fast 3-second timeout so it never hangs
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();
  return { status: response.status, data };
}

// Middleware: Restrict AI Studio generation & status endpoints from student accounts
const restrictStudentAiAccess = (req, res, next) => {
  const role = (
    req.headers['x-user-role'] ||
    req.headers['role'] ||
    req.body?.role ||
    req.query?.role ||
    ''
  ).toLowerCase();

  if (role === 'student') {
    return res.status(403).json({
      error: 'Access denied: AI Studio features are restricted to tutors and administrators.',
      forbidden: true
    });
  }
  next();
};

// =====================================================================
// ROUTE HANDLERS
// =====================================================================

// GET /api/ai/health
router.get('/health', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pyRes = await forwardToPython('/health', 'GET');
    return res.status(pyRes.status).json(pyRes.data);
  } catch (err) {
    const hasGemini = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
    return res.status(200).json({
      status: 'UP',
      mode: hasGemini ? 'Google Gemini 2.5 Flash AI' : 'Fallback Knowledge Engine (Add Gemini Key)',
      has_gemini: hasGemini,
      model: 'gemini-2.5-flash',
      pdf_support: true,
      reference_generation: true,
      layers: [
        'Layer 1: Concept Foundation & Syntax',
        'Layer 2: Execution Dynamics & Flow',
        'Layer 3: Diagnostic Debugging & Tracing',
        'Layer 4: Edge Cases & Trap Detection'
      ]
    });
  }
});

// POST /api/ai/verify-gemini
router.post('/verify-gemini', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const keyToTest = (req.body?.gemini_api_key || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
    if (!keyToTest) {
      return res.status(400).json({ valid: false, error: 'Please enter a Google Gemini API key.' });
    }
    const result = await callGeminiApi('Reply with the single word OK.', null, keyToTest, {
      expectJson: false,
      maxOutputTokens: 16,
      temperature: 0,
      timeoutMs: 12000
    });
    if (result.data) {
      return res.status(200).json({ valid: true, model: result.model });
    }
    return res.status(400).json({ valid: false, error: result.error || 'Gemini API key verification failed.' });
  } catch (err) {
    return res.status(500).json({ valid: false, error: err.message });
  }
});

// POST /api/ai/generate-mcqs
// Supports: topic, count, difficulty, batch_name, cognitive_layer, reference_text, file_name, file_base64
router.post('/generate-mcqs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      topic = 'General Science',
      difficulty = 'Intermediate',
      count = 5,
      batch_name = '',
      cognitive_layer = 'Multi-Layer Balanced',
      reference_text = '',
      file_name = '',
      file_base64 = '',
      gemini_api_key = ''
    } = req.body;

    const parsedCount = Math.max(1, Math.min(50, Number(count) || 5));

    // Filter out any placeholder strings like "[Document attached: ..."
    let effectiveReferenceText = (reference_text || '').trim();
    if (
      effectiveReferenceText.startsWith('[Document attached:') ||
      effectiveReferenceText.includes('Ready for AI reference parsing') ||
      effectiveReferenceText.length < 3
    ) {
      effectiveReferenceText = '';
    }

    // If PDF base64 provided and reference_text empty, extract text stream
    if (file_base64 && !effectiveReferenceText) {
      effectiveReferenceText = extractTextFromPdfBase64(file_base64);
    }

    // Attempt 1: Call Google Gemini Multi-modal API directly from Node
    const geminiPrompt = `
You are an expert academic professor and question design specialist.
Create exactly ${parsedCount} multi-layered multiple-choice assessment questions based strictly on the provided reference material or topic.

Topic: ${topic}
Difficulty: ${difficulty}
Target Cohort: ${batch_name || 'Enrolled Academic Cohort'}
Cognitive Focus: ${cognitive_layer}
${effectiveReferenceText ? `\nREFERENCE STUDY MATERIAL:\n---\n${effectiveReferenceText.slice(0, 16000)}\n---\n` : ''}

REQUIREMENTS:
1. Every question must be grounded in the reference material (or the topic if no text was provided).
2. Exactly 4 distinct options per question. One correct answer, three plausible distractors.
3. correct_answer must exactly match one of the items in options.
4. Set 'cognitive_layer' to one of:
   - "Concept Foundation & Syntax"
   - "Execution Dynamics & Flow"
   - "Diagnostic Debugging & Tracing"
   - "Edge Cases & Trap Detection"
5. Set 'marks' (e.g. 2).
6. Set 'explanation' providing clear pedagogical reasoning.
7. Return ONLY a valid JSON array of objects. No markdown formatting.
8. CRITICAL QUESTION PHRASING: Formulate questions as standard university-level academic examination questions (e.g. 'Which of the following statements regarding ${topic} is correct?', 'In ${topic}, what is the role of...?'). NEVER write 'According to the uploaded reference material', 'According to the file', 'Based on the uploaded document', or 'In the provided text'. The student taking the exam has no knowledge of any uploaded file.

Format schema:
[
  {
    "question_text": "...",
    "options": ["A", "B", "C", "D"],
    "correct_answer": "A",
    "marks": 2,
    "cognitive_layer": "Concept Foundation & Syntax",
    "topic_tag": "${topic}",
    "explanation": "..."
  }
]
`;

    const activeGeminiKey = (gemini_api_key || req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
    let geminiError = null;

    if (activeGeminiKey) {
      try {
        const geminiResult = await callGeminiApi(geminiPrompt, file_base64 || null, activeGeminiKey, {
          expectJson: true,
          maxOutputTokens: 8192,
          temperature: 0.35,
          timeoutMs: 50000
        });

        if (Array.isArray(geminiResult.data) && geminiResult.data.length > 0) {
          const validated = geminiResult.data
            .filter(q => q && q.question_text && Array.isArray(q.options) && q.options.length >= 2 && q.correct_answer)
            .map((q, idx) => {
              const opts = q.options.slice(0, 4).map(o => String(o).trim());
              const rawAns = String(q.correct_answer).trim();
              const matchedOpt = opts.find(o => o === rawAns || o.toLowerCase() === rawAns.toLowerCase()) || opts[0];
              return {
                question_text: String(q.question_text).trim(),
                options: opts,
                correct_answer: matchedOpt,
                marks: Number(q.marks) || 2,
                cognitive_layer: q.cognitive_layer || [
                  'Concept Foundation & Syntax',
                  'Execution Dynamics & Flow',
                  'Diagnostic Debugging & Tracing',
                  'Edge Cases & Trap Detection'
                ][idx % 4],
                topic_tag: q.topic_tag || topic,
                explanation: q.explanation || `Core concept in ${topic}.`
              };
            });

          // Strict Deduplication of Gemini's returned questions
          const seenQ = new Set();
          const uniqueGeminiQs = [];
          for (const q of validated) {
            const sig = q.question_text.toLowerCase().trim();
            if (!seenQ.has(sig)) {
              seenQ.add(sig);
              uniqueGeminiQs.push(q);
            }
          }

          // If Gemini generated fewer questions than requested, fill remaining slots uniquely
          if (uniqueGeminiQs.length < parsedCount) {
            const needed = parsedCount - uniqueGeminiQs.length;
            const extra = generateSmartQuestions({
              topic: topic || 'Computer Science',
              referenceText: effectiveReferenceText,
              count: needed,
              difficulty,
              cognitiveLayer: cognitive_layer
            });
            for (const eq of extra) {
              const sig = eq.question_text.toLowerCase().trim();
              if (!seenQ.has(sig) && uniqueGeminiQs.length < parsedCount) {
                seenQ.add(sig);
                uniqueGeminiQs.push(eq);
              }
            }
          }

          if (uniqueGeminiQs.length > 0) {
            return res.json({
              success: true,
              questions: uniqueGeminiQs.slice(0, parsedCount),
              count: uniqueGeminiQs.slice(0, parsedCount).length,
              engine: `Google Gemini AI (${geminiResult.model || 'gemini-3.8-flash'})`,
              source: effectiveReferenceText || file_base64 ? `Gemini Multimodal (${file_name || 'Uploaded Reference'})` : 'Google Gemini AI'
            });
          }
        }
        geminiError = geminiResult.error || 'Gemini returned no valid MCQs.';
      } catch (geminiErr) {
        geminiError = geminiErr.message;
        console.warn('Direct Gemini call failed:', geminiErr.message);
      }
    }

    // Attempt 2: Forward to Python microservice if running
    try {
      const pyRes = await forwardToPython('/ai/generate-mcqs', 'POST', req.body);
      if (pyRes?.data?.questions) {
        return res.status(pyRes.status).json(pyRes.data);
      }
    } catch (_) {}

    // Attempt 3: Pure Node.js Academic Curriculum & Reference-Based Synthesizer (Zero-Failure)
    const fallbackTopic = (topic || '').trim() || (file_name ? file_name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') : 'Computer Science');
    const questions = generateSmartQuestions({
      topic: fallbackTopic,
      referenceText: effectiveReferenceText,
      count: parsedCount,
      difficulty,
      cognitiveLayer: cognitive_layer
    });

    return res.json({
      success: true,
      questions,
      count: questions.length,
      engine: 'Academic Curriculum Knowledge Engine',
      gemini_error: geminiError,
      source: effectiveReferenceText ? `Reference Document (${file_name || 'Uploaded Text'})` : 'Academic Curriculum Knowledge Base'
    });

  } catch (err) {
    console.error('AI MCQ generation handler error:', err);
    return res.status(500).json({
      error: 'Failed to generate MCQs',
      details: err.message
    });
  }
});

// POST /api/ai/generate-notes
router.post('/generate-notes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { topic = 'General Topic', subject = 'Computer Science', style = 'Detailed Guide', reference_text = '', gemini_api_key = '' } = req.body;

    const geminiPrompt = `
You are an elite academic professor. Generate a comprehensive, pedagogical study note on:
Topic: ${topic}
Subject: ${subject}
Style: ${style}
${reference_text ? `\nReference Material:\n---\n${reference_text.slice(0, 10000)}\n---\n` : ''}

Include:
1. Executive Summary
2. Core Conceptual Foundations
3. Real-World Architecture & Code Walkthrough
4. Common Student Traps & Edge Cases
5. Self-Assessment Review Questions
`;

    try {
      const geminiNote = await callGeminiApi(geminiPrompt, null, gemini_api_key || null, { expectJson: false });
      if (typeof geminiNote?.data === 'string' && geminiNote.data.length > 100) {
        return res.json({ success: true, note: geminiNote.data, engine: `Google Gemini AI (${geminiNote.model})` });
      }
    } catch (_) {}

    // Fallback: Structured study note
    const note = `# ${topic}\n\n**Subject:** ${subject} | **Style:** ${style}\n\n## 1. Executive Summary\n${topic} is an essential academic subject focusing on robust implementation and structural mechanics. Understanding its core behavior enables predictable execution and high-performance engineering.\n\n## 2. Core Foundations & Principles\n- **Principle A:** Clear separation of concerns and deterministic state transitions.\n- **Principle B:** Defensive error handling and boundary condition verification.\n- **Principle C:** Modular decoupling to allow independent testing and scalability.\n\n## 3. Real-World Execution Mechanics\nIn modern environments, ${topic} operates by isolating asynchronous workloads, maintaining predictable lifecycles, and avoiding shared un-synchronized state.\n\n## 4. Common Traps & Edge Cases\n- Overlooking null or undefined references during boundary conditions.\n- Assuming infinite memory or instantaneous execution without latency checks.\n- Neglecting defensive assertion tests prior to deployment.`;

    return res.json({ success: true, note });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate notes', details: err.message });
  }
});

// POST /api/ai/analyze-quiz
router.post('/analyze-quiz', authenticateToken, async (req, res) => {
  try {
    const { student_name = 'Student', quiz_title = 'Assessment', score = 0, total_marks = 10, wrong_questions = [] } = req.body;

    const pct = Math.round((score / Math.max(total_marks, 1)) * 100);
    const analysis = {
      summary_badge: pct >= 80 ? 'Mastery Achieved! High Proficiency' : (pct >= 60 ? 'Solid Foundation — Target Specific Gaps' : 'Needs Reinforcement'),
      percentage: pct,
      score,
      total_marks,
      overall_feedback: `Great effort, ${student_name}! You scored ${score}/${total_marks} (${pct}%) on ${quiz_title}. Review the recommended topics to solidify conceptual mastery.`,
      strengths: ['Demonstrated high effort under exam conditions', 'Accurately resolved foundational recall questions'],
      action_plan: ['Review missed questions in the study notes tab', 'Focus on edge cases and state boundaries before the next assessment'],
      focus_guidance: (wrong_questions || []).map(q => ({
        topic: q.topic_tag || `${quiz_title} Concepts`,
        urgency: 'High Priority Focus',
        guidance: `Review '${q.question_text || 'missed concept'}'. You chose '${q.student_answer || 'answer'}', but the correct principle is '${q.correct_answer || 'answer'}'.`
      }))
    };

    return res.json({ success: true, analysis });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to analyze quiz attempt', details: err.message });
  }
});

// POST /api/ai/student-progress-analysis
router.post('/student-progress-analysis', authenticateToken, async (req, res) => {
  try {
    const { student_name = 'Student', submissions = [] } = req.body;
    return res.json({
      success: true,
      progress: {
        student_name,
        total_quizzes_evaluated: submissions.length,
        status: 'Progress tracked successfully across cognitive layers.'
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to analyze progress', details: err.message });
  }
});

module.exports = router;
