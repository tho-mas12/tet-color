import sys, os, json, time, requests, re
sys.path.insert(0, '/var/www/tnteachers.in/backend')
from database import engine
import models, ai_generator
from sqlalchemy.orm import sessionmaker

SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()
settings = db.query(models.AdminSettings).first()
key = settings.gemini_api_key.strip() if settings and settings.gemini_api_key else ""

lesson = db.query(models.Lesson).filter(models.Lesson.id == 1).first()
print(f"Targeting Lesson {lesson.id}: '{lesson.title}' | Subject: {lesson.subject} | Medium: {lesson.medium}")

# Update title to proper chapter name
lesson.title = "1. Rational Numbers"
db.commit()
print("Updated title to '1. Rational Numbers'")

part1_focus = "Introduction to Rational Numbers, Standard Form, Equivalent Rational Numbers, Representation on Number Line, Comparison and Ordering of Rational Numbers"
part2_focus = "Four Basic Operations on Rational Numbers, Closure/Commutative/Associative/Distributive Properties, Identity and Inverses, Density Property, Word Problems & BODMAS"

prompt_template = """
You are a Senior Chief Examiner for Tamil Nadu Teacher Eligibility Test (TN TET) Paper 2 (Graduate Teachers / BT Assistant Examination) conducted by TRB.
Curriculum Context:
- Standard / Class: 8 Mathematics (Tamil Nadu State Board / Samacheer Kalvi)
- Medium: ENGLISH MEDIUM
- Term: 1
- Chapter: 'Rational Numbers'
- Specific Topical Focus for this set: {focus}

CRITICAL EXAMINATION RULES:
1. Standard: Pure Tamil Nadu TET Paper 2 level (conceptual depth, mathematical problem-solving, pedagogical clarity).
2. Language: Clear, pristine academic ENGLISH.
3. NO REPETITIVE BOILERPLATE:
   - NEVER use intro phrases like 'Which of the following concepts is directly supported by the lesson material?' or 'Which of the following statements is verified...'.
   - State every question directly, clearly, and naturally like an authentic TRB examination question paper.
   - Do NOT produce broken characters or undefined symbols. Use standard mathematical notation (e.g. 3/4, -5/7, 2/3).
4. Generate exactly 25 high-quality, distinct questions:
   - 8 Core MCQs
   - 5 HOTS Problems (Higher-Order Analytical / Problem Solving)
   - 4 Match the Following with code options (e.g. '1-iv, 2-i, 3-ii, 4-iii')
   - 4 Multi-statement evaluation (Statements i, ii, iii - which is/are correct?)
   - 2 Assertion & Reason questions
   - 2 Procedural / Sequential Ordering questions
5. Structure:
   - Exactly 4 unambiguous options per question.
   - Distribute correct answers across indices 0 (A), 1 (B), 2 (C), and 3 (D) evenly.
   - Detailed step-by-step mathematical explanations.
   - Return valid JSON array of question objects with keys: id, question_type, question, options (list of 4 strings), answer_index (0-3), explanation.
"""

def safe_json_loads(text):
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    try:
        return json.loads(text, strict=False)
    except Exception:
        cleaned = re.sub(r'\\([^"\\/bfnrtu])', r'\\\\\1', text)
        return json.loads(cleaned, strict=False)

def generate_set(focus):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={key}"
    resp = requests.post(url, json={
        'contents': [{'parts': [{'text': prompt_template.format(focus=focus)}]}],
        'generationConfig': {'response_mime_type': 'application/json'}
    }, timeout=45)
    if resp.status_code == 200:
        raw_text = resp.json()['candidates'][0]['content']['parts'][0]['text']
        data = safe_json_loads(raw_text)
        return data
    else:
        raise Exception(f"HTTP {resp.status_code}: {resp.text[:200]}")

print("Generating Part A (25 questions in English)...")
q_part_a = generate_set(part1_focus)
print(f"Part A: received {len(q_part_a)} questions.")

print("Generating Part B (25 questions in English)...")
q_part_b = generate_set(part2_focus)
print(f"Part B: received {len(q_part_b)} questions.")

combined_q1 = q_part_a + q_part_b
print(f"Total q1 questions: {len(combined_q1)}")

# Generate 30 alternate questions for quiz_type2
prompt_type2 = """
You are a Senior Chief Examiner for Tamil Nadu Teacher Eligibility Test (TN TET) Paper 2 conducted by TRB.
Curriculum Context: Class 8 Mathematics, English Medium, Chapter: 'Rational Numbers'.
Generate 30 ALTERNATE, completely unique TET Paper 2 standard examination questions (Type 2 Alternate Set) in clear academic ENGLISH.
Cover all 6 formats: Core MCQ, HOTS, Match the following, Multi-statement, Assertion & Reason, and Sequencing.
NO repetitive intro phrases. Use clear fractions and mathematical notation.
Return ONLY a valid JSON array of question objects with keys: id, question_type, question, options (4 strings), answer_index (0-3), explanation.
"""

print("Generating 30 Type 2 alternate questions in English...")
url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={key}"
resp2 = requests.post(url, json={
    'contents': [{'parts': [{'text': prompt_type2}]}],
    'generationConfig': {'response_mime_type': 'application/json'}
}, timeout=45)
q2 = []
if resp2.status_code == 200:
    q2 = safe_json_loads(resp2.json()['candidates'][0]['content']['parts'][0]['text'])
    print(f"Type 2: received {len(q2)} questions.")

def clean_text_field(text):
    if not text:
        return ""
    # Strip control characters
    s = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', str(text))
    # Strip English boilerplate
    s = re.sub(
        r'^Which of the following (?:concepts|statements|facts|ideas)\s+(?:is|are)\s+(?:directly\s+)?(?:supported|verified|stated)\s+(?:by|in)\s+the\s+(?:uploaded\s+)?(?:lesson|textbook)?\s*material\??\s*(?:\n*Statement Context\s*:\s*[\'\"]?)?',
        '',
        s,
        flags=re.IGNORECASE
    )
    s = re.sub(r'^Statement Context\s*:\s*[\'\"]?', '', s, flags=re.IGNORECASE)
    s = s.strip('\'" \t\r\n')
    return s

for idx, q in enumerate(combined_q1, 1):
    q["id"] = idx
    q["question"] = clean_text_field(ai_generator.clean_question_text(q.get("question", ""), "Rational Numbers"))
    q["options"] = [clean_text_field(o) for o in q.get("options", [])]
    if q.get("explanation"):
        q["explanation"] = clean_text_field(q.get("explanation", ""))

for idx, q in enumerate(q2, 1):
    q["id"] = idx
    q["question"] = clean_text_field(ai_generator.clean_question_text(q.get("question", ""), "Rational Numbers"))
    q["options"] = [clean_text_field(o) for o in q.get("options", [])]
    if q.get("explanation"):
        q["explanation"] = clean_text_field(q.get("explanation", ""))

lesson.quiz_type1 = json.dumps(combined_q1, ensure_ascii=False)
lesson.quiz_type2 = json.dumps(q2, ensure_ascii=False)
db.commit()
print(f"SUCCESS: Lesson 1 updated with {len(combined_q1)} TET questions in q1 and {len(q2)} in q2!")
