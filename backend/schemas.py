from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    id: int
    name: str
    email: str
    role: str
    streak_count: int
    daily_tasks_done: int
    daily_tasks_total: int

    class Config:
        from_attributes = True

class MaterialCreate(BaseModel):
    class_num: int
    subject: str
    medium: Optional[str] = "Tamil Medium"
    term: str
    title: str
    description: Optional[str] = ""
    video_url: Optional[str] = ""

class MaterialOut(BaseModel):
    id: int
    class_num: int
    subject: str
    medium: str
    term: str
    title: str
    description: Optional[str]
    pdf_url: str
    video_url: Optional[str]
    file_size: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

class LessonOut(BaseModel):
    id: int
    class_num: int
    subject: str
    medium: str
    term: str
    lesson_order: int
    title: str
    description: Optional[str]
    pdf_url: str
    video_url: str
    stage1_pdf: bool
    stage2_video: bool
    stage3_questions: bool
    stage4_test: bool
    is_locked: bool
    test_score: Optional[int] = 0

class Question(BaseModel):
    id: int
    question: str
    options: List[str]
    answer_index: int
    explanation: str

class TestSubmission(BaseModel):
    user_answers: dict # {question_id: selected_index}

class AdminSettingsSchema(BaseModel):
    gemini_api_key: str
    practice_question_count: int
    test_question_count: int
    test_time_limit_mins: int
    pass_percentage: int

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    priority: Optional[str] = "normal"
