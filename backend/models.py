from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), default="Student User")
    email = Column(String(255), unique=True, index=True)
    password_hash = Column(String(255))
    role = Column(String(50), default="student") # "student" or "admin"
    streak_count = Column(Integer, default=0)
    last_completed_date = Column(String(50), nullable=True) # "YYYY-MM-DD"
    last_login = Column(DateTime, nullable=True)
    last_viewed_lesson = Column(String(255), nullable=True)
    daily_tasks_done = Column(Integer, default=0)
    daily_tasks_total = Column(Integer, default=4)
    created_at = Column(DateTime, default=datetime.utcnow)

class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    class_num = Column(Integer, index=True) # 1 to 12
    subject = Column(String(100), index=True)
    medium = Column(String(50), index=True, default="Tamil Medium") # "Tamil Medium" or "English Medium"
    term = Column(String(50), index=True) # Term-1, Term-2, Term-3
    title = Column(String(255))
    description = Column(Text, nullable=True)
    pdf_filename = Column(String(255))
    pdf_url = Column(String(500))
    video_url = Column(String(500), nullable=True)
    file_size = Column(String(50), default="2.4 MB")
    uploaded_at = Column(DateTime, default=datetime.utcnow)

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    class_num = Column(Integer, index=True)
    subject = Column(String(100), index=True)
    medium = Column(String(50), index=True, default="Tamil Medium")
    term = Column(String(50), index=True)
    lesson_order = Column(Integer) # 1, 2, 3...
    title = Column(String(255))
    description = Column(Text, nullable=True)
    pdf_url = Column(String(500))
    video_url = Column(String(500))
    available_at = Column(String(100), nullable=True) # ISO "YYYY-MM-DDTHH:MM" or datetime string
    stage4_unlock_time = Column(String(50), default="20:00") # Default opens at 8:00 PM
    stage4_force_open = Column(Boolean, default=False) # Manual override by admin to open immediately
    quiz_type1 = Column(Text().with_variant(LONGTEXT, "mysql"), nullable=True) # JSON string of questions array
    quiz_type2 = Column(Text().with_variant(LONGTEXT, "mysql"), nullable=True) # JSON string of alternate questions array
    created_at = Column(DateTime, default=datetime.utcnow)

class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    lesson_id = Column(Integer, ForeignKey("lessons.id"))
    stage1_pdf = Column(Boolean, default=False)
    stage2_video = Column(Boolean, default=False)
    stage3_questions = Column(Boolean, default=False)
    stage4_test = Column(Boolean, default=False)
    test_score = Column(Integer, default=0)
    test_total = Column(Integer, default=100)
    has_failed_test = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    content = Column(Text)
    priority = Column(String(50), default="normal") # normal, urgent
    created_at = Column(DateTime, default=datetime.utcnow)

class AdminSettings(Base):
    __tablename__ = "admin_settings"

    id = Column(Integer, primary_key=True, index=True)
    gemini_api_key = Column(String(255), default="")
    practice_question_count = Column(Integer, default=200)
    test_question_count = Column(Integer, default=100)
    test_time_limit_mins = Column(Integer, default=60)
    pass_percentage = Column(Integer, default=80)

class TETCard(Base):
    __tablename__ = "tet_cards"

    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(String(100), unique=True, index=True)
    title = Column(String(255))
    description = Column(Text)
    class_range = Column(String(100))
    paper_type = Column(String(100))
    start_class = Column(Integer, default=1)
    end_class = Column(Integer, default=8)
    lesson_count_label = Column(String(100), default="25 Lessons")
    button_text = Column(String(100), default="OPEN →")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class LiveMeeting(Base):
    __tablename__ = "live_meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    meeting_link = Column(String(500))
    start_time = Column(String(100)) # ISO "YYYY-MM-DDTHH:MM" or datetime string
    end_time = Column(String(100))   # ISO "YYYY-MM-DDTHH:MM" or datetime string
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class DailyPractice(Base):
    __tablename__ = "daily_practices"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    description = Column(Text, nullable=True)
    class_num = Column(Integer, default=8) # Target class 1-12
    subject = Column(String(100), default="Social Science")
    term = Column(String(50), default="Term 1")
    active_stages = Column(String(50), default="1,3,4") # Comma-separated stages, e.g. "1,3,4"
    pdf_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    quiz_questions = Column(Text().with_variant(LONGTEXT, "mysql"), nullable=True) # JSON array of questions
    test_questions_count = Column(Integer, default=20)
    time_limit_mins = Column(Integer, default=20)
    pass_percentage = Column(Integer, default=80)
    available_date = Column(String(50), nullable=True) # "YYYY-MM-DD"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
