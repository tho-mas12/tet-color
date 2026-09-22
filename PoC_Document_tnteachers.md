# Comprehensive Proof of Concept (PoC) & Detailed Technical Blueprint
## Project: TET Platform — Tamil Nadu Teachers Welfare Association & School Curriculum Portal
**Target Domain**: `tnteachers.in`  
**Target Infrastructure**: BigRock Virtual Private Server (VPS) Hosting  
**Document Version**: 3.0.0 (Comprehensive Technical Blueprint & Operational Manual)  
**Date**: September 2026  

---

## Executive Overview & Mission Statement

The **TET Platform** is an enterprise-grade digital learning portal custom-engineered to empower candidates preparing for the **Tamil Nadu Eligibility Test (TET)** and students across **Grades 1 through 12** following the **Tamil Nadu State Board Curriculum**. 

Commissioned under the domain **`tnteachers.in`**, the platform integrates structured 4-stage sequential learning paths, AI-powered mock examination generation, a live Google Education News notification feed, 100% bilingual (Tamil & English) language toggling, and robust administrative content governance.

---

## 1. Core Platform Capabilities & Process Architecture

1. **Enforced 4-Stage Sequential Progression**: To maximize knowledge retention and conceptual clarity, advanced academic terms and lessons remain locked until prerequisite modules are satisfied ($\text{Term 1} \rightarrow \text{Term 2} \rightarrow \text{Term 3}$; $\text{Lesson 1} \rightarrow \text{Lesson 2}$). Within each lesson, students follow a mandatory 4-stage path: Stage 1 (PDF Notes) $\rightarrow$ Stage 2 (Video Lectures) $\rightarrow$ Stage 3 (200 AI Practice MCQs) $\rightarrow$ Stage 4 (100 AI Timed Test).
2. **AI-Driven Quiz & Evaluation Engine**: Powered by **Google Gemini 1.5 Flash AI**, the engine generates dynamic practice question sets and timed test papers with instant scoring, answer explanations, and automated zero-cost smart fallbacks.
3. **Live Google Education News Notification Feed**: Real-time RSS integration fetching live news headlines regarding Tamil Nadu School Education, TRB TET Exam notifications, and teacher welfare updates directly from Google News.
4. **100% Full-Page Dual Language Engine**: A global top-right toggle (`🌐 த` / `🌐 EN`) seamlessly translates all interface elements, titles, navigation controls, instruction sets, news cards, and test modules between **Tamil (தமிழ்)** and **English** with zero reload latency.
5. **Gamified Student Engagement & Streaks**: Features daily task completion meters, active day streak counters (`🔥 Day Streak`), motivational quotes, and milestone achievement badges (Quick Starter, Bronze Scholar, Silver Academic, and **50-Streak Diamond Legend**).
6. **Executive Admin Management Portal**: Dedicated administrative controls featuring dual upload workflows for Materials Explorer PDFs vs 4-stage lesson modules, dynamic stream subject additions (Physics, Chemistry, Botany, Zoology, Computer Science), Gemini AI key management, and glassmorphic toast notifications.

---

## 2. In-Depth Quiz & Evaluation Engine Working Concepts

The assessment framework is divided into two specialized examination modes: **Stage 3 Practice Mode (200 Questions)** and **Stage 4 Timed Test Mode (100 Questions)**.

### 2.1. Stage 3: 200 AI MCQs Practice Engine Mechanics
- **Untimed Mastery Mode**: Designed for low-stress conceptual learning. Students navigate through 200 curriculum-aligned practice questions at their own pace.
- **Instant Answer Rationale**: Selecting an option immediately displays visual feedback (green for correct, red for incorrect) along with an AI-generated explanation detailing why the answer is correct.
- **Progress Persistence**: Answers are stored in real-time, allowing students to pause and resume practice sessions without losing progress.

### 2.2. Stage 4: 100 AI Timed Examination Mechanics
- **60-Minute Countdown Timer**: Displays a live countdown timer header. When the timer hits 00:00, the exam automatically submits and locks all inputs.
- **Pass Threshold ($\ge 60\%$ marks)**: Scoring $60\%$ or higher ($60+$ correct answers out of 100) marks the lesson as complete, unlocks the subsequent lesson module in sequence, and increments the student's daily study streak.
- **Detailed Score Breakdown**: Post-submission screen displays final percentage score, pass/retake badge, correct vs incorrect question counts, and itemized answer review.
- **Retake Mechanics**: If a student scores below $60\%$, the lesson remains in "Needs Retake" status. The student can retake the exam with newly generated AI questions.

### 2.3. Gemini AI Generation & Zero-Cost Smart Fallback Resiliency
- **Dynamic Prompt Engineering**: The backend queries Google Gemini 1.5 Flash with structured JSON prompts containing class grade, subject, topic, and language medium (Tamil/English).
- **Automated Fallback Activation**: If rate limits are reached or the API key is omitted, the **Zero-Cost Smart Fallback Engine** seamlessly supplies verified curriculum questions from local fallback storage with zero downtime.

