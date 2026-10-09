"""
Module: ai_mcq_generator.py
Purpose: Generates Multiple Choice Questions (MCQs) on any academic topic.

Features:
  - Uses the modern Google Gemini Python SDK.
  - Reads GEMINI_API_KEY from .env.
  - Returns structured JSON MCQs.
  - Falls back to local educational templates if Gemini is unavailable.
"""

import os
import json
import re
from typing import List, Dict, Optional


# ---------------------------------------------------------
# Load environment variables
# ---------------------------------------------------------

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass


# ---------------------------------------------------------
# Clean Gemini JSON response
# ---------------------------------------------------------

def clean_json_string(raw_text: str) -> str:
    """
    Removes markdown code fences such as:
    ```json
    [...]
    ```
    from Gemini output.
    """

    raw_text = raw_text.strip()

    match = re.search(
        r"```(?:json)?\s*([\s\S]*?)\s*```",
        raw_text,
        re.IGNORECASE
    )

    if match:
        return match.group(1).strip()

    return raw_text


# ---------------------------------------------------------
# Gemini MCQ Generator
# ---------------------------------------------------------

def generate_mcqs_with_gemini(
    topic: str,
    difficulty: str,
    count: int,
    batch_name: str = ""
) -> Optional[List[Dict]]:
    """
    Generates MCQs using the modern Google Gemini SDK.
    """

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        print("[AI MCQ Generator] GEMINI_API_KEY not found.")
        return None

    try:
        # Modern Gemini SDK
        from google import genai

        client = genai.Client(api_key=api_key)

        prompt = f"""
You are an expert academic tutor creating a multiple-choice quiz.

Topic: {topic}
Difficulty Level: {difficulty}
Number of Questions: {count}
Target Batch/Class: {batch_name or "General Tuition"}

Create exactly {count} high-quality MCQs specifically about the given topic.

Important requirements:

1. Questions must be directly related to the topic.
2. Do NOT generate software-engineering questions unless the topic itself is software engineering.
3. Questions should be appropriate for the specified difficulty level.
4. Each question must have exactly 4 options.
5. Only one option should be correct.
6. The correct_answer must exactly match one of the options.
7. Do not repeat questions.
8. Make incorrect options plausible.
9. Include a short explanation.
10. Return ONLY valid JSON.
11. Do NOT use Markdown.
12. Do NOT add any text before or after the JSON.

Return this exact structure:

[
  {{
    "question_text": "Question here",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correct_answer": "Option A",
    "marks": 2,
    "explanation": "Short explanation."
  }}
]
"""

        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )

        raw_text = response.text

        if not raw_text:
            print("[AI MCQ Generator] Gemini returned an empty response.")
            return None

        cleaned = clean_json_string(raw_text)

        data = json.loads(cleaned)

        # Validate basic structure
        if not isinstance(data, list):
            print("[AI MCQ Generator] Gemini response is not a JSON array.")
            return None

        if len(data) == 0:
            print("[AI MCQ Generator] Gemini returned no questions.")
            return None

        validated_questions = []

        for question in data:

            if not isinstance(question, dict):
                continue

            required_keys = [
                "question_text",
                "options",
                "correct_answer",
                "marks",
                "explanation"
            ]

            if not all(key in question for key in required_keys):
                continue

            if not isinstance(question["options"], list):
                continue

            if len(question["options"]) != 4:
                continue

            if question["correct_answer"] not in question["options"]:
                continue

            validated_questions.append(question)

        if not validated_questions:
            print("[AI MCQ Generator] Gemini returned invalid MCQ structure.")
            return None

        return validated_questions[:count]

    except ImportError:
        print(
            "[AI MCQ Generator] google-genai is not installed."
        )
        print(
            "Run: pip install -U google-genai"
        )
        return None

    except json.JSONDecodeError as e:
        print(
            f"[AI MCQ Generator] Gemini returned invalid JSON: {e}"
        )
        return None

    except Exception as e:
        print(
            f"[AI MCQ Generator] Gemini call failed: {e}"
        )
        print(
            "[AI MCQ Generator] Falling back to local generator."
        )
        return None


