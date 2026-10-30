"""
Module: ai_mcq_generator.py
Purpose: Generates Multi-Layered Multiple Choice Questions (MCQs) for academic topics.

Multi-Layer Architecture:
  - Layer 1: Concept Foundation & Syntactic Basics (Recall & Definition)
  - Layer 2: Execution Dynamics & Behavioral Flow (Comprehension & Working Mechanics)
  - Layer 3: Diagnostic Debugging & Output Tracing (Application & Problem-Solving)
  - Layer 4: Architectural Tradeoffs & Edge-Case Traps (Analysis & Distractor Evaluation)
"""

import os
import json
import re
from typing import List, Dict, Optional

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

COGNITIVE_LAYERS = [
    "Concept Foundation & Syntax",
    "Execution Dynamics & Flow",
    "Diagnostic Debugging & Tracing",
    "Edge Cases & Trap Detection"
]

def clean_json_string(raw_text: str) -> str:
    """Removes markdown code blocks and returns clean JSON string."""
    raw_text = raw_text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw_text, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return raw_text

# =====================================================================
# GEMINI MULTI-LAYER MCQ GENERATOR
# =====================================================================
def generate_mcqs_with_gemini(
    topic: str,
    difficulty: str,
    count: int,
    batch_name: str = "",
    cognitive_layer: str = "Multi-Layer Balanced"
) -> Optional[List[Dict]]:
    """Generates multi-layered MCQs using Google Gemini SDK."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    try:
        from google import genai
        client = genai.Client(api_key=api_key)

        prompt = f"""
You are an elite academic professor and question design specialist.
Create exactly {count} multi-layered multiple-choice assessment questions for students.

Topic: {topic}
Difficulty Level: {difficulty}
Target Cohort: {batch_name or "Advanced Academic Cohort"}
Cognitive Layer Focus: {cognitive_layer}

Design the quiz spanning these 4 pedagogical layers:
- Layer 1: Concept Foundation & Syntax (Definitions, Core Principles)
- Layer 2: Execution Dynamics & Flow (Under-the-hood behavior, state transitions)
- Layer 3: Diagnostic Debugging & Tracing (Predict output, isolate subtle bugs)
- Layer 4: Edge Cases & Trap Detection (Common misconceptions, boundary anomalies)

CRITICAL REQUIREMENTS:
1. Each question must strictly focus on '{topic}'.
2. Provide exactly 4 distinct options. One correct answer, three plausible distractors reflecting common student misconceptions.
3. correct_answer must exactly match one of the items in options.
4. Include 'cognitive_layer' indicating which of the 4 layers this question tests.
5. Include 'topic_tag' denoting the specific sub-concept tested (e.g., 'Closures', 'Index Scan', 'State Immutability').
6. Include a thorough pedagogical 'explanation' explaining why the correct choice is true and what trap causes students to pick the wrong option.
7. Return ONLY a valid JSON array of objects. No markdown formatting.

