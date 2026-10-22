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
    last_login: Optional[datetime] = None
    last_viewed_lesson: Optional[str] = None
    created_at: Optional[datetime] = None

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

class MaterialUpdate(BaseModel):
    class_num: Optional[int] = None
    subject: Optional[str] = None
    medium: Optional[str] = None
    term: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    pdf_url: Optional[str] = None
    video_url: Optional[str] = None

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
    short_notes_pdf_url: Optional[str] = None
    video_url: str
    stage1_pdf: bool
    stage2_short_notes: Optional[bool] = False
    stage2_video: bool
    stage3_questions: bool
    stage4_test: bool
    is_locked: bool
    test_score: Optional[int] = 0
    stage4_unlock_time: Optional[str] = "20:00"
    stage4_force_open: Optional[bool] = False
    is_stage4_locked_by_time: Optional[bool] = False
    stage5_unlock_time: Optional[str] = "20:00"
    stage5_force_open: Optional[bool] = False
    is_stage5_locked_by_time: Optional[bool] = False
    active_stages: Optional[str] = "1,2,3,4,5"

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
    count_mcq: Optional[int] = 40
    count_hots: Optional[int] = 20
    count_match: Optional[int] = 10
    count_multi_stmt: Optional[int] = 10
    count_assertion: Optional[int] = 10
    count_chronological: Optional[int] = 10
    stage4_count_mcq: Optional[int] = 20
    stage4_count_hots: Optional[int] = 10
    stage4_count_match: Optional[int] = 5
    stage4_count_multi_stmt: Optional[int] = 5
    stage4_count_assertion: Optional[int] = 5
    stage4_count_chronological: Optional[int] = 5
    enable_material_download: Optional[bool] = True
    enable_quiz_download: Optional[bool] = True
    razorpay_key_id: Optional[str] = ""
    razorpay_key_secret: Optional[str] = ""
    course_price: Optional[int] = 999
    original_price: Optional[int] = 2499
    discount_percent: Optional[int] = 60

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    priority: Optional[str] = "normal"

class TETCardCreate(BaseModel):
    card_id: str
    title: str
    description: str
    class_range: str
    paper_type: str
    start_class: int
    end_class: int
    lesson_count_label: Optional[str] = "25 Lessons"
    button_text: Optional[str] = "OPEN →"

class TETCardOut(BaseModel):
    id: int
    card_id: str
    title: str
    description: str
    class_range: str
    paper_type: str
    start_class: int
    end_class: int
    lesson_count_label: str
    button_text: str
    is_active: bool

    class Config:
        from_attributes = True

class LessonUpdate(BaseModel):
    class_num: Optional[int] = None
    subject: Optional[str] = None
    medium: Optional[str] = None
    term: Optional[str] = None
    lesson_order: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    pdf_url: Optional[str] = None
    short_notes_pdf_url: Optional[str] = None
    video_url: Optional[str] = None
    available_at: Optional[str] = None
    stage4_unlock_time: Optional[str] = None
    stage4_force_open: Optional[bool] = None
    stage5_unlock_time: Optional[str] = None
    stage5_force_open: Optional[bool] = None
    active_stages: Optional[str] = None

class QuizSavePayload(BaseModel):
    questions: List[dict]

class QuizRegenerateQuestionPayload(BaseModel):
    question_index: int
    question_type: Optional[str] = "MCQ"

class LiveMeetingCreate(BaseModel):
    title: str
    meeting_link: Optional[str] = None
    meeting_url: Optional[str] = None
    start_time: str
    end_time: str
    description: Optional[str] = ""

class LiveMeetingOut(BaseModel):
    id: int
    title: str
    meeting_link: str
    start_time: str
    end_time: str
    description: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class DailyPracticeCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    class_num: int = 8
    subject: str = "Social Science"
    term: str = "Term 1"
    active_stages: str = "1,3,4"
    pdf_url: Optional[str] = ""
    video_url: Optional[str] = ""
    quiz_questions: Optional[List[dict]] = None
    test_questions_count: Optional[int] = 20
    time_limit_mins: Optional[int] = 20
    pass_percentage: Optional[int] = 80
    available_date: Optional[str] = None
    is_active: Optional[bool] = True

class DailyPracticeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    class_num: Optional[int] = None
    subject: Optional[str] = None
    term: Optional[str] = None
    active_stages: Optional[str] = None
    pdf_url: Optional[str] = None
    video_url: Optional[str] = None
    quiz_questions: Optional[List[dict]] = None
    test_questions_count: Optional[int] = None
    time_limit_mins: Optional[int] = None
    pass_percentage: Optional[int] = None
    available_date: Optional[str] = None
    is_active: Optional[bool] = None

class DailyPracticeOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    class_num: int
    subject: str
    term: str
    active_stages: str
    pdf_url: Optional[str]
    video_url: Optional[str]
    quiz_questions: Optional[str]
    test_questions_count: int
    time_limit_mins: int
    pass_percentage: int
    available_date: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class GoogleAuthPayload(BaseModel):
    credential: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: str

class UserResetPassword(BaseModel):
    email: str
    new_password: str

