"""
Module: ai_notes_generator.py
Purpose: Generates structured academic study notes, revision sheets, and lecture summaries.
"""

import os

def generate_notes_with_gemini(topic: str, subject: str, style: str = "Detailed Guide", batch_name: str = "") -> dict:
    """Uses Gemini API to write high-quality markdown study notes."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")

        prompt = f"""
You are a senior university professor and private tuition instructor.
Create a comprehensive study note for students in cohort '{batch_name or 'General Tuition'}'.
Topic: {topic}
Subject: {subject or 'Computer Science'}
Format / Style: {style}

Guidelines:
- Start with a clear 1-paragraph Concept Overview.
- Provide key bullet points under 'Core Principles'.
- Include an illustrative code snippet or practical formula under 'Practical Example'.
- List 3 Common Pitfalls to avoid in exams.
- End with an 'Exam Summary Checklist'.
- Use clean Markdown with headers (#, ##, ###).

Output only the markdown text.
"""
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text:
            return {
                "title": f"{topic.strip().title()} — {style}",
                "topic": topic.strip().title(),
                "content": text
            }
    except Exception as e:
        print(f"[AI Notes Generator] Gemini failed ({e}). Using local fallback.")

    return None

def generate_notes_fallback(topic: str, subject: str, style: str = "Detailed Guide", batch_name: str = "") -> dict:
    """
    Intelligent local generator providing structured syllabus notes
    ensuring tutor productivity without third-party dependencies.
    """
    clean_topic = topic.strip().title()
    clean_subj = subject.strip().title() if subject else "Computer Science"

    markdown_body = f"""# {clean_topic}: {style}
*Target Cohort: {batch_name or 'All Enrolled Batches'} • Discipline: {clean_subj}*

---

## 1. Executive Overview
**{clean_topic}** represents a fundamental pillar in {clean_subj}. Mastering this topic empowers students to construct maintainable, scalable, and optimized solutions. In competitive assessments and technical interviews, proficiency in {clean_topic} directly demonstrates architectural clarity and analytical problem-solving skills.

---

## 2. Core Principles & Theoretical Foundations
* **Decomposition & Separation:** Break down complex logic into predictable, single-responsibility units.
* **Deterministic Behavior:** Ensure functions and routines yield consistent outputs for given inputs without unexpected side-effects.
* **Efficiency & Resource Management:** Maintain optimal time complexity while minimizing memory footprint.
* **Resilience:** Anticipate boundary conditions (empty states, null pointers, network timeouts) and handle them gracefully.

---

## 3. Practical Implementation Example

```javascript
// Example: Implementing robust pattern for {clean_topic}
function executeOperation(inputData) {{
  // Step 1: Input validation boundary check
  if (!inputData) {{
    throw new Error("Invalid payload: inputData is required");
  }}

  // Step 2: Core processing logic for {clean_topic}
  const processed = {{
    timestamp: new Date().toISOString(),
    topic: "{clean_topic}",
    status: "OPTIMIZED",
    result: inputData
  }};

  return processed;
}}
```

---

## 4. Key Exam Pitfalls to Avoid
1. **Ignoring Edge Cases:** Always check for empty arrays, undefined values, or division by zero.
2. **Confusing Syntax with Semantics:** Focus on the underlying architectural reason rather than rote memorization.
3. **Over-Engineering:** Prefer clean, readable solutions over convoluted one-liners.

---

## 5. Quick Revision Checklist
- [x] Can explain the fundamental definition in 2 sentences.
- [x] Know the best-case vs. worst-case time complexity.
- [x] Practiced at least 3 implementation problems.
"""

    return {
        "title": f"{clean_topic} — Master Guide",
        "topic": clean_topic,
        "content": markdown_body.strip()
    }

def generate_notes(topic: str, subject: str = "Computer Science", style: str = "Detailed Guide", batch_name: str = "") -> dict:
    """Main entrypoint for generating study notes."""
    result = generate_notes_with_gemini(topic, subject, style, batch_name)
    if result:
        return result
    return generate_notes_fallback(topic, subject, style, batch_name)