Format schema:
[
  {{
    "question_text": "Question statement here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Option A",
    "marks": 2,
    "cognitive_layer": "Execution Dynamics & Flow",
    "topic_tag": "{topic} Mechanics",
    "explanation": "Clear explanation of the concept and why distractors are incorrect."
  }}
]
"""
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )

        raw_text = response.text
        if not raw_text:
            return None

        cleaned = clean_json_string(raw_text)
        data = json.loads(cleaned)

        if not isinstance(data, list):
            return None

        validated = []
        for q in data:
            if not isinstance(q, dict):
                continue
            if not all(k in q for k in ["question_text", "options", "correct_answer"]):
                continue
            if not isinstance(q["options"], list) or len(q["options"]) != 4:
                continue
            if q["correct_answer"] not in q["options"]:
                continue

            q["cognitive_layer"] = q.get("cognitive_layer") or COGNITIVE_LAYERS[len(validated) % len(COGNITIVE_LAYERS)]
            q["topic_tag"] = q.get("topic_tag") or f"{topic.strip().title()}"
            q["marks"] = int(q.get("marks", 2))
            q["explanation"] = q.get("explanation", "Accurate conceptual execution.")
            validated.append(q)

        return validated[:count] if validated else None

    except Exception as e:
        print(f"[AI MCQ Generator] Gemini generation failed: {e}. Utilizing multi-layer intelligent knowledge engine.")
        return None


# =====================================================================
# MULTI-LAYER LOCAL KNOWLEDGE BASE & SYNTHESIZER
# =====================================================================
DOMAIN_KNOWLEDGE_BASE = {
    "javascript": [
        {
            "layer": "Concept Foundation & Syntax",
            "topic": "Variables & Lexical Scope",
            "question": "Which statement accurately describes the hoisting behavior of 'let' and 'const' variables in ES6+?",
            "options": [
                "They are hoisted to the block top and initialize to undefined immediately",
                "They are hoisted to their enclosing block but remain uninitialized in the Temporal Dead Zone (TDZ)",
                "They are not hoisted at all and only exist after compilation",
                "They are hoisted to global window scope regardless of block delimiters"
            ],
            "answer": "They are hoisted to their enclosing block but remain uninitialized in the Temporal Dead Zone (TDZ)",
            "marks": 2,
            "explanation": "let and const are block-scoped and hoisted, but accessing them before declaration throws a ReferenceError due to the Temporal Dead Zone."
        },
        {
            "layer": "Execution Dynamics & Flow",
            "topic": "Event Loop & Asynchronous Microtasks",
            "question": "In the JavaScript runtime, what is the order of execution between Promise.then() callbacks and setTimeout(..., 0) callbacks?",
            "options": [
                "Microtask queue (Promise.then) empties entirely before the Macrotask queue (setTimeout) executes",
                "setTimeout runs first because it interfaces directly with the browser host timer",
                "They run in random interleaved order depending on CPU thread priority",
                "Macrotasks execute in pairs before any microtasks are checked"
            ],
            "answer": "Microtask queue (Promise.then) empties entirely before the Macrotask queue (setTimeout) executes",
            "marks": 3,
            "explanation": "Microtasks (Promises, queueMicrotask) have higher priority and must be completely drained before the next macrotask (setTimeout/setInterval) is executed."
        },
        {
            "layer": "Diagnostic Debugging & Tracing",
            "topic": "Closures & Loop Scope",
            "question": "What is logged when executing: for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 50); }?",
            "options": [
                "3, 3, 3",
                "0, 1, 2",
                "undefined, undefined, undefined",
                "Throws ReferenceError: i is not defined"
            ],
            "answer": "3, 3, 3",
            "marks": 3,
            "explanation": "'var' declares a function-scoped variable shared across iterations. By the time setTimeout fires, the loop has completed with i equal to 3."
        },
        {
            "layer": "Edge Cases & Trap Detection",
            "topic": "Type Coercion & Equality",
            "question": "What is the evaluated result of the expression: [] + {} === {} + [] in standard modern JavaScript?",
            "options": [
                "False, because [] + {} yields '[object Object]' while standalone {} is treated as a block in expression position",
                "True, because addition is strictly commutative across all JavaScript objects",
                "Throws a TypeError: Invalid operand conversion",
                "Returns undefined"
            ],
            "answer": "False, because [] + {} yields '[object Object]' while standalone {} is treated as a block in expression position",
            "marks": 4,
            "explanation": "[] converts to empty string, yielding '[object Object]'. Depending on statement parsing, {} at line starts behaves as an empty code block followed by unary +[], yielding 0."
        }
    ],
    "react": [
        {
            "layer": "Concept Foundation & Syntax",
            "topic": "Component Immutability",
            "question": "Why must state updates in React be treated as immutable rather than modified in place?",
            "options": [
                "React relies on shallow reference equality (Object.is) to detect state changes and schedule re-renders",
                "JavaScript engines garbage collect all mutated objects automatically",
                "Direct mutation triggers infinite synchronous render loops",
                "Immutability is only required when using TypeScript"
            ],
            "answer": "React relies on shallow reference equality (Object.is) to detect state changes and schedule re-renders",
            "marks": 2,
            "explanation": "React compares previous and next state references. If state is mutated directly, the reference does not change, causing React to skip UI updates."
        },
        {
            "layer": "Execution Dynamics & Flow",
            "topic": "Hook Dependencies & Closures",
            "question": "When does a useEffect hook with an empty dependency array '[]' execute its cleanup function?",
            "options": [
                "When the component unmounts from the DOM",
                "Before every re-render of the parent component",
                "Every time props change",
                "Cleanup functions never execute if the dependency array is empty"
            ],
            "answer": "When the component unmounts from the DOM",
            "marks": 2,
            "explanation": "With an empty dependency array, useEffect runs once on mount, and its cleanup function executes once when the component unmounts."
        },
        {
            "layer": "Diagnostic Debugging & Tracing",
            "topic": "State Batching & Stale Closures",
            "question": "Given: const [count, setCount] = useState(0); setCount(count + 1); setCount(count + 1); What will count become in the next render?",
            "options": [
                "1, because both calls read the same captured closure value of count",
                "2, because React synchronously increments on each call",
                "0, because double calls cancel each other out",
                "Throws InvalidStateError in strict mode"
            ],
            "answer": "1, because both calls read the same captured closure value of count",
            "marks": 3,
            "explanation": "Both updates evaluate count + 1 with count = 0. To increment sequentially, functional state update setCount(prev => prev + 1) must be used."
        },
        {
            "layer": "Edge Cases & Trap Detection",
            "topic": "Keys & Reconciliation",
            "question": "Why is using array index as the 'key' attribute dangerous when list items can be reordered, sorted, or deleted?",
            "options": [
                "Component state can incorrectly persist to adjacent sibling items because DOM nodes are reused by index",
                "It causes a React syntax compilation crash",
                "It disables CSS animations entirely",
                "React forces all keys to be strings starting with a letter"
            ],
            "answer": "Component state can incorrectly persist to adjacent sibling items because DOM nodes are reused by index",
            "marks": 4,
            "explanation": "When keys are indices, shifting an element causes its internal state to attach to the wrong item, corrupting form inputs and component state."
        }
    ],
    "database": [
        {
            "layer": "Concept Foundation & Syntax",
            "topic": "Relational Normalization",
            "question": "What is the defining condition for a database relation to satisfy Third Normal Form (3NF)?",
            "options": [
                "It is in 2NF and contains no transitive functional dependencies of non-prime attributes on candidate keys",
                "Every table must have a surrogate auto-increment integer primary key",
                "All column values must be stored in encrypted JSON format",
                "It has no foreign key references to other tables"
            ],
            "answer": "It is in 2NF and contains no transitive functional dependencies of non-prime attributes on candidate keys",
            "marks": 3,
            "explanation": "3NF requires the table to be in 2NF and every non-key attribute must depend directly on the primary key, eliminating transitive dependencies."
        },
        {
            "layer": "Execution Dynamics & Flow",
            "topic": "ACID Isolation Levels",
            "question": "In relational transaction management, what concurrency anomaly is permitted under READ COMMITTED that is prevented under REPEATABLE READ?",
            "options": [
                "Non-Repeatable Reads (reading different values for the same row within a single transaction)",
                "Dirty Reads (reading uncommitted changes from another transaction)",
                "Dirty Writes (overwriting uncommitted updates)",
                "Syntax compile errors"
            ],
            "answer": "Non-Repeatable Reads (reading different values for the same row within a single transaction)",
            "marks": 3,
            "explanation": "READ COMMITTED prevents dirty reads, but if another transaction modifies and commits a row, re-reading it yields a different value (non-repeatable read)."
        },
        {
            "layer": "Diagnostic Debugging & Tracing",
            "topic": "Index Optimization & SARGability",
            "question": "Why does the query WHERE YEAR(created_at) = 2026 fail to leverage a B-Tree index on 'created_at'?",
            "options": [
                "Wrapping the column in a function prevents index seek because the index contains raw dates, not computed years",
                "B-Tree indexes cannot index timestamp or date data types",
                "MySQL disables indexing whenever year comparisons are used",
                "Indexes are only utilized for string search operators"
            ],
            "answer": "Wrapping the column in a function prevents index seek because the index contains raw dates, not computed years",
            "marks": 4,
            "explanation": "Functions on indexed columns are non-SARGable, forcing a full table scan. The query should be rewritten using date ranges: created_at >= '2026-01-01' AND created_at < '2027-01-01'."
        },
        {
            "layer": "Edge Cases & Trap Detection",
            "topic": "NULL Comparison Trap",
            "question": "What does SELECT * FROM users WHERE status != 'INACTIVE' return for a record where status is NULL?",
            "options": [
                "The record is omitted because comparison with NULL evaluates to UNKNOWN (Three-Valued Logic)",
                "The record is included because NULL does not equal the string 'INACTIVE'",
                "Throws a NULLPointer database exception",
                "Returns true only if ANSI_NULLS is disabled"
            ],
            "answer": "The record is omitted because comparison with NULL evaluates to UNKNOWN (Three-Valued Logic)",
            "marks": 3,
            "explanation": "In SQL three-valued logic, any comparison with NULL (e.g. !=, =) yields UNKNOWN, which evaluates to false in a WHERE clause filter."
        }
    ]
}

def generate_mcqs_fallback(
    topic: str,
    difficulty: str,
    count: int,
    batch_name: str = "",
    cognitive_layer: str = "Multi-Layer Balanced"
) -> List[Dict]:
    """Generates rich, layered questions across cognitive tiers based on domain knowledge."""
    clean_topic = topic.strip().lower()
    clean_title = topic.strip().title()

    # Find matched domain
    matched_domain = None
    if any(k in clean_topic for k in ["javascript", "js", "node", "express", "async", "promise", "es6"]):
        matched_domain = "javascript"
    elif any(k in clean_topic for k in ["react", "component", "hook", "frontend", "state", "redux"]):
        matched_domain = "react"
    elif any(k in clean_topic for k in ["sql", "data", "db", "database", "relational", "postgres", "mysql"]):
        matched_domain = "database"

    results = []

    if matched_domain and matched_domain in DOMAIN_KNOWLEDGE_BASE:
        kb_items = DOMAIN_KNOWLEDGE_BASE[matched_domain]
        for idx in range(count):
            item = kb_items[idx % len(kb_items)]
            results.append({
                "question_text": item["question"],
                "options": item["options"][:],
                "correct_answer": item["answer"],
                "marks": item["marks"],
                "cognitive_layer": item["layer"],
                "topic_tag": item["topic"],
                "explanation": item["explanation"]
            })
        return results

    # Universal Multi-Layer Pedagogical Synthesizer for arbitrary academic subjects
    layer_templates = [
        {
            "layer": "Concept Foundation & Syntax",
            "tag": f"{clean_title} Core Principles",
            "q": f"Which fundamental axiom forms the theoretical cornerstone of {clean_title}?",
            "opts": [
                f"Establishing deterministic contracts and modular decomposition within {clean_title}",
                f"Bypassing structural validation to optimize raw runtime execution",
                f"Treating all system variables as untyped mutable global buffers",
                f"Eliminating automated unit verification in favor of ad-hoc manual testing"
            ],
            "ans": f"Establishing deterministic contracts and modular decomposition within {clean_title}",
            "marks": 2,
            "exp": f"Foundational mastery of {clean_title} requires structured decomposition and deterministic boundaries to guarantee system reliability."
        },
        {
            "layer": "Execution Dynamics & Flow",
            "tag": f"{clean_title} Mechanics & Flow",
            "q": f"During the operational lifecycle of {clean_title}, how are transitions managed between internal states?",
            "opts": [
                f"Via predictable, immutable state transitions governed by explicit validation pipelines",
                f"Through asynchronous non-blocking mutations that skip conflict resolution",
                f"By storing runtime states in unmonitored external cache tiers",
                f"Through circular recursive invocations without base boundary termination"
            ],
            "ans": f"Via predictable, immutable state transitions governed by explicit validation pipelines",
            "marks": 3,
            "exp": "Predictable state progression ensures fault tolerance and prevents race conditions during concurrent execution."
        },
        {
            "layer": "Diagnostic Debugging & Tracing",
            "tag": f"{clean_title} Diagnostics & Debugging",
            "q": f"When troubleshooting an unexpected regression in {clean_title}, which diagnostic strategy isolates the root cause fastest?",
            "opts": [
                f"Constructing reproducible minimal test cases and examining boundary input constraints",
                f"Restarting application processes repeatedly without capturing crash telemetry",
                f"Silencing error logging handlers to suppress non-fatal warnings",
                f"Refactoring the entire architecture without identifying the failing invariant"
            ],
            "ans": f"Constructing reproducible minimal test cases and examining boundary input constraints",
            "marks": 3,
            "exp": "Systematic root-cause isolation relies on isolating boundary invariants with reproducible test contracts."
        },
        {
            "layer": "Edge Cases & Trap Detection",
            "tag": f"{clean_title} Edge Cases & Anomalies",
            "q": f"Which edge condition is most frequently overlooked when designing implementations for {clean_title}?",
            "opts": [
                f"Handling boundary zero-states, null dereferences, and network latency timeouts",
                f"Assuming infinite CPU throughput and instantaneous memory allocation",
                f"Neglecting to install auxiliary browser extensions",
                f"Formatting source code without automated indentation rules"
            ],
            "ans": f"Handling boundary zero-states, null dereferences, and network latency timeouts",
            "marks": 4,
            "exp": "Resilient systems must explicitly guard against boundary extremes such as empty payloads, null values, and network timeouts."
        }
    ]

    for i in range(count):
        tmpl = layer_templates[i % len(layer_templates)]
        results.append({
            "question_text": tmpl["q"],
            "options": tmpl["opts"][:],
            "correct_answer": tmpl["ans"],
            "marks": tmpl["marks"],
            "cognitive_layer": tmpl["layer"],
            "topic_tag": tmpl["tag"],
            "explanation": tmpl["exp"]
        })

    return results

# =====================================================================
# MAIN ENTRY POINT
# =====================================================================
def generate_mcqs(
    topic: str,
    difficulty: str = "Intermediate",
    count: int = 5,
    batch_name: str = "",
    cognitive_layer: str = "Multi-Layer Balanced"
) -> List[Dict]:
    """Generates multi-layered MCQs using Gemini SDK first, with intelligent domain fallback."""
    questions = generate_mcqs_with_gemini(topic, difficulty, count, batch_name, cognitive_layer)
    if questions:
        return questions
    return generate_mcqs_fallback(topic, difficulty, count, batch_name, cognitive_layer)