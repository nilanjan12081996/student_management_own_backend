"""
Module: ai_student_mentor.py
Purpose: Personalized Student Quiz Performance Diagnostic & Improvement Mentor.
Analyzes student quiz attempts, pinpoints misconceptions, and generates an action plan.
"""

import os
import json
import re

def clean_json_string(raw_text: str) -> str:
    match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', raw_text.strip())
    if match:
        return match.group(1).strip()
    return raw_text.strip()

def analyze_performance_with_gemini(student_name: str, quiz_title: str, score: int, total_marks: int, wrong_questions: list) -> dict:
    """Uses Gemini API to generate deep pedagogical feedback for a student."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")

        wrong_details = []
        for q in wrong_questions:
            wrong_details.append({
                "question": q.get("question_text", ""),
                "student_chose": q.get("student_answer", ""),
                "correct_answer": q.get("correct_answer", ""),
                "explanation": q.get("explanation", "")
            })

        prompt = f"""
You are an encouraging and insightful academic mentor analyzing a student's quiz attempt.
Student Name: {student_name or 'Student'}
Quiz: {quiz_title}
Score: {score} out of {total_marks}
Incorrect Questions Analyzed: {json.dumps(wrong_details, indent=2)}

Generate a friendly, constructive JSON diagnostic with EXACTLY these keys:
- "summary_badge": A short encouraging title (e.g. "Good Effort - Key Concepts Need Reinforcement" or "Solid Foundation With Minor Gaps")
- "overall_feedback": A warm 2-3 sentence personalized feedback message addressing the student by name.
- "strengths": An array of 2-3 positive statements on what the student understands well.
- "critical_misconceptions": An array of strings explaining the specific conceptual traps the student fell into based on their incorrect choices.
- "action_plan": An array of 3 concrete, high-priority steps the student should take before the next test.
- "recommended_topics": An array of 2-4 specific topic names to revise in their batch study notes.

Output strictly valid JSON with no markdown wrapping.
"""
        response = model.generate_content(prompt)
        cleaned = clean_json_string(response.text)
        data = json.loads(cleaned)
        if isinstance(data, dict):
            return data
    except Exception as e:
        print(f"[AI Mentor] Gemini analysis failed ({e}). Using local fallback.")

    return None

def analyze_performance_fallback(student_name: str, quiz_title: str, score: int, total_marks: int, wrong_questions: list) -> dict:
    """
    Intelligent local diagnostic providing immediate pedagogical feedback
    even without an external internet LLM API.
    """
    percentage = round((score / max(total_marks, 1)) * 100)
    name = student_name or "Student"

    if percentage >= 90:
        badge = "Mastery Achieved! Exceptional Performance"
        feedback = f"Outstanding effort, {name}! You scored {score}/{total_marks} ({percentage}%). You have demonstrated deep command of the concepts tested in '{quiz_title}'."
        strengths = [
            "Consistent accuracy across core and advanced questions.",
            "Strong conceptual discernment between correct solutions and tricky distractors.",
            "Efficient execution with minimal avoidable mistakes."
        ]
        action_plan = [
            "Challenge yourself with advanced problem sets in the next batch module.",
            "Help peer study groups by explaining concepts — teaching solidifies mastery.",
            "Explore real-world production projects to apply these theoretical patterns."
        ]
    elif percentage >= 60:
        badge = "Solid Foundation — Target Specific Gap Areas"
        feedback = f"Great work, {name}! You earned {score}/{total_marks} ({percentage}%). You have a solid grasp of the core concepts, but a few subtle nuances caught you off guard."
        strengths = [
            "Good understanding of fundamental terminology and definitions.",
            "Successfully solved standard pattern questions.",
            "Clear familiarity with the primary syllabus topics."
        ]
        action_plan = [
            "Carefully review the explanations for the questions you missed above.",
            "Open your batch study notes and re-read the sections addressing edge cases.",
            "Retake this quiz in 48 hours to confirm these misconceptions are cleared."
        ]
    else:
        badge = "Action Required: Core Concepts Need Review"
        feedback = f"Keep your head up, {name}! You scored {score}/{total_marks} ({percentage}%). Mistakes are the best learning opportunities. With a targeted review of the fundamentals, you will see a big jump in marks."
        strengths = [
            "Showed willingness to attempt challenging questions under test conditions.",
            "Identified clear focus areas where focused revision will yield immediate improvement."
        ]
        action_plan = [
            "Step 1: Download the PDF study notes for this batch and review the highlighted sections.",
            "Step 2: Write down the correct answers and their rationales in your personal revision notebook.",
            "Step 3: Schedule 15 minutes of practice questions before attempting the next assessment."
        ]

    # Analyze wrong questions for specific topic recommendations
    misconceptions = []
    recommended_topics = []

    if wrong_questions and len(wrong_questions) > 0:
        for q in wrong_questions[:3]:
            q_text = q.get("question_text", "the question")
            correct = q.get("correct_answer", "")
            misconceptions.append(
                f"On question '{q_text[:65]}...', you chose an incorrect alternative. Remember: '{correct}' is the required principle."
            )
            # Extract possible topic keywords
            words = [w for w in q_text.split() if len(w) > 4 and w.isalpha()]
            if words:
                recommended_topics.append(f"{words[0]} Fundamentals")

    if not misconceptions:
        misconceptions = [
            "Pay close attention to subtle negative qualifiers like 'EXCEPT' or 'NOT' in question stems.",
            "Ensure you differentiate between theoretical definitions and practical syntax implementations."
        ]

    if not recommended_topics:
        recommended_topics = [
            f"{quiz_title} Core Principles",
            "Boundary Conditions & Exception Handling",
            "Syllabus Revision Notes"
        ]

    return {
        "summary_badge": badge,
        "percentage": percentage,
        "overall_feedback": feedback,
        "strengths": strengths,
        "critical_misconceptions": misconceptions,
        "action_plan": action_plan,
        "recommended_topics": list(set(recommended_topics))[:4]
    }

def analyze_quiz_performance(student_name: str, quiz_title: str, score: int, total_marks: int, wrong_questions: list) -> dict:
    """Entry point to diagnose student performance."""
    result = analyze_performance_with_gemini(student_name, quiz_title, score, total_marks, wrong_questions)
    if result:
        return result
    return analyze_performance_fallback(student_name, quiz_title, score, total_marks, wrong_questions)
