"""
Module: ai_student_mentor.py
Purpose: Personalized Multi-Layer Student Diagnostic & Topic-Focused Study Guidance Engine.

Multi-Layer Diagnostic Capabilities:
  - Layer 1: Quantitative Metric Banding & Mastery Index
  - Layer 2: Cognitive Taxonomy Evaluation (Foundations, Dynamics, Debugging, Edge Cases)
  - Layer 3: Topic-by-Topic Mastery Matrix & Weakness Triage (Critical Focus vs Reinforce vs Mastered)
  - Layer 4: Deep Pedagogical Misconception Diagnosis
  - Layer 5: Prescriptive Action Plan & Targeted Study Material Recommendations
"""

import os
import json
import re
from typing import List, Dict, Any, Optional

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

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
        from google import genai
        client = genai.Client(api_key=api_key)

        wrong_details = []
        for q in wrong_questions:
            wrong_details.append({
                "question": q.get("question_text", ""),
                "student_chose": q.get("student_answer", ""),
                "correct_answer": q.get("correct_answer", ""),
                "cognitive_layer": q.get("cognitive_layer", "Execution Flow"),
                "topic_tag": q.get("topic_tag", quiz_title),
                "explanation": q.get("explanation", "")
            })

        prompt = f"""
You are an expert diagnostic academic tutor analyzing a student's quiz attempt.
Student Name: {student_name or 'Student'}
Quiz: {quiz_title}
Score: {score} out of {total_marks}
Incorrect Questions Analyzed: {json.dumps(wrong_details, indent=2)}

Generate a friendly, highly constructive JSON diagnostic with EXACTLY these keys:
- "summary_badge": A concise motivational mastery badge (e.g. "Mastery Achieved", "Good Foundation — Targeted Revision Required", or "Action Required: Core Concepts Need Review")
- "percentage": integer percentage (0-100)
- "overall_feedback": A warm 2-3 sentence personalized feedback message addressing the student by name.
- "strengths": An array of 2-3 positive statements on what the student understands well.
- "critical_misconceptions": An array of strings explaining the specific conceptual traps the student fell into based on their incorrect choices.
- "action_plan": An array of 3 concrete, high-priority steps the student should take before their next assessment.
- "focus_guidance": An array of objects guiding which specific topics need focus, each with:
    - "topic": Topic name
    - "urgency": "High Priority Focus" (for failed topics) or "Moderate Reinforcement"
    - "guidance": Actionable guidance on what exactly to study in their study notes.
- "recommended_topics": An array of 2-4 specific topic names to revise in their batch study notes.

Output strictly valid JSON with no markdown wrapping.
"""
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )
        cleaned = clean_json_string(response.text)
        data = json.loads(cleaned)
        if isinstance(data, dict):
            return data
    except Exception as e:
        print(f"[AI Mentor] Gemini analysis failed ({e}). Using local multi-layer diagnostic engine.")

    return None

