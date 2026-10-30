"""
Module: main.py
Description: FastAPI Microservice for Multi-Layer Educational AI capabilities.

Port:
    5001

Routes:
    GET  /health
    POST /ai/generate-mcqs
    POST /ai/generate-notes
    POST /ai/analyze-quiz
    POST /ai/student-progress-analysis
"""

import os
import uvicorn

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# ---------------------------------------------------------
# Import AI modules
# ---------------------------------------------------------
from ai_mcq_generator import generate_mcqs
from ai_notes_generator import generate_notes
from ai_student_mentor import analyze_quiz_performance, analyze_student_progress

# ---------------------------------------------------------
# FastAPI Application
# ---------------------------------------------------------
app = FastAPI(
    title="Tuition Academy Multi-Layer AI Engine",
    description=(
        "Python AI microservice powering multi-layer question generation, "
        "pedagogical study notes, student diagnostics, and topic focus guidance."
    ),
    version="2.0.0"
)

# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# REQUEST MODELS
# =========================================================

class MCQRequest(BaseModel):
    topic: str = Field(
        ...,
        min_length=1,
        example="React Hooks & State Management"
    )
    difficulty: Optional[str] = Field(
        "Intermediate",
        example="Intermediate"
    )
    count: Optional[int] = Field(
        5,
        ge=1,
        le=50,
        example=5
    )
    batch_name: Optional[str] = Field(
        "",
        example="CS 101 - Core JavaScript"
    )
    cognitive_layer: Optional[str] = Field(
        "Multi-Layer Balanced",
        example="Diagnostic Debugging & Tracing"
    )


class NotesRequest(BaseModel):
    topic: str = Field(
        ...,
        min_length=1,
        example="Object-Oriented Programming Principles"
    )
    subject: Optional[str] = Field(
        "Computer Science",
        example="Computer Science"
    )
    style: Optional[str] = Field(
        "Detailed Guide",
        example="Detailed Guide"
    )
    batch_name: Optional[str] = Field(
        "",
        example="CS 101 - Core JavaScript"
    )


class QuizAnalysisRequest(BaseModel):
    student_name: Optional[str] = Field(
        "Student",
        example="John Doe"
    )
    quiz_title: str = Field(
        ...,
        min_length=1,
        example="JavaScript Fundamentals & ES6+"
    )
    score: int = Field(
        ...,
        ge=0,
        example=6
    )
    total_marks: int = Field(
        ...,
        gt=0,
        example=10
    )
    wrong_questions: Optional[List[Dict[str, Any]]] = Field(
        default_factory=list
    )


class ProgressAnalysisRequest(BaseModel):
    student_name: Optional[str] = Field(
        "Student",
        example="Jane Smith"
    )
    submissions: List[Dict[str, Any]] = Field(
        default_factory=list,
        example=[
            {"quiz_title": "JavaScript Fundamentals", "score": 8, "total_marks": 10},
            {"quiz_title": "Database Normalization", "score": 4, "total_marks": 10}
        ]
    )


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health_check():
    has_gemini = bool(os.getenv("GEMINI_API_KEY"))

    return {
        "status": "UP",
        "service": "Tuition Academy Multi-Layer AI Microservice",
        "version": "2.0.0",
        "port": int(os.getenv("PORT", 5001)),
        "gemini_configured": has_gemini,
        "mode": (
            "Live Gemini Multi-Layer LLM"
            if has_gemini
            else "Intelligent Multi-Layer Pedagogical Engine"
        ),
        "supported_layers": [
            "Layer 1: Concept Foundation & Syntax",
            "Layer 2: Execution Dynamics & Flow",
            "Layer 3: Diagnostic Debugging & Tracing",
            "Layer 4: Edge Cases & Trap Detection"
        ]
    }


# =========================================================
# GENERATE MCQs
# =========================================================

@app.post("/ai/generate-mcqs")
def api_generate_mcqs(payload: MCQRequest):
    try:
        questions = generate_mcqs(
            topic=payload.topic.strip(),
            difficulty=payload.difficulty or "Intermediate",
            count=payload.count or 5,
            batch_name=payload.batch_name or "",
            cognitive_layer=payload.cognitive_layer or "Multi-Layer Balanced"
        )

        return {
            "success": True,
            "topic": payload.topic,
            "difficulty": payload.difficulty or "Intermediate",
            "cognitive_layer": payload.cognitive_layer or "Multi-Layer Balanced",
            "count": len(questions),
            "questions": questions
        }
    except Exception as e:
        print(f"[AI MCQ API ERROR] {e}")
        raise HTTPException(
            status_code=500,
            detail=f"MCQ generation failed: {str(e)}"
        )


# =========================================================
# GENERATE NOTES
# =========================================================

@app.post("/ai/generate-notes")
def api_generate_notes(payload: NotesRequest):
    try:
        note_data = generate_notes(
            topic=payload.topic.strip(),
            subject=payload.subject or "Computer Science",
            style=payload.style or "Detailed Guide",
            batch_name=payload.batch_name or ""
        )

        return {
            "success": True,
            "note": note_data
        }
    except Exception as e:
        print(f"[AI NOTES API ERROR] {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Notes generation failed: {str(e)}"
        )


# =========================================================
# ANALYZE QUIZ
# =========================================================

@app.post("/ai/analyze-quiz")
def api_analyze_quiz(payload: QuizAnalysisRequest):
    try:
        if payload.score > payload.total_marks:
            raise HTTPException(
                status_code=400,
                detail="Score cannot be greater than total marks."
            )

        analysis = analyze_quiz_performance(
            student_name=payload.student_name or "Student",
            quiz_title=payload.quiz_title,
            score=payload.score,
            total_marks=payload.total_marks,
            wrong_questions=payload.wrong_questions or []
        )

        return {
            "success": True,
            "analysis": analysis
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[AI MENTOR API ERROR] {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Quiz analysis failed: {str(e)}"
        )


# =========================================================
# ANALYZE STUDENT MULTI-QUIZ PROGRESS
# =========================================================

@app.post("/ai/student-progress-analysis")
def api_student_progress_analysis(payload: ProgressAnalysisRequest):
    try:
        progress_data = analyze_student_progress(
            student_name=payload.student_name or "Student",
            submissions=payload.submissions or []
        )
        return {
            "success": True,
            "progress": progress_data
        }
    except Exception as e:
        print(f"[AI PROGRESS API ERROR] {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Progress analysis failed: {str(e)}"
        )


# =========================================================
# START SERVER
# =========================================================

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"Starting Multi-Layer Python AI Service on http://{host}:{port}")
    uvicorn.run(app, host=host, port=port)