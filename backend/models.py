from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="Student User")
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="student") # "student" or "admin"
    streak_count = Column(Integer, default=0)
    last_completed_date = Column(String, nullable=True) # "YYYY-MM-DD"
    daily_tasks_done = Column(Integer, default=0)
    daily_tasks_total = Column(Integer, default=4)
    created_at = Column(DateTime, default=datetime.utcnow)

class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    class_num = Column(Integer, index=True) # 1 to 12
    subject = Column(String, index=True)
    medium = Column(String, index=True, default="Tamil Medium") # "Tamil Medium" or "English Medium"
    term = Column(String, index=True) # Term-1, Term-2, Term-3
    title = Column(String)
    description = Column(Text, nullable=True)
    pdf_filename = Column(String)
    pdf_url = Column(String)
    video_url = Column(String, nullable=True)
    file_size = Column(String, default="2.4 MB")
    uploaded_at = Column(DateTime, default=datetime.utcnow)

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    class_num = Column(Integer, index=True)
    subject = Column(String, index=True)
    medium = Column(String, index=True, default="Tamil Medium")
    term = Column(String, index=True)
    lesson_order = Column(Integer) # 1, 2, 3...
    title = Column(String)
    description = Column(Text, nullable=True)
    pdf_url = Column(String)
    video_url = Column(String)
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
    completed_at = Column(DateTime, nullable=True)

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(Text)
    priority = Column(String, default="normal") # normal, urgent
    created_at = Column(DateTime, default=datetime.utcnow)

class AdminSettings(Base):
    __tablename__ = "admin_settings"

    id = Column(Integer, primary_key=True, index=True)
    gemini_api_key = Column(String, default="")
    practice_question_count = Column(Integer, default=200)
    test_question_count = Column(Integer, default=100)
    test_time_limit_mins = Column(Integer, default=60)
    pass_percentage = Column(Integer, default=60)