def analyze_performance_fallback(
    student_name: str,
    quiz_title: str,
    score: int,
    total_marks: int,
    wrong_questions: list = None,
    all_questions_summary: list = None
) -> dict:
    """
    Intelligent local diagnostic providing immediate pedagogical feedback,
    topic mastery segmentation, and topic focus guidance.
    """
    wrong_questions = wrong_questions or []
    percentage = round((score / max(total_marks, 1)) * 100)
    name = student_name or "Student"

    # Layer 1: Banding
    if percentage >= 85:
        badge = "Mastery Achieved! Exceptional Performance"
        feedback = f"Outstanding effort, {name}! You scored {score}/{total_marks} ({percentage}%). You demonstrated strong command over the foundational and applied principles in '{quiz_title}'."
        strengths = [
            "Demonstrated clear conceptual discernment between correct principles and tricky distractors.",
            "Handled core problem formulations accurately under testing conditions.",
            "Strong baseline readiness for subsequent advanced modules."
        ]
        action_plan = [
            "Challenge yourself with advanced architectural case studies in your batch study notes.",
            "Solidify your understanding by explaining these concepts in peer study groups.",
            "Experiment with real-world edge cases to test the limits of your solutions."
        ]
    elif percentage >= 60:
        badge = "Solid Foundation — Target Specific Gap Areas"
        feedback = f"Great work, {name}! You earned {score}/{total_marks} ({percentage}%). You have a solid grasp of the core concepts, but a few subtle nuances and edge cases caught you off guard."
        strengths = [
            "Familiarity with standard patterns and primary terminology.",
            "Good foundational recall of main principles.",
            "Correctly solved baseline questions without unnecessary hesitation."
        ]
        action_plan = [
            "Carefully review the explanations for the questions you missed in the detailed review below.",
            "Open your batch study notes and re-read the sections addressing edge cases and boundary traps.",
            "Retake this quiz in 48 hours to confirm these misconceptions have been permanently cleared."
        ]
    else:
        badge = "Action Required: Core Concepts Need Focused Review"
        feedback = f"Keep your head up, {name}! You scored {score}/{total_marks} ({percentage}%). Mistakes are the most valuable learning signals. With a targeted review of the highlighted topics, you will see a rapid jump in your score."
        strengths = [
            "Showed willingness to attempt challenging questions under assessment conditions.",
            "Provided a clear diagnostic map of exactly which topics need revision to accelerate mastery."
        ]
        action_plan = [
            "Step 1: Open your Study Notes tab and review the foundational layers for the weak topics identified below.",
            "Step 2: Write down the correct answers and their rationales in your revision notebook.",
            "Step 3: Solve practice questions on the identified weak topics before attempting your next quiz."
        ]

    # Layer 2 & 3: Topic Weakness Triage & Misconception Analysis
    misconceptions = []
    topic_tally = {}
    focus_guidance = []

    for q in wrong_questions:
        q_text = q.get("question_text", "Question")
        student_ans = q.get("student_answer", "Selected option")
        correct_ans = q.get("correct_answer", "")
        exp = q.get("explanation", "")
        tag = q.get("topic_tag") or q.get("topic") or f"{quiz_title} Concepts"
        cog_layer = q.get("cognitive_layer", "Execution Dynamics")

        # Record topic tally
        topic_tally[tag] = topic_tally.get(tag, 0) + 1

        misconception_text = (
            f"On '{q_text[:60]}...', you chose '{student_ans}'. "
            f"The correct principle is '{correct_ans}'. {exp}"
        )
        misconceptions.append(misconception_text)

    # If no wrong questions provided, provide general reinforcement
    if not misconceptions and percentage < 100:
        misconceptions.append(
            f"Review boundary scenarios and edge-case exceptions in '{quiz_title}' to reach 100% mastery."
        )

    # Build topic focus guidance
    for tag, miss_count in topic_tally.items():
        urgency = "High Priority Focus" if percentage < 60 or miss_count >= 2 else "Moderate Reinforcement"
        focus_guidance.append({
            "topic": tag,
            "urgency": urgency,
            "missed_count": miss_count,
            "guidance": f"Review the '{tag}' study notes. Pay special attention to boundary conditions and common exam anti-patterns."
        })

    if not focus_guidance:
        focus_guidance.append({
            "topic": f"{quiz_title} Core Principles",
            "urgency": "Mastery Confirmed",
            "missed_count": 0,
            "guidance": "Excellent grasp demonstrated. Continue maintaining retention through periodic active recall."
        })

    recommended_topics = [g["topic"] for g in focus_guidance]
    if len(recommended_topics) < 2:
        recommended_topics.append(f"{quiz_title} Revision Notes")

    # Cognitive Layer Health Check
    layer_analysis = {
        "foundations": "Solid" if percentage >= 60 else "Needs Review",
        "mechanics": "Proficient" if percentage >= 75 else "Review In-Depth",
        "edge_cases": "Strong" if percentage >= 85 else "Targeted Practice Required"
    }

    return {
        "summary_badge": badge,
        "percentage": percentage,
        "score": score,
        "total_marks": total_marks,
        "overall_feedback": feedback,
        "strengths": strengths,
        "critical_misconceptions": misconceptions[:4],
        "action_plan": action_plan,
        "focus_guidance": focus_guidance[:5],
        "recommended_topics": list(set(recommended_topics))[:4],
        "cognitive_layer_analysis": layer_analysis
    }