# ---------------------------------------------------------
# Local fallback generator
# ---------------------------------------------------------

def generate_mcqs_fallback(
    topic: str,
    difficulty: str,
    count: int,
    batch_name: str = ""
) -> List[Dict]:
    """
    Local fallback MCQ generator.

    These questions are generic but topic-aware.
    Gemini should normally be used for better academic questions.
    """

    clean_topic = topic.strip().title()
    diff = difficulty.capitalize()

    templates = [
        {
            "question_text": f"What is the main idea associated with {clean_topic}?",

            "options": [
                f"The fundamental concept of {clean_topic}",
                "An unrelated concept",
                "A completely different subject",
                "None of the above"
            ],

            "correct_answer": f"The fundamental concept of {clean_topic}",

            "marks": 1,

            "explanation": (
                f"The fundamental concept is the central idea used "
                f"to understand {clean_topic}."
            )
        },

        {
            "question_text": (
                f"Which statement is most closely related to "
                f"{clean_topic}?"
            ),

            "options": [
                f"{clean_topic} deals with its core principles and concepts",
                "It is unrelated to academic study",
                "It has no practical applications",
                "It cannot be studied systematically"
            ],

            "correct_answer": (
                f"{clean_topic} deals with its core principles and concepts"
            ),

            "marks": 1,

            "explanation": (
                f"{clean_topic} can be understood by studying its "
                f"fundamental principles and applications."
            )
        },

        {
            "question_text": (
                f"At {diff} level, which approach is useful for "
                f"understanding {clean_topic}?"
            ),

            "options": [
                f"Understanding concepts and applying them to examples",
                "Memorizing unrelated information",
                "Ignoring the basic principles",
                "Avoiding practice completely"
            ],

            "correct_answer": (
                f"Understanding concepts and applying them to examples"
            ),

            "marks": 2,

            "explanation": (
                "Conceptual understanding combined with practical examples "
                "helps students learn academic topics effectively."
            )
        },

        {
            "question_text": (
                f"Why is {clean_topic} important to study?"
            ),

            "options": [
                f"It helps develop understanding of {clean_topic}",
                "It has no educational value",
                "It cannot be applied anywhere",
                "It is only useful for entertainment"
            ],

            "correct_answer": (
                f"It helps develop understanding of {clean_topic}"
            ),

            "marks": 1,

            "explanation": (
                f"Studying {clean_topic} helps students understand its "
                "principles and applications."
            )
        },

        {
            "question_text": (
                f"Which method would best help a student learn {clean_topic}?"
            ),

            "options": [
                f"Studying concepts and solving practice questions",
                "Skipping all examples",
                "Studying unrelated subjects only",
                "Avoiding revision"
            ],

            "correct_answer": (
                f"Studying concepts and solving practice questions"
            ),

            "marks": 2,

            "explanation": (
                "Concept study followed by practice and revision "
                "strengthens understanding."
            )
        }
    ]

    result = []

    for i in range(count):

        base = templates[i % len(templates)].copy()

        result.append(base)

    return result


# ---------------------------------------------------------
# Main MCQ generator
# ---------------------------------------------------------

def generate_mcqs(
    topic: str,
    difficulty: str = "Intermediate",
    count: int = 5,
    batch_name: str = ""
) -> List[Dict]:
    """
    Main entry point.

    Gemini is attempted first.
    Local fallback is used if Gemini fails.
    """

    mcqs = generate_mcqs_with_gemini(
        topic,
        difficulty,
        count,
        batch_name
    )

    if mcqs:
        return mcqs

    return generate_mcqs_fallback(
        topic,
        difficulty,
        count,
        batch_name
    )