# 🎓 Student Assistant — Academic & Career Intelligence Engine

A modern, full-stack **Academic & Career Intelligence Platform** tailored for engineering university students (aligned with the **Visvesvaraya Technological University / VTU** curriculum). Built with React 18 (Vite), TypeScript, Tailwind CSS, Node.js (Express), Prisma ORM, PostgreSQL, Google Gemini AI, YouTube Data API v3, and the Adzuna Jobs API.

---

## 🌟 Key Features

### 🎓 Academic Sanctuary & Study Resources
- **Syllabus-Aligned Study Materials:** Comprehensive repository of 45 subjects spanning Semesters 1 through 7, featuring **224 verified Google Drive study notes** categorized into Modules 1–5, lab manuals, and model papers.
- **Semester Upgrade Wizard:** Advance academic semesters in a single click, instantly unlocking fresh curriculum subjects, notes, and quiz banks.
- **Curated Educational Video Hub:** High-definition video lectures powered by the **YouTube Data API v3**, categorized by subject with progress tracking.
- **Focus Study Session Timer:** Interactive focus timer tracking study minutes against daily study goals, paired with 7-day consistency bars and a 365-day GitHub-style yearly activity heatmap.

### 🤖 AI Concept Tutor (Powered by Google Gemini)
- **Pedagogical Modes:** Multi-mode tutor supporting **Explain Concept**, **Code Implementation**, and **Exam Preparation** modes.
- **Deep Academic Synthesis:** Generates key takeaways, real-world engineering examples, time/space complexities, common misconceptions, and technical interview questions.
- **Chat History & Bookmarks:** Persistent discussion history and bookmarking for quick exam revision.

### 🧠 Adaptive Practice Quizzes
- **On-Demand AI Question Generation:** Creates 5, 10, 15, or 20 syllabus questions with adjustable difficulty (Easy, Medium, Hard).
- **Anti-Cheat Answer Protection:** Correct options and explanations are strictly withheld on the backend until final submission.
- **Instant Diagnostics:** Automated scoring, accuracy breakdown, and weak-area concept insights.

### 📄 Resume ATS Analyzer & Job Matcher
- **Multi-Format Parsing:** High-performance text extraction for PDF and Word (`.docx`) documents with file signature verification (magic bytes).
- **Comprehensive ATS Diagnostics:** Calculates an overall ATS compatibility score (0–100), checks contact detail formatting, and alerts on multi-column or table layout issues.
- **Domain Classification:** Automated domain classification (Software / IT, Data Science / AI, Cybersecurity, Finance, etc.).
- **Job Description Gap Analysis:** Real-time comparison against target job descriptions, identifying matched technical competencies and missing keyword gaps.
- **Two-Page PDF Diagnostic Report:** Server-side generation of a strict 2-page executive ATS evaluation report ready for download.

### 💼 Careers & Live Opportunities Portal
- **Live Job & Internship Discovery:** Real-time aggregation of active tech roles and internships from **Adzuna (India Market)** and **RemoteOK**.
- **Smart Filtering:** Filter by keyword, role, location, remote preference, and experience level with direct application links.

### 🔒 Digital Document Locker
- **Academic Credential Vault:** Secure cloud locker for marks cards, certificates, and ID documents with categorized view and storage usage indicators.
- **Custom Confirmation Modals:** Smooth, accessible custom modal dialogues for destructive actions.

### 👤 Student Scholar Profile
- **VTU Credentials Management:** Verified degree, branch, semester, expected graduation year, and academic summary bio.
- **Technical Skills Matrix:** Isolated skill draft editor with quick suggestion tags and clean display pills.
- **Social Connectors:** Circular, logo-only links for GitHub, LinkedIn, and profile sharing.

---

## 🏗️ Architecture & Technology Stack