def analyze_quiz_performance(
    student_name: str,
    quiz_title: str,
    score: int,
    total_marks: int,
    wrong_questions: list = None
) -> dict:
    """Entry point to diagnose individual quiz performance."""
    wrong_questions = wrong_questions or []
    result = analyze_performance_with_gemini(student_name, quiz_title, score, total_marks, wrong_questions)
    if result:
        return result
    return analyze_performance_fallback(student_name, quiz_title, score, total_marks, wrong_questions)

def analyze_student_progress(student_name: str, submissions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Multi-Quiz Aggregated Progress & Topic Focus Guidance Engine.
    Evaluates all quizzes opted by the student, calculates topic mastery %,
    and provides comprehensive topic focus recommendations.
    """
    if not submissions:
        return {
            "total_quizzes_opted": 0,
            "average_percentage": 0,
            "overall_status": "No Quizzes Attempted Yet",
            "topic_mastery": [],
            "topics_to_focus": [],
            "mastered_topics": [],
            "mentor_summary": f"Welcome, {student_name or 'Student'}! Opt for your first quiz to begin tracking your learning progress and receiving AI topic guidance."
        }

    total_quizzes = len(submissions)
    total_score = sum(int(s.get("score", 0)) for s in submissions)
    total_possible = sum(int(s.get("total_marks", 10)) for s in submissions)
    avg_percentage = round((total_score / max(total_possible, 1)) * 100)

    # Track topic statistics across all submissions
    topic_stats = {}
    for sub in submissions:
        quiz_topic = sub.get("quiz_title", "General Quiz")
        sub_score = int(sub.get("score", 0))
        max_m = int(sub.get("total_marks", 10))

        if quiz_topic not in topic_stats:
            topic_stats[quiz_topic] = {"score": 0, "total": 0, "attempts": 0}
        topic_stats[quiz_topic]["score"] += sub_score
        topic_stats[quiz_topic]["total"] += max_m
        topic_stats[quiz_topic]["attempts"] += 1

    topic_mastery = []
    topics_to_focus = []
    mastered_topics = []

    for t_name, stat in topic_stats.items():
        pct = round((stat["score"] / max(stat["total"], 1)) * 100)
        item = {
            "topic": t_name,
            "percentage": pct,
            "attempts": stat["attempts"],
            "score": stat["score"],
            "total_marks": stat["total"]
        }
        topic_mastery.append(item)

        if pct < 65:
            topics_to_focus.append({
                "topic": t_name,
                "percentage": pct,
                "urgency": "Critical Focus Required",
                "recommendation": f"Score is {pct}%. Spend 30 minutes revising the study notes on '{t_name}'."
            })
        elif pct < 80:
            topics_to_focus.append({
                "topic": t_name,
                "percentage": pct,
                "urgency": "Reinforcement Recommended",
                "recommendation": f"Score is {pct}%. Review edge cases and re-attempt to solidify mastery."
            })
        else:
            mastered_topics.append({
                "topic": t_name,
                "percentage": pct,
                "urgency": "Mastered",
                "recommendation": f"Solid performance ({pct}%). Maintain knowledge with periodic review."
            })

    # Sort topics to focus from lowest percentage to highest
    topics_to_focus.sort(key=lambda x: x["percentage"])

    mentor_summary = ""
    if avg_percentage >= 80:
        mentor_summary = f"Excellent overall progress, {student_name or 'Student'}! Across {total_quizzes} quizzes, you have maintained an impressive {avg_percentage}% average. Keep excelling!"
    elif avg_percentage >= 60:
        mentor_summary = f"Good progress, {student_name or 'Student'}! You have opted for {total_quizzes} quizzes with an overall average of {avg_percentage}%. Focusing on the {len(topics_to_focus)} highlighted topic(s) below will elevate you to mastery level."
    else:
        mentor_summary = f"Learning is a journey, {student_name or 'Student'}. You've completed {total_quizzes} quizzes with an average of {avg_percentage}%. Focus specifically on the priority topics below to rapidly boost your marks."

    return {
        "total_quizzes_opted": total_quizzes,
        "average_percentage": avg_percentage,
        "total_score": total_score,
        "total_possible": total_possible,
        "overall_status": "Mastery Level" if avg_percentage >= 80 else ("Competent" if avg_percentage >= 60 else "Developing"),
        "topic_mastery": topic_mastery,
        "topics_to_focus": topics_to_focus,
        "mastered_topics": mastered_topics,
        "mentor_summary": mentor_summary
    }
