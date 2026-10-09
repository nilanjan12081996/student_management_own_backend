const express = require('express');
const router = express.Router();
const http = require('http');
const { execFile } = require('child_process');
const path = require('path');

const PYTHON_PORT = process.env.PYTHON_PORT || 5001;
const PYTHON_DIR = path.resolve(__dirname, '../../../python');

// Helper to make an HTTP request to the running Python FastAPI microservice
function forwardToPython(endpoint, method, payload) {
  return new Promise((resolve, reject) => {
    const postData = payload ? JSON.stringify(payload) : '';
    const options = {
      hostname: '127.0.0.1',
      port: PYTHON_PORT,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 10000 // 10s timeout
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Python AI service timed out'));
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// Fallback direct execution via Python CLI if FastAPI service is not running
function runPythonScript(scriptName, argsJson) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(PYTHON_DIR, scriptName);
    const pythonCmd = 'python';

    const child = execFile(pythonCmd, ['-c', `
import sys, json, os
sys.path.insert(0, r"${PYTHON_DIR.replace(/\\/g, '\\\\')}")
from ${scriptName.replace('.py', '')} import *

payload = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
if "${scriptName}" == "ai_mcq_generator.py":
    res = generate_mcqs(payload.get('topic', 'General'), payload.get('difficulty', 'Intermediate'), int(payload.get('count', 5)), payload.get('batch_name', ''))
    print(json.dumps({'success': True, 'questions': res}))
elif "${scriptName}" == "ai_notes_generator.py":
    res = generate_notes(payload.get('topic', 'General'), payload.get('subject', 'CS'), payload.get('style', 'Detailed Guide'), payload.get('batch_name', ''))
    print(json.dumps({'success': True, 'note': res}))
elif "${scriptName}" == "ai_student_mentor.py":
    res = analyze_quiz_performance(payload.get('student_name', 'Student'), payload.get('quiz_title', 'Quiz'), int(payload.get('score', 0)), int(payload.get('total_marks', 10)), payload.get('wrong_questions', []))
    print(json.dumps({'success': True, 'analysis': res}))
`, JSON.stringify(argsJson || {})], { timeout: 15000 }, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (err) {
        reject(new Error(stdout || stderr || 'Failed to parse Python script output'));
      }
    });
  });
}

// GET /api/ai/health
router.get('/health', async (req, res) => {
  try {
    const pyRes = await forwardToPython('/health', 'GET');
    return res.status(pyRes.status).json(pyRes.data);
  } catch (err) {
    return res.status(200).json({
      status: 'DEGRADED',
      message: 'FastAPI microservice offline; running direct Python subprocess execution.',
      python_directory: PYTHON_DIR
    });
  }
});

// POST /api/ai/generate-mcqs
router.post('/generate-mcqs', async (req, res) => {
  try {
    // 1. Try FastAPI microservice
    try {
      const pyRes = await forwardToPython('/ai/generate-mcqs', 'POST', req.body);
      return res.status(pyRes.status).json(pyRes.data);
    } catch {
      // 2. Direct Python script fallback
      const output = await runPythonScript('ai_mcq_generator.py', req.body);
      return res.json(output);
    }
  } catch (err) {
    console.error('AI MCQ generation error:', err);
    return res.status(500).json({ error: 'Failed to generate MCQs', details: err.message });
  }
});

// POST /api/ai/generate-notes
router.post('/generate-notes', async (req, res) => {
  try {
    try {
      const pyRes = await forwardToPython('/ai/generate-notes', 'POST', req.body);
      return res.status(pyRes.status).json(pyRes.data);
    } catch {
      const output = await runPythonScript('ai_notes_generator.py', req.body);
      return res.json(output);
    }
  } catch (err) {
    console.error('AI Notes generation error:', err);
    return res.status(500).json({ error: 'Failed to generate notes', details: err.message });
  }
});

// POST /api/ai/analyze-quiz
router.post('/analyze-quiz', async (req, res) => {
  try {
    try {
      const pyRes = await forwardToPython('/ai/analyze-quiz', 'POST', req.body);
      return res.status(pyRes.status).json(pyRes.data);
    } catch {
      const output = await runPythonScript('ai_student_mentor.py', req.body);
      return res.json(output);
    }
  } catch (err) {
    console.error('AI Quiz analysis error:', err);
    return res.status(500).json({ error: 'Failed to analyze quiz attempt', details: err.message });
  }
});

module.exports = router;