class DashboardContainerBase(BaseModel):
    container_key: str
    title: str
    subtitle: Optional[str] = ""
    category: Optional[str] = "general"
    description: Optional[str] = ""
    badge_text: Optional[str] = ""
    button_text: Optional[str] = "OPEN →"
    action_url: Optional[str] = ""
    content_body: Optional[str] = None
    icon_name: Optional[str] = "BookOpen"
    order_index: Optional[int] = 0
    is_active: Optional[bool] = True

class DashboardContainerCreate(DashboardContainerBase):
    pass

class DashboardContainerUpdate(BaseModel):
    container_key: Optional[str] = None
    title: Optional[str] = None
    subtitle: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    badge_text: Optional[str] = None
    button_text: Optional[str] = None
    action_url: Optional[str] = None
    content_body: Optional[str] = None
    icon_name: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None

class DashboardContainerOut(DashboardContainerBase):
    id: int
    created_at: Optional[datetime] = None
    active_meeting: Optional[dict] = None

    class Config:
        from_attributes = True

class PublicSettingsSchema(BaseModel):
    enable_material_download: bool = True
    enable_quiz_download: bool = True
    razorpay_key_id: str = ""
    course_price: int = 999
    original_price: int = 2499
    discount_percent: int = 60

class EnrollmentCreate(BaseModel):
    name: str
    mobile: str
    email: str
    designation: Optional[str] = "Aspirant"
    course_name: Optional[str] = "TET Combo (TET 1, TET 2 & Live Class)"
    amount: Optional[int] = 999
    coupon_code: Optional[str] = None

class EnrollmentManualCreate(BaseModel):
    name: str
    mobile: str
    email: str
    designation: Optional[str] = "Aspirant"
    notes: Optional[str] = None
    course_name: Optional[str] = "TET Combo (TET 1, TET 2 & Live Class)"

class EnrollmentVerifyPayment(BaseModel):
    enrollment_id: int
    payment_id: str
    order_id: Optional[str] = None
    signature: Optional[str] = None

class EnrollmentOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    name: str
    mobile: str
    email: str
    designation: str
    course_name: str
    amount: int
    status: str
    payment_id: Optional[str] = None
    order_id: Optional[str] = None
    payment_method: str
    coupon_code: Optional[str] = None
    discount_amount: Optional[int] = 0
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True






# ================= COUPON SCHEMAS =================
class CouponCreate(BaseModel):
    code: str
    description: Optional[str] = ""
    discount_type: Optional[str] = "percent"  # "percent" or "flat"
    discount_value: int = 10
    min_order_amount: Optional[int] = 0
    max_discount_amount: Optional[int] = 0
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    usage_limit: Optional[int] = 0
    is_active: Optional[bool] = True

class CouponUpdate(BaseModel):
    code: Optional[str] = None
    description: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[int] = None
    min_order_amount: Optional[int] = None
    max_discount_amount: Optional[int] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    usage_limit: Optional[int] = None
    is_active: Optional[bool] = None

class CouponOut(BaseModel):
    id: int
    code: str
    description: Optional[str] = ""
    discount_type: str = "percent"
    discount_value: int = 10
    min_order_amount: int = 0
    max_discount_amount: int = 0
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    usage_limit: int = 0
    times_used: int = 0
    is_active: bool = True
    status: str = "active"  # "active", "scheduled", "expired", "exhausted", "disabled"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CouponValidateRequest(BaseModel):
    code: str
    amount: Optional[int] = 999
    email: Optional[str] = None

class CouponValidateResponse(BaseModel):
    valid: bool
    code: str
    message: str
    discount_type: Optional[str] = "percent"
    discount_value: Optional[int] = 0
    discount_amount: int = 0
    original_amount: int = 0
    final_amount: int = 0

class IncomeTaxCalculateRequest(BaseModel):
    name: str
    sex: Optional[str] = "MALE"
    designation: Optional[str] = "S..G.TEACHER"
    pan_number: Optional[str] = ""
    tan_number: Optional[str] = ""
    phone: Optional[str] = ""
    whatsapp_number: Optional[str] = ""
    school_type: Optional[str] = ""
    school_name: Optional[str] = ""
    office_address: Optional[str] = ""
    basic_pay: float = 0.0
    increment_month: Optional[int] = 0
    pp: Optional[float] = 0.0
    bonus: Optional[float] = 3000.0
    hra_grade: Optional[int] = 1
    cca_grade: Optional[int] = 0
    spl_transport_allowance: Optional[float] = 0.0
    surrender_month: Optional[int] = 0
    pp_surrender: Optional[float] = 0.0
    selection_grade_pay: Optional[float] = 0.0
    selection_grade_month: Optional[int] = 0
    selection_grade_arrears: Optional[float] = 0.0
    strike_month: Optional[int] = 0
    strike_days: Optional[float] = 0.0
    it_advance_monthly: Optional[dict] = {}
    user_email: Optional[str] = "candidate@tet.com"

class IncomeTaxSettingsUpdate(BaseModel):
    heading_title: Optional[str] = None
    sub_heading: Optional[str] = None
    financial_year: Optional[str] = None
    assessment_year: Optional[str] = None
    standard_deduction: Optional[float] = None
    da_mar_apr_pct: Optional[float] = None
    da_may_oct_pct: Optional[float] = None
    da_nov_feb_pct: Optional[float] = None
    cess_pct: Optional[float] = None
    rebate_87a_limit: Optional[float] = None
    footer_credit: Optional[str] = None

