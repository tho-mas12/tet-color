import os
import shutil
import datetime
import json
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional

from database import engine, get_db, Base
import models, schemas, ai_generator

# DB file & migration
db_file = os.path.join(os.path.dirname(__file__), "tet_platform.db")

def run_sqlite_migrations():
    try:
        import sqlite3
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(lessons)")
        cols = [row[1] for row in cursor.fetchall()]
        if cols and "available_at" not in cols:
            cursor.execute("ALTER TABLE lessons ADD COLUMN available_at TEXT")
        if cols and "quiz_type1" not in cols:
            cursor.execute("ALTER TABLE lessons ADD COLUMN quiz_type1 TEXT")
        if cols and "quiz_type2" not in cols:
            cursor.execute("ALTER TABLE lessons ADD COLUMN quiz_type2 TEXT")
        
        cursor.execute("PRAGMA table_info(lesson_progress)")
        pcols = [row[1] for row in cursor.fetchall()]
        if pcols and "has_failed_test" not in pcols:
            cursor.execute("ALTER TABLE lesson_progress ADD COLUMN has_failed_test BOOLEAN DEFAULT 0")

        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[Migration Warning] {e}")

run_sqlite_migrations()

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TET Platform API", version="1.3.0")

# CORS setup for Vite React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static_uploads", StaticFiles(directory=UPLOAD_DIR), name="static_uploads")

