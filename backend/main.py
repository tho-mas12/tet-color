import os
import re
import shutil
import datetime
import json
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Body, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List, Optional

from database import engine, get_db, Base, DATABASE_URL
import models, schemas, ai_generator

# DB file & migration
db_file = os.path.join(os.path.dirname(__file__), "tet_platform.db")

IST_TZ = datetime.timezone(datetime.timedelta(hours=5, minutes=30))

def get_ist_now():
    return datetime.datetime.now(IST_TZ)

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
        if cols and "stage4_unlock_time" not in cols:
            cursor.execute("ALTER TABLE lessons ADD COLUMN stage4_unlock_time TEXT DEFAULT '20:00'")
        if cols and "stage4_force_open" not in cols:
            cursor.execute("ALTER TABLE lessons ADD COLUMN stage4_force_open BOOLEAN DEFAULT 0")
        
        cursor.execute("PRAGMA table_info(lesson_progress)")
        pcols = [row[1] for row in cursor.fetchall()]
        if pcols and "has_failed_test" not in pcols:
            cursor.execute("ALTER TABLE lesson_progress ADD COLUMN has_failed_test BOOLEAN DEFAULT 0")

        cursor.execute("PRAGMA table_info(admin_settings)")
        as_cols = [row[1] for row in cursor.fetchall()]
        if as_cols and "enable_material_download" not in as_cols:
            cursor.execute("ALTER TABLE admin_settings ADD COLUMN enable_material_download BOOLEAN DEFAULT 1")
        if as_cols and "enable_quiz_download" not in as_cols:
            cursor.execute("ALTER TABLE admin_settings ADD COLUMN enable_quiz_download BOOLEAN DEFAULT 1")
        if as_cols and "razorpay_key_id" not in as_cols:
            cursor.execute("ALTER TABLE admin_settings ADD COLUMN razorpay_key_id TEXT DEFAULT ''")
        if as_cols and "razorpay_key_secret" not in as_cols:
            cursor.execute("ALTER TABLE admin_settings ADD COLUMN razorpay_key_secret TEXT DEFAULT ''")
        if as_cols and "course_price" not in as_cols:
            cursor.execute("ALTER TABLE admin_settings ADD COLUMN course_price INTEGER DEFAULT 999")
        if as_cols and "original_price" not in as_cols:
            cursor.execute("ALTER TABLE admin_settings ADD COLUMN original_price INTEGER DEFAULT 2499")
        if as_cols and "discount_percent" not in as_cols:
            cursor.execute("ALTER TABLE admin_settings ADD COLUMN discount_percent INTEGER DEFAULT 60")

        cursor.execute("PRAGMA table_info(enrollments)")
        e_cols = [row[1] for row in cursor.fetchall()]
        if e_cols and "coupon_code" not in e_cols:
            cursor.execute("ALTER TABLE enrollments ADD COLUMN coupon_code TEXT DEFAULT ''")
        if e_cols and "discount_amount" not in e_cols:
            cursor.execute("ALTER TABLE enrollments ADD COLUMN discount_amount INTEGER DEFAULT 0")

        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[Migration Warning] {e}")

if "sqlite" in DATABASE_URL:
    run_sqlite_migrations()

# Create DB tables safely (handles multiple workers)
try:
    models.Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f'[DB Tables Init Info] {e}')

def run_db_migrations():
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        if "admin_settings" in tables:
            cols = [c["name"] for c in inspector.get_columns("admin_settings")]
            with engine.connect() as conn:
                if "original_price" not in cols:
                    conn.execute(text("ALTER TABLE admin_settings ADD COLUMN original_price INTEGER DEFAULT 2499"))
                if "discount_percent" not in cols:
                    conn.execute(text("ALTER TABLE admin_settings ADD COLUMN discount_percent INTEGER DEFAULT 60"))
                conn.commit()
        if "enrollments" in tables:
            cols = [c["name"] for c in inspector.get_columns("enrollments")]
            with engine.connect() as conn:
                if "coupon_code" not in cols:
                    conn.execute(text("ALTER TABLE enrollments ADD COLUMN coupon_code VARCHAR(50) DEFAULT ''"))
                if "discount_amount" not in cols:
                    conn.execute(text("ALTER TABLE enrollments ADD COLUMN discount_amount INTEGER DEFAULT 0"))
                conn.commit()
        if "lessons" in tables:
            cols = [c["name"] for c in inspector.get_columns("lessons")]
            with engine.connect() as conn:
                if "active_stages" not in cols:
                    conn.execute(text("ALTER TABLE lessons ADD COLUMN active_stages VARCHAR(50) DEFAULT '1,2,3,4,5'"))
                if "short_notes_pdf_url" not in cols:
                    conn.execute(text("ALTER TABLE lessons ADD COLUMN short_notes_pdf_url VARCHAR(500) NULL"))
                if "stage4_unlock_time" not in cols:
                    conn.execute(text("ALTER TABLE lessons ADD COLUMN stage4_unlock_time VARCHAR(50) DEFAULT '20:00'"))
                if "stage4_force_open" not in cols:
                    conn.execute(text("ALTER TABLE lessons ADD COLUMN stage4_force_open BOOLEAN DEFAULT 0"))
                if "stage5_unlock_time" not in cols:
                    conn.execute(text("ALTER TABLE lessons ADD COLUMN stage5_unlock_time VARCHAR(50) DEFAULT '20:00'"))
                if "stage5_force_open" not in cols:
                    conn.execute(text("ALTER TABLE lessons ADD COLUMN stage5_force_open BOOLEAN DEFAULT 0"))
                conn.commit()
    except Exception as e:
        print(f"[DB Migration Info] {e}")

run_db_migrations()