```text
[ React 18 + Vite + Tailwind CSS ]  <--- (REST API / JWT) --->  [ Node.js + Express (TypeScript) ]
         │                                                                   │
         ├── Forest Green Design System                                      ├── Prisma ORM
         ├── Lucide React Icons                                              ├── PostgreSQL Database
         ├── React Router DOM v6                                             ├── Google Gemini 3.5 Flash
         └── TanStack React Query                                            ├── YouTube Data API v3
                                                                             ├── Adzuna & RemoteOK APIs
                                                                             └── PDFKit & pdf-parse
```

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Axios, React Router DOM.
- **Backend:** Node.js v20+, Express, TypeScript, Prisma ORM, PostgreSQL, Helmet, Morgan, BcryptJS, JWT.
- **AI & Integrations:** Google Gemini AI (`@google/genai`), YouTube Data API v3, Adzuna Jobs API, RemoteOK API.
- **Document Processing:** PDFKit, pdf-parse, Mammoth (.docx).

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js:** v18.x or v20+ installed
- **PostgreSQL:** Running locally on port `5432`
- **npm:** v9.x or v10+

### Step 1: Clone Repository & Install Dependencies
```bash
git clone https://github.com/your-username/student-assistant.git
cd "student assistant"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables

**Backend Configuration (`backend/.env`):**
```env
# Database configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/student_assistant?schema=public"

# Server configuration
PORT=5000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"

# JWT Authentication
JWT_SECRET="your_jwt_secret_key_change_in_production"
JWT_EXPIRES_IN="7d"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your_google_client_id_here"

# Gemini AI (AI Assistant and Quizzes)
GEMINI_API_KEY="your_gemini_api_key_here"
GEMINI_MODEL="gemini-3.5-flash"

# YouTube Data API v3 (Academic Video Hub)
YOUTUBE_API_KEY="your_youtube_api_key_here"

# Adzuna Jobs API (Tech Jobs & Internships)
ADZUNA_APP_ID="your_adzuna_app_id_here"
ADZUNA_APP_KEY="your_adzuna_app_key_here"
```

**Frontend Configuration (`frontend/.env`):**
```env
VITE_GOOGLE_CLIENT_ID="your_google_client_id_here"
```

### Step 3: Run Database Migrations & Seed Data
```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

### Step 4: Start Development Servers
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
# Server running at: http://localhost:5000
# Health check: http://localhost:5000/api/health
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# Vite Web App running at: http://localhost:5173
```

---

## 📑 Core API Endpoints

| Category | Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- | :---: |
| **Auth** | `POST` | `/api/auth/register` | Register student account | Public |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & receive JWT token | Public |
| **Auth** | `GET` | `/api/auth/me` | Verify authenticated session | Required |
| **Profile** | `GET` | `/api/profile` | Retrieve student profile and credentials | Required |
| **Profile** | `PUT` | `/api/profile` | Update profile, bio, links, and skills | Required |
| **AI Tutor** | `POST` | `/api/ai/chat` | Query Gemini-powered Concept Tutor | Required |
| **AI Tutor** | `GET` | `/api/ai/history` | Fetch persistent chat history | Required |
| **Resources**| `GET` | `/api/resources` | Fetch notes filtered by subject/module | Required |
| **Quizzes** | `POST` | `/api/quizzes/practice/generate` | Generate on-demand adaptive quiz | Required |
| **Quizzes** | `POST` | `/api/quizzes/practice/:id/submit` | Submit answers and receive score report | Required |
| **Resume** | `POST` | `/api/careers/resume/analyze` | Parse resume and compute ATS score | Required |
| **Resume** | `POST` | `/api/careers/resume/compare-job`| Compare resume against job description | Required |
| **Resume** | `GET` | `/api/careers/resume/report/download` | Download 2-page ATS evaluation PDF | Required |
| **Careers** | `GET` | `/api/careers/opportunities` | Discover live jobs & internships | Required |
| **Locker** | `GET` | `/api/documents` | List uploaded student documents | Required |
| **Videos** | `GET` | `/api/videos/recommendations` | Fetch YouTube syllabus video lectures | Required |
| **Activity** | `GET` | `/api/activity/yearly` | 365-day learning activity matrix | Required |
| **Activity** | `GET` | `/api/activity/weekly` | 7-day consistency bar stats | Required |
| **System** | `GET` | `/api/health` | Service health status check | Public |

---

## 🧪 Testing & Verification

- **Automated Resume Suite:** Run `npx tsx src/__tests__/resumeAnalyzer.test.ts` from `backend/`.
- **Backend Typecheck:** Run `npx tsc --noEmit` from `backend/`.
- **Frontend Production Build:** Run `npm run build` from `frontend/`.

---

## 📄 License & Academic Attribution

Developed as a Final Year Engineering Project. All rights reserved.