def seed_initial_data(db: Session):
    settings = db.query(models.AdminSettings).first()
    if not settings:
        settings = models.AdminSettings(
            gemini_api_key="",
            practice_question_count=200,
            test_question_count=100,
            test_time_limit_mins=60,
            pass_percentage=80
        )
        db.add(settings)
        db.commit()
    elif settings.pass_percentage != 80:
        settings.pass_percentage = 80
        db.commit()

    admin = db.query(models.User).filter(models.User.email == "admin@tet.com").first()
    if not admin:
        admin = models.User(
            name="Platform Administrator",
            email="admin@tet.com",
            password_hash="admin123",
            role="admin",
            streak_count=50
        )
        db.add(admin)
        db.commit()

    demo_user = db.query(models.User).filter(models.User.email == "student@tet.com").first()
    if not demo_user:
        demo_user = models.User(
            name="Kavitha S.",
            email="student@tet.com",
            password_hash="student123",
            role="student",
            streak_count=14,
            daily_tasks_done=2,
            daily_tasks_total=4
        )
        db.add(demo_user)
        db.commit()

    if db.query(models.Announcement).count() == 0:
        ann = models.Announcement(
            title="Welcome to TET Platform 2026!",
            content="Official study portal. Admin can upload Class 1 to 12 curriculum materials and lesson modules in the Admin Portal.",
            priority="urgent"
        )
        db.add(ann)
        db.commit()

    if db.query(models.TETCard).count() == 0:
        card1 = models.TETCard(
            card_id="tet1",
            title="TET-1",
            description="1 முதல் 8 ஆம் வகுப்பு வரை பாடவாரியான தேர்வு தயாரிப்பு",
            class_range="Classes 1–8",
            paper_type="paper1",
            start_class=1,
            end_class=8,
            lesson_count_label="25 Lessons",
            button_text="OPEN TET-1 →",
            is_active=True
        )
        card2 = models.TETCard(
            card_id="tet2",
            title="TET-2",
            description="6 முதல் 12 ஆம் வகுப்பு வரை பாடவாரியான தேர்வு தயாரிப்பு",
            class_range="Classes 6–12",
            paper_type="paper2",
            start_class=6,
            end_class=12,
            lesson_count_label="25 Lessons",
            button_text="OPEN TET-2 →",
            is_active=True
        )
        db.add_all([card1, card2])
        db.commit()

    # Seed Demo Live Meeting so it is immediately active and visible on the dashboard
    now = datetime.datetime.now()
    now_iso = now.strftime("%Y-%m-%dT%H:%M")
    if db.query(models.LiveMeeting).count() == 0:
        start_iso = (now - datetime.timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M")
        end_iso = (now + datetime.timedelta(days=2)).strftime("%Y-%m-%dT%H:%M")
        demo_meeting = models.LiveMeeting(
            title="🔴 TN TET Paper-2 Live Science & Social Science Special Class",
            meeting_link="https://meet.google.com/abc-defg-hij",
            start_time=start_iso,
            end_time=end_iso,
            description="Live interactive coaching, question paper blueprint analysis & doubt clearing session. Join with the Google Meet link.",
            is_active=True
        )
        db.add(demo_meeting)
        db.commit()
    else:
        # Ensure at least one active demo meeting for live demonstration
        active_live = db.query(models.LiveMeeting).filter(models.LiveMeeting.end_time > now_iso, models.LiveMeeting.is_active == True).first()
        if not active_live:
            first_m = db.query(models.LiveMeeting).first()
            if first_m:
                first_m.start_time = (now - datetime.timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M")
                first_m.end_time = (now + datetime.timedelta(days=2)).strftime("%Y-%m-%dT%H:%M")
                first_m.is_active = True
                db.commit()


@app.on_event("startup")
def startup_event():
    db = next(get_db())
    seed_initial_data(db)

# --- AUTH ENDPOINTS ---

@app.post("/api/auth/register", response_model=schemas.UserProfile)
def register(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")
    
    user = models.User(
        name=user_data.name,
        email=user_data.email,
        password_hash=user_data.password,
        role="student",
        streak_count=1,
        daily_tasks_done=0,
        daily_tasks_total=4
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post("/api/auth/login", response_model=schemas.UserProfile)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or user.password_hash != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return user

@app.get("/api/user/profile", response_model=schemas.UserProfile)
def get_profile(email: str = "student@tet.com", db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user

# --- DASHBOARD ENDPOINT ---

def fetch_google_education_news():
    try:
        import urllib.request
        import xml.etree.ElementTree as ET
        url = "https://news.google.com/rss/search?q=Tamil+Nadu+education+TET+teachers+school&hl=en-IN&gl=IN&ceid=IN:en"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=8) as response:
            xml_data = response.read()
            root = ET.fromstring(xml_data)
            items = []
            for item in root.findall('.//item')[:6]:
                raw_title = item.find('title').text if item.find('title') is not None else "Tamil Nadu Education Update"
                link = item.find('link').text if item.find('link') is not None else "https://news.google.com"
                pub_date = item.find('pubDate').text if item.find('pubDate') is not None else "Today"
                source_elem = item.find('source')
                source = source_elem.text if source_elem is not None else "Google News"

                # Clean up title if source name is appended at the end e.g. "Title - Source"
                title = raw_title
                if " - " in raw_title:
                    title = raw_title.rsplit(" - ", 1)[0]
                
                # Format date nicely e.g. "25 Aug 2026"
                date_str = pub_date
                if "," in pub_date and "GMT" in pub_date:
                    try:
                        # Format "Tue, 25 Aug 2026 07:00:00 GMT" -> "25 Aug 2026"
                        parts = pub_date.split(",")
                        if len(parts) > 1:
                            date_str = " ".join(parts[1].strip().split()[:3])
                    except Exception:
                        date_str = pub_date[:16]

                items.append({
                    "id": str(abs(hash(link))),
                    "title": title,
                    "link": link,
                    "source": source,
                    "date": date_str,
                    "category": "Live Education & TET"
                })
            if items:
                return items
    except Exception as e:
        print(f"[Google News] RSS Fetch error fallback: {e}")
        
    return [
        {
            "id": "news-1",
            "title": "TN School Education Department Releases Updated Digital Learning Guidelines 2026",
            "link": "https://news.google.com/search?q=Tamil+Nadu+School+Education",
            "source": "The Hindu / TN School Education",
            "date": datetime.datetime.now().strftime("%d %b %Y"),
            "category": "Curriculum Update"
        },
        {
            "id": "news-2",
            "title": "TRB Tamil Nadu Prepares Annual Schedule for Teacher Recruitment & TET Exams",
            "link": "https://news.google.com/search?q=TN+TRB+TET+Exam",
            "source": "TRB Portal / Local News",
            "date": datetime.datetime.now().strftime("%d %b %Y"),
            "category": "TET Notification"
        },
        {
            "id": "news-3",
            "title": "State Board Announces Smart Classroom & AI Literacy Program Across High Schools",
            "link": "https://news.google.com/search?q=Tamil+Nadu+Smart+Classroom",
            "source": "Times of India / Education Times",
            "date": datetime.datetime.now().strftime("%d %b %Y"),
            "category": "Digital Initiative"
        }
    ]

@app.get("/api/dashboard")
def get_dashboard(email: str = "student@tet.com", db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        user = db.query(models.User).first()

    # Check if streak is broken (missed yesterday and today)
    if user and user.last_completed_date:
        try:
            last_date = datetime.datetime.strptime(user.last_completed_date, "%Y-%m-%d").date()
            today = datetime.datetime.utcnow().date()
            if (today - last_date).days > 1:
                user.streak_count = 0
                db.commit()
        except Exception:
            pass

    quotes = [
        "Success is the sum of small efforts repeated day in and day out.",
        "The beautiful thing about learning is that no one can take it away from you.",
        "Every lesson completed today brings you closer to your dream TET score!",
        "Consistency is what transforms average into excellence.",
        "Education is the most powerful weapon which you can use to change the world."
    ]
    quote_of_the_day = quotes[user.id % len(quotes)]

    streak = user.streak_count
    badges = [
        {
            "id": "day15",
            "name": "15-Day Scholar",
            "required_streak": 15,
            "unlocked": streak >= 15,
            "icon": "Zap",
            "color": "from-[#0284C7] to-cyan-500"
        },
        {
            "id": "day30",
            "name": "30-Day Master",
            "required_streak": 30,
            "unlocked": streak >= 30,
            "icon": "Award",
            "color": "from-amber-400 to-orange-500"
        },
        {
            "id": "day90",
            "name": "90-Day Veteran",
            "required_streak": 90,
            "unlocked": streak >= 90,
            "icon": "ShieldCheck",
            "color": "from-purple-500 to-indigo-600"
        },
        {
            "id": "day180",
            "name": "180-Day Titan",
            "required_streak": 180,
            "unlocked": streak >= 180,
            "icon": "Sparkles",
            "color": "from-emerald-500 to-teal-700"
        },
        {
            "id": "day365",
            "name": "365-Day Diamond Legend",
            "required_streak": 365,
            "unlocked": streak >= 365,
            "icon": "Crown",
            "color": "from-[#1E3A8A] to-[#0284C7]"
        }
    ]

    announcements = db.query(models.Announcement).order_by(models.Announcement.created_at.desc()).limit(5).all()
    news_feed = fetch_google_education_news()

    return {
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "streak_count": user.streak_count,
            "daily_tasks_done": user.daily_tasks_done,
            "daily_tasks_total": user.daily_tasks_total,
            "progress_percent": int((user.daily_tasks_done / max(1, user.daily_tasks_total)) * 100)
        },
        "quote": quote_of_the_day,
        "badges": badges,
        "announcements": [
            {"id": a.id, "title": a.title, "content": a.content, "priority": a.priority, "date": a.created_at.strftime("%b %d, %Y")}
            for a in announcements
        ],
        "news_feed": news_feed
    }

# --- MATERIALS ENDPOINTS ---

@app.get("/api/materials", response_model=List[schemas.MaterialOut])
def get_materials(
    class_num: int = 10, 
    subject: str = "Tamil", 
    medium: str = "Tamil Medium",
    term: str = "Term-1", 
    db: Session = Depends(get_db)
):
    query = db.query(models.Material).filter(
        models.Material.class_num == class_num,
        models.Material.subject == subject,
        models.Material.term == term
    )
    if subject != "Tamil":
        query = query.filter(models.Material.medium == medium)
        
    return query.all()

@app.get("/api/sample-pdf")
def get_sample_pdf(title: str = "Sample_Material"):
    from fastapi.responses import Response
    pdf_content = f"""%PDF-1.4
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Kinds [/PDF] /Count 1 /Kids [3 0 R]>> endobj
3 0 obj <</Type /Page /Parent 2 0 R /Resources <<>> /Contents 4 0 R>> endobj
4 0 obj <</Length 120>> stream
BT /F1 24 Tf 100 700 TD ({title.replace('_', ' ')}) Tj ET
BT /F1 14 Tf 100 650 TD (Official TET Platform Study Document) Tj ET
BT /F1 12 Tf 100 600 TD (Tamil Nadu School Curriculum Reference Guide) Tj ET
endstream endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000125 00000 n
0000000200 00000 n
trailer <</Size 5 /Root 1 0 R>>
startxref
370
%%EOF"""
    return Response(content=pdf_content.encode('utf-8'), media_type="application/pdf", headers={
        "Content-Disposition": f"inline; filename={title}.pdf"
    })

# --- SEQUENTIAL LEARNING ENDPOINTS ---

@app.get("/api/learning/structure")
def get_learning_structure(
    class_num: int = 10, 
    subject: str = "Tamil", 
    medium: str = "Tamil Medium",
    user_email: str = "student@tet.com", 
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.email == user_email).first()
    user_id = user.id if user else 1

    terms = ["Term-1", "Term-2", "Term-3"]
    result_terms = []

    previous_term_completed = True
    now_iso = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M")

    for term_name in terms:
        query = db.query(models.Lesson).filter(
            models.Lesson.class_num == class_num,
            models.Lesson.subject == subject,
            models.Lesson.term == term_name
        )
        if subject != "Tamil":
            query = query.filter(models.Lesson.medium == medium)

        lessons = query.order_by(models.Lesson.lesson_order.asc()).all()

        term_lessons = []
        term_all_lessons_completed = True if len(lessons) > 0 else False

        previous_lesson_completed = previous_term_completed

        for les in lessons:
            prog = db.query(models.LessonProgress).filter(
                models.LessonProgress.user_id == user_id,
                models.LessonProgress.lesson_id == les.id
            ).first()

            s1 = prog.stage1_pdf if prog else False
            s2 = prog.stage2_video if prog else False
            s3 = prog.stage3_questions if prog else False
            s4 = prog.stage4_test if prog else False
            score = prog.test_score if prog else 0
            has_failed = prog.has_failed_test if prog else False

            # Lesson is completed only after scoring >= 80% in final quiz
            is_fully_done = bool(s1 and s2 and s3 and s4 and score >= 80)

            if not is_fully_done:
                term_all_lessons_completed = False

            # Check if lesson is locked by date/time
            is_scheduled_future = bool(les.available_at and les.available_at > now_iso)
            is_locked = (not previous_lesson_completed) or is_scheduled_future

            term_lessons.append({
                "id": les.id,
                "class_num": les.class_num,
                "subject": les.subject,
                "medium": les.medium,
                "term": les.term,
                "lesson_order": les.lesson_order,
                "title": les.title,
                "description": les.description,
                "pdf_url": les.pdf_url,
                "video_url": les.video_url,
                "available_at": les.available_at,
                "is_disabled_by_schedule": is_scheduled_future,
                "has_quiz_type1": bool(les.quiz_type1),
                "has_quiz_type2": bool(les.quiz_type2),
                "stage1_pdf": s1,
                "stage2_video": s2,
                "stage3_questions": s3,
                "stage4_test": s4,
                "is_locked": is_locked,
                "is_completed": is_fully_done,
                "test_score": score,
                "has_failed_test": has_failed
            })

            previous_lesson_completed = is_fully_done

        result_terms.append({
            "term": term_name,
            "is_locked": not previous_term_completed,
            "is_completed": term_all_lessons_completed,
            "lessons": term_lessons
        })

        previous_term_completed = term_all_lessons_completed

    return {
        "class_num": class_num,
        "subject": subject,
        "medium": medium,
        "terms": result_terms
    }

@app.get("/api/learning/lesson/{lesson_id}")
def get_lesson_detail(lesson_id: int, user_email: str = "student@tet.com", db: Session = Depends(get_db)):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")

    user = db.query(models.User).filter(models.User.email == user_email).first()
    user_id = user.id if user else 1

    prog = db.query(models.LessonProgress).filter(
        models.LessonProgress.user_id == user_id,
        models.LessonProgress.lesson_id == lesson_id
    ).first()

    if not prog:
        prog = models.LessonProgress(
            user_id=user_id,
            lesson_id=lesson_id,
            stage1_pdf=False,
            stage2_video=False,
            stage3_questions=False,
            stage4_test=False,
            test_score=0,
            has_failed_test=False
        )
        db.add(prog)
        db.commit()
        db.refresh(prog)

    now_iso = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M")
    is_scheduled_future = bool(lesson.available_at and lesson.available_at > now_iso)

    return {
        "lesson": {
            "id": lesson.id,
            "class_num": lesson.class_num,
            "subject": lesson.subject,
            "medium": lesson.medium,
            "term": lesson.term,
            "title": lesson.title,
            "description": lesson.description,
            "pdf_url": lesson.pdf_url,
            "video_url": lesson.video_url,
            "available_at": lesson.available_at,
            "is_disabled_by_schedule": is_scheduled_future,
            "has_quiz_type1": bool(lesson.quiz_type1),
            "has_quiz_type2": bool(lesson.quiz_type2),
        },
        "progress": {
            "stage1_pdf": prog.stage1_pdf,
            "stage2_video": prog.stage2_video,
            "stage3_questions": prog.stage3_questions,
            "stage4_test": prog.stage4_test,
            "test_score": prog.test_score,
            "has_failed_test": prog.has_failed_test
        }
    }

@app.post("/api/learning/lesson/{lesson_id}/stage/{stage_num}/complete")
def complete_stage(lesson_id: int, stage_num: int, user_email: str = "student@tet.com", db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_email).first()
    if not user:
        user = db.query(models.User).first()

    prog = db.query(models.LessonProgress).filter(
        models.LessonProgress.user_id == user.id,
        models.LessonProgress.lesson_id == lesson_id
    ).first()

    if not prog:
        prog = models.LessonProgress(user_id=user.id, lesson_id=lesson_id)
        db.add(prog)

    if stage_num == 1:
        prog.stage1_pdf = True
    elif stage_num == 2:
        if not prog.stage1_pdf:
            raise HTTPException(status_code=400, detail="Stage 1 must be completed first!")
        prog.stage2_video = True
    elif stage_num == 3:
        if not prog.stage2_video:
            raise HTTPException(status_code=400, detail="Stage 2 must be completed first!")
        prog.stage3_questions = True
    
    db.commit()
    return {"message": f"Stage {stage_num} marked as done successfully!"}

@app.get("/api/learning/lesson/{lesson_id}/questions")
def get_practice_questions(
    lesson_id: int,
    count: int = 200,
    user_email: str = "student@tet.com",
    quiz_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")

    user = db.query(models.User).filter(models.User.email == user_email).first()
    prog = None
    if user:
        prog = db.query(models.LessonProgress).filter(
            models.LessonProgress.user_id == user.id,
            models.LessonProgress.lesson_id == lesson_id
        ).first()

    # Determine which quiz to load:
    # If explicitly requested, use it; otherwise, if user failed Stage 4 test, use Type 2!
    use_type2 = False
    if quiz_type == "type2":
        use_type2 = True
    elif quiz_type == "type1":
        use_type2 = False
    elif prog and prog.has_failed_test:
        use_type2 = True

    chosen_json = lesson.quiz_type2 if (use_type2 and lesson.quiz_type2) else lesson.quiz_type1
    active_type = "type2" if (use_type2 and lesson.quiz_type2) else "type1"

    if chosen_json:
        try:
            questions = json.loads(chosen_json)
            if isinstance(questions, list) and len(questions) > 0:
                return {
                    "lesson_title": lesson.title,
                    "quiz_type": active_type,
                    "is_type2": (active_type == "type2"),
                    "total": len(questions),
                    "questions": questions
                }
        except Exception as e:
            print(f"[Quiz Parse Error] {e}")

    # Fallback to predefined/generated questions if admin has not generated yet
    settings = db.query(models.AdminSettings).first()
    api_key = settings.gemini_api_key if settings else ""
    target_count = settings.practice_question_count if settings else count

    questions = ai_generator.generate_practice_questions(
        class_num=lesson.class_num,
        subject=lesson.subject,
        term=lesson.term,
        lesson_title=lesson.title,
        count=target_count or 200,
        api_key=api_key
    )
    return {
        "lesson_title": lesson.title,
        "quiz_type": "type1",
        "is_type2": False,
        "total": len(questions),
        "questions": questions
    }

@app.post("/api/learning/lesson/{lesson_id}/generate-test")
def generate_test(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")

    settings = db.query(models.AdminSettings).first()
    api_key = settings.gemini_api_key if settings else ""
    test_count = settings.test_question_count if settings else 100
    time_limit = settings.test_time_limit_mins if settings else 60

    # Pick 100 questions from pre-generated 200 quiz pool if available
    questions = []
    if lesson.quiz_type1:
        try:
            pool = json.loads(lesson.quiz_type1)
            if isinstance(pool, list) and len(pool) > 0:
                questions = pool[:test_count]
                for idx, q in enumerate(questions, 1):
                    q["id"] = idx
        except Exception as e:
            print(f"[Test Pool Error] {e}")

    if not questions:
        questions = ai_generator.generate_test_questions(
            class_num=lesson.class_num,
            subject=lesson.subject,
            term=lesson.term,
            lesson_title=lesson.title,
            count=test_count,
            api_key=api_key
        )

    test_payload = []
    for q in questions:
        test_payload.append({
            "id": q["id"],
            "question_type": q.get("question_type", "கொள்குறி வினா"),
            "question": q["question"],
            "options": q["options"]
        })

    return {
        "lesson_id": lesson.id,
        "lesson_title": lesson.title,
        "time_limit_mins": time_limit,
        "pass_percentage": settings.pass_percentage if settings else 80,
        "total_questions": len(questions),
        "questions": test_payload
    }

@app.post("/api/learning/lesson/{lesson_id}/submit-test")
def submit_test(
    lesson_id: int,
    submission: schemas.TestSubmission,
    user_email: str = "student@tet.com",
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.email == user_email).first()
    if not user:
        user = db.query(models.User).first()

    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    settings = db.query(models.AdminSettings).first()
    test_count = settings.test_question_count if settings else 100
    pass_mark = settings.pass_percentage if settings and settings.pass_percentage else 80

    ref_questions = []
    if lesson.quiz_type1:
        try:
            pool = json.loads(lesson.quiz_type1)
            if isinstance(pool, list) and len(pool) > 0:
                ref_questions = pool[:test_count]
                for idx, q in enumerate(ref_questions, 1):
                    q["id"] = idx
        except Exception:
            pass

    if not ref_questions:
        ref_questions = ai_generator.generate_test_questions(
            class_num=lesson.class_num,
            subject=lesson.subject,
            term=lesson.term,
            lesson_title=lesson.title,
            count=test_count,
            api_key=settings.gemini_api_key if settings else ""
        )

    correct_count = 0
    detailed_results = []

    for q in ref_questions:
        q_id = str(q["id"])
        user_ans = submission.user_answers.get(q_id, None)
        is_correct = (user_ans == q["answer_index"])
        if is_correct:
            correct_count += 1
        
        detailed_results.append({
            "id": q["id"],
            "question_type": q.get("question_type", "கொள்குறி வினா"),
            "question": q["question"],
            "options": q.get("options", []),
            "user_answer": user_ans,
            "correct_answer": q["answer_index"],
            "is_correct": is_correct,
            "explanation": q["explanation"]
        })

    score_percent = int((correct_count / max(1, len(ref_questions))) * 100)
    passed = bool(score_percent >= pass_mark)

    prog = db.query(models.LessonProgress).filter(
        models.LessonProgress.user_id == user.id,
        models.LessonProgress.lesson_id == lesson_id
    ).first()

    if not prog:
        prog = models.LessonProgress(user_id=user.id, lesson_id=lesson_id)
        db.add(prog)

    prog.stage1_pdf = True
    prog.stage2_video = True
    prog.stage3_questions = True
    prog.stage4_test = passed
    prog.test_score = score_percent

    if passed:
        prog.has_failed_test = False
        prog.completed_at = datetime.datetime.utcnow()
        today_str = datetime.datetime.utcnow().strftime("%Y-%m-%d")
        if user.last_completed_date != today_str:
            user.streak_count += 1
            user.last_completed_date = today_str
        user.daily_tasks_done = min(user.daily_tasks_total, user.daily_tasks_done + 1)
    else:
        # Failed Stage 4 test (< 80%) -> require restudying Stage 3 with Type 2 questions
        prog.has_failed_test = True

    db.commit()

    return {
        "score_percent": score_percent,
        "correct_count": correct_count,
        "total_questions": len(ref_questions),
        "passed": passed,
        "pass_mark": pass_mark,
        "requires_type2_restudy": not passed,
        "new_streak": user.streak_count,
        "results": detailed_results
    }

# --- ADMIN ENDPOINTS ---

@app.get("/api/admin/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    total_users = db.query(models.User).filter(models.User.role == "student").count()
    total_materials = db.query(models.Material).count()
    total_lessons = db.query(models.Lesson).count()
    completed_progresses = db.query(models.LessonProgress).filter(models.LessonProgress.stage4_test == True).all()

    avg_score = 0
    if completed_progresses:
        avg_score = int(sum(p.test_score for p in completed_progresses) / len(completed_progresses))

    top_students = db.query(models.User).filter(models.User.role == "student").order_by(models.User.streak_count.desc()).limit(5).all()

    return {
        "total_users": total_users,
        "total_materials": total_materials,
        "total_lessons": total_lessons,
        "average_test_score": avg_score,
        "top_students": [
            {"name": u.name, "email": u.email, "streak": u.streak_count}
            for u in top_students
        ]
    }

# --- DEDICATED UPLOAD 1: MATERIALS EXPLORER UPLOADS ---
@app.get("/api/admin/materials", response_model=List[schemas.MaterialOut])
def admin_get_materials(db: Session = Depends(get_db)):
    return db.query(models.Material).order_by(models.Material.uploaded_at.desc()).all()

@app.post("/api/admin/materials", response_model=schemas.MaterialOut)
def admin_upload_material(
    class_num: int = Form(...),
    subject: str = Form(...),
    medium: str = Form("Tamil Medium"),
    term: str = Form(...),
    title: str = Form(...),
    description: Optional[str] = Form(""),
    video_url: Optional[str] = Form(""),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    pdf_filename = "default_material.pdf"
    pdf_url = f"/api/sample-pdf?title={title.replace(' ', '_')}"

    if file:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        pdf_filename = file.filename
        pdf_url = f"/static_uploads/{file.filename}"

    material = models.Material(
        class_num=class_num,
        subject=subject,
        medium=medium,
        term=term,
        title=title,
        description=description,
        pdf_filename=pdf_filename,
        pdf_url=pdf_url,
        video_url=video_url or "https://www.youtube.com/embed/dQw4w9WgXcQ",
        file_size="3.5 MB"
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    return material

@app.delete("/api/admin/materials/{material_id}")
def admin_delete_material(material_id: int, db: Session = Depends(get_db)):
    mat = db.query(models.Material).filter(models.Material.id == material_id).first()
    if not mat:
        raise HTTPException(status_code=404, detail="Material not found.")
    db.delete(mat)
    db.commit()
    return {"message": "Material deleted successfully."}

# --- DEDICATED UPLOAD 2: LEARNING PORTAL MODULE UPLOADS & SCHEDULING ---
@app.get("/api/admin/lessons")
def admin_get_lessons(db: Session = Depends(get_db)):
    lessons = db.query(models.Lesson).order_by(models.Lesson.created_at.desc()).all()
    res = []
    for l in lessons:
        q1_count = 0
        q2_count = 0
        if l.quiz_type1:
            try:
                q1_count = len(json.loads(l.quiz_type1))
            except Exception:
                q1_count = 0
        if l.quiz_type2:
            try:
                q2_count = len(json.loads(l.quiz_type2))
            except Exception:
                q2_count = 0

        res.append({
            "id": l.id,
            "class_num": l.class_num,
            "subject": l.subject,
            "medium": l.medium,
            "term": l.term,
            "lesson_order": l.lesson_order,
            "title": l.title,
            "description": l.description,
            "pdf_url": l.pdf_url,
            "video_url": l.video_url,
            "available_at": l.available_at,
            "has_quiz_type1": bool(l.quiz_type1),
            "quiz_type1_count": q1_count,
            "has_quiz_type2": bool(l.quiz_type2),
            "quiz_type2_count": q2_count,
            "created_at": l.created_at.isoformat() if l.created_at else None
        })
    return res

@app.post("/api/admin/lessons")
def admin_upload_lesson(
    class_num: int = Form(...),
    subject: str = Form(...),
    medium: str = Form("Tamil Medium"),
    term: str = Form(...),
    lesson_order: int = Form(1),
    title: str = Form(...),
    description: Optional[str] = Form(""),
    video_url: Optional[str] = Form("https://www.youtube.com/embed/dQw4w9WgXcQ"),
    available_at: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    pdf_url = f"/api/sample-pdf?title={title.replace(' ', '_')}"

    if file:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        pdf_url = f"/static_uploads/{file.filename}"

    lesson = models.Lesson(
        class_num=class_num,
        subject=subject,
        medium=medium,
        term=term,
        lesson_order=lesson_order,
        title=title,
        description=description,
        pdf_url=pdf_url,
        video_url=video_url or "https://www.youtube.com/embed/dQw4w9WgXcQ",
        available_at=available_at if available_at and available_at.strip() else None
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return {"message": "Learning Portal Lesson Module published successfully!", "lesson_id": lesson.id}

@app.put("/api/admin/lessons/{lesson_id}")
def admin_update_lesson(
    lesson_id: int,
    lesson_data: schemas.LessonUpdate,
    db: Session = Depends(get_db)
):
    les = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not les:
        raise HTTPException(status_code=404, detail="Lesson module not found.")

    if lesson_data.class_num is not None: les.class_num = lesson_data.class_num
    if lesson_data.subject is not None: les.subject = lesson_data.subject
    if lesson_data.medium is not None: les.medium = lesson_data.medium
    if lesson_data.term is not None: les.term = lesson_data.term
    if lesson_data.lesson_order is not None: les.lesson_order = lesson_data.lesson_order
    if lesson_data.title is not None: les.title = lesson_data.title
    if lesson_data.description is not None: les.description = lesson_data.description
    if lesson_data.video_url is not None: les.video_url = lesson_data.video_url
    if lesson_data.available_at is not None:
        les.available_at = lesson_data.available_at.strip() if lesson_data.available_at.strip() else None

    db.commit()
    db.refresh(les)
    return {"message": "Lesson updated successfully!", "lesson_id": les.id}

@app.delete("/api/admin/lessons/{lesson_id}")
def admin_delete_lesson(lesson_id: int, db: Session = Depends(get_db)):
    les = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not les:
        raise HTTPException(status_code=404, detail="Lesson module not found.")
    db.delete(les)
    db.commit()
    return {"message": "Lesson module deleted successfully."}

# --- ADMIN QUIZ GENERATION & MANAGEMENT (TYPE 1 & TYPE 2) ---
@app.post("/api/admin/lessons/{lesson_id}/quiz/{quiz_type}/generate")
def admin_generate_lesson_quiz(
    lesson_id: int,
    quiz_type: str, # "type1" or "type2"
    count: Optional[int] = 200,
    db: Session = Depends(get_db)
):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")

    settings = db.query(models.AdminSettings).first()
    api_key = settings.gemini_api_key if settings else ""

    # Generate questions via ai_generator (200 questions)
    questions = ai_generator.generate_practice_questions(
        class_num=lesson.class_num,
        subject=lesson.subject,
        term=lesson.term,
        lesson_title=lesson.title,
        count=count or 200,
        api_key=api_key
    )

    questions_json = json.dumps(questions, ensure_ascii=False)
    if quiz_type == "type2":
        lesson.quiz_type2 = questions_json
    else:
        lesson.quiz_type1 = questions_json

    db.commit()
    return {
        "message": f"Quiz {quiz_type.upper()} generated successfully with {len(questions)} questions!",
        "quiz_type": quiz_type,
        "total": len(questions),
        "questions": questions
    }

@app.post("/api/admin/lessons/{lesson_id}/quiz/{quiz_type}/save")
def admin_save_lesson_quiz(
    lesson_id: int,
    quiz_type: str,
    payload: schemas.QuizSavePayload,
    db: Session = Depends(get_db)
):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")

    questions_json = json.dumps(payload.questions, ensure_ascii=False)
    if quiz_type == "type2":
        lesson.quiz_type2 = questions_json
    else:
        lesson.quiz_type1 = questions_json

    db.commit()
    return {
        "message": f"Quiz {quiz_type.upper()} saved successfully with {len(payload.questions)} questions!",
        "quiz_type": quiz_type,
        "total": len(payload.questions)
    }

@app.get("/api/admin/lessons/{lesson_id}/quiz/{quiz_type}")
def admin_get_lesson_quiz(
    lesson_id: int,
    quiz_type: str,
    db: Session = Depends(get_db)
):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")

    raw_json = lesson.quiz_type2 if quiz_type == "type2" else lesson.quiz_type1
    if not raw_json:
        return {
            "lesson_id": lesson.id,
            "lesson_title": lesson.title,
            "quiz_type": quiz_type,
            "total": 0,
            "questions": []
        }

    try:
        questions = json.loads(raw_json)
    except Exception:
        questions = []

    return {
        "lesson_id": lesson.id,
        "lesson_title": lesson.title,
        "quiz_type": quiz_type,
        "total": len(questions),
        "questions": questions
    }

# --- LIVE MEETINGS ENDPOINTS ---
@app.get("/api/meetings/active")
def get_active_meetings(db: Session = Depends(get_db)):
    meetings = db.query(models.LiveMeeting).filter(models.LiveMeeting.is_active == True).order_by(models.LiveMeeting.start_time.asc()).all()
    now_iso = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M")
    active_list = []
    for m in meetings:
        # Hide if meeting end time has passed
        if m.end_time and m.end_time < now_iso:
            continue
        is_live = False
        if m.start_time and m.end_time:
            is_live = bool(m.start_time <= now_iso <= m.end_time)
        elif m.start_time:
            is_live = bool(m.start_time <= now_iso)

        active_list.append({
            "id": m.id,
            "title": m.title,
            "meeting_link": m.meeting_link,
            "start_time": m.start_time,
            "end_time": m.end_time,
            "description": m.description,
            "is_live": is_live,
            "meeting_url": m.meeting_link
        })
    return active_list

@app.get("/api/admin/meetings")
def admin_get_meetings(db: Session = Depends(get_db)):
    meetings = db.query(models.LiveMeeting).order_by(models.LiveMeeting.created_at.desc()).all()
    now_iso = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M")
    res = []
    for m in meetings:
        is_live = False
        if m.start_time and m.end_time:
            is_live = bool(m.start_time <= now_iso <= m.end_time)
        elif m.start_time:
            is_live = bool(m.start_time <= now_iso)
        res.append({
            "id": m.id,
            "title": m.title,
            "meeting_link": m.meeting_link,
            "meeting_url": m.meeting_link,
            "start_time": m.start_time,
            "end_time": m.end_time,
            "description": m.description,
            "is_active": m.is_active,
            "is_live": is_live,
            "created_at": m.created_at.isoformat() if m.created_at else None
        })
    return res

@app.post("/api/admin/meetings")
def admin_create_meeting(meeting: schemas.LiveMeetingCreate, db: Session = Depends(get_db)):
    link = meeting.meeting_link or meeting.meeting_url or "https://meet.google.com/abc-defg-hij"
    new_m = models.LiveMeeting(
        title=meeting.title,
        meeting_link=link,
        start_time=meeting.start_time,
        end_time=meeting.end_time,
        description=meeting.description or "",
        is_active=True
    )
    db.add(new_m)
    db.commit()
    db.refresh(new_m)
    return new_m

@app.put("/api/admin/meetings/{meeting_id}")
def admin_update_meeting(meeting_id: int, meeting: schemas.LiveMeetingCreate, db: Session = Depends(get_db)):
    m = db.query(models.LiveMeeting).filter(models.LiveMeeting.id == meeting_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Meeting not found.")
    link = meeting.meeting_link or meeting.meeting_url or m.meeting_link
    m.title = meeting.title
    m.meeting_link = link
    m.start_time = meeting.start_time
    m.end_time = meeting.end_time
    m.description = meeting.description or ""
    db.commit()
    db.refresh(m)
    return m

@app.delete("/api/admin/meetings/{meeting_id}")
def admin_delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    m = db.query(models.LiveMeeting).filter(models.LiveMeeting.id == meeting_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Meeting not found.")
    db.delete(m)
    db.commit()
    return {"message": "Live meeting deleted successfully!"}

@app.get("/api/admin/users", response_model=List[schemas.UserProfile])
def admin_get_users(role: Optional[str] = "admin", db: Session = Depends(get_db)):
    # Security: Return only admin accounts in admin access control
    if role == "all":
        return db.query(models.User).filter(models.User.role == "admin").all()
    return db.query(models.User).filter(models.User.role == "admin").all()

@app.post("/api/admin/create-admin", response_model=schemas.UserProfile)
def create_admin_user(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing:
        existing.role = "admin"
        if user_data.password:
            existing.password_hash = user_data.password
        if user_data.name:
            existing.name = user_data.name
        db.commit()
        db.refresh(existing)
        return existing

    new_admin = models.User(
        name=user_data.name or "Admin User",
        email=user_data.email,
        password_hash=user_data.password,
        role="admin",
        streak_count=50,
        daily_tasks_done=4,
        daily_tasks_total=4
    )
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return new_admin

@app.get("/api/admin/settings", response_model=schemas.AdminSettingsSchema)
def get_admin_settings(db: Session = Depends(get_db)):
    settings = db.query(models.AdminSettings).first()
    if not settings:
        settings = models.AdminSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@app.put("/api/admin/settings", response_model=schemas.AdminSettingsSchema)
def update_admin_settings(new_settings: schemas.AdminSettingsSchema, db: Session = Depends(get_db)):
    settings = db.query(models.AdminSettings).first()
    if not settings:
        settings = models.AdminSettings()
        db.add(settings)
    
    settings.gemini_api_key = new_settings.gemini_api_key
    settings.practice_question_count = new_settings.practice_question_count
    settings.test_question_count = new_settings.test_question_count
    settings.test_time_limit_mins = new_settings.test_time_limit_mins
    settings.pass_percentage = new_settings.pass_percentage

    db.commit()
    db.refresh(settings)
    return settings

@app.get("/api/admin/announcements")
def get_admin_announcements(db: Session = Depends(get_db)):
    announcements = db.query(models.Announcement).order_by(models.Announcement.created_at.desc()).all()
    return [
        {
            "id": a.id,
            "title": a.title,
            "content": a.content,
            "priority": a.priority,
            "date": a.created_at.strftime("%b %d, %Y")
        }
        for a in announcements
    ]

@app.post("/api/admin/announcements")
def create_announcement(ann: schemas.AnnouncementCreate, db: Session = Depends(get_db)):
    new_ann = models.Announcement(
        title=ann.title,
        content=ann.content,
        priority=ann.priority or "normal"
    )
    db.add(new_ann)
    db.commit()
    return {"message": "Announcement posted successfully!"}

@app.delete("/api/admin/announcements/{ann_id}")
def delete_announcement(ann_id: int, db: Session = Depends(get_db)):
    ann = db.query(models.Announcement).filter(models.Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found.")
    db.delete(ann)
    db.commit()
    return {"message": "Announcement deleted successfully!"}

@app.put("/api/admin/users/{user_id}/role")
def update_user_role(user_id: int, role_data: dict, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
    new_role = role_data.get("role", "student")
    user.role = new_role
    db.commit()
    return {"message": f"User role updated to {new_role} successfully!", "user_id": user.id, "role": user.role}

# --- TET CARDS MANAGEMENT ENDPOINTS ---

@app.get("/api/tet-cards", response_model=List[schemas.TETCardOut])
def get_tet_cards(db: Session = Depends(get_db)):
    return db.query(models.TETCard).filter(models.TETCard.is_active == True).all()

@app.get("/api/admin/tet-cards", response_model=List[schemas.TETCardOut])
def get_admin_tet_cards(db: Session = Depends(get_db)):
    return db.query(models.TETCard).all()

@app.post("/api/admin/tet-cards", response_model=schemas.TETCardOut)
def create_or_update_tet_card(card_data: schemas.TETCardCreate, db: Session = Depends(get_db)):
    existing = db.query(models.TETCard).filter(models.TETCard.card_id == card_data.card_id).first()
    if existing:
        existing.title = card_data.title
        existing.description = card_data.description
        existing.class_range = card_data.class_range
        existing.paper_type = card_data.paper_type
        existing.start_class = card_data.start_class
        existing.end_class = card_data.end_class
        existing.lesson_count_label = card_data.lesson_count_label or "25 Lessons"
        existing.button_text = card_data.button_text or f"OPEN {card_data.title} →"
        db.commit()
        db.refresh(existing)
        return existing
    
    new_card = models.TETCard(
        card_id=card_data.card_id,
        title=card_data.title,
        description=card_data.description,
        class_range=card_data.class_range,
        paper_type=card_data.paper_type,
        start_class=card_data.start_class,
        end_class=card_data.end_class,
        lesson_count_label=card_data.lesson_count_label or "25 Lessons",
        button_text=card_data.button_text or f"OPEN {card_data.title} →",
        is_active=True
    )
    db.add(new_card)
    db.commit()
    db.refresh(new_card)
    return new_card

@app.delete("/api/admin/tet-cards/{card_id}")
def delete_tet_card(card_id: str, db: Session = Depends(get_db)):
    card = db.query(models.TETCard).filter(models.TETCard.card_id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found.")
    db.delete(card)
    db.commit()
    return {"message": "TET Card deleted successfully!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
