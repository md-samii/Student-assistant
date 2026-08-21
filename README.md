# 🎓 AI Student Assistant Platform — Final Engineering Release

A modern, production-ready, full-stack **AI Student Assistant Platform** designed for university engineering students and administrators. Built with React (Vite), TypeScript, Tailwind CSS, Node.js (Express), Prisma ORM, SQLite/PostgreSQL, and OpenAI GPT APIs.

---

## 🌟 Key Features

### For Students
- 🤖 **Context-Aware AI Academic Assistant:** Syllabus-tailored AI tutoring powered by OpenAI GPT, equipped with subject filters, code snippet syntax highlighting, bookmarked answers, and quick prompt chips.
- 📚 **Study Resources Hub:** Google Drive integrated PDF notes, PPTs, lab manuals, and previous year exam papers categorized by university branch, semester, and modules (Modules 1–5).
- 🎥 **Curated Video Recommendations:** High-resolution educational YouTube tutorials matched to specific subject topics.
- 🧠 **Interactive Quiz System:** Subject quizzes with live countdown timers, auto-submission on timeout, answer key protection, score reports, and step-by-step concept explanations.
- 📁 **Digital Document Locker:** Upload and manage academic credentials (Resumes, Certificates, Marks Cards) with category dropzones and quota meters.
- 💼 **Careers & Opportunities Portal:** Unified tracking for **Internships** (stipends, deadlines), **Full-Time Jobs** (salary packages, CTC badges), and **Government Competitive Exams** (GATE, UPSC, SSC countdown timers).
- 🛠️ **Skill Matrix & Project Portfolio:** Technical skill management with proficiency badges, portfolio project showcases, and AI-driven Skill Gap analysis.
- 🔔 **In-App Notification Center:** Real-time navbar bell dropdown with unread badge counter for academic announcements and deadline alerts.
- 🎓 **Semester Upgrade Wizard:** Advance academic semesters with a single click, unlocking fresh subjects, notes, and quiz banks automatically.
- ⚙️ **User Settings & Privacy:** Theme mode switcher (Dark / Light / System default), notification toggles, and GDPR-compliant personal JSON data archive download.

### For Administrators
- 📊 **Executive Dashboard:** High-level platform statistics (Total Students, Active Resources, Quizzes Taken, AI Queries).
- 👥 **Student Account Management:** Searchable student list with account activation and deactivation toggles.
- 📚 **Curriculum & Resource Manager:** Add and manage academic subjects, attach Google Drive study links, and publish custom multi-question quizzes with answer keys.
- 📈 **Visual Analytics & CSV Export Engine:** Real-time engagement trend charts, quiz score distributions, and one-click `.csv` exports for Student Roster and Quiz Attempt data.
- 🔒 **Security Audit Logging:** System security log viewer tracking critical admin actions and IP addresses.

---

## 🏗️ Architecture & Technology Stack

```text
[ React 18 + Vite + Tailwind CSS ]  <--- (Axios REST API calls) --->  [ Node.js + Express (TypeScript) ]
         │                                                                    │
         ├── Shadcn Glassmorphic UI                                           ├── Prisma ORM
         ├── Lucide React Icons                                               ├── SQLite / PostgreSQL DB
         └── React Router DOM v6                                             └── OpenAI API Integration
```

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Axios, React Router DOM.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, SQLite (`dev.db`), bcryptjs, jsonwebtoken, OpenAI Node SDK.
- **Containerization & CI/CD:** Docker, Docker Compose, Nginx, GitHub Actions Workflow.

---

## 🚀 Quick Start & Local Installation

### Prerequisites
- **Node.js:** v18.x or v20.x installed
- **npm:** v9.x or v10.x

### Step 1: Clone Repository & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/student-assistant.parent.git
cd "student assistant"

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` in the root directory:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="super_secret_jwt_key_student_assistant_2026"
FRONTEND_URL="http://localhost:5173"
OPENAI_API_KEY="your_openai_api_key_here"
```

### Step 3: Run Database Migrations & Seed Data
```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

### Step 4: Launch Applications Simultaneously
Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd backend
npm run dev
# Server running at: http://localhost:5000
# API Docs available at: http://localhost:5000/api/docs
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# Vite Web Application live at: http://localhost:5173
```

---

## 🐳 Docker Deployment

To launch the complete application stack (Backend API + Nginx Web Server) via Docker Compose:

```bash
# Build and run container stack
docker-compose up --build -d

# Frontend will be live at: http://localhost
# Backend API will be live at: http://localhost:5000
```

---

## 📑 API Endpoint Catalog Summary

| Method | Endpoint | Description | Auth Guard |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new student account | Public (Rate-Limited) |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | Public (Rate-Limited) |
| `GET` | `/api/profile` | Retrieve student profile & academic details | Student / Admin |
| `POST` | `/api/profile/upgrade-semester` | Advance academic semester & refresh catalog | Student |
| `POST` | `/api/ai/ask` | Submit question to OpenAI Academic Assistant | Student / Admin |
| `GET` | `/api/resources` | Fetch Google Drive notes & study materials | Student / Admin |
| `GET` | `/api/quizzes` | Fetch practice quizzes by subject | Student / Admin |
| `POST` | `/api/quizzes/:id/submit` | Submit quiz answers & generate score breakdown | Student |
| `GET` | `/api/careers/internships` | List active internship postings | Student / Admin |
| `GET` | `/api/skills` | Manage technical skill matrix | Student |
| `POST` | `/api/skills/analyze-gap` | Run AI Skill Gap evaluation | Student |
| `GET` | `/api/notifications` | Fetch unread notifications & broadcast alerts | Student / Admin |
| `GET` | `/api/admin/stats` | Aggregate administrator dashboard metrics | Admin Only |
| `GET` | `/api/admin/export/students` | Download Student Roster `.csv` export file | Admin Only |
| `GET` | `/api/admin/export/quizzes` | Download Quiz Results `.csv` export file | Admin Only |
| `GET` | `/api/docs` | OpenAPI 3.0 API Specification reference | Public |

---

## 📄 License & Attribution

This project is built for evaluation as part of the Final Year Engineering Project. All rights reserved.