---

## 3. Live Google Education News Notification Feed Integration

To keep teachers and candidates informed of official announcements, the Student Dashboard includes a live Google News feed module:
- **Dynamic RSS Parser**: Backend function `fetch_google_education_news()` fetches live news headlines using search parameters: `"Tamil Nadu education TET teachers school"`.
- **Real-Time Card Rendering**: Displays news title, category tag (*Curriculum Update*, *TET Notification*, *Digital Initiative*), publisher source (e.g., *The Hindu*, *TRB Portal*), publication date, and a direct external link (`target="_blank"`) to read the full story on Google News.
- **Bilingual Translations**: News section title, subtitle, and badges translate dynamically based on language toggle (`Live Education & TET News Feed` vs `கல்வி & TET நேரலை செய்திகள்`).

---

## 4. Comprehensive Technical Architecture

### 4.1. System Technology Matrix

| System Layer | Technology Selected | Technical Function & Operational Rationale |
| :--- | :--- | :--- |
| **Frontend Web App** | **React 18 + Vite** | Single Page Application (SPA) providing sub-second page transitions, modular state management, and optimized asset bundling. |
| **Design & Styling** | **Tailwind CSS** | Custom design system utilizing Ice Blue (`#F8FAFC`) background, Deep Royal Navy (`#1E3A8A`) headers, and Cognitive Blue (`#0284C7`) controls. |
| **Typography** | **Plus Jakarta Sans** | Legibility-focused educational font supporting clean rendering for mathematical, Tamil script, and English text. |
| **Backend Server API**| **FastAPI (Python 3.12)**| Asynchronous ASGI framework delivering high concurrency, automated OpenAPI validation, and lightweight payload parsing. |
| **Database Engine** | **SQLite / PostgreSQL** | Relational persistence storing user profiles, academic progress records, material definitions, and lesson metadata. |
| **AI Generator Engine**| **Google Gemini 1.5 Flash API**| Large Language Model generating structured JSON question arrays with automated fallback mechanisms. |
| **News Engine** | **Google News RSS Parser** | Live RSS parser delivering real-time Tamil Nadu education & TRB TET exam updates. |
| **Web Server & Proxy**| **Nginx + Let's Encrypt SSL**| Reverse proxy server performing TLS termination, HTTP/2 multiplexing, static file caching, and daemon management. |

---

### 4.2. Data Flow Architecture

```
[ Student / User Browser ]
           |
           v
 [ DNS Resolution: tnteachers.in ]
           |
           v
 [ Nginx Reverse Proxy (Port 443 HTTPS - SSL Certificate) ]
     |                                               |
     |---> React Static SPA (/dist)                  |---> FastAPI Async Backend (Port 8000)
                                                                 |
                                     +---------------------------+---------------------------+
                                     |                           |                           |
                             [ SQLite Database ]     [ Google Gemini AI API ]    [ Google News RSS Feed ]
```

---

## 5. Production Deployment Blueprint (BigRock VPS)

### Step 1: Connect & Install Dependencies
```bash
ssh root@tnteachers.in
apt update && apt upgrade -y
apt install -y curl git python3-pip python3-venv nginx certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs
```

### Step 2: Deploy Backend Service
```bash
cd /var/www
git clone https://github.com/tho-mas12/TET.git tnteachers.in
cd /var/www/tnteachers.in/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `/etc/systemd/system/tet-backend.service`:
```ini
[Unit]
Description=TET Platform FastAPI Backend Service
After=network.target

[Service]
User=root
WorkingDirectory=/var/www/tnteachers.in/backend
ExecStart=/var/www/tnteachers.in/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload && systemctl enable --now tet-backend
```

### Step 3: Deploy Frontend Build
```bash
cd /var/www/tnteachers.in/frontend
npm install
npm run build
```

### Step 4: Configure Nginx & Issue SSL
Create `/etc/nginx/sites-available/tnteachers.in`:
```nginx
server {
    server_name tnteachers.in www.tnteachers.in;
    root /var/www/tnteachers.in/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/tnteachers.in /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d tnteachers.in -d www.tnteachers.in
```

---

## 6. Downloadable Detailed Word Document

The updated in-depth technical document is available for direct client presentation:

- 📄 **Detailed Technical Word Document**:  
  [Download TET_Platform_Detailed_PoC_tnteachers.docx](file:///C:/Users/Thomas%20Darwin/.gemini/antigravity/brain/256e8d92-c216-43fd-894b-634052057c1a/TET_Platform_Detailed_PoC_tnteachers.docx)
- 🔗 **GitHub Repository**:  
  [https://github.com/tho-mas12/TET.git](https://github.com/tho-mas12/TET.git)

---

## 7. Technical Sign-Off

This document constitutes the comprehensive Proof of Concept (PoC) and Technical Blueprint for **`tnteachers.in`**. All software modules, quiz evaluation engines, Google News feeds, translation frameworks, and administrative portals are fully validated and production-ready.