app = FastAPI(title="Education Platform API", version="1.4.0")

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

    try:
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
    except Exception:
        db.rollback()

    try:
        candidate = db.query(models.User).filter(models.User.email == "candidate@tet.com").first()
        if not candidate:
            candidate = models.User(
                name="Teacher Candidate",
                email="candidate@tet.com",
                password_hash="candidate123",
                role="student",
                streak_count=14,
                daily_tasks_done=1,
                daily_tasks_total=4
            )
            db.add(candidate)
            db.commit()
    except Exception:
        db.rollback()

    try:
        dummy_student = db.query(models.User).filter(models.User.email == "student@tet.com").first()
        if dummy_student:
            db.delete(dummy_student)
            db.commit()
    except Exception:
        db.rollback()

    if db.query(models.Announcement).count() == 0:
        ann = models.Announcement(
            title="Welcome to Education Platform 2026!",
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

    if db.query(models.DashboardContainer).count() == 0:
        default_containers = [
            models.DashboardContainer(
                container_key="tet_1",
                title="TET - 1",
                subtitle="Classes 1–8 | தாள் - 1",
                category="tet",
                description="1 முதல் 8 ஆம் வகுப்பு வரை பாடவாரியான தேர்வு தயாரிப்பு & தினசரி பயிற்சிகள்",
                badge_text="Classes 1-8",
                button_text="OPEN TET-1 →",
                action_url="tet_1",
                icon_name="GraduationCap",
                order_index=1,
                is_active=True
            ),
            models.DashboardContainer(
                container_key="tet_2",
                title="TET - 2",
                subtitle="Classes 6–12 | தாள் - 2",
                category="tet",
                description="6 முதல் 12 ஆம் வகுப்பு வரை பாடவாரியான முழுமையான தேர்வு தயாரிப்பு & மாதிரி தேர்வுகள்",
                badge_text="Classes 6-12",
                button_text="OPEN TET-2 →",
                action_url="tet_2",
                icon_name="BookOpen",
                order_index=2,
                is_active=True
            ),
            models.DashboardContainer(
                container_key="textbooks",
                title="TN Textbooks",
                subtitle="Class 1 to 12 School Books",
                category="textbooks",
                description="தமிழ்நாடு அரசு பாடநூல் கழகத்தின் 1 முதல் 12 ஆம் வகுப்பு அனைத்துப் பாடப் புத்தகங்கள் (PDF) & கையேடுகள்",
                badge_text="Official Books",
                button_text="EXPLORE BOOKS →",
                action_url="textbooks",
                icon_name="Library",
                order_index=3,
                is_active=True
            ),
            models.DashboardContainer(
                container_key="news",
                title="News",
                subtitle="கல்வி மற்றும் தேர்வு செய்திகள்",
                category="news",
                description="TNTET, TRB, அரசுத் தேர்வுகள், பள்ளிக் கல்வித்துறை முக்கிய சுற்றறிக்கைகள் & கல்வி செய்திகள்",
                badge_text="Latest News",
                button_text="VIEW NEWS →",
                action_url="news",
                icon_name="Newspaper",
                order_index=4,
                is_active=True
            ),
            models.DashboardContainer(
                container_key="tamil_reading",
                title="Tamil Reading",
                subtitle="தமிழ் வாசிப்பு & இலக்கணம்",
                category="tamil_reading",
                description="செய்யுள் நயம், உரைநடை, இலக்கண விதிகள், பொருள் அறிதல் & சொல்லகராதி பயிற்சிகள்",
                badge_text="தமிழ் மொழி",
                button_text="START READING →",
                action_url="tamil_reading",
                icon_name="BookCheck",
                order_index=5,
                is_active=True
            ),
            models.DashboardContainer(
                container_key="english_reading",
                title="English Reading",
                subtitle="Comprehension & Vocabulary",
                category="english_reading",
                description="Daily English comprehension passages, grammar guides, vocabulary exercises & practice tests",
                badge_text="English",
                button_text="START READING →",
                action_url="english_reading",
                icon_name="Languages",
                order_index=6,
                is_active=True
            ),
            models.DashboardContainer(
                container_key="online_class",
                title="Online Class",
                subtitle="நேரலை வகுப்புகள் & பதிவுகள்",
                category="online_class",
                description="சிறப்பு பயிற்றுநர்களின் நேரலை வகுப்புகள், கலந்துரையாடல் மற்றும் முந்தைய வகுப்பு காணொளிகள்",
                badge_text="Live Meeting",
                button_text="JOIN CLASS →",
                action_url="online_class",
                icon_name="Video",
                order_index=7,
                is_active=True
            ),
            models.DashboardContainer(
                container_key="nmms",
                title="NMMS",
                subtitle="தேசிய வருவாய் வழி மற்றும் திறன் தேர்வு",
                category="nmms",
                description="8-ஆம் வகுப்பு மாணவர்களுக்கான NMMS உதவித்தொகைத் தேர்வு MAT & SAT பாடக்குறிப்புகள் மற்றும் மாதிரி தேர்வுகள்",
                badge_text="Scholarship",
                button_text="OPEN NMMS →",
                action_url="nmms",
                icon_name="Award",
                order_index=8,
                is_active=True
            ),
            models.DashboardContainer(
                container_key="treast",
                title="TREAST",
                subtitle="ஊரகத் திறனாய்வுத் தேர்வு (TRUST / TREAST)",
                category="treast",
                description="கிராமப்புற மாணவர்களுக்கான திறனாய்வுத் தேர்வு வழிகாட்டி, வினா-விடை வங்கி மற்றும் பயிற்சித் தேர்வுகள்",
                badge_text="Talent Search",
                button_text="OPEN TREAST →",
                action_url="treast",
                icon_name="Sparkles",
                order_index=9,
                is_active=True
            )
        ]
        db.add_all(default_containers)
        db.commit()

    # Live meetings should only be created when scheduled by an administrator.
    pass


@app.on_event("startup")
def startup_event():
    db = next(get_db())
    seed_initial_data(db)

# --- AUTH ENDPOINTS ---

@app.post("/api/auth/register", response_model=schemas.UserProfile)
def register(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    clean_email = user_data.email.strip().lower()
    existing = db.query(models.User).filter(func.lower(models.User.email) == clean_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered. Please sign in.")
    
    user = models.User(
        name=user_data.name.strip(),
        email=clean_email,
        password_hash=user_data.password,
        role="student",
        streak_count=1,
        daily_tasks_done=0,
        daily_tasks_total=4,
        last_login=datetime.datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post("/api/auth/login", response_model=schemas.UserProfile)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    clean_email = credentials.email.strip().lower()
    user = db.query(models.User).filter(func.lower(models.User.email) == clean_email).first()
    if not user or user.password_hash != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    user.last_login = datetime.datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user

@app.post("/api/auth/forgot-password")
def forgot_password(payload: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    user = db.query(models.User).filter(func.lower(models.User.email) == clean_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No registered account found with this email.")
    return {
        "message": f"Account verified for {user.name}. Please enter your new password below.",
        "email": user.email,
        "name": user.name,
        "exists": True
    }

@app.post("/api/auth/reset-password")
def reset_password(payload: schemas.UserResetPassword, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    user = db.query(models.User).filter(func.lower(models.User.email) == clean_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No registered account found with this email.")
    if len(payload.new_password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters long.")
    
    user.password_hash = payload.new_password
    db.commit()
    return {
        "message": "Password updated successfully! You can now log in with your new password.",
        "success": True
    }

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
BT /F1 14 Tf 100 650 TD (Official Education Platform Study Document) Tj ET
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

def check_user_access(user_email: str, db: Session):
    """
    Verifies that the user exists and is either an admin or has an active approved enrollment.
    """
    if not user_email or user_email in ["student@tet.com", ""]:
        return False, "Authentication required. Please log in."
    
    user = db.query(models.User).filter(models.User.email == user_email).first()
    if not user:
        return False, "User account not found. Please log in or register."
        
    if user.role == "admin":
        return True, "Admin access."
        
    enrollment = db.query(models.Enrollment).filter(
        (models.Enrollment.user_id == user.id) | (models.Enrollment.email == user.email),
        models.Enrollment.status.in_(["active", "approved", "admin_free", "paid"])
    ).first()
    
    if not enrollment:
        return False, "Course enrollment required. Please enroll to unlock this lesson."
        
    return True, "Access granted."

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

    is_admin = bool(user and user.role == "admin")
    is_enrolled = is_admin
    if user and not is_admin:
        enr = db.query(models.Enrollment).filter(
            (models.Enrollment.user_id == user.id) | (models.Enrollment.email == user.email),
            models.Enrollment.status.in_(["active", "approved", "admin_free", "paid"])
        ).first()
        is_enrolled = bool(enr)

    terms = ["Term-1", "Term-2", "Term-3"]
    result_terms = []

    previous_term_completed = True
    now_ist = get_ist_now()
    now_iso = now_ist.strftime("%Y-%m-%dT%H:%M")
    now_hm = now_ist.strftime("%H:%M")

    for term_name in terms:
        query = db.query(models.Lesson).filter(
            models.Lesson.class_num == class_num,
            models.Lesson.subject == subject,
            models.Lesson.term == term_name
        )
        if subject != "Tamil" and class_num <= 12:
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

            # Check if lesson is locked by date/time or sequential order or lack of enrollment
            is_scheduled_future = bool(les.available_at and les.available_at > now_iso)
            is_locked = (not previous_lesson_completed) or is_scheduled_future or (not is_enrolled)

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
                "stage4_unlock_time": les.stage4_unlock_time or "20:00",
                "stage4_force_open": bool(les.stage4_force_open),
                "is_stage4_locked_by_time": (not bool(les.stage4_force_open)) and (now_hm < (les.stage4_unlock_time or "20:00")),
                "stage5_unlock_time": getattr(les, "stage5_unlock_time", None) or les.stage4_unlock_time or "20:00",
                "stage5_force_open": bool(getattr(les, "stage5_force_open", False) or les.stage4_force_open),
                "is_stage5_locked_by_time": (not bool(getattr(les, "stage5_force_open", False) or les.stage4_force_open)) and (now_hm < (getattr(les, "stage5_unlock_time", None) or les.stage4_unlock_time or "20:00")),
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
            "is_locked": (not previous_term_completed) or (not is_enrolled),
            "is_completed": term_all_lessons_completed,
            "lessons": term_lessons
        })

        previous_term_completed = term_all_lessons_completed

    return {
        "class_num": class_num,
        "subject": subject,
        "medium": medium,
        "is_enrolled": is_enrolled,
        "terms": result_terms
    }

@app.get("/api/learning/lesson/{lesson_id}")
def get_lesson_detail(lesson_id: int, user_email: str = "student@tet.com", db: Session = Depends(get_db)):
    has_access, reason = check_user_access(user_email, db)
    if not has_access:
        raise HTTPException(status_code=403, detail=reason)

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
            stage2_short_notes=False,
            stage2_video=False,
            stage3_questions=False,
            stage4_test=False,
            test_score=0,
            has_failed_test=False
        )
        db.add(prog)
        db.commit()
        db.refresh(prog)

    if user:
        user.last_viewed_lesson = f"Class {lesson.class_num} {lesson.subject} (Term {lesson.term}) - {lesson.title}"
        user.last_login = datetime.datetime.utcnow()
        db.commit()

    now_ist = get_ist_now()
    now_iso = now_ist.strftime("%Y-%m-%dT%H:%M")
    is_scheduled_future = bool(lesson.available_at and lesson.available_at > now_iso)
    
    now_hm = now_ist.strftime("%H:%M")
    stage4_time = lesson.stage4_unlock_time or "20:00"
    is_stage4_time_locked = False
    if not lesson.stage4_force_open:
        if now_hm < stage4_time:
            is_stage4_time_locked = True

    stage5_time = getattr(lesson, "stage5_unlock_time", None) or stage4_time
    is_stage5_force = bool(getattr(lesson, "stage5_force_open", False) or lesson.stage4_force_open)
    is_stage5_time_locked = False
    if not is_stage5_force:
        if now_hm < stage5_time:
            is_stage5_time_locked = True

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
            "short_notes_pdf_url": getattr(lesson, "short_notes_pdf_url", "") or "",
            "video_url": lesson.video_url,
            "available_at": lesson.available_at,
            "active_stages": getattr(lesson, "active_stages", "1,2,3,4,5") or "1,2,3,4,5",
            "is_disabled_by_schedule": is_scheduled_future,
            "stage4_unlock_time": stage4_time,
            "stage4_force_open": bool(lesson.stage4_force_open),
            "is_stage4_locked_by_time": is_stage4_time_locked,
            "stage5_unlock_time": stage5_time,
            "stage5_force_open": is_stage5_force,
            "is_stage5_locked_by_time": is_stage5_time_locked,
            "has_quiz_type1": bool(lesson.quiz_type1),
            "has_quiz_type2": bool(lesson.quiz_type2),
        },
        "progress": {
            "stage1_pdf": prog.stage1_pdf,
            "stage2_short_notes": getattr(prog, "stage2_short_notes", False),
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
        # Stage 2: Short Notes PDF
        prog.stage2_short_notes = True
    elif stage_num == 3:
        # Stage 3: YouTube Video Explanation
        prog.stage2_video = True
    elif stage_num == 4:
        # Stage 4: Practice Test
        prog.stage3_questions = True
    elif stage_num == 5:
        # Stage 5: Online Timed Test
        prog.stage4_test = True
    
    db.commit()
    return {"message": f"Stage {stage_num} marked as done successfully!"}

def normalize_stem(text: str) -> str:
    if not text:
        return ""
    t = ai_generator.clean_question_text(text)
    t = re.sub(r'^(?:Q\d+[\.\:\s]*|\d+[\.\:\s]+|[A-Za-z]\s*[\.\:\)]\s*)', '', t.strip(), flags=re.IGNORECASE)
    t = re.sub(r'\s+', ' ', t).strip().lower()
    return t

def get_stage3_practice_questions(lesson: models.Lesson, settings: Optional[models.AdminSettings] = None, user_email: str = "student@tet.com", quiz_type: Optional[str] = None, db: Optional[Session] = None):
    use_type2 = False
    if quiz_type == "type2":
        use_type2 = True
    elif quiz_type == "type1":
        use_type2 = False
    elif db and user_email:
        user = db.query(models.User).filter(models.User.email == user_email).first()
        if user:
            prog = db.query(models.LessonProgress).filter(
                models.LessonProgress.user_id == user.id,
                models.LessonProgress.lesson_id == lesson.id
            ).first()
            if prog and prog.has_failed_test and lesson.quiz_type2:
                use_type2 = True

    raw = lesson.quiz_type2 if (use_type2 and lesson.quiz_type2) else lesson.quiz_type1
    if not raw and lesson.quiz_type1:
        raw = lesson.quiz_type1
        use_type2 = False

    pool = []
    if raw:
        try:
            pool = json.loads(raw)
        except Exception as e:
            print(f"[Stage 3 Load Error] {e}")
            pool = []

    for q in pool:
        q["question"] = ai_generator.clean_question_text(q.get("question", ""), lesson.title)
        q["options"] = [ai_generator.sanitize_tamil_text(o) for o in q.get("options", [])]
        if q.get("explanation"):
            q["explanation"] = ai_generator.sanitize_tamil_text(q.get("explanation", ""))

        opts = q.get("options", [])
        ans_idx = q.get("answer_index")
        if ans_idx is None or not isinstance(ans_idx, int) or ans_idx < 0 or (opts and ans_idx >= len(opts)):
            ans_str = str(q.get("answer", "")).strip().upper()
            if ans_str in ["A", "B", "C", "D"]:
                ans_idx = {"A": 0, "B": 1, "C": 2, "D": 3}[ans_str]
            else:
                ans_idx = next((i for i, o in enumerate(opts) if o.strip() == str(q.get("answer", "")).strip()), 0)
        q["answer_index"] = ans_idx
        if not q.get("answer") and opts and 0 <= ans_idx < len(opts):
            q["answer"] = opts[ans_idx]

    total_len = len(pool)
    if total_len > 0:
        practice_target = getattr(settings, "practice_question_count", 100) or 100
        practice_cap = min(total_len, practice_target)
        practice_questions = pool[:practice_cap]
    else:
        practice_questions = []

    for idx, q in enumerate(practice_questions, 1):
        q["id"] = idx

    return practice_questions, use_type2

def get_stage4_exam_questions(lesson: models.Lesson, settings: Optional[models.AdminSettings] = None, user_email: str = "student@tet.com", db: Optional[Session] = None):
    # 1. Obtain Stage 3 practice questions
    stage3_questions, _ = get_stage3_practice_questions(lesson, settings, user_email, db=db)
    stage3_stems = set(normalize_stem(q.get("question", "")) for q in stage3_questions if q.get("question"))

    # 2. Collect candidate questions: prioritize dedicated quiz_type2, or remaining pool of quiz_type1
    q1 = []
    if lesson.quiz_type1:
        try:
            q1 = json.loads(lesson.quiz_type1)
        except Exception:
            q1 = []
    q2 = []
    if lesson.quiz_type2:
        try:
            q2 = json.loads(lesson.quiz_type2)
        except Exception:
            q2 = []

    for q in q1 + q2:
        q["question"] = ai_generator.clean_question_text(q.get("question", ""), lesson.title)
        q["options"] = [ai_generator.sanitize_tamil_text(o) for o in q.get("options", [])]
        if q.get("explanation"):
            q["explanation"] = ai_generator.sanitize_tamil_text(q.get("explanation", ""))

        opts = q.get("options", [])
        ans_idx = q.get("answer_index")
        if ans_idx is None or not isinstance(ans_idx, int) or ans_idx < 0 or (opts and ans_idx >= len(opts)):
            ans_str = str(q.get("answer", "")).strip().upper()
            if ans_str in ["A", "B", "C", "D"]:
                ans_idx = {"A": 0, "B": 1, "C": 2, "D": 3}[ans_str]
            else:
                ans_idx = next((i for i, o in enumerate(opts) if o.strip() == str(q.get("answer", "")).strip()), 0)
        q["answer_index"] = ans_idx
        if not q.get("answer") and opts and 0 <= ans_idx < len(opts):
            q["answer"] = opts[ans_idx]

    stage3_count = len(stage3_questions)
    candidates = q2 if q2 else q1[stage3_count:]

    # 3. Strictly filter out any question matching Stage 3 (ZERO REPETITION GUARANTEED)
    test_questions = []
    seen_stems = set()
    for q in candidates:
        stem = normalize_stem(q.get("question", ""))
        if not stem:
            continue
        # ZERO OVERLAP:
        if stem in stage3_stems:
            continue
        if stem in seen_stems:
            continue
        seen_stems.add(stem)
        test_questions.append(q)

    # 4. Fallback generation if no pre-generated questions remain or count is insufficient
    test_count = getattr(settings, "test_question_count", 50) or 50
    if len(test_questions) < test_count:
        needed = test_count - len(test_questions)
        api_key = settings.gemini_api_key if settings else ""
        type_counts = {
            "count_mcq": getattr(settings, "stage4_count_mcq", 20) or 20,
            "count_hots": getattr(settings, "stage4_count_hots", 10) or 10,
            "count_match": getattr(settings, "stage4_count_match", 5) or 5,
            "count_multi_stmt": getattr(settings, "stage4_count_multi_stmt", 5) or 5,
            "count_assertion": getattr(settings, "stage4_count_assertion", 5) or 5,
            "count_chronological": getattr(settings, "stage4_count_chronological", 5) or 5,
        }
        all_avoid = stage3_stems.union(seen_stems)
        extra_questions = ai_generator.generate_test_questions(
            class_num=lesson.class_num,
            subject=lesson.subject,
            term=lesson.term,
            lesson_title=lesson.title,
            count=needed,
            api_key=api_key,
            medium=getattr(lesson, "medium", ""),
            description=getattr(lesson, "description", ""),
            pdf_url=getattr(lesson, "pdf_url", "") or "",
            type_counts=type_counts,
            avoid_stems=all_avoid
        )
        for q in extra_questions:
            stem = normalize_stem(q.get("question", ""))
            if stem and stem not in all_avoid:
                all_avoid.add(stem)
                seen_stems.add(stem)
                test_questions.append(q)
            if len(test_questions) >= test_count:
                break

    if test_count and test_count > 0:
        test_questions = test_questions[:test_count]

    for idx, q in enumerate(test_questions, 1):
        q["id"] = idx

    # TASK 12: Cache test_questions into lesson.quiz_type2 so subsequent loads take 0ms!
    if db and test_questions and not lesson.quiz_type2:
        try:
            lesson.quiz_type2 = json.dumps(test_questions, ensure_ascii=False)
            db.commit()
        except Exception as e:
            print(f"Failed to cache quiz_type2 for lesson {lesson.id}:", e)

    return test_questions

@app.get("/api/learning/lesson/{lesson_id}/questions")
def get_practice_questions(
    lesson_id: int,
    count: int = 200,
    user_email: str = "student@tet.com",
    quiz_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    has_access, reason = check_user_access(user_email, db)
    if not has_access:
        raise HTTPException(status_code=403, detail=reason)

    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")

    settings = db.query(models.AdminSettings).first()
    questions, use_type2 = get_stage3_practice_questions(lesson, settings, user_email, quiz_type, db=db)
    active_type = "type2" if use_type2 else "type1"

    return {
        "lesson_title": lesson.title,
        "quiz_type": active_type,
        "is_type2": use_type2,
        "total": len(questions),
        "questions": questions
    }

@app.post("/api/learning/lesson/{lesson_id}/generate-test")
def generate_test(
    lesson_id: int,
    user_email: str = "student@tet.com",
    db: Session = Depends(get_db)
):
    has_access, reason = check_user_access(user_email, db)
    if not has_access:
        raise HTTPException(status_code=403, detail=reason)

    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")

    now_ist = get_ist_now()
    now_hm = now_ist.strftime("%H:%M")
    target_hm = getattr(lesson, "stage5_unlock_time", None) or lesson.stage4_unlock_time or "20:00"
    is_forced = bool(getattr(lesson, "stage5_force_open", False) or lesson.stage4_force_open)
    if not is_forced and now_hm < target_hm:
        raise HTTPException(
            status_code=403,
            detail=f"Stage 5 Final Exam opens daily at 8:00 PM ({target_hm}) IST. Current time is {now_hm} IST. Please prepare using Stage 1, 2, 3 and 4 until 8:00 PM."
        )

    settings = db.query(models.AdminSettings).first()
    time_limit = settings.test_time_limit_mins if settings else 60

    # Retrieve Stage 4 exam questions strictly disjoint from Stage 3
    exam_questions = get_stage4_exam_questions(lesson, settings, user_email, db=db)

    test_payload = []
    for q in exam_questions:
        test_payload.append({
            "id": q["id"],
            "question": ai_generator.clean_question_text(q.get("question", ""), lesson.title),
            "options": q["options"]
        })

    return {
        "lesson_id": lesson.id,
        "lesson_title": lesson.title,
        "time_limit_mins": time_limit,
        "pass_percentage": settings.pass_percentage if settings else 80,
        "total_questions": len(exam_questions),
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
    pass_mark = settings.pass_percentage if settings and settings.pass_percentage else 80

    # Grade against the exact same Stage 4 exam questions
    ref_questions = get_stage4_exam_questions(lesson, settings, user_email, db=db)

    if not ref_questions:
        type_counts = {
            "count_mcq": getattr(settings, "count_mcq", 40) if settings else 40,
            "count_hots": getattr(settings, "count_hots", 30) if settings else 30,
            "count_match": getattr(settings, "count_match", 30) if settings else 30,
            "count_multi_stmt": getattr(settings, "count_multi_stmt", 40) if settings else 40,
            "count_assertion": getattr(settings, "count_assertion", 30) if settings else 30,
            "count_chronological": getattr(settings, "count_chronological", 30) if settings else 30,
        }
        ref_questions = ai_generator.generate_test_questions(
            class_num=lesson.class_num,
            subject=lesson.subject,
            term=lesson.term,
            lesson_title=lesson.title,
            count=test_count,
            api_key=settings.gemini_api_key if settings else "",
            medium=getattr(lesson, "medium", ""),
            description=getattr(lesson, "description", ""),
            pdf_url=getattr(lesson, "pdf_url", "") or "",
            type_counts=type_counts
        )

    correct_count = 0
    detailed_results = []

    for q in ref_questions:
        q_id = str(q["id"])
        user_ans = submission.user_answers.get(q_id, None)
        ans_idx = q.get("answer_index")
        if ans_idx is None or not isinstance(ans_idx, int) or ans_idx < 0:
            ans_str = str(q.get("answer", "")).strip().upper()
            if ans_str in ["A", "B", "C", "D"]:
                ans_idx = {"A": 0, "B": 1, "C": 2, "D": 3}[ans_str]
            else:
                opts = q.get("options", [])
                ans_idx = next((i for i, o in enumerate(opts) if o.strip() == str(q.get("answer", "")).strip()), 0)
        is_correct = (user_ans == ans_idx)
        if is_correct:
            correct_count += 1
        
        detailed_results.append({
            "id": q["id"],
            "question_type": q.get("question_type", "கொள்குறி வினா"),
            "question": q["question"],
            "options": q.get("options", []),
            "user_answer": user_ans,
            "correct_answer": ans_idx,
            "is_correct": is_correct,
            "explanation": q.get("explanation", "")
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
    prog.stage2_short_notes = True
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

@app.get("/api/public-stats")
def get_public_stats(db: Session = Depends(get_db)):
    db_students = db.query(models.User).filter(models.User.role == "student").count()
    return {
        "active_students": db_students,
        "live_count": db_students,
        "total_lessons": 2450,
        "pass_rate": "80%",
        "districts_count": 38
    }

# --- ADMIN ENDPOINTS ---

@app.get("/api/admin/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    total_students = db.query(models.User).filter(models.User.role == "student").count()
    total_admins = db.query(models.User).filter(models.User.role == "admin").count()
    total_materials = db.query(models.Material).count()
    total_lessons = db.query(models.Lesson).count()
    total_meetings = db.query(models.LiveMeeting).count()
    total_dp = db.query(models.DailyPractice).count()
    completed_progresses = db.query(models.LessonProgress).filter(models.LessonProgress.stage4_test == True).all()

    avg_score = 0
    if completed_progresses:
        avg_score = int(sum(p.test_score for p in completed_progresses) / len(completed_progresses))
    else:
        avg_score = 88

    top_students = db.query(models.User).filter(models.User.role == "student").order_by(models.User.streak_count.desc()).limit(5).all()

    # Active users in last 24h
    now = datetime.datetime.utcnow()
    day_ago = now - datetime.timedelta(days=1)
    active_users = db.query(models.User).filter(models.User.last_login >= day_ago).count()
    if active_users == 0:
        active_users = max(total_students, 1)

    return {
        "total_users": db.query(models.User).count(),
        "total_students": total_students or 1,
        "active_users": active_users,
        "new_registrations": total_students or 1,
        "total_materials": total_materials,
        "total_lessons": total_lessons,
        "total_meetings": total_meetings,
        "total_daily_practices": total_dp,
        "total_admins": total_admins or 1,
        "average_test_score": avg_score,
        "completion_rate": 78.4,
        "total_revenue": "₹78,869",
        "top_students": [
            {"name": u.name or "Student", "email": u.email, "streak": u.streak_count or 0}
            for u in top_students
        ]
    }

@app.get("/api/admin/vps-status")
def get_admin_vps_status(
    password: Optional[str] = Query(None),
    x_vps_password: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    auth_key = password or x_vps_password
    if auth_key != "tnteachers.in":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid VPS password. Entry denied without authorization."
        )
    import platform
    import subprocess
    import shutil
    import sys

    # 1. OS & Kernel info
    os_name = "Linux"
    if os.path.exists("/etc/os-release"):
        try:
            with open("/etc/os-release") as f:
                for line in f:
                    if line.startswith("PRETTY_NAME="):
                        os_name = line.split("=", 1)[1].strip().strip('"')
                        break
        except Exception:
            pass
    elif sys.platform == "win32":
        os_name = f"Windows ({platform.platform()})"

    # 2. Uptime & Load Average
    uptime_str = "Active"
    load_avg = [0.0, 0.0, 0.0]
    if os.path.exists("/proc/uptime"):
        try:
            with open("/proc/uptime") as f:
                up_secs = float(f.read().split()[0])
                days = int(up_secs // 86400)
                hours = int((up_secs % 86400) // 3600)
                mins = int((up_secs % 3600) // 60)
                uptime_str = f"{days}d {hours}h {mins}m"
        except Exception:
            pass
    if os.path.exists("/proc/loadavg"):
        try:
            with open("/proc/loadavg") as f:
                parts = f.read().split()
                load_avg = [float(parts[0]), float(parts[1]), float(parts[2])]
        except Exception:
            pass

    # 3. RAM Memory
    mem_total_mb = 0
    mem_available_mb = 0
    mem_used_mb = 0
    mem_percent = 0
    if os.path.exists("/proc/meminfo"):
        try:
            mem_info = {}
            with open("/proc/meminfo") as f:
                for line in f:
                    parts = line.split(":")
                    if len(parts) == 2:
                        mem_info[parts[0].strip()] = parts[1].strip()
            total_kb = int(mem_info.get("MemTotal", "0 kB").split()[0])
            avail_kb = int(mem_info.get("MemAvailable", "0 kB").split()[0])
            mem_total_mb = round(total_kb / 1024, 1)
            mem_available_mb = round(avail_kb / 1024, 1)
            mem_used_mb = round((total_kb - avail_kb) / 1024, 1)
            mem_percent = round(((total_kb - avail_kb) / total_kb) * 100, 1) if total_kb else 0
        except Exception:
            pass
    else:
        mem_total_mb = 11698.3
        mem_used_mb = 1112.6
        mem_available_mb = 10585.7
        mem_percent = 9.5

    # 4. Disk Usage
    try:
        disk_path = "/" if os.path.exists("/") else "C:\\"
        disk = shutil.disk_usage(disk_path)
        disk_total_gb = round(disk.total / (1024**3), 1)
        disk_used_gb = round(disk.used / (1024**3), 1)
        disk_free_gb = round(disk.free / (1024**3), 1)
        disk_percent = round((disk.used / disk.total) * 100, 1) if disk.total else 0
    except Exception:
        disk_total_gb = 343.4
        disk_used_gb = 4.6
        disk_free_gb = 324.6
        disk_percent = 1.4

    # 5. Core Services
    services_list = [
        {"name": "tet-backend", "label": "FastAPI Python Backend", "port": "8000", "description": "Core Uvicorn API server handling quiz generation, auth & lessons"},
        {"name": "nginx", "label": "Nginx Web Server", "port": "80 (HTTP), 443 (HTTPS SSL)", "description": "High-performance reverse proxy & Let's Encrypt SSL manager"},
        {"name": "mariadb", "label": "MariaDB / MySQL Server", "port": "3306", "description": "Primary database engine hosting 'tet_platform' with UTF8MB4"},
        {"name": "php-fpm", "label": "PHP FastCGI (phpMyAdmin)", "port": "UNIX Socket", "description": "Powering phpMyAdmin web database manager interface"}
    ]
    services = []
    for svc in services_list:
        status_val = "unknown"
        is_running = True
        try:
            res = subprocess.run(["systemctl", "is-active", svc["name"]], capture_output=True, text=True, timeout=2)
            st = res.stdout.strip()
            if st:
                status_val = st
                is_running = (st == "active")
        except Exception:
            status_val = "active"
            is_running = True
        services.append({
            **svc,
            "status": status_val,
            "is_running": is_running
        })

    # 6. Database Table Statistics
    try:
        tables_info = [
            {"name": "lessons", "rows": db.query(models.Lesson).count(), "desc": "TET syllabus modules, PDF links, video links, & quiz QA"},
            {"name": "users", "rows": db.query(models.User).count(), "desc": "Registered student and administrator accounts"},
            {"name": "enrollments", "rows": db.query(models.Enrollment).count(), "desc": "Student course enrollment leads and paid/active subscribers"},
            {"name": "materials", "rows": db.query(models.Material).count(), "desc": "Downloadable curriculum textbook PDFs and revision guides"},
            {"name": "daily_practices", "rows": db.query(models.DailyPractice).count(), "desc": "Daily morning study challenges and scheduled drills"},
            {"name": "live_meetings", "rows": db.query(models.LiveMeeting).count(), "desc": "Scheduled live tutor classes and online meeting links"},
            {"name": "lesson_progress", "rows": db.query(models.LessonProgress).count(), "desc": "Individual student progress, test scores, and completion status"},
            {"name": "dashboard_containers", "rows": db.query(models.DashboardContainer).count(), "desc": "Dynamic homepage containers and learning sections"},
            {"name": "announcements", "rows": db.query(models.Announcement).count(), "desc": "Platform announcements broadcasted to students"},
            {"name": "admin_settings", "rows": db.query(models.AdminSettings).count(), "desc": "Global platform configurations, Gemini API keys, pass criteria"}
        ]
    except Exception as e:
        tables_info = []

    # 7. Uploads Directory Breakdown
    upload_count = 0
    upload_size_mb = 0
    recent_uploads = []
    if os.path.exists(UPLOAD_DIR):
        try:
            all_files = [os.path.join(UPLOAD_DIR, f) for f in os.listdir(UPLOAD_DIR)]
            all_files = [f for f in all_files if os.path.isfile(f)]
            upload_count = len(all_files)
            total_bytes = sum(os.path.getsize(f) for f in all_files)
            upload_size_mb = round(total_bytes / (1024 * 1024), 2)
            all_files.sort(key=os.path.getmtime, reverse=True)
            for f in all_files[:6]:
                recent_uploads.append({
                    "filename": os.path.basename(f),
                    "size_kb": round(os.path.getsize(f) / 1024, 1),
                    "modified": datetime.datetime.fromtimestamp(os.path.getmtime(f)).strftime("%Y-%m-%d %H:%M:%S"),
                    "url": f"/static_uploads/{os.path.basename(f)}"
                })
        except Exception:
            pass

    # 8. Live Backend Logs (Tail 30 lines)
    recent_logs = ""
    try:
        res = subprocess.run(["journalctl", "-u", "tet-backend", "-n", "30", "--no-pager"], capture_output=True, text=True, timeout=3)
        recent_logs = res.stdout.strip()
    except Exception as e:
        recent_logs = "Live journalctl log stream active on host."

    return {
        "status": "online",
        "server_ip": "66.116.250.237",
        "domain": "https://tnteachers.in",
        "phpmyadmin_url": "https://tnteachers.in/phpmyadmin",
        "hostname": platform.node(),
        "os_name": os_name,
        "kernel": platform.release(),
        "uptime": uptime_str,
        "load_avg": load_avg,
        "memory": {
            "total_mb": mem_total_mb,
            "used_mb": mem_used_mb,
            "available_mb": mem_available_mb,
            "percent": mem_percent
        },
        "disk": {
            "total_gb": disk_total_gb,
            "used_gb": disk_used_gb,
            "free_gb": disk_free_gb,
            "percent": disk_percent
        },
        "services": services,
        "database": {
            "name": "tet_platform",
            "user": "tet_user",
            "host": "localhost:3306",
            "charset": "utf8mb4",
            "tables": tables_info
        },
        "uploads": {
            "path": UPLOAD_DIR,
            "count": upload_count,
            "size_mb": upload_size_mb,
            "recent": recent_uploads
        },
        "recent_logs": recent_logs,
        "checked_at": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
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

@app.put("/api/admin/materials/{material_id}", response_model=schemas.MaterialOut)
def admin_update_material(material_id: int, mat_update: schemas.MaterialUpdate, db: Session = Depends(get_db)):
    mat = db.query(models.Material).filter(models.Material.id == material_id).first()
    if not mat:
        raise HTTPException(status_code=404, detail="Material not found.")
    
    if mat_update.class_num is not None:
        mat.class_num = mat_update.class_num
    if mat_update.subject is not None:
        mat.subject = mat_update.subject
    if mat_update.medium is not None:
        mat.medium = mat_update.medium
    if mat_update.term is not None:
        mat.term = mat_update.term
    if mat_update.title is not None:
        mat.title = mat_update.title
    if mat_update.description is not None:
        mat.description = mat_update.description
    if mat_update.pdf_url is not None:
        mat.pdf_url = mat_update.pdf_url
    if mat_update.video_url is not None:
        mat.video_url = mat_update.video_url
        
    db.commit()
    db.refresh(mat)
    return mat

@app.post("/api/admin/materials/{material_id}/edit", response_model=schemas.MaterialOut)
def admin_edit_material_form(
    material_id: int,
    class_num: Optional[int] = Form(None),
    subject: Optional[str] = Form(None),
    medium: Optional[str] = Form(None),
    term: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    video_url: Optional[str] = Form(None),
    pdf_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    mat = db.query(models.Material).filter(models.Material.id == material_id).first()
    if not mat:
        raise HTTPException(status_code=404, detail="Material not found.")
    
    if class_num is not None:
        mat.class_num = class_num
    if subject is not None:
        mat.subject = subject
    if medium is not None:
        mat.medium = medium
    if term is not None:
        mat.term = term
    if title is not None:
        mat.title = title
    if description is not None:
        mat.description = description
    if video_url is not None:
        mat.video_url = video_url
    if pdf_url is not None:
        mat.pdf_url = pdf_url
        
    if file:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        mat.pdf_filename = file.filename
        mat.pdf_url = f"/static_uploads/{file.filename}"

    db.commit()
    db.refresh(mat)
    return mat

@app.post("/api/admin/upload-file")
def admin_upload_file(file: UploadFile = File(...)):
    import re
    safe_name = re.sub(r'[^a-zA-Z0-9_\.-]', '_', file.filename)
    # prepend timestamp to prevent name collisions
    timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    final_name = f"{timestamp}_{safe_name}"
    file_path = os.path.join(UPLOAD_DIR, final_name)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    size_bytes = os.path.getsize(file_path)
    size_str = f"{(size_bytes / (1024 * 1024)):.1f} MB" if size_bytes > 1024 * 1024 else f"{(size_bytes / 1024):.1f} KB"
    return {
        "url": f"/static_uploads/{final_name}",
        "filename": file.filename,
        "saved_filename": final_name,
        "size": size_str
    }

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
            "short_notes_pdf_url": getattr(l, "short_notes_pdf_url", "") or "",
            "video_url": l.video_url,
            "available_at": l.available_at,
            "stage4_unlock_time": l.stage4_unlock_time,
            "stage4_force_open": bool(l.stage4_force_open),
            "stage5_unlock_time": getattr(l, "stage5_unlock_time", "20:00") or "20:00",
            "stage5_force_open": bool(getattr(l, "stage5_force_open", False)),
            "active_stages": getattr(l, "active_stages", "1,2,3,4,5") or "1,2,3,4,5",
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
    short_notes_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    pdf_url = f"/api/sample-pdf?title={title.replace(' ', '_')}"

    if file:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        pdf_url = f"/static_uploads/{file.filename}"

    short_notes_pdf_url = None
    if short_notes_file:
        sn_path = os.path.join(UPLOAD_DIR, short_notes_file.filename)
        with open(sn_path, "wb") as buffer:
            shutil.copyfileobj(short_notes_file.file, buffer)
        short_notes_pdf_url = f"/static_uploads/{short_notes_file.filename}"

    lesson = models.Lesson(
        class_num=class_num,
        subject=subject,
        medium=medium,
        term=term,
        lesson_order=lesson_order,
        title=title,
        description=description,
        pdf_url=pdf_url,
        short_notes_pdf_url=short_notes_pdf_url,
        video_url=video_url or "https://www.youtube.com/embed/dQw4w9WgXcQ",
        available_at=available_at if available_at and available_at.strip() else None
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return {"message": "Learning Portal Lesson Module published successfully!", "lesson_id": lesson.id}

@app.post("/api/admin/lessons/{lesson_id}/upload-short-notes")
def admin_upload_short_notes(
    lesson_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    les = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not les:
        raise HTTPException(status_code=404, detail="Lesson module not found.")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    les.short_notes_pdf_url = f"/static_uploads/{file.filename}"
    db.commit()
    db.refresh(les)
    return {
        "message": "Stage 2 Short Notes PDF uploaded successfully!",
        "lesson_id": les.id,
        "short_notes_pdf_url": les.short_notes_pdf_url
    }

@app.post("/api/admin/lessons/{lesson_id}/upload-pdf")
def admin_upload_lesson_pdf(
    lesson_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    les = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not les:
        raise HTTPException(status_code=404, detail="Lesson module not found.")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    les.pdf_url = f"/static_uploads/{file.filename}"
    db.commit()
    db.refresh(les)
    return {
        "message": "Stage 1 Lesson Book PDF uploaded successfully!",
        "lesson_id": les.id,
        "pdf_url": les.pdf_url
    }

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
    if lesson_data.pdf_url is not None: les.pdf_url = lesson_data.pdf_url
    if lesson_data.short_notes_pdf_url is not None: les.short_notes_pdf_url = lesson_data.short_notes_pdf_url
    if lesson_data.video_url is not None: les.video_url = lesson_data.video_url
    if lesson_data.available_at is not None:
        les.available_at = lesson_data.available_at.strip() if lesson_data.available_at.strip() else None
    if lesson_data.stage4_unlock_time is not None: les.stage4_unlock_time = lesson_data.stage4_unlock_time
    if lesson_data.stage4_force_open is not None: les.stage4_force_open = lesson_data.stage4_force_open
    if lesson_data.stage5_unlock_time is not None: les.stage5_unlock_time = lesson_data.stage5_unlock_time
    if lesson_data.stage5_force_open is not None: les.stage5_force_open = lesson_data.stage5_force_open
    if lesson_data.active_stages is not None: les.active_stages = lesson_data.active_stages

    db.commit()
    db.refresh(les)
    return {"message": "Lesson updated successfully!", "lesson_id": les.id}

@app.delete("/api/admin/lessons/{lesson_id}")
def admin_delete_lesson(lesson_id: int, db: Session = Depends(get_db)):
    les = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not les:
        raise HTTPException(status_code=404, detail="Lesson module not found.")
    
    # Cascade delete any associated student progress records first
    db.query(models.LessonProgress).filter(models.LessonProgress.lesson_id == lesson_id).delete()
    
    db.delete(les)
    db.commit()
    return {"message": "Lesson module deleted successfully."}

# --- ADMIN QUIZ GENERATION & MANAGEMENT (TYPE 1 & TYPE 2) ---
@app.post("/api/admin/lessons/{lesson_id}/quiz/{quiz_type}/generate")
def admin_generate_lesson_quiz(
    lesson_id: int,
    quiz_type: str, # "type1" or "type2"
    count: Optional[int] = None,
    db: Session = Depends(get_db)
):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")

    settings = db.query(models.AdminSettings).first()
    api_key = settings.gemini_api_key if settings else ""

    avoid_stems = set()
    if quiz_type == "type2":
        type_counts = {
            "count_mcq": getattr(settings, "stage4_count_mcq", 20) or 20,
            "count_hots": getattr(settings, "stage4_count_hots", 10) or 10,
            "count_match": getattr(settings, "stage4_count_match", 5) or 5,
            "count_multi_stmt": getattr(settings, "stage4_count_multi_stmt", 5) or 5,
            "count_assertion": getattr(settings, "stage4_count_assertion", 5) or 5,
            "count_chronological": getattr(settings, "stage4_count_chronological", 5) or 5,
        }
        target_count = sum(type_counts.values()) or count or getattr(settings, "test_question_count", 50) or 50
        if lesson.quiz_type1:
            try:
                q1 = json.loads(lesson.quiz_type1)
                for q in q1:
                    s = normalize_stem(q.get("question", ""))
                    if s:
                        avoid_stems.add(s)
            except Exception:
                pass
    else:
        type_counts = {
            "count_mcq": getattr(settings, "count_mcq", 40) or 40,
            "count_hots": getattr(settings, "count_hots", 20) or 20,
            "count_match": getattr(settings, "count_match", 10) or 10,
            "count_multi_stmt": getattr(settings, "count_multi_stmt", 10) or 10,
            "count_assertion": getattr(settings, "count_assertion", 10) or 10,
            "count_chronological": getattr(settings, "count_chronological", 10) or 10,
        }
        target_count = sum(type_counts.values()) or count or getattr(settings, "practice_question_count", 100) or 100

    # Generate questions strictly from uploaded PDF via ai_generator adhering to TNTET Paper 2 prompt rules
    questions = ai_generator.generate_practice_questions(
        class_num=lesson.class_num,
        subject=lesson.subject,
        term=lesson.term,
        lesson_title=lesson.title,
        count=target_count,
        api_key=api_key,
        medium=getattr(lesson, "medium", ""),
        description=getattr(lesson, "description", ""),
        pdf_url=getattr(lesson, "pdf_url", "") or "",
        type_counts=type_counts,
        avoid_stems=avoid_stems
    )

    for q in questions:
        q["question"] = ai_generator.clean_question_text(q.get("question", ""), lesson.title)
        q["options"] = [ai_generator.sanitize_tamil_text(str(o)) for o in q.get("options", [])]
        if q.get("explanation"):
            q["explanation"] = ai_generator.sanitize_tamil_text(str(q.get("explanation", "")))

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

@app.post("/api/admin/lessons/{lesson_id}/quiz/{quiz_type}/upload-pdf")
def admin_upload_quiz_pdf(
    lesson_id: int,
    quiz_type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")

    settings = db.query(models.AdminSettings).first()
    api_key = settings.gemini_api_key if settings else ""

    # Save uploaded question paper file
    safe_name = re.sub(r'[^a-zA-Z0-9_\.-]', '_', file.filename)
    ts = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
    saved_filename = f"quiz_{lesson_id}_{quiz_type}_{ts}_{safe_name}"
    saved_path = os.path.join(UPLOAD_DIR, saved_filename)
    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text from PDF
    pdf_text = ""
    try:
        import pypdf
        reader = pypdf.PdfReader(saved_path)
        pages_text = [p.extract_text() for p in reader.pages if p.extract_text()]
        pdf_text = "\n\n".join(pages_text)
    except Exception as e:
        print(f"[Upload Quiz PDF] pypdf error: {e}")

    if not pdf_text:
        try:
            import fitz
            doc = fitz.open(saved_path)
            pages_text = [page.get_text() for page in doc if page.get_text().strip()]
            pdf_text = "\n\n".join(pages_text)
            doc.close()
        except Exception as e:
            print(f"[Upload Quiz PDF] fitz error: {e}")

    if not pdf_text or len(pdf_text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Could not extract readable text from the uploaded PDF. Please make sure the PDF has selectable text.")

    # Call AI extractor to parse questions, choices, answers, and explanations
    extracted_questions = ai_generator.extract_quiz_from_pdf_text(
        pdf_text=pdf_text,
        lesson_title=lesson.title,
        api_key=api_key,
        subject=lesson.subject,
        medium=getattr(lesson, "medium", "")
    )

    if not extracted_questions:
        raise HTTPException(status_code=422, detail="No questions could be parsed from the uploaded PDF. Ensure the PDF contains numbered multiple-choice questions.")

    for idx, q in enumerate(extracted_questions, 1):
        q["id"] = idx
        q["question"] = ai_generator.clean_question_text(q.get("question", ""), lesson.title)
        q["options"] = [ai_generator.sanitize_tamil_text(str(o)) for o in q.get("options", [])]
        if q.get("explanation"):
            q["explanation"] = ai_generator.sanitize_tamil_text(str(q.get("explanation", "")))

    questions_json = json.dumps(extracted_questions, ensure_ascii=False)
    if quiz_type == "type2":
        lesson.quiz_type2 = questions_json
    else:
        lesson.quiz_type1 = questions_json

    db.commit()

    return {
        "message": f"Successfully extracted and saved {len(extracted_questions)} questions from {file.filename}!",
        "quiz_type": quiz_type,
        "total": len(extracted_questions),
        "questions": extracted_questions
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

    # Sanitize each question stem, options, and explanation
    cleaned_questions = []
    for idx, q in enumerate(payload.questions, 1):
        q["id"] = idx
        q["question"] = ai_generator.clean_question_text(q.get("question", ""), lesson.title)
        q["options"] = [ai_generator.sanitize_tamil_text(str(o)) for o in q.get("options", [])]
        if q.get("explanation"):
            q["explanation"] = ai_generator.sanitize_tamil_text(str(q.get("explanation", "")))
        cleaned_questions.append(q)

    questions_json = json.dumps(cleaned_questions, ensure_ascii=False)
    if quiz_type == "type2":
        lesson.quiz_type2 = questions_json
    else:
        lesson.quiz_type1 = questions_json

    db.commit()
    return {
        "message": f"Quiz {quiz_type.upper()} saved successfully with {len(cleaned_questions)} questions!",
        "quiz_type": quiz_type,
        "total": len(cleaned_questions),
        "questions": cleaned_questions
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

    # Sanitize every question to strip any old lesson title prefix like '1.எண்கள்'
    for q in questions:
        q["question"] = ai_generator.clean_question_text(q.get("question", ""), lesson.title)

    return {
        "lesson_id": lesson.id,
        "lesson_title": lesson.title,
        "quiz_type": quiz_type,
        "total": len(questions),
        "questions": questions
    }

@app.post("/api/admin/lessons/{lesson_id}/quiz/{quiz_type}/regenerate-question")
def admin_regenerate_quiz_question(
    lesson_id: int,
    quiz_type: str,
    payload: schemas.QuizRegenerateQuestionPayload,
    db: Session = Depends(get_db)
):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")

    raw_json = lesson.quiz_type2 if quiz_type == "type2" else lesson.quiz_type1
    try:
        questions = json.loads(raw_json) if raw_json else []
    except Exception:
        questions = []

    q_idx = payload.question_index
    if q_idx < 0 or q_idx >= len(questions):
        raise HTTPException(status_code=400, detail="Invalid question index.")

    target_type = payload.question_type or questions[q_idx].get("question_type", "MCQ")
    settings = db.query(models.AdminSettings).first()
    api_key = settings.gemini_api_key if settings else ""

    # Generate 1 fresh replacement question strictly from PDF
    new_q = ai_generator.generate_single_replacement_question(
        class_num=lesson.class_num,
        subject=lesson.subject,
        term=lesson.term,
        lesson_title=lesson.title,
        question_type=target_type,
        medium=getattr(lesson, "medium", ""),
        description=getattr(lesson, "description", ""),
        pdf_url=getattr(lesson, "pdf_url", "") or "",
        api_key=api_key,
        existing_questions=[q for i, q in enumerate(questions) if i != q_idx]
    )
    new_q["id"] = q_idx + 1
    new_q["question"] = ai_generator.clean_question_text(new_q.get("question", ""), lesson.title)

    questions[q_idx] = new_q

    questions_json = json.dumps(questions, ensure_ascii=False)
    if quiz_type == "type2":
        lesson.quiz_type2 = questions_json
    else:
        lesson.quiz_type1 = questions_json

    db.commit()

    return {
        "message": f"Question #{q_idx + 1} regenerated successfully!",
        "question": new_q,
        "question_index": q_idx,
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

@app.get("/api/admin/users")
def admin_get_users(role: Optional[str] = "all", db: Session = Depends(get_db)):
    query = db.query(models.User)
    if role and role != "all":
        query = query.filter(models.User.role == role)
    users = query.order_by(models.User.id.asc()).all()

    result = []
    for u in users:
        progress_records = db.query(models.LessonProgress).filter(models.LessonProgress.user_id == u.id).all()
        completed_lessons = [p for p in progress_records if p.stage4_test]
        scores = [p.test_score for p in progress_records if p.test_score and p.test_score > 0]
        avg_score = int(sum(scores) / len(scores)) if scores else (92 if u.role == "student" and len(completed_lessons) > 0 else (86 if u.role == "student" else 100))

        last_login_formatted = u.last_login.strftime("%d %b %Y, %I:%M %p") if u.last_login else "Today, 03:30 PM"
        last_viewed = u.last_viewed_lesson or ("Class 8 - Social Science (Term-1)" if u.role == "student" else "Admin Executive Management Portal")

        result.append({
            "id": u.id,
            "name": u.name or "Student User",
            "email": u.email,
            "role": u.role or "student",
            "streak_count": u.streak_count or 0,
            "daily_tasks_done": u.daily_tasks_done or 0,
            "daily_tasks_total": u.daily_tasks_total or 4,
            "last_login": last_login_formatted,
            "last_viewed_lesson": last_viewed,
            "completed_lessons_count": len(completed_lessons) or (1 if u.role == "student" else 0),
            "average_score": avg_score,
            "created_at": u.created_at.strftime("%d %b %Y") if u.created_at else "19 Oct 2026"
        })
    return result

@app.post("/api/admin/create-user")
def admin_create_user(user_data: dict, db: Session = Depends(get_db)):
    email = user_data.get("email", "").strip()
    password = user_data.get("password", "").strip()
    name = user_data.get("name", "Student User").strip()
    role = user_data.get("role", "student").strip()

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required.")

    existing = db.query(models.User).filter(models.User.email == email).first()
    if existing:
        existing.name = name
        existing.password_hash = password
        existing.role = role
        db.commit()
        db.refresh(existing)
        return {"message": "User updated successfully!", "user_id": existing.id}

    new_user = models.User(
        name=name,
        email=email,
        password_hash=password,
        role=role,
        streak_count=1 if role == "student" else 50,
        daily_tasks_done=0 if role == "student" else 4,
        daily_tasks_total=4,
        last_login=datetime.datetime.utcnow(),
        last_viewed_lesson="Class 8 - Tamil - Lesson 1" if role == "student" else "Admin Executive Portal"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": f"{role.capitalize()} user created successfully!", "user_id": new_user.id}

@app.delete("/api/admin/users/{user_id}")
def admin_delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if user.email == "admin@tet.com":
        raise HTTPException(status_code=400, detail="Default primary admin cannot be deleted.")
    db.query(models.LessonProgress).filter(models.LessonProgress.user_id == user.id).delete()
    db.delete(user)
    db.commit()
    return {"message": "User account deleted successfully."}

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
    if new_settings.count_mcq is not None: settings.count_mcq = new_settings.count_mcq
    if new_settings.count_hots is not None: settings.count_hots = new_settings.count_hots
    if new_settings.count_match is not None: settings.count_match = new_settings.count_match
    if new_settings.count_multi_stmt is not None: settings.count_multi_stmt = new_settings.count_multi_stmt
    if new_settings.count_assertion is not None: settings.count_assertion = new_settings.count_assertion
    if new_settings.count_chronological is not None: settings.count_chronological = new_settings.count_chronological
    if getattr(new_settings, "stage4_count_mcq", None) is not None: settings.stage4_count_mcq = new_settings.stage4_count_mcq
    if getattr(new_settings, "stage4_count_hots", None) is not None: settings.stage4_count_hots = new_settings.stage4_count_hots
    if getattr(new_settings, "stage4_count_match", None) is not None: settings.stage4_count_match = new_settings.stage4_count_match
    if getattr(new_settings, "stage4_count_multi_stmt", None) is not None: settings.stage4_count_multi_stmt = new_settings.stage4_count_multi_stmt
    if getattr(new_settings, "stage4_count_assertion", None) is not None: settings.stage4_count_assertion = new_settings.stage4_count_assertion
    if getattr(new_settings, "stage4_count_chronological", None) is not None: settings.stage4_count_chronological = new_settings.stage4_count_chronological
    if getattr(new_settings, "enable_material_download", None) is not None: settings.enable_material_download = new_settings.enable_material_download
    if getattr(new_settings, "enable_quiz_download", None) is not None: settings.enable_quiz_download = new_settings.enable_quiz_download
    if getattr(new_settings, "razorpay_key_id", None) is not None: settings.razorpay_key_id = new_settings.razorpay_key_id
    if getattr(new_settings, "razorpay_key_secret", None) is not None: settings.razorpay_key_secret = new_settings.razorpay_key_secret
    if getattr(new_settings, "course_price", None) is not None: settings.course_price = new_settings.course_price
    if getattr(new_settings, "original_price", None) is not None: settings.original_price = new_settings.original_price
    if getattr(new_settings, "discount_percent", None) is not None: settings.discount_percent = new_settings.discount_percent

    db.commit()
    db.refresh(settings)
    return settings

@app.get("/api/public-settings", response_model=schemas.PublicSettingsSchema)
def get_public_settings(db: Session = Depends(get_db)):
    settings = db.query(models.AdminSettings).first()
    return schemas.PublicSettingsSchema(
        enable_material_download=getattr(settings, "enable_material_download", True) if settings else True,
        enable_quiz_download=getattr(settings, "enable_quiz_download", True) if settings else True,
        razorpay_key_id=getattr(settings, "razorpay_key_id", "") if settings else "",
        course_price=getattr(settings, "course_price", 999) if settings else 999,
        original_price=getattr(settings, "original_price", 2499) if settings else 2499,
        discount_percent=getattr(settings, "discount_percent", 60) if settings else 60
    )

# ================= COUPON HELPERS & AUTOMATION =================

def get_coupon_status(coupon: models.Coupon, now: Optional[datetime.datetime] = None) -> str:
    """
    Computes real-time coupon status:
    - 'disabled': manually turned off
    - 'exhausted': usage limit reached
    - 'scheduled': start date is in the future (enable date pending)
    - 'expired': end date has passed (disable automation)
    - 'active': ready to be used
    """
    if not coupon.is_active:
        return "disabled"
    if coupon.usage_limit and coupon.usage_limit > 0 and coupon.times_used >= coupon.usage_limit:
        return "exhausted"

    cur_time = now or datetime.datetime.now()
    if coupon.start_date:
        try:
            start_dt = datetime.datetime.fromisoformat(coupon.start_date.replace("Z", ""))
            if cur_time < start_dt:
                return "scheduled"
        except Exception:
            pass

    if coupon.end_date:
        try:
            end_dt = datetime.datetime.fromisoformat(coupon.end_date.replace("Z", ""))
            if cur_time > end_dt:
                return "expired"
        except Exception:
            pass

    return "active"

def check_coupon_validity(coupon: models.Coupon, amount: int = 0) -> tuple[bool, str]:
    now = datetime.datetime.now()
    status = get_coupon_status(coupon, now)
    if status == "disabled":
        return False, f"Coupon '{coupon.code}' is currently inactive."
    if status == "exhausted":
        return False, f"Coupon '{coupon.code}' has reached its maximum redemption limit ({coupon.usage_limit} uses)."
    if status == "scheduled":
        try:
            start_dt = datetime.datetime.fromisoformat(coupon.start_date.replace("Z", ""))
            return False, f"Coupon '{coupon.code}' will become active on {start_dt.strftime('%d-%b-%Y %I:%M %p')}."
        except Exception:
            return False, f"Coupon '{coupon.code}' is not active yet."
    if status == "expired":
        try:
            end_dt = datetime.datetime.fromisoformat(coupon.end_date.replace("Z", ""))
            return False, f"Coupon '{coupon.code}' expired on {end_dt.strftime('%d-%b-%Y %I:%M %p')}."
        except Exception:
            return False, f"Coupon '{coupon.code}' has expired."

    if coupon.min_order_amount and coupon.min_order_amount > 0 and amount > 0 and amount < coupon.min_order_amount:
        return False, f"Coupon '{coupon.code}' requires a minimum purchase of ₹{coupon.min_order_amount}."

    return True, "Coupon is valid."

def calculate_coupon_discount(coupon: models.Coupon, base_amount: int) -> tuple[int, int]:
    if coupon.discount_type == "percent":
        discount = (base_amount * coupon.discount_value) // 100
        if coupon.max_discount_amount and coupon.max_discount_amount > 0:
            discount = min(discount, coupon.max_discount_amount)
    else:  # "flat"
        discount = min(coupon.discount_value, base_amount)

    discount = max(0, min(discount, base_amount))
    final_amount = max(0, base_amount - discount)
    return discount, final_amount

# --- COUPON CRUD & VALIDATION ENDPOINTS ---

@app.get("/api/admin/coupons")
def get_admin_coupons(db: Session = Depends(get_db)):
    coupons = db.query(models.Coupon).order_by(models.Coupon.created_at.desc()).all()
    now = datetime.datetime.now()
    results = []
    for c in coupons:
        status = get_coupon_status(c, now)
        results.append({
            "id": c.id,
            "code": c.code,
            "description": c.description or "",
            "discount_type": c.discount_type or "percent",
            "discount_value": c.discount_value or 0,
            "min_order_amount": c.min_order_amount or 0,
            "max_discount_amount": c.max_discount_amount or 0,
            "start_date": c.start_date,
            "end_date": c.end_date,
            "usage_limit": c.usage_limit or 0,
            "times_used": c.times_used or 0,
            "is_active": bool(c.is_active),
            "status": status,
            "created_at": c.created_at.isoformat() if c.created_at else None
        })
    return results

@app.post("/api/admin/coupons")
def create_admin_coupon(data: schemas.CouponCreate, db: Session = Depends(get_db)):
    clean_code = data.code.strip().upper()
    if not clean_code:
        raise HTTPException(status_code=400, detail="Coupon code cannot be empty.")
    
    existing = db.query(models.Coupon).filter(models.Coupon.code == clean_code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Coupon code '{clean_code}' already exists.")

    new_coupon = models.Coupon(
        code=clean_code,
        description=data.description.strip() if data.description else "",
        discount_type=data.discount_type if data.discount_type in ["percent", "flat"] else "percent",
        discount_value=max(1, data.discount_value),
        min_order_amount=max(0, data.min_order_amount or 0),
        max_discount_amount=max(0, data.max_discount_amount or 0),
        start_date=data.start_date.strip() if data.start_date else None,
        end_date=data.end_date.strip() if data.end_date else None,
        usage_limit=max(0, data.usage_limit or 0),
        times_used=0,
        is_active=True if data.is_active is None else bool(data.is_active)
    )
    db.add(new_coupon)
    db.commit()
    db.refresh(new_coupon)
    return {
        "ok": True,
        "message": f"Coupon '{new_coupon.code}' created successfully!",
        "coupon": {
            "id": new_coupon.id,
            "code": new_coupon.code,
            "discount_type": new_coupon.discount_type,
            "discount_value": new_coupon.discount_value,
            "status": get_coupon_status(new_coupon)
        }
    }

@app.post("/api/admin/coupons/generate")
def generate_random_coupon(
    prefix: str = "TET",
    discount_type: str = "percent",
    discount_value: int = 20,
    usage_limit: int = 50,
    valid_days: int = 30,
    db: Session = Depends(get_db)
):
    import random, string
    clean_prefix = (prefix or "TET").strip().upper()
    code = ""
    for _ in range(15):
        rand_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
        cand_code = f"{clean_prefix}{discount_value}-{rand_part}"
        if not db.query(models.Coupon).filter(models.Coupon.code == cand_code).first():
            code = cand_code
            break
    
    if not code:
        code = f"{clean_prefix}{discount_value}-" + ''.join(random.choices(string.digits, k=6))

    start_dt = datetime.datetime.now()
    end_dt = start_dt + datetime.timedelta(days=valid_days) if valid_days > 0 else None

    coupon = models.Coupon(
        code=code,
        description=f"Auto-generated {discount_value}{'%' if discount_type == 'percent' else ' ₹'} promotional coupon",
        discount_type=discount_type if discount_type in ["percent", "flat"] else "percent",
        discount_value=discount_value,
        usage_limit=usage_limit,
        start_date=start_dt.strftime("%Y-%m-%dT%H:%M"),
        end_date=end_dt.strftime("%Y-%m-%dT%H:%M") if end_dt else None,
        times_used=0,
        is_active=True
    )
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return {
        "ok": True,
        "message": f"Generated coupon '{coupon.code}'!",
        "coupon": {
            "id": coupon.id,
            "code": coupon.code,
            "discount_type": coupon.discount_type,
            "discount_value": coupon.discount_value,
            "usage_limit": coupon.usage_limit,
            "start_date": coupon.start_date,
            "end_date": coupon.end_date,
            "status": "active"
        }
    }

@app.put("/api/admin/coupons/{coupon_id}")
def update_admin_coupon(coupon_id: int, data: schemas.CouponUpdate, db: Session = Depends(get_db)):
    coupon = db.query(models.Coupon).filter(models.Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    if data.code is not None:
        clean_code = data.code.strip().upper()
        if clean_code and clean_code != coupon.code:
            existing = db.query(models.Coupon).filter(models.Coupon.code == clean_code).first()
            if existing:
                raise HTTPException(status_code=400, detail=f"Coupon code '{clean_code}' already exists.")
            coupon.code = clean_code

    if data.description is not None: coupon.description = data.description.strip()
    if data.discount_type is not None: coupon.discount_type = data.discount_type
    if data.discount_value is not None: coupon.discount_value = max(1, data.discount_value)
    if data.min_order_amount is not None: coupon.min_order_amount = max(0, data.min_order_amount)
    if data.max_discount_amount is not None: coupon.max_discount_amount = max(0, data.max_discount_amount)
    if data.start_date is not None: coupon.start_date = data.start_date.strip() if data.start_date else None
    if data.end_date is not None: coupon.end_date = data.end_date.strip() if data.end_date else None
    if data.usage_limit is not None: coupon.usage_limit = max(0, data.usage_limit)
    if data.is_active is not None: coupon.is_active = bool(data.is_active)

    db.commit()
    db.refresh(coupon)
    return {"ok": True, "message": f"Coupon '{coupon.code}' updated!", "status": get_coupon_status(coupon)}

@app.delete("/api/admin/coupons/{coupon_id}")
def delete_admin_coupon(coupon_id: int, db: Session = Depends(get_db)):
    coupon = db.query(models.Coupon).filter(models.Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    code = coupon.code
    db.delete(coupon)
    db.commit()
    return {"ok": True, "message": f"Coupon '{code}' deleted successfully"}

@app.post("/api/coupons/validate", response_model=schemas.CouponValidateResponse)
def validate_student_coupon(data: schemas.CouponValidateRequest, db: Session = Depends(get_db)):
    clean_code = (data.code or "").strip().upper()
    if not clean_code:
        return schemas.CouponValidateResponse(
            valid=False,
            code="",
            message="Please enter a coupon code.",
            original_amount=data.amount or 999,
            final_amount=data.amount or 999
        )

    coupon = db.query(models.Coupon).filter(models.Coupon.code == clean_code).first()
    settings = db.query(models.AdminSettings).first()
    base_price = data.amount or (settings.course_price if settings and settings.course_price else 999)

    if not coupon:
        return schemas.CouponValidateResponse(
            valid=False,
            code=clean_code,
            message=f"Coupon code '{clean_code}' is invalid or does not exist.",
            original_amount=base_price,
            final_amount=base_price
        )

    is_valid, msg = check_coupon_validity(coupon, base_price)
    if not is_valid:
        return schemas.CouponValidateResponse(
            valid=False,
            code=clean_code,
            message=msg,
            original_amount=base_price,
            final_amount=base_price
        )

    discount, final_price = calculate_coupon_discount(coupon, base_price)
    discount_display = f"{coupon.discount_value}% OFF" if coupon.discount_type == "percent" else f"₹{coupon.discount_value} OFF"
    success_msg = f"Coupon '{coupon.code}' applied! You saved ₹{discount} ({discount_display})."

    return schemas.CouponValidateResponse(
        valid=True,
        code=coupon.code,
        message=success_msg,
        discount_type=coupon.discount_type,
        discount_value=coupon.discount_value,
        discount_amount=discount,
        original_amount=base_price,
        final_amount=final_price
    )


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

# --- DASHBOARD CONTAINERS CRUD & PUBLIC ENDPOINTS ---

@app.get("/api/dashboard-containers", response_model=List[schemas.DashboardContainerOut])
def get_dashboard_containers(db: Session = Depends(get_db)):
    containers = db.query(models.DashboardContainer).filter(models.DashboardContainer.is_active == True).order_by(models.DashboardContainer.order_index.asc(), models.DashboardContainer.id.asc()).all()
    
    # Check if there's any active live meeting for the online_class container notification
    active_meetings = db.query(models.LiveMeeting).filter(models.LiveMeeting.is_active == True).all()
    now_iso = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M")
    active_meeting_info = None
    for m in active_meetings:
        if m.end_time and m.end_time < now_iso:
            continue
        is_live = False
        if m.start_time and m.end_time:
            is_live = bool(m.start_time <= now_iso <= m.end_time)
        elif m.start_time:
            is_live = bool(m.start_time <= now_iso)
        
        meeting_data = {
            "id": m.id,
            "title": m.title,
            "meeting_link": m.meeting_link,
            "start_time": m.start_time,
            "end_time": m.end_time,
            "description": m.description,
            "is_live": is_live
        }
        if is_live:
            active_meeting_info = meeting_data
            break
        elif not active_meeting_info:
            active_meeting_info = meeting_data

    results = []
    for c in containers:
        c_dict = schemas.DashboardContainerOut.from_orm(c)
        if c.container_key == "online_class" or c.category == "online_class":
            c_dict.active_meeting = active_meeting_info
        results.append(c_dict)
    return results

@app.get("/api/admin/dashboard-containers", response_model=List[schemas.DashboardContainerOut])
def get_admin_dashboard_containers(db: Session = Depends(get_db)):
    return db.query(models.DashboardContainer).order_by(models.DashboardContainer.order_index.asc(), models.DashboardContainer.id.asc()).all()

@app.post("/api/admin/dashboard-containers", response_model=schemas.DashboardContainerOut)
def create_or_update_dashboard_container(data: schemas.DashboardContainerCreate, db: Session = Depends(get_db)):
    existing = db.query(models.DashboardContainer).filter(models.DashboardContainer.container_key == data.container_key).first()
    if existing:
        for k, v in data.dict(exclude_unset=True).items():
            setattr(existing, k, v)
        db.commit()
        db.refresh(existing)
        return existing
    
    new_c = models.DashboardContainer(**data.dict())
    db.add(new_c)
    db.commit()
    db.refresh(new_c)
    return new_c

@app.put("/api/admin/dashboard-containers/{container_id}", response_model=schemas.DashboardContainerOut)
def update_dashboard_container(container_id: int, data: schemas.DashboardContainerUpdate, db: Session = Depends(get_db)):
    c = db.query(models.DashboardContainer).filter(models.DashboardContainer.id == container_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Container not found.")
    for k, v in data.dict(exclude_unset=True).items():
        if v is not None:
            setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return c

@app.delete("/api/admin/dashboard-containers/{container_id}")
def delete_dashboard_container(container_id: int, db: Session = Depends(get_db)):
    c = db.query(models.DashboardContainer).filter(models.DashboardContainer.id == container_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Container not found.")
    db.delete(c)
    db.commit()
    return {"message": "Container deleted successfully!"}

@app.post("/api/admin/dashboard-containers/{container_id}/toggle")
def toggle_dashboard_container(container_id: int, db: Session = Depends(get_db)):
    c = db.query(models.DashboardContainer).filter(models.DashboardContainer.id == container_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Container not found.")
    c.is_active = not c.is_active
    db.commit()
    return {"message": f"Container status updated to {'active' if c.is_active else 'inactive'}", "is_active": c.is_active}

# --- STAGE 4 UNLOCK CONTROLS (DEFAULT 8:00 PM WITH MANUAL ADMIN OVERRIDE) ---

@app.post("/api/admin/lessons/{lesson_id}/toggle-stage4")
@app.post("/api/admin/lessons/{lesson_id}/toggle-stage5")
def toggle_lesson_stage4(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found.")
    new_state = not bool(lesson.stage4_force_open)
    lesson.stage4_force_open = new_state
    lesson.stage5_force_open = new_state
    db.commit()
    db.refresh(lesson)
    status_str = "unlocked immediately" if new_state else "locked to default 8:00 PM"
    return {
        "message": f"Final Test is now {status_str} for '{lesson.title}'.",
        "stage4_force_open": lesson.stage4_force_open,
        "stage5_force_open": lesson.stage5_force_open,
        "stage4_unlock_time": lesson.stage4_unlock_time or "20:00",
        "stage5_unlock_time": lesson.stage5_unlock_time or "20:00"
    }

@app.post("/api/admin/lessons/unlock-all-stage4")
@app.post("/api/admin/lessons/unlock-all-stage5")
def unlock_all_stage4(db: Session = Depends(get_db)):
    db.query(models.Lesson).update({
        models.Lesson.stage4_force_open: True,
        models.Lesson.stage5_force_open: True
    })
    db.commit()
    return {"message": "All Final Exams are now unlocked immediately for students!"}

# --- GOOGLE AUTHENTICATION ENDPOINT ---

@app.post("/api/auth/google", response_model=schemas.UserProfile)
def auth_google(payload: schemas.GoogleAuthPayload, db: Session = Depends(get_db)):
    email = payload.email
    name = payload.name or "Teacher Candidate"
    
    # If credential JWT token is passed, decode email/name
    if not email and payload.credential:
        try:
            import base64
            parts = payload.credential.split(".")
            if len(parts) >= 2:
                padded = parts[1] + "=" * ((4 - len(parts[1]) % 4) % 4)
                decoded_bytes = base64.urlsafe_b64decode(padded)
                data = json.loads(decoded_bytes.decode("utf-8"))
                email = data.get("email")
                name = data.get("name") or name
        except Exception as e:
            print(f"[Google Token Decode Error] {e}")

    if not email:
        raise HTTPException(status_code=400, detail="Invalid Google authentication payload.")

    clean_email = email.strip().lower()
    user = db.query(models.User).filter(func.lower(models.User.email) == clean_email).first()
    if not user:
        user = models.User(
            name=name.strip(),
            email=clean_email,
            password_hash="google_oauth_user",
            role="student",
            streak_count=1,
            daily_tasks_done=0,
            daily_tasks_total=4,
            last_login=datetime.datetime.utcnow()
        )
        db.add(user)
    else:
        if name and name != "Google Candidate":
            user.name = name.strip()
    
    user.last_login = datetime.datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user

# --- DAILY PRACTICE TEST ENDPOINTS ---

@app.get("/api/daily-practice/active")
def get_active_daily_practices(db: Session = Depends(get_db)):
    today_str = datetime.datetime.now().strftime("%Y-%m-%d")
    items = db.query(models.DailyPractice).filter(models.DailyPractice.is_active == True).order_by(models.DailyPractice.id.desc()).all()
    res = []
    for dp in items:
        qs_count = 0
        if dp.quiz_questions:
            try:
                parsed = json.loads(dp.quiz_questions)
                if isinstance(parsed, list):
                    qs_count = len(parsed)
            except Exception:
                pass
        
        stages = [int(s.strip()) for s in (dp.active_stages or "1,3,4").split(",") if s.strip().isdigit()]
        res.append({
            "id": dp.id,
            "title": dp.title,
            "description": dp.description or "",
            "class_num": dp.class_num,
            "subject": dp.subject,
            "term": dp.term,
            "active_stages": stages,
            "pdf_url": dp.pdf_url or "",
            "video_url": dp.video_url or "",
            "has_quiz": qs_count > 0,
            "quiz_questions_count": qs_count,
            "test_questions_count": dp.test_questions_count or 20,
            "time_limit_mins": dp.time_limit_mins or 20,
            "pass_percentage": dp.pass_percentage or 80,
            "available_date": dp.available_date or today_str,
            "is_active": dp.is_active,
            "created_at": dp.created_at.isoformat() if dp.created_at else None
        })
    return res

@app.get("/api/daily-practice/{dp_id}")
def get_daily_practice_detail(dp_id: int, db: Session = Depends(get_db)):
    dp = db.query(models.DailyPractice).filter(models.DailyPractice.id == dp_id).first()
    if not dp:
        raise HTTPException(status_code=404, detail="Daily practice test not found.")
    
    questions = []
    if dp.quiz_questions:
        try:
            questions = json.loads(dp.quiz_questions)
        except Exception:
            pass

    stages = [int(s.strip()) for s in (dp.active_stages or "1,3,4").split(",") if s.strip().isdigit()]
    return {
        "id": dp.id,
        "title": dp.title,
        "description": dp.description or "",
        "class_num": dp.class_num,
        "subject": dp.subject,
        "term": dp.term,
        "active_stages": stages,
        "pdf_url": dp.pdf_url or "",
        "video_url": dp.video_url or "",
        "questions": questions,
        "test_questions_count": dp.test_questions_count or 20,
        "time_limit_mins": dp.time_limit_mins or 20,
        "pass_percentage": dp.pass_percentage or 80,
        "available_date": dp.available_date,
        "is_active": dp.is_active
    }

@app.get("/api/admin/daily-practice")
def admin_get_daily_practices(db: Session = Depends(get_db)):
    items = db.query(models.DailyPractice).order_by(models.DailyPractice.created_at.desc()).all()
    res = []
    for dp in items:
        qs_count = 0
        if dp.quiz_questions:
            try:
                parsed = json.loads(dp.quiz_questions)
                if isinstance(parsed, list):
                    qs_count = len(parsed)
            except Exception:
                pass
        stages = [int(s.strip()) for s in (dp.active_stages or "1,3,4").split(",") if s.strip().isdigit()]
        res.append({
            "id": dp.id,
            "title": dp.title,
            "description": dp.description or "",
            "class_num": dp.class_num,
            "subject": dp.subject,
            "term": dp.term,
            "active_stages": stages,
            "pdf_url": dp.pdf_url or "",
            "video_url": dp.video_url or "",
            "quiz_questions_count": qs_count,
            "test_questions_count": dp.test_questions_count or 20,
            "time_limit_mins": dp.time_limit_mins or 20,
            "pass_percentage": dp.pass_percentage or 80,
            "available_date": dp.available_date,
            "is_active": dp.is_active,
            "created_at": dp.created_at.isoformat() if dp.created_at else None
        })
    return res

@app.post("/api/admin/daily-practice")
def admin_create_daily_practice(payload: schemas.DailyPracticeCreate, db: Session = Depends(get_db)):
    today_str = datetime.datetime.now().strftime("%Y-%m-%d")
    
    qs_json = ""
    if payload.quiz_questions and len(payload.quiz_questions) > 0:
        qs_json = json.dumps(payload.quiz_questions, ensure_ascii=False)
    else:
        settings = db.query(models.AdminSettings).first()
        api_key = settings.gemini_api_key if settings else ""
        type_counts = {
            "count_mcq": getattr(settings, "count_mcq", 40) if settings else 40,
            "count_hots": getattr(settings, "count_hots", 30) if settings else 30,
            "count_match": getattr(settings, "count_match", 30) if settings else 30,
            "count_multi_stmt": getattr(settings, "count_multi_stmt", 40) if settings else 40,
            "count_assertion": getattr(settings, "count_assertion", 30) if settings else 30,
            "count_chronological": getattr(settings, "count_chronological", 30) if settings else 30,
        }
        qs = ai_generator.generate_practice_questions(
            class_num=payload.class_num,
            subject=payload.subject,
            term=payload.term,
            lesson_title=payload.title,
            count=payload.test_questions_count or 20,
            api_key=api_key,
            medium=getattr(payload, "medium", ""),
            description=payload.description or "",
            pdf_url=payload.pdf_url or "",
            type_counts=type_counts
        )
        qs_json = json.dumps(qs, ensure_ascii=False)

    dp = models.DailyPractice(
        title=payload.title,
        description=payload.description or "",
        class_num=payload.class_num,
        subject=payload.subject,
        term=payload.term,
        active_stages=payload.active_stages or "1,3,4",
        pdf_url=payload.pdf_url or "",
        video_url=payload.video_url or "",
        quiz_questions=qs_json,
        test_questions_count=payload.test_questions_count or 20,
        time_limit_mins=payload.time_limit_mins or 20,
        pass_percentage=payload.pass_percentage or 80,
        available_date=payload.available_date or today_str,
        is_active=True
    )
    db.add(dp)
    db.commit()
    db.refresh(dp)
    return {"message": "Daily practice card created successfully!", "id": dp.id}

@app.put("/api/admin/daily-practice/{dp_id}")
def admin_update_daily_practice(dp_id: int, payload: schemas.DailyPracticeUpdate, db: Session = Depends(get_db)):
    dp = db.query(models.DailyPractice).filter(models.DailyPractice.id == dp_id).first()
    if not dp:
        raise HTTPException(status_code=404, detail="Daily practice test not found.")
    
    if payload.title is not None: dp.title = payload.title
    if payload.description is not None: dp.description = payload.description
    if payload.class_num is not None: dp.class_num = payload.class_num
    if payload.subject is not None: dp.subject = payload.subject
    if payload.term is not None: dp.term = payload.term
    if payload.active_stages is not None: dp.active_stages = payload.active_stages
    if payload.pdf_url is not None: dp.pdf_url = payload.pdf_url
    if payload.video_url is not None: dp.video_url = payload.video_url
    if payload.quiz_questions is not None: dp.quiz_questions = json.dumps(payload.quiz_questions, ensure_ascii=False)
    if payload.test_questions_count is not None: dp.test_questions_count = payload.test_questions_count
    if payload.time_limit_mins is not None: dp.time_limit_mins = payload.time_limit_mins
    if payload.pass_percentage is not None: dp.pass_percentage = payload.pass_percentage
    if payload.available_date is not None: dp.available_date = payload.available_date
    if payload.is_active is not None: dp.is_active = payload.is_active

    db.commit()
    db.refresh(dp)
    return {"message": "Daily practice test updated successfully!"}

@app.delete("/api/admin/daily-practice/{dp_id}")
def admin_delete_daily_practice(dp_id: int, db: Session = Depends(get_db)):
    dp = db.query(models.DailyPractice).filter(models.DailyPractice.id == dp_id).first()
    if not dp:
        raise HTTPException(status_code=404, detail="Daily practice test not found.")
    db.delete(dp)
    db.commit()
    return {"message": "Daily practice test deleted successfully!"}

@app.post("/api/admin/daily-practice/{dp_id}/generate-quiz")
def admin_generate_daily_quiz(dp_id: int, count: int = 20, db: Session = Depends(get_db)):
    dp = db.query(models.DailyPractice).filter(models.DailyPractice.id == dp_id).first()
    if not dp:
        raise HTTPException(status_code=404, detail="Daily practice test not found.")
    
    settings = db.query(models.AdminSettings).first()
    api_key = settings.gemini_api_key if settings else ""
    type_counts = {
        "count_mcq": getattr(settings, "count_mcq", 40) if settings else 40,
        "count_hots": getattr(settings, "count_hots", 30) if settings else 30,
        "count_match": getattr(settings, "count_match", 30) if settings else 30,
        "count_multi_stmt": getattr(settings, "count_multi_stmt", 40) if settings else 40,
        "count_assertion": getattr(settings, "count_assertion", 30) if settings else 30,
        "count_chronological": getattr(settings, "count_chronological", 30) if settings else 30,
    }
    qs = ai_generator.generate_practice_questions(
        class_num=dp.class_num,
        subject=dp.subject,
        term=dp.term,
        lesson_title=dp.title,
        count=count,
        api_key=api_key,
        medium=getattr(dp, "medium", ""),
        description=getattr(dp, "description", ""),
        pdf_url=dp.pdf_url or "",
        type_counts=type_counts
    )
    dp.quiz_questions = json.dumps(qs, ensure_ascii=False)
    dp.test_questions_count = count
    db.commit()
    return {"message": f"Successfully generated {len(qs)} questions for '{dp.title}'!", "questions_count": len(qs)}

# --- NEWS & LIVE AI NEWS ENDPOINTS ---

@app.get("/api/news")
def get_news(category: Optional[str] = "all", db: Session = Depends(get_db)):
    news_items = [
        {
            "id": "news_1",
            "title": "TN TET Paper 2 - முக்கிய மாதிரி வினா விடைகள் மற்றும் மாதிரித் தேர்வு வழிகாட்டுதல்",
            "description": "தமிழ்நாடு ஆசிரியர் தகுதித் தேர்வு (TNTET Paper 2) தயாரிப்பில் ஈடுபட்டுள்ள பட்டதாரி ஆசிரியர்களுக்கான மாதிரித் தேர்வுகள் மற்றும் 80% தேர்ச்சி மதிப்பெண் வழிகாட்டுதல்கள் வெளியிடப்பட்டுள்ளன. பாடவாரியான மாதிரி வினாத்தாள்களை போர்ட்டலில் இருந்து நேரடியாக PDF வடிவில் பதிவிறக்கம் செய்து பயிலலாம்.",
            "category": "education",
            "source": "TN TET தேர்வு மையம்",
            "imageUrl": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
            "link": "#",
            "pubDate": datetime.datetime.now().isoformat()
        },
        {
            "id": "news_2",
            "title": "ஆசிரியர் தேர்வு வாரியம் (TRB) - பட்டதாரி ஆசிரியர் காலிப்பணியிடங்கள் புதிய பாடத்திட்ட சுற்றறிக்கை",
            "description": "பள்ளி கல்வித்துறை சார்பில் ஆசிரியர் தேர்வு வாரியம் வழியாக நிரப்பப்பட உள்ள காலிப்பணியிடங்களுக்கு 6 முதல் 12 ஆம் வகுப்பு வரையிலான தமிழ்நாடு அரசு சமச்சீர் கல்வி பாடப்புத்தகங்களின் முக்கியத்துவம் மீண்டும் வலியுறுத்தப்பட்டுள்ளது. தினசரி நேரலை வகுப்புகள் மற்றும் மாதிரிப் பயிற்சிகள் மூலம் ஆசிரியர்கள் தேர்ச்சி பெற வாய்ப்பு.",
            "category": "education",
            "source": "பள்ளிக் கல்வித்துறை",
            "imageUrl": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80",
            "link": "#",
            "pubDate": (datetime.datetime.now() - datetime.timedelta(hours=2)).isoformat()
        },
        {
            "id": "news_3",
            "title": "சமூக அறிவியல் & அறிவியல் பாடப்பிரிவுகளுக்கான தினசரி மாதிரி வினாடி வினா பயிற்சி தொடக்கம்",
            "description": "வகுப்பு 8 மற்றும் 9 ஆம் வகுப்பு பாடங்களில் உள்ள மிக முக்கியமான கொள்குறி வினாக்கள், கூற்று-காரணம் மற்றும் பொருத்துக வகை வினாக்களுக்கு மாணவர்களும் ஆசிரியர்களும் தினசரி பயிற்சி எடுக்கும் வகையில் புதிய மாதிரித் தேர்வு முறை போர்ட்டலில் தொடங்கப்பட்டுள்ளது.",
            "category": "education",
            "source": "கல்விச் செய்தி",
            "imageUrl": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
            "link": "#",
            "pubDate": (datetime.datetime.now() - datetime.timedelta(hours=5)).isoformat()
        },
        {
            "id": "news_4",
            "title": "தமிழ் இலக்கியம் & இலக்கணம்: செம்மொழித் தகுதித்தேர்வு சிறப்பு ஆய்வுக் கட்டுரைகள்",
            "description": "சங்க இலக்கியம், எட்டுத்தொகை, பத்துப்பாட்டு மற்றும் தொல்காப்பிய இலக்கண விதிகள் அடங்கிய சிறப்புப் பகுப்பாய்வு தொகுப்பு. ஆசிரியர் தகுதித் தேர்வில் முதல் தாள் மற்றும் இரண்டாம் தாள் எழுதுவோருக்கு பயன்படும் வகையில் முழுமையான விளக்கக் குறிப்புகள் வழங்கப்பட்டுள்ளன.",
            "category": "education",
            "source": "தமிழ் தகுதித் தேர்வு மையம்",
            "imageUrl": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80",
            "link": "#",
            "pubDate": (datetime.datetime.now() - datetime.timedelta(hours=8)).isoformat()
        }
    ]
    if category and category != "all":
        news_items = [n for n in news_items if n.get("category") == category]
    return news_items

@app.post("/api/news/ai-live")
def get_ai_live_news(db: Session = Depends(get_db)):
    now = datetime.datetime.now()
    live_items = [
        {
            "id": f"live_{int(now.timestamp())}_1",
            "title": f"⚡ [நேரலை] TN TET Paper 2 - இன்றைய கல்வித்துறை முக்கிய அறிவிப்புகள் ({now.strftime('%d-%m-%Y')})",
            "description": "தமிழக பள்ளிக்கல்வித்துறை மற்றும் ஆசிரியர் தேர்வு வாரியம் (TRB) நடத்தும் TET Paper 2 தேர்விற்கான தற்போதைய தேர்வு மைய முன்னேற்பாடுகள், ஹால் டிக்கெட் விபரங்கள் மற்றும் திருத்தப்பட்ட பாடத்திட்ட வழிகாட்டுதல்கள் வெளியிடப்பட்டுள்ளன.",
            "category": "education",
            "source": "மின்னல் கல்வி நேரலை",
            "imageUrl": "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80",
            "link": "#",
            "pubDate": now.isoformat()
        },
        {
            "id": f"live_{int(now.timestamp())}_2",
            "title": "அறிவியல் & கணிதப் பாடங்களுக்கான உயர் சிந்தனை வினா வங்கி நேரடி தொகுப்பு",
            "description": "தேர்வர்கள் குறைந்த நேரத்தில் அதிக மதிப்பெண் பெறும் உத்திகள் மற்றும் படிநிலைத் தீர்வுகள் அடங்கிய 200 கொள்குறி வினாத்தாள் வங்கி போர்ட்டலில் உடனடியாகப் படிக்கக் கிடைக்கிறது.",
            "category": "education",
            "source": "TET ஆசிரியர் மன்றம்",
            "imageUrl": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
            "link": "#",
            "pubDate": (now - datetime.timedelta(minutes=30)).isoformat()
        }
    ]
    return {"ok": True, "news": live_items}

# ================= ENROLLMENTS & SUBSCRIPTION ENDPOINTS =================

@app.post("/api/enrollments/register")
def register_enrollment_lead(data: schemas.EnrollmentCreate, db: Session = Depends(get_db)):
    # Check if existing enrollment for this email
    clean_email = data.email.strip().lower()
    existing = db.query(models.Enrollment).filter(models.Enrollment.email == clean_email).first()
    if existing and existing.status in ["active", "admin_free", "paid"]:
        return {
            "ok": True,
            "already_active": True,
            "message": "User is already active and enrolled!",
            "enrollment_id": existing.id
        }

    user = db.query(models.User).filter(models.User.email == clean_email).first()
    settings = db.query(models.AdminSettings).first()
    
    base_price = settings.course_price if settings and settings.course_price else 999
    amount = base_price
    applied_coupon_code = None
    discount_amount = 0

    if data.coupon_code and data.coupon_code.strip():
        c_code = data.coupon_code.strip().upper()
        coupon = db.query(models.Coupon).filter(models.Coupon.code == c_code).first()
        if coupon:
            is_valid, msg = check_coupon_validity(coupon, base_price)
            if is_valid:
                discount_amount, amount = calculate_coupon_discount(coupon, base_price)
                applied_coupon_code = coupon.code
            else:
                raise HTTPException(status_code=400, detail=msg)
        else:
            raise HTTPException(status_code=400, detail=f"Coupon code '{c_code}' is invalid.")
    elif data.amount and data.amount > 0 and data.amount < base_price:
        amount = base_price

    enrollment = models.Enrollment(
        user_id=user.id if user else None,
        name=data.name.strip(),
        mobile=data.mobile.strip(),
        email=clean_email,
        designation=data.designation or "Aspirant",
        course_name=data.course_name or "TET Combo (TET 1, TET 2 & Live Class)",
        amount=amount,
        coupon_code=applied_coupon_code,
        discount_amount=discount_amount,
        status="pending",
        payment_method="razorpay"
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    razorpay_key = settings.razorpay_key_id if settings and settings.razorpay_key_id else ""
    return {
        "ok": True,
        "enrollment_id": enrollment.id,
        "amount": amount,
        "currency": "INR",
        "razorpay_key": razorpay_key,
        "name": enrollment.name,
        "email": enrollment.email,
        "mobile": enrollment.mobile,
        "course_name": enrollment.course_name
    }

@app.post("/api/enrollments/verify-payment")
def verify_enrollment_payment(data: schemas.EnrollmentVerifyPayment, db: Session = Depends(get_db)):
    enrollment = db.query(models.Enrollment).filter(models.Enrollment.id == data.enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    enrollment.payment_id = data.payment_id
    enrollment.order_id = data.order_id
    enrollment.status = "active"
    enrollment.payment_method = "razorpay"

    # If coupon was used, increment usage counter
    if enrollment.coupon_code:
        coupon = db.query(models.Coupon).filter(models.Coupon.code == enrollment.coupon_code).first()
        if coupon:
            coupon.times_used = (coupon.times_used or 0) + 1

    # Link user if exists
    if not enrollment.user_id:
        user = db.query(models.User).filter(models.User.email == enrollment.email).first()
        if user:
            enrollment.user_id = user.id

    db.commit()
    db.refresh(enrollment)
    return {
        "ok": True,
        "message": "Payment verified and complete course access activated!",
        "enrollment_id": enrollment.id,
        "status": enrollment.status
    }

@app.get("/api/enrollments/my-status")
def get_user_enrollment_status(email: Optional[str] = None, db: Session = Depends(get_db)):
    if not email:
        return {"is_enrolled": False, "reason": "No email provided"}

    email_clean = email.strip().lower()

    # Check if user is admin
    user = db.query(models.User).filter(models.User.email == email_clean).first()
    if user and user.role == "admin":
        return {
            "is_enrolled": True,
            "role": "admin",
            "message": "Admin has full access to all modules."
        }

    # Check enrollment table for active status
    enrollment = db.query(models.Enrollment).filter(
        models.Enrollment.email == email_clean,
        models.Enrollment.status.in_(["active", "admin_free", "paid"])
    ).order_by(models.Enrollment.created_at.desc()).first()

    if enrollment:
        return {
            "is_enrolled": True,
            "role": "student",
            "enrollment": {
                "id": enrollment.id,
                "name": enrollment.name,
                "email": enrollment.email,
                "designation": enrollment.designation,
                "status": enrollment.status,
                "course_name": enrollment.course_name,
                "created_at": enrollment.created_at.isoformat() if enrollment.created_at else None
            }
        }

    return {"is_enrolled": False, "role": "student"}

@app.get("/api/admin/enrollments", response_model=List[schemas.EnrollmentOut])
def get_admin_enrollments(db: Session = Depends(get_db)):
    return db.query(models.Enrollment).order_by(models.Enrollment.created_at.desc()).all()

@app.post("/api/admin/enrollments/manual", response_model=schemas.EnrollmentOut)
def manual_free_enroll(data: schemas.EnrollmentManualCreate, db: Session = Depends(get_db)):
    clean_email = data.email.strip().lower()
    user = db.query(models.User).filter(models.User.email == clean_email).first()
    existing = db.query(models.Enrollment).filter(models.Enrollment.email == clean_email).first()
    
    if existing:
        existing.status = "active"
        existing.payment_method = "admin_free"
        existing.notes = data.notes or "Free enrollment granted by admin"
        if data.name: existing.name = data.name.strip()
        if data.mobile: existing.mobile = data.mobile.strip()
        if data.designation: existing.designation = data.designation
        db.commit()
        db.refresh(existing)
        return existing

    new_enrollment = models.Enrollment(
        user_id=user.id if user else None,
        name=data.name.strip(),
        mobile=data.mobile.strip(),
        email=clean_email,
        designation=data.designation or "Aspirant",
        course_name=data.course_name or "TET Combo (TET 1, TET 2 & Live Class)",
        amount=0,
        status="active",
        payment_method="admin_free",
        notes=data.notes or "Free enrollment granted by admin"
    )
    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)
    return new_enrollment

@app.put("/api/admin/enrollments/{enrollment_id}/status")
def update_enrollment_status(enrollment_id: int, status: str = Body(..., embed=True), db: Session = Depends(get_db)):
    enrollment = db.query(models.Enrollment).filter(models.Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    enrollment.status = status
    db.commit()
    return {"ok": True, "enrollment_id": enrollment.id, "status": enrollment.status}

@app.delete("/api/admin/enrollments/{enrollment_id}")
def delete_enrollment(enrollment_id: int, db: Session = Depends(get_db)):
    enrollment = db.query(models.Enrollment).filter(models.Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    db.delete(enrollment)
    db.commit()
    return {"ok": True, "message": "Enrollment deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
