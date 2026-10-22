import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_decorations(self, page_count):
        self.saveState()
        
        # Header (Pages > 1)
        if self._pageNumber > 1:
            self.setFont("Helvetica-Bold", 7.5)
            self.setFillColor(colors.HexColor("#0284C7"))
            self.drawString(45, 752, "TAMIL NADU TEACHERS BENCHMARK PORTAL")
            self.setFont("Helvetica", 7.5)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawString(235, 752, "•   COMPLETE MODULE SPECIFICATION & TECHNICAL ARCHITECTURE")
            self.drawRightString(567, 752, "PRODUCTION V2.7 • TNTEACHERS.IN")
            
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.75)
            self.line(45, 744, 567, 744)

        # Footer (All pages)
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.75)
        self.line(45, 42, 567, 42)

        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(colors.HexColor("#0F172A"))
        self.drawString(45, 29, "TNTEACHERS.IN")
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(110, 29, "— Official Handover & System Specifications Document • Confidential & Proprietary")
        
        self.drawRightString(567, 29, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def generate_pdf(output_path):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=45,
        rightMargin=45,
        topMargin=50,
        bottomMargin=48
    )

    styles = getSampleStyleSheet()
    
    c_primary = colors.HexColor("#0B2545")
    c_blue = colors.HexColor("#0055FF")
    c_sky = colors.HexColor("#0284C7")
    c_dark = colors.HexColor("#0F172A")
    c_slate = colors.HexColor("#475569")
    c_orange = colors.HexColor("#EA580C")
    c_emerald = colors.HexColor("#059669")
    c_purple = colors.HexColor("#7C3AED")

    style_title = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=c_primary,
        spaceAfter=2
    )

    style_subtitle = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=c_sky,
        spaceAfter=4
    )

    style_h1 = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=c_primary,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    style_h2 = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12.5,
        textColor=c_blue,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    style_body = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=c_dark,
        spaceAfter=4
    )

    style_bullet = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=11,
        textColor=c_dark,
        leftIndent=10,
        spaceAfter=2.5
    )

    style_table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.white
    )

    style_table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.2,
        leading=9.5,
        textColor=c_dark
    )

    style_table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.2,
        leading=9.5,
        textColor=c_dark
    )

    story = []

    # ================= PAGE 1 =================
    header_data = [
        [
            Paragraph("<b>TAMIL NADU TEACHERS BENCHMARK PORTAL</b>", style_title),
            Paragraph("<font color='#059669'><b>PRODUCTION V2.7 • ENTERPRISE</b></font><br/><font color='#64748B'>Host: 66.116.250.237</font>", ParagraphStyle('HRight', parent=styles['Normal'], fontName='Helvetica', fontSize=7.5, leading=10, alignment=2))
        ],
        [
            Paragraph("OFFICIAL TNTET EXAM LEARNING & BENCHMARK EXAMINATION HUB • <b>TNTEACHERS.IN</b>", style_subtitle),
            Paragraph("<b>Live URL:</b> <font color='#0055FF'><u>https://tnteachers.in</u></font>", ParagraphStyle('HRight2', parent=styles['Normal'], fontName='Helvetica', fontSize=7.5, leading=10, alignment=2))
        ]
    ]
    header_table = Table(header_data, colWidths=[355, 167])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(header_table)

    story.append(HRFlowable(width="100%", thickness=1.2, color=c_blue, spaceBefore=4, spaceAfter=6))

    meta_data = [
        [
            Paragraph("<b>Executive Project Delivery & Complete Technical Specification Handover</b><br/><font color='#475569'>Comprehensive milestone handover document detailing full platform architecture, 9 core modules, 5-stage sequential learning engine, Razorpay monetization, automated coupon engine, daily practice tests, native Android APK (.apk / .aab) mobile distribution with auto-sync, and cloud VPS infrastructure.</font>", style_body),
            Paragraph("<font color='#0284C7'><b>DATE:</b></font> October 2026<br/><font color='#0284C7'><b>STATUS:</b></font> <font color='#059669'><b>Production Live & Verified</b></font><br/><font color='#0284C7'><b>HOST:</b></font> 66.116.250.237 (Ubuntu VPS)<br/><font color='#0284C7'><b>DOMAIN:</b></font> tnteachers.in (SSL Active)", ParagraphStyle('MetaBox', parent=styles['Normal'], fontName='Helvetica', fontSize=7, leading=9.5))
        ]
    ]
    meta_table = Table(meta_data, colWidths=[375, 147])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor("#CBD5E1")),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(meta_table)

    story.append(Spacer(1, 4))

    # Executive Summary
    story.append(Paragraph("1. Executive Summary & Delivery Scope", style_h1))
    story.append(Paragraph(
        "The <b>Tamil Nadu Teachers Benchmark Portal (tnteachers.in)</b> is a premier, full-stack educational and competitive examination platform specifically engineered for <b>Tamil Nadu Teacher Eligibility Test (TNTET)</b> Paper 1 & Paper 2 candidates, B.Ed / D.T.Ed graduates, government school educators, and competitive scholarship aspirants. The platform delivers structured digital textbook repositories, high-yield chapter notes, video classroom explanations, interactive practice engines, and timed benchmark model examinations with an automated 80% passing certificate.",
        style_body
    ))

    # KPI cards
    kpi_data = [
        [
            Paragraph("<b>146+ LESSONS</b><br/><font color='#64748B' size='6'>Classes 1–12 Full Syllabus</font>", ParagraphStyle('KPI1', fontName='Helvetica', fontSize=7.5, leading=9.5, alignment=1)),
            Paragraph("<b>10,000+ QUESTIONS</b><br/><font color='#64748B' size='6'>Bilingual Tamil & English Bank</font>", ParagraphStyle('KPI2', fontName='Helvetica', fontSize=7.5, leading=9.5, alignment=1)),
            Paragraph("<b>5 SEQUENTIAL STAGES</b><br/><font color='#64748B' size='6'>Book • Notes • Video • Practice • Exam</font>", ParagraphStyle('KPI3', fontName='Helvetica', fontSize=7.5, leading=9.5, alignment=1)),
            Paragraph("<b>RAZORPAY + COUPONS</b><br/><font color='#64748B' size='6'>Automated Discounts & Checkout</font>", ParagraphStyle('KPI4', fontName='Helvetica', fontSize=7.5, leading=9.5, alignment=1)),
            Paragraph("<b>ANDROID APK (.apk)</b><br/><font color='#64748B' size='6'>Live Auto-Sync Mobile App</font>", ParagraphStyle('KPI5', fontName='Helvetica', fontSize=7.5, leading=9.5, alignment=1)),
        ]
    ]
    kpi_table = Table(kpi_data, colWidths=[104, 104, 105, 105, 104])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EFF6FF")),
        ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor("#BFDBFE")),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#DBEAFE")),
    ]))
    story.append(kpi_table)

    story.append(Spacer(1, 4))

    # Section 2: 9 Modules Table
    story.append(Paragraph("2. The 9 Core Educational & Examination Modules", style_h1))

    modules_table_data = [
        [
            Paragraph("<b>MODULE NAME</b>", style_table_header),
            Paragraph("<b>ACCESS LEVEL</b>", style_table_header),
            Paragraph("<b>TARGET AUDIENCE & FUNCTIONAL CAPABILITIES</b>", style_table_header)
        ],
        [
            Paragraph("<b>1. TET - 1 (Paper 1)</b>", style_table_cell_bold),
            Paragraph("<font color='#0055FF'><b>PREMIUM COMBO</b></font>", style_table_cell),
            Paragraph("Classes 1 to 8 SGT (Secondary Grade Teacher) preparation. Covers Child Development & Pedagogy, Tamil, English, Mathematics, and EVS. Features all 5 study stages with automatic 80% passing certification.", style_table_cell)
        ],
        [
            Paragraph("<b>2. TET - 2 (Paper 2)</b>", style_table_cell_bold),
            Paragraph("<font color='#0055FF'><b>PREMIUM COMBO</b></font>", style_table_cell),
            Paragraph("Classes 6 to 12 Graduate Teacher (BT Assistant) preparation across Science, Mathematics, and Social Science streams. Incorporates dual question banks (Type 1 Primary & Type 2 Alternate) for authentic testing.", style_table_cell)
        ],
        [
            Paragraph("<b>3. Online Live Class Hub</b>", style_table_cell_bold),
            Paragraph("<font color='#0055FF'><b>PREMIUM COMBO</b></font>", style_table_cell),
            Paragraph("Interactive live virtual classroom integrating Google Meet, Zoom, YouTube Live, and Webex. Includes live scheduling countdowns, recorded archives, and a real-time pulsing <b>LIVE NOW</b> alert indicator.", style_table_cell)
        ],
        [
            Paragraph("<b>4. TN Textbooks Explorer</b>", style_table_cell_bold),
            Paragraph("<font color='#059669'><b>FREE PUBLIC</b></font>", style_table_cell),
            Paragraph("Complete Classes 1 to 12 Tamil Nadu State Board (Samacheer Kalvi) digital curriculum repository. Dynamic multi-filtering by Class, Subject, Medium (Tamil/English), and Term. In-browser responsive PDF reader.", style_table_cell)
        ],
        [
            Paragraph("<b>5. Minnal Educational News</b>", style_table_cell_bold),
            Paragraph("<font color='#059669'><b>FREE PUBLIC</b></font>", style_table_cell),
            Paragraph("Dedicated mobile feed (<b>/news</b>) broadcasting real-time educational flash news, TRB notifications, hall ticket release alerts, syllabus revisions, and School Education Government Orders (G.O.).", style_table_cell)
        ],
        [
            Paragraph("<b>6. Tamil Reading Mastery</b>", style_table_cell_bold),
            Paragraph("<font color='#059669'><b>FREE PUBLIC</b></font>", style_table_cell),
            Paragraph("Tamil literary enrichment module offering pronunciation drills, grammatical treatises (Ilakkanam, Ilakkiyam, Urainadai), and reading comprehension exercises tailored for teacher candidates.", style_table_cell)
        ],
        [
            Paragraph("<b>7. English Reading Mastery</b>", style_table_cell_bold),
            Paragraph("<font color='#059669'><b>FREE PUBLIC</b></font>", style_table_cell),
            Paragraph("Grammar drills, phonetics, reading comprehension passages, and pedagogical English vocabulary builder formulated to build English language proficiency for Paper 1 and Paper 2 candidates.", style_table_cell)
        ],
        [
            Paragraph("<b>8. NMMS Exam Preparation</b>", style_table_cell_bold),
            Paragraph("<font color='#059669'><b>FREE PUBLIC</b></font>", style_table_cell),
            Paragraph("National Means-cum-Merit Scholarship portal for Class 8 students with Mental Ability Test (MAT) and Scholastic Aptitude Test (SAT) practice questions, explanations, and model question papers.", style_table_cell)
        ],
        [
            Paragraph("<b>9. TREAST / TRUST Exam Hub</b>", style_table_cell_bold),
            Paragraph("<font color='#059669'><b>FREE PUBLIC</b></font>", style_table_cell),
            Paragraph("Tamil Nadu Rural Students Talent Search Examination portal offering subject-wise practice tests, previous year papers, and model question papers for government school rural scholars.", style_table_cell)
        ]
    ]

    mod_table = Table(modules_table_data, colWidths=[118, 84, 320])
    mod_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 2.8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.8),
        ('LEFTPADDING', (0,0), (-1,-1), 4.5),
        ('RIGHTPADDING', (0,0), (-1,-1), 4.5),
        ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(mod_table)

    story.append(PageBreak())

    # ================= PAGE 2 =================
    # Section 3: 5-Stage Sequential Pipeline
    story.append(Paragraph("3. The 5-Stage Sequential Learning & Examination Engine", style_h1))
    story.append(Paragraph(
        "To ensure thorough pedagogical mastery and prevent shallow memorization, every curriculum lesson enforces an innovative <b>5-Stage Sequential Study Pipeline</b>. Candidates unlock subsequent stages and future lessons only upon completing prerequisite steps and achieving qualifying benchmarks:",
        style_body
    ))

    stages_data = [
        [
            Paragraph("<b>STAGE & STEP</b>", style_table_header),
            Paragraph("<b>MODULE TITLE</b>", style_table_header),
            Paragraph("<b>FUNCTIONAL SPECIFICATION & CANDIDATE WORKFLOW</b>", style_table_header)
        ],
        [
            Paragraph("<b>Stage 1</b><br/><font color='#0055FF'><b>BOOK</b></font>", style_table_cell_bold),
            Paragraph("<b>Lesson Textbook PDF</b><br/><font color='#64748B'>Curriculum Textbook PDF</font>", style_table_cell),
            Paragraph("Candidates read the complete government textbook chapter directly in-browser. Integrated responsive PDF reader with page controls, zoom, and text search. Admin can replace or update the PDF anytime.", style_table_cell)
        ],
        [
            Paragraph("<b>Stage 2</b><br/><font color='#0284C7'><b>NOTES</b></font>", style_table_cell_bold),
            Paragraph("<b>Short Notes & Summary</b><br/><font color='#64748B'>High-Yield Revision PDF</font>", style_table_cell),
            Paragraph("High-yield revision points, summary bullet charts, and important memory anchors curated for fast review before tackling practice questions. Admin can upload replacement notes PDF.", style_table_cell)
        ],
        [
            Paragraph("<b>Stage 3</b><br/><font color='#059669'><b>VIDEO</b></font>", style_table_cell_bold),
            Paragraph("<b>Video Lecture Class</b><br/><font color='#64748B'>Embedded Video Explanation</font>", style_table_cell),
            Paragraph("Embedded video tutorial explaining core concepts, pedagogical nuances, and memory shortcuts. Features responsive layout with fullscreen theater support and YouTube embed player integration.", style_table_cell)
        ],
        [
            Paragraph("<b>Stage 4</b><br/><font color='#EA580C'><b>PRACTICE</b></font>", style_table_cell_bold),
            Paragraph("<b>Practice Test Engine</b><br/><font color='#64748B'>Type 1 Practice MCQs</font>", style_table_cell),
            Paragraph("Interactive practice engine with instant answer validation, correct answer reveals, pedagogical theory explanations, and untimed learning mode to reinforce conceptual clarity.", style_table_cell)
        ],
        [
            Paragraph("<b>Stage 5</b><br/><font color='#7C3AED'><b>FINAL EXAM</b></font>", style_table_cell_bold),
            Paragraph("<b>Online Timed Test (≥80%)</b><br/><font color='#64748B'>Type 2 Benchmark Exam</font>", style_table_cell),
            Paragraph("Formal timed examination under real TNTET conditions. Requires scoring at least <b>80% (Pass Benchmark)</b> to certify lesson completion and unlock the next lesson in the curriculum. Automatically locks back to Restudy Mode if score is < 80%.", style_table_cell)
        ]
    ]

    stg_table = Table(stages_data, colWidths=[80, 130, 312])
    stg_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(stg_table)

    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Key Progression & Unlocking Rules:</b>", style_h2))
    story.append(Paragraph("• <b>Sequential Curriculum Lock:</b> Lessons must be cleared in order (Term 1 $\\rightarrow$ Term 2 $\\rightarrow$ Term 3; Lesson 1 $\\rightarrow$ Lesson 2). A lesson only unlocks when the previous lesson achieves a $\\ge 80\\%$ qualifying score.", style_bullet))
    story.append(Paragraph("• <b>Dual Question Banks:</b> Stage 4 utilizes Type 1 Primary questions, while Stage 5 utilizes Type 2 Alternate questions. If a candidate scores below 80%, the retake exam draws fresh unmemorized questions.", style_bullet))
    story.append(Paragraph("• <b>Daily Schedule Time-Lock:</b> By default, Stage 5 examinations unlock automatically at <b>8:00 PM IST</b> daily. Administrators can override this with the <b>Force Unlock Switch (Open Immediately)</b> to unlock tests for students right away.", style_bullet))

    story.append(Spacer(1, 6))

    # Section 4: Daily Practice Module
    story.append(Paragraph("4. Daily Practice Test System & Custom Stage Selection", style_h1))
    story.append(Paragraph(
        "In addition to sequential curriculum progression, the platform includes a high-impact <b>Daily Practice Module</b> designed to cultivate daily study streaks and deliver targeted mock tests directly onto the student dashboard:",
        style_body
    ))
    story.append(Paragraph("• <b>Dashboard Highlighting:</b> Featured at the top of the student home screen under <i>'Today's Daily Practice Tests (Daily Model Exams)'</i> for immediate one-click test taking.", style_bullet))
    story.append(Paragraph("• <b>Custom Stage Cherry-Picking:</b> While full curriculum lessons enforce all 5 stages, the Daily Practice Admin tool allows selecting <b>any custom subset of the 5 stages</b> for that day (e.g., Stage 1 Notes + Stage 4 Practice + Stage 5 Exam only).", style_bullet))
    story.append(Paragraph("• <b>Timed Examination Engine:</b> Candidates take tests with an active countdown timer, auto-submission on expiration, and instant performance analysis against the 80% passing benchmark.", style_bullet))
    story.append(Paragraph("• <b>Admin Verification & Export:</b> Admins can preview questions using <b>View Quiz</b> or download the test using <b>Download PDF</b> for offline printing and content verification.", style_bullet))

    story.append(PageBreak())

    # ================= PAGE 3 =================
    # Section 5: Razorpay & Coupons
    story.append(Paragraph("5. Razorpay Monetization & Automated Coupon Engine", style_h1))
    story.append(Paragraph(
        "A full-fledged commercial monetization system enables turnkey course purchases, lead capture, and promotional discount code implementation:",
        style_body
    ))

    pay_data = [
        [
            Paragraph("<b>COMMERCIAL CAPABILITY</b>", style_table_header),
            Paragraph("<b>TECHNICAL SPECIFICATION & AUTOMATION BEHAVIOR</b>", style_table_header)
        ],
        [
            Paragraph("<b>All-In-One Combo Pass</b>", style_table_cell_bold),
            Paragraph("Enrolling or paying for either TET 1 or TET 2 automatically unlocks all 3 premium modules simultaneously (TET 1 + TET 2 + Online Live Class).", style_table_cell)
        ],
        [
            Paragraph("<b>Course Pricing Controls</b>", style_table_cell_bold),
            Paragraph("Admin configurable <b>Original MRP</b> (e.g. Rs. 2,499), <b>Course Selling Price</b> (e.g. Rs. 999), and <b>Default Discount</b> (e.g. 60%) displayed with live preview badges.", style_table_cell)
        ],
        [
            Paragraph("<b>Razorpay Payment Gateway</b>", style_table_cell_bold),
            Paragraph("Client-side dynamic gateway checkout (<code>checkout.js</code>) with pre-filled candidate details. Server-side HMAC-SHA256 signature verification guarantees 100% cryptographic payment security.", style_table_cell)
        ],
        [
            Paragraph("<b>Automated Coupon Engine</b>", style_table_cell_bold),
            Paragraph("Create custom codes or auto-generate promo codes (e.g. <code>TET60</code>, <code>DIWALI2026</code>). Supports Percentage (%) or Flat (Rs.) discounts, minimum order amount, and maximum discount caps.", style_table_cell)
        ],
        [
            Paragraph("<b>Schedule Automation</b>", style_table_cell_bold),
            Paragraph("Coupons include automated start date/time (auto-enable) and end date/time (auto-disable/expire). System automatically transitions status (Active, Scheduled, Expired, Exhausted, Disabled).", style_table_cell)
        ],
        [
            Paragraph("<b>Redemption Limit Tracking</b>", style_table_cell_bold),
            Paragraph("Enforce maximum allowed redemptions (e.g. First 100 students). Times-used counter increments atomically upon successful payment verification.", style_table_cell)
        ],
        [
            Paragraph("<b>Admin Free Enrollment Override</b>", style_table_cell_bold),
            Paragraph("Administrators can manually enroll any candidate for free directly from the Admin Panel, bypassing the payment gateway with authority audit notes.", style_table_cell)
        ]
    ]

    pay_table = Table(pay_data, colWidths=[140, 382])
    pay_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(pay_table)

    story.append(Spacer(1, 6))

    # Section 6: High-Fidelity PDF Quiz Export
    story.append(Paragraph("6. High-Fidelity PDF Quiz Export & Formatting Engine", style_h1))
    story.append(Paragraph(
        "A dedicated print-ready PDF export engine (<code>pdfExport.js</code>) allows students and administrators to generate beautifully typeset, aligned quiz papers:",
        style_body
    ))
    story.append(Paragraph("• <b>Two-Column Question Stem Layout:</b> Clean separation of question numbering and question content, eliminating uneven margins and preventing ragged gaps.", style_bullet))
    story.append(Paragraph("• <b>Adaptive Option Grid:</b> Automatically renders options in a 2-column grid for short answers ($\\le 34$ chars) or full-width rows for long statements.", style_bullet))
    story.append(Paragraph("• <b>Linguistic Text Sanitization:</b> Universal regex cleaning that removes duplicate numbering (<code>1.</code>, <code>(A)</code>), InDesign metadata (<code>.indd</code>), timestamps, running headers, and fixes split Tamil pulli/vowel glyphs.", style_bullet))
    story.append(Paragraph("• <b>Page Break Avoidance:</b> Individual questions are guarded with CSS <code>break-inside: avoid</code> to prevent questions from splitting across page boundaries.", style_bullet))

    story.append(PageBreak())

    # ================= PAGE 4 =================
    # Section 7: Super-Admin Management Center
    story.append(Paragraph("7. Super-Admin Management Center (/admin)", style_h1))
    story.append(Paragraph(
        "The protected administration back-office delivers complete operational control over all website data, content, learners, and system configurations across 11 dedicated management tabs:",
        style_body
    ))

    admin_tabs = [
        [
            Paragraph("<b>ADMIN TAB</b>", style_table_header),
            Paragraph("<b>OPERATIONAL CAPABILITIES & WORKFLOWS</b>", style_table_header)
        ],
        [
            Paragraph("<b>1. Overview & Stats</b>", style_table_cell_bold),
            Paragraph("Real-time key metrics: Total registered students, enrolled paid candidates, lesson modules published, question count, and database health.", style_table_cell)
        ],
        [
            Paragraph("<b>2. Enrollments CRM</b>", style_table_cell_bold),
            Paragraph("Search, filter, and monitor all student purchase leads, payment IDs, order IDs, and status. Includes <b>+ Enroll Candidate Free</b> button for administrative access grants.", style_table_cell)
        ],
        [
            Paragraph("<b>3. Daily Practice CMS</b>", style_table_cell_bold),
            Paragraph("Create daily class-wise tests with custom stage selection, attach study PDFs, set question counts, test duration, and download formatted quiz verification PDFs.", style_table_cell)
        ],
        [
            Paragraph("<b>4. Lesson Modules CMS</b>", style_table_cell_bold),
            Paragraph("Upload new lessons, view complete catalog, edit core metadata, and launch the <b>Edit Lesson Module & Schedule</b> modal with direct PDF replacements and stage time-locks.", style_table_cell)
        ],
        [
            Paragraph("<b>5. Quiz Management</b>", style_table_cell_bold),
            Paragraph("Manage Type 1 and Type 2 question banks. Incorporates Google Gemini Generative AI question generator, single-question regenerator, and bulk manual question editors.", style_table_cell)
        ],
        [
            Paragraph("<b>6. Live Meetings CMS</b>", style_table_cell_bold),
            Paragraph("Schedule and broadcast live virtual classes with Google Meet, Zoom, or YouTube links. Controls active meeting status and triggers the student 'LIVE NOW' banner.", style_table_cell)
        ],
        [
            Paragraph("<b>7. Materials CMS</b>", style_table_cell_bold),
            Paragraph("Curriculum library manager for Class 1 to 12 textbook PDFs. Upload, organize by subject and medium, preview documents, and delete old syllabus files.", style_table_cell)
        ],
        [
            Paragraph("<b>8. Settings & Pricing</b>", style_table_cell_bold),
            Paragraph("Configure Razorpay API Keys, set Course MRP & Selling Price, toggle website-wide student Material PDF & Quiz PDF download permissions, and manage Promo Coupons.", style_table_cell)
        ],
        [
            Paragraph("<b>9. Announcements</b>", style_table_cell_bold),
            Paragraph("Publish breaking educational ticker announcements displayed across student dashboards with priority badges and expiry controls.", style_table_cell)
        ],
        [
            Paragraph("<b>10. Learning Containers</b>", style_table_cell_bold),
            Paragraph("Customize and reorder all 9 learning containers on the student dashboard, configure access rules, and modify badge labels.", style_table_cell)
        ],
        [
            Paragraph("<b>11. VPS Host Monitor</b>", style_table_cell_bold),
            Paragraph("Server operations monitor: tracks host CPU, memory, disk usage, active systemd service status (<code>tet-backend.service</code>), and displays live journal logs.", style_table_cell)
        ]
    ]

    admin_table = Table(admin_tabs, colWidths=[125, 397])
    admin_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 2.8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.8),
        ('LEFTPADDING', (0,0), (-1,-1), 4.5),
        ('RIGHTPADDING', (0,0), (-1,-1), 4.5),
        ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(admin_table)

    story.append(Spacer(1, 6))

    # Edit Lesson Modal Highlight
    story.append(Paragraph("<b>Enhanced Edit Lesson Module & Schedule Modal:</b>", style_h2))
    story.append(Paragraph("• <b>Comprehensive 5-Stage Configuration:</b> Direct file upload/replacement for Stage 1 Textbook PDF and Stage 2 Short Notes PDF, Video URL input for Stage 3, and unlock time-locks & force-open overrides for Stage 4 & 5.", style_bullet))
    story.append(Paragraph("• <b>Active Stage Inclusion Selector:</b> Checkboxes allowing administrators to selectively enable/disable specific stages for any lesson.", style_bullet))
    story.append(Paragraph("• <b>Release Date Scheduling:</b> Future release date & time calendar lock, with quick presets (Immediate Release, Tonight 8 PM, Tomorrow 6 AM).", style_bullet))

    story.append(PageBreak())

    # ================= PAGE 5 =================
    # Section 8: Mobile PWA & Android APK Distribution Engine
    story.append(Paragraph("8. Mobile PWA & Native Android APK (.apk / .aab) Distribution Engine", style_h1))
    story.append(Paragraph(
        "To provide a seamless, high-speed mobile learning experience for educators and candidates across Tamil Nadu, the platform incorporates dual mobile application distribution architectures: <b>Browser-based Progressive Web App (PWA)</b> and a standalone, production-compiled <b>Android APK (.apk / .aab)</b> package hosted permanently on the production server domain:",
        style_body
    ))

    apk_data = [
        [
            Paragraph("<b>DISTRIBUTION CHANNEL</b>", style_table_header),
            Paragraph("<b>TECHNICAL SPECIFICATION & AUTOMATION BEHAVIOR</b>", style_table_header)
        ],
        [
            Paragraph("<b>Direct APK Download Link</b><br/><font color='#0055FF'><b>https://tnteachers.in/TNTET_App.apk</b></font>", style_table_cell_bold),
            Paragraph("Production-signed Android <b>.apk</b> package (~5.4 MB) hosted permanently in the production web root. Provides direct one-click downloading and sideloading on all Android smartphones without requiring third-party store logins. Compatible with Android 7.0 (API 24) through Android 14+ (covering 99.8% of active devices in India).", style_table_cell)
        ],
        [
            Paragraph("<b>Google Play Store Bundle</b><br/><font color='#0055FF'><b>https://tnteachers.in/TNTET_App.aab</b></font>", style_table_cell_bold),
            Paragraph("Production Android App Bundle (<b>.aab</b>) generated with an enterprise 2048-bit RSA signing key. Completely prepared and verified for one-click upload and deployment to the official Google Play Console.", style_table_cell)
        ],
        [
            Paragraph("<b>Automatic Real-Time Sync</b><br/><font color='#059669'><b>Trusted Web Activity (TWA)</b></font>", style_table_cell_bold),
            Paragraph("Engineered using Google's modern <b>Trusted Web Activity (TWA)</b> protocol via Bubblewrap CLI. <b>Crucial Architectural Benefit: Every curriculum update, new lesson, PDF upload, exam schedule modification, discount coupon, or UI improvement made on the server updates INSTANTLY inside the installed APK on students' phones without requiring any re-download or APK reinstall.</b>", style_table_cell)
        ],
        [
            Paragraph("<b>Service Worker & Offline Engine</b><br/><font color='#EA580C'><b>sw.js + Web Manifest</b></font>", style_table_cell_bold),
            Paragraph("Full W3C Web App Manifest (<code>manifest.json</code>) with standalone display mode, orientation lock (portrait-primary), adaptive splash screen theming (<code>#061B36</code>), branded status bars (<code>#0055FF</code>), and high-resolution maskable app icons (192px and 512px).", style_table_cell)
        ],
        [
            Paragraph("<b>Instant In-Browser PWA Install</b><br/><font color='#0284C7'><b>Zero-Data Installation</b></font>", style_table_cell_bold),
            Paragraph("On mobile browsers, candidates can install directly without downloading file packages: Google Chrome and Edge display a native <i>'Install App / Add to Home screen'</i> banner on Android, while Apple Safari offers one-tap <i>'Add to Home Screen'</i> installation for iPhone/iPad users.", style_table_cell)
        ],
        [
            Paragraph("<b>Portal Download Call-To-Actions</b><br/><font color='#7C3AED'><b>Home & Dashboard CTAs</b></font>", style_table_cell_bold),
            Paragraph("Prominent branded <b>'Android App (.apk) / மொபைல் செயலி'</b> download buttons are permanently embedded on the public <b>Home / Landing Page</b> hero banner and the authenticated <b>Student Dashboard</b> header for instantaneous candidate access.", style_table_cell)
        ]
    ]

    apk_table = Table(apk_data, colWidths=[140, 382])
    apk_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(apk_table)

    story.append(Spacer(1, 6))

    # Section 9: Technical Stack
    story.append(Paragraph("9. Technical Stack & Infrastructure Specifications", style_h1))

    stack_data = [
        [
            Paragraph("<b>LAYER</b>", style_table_header),
            Paragraph("<b>TECHNOLOGY & VERSION</b>", style_table_header),
            Paragraph("<b>ARCHITECTURAL ROLE & SPECIFICATION</b>", style_table_header)
        ],
        [
            Paragraph("<b>Frontend SPA</b>", style_table_cell_bold),
            Paragraph("React 19.2 + Vite 8.2", style_table_cell),
            Paragraph("Component-based Single Page Application with fast ESM bundling and minimal production footprint.", style_table_cell)
        ],
        [
            Paragraph("<b>Mobile App (APK)</b>", style_table_cell_bold),
            Paragraph("Android TWA + Bubblewrap", style_table_cell),
            Paragraph("Trusted Web Activity with OpenJDK 17 & Android SDK 34/36, auto-synced with live domain.", style_table_cell)
        ],
        [
            Paragraph("<b>Styling & Icons</b>", style_table_cell_bold),
            Paragraph("Tailwind CSS v4 + Lucide", style_table_cell),
            Paragraph("Utility-first design system optimized for mobile viewports, safe-area padding, and high-DPI displays.", style_table_cell)
        ],
        [
            Paragraph("<b>Backend Framework</b>", style_table_cell_bold),
            Paragraph("FastAPI 0.110 (Python 3.11)", style_table_cell),
            Paragraph("High-performance asynchronous REST API framework with Pydantic v2 data validation schemas.", style_table_cell)
        ],
        [
            Paragraph("<b>ASGI Server</b>", style_table_cell_bold),
            Paragraph("Uvicorn 0.28 (2 Workers)", style_table_cell),
            Paragraph("Production multi-worker event loop managed by Linux systemd (<code>tet-backend.service</code>).", style_table_cell)
        ],
        [
            Paragraph("<b>Relational Database</b>", style_table_cell_bold),
            Paragraph("MariaDB / MySQL 8.0", style_table_cell),
            Paragraph("Enterprise relational database with SQLAlchemy 2.0 ORM, connection pooling, and automatic migrations.", style_table_cell)
        ],
        [
            Paragraph("<b>Cloud VPS Host</b>", style_table_cell_bold),
            Paragraph("AlmaLinux 9.8 / Ubuntu VPS", style_table_cell),
            Paragraph("Dedicated cloud instance (IP: <b>66.116.250.237</b>) with Nginx reverse proxy and HTTP/2.", style_table_cell)
        ],
        [
            Paragraph("<b>SSL & Security</b>", style_table_cell_bold),
            Paragraph("Let's Encrypt Certbot", style_table_cell),
            Paragraph("Automated TLS 1.3 encryption, CORS origins whitelisting, and HMAC-SHA256 signature verification.", style_table_cell)
        ]
    ]

    stack_table = Table(stack_data, colWidths=[90, 130, 302])
    stack_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 4.5),
        ('RIGHTPADDING', (0,0), (-1,-1), 4.5),
        ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(stack_table)

    story.append(PageBreak())

    # ================= PAGE 6 =================
    # Section 10: REST APIs
    story.append(Paragraph("10. Key REST API Endpoints Specification", style_h1))

    api_data = [
        [
            Paragraph("<b>METHOD</b>", style_table_header),
            Paragraph("<b>ENDPOINT ROUTE</b>", style_table_header),
            Paragraph("<b>DESCRIPTION & ACCESS SCOPE</b>", style_table_header)
        ],
        [
            Paragraph("<b>GET</b>", style_table_cell_bold),
            Paragraph("<code>/api/public-settings</code>", style_table_cell),
            Paragraph("Returns public portal settings: download permissions, Razorpay key, course price, and discount %.", style_table_cell)
        ],
        [
            Paragraph("<b>GET</b>", style_table_cell_bold),
            Paragraph("<code>/api/learning/lesson/{id}</code>", style_table_cell),
            Paragraph("Retrieves lesson textbook PDF, short notes, video URL, stage progress, and time-lock states.", style_table_cell)
        ],
        [
            Paragraph("<b>POST</b>", style_table_cell_bold),
            Paragraph("<code>/api/learning/lesson/{id}/submit-test</code>", style_table_cell),
            Paragraph("Evaluates student Stage 5 exam submission, computes percentage, and enforces 80% passing rule.", style_table_cell)
        ],
        [
            Paragraph("<b>POST</b>", style_table_cell_bold),
            Paragraph("<code>/api/coupons/validate</code>", style_table_cell),
            Paragraph("Validates coupon code, checks date automation and usage limits, and returns discounted amount.", style_table_cell)
        ],
        [
            Paragraph("<b>POST</b>", style_table_cell_bold),
            Paragraph("<code>/api/enrollments/register</code>", style_table_cell),
            Paragraph("Captures student lead details and creates pending order with optional coupon code applied.", style_table_cell)
        ],
        [
            Paragraph("<b>POST</b>", style_table_cell_bold),
            Paragraph("<code>/api/enrollments/verify-payment</code>", style_table_cell),
            Paragraph("Verifies Razorpay HMAC signature, activates course access, and increments coupon redemptions.", style_table_cell)
        ],
        [
            Paragraph("<b>GET</b>", style_table_cell_bold),
            Paragraph("<code>/api/daily-practice</code>", style_table_cell),
            Paragraph("Retrieves active daily practice mock tests configured with custom stages for student dashboard.", style_table_cell)
        ],
        [
            Paragraph("<b>GET</b>", style_table_cell_bold),
            Paragraph("<code>/api/meetings/active</code>", style_table_cell),
            Paragraph("Returns ongoing live classroom meetings, triggering the student portal 'LIVE NOW' banner.", style_table_cell)
        ],
        [
            Paragraph("<b>GET</b>", style_table_cell_bold),
            Paragraph("<code>/api/admin/lessons</code>", style_table_cell),
            Paragraph("Admin endpoint listing all 146+ curriculum lessons with 5-stage status, question counts, and locks.", style_table_cell)
        ],
        [
            Paragraph("<b>PUT</b>", style_table_cell_bold),
            Paragraph("<code>/api/admin/lessons/{id}</code>", style_table_cell),
            Paragraph("Updates lesson metadata, textbook PDF URL, short notes URL, video URL, and Stage 4/5 schedules.", style_table_cell)
        ],
        [
            Paragraph("<b>POST</b>", style_table_cell_bold),
            Paragraph("<code>/api/admin/lessons/{id}/upload-pdf</code>", style_table_cell),
            Paragraph("Uploads and replaces Stage 1 Lesson Textbook PDF file directly on the production server.", style_table_cell)
        ],
        [
            Paragraph("<b>POST</b>", style_table_cell_bold),
            Paragraph("<code>/api/admin/lessons/{id}/upload-short-notes</code>", style_table_cell),
            Paragraph("Uploads and replaces Stage 2 Short Notes PDF file directly on the production server.", style_table_cell)
        ],
        [
            Paragraph("<b>POST</b>", style_table_cell_bold),
            Paragraph("<code>/api/admin/coupons</code>", style_table_cell),
            Paragraph("Creates a new promo coupon with percentage/flat discount, date range automation, and usage limits.", style_table_cell)
        ],
        [
            Paragraph("<b>POST</b>", style_table_cell_bold),
            Paragraph("<code>/api/admin/enrollments/manual</code>", style_table_cell),
            Paragraph("Administrative override to grant 100% free full access to any student without payment.", style_table_cell)
        ]
    ]

    api_table = Table(api_data, colWidths=[60, 180, 282])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 4.5),
        ('RIGHTPADDING', (0,0), (-1,-1), 4.5),
        ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(api_table)

    story.append(Spacer(1, 10))

    # ================= SECTION 11: FINAL HANDOVER =================
    story.append(Paragraph("11. Final Project Handover, Verification & Sign-Off", style_h1))
    story.append(Paragraph(
        "All requested platform enhancements, architectural modifications, coupon engines, stage configuration controls, PDF quiz alignment fixes, and mobile Android APK (.apk / .aab) builds have been successfully concluded, verified, and placed into live production.",
        style_body
    ))

    # Verification Checklist
    check_data = [
        [Paragraph("<b>DELIVERABLE / MILESTONE ITEM</b>", style_table_header), Paragraph("<b>VERIFICATION RESULT</b>", style_table_header), Paragraph("<b>EVIDENCE & LIVE BEHAVIOR</b>", style_table_header)],
        [Paragraph("1. All 9 Educational Modules", style_table_cell_bold), Paragraph("<font color='#059669'><b>VERIFIED LIVE</b></font>", style_table_cell), Paragraph("TET 1, TET 2, Live Classes, Textbooks, Minnal News, Tamil, English, NMMS, TRUST active.", style_table_cell)],
        [Paragraph("2. 5-Stage Sequential Engine", style_table_cell_bold), Paragraph("<font color='#059669'><b>VERIFIED LIVE</b></font>", style_table_cell), Paragraph("Book, Notes, Video, Practice, and 80% Timed Final Exam progression verified on curriculum.", style_table_cell)],
        [Paragraph("3. Daily Practice System", style_table_cell_bold), Paragraph("<font color='#059669'><b>VERIFIED LIVE</b></font>", style_table_cell), Paragraph("Custom stage selection, dashboard cards, timed test modal, and admin PDF export active.", style_table_cell)],
        [Paragraph("4. Razorpay + Coupon Engine", style_table_cell_bold), Paragraph("<font color='#059669'><b>VERIFIED LIVE</b></font>", style_table_cell), Paragraph("Pricing (Rs. 2499 / Rs. 999), promo codes, date automation, limits, and verification active.", style_table_cell)],
        [Paragraph("5. PDF Quiz Print Alignment", style_table_cell_bold), Paragraph("<font color='#059669'><b>VERIFIED LIVE</b></font>", style_table_cell), Paragraph("2-column numbering grid, adaptive option layout, and InDesign/.indd metadata stripped.", style_table_cell)],
        [Paragraph("6. Edit Lesson 5-Stage CMS", style_table_cell_bold), Paragraph("<font color='#059669'><b>VERIFIED LIVE</b></font>", style_table_cell), Paragraph("All 5 stages editable with direct PDF replacement upload and schedule time-locks.", style_table_cell)],
        [Paragraph("7. Standalone Android APK (.apk)", style_table_cell_bold), Paragraph("<font color='#059669'><b>VERIFIED LIVE</b></font>", style_table_cell), Paragraph("Hosted at https://tnteachers.in/TNTET_App.apk (~5.4 MB) with automatic real-time sync.", style_table_cell)],
        [Paragraph("8. Cloud VPS & SSL Operations", style_table_cell_bold), Paragraph("<font color='#059669'><b>VERIFIED LIVE</b></font>", style_table_cell), Paragraph("Host 66.116.250.237, Uvicorn service active, MariaDB active, Nginx SSL certificate verified.", style_table_cell)],
    ]
    check_table = Table(check_data, colWidths=[140, 100, 282])
    check_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(check_table)

    story.append(Spacer(1, 8))

    # Official Sign-Off Block
    signoff_data = [
        [
            Paragraph("<b>PROJECT TITLE:</b>", style_table_cell_bold),
            Paragraph("Tamil Nadu Teachers Benchmark Portal (TNTET Learning & Exam Platform)", style_table_cell)
        ],
        [
            Paragraph("<b>LIVE WEB PORTAL:</b>", style_table_cell_bold),
            Paragraph("<font color='#0055FF'><u>https://tnteachers.in</u></font>   |   <b>Public IP:</b> 66.116.250.237", style_table_cell)
        ],
        [
            Paragraph("<b>ANDROID APK LINK:</b>", style_table_cell_bold),
            Paragraph("<font color='#0055FF'><u>https://tnteachers.in/TNTET_App.apk</u></font> (Play Store Bundle: <code>TNTET_App.aab</code>)", style_table_cell)
        ],
        [
            Paragraph("<b>SOURCE REPOSITORY:</b>", style_table_cell_bold),
            Paragraph("<code>GitHub / tho-mas12 / tet-color</code> (Branch: <code>main</code>)", style_table_cell)
        ],
        [
            Paragraph("<b>RELEASE VERSION:</b>", style_table_cell_bold),
            Paragraph("Production Release v2.7 Mobile PWA & APK Edition (October 2026)", style_table_cell)
        ],
        [
            Paragraph("<b>DELIVERABLE STATUS:</b>", style_table_cell_bold),
            Paragraph("<font color='#059669'><b>APPROVED, VERIFIED & 100% PRODUCTION OPERATIONAL</b></font>", style_table_cell_bold)
        ]
    ]

    signoff_table = Table(signoff_data, colWidths=[130, 392])
    signoff_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#94A3B8")),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
    ]))
    story.append(signoff_table)

    story.append(Spacer(1, 10))
    story.append(Paragraph("<font color='#64748B' size='7.5'><i>TN Teachers Benchmark Portal Technical Specification • Prepared for Project Stakeholders & System Verification • © 2026 Confidential & Proprietary</i></font>", ParagraphStyle('FooterNote', alignment=1)))

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Documentation PDF generated successfully at: {output_path}")

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "TNTET_Platform_Delivery_Documentation.pdf"
    generate_pdf(out)
