# Production Engineering Backlog — AI Student Assistant Platform

**Project:** Final Year Engineering Project — AI Student Assistant Platform  
**Target Stack:** React (Vite) + TypeScript + Tailwind CSS + Node.js (Express) + Prisma ORM + PostgreSQL/SQLite + OpenAI API + Firebase Storage  
**Author:** Senior Engineering Manager & Technical Project Lead  
**Document Version:** 1.0  
**Based On:** `PRD.docx`, `ARC.docx`, `SEC.docx`, `FRONTEND.docx`, `CHECK.docx`

---

## Executive Summary & Dependency Flow

This engineering backlog converts all functional, architectural, security, and UI/UX requirements into actionable, production-ready engineering tickets across **25 Epics**.

### Core Sequential Dependency Chain:
```
[Epic 1: Project Setup] 
   └── [Epic 2: Authentication] 
          └── [Epic 4: Student Profile] 
                 ├── [Epic 3: Student Dashboard]
                 ├── [Epic 5: AI Academic Assistant]
                 ├── [Epic 6: Study Resources] ──> [Epic 7: Drive Integration] ──> [Epic 8: Video Recommendations]
                 ├── [Epic 9: Quiz System]
                 ├── [Epic 10: Document Locker]
                 ├── [Epic 11: Skills & Projects]
                 ├── [Epic 12/13/14: Careers (Internships, Jobs, Exams)]
                 └── [Epic 16: Semester Upgrade]
[Epic 17-19: Admin Suite] ──> [Epic 20-22: System, Perf & Security] ──> [Epic 23-25: Testing, Deployment & Docs]
```

---

## Epic 1: Project Setup & Core Infrastructure

### Ticket: SETUP-001
- **Feature Name:** Monorepo/Workspace Environment & Directory Architecture
- **Priority:** Must Have
- **Description:** Initialize backend and frontend Node TypeScript workspaces, set up linting (ESLint), formatting (Prettier), environment configuration templates (.env.example), and script runners for running both applications simultaneously.
- **Acceptance Criteria:**
  - `backend/` and `frontend/` folders are set up with valid `package.json` files.
  - TypeScript compiles without errors in both directories (`npm run build`).
  - `.env.example` lists all required environment variables (`DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, `FIREBASE_*`, `PORT`).
  - `npm run dev` starts both development servers cleanly.
- **Dependencies:** None
- **Suggested AI Prompt:**
  ```text
  Set up a dual Node.js/TypeScript workspace with frontend/ and backend/ directories. Configure tsconfig.json, dotenv support, ESLint, and Prettier. Provide package.json scripts for running both services.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 2
- **Testing Requirements:** Integration Tests, Environment validation check scripts.
- **Definition of Done:** Project compiles, environment variables load, dev server starts without warnings.

---

### Ticket: SETUP-002
- **Feature Name:** Database Schema & Prisma ORM Migration Setup
- **Priority:** Must Have
- **Description:** Define the complete Prisma database schema (`schema.prisma`) including User, StudentProfile, Subject, StudyResource, Quiz, QuizQuestion, QuizSubmission, ChatHistory, Document, Skill, Project, Internship, Job, GovernmentExam, Notification, and AuditLog models. Execute initial migration.
- **Acceptance Criteria:**
  - `npx prisma migrate dev` creates database tables with foreign key relations and cascade rules.
  - Prisma client generates cleanly without TypeScript errors (`@prisma/client`).
  - Models match all data attributes specified in the Technical Architecture document.
- **Dependencies:** SETUP-001
- **Suggested AI Prompt:**
  ```text
  Create backend/prisma/schema.prisma defining User, StudentProfile, Subject, StudyResource, Quiz, QuizQuestion, QuizSubmission, ChatHistory, Document, Skill, Project, Internship, Job, GovernmentExam, Notification, and AuditLog models with relations and indexes. Run prisma generate.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** Database migration tests, Schema verification script.
- **Definition of Done:** Schema migration executes cleanly, Prisma client exports typed models.

---

### Ticket: SETUP-003
- **Feature Name:** Express Application Boilerplate & Middleware Chain
- **Priority:** Must Have
- **Description:** Set up Node.js Express server with global middlewares including CORS, Helmet security headers, JSON parser, Morgan logger, and centralized Error Handler middleware.
- **Acceptance Criteria:**
  - Express server runs on specified PORT (`backend/src/server.ts`).
  - Health check route `/api/health` returns `{ status: "ok", timestamp: ISOString }`.
  - Unhandled routes return standard 404 JSON error response.
  - Global error handler catches async errors and returns structured `{ success: false, error: message }` responses.
- **Dependencies:** SETUP-001
- **Suggested AI Prompt:**
  ```text
  Configure backend/src/server.ts with Express, cors, helmet, json body parser, morgan logger, health check route /api/health, and error handling middleware.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 2
- **Testing Requirements:** API Tests (`GET /api/health`).
- **Definition of Done:** Health check returns 200 OK, middlewares correctly process incoming HTTP requests.

---

### Ticket: SETUP-004
- **Feature Name:** React + Vite + Tailwind CSS + Shadcn Design System Setup
- **Priority:** Must Have
- **Description:** Set up frontend Vite React project with Tailwind CSS, custom color theme tokens (primary HSL, glassmorphism utilities, dark/light variants), Lucide React icons, and React Router DOM.
- **Acceptance Criteria:**
  - `tailwind.config.js` includes custom background, card, primary, secondary, accent, and muted color scales.
  - `index.css` defines base CSS variables for typography and glassmorphic cards.
  - React Router DOM manages client routes with lazy loading and main layout shell.
- **Dependencies:** SETUP-001
- **Suggested AI Prompt:**
  ```text
  Configure frontend/tailwind.config.js and src/index.css for Shadcn UI styling guidelines. Include font family, soft shadows, rounded border radii, glassmorphic card classes, and React Router navigation layout.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** UI visual build verification, responsive breakpoint checks.
- **Definition of Done:** Frontend compiles and renders main navigation shell without console errors.

---

### Ticket: SETUP-005
- **Feature Name:** Seed Database Script for Core Academic Master Data
- **Priority:** Must Have
- **Description:** Write a Prisma database seed script (`prisma/seed.ts`) populating default Admin user, sample subjects (Computer Science, Semester 1-8), study resources, sample quizzes, internships, jobs, and government exam records.
- **Acceptance Criteria:**
  - `npx prisma db seed` runs without errors.
  - Admin user (`admin@studentassistant.edu`, hashed password) is created.
  - At least 8 subjects across multiple semesters are seeded with modules and resources.
- **Dependencies:** SETUP-002
- **Suggested AI Prompt:**
  ```text
  Create backend/prisma/seed.ts to populate default admin account, sample subjects (Data Structures, DBMS, AI, Web Dev), study resources, quizzes, and career listings. Ensure password hashing with bcrypt.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** Database unit tests for seed data integrity.
- **Definition of Done:** Database contains initial master data after running seed script.

---

## Epic 2: Authentication & Role-Based Authorization

### Ticket: AUTH-001
- **Feature Name:** User Registration Backend API
- **Priority:** Must Have
- **Description:** Implement `POST /api/auth/register` to register new student accounts. Hash password with bcrypt (min 10 salt rounds), validate input schema (Zod/Joi), prevent duplicate email registration, and create student profile record inside a database transaction.
- **Acceptance Criteria:**
  - Accepts `fullName`, `email`, `password`, `university`, `degree`, `branch`, `semester`.
  - Passwords hashed with minimum 10 salt rounds before database persistence.
  - Generates JWT access token containing `{ id, email, role }` signed with `JWT_SECRET` (valid 24h).
  - Returns 201 Created with user object (excluding passwordHash) and token.
  - Returns 400 Bad Request for invalid format or duplicate email.
- **Dependencies:** SETUP-002, SETUP-003
- **Suggested AI Prompt:**
  ```text
  Implement POST /api/auth/register in backend/src/controllers/authController.ts using Prisma transaction to create User and StudentProfile. Hash passwords using bcrypt, validate email format, and return JWT token.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** API Unit tests (valid registration, duplicate email, password hash check).
- **Definition of Done:** API endpoint passes unit tests and creates User + Profile records.

---

### Ticket: AUTH-002
- **Feature Name:** User Login Backend API
- **Priority:** Must Have
- **Description:** Implement `POST /api/auth/login` for user authentication. Verify password hash using `bcrypt.compare`, validate active user status (`isActive`), and return JWT token along with user role profile.
- **Acceptance Criteria:**
  - Validates `email` and `password` body payload.
  - Returns 401 Unauthorized for incorrect credentials or inactive accounts.
  - Returns 200 OK with `token`, `user: { id, email, fullName, role, profile }`.
- **Dependencies:** AUTH-001
- **Suggested AI Prompt:**
  ```text
  Implement POST /api/auth/login in authController.ts. Check user email, verify password with bcrypt, verify isActive boolean, and issue signed JWT token upon success.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** API Unit & Integration tests (successful login, invalid password, inactive user).
- **Definition of Done:** Login endpoint returns valid JWT token for correct credentials.

---

### Ticket: AUTH-003
- **Feature Name:** Authentication & Role-Based Authorization Middlewares
- **Priority:** Must Have
- **Description:** Implement `authenticate` middleware to verify Bearer JWT tokens in Request Authorization headers and `requireRole(...roles)` middleware to enforce STUDENT vs ADMIN access controls.
- **Acceptance Criteria:**
  - Extracts Bearer token, verifies signature and expiration.
  - Attaches decoded user object to Express `req.user`.
  - Returns 401 Unauthorized if token is missing or expired.
  - Returns 403 Forbidden if user role is not authorized for requested route.
- **Dependencies:** AUTH-002
- **Suggested AI Prompt:**
  ```text
  Create backend/src/middlewares/authMiddleware.ts with authenticate JWT middleware and authorize(roles) role-based guard middleware. Attach req.user with typed Express Request interface.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** Middleware unit tests with valid, expired, and unauthorized tokens.
- **Definition of Done:** Protected routes reject unauthorized requests and allow valid JWT holders.

---

### Ticket: AUTH-004
- **Feature Name:** Frontend Authentication Context & State Management
- **Priority:** Must Have
- **Description:** Create React `AuthContext` and custom `useAuth()` hook to manage user session state, local storage JWT persistence, auto-login header configuration, and login/logout state triggers.
- **Acceptance Criteria:**
  - Persists JWT token securely in LocalStorage / Auth state.
  - Automatically attaches `Authorization: Bearer <token>` to Axios HTTP instance.
  - Exposes `user`, `token`, `login()`, `register()`, `logout()`, `isAuthenticated`, `isAdmin`.
  - Automatically redirects to `/login` if token expires or logout is triggered.
- **Dependencies:** AUTH-002, SETUP-004
- **Suggested AI Prompt:**
  ```text
  Create frontend/src/context/AuthContext.tsx providing user state, JWT persistence in localStorage, Axios default authorization header interceptor, and logout helper functions.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** UI Context unit tests, Session persistence test.
- **Definition of Done:** AuthContext manages token lifecycle and provides globally accessible user state.

---

### Ticket: AUTH-005
- **Feature Name:** Login & Registration UI Pages
- **Priority:** Must Have
- **Description:** Design visually impressive, responsive Login (`Login.tsx`) and Registration (`Register.tsx`) pages using Tailwind CSS and glassmorphism styling, with form validation and dynamic error notifications.
- **Acceptance Criteria:**
  - Form validation for email format, password strength (min 6 chars), and required profile fields.
  - Shows loading indicators and disable state during API submission.
  - Toast notification alerts for invalid credentials or server errors.
  - Smooth page transitions and clear redirect to `/dashboard` upon authentication.
- **Dependencies:** AUTH-004
- **Suggested AI Prompt:**
  ```text
  Build frontend/src/pages/Login.tsx and Register.tsx with Tailwind CSS glassmorphic card design, form validation, error toast popups, and integration with AuthContext.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** Form input validation UI tests, end-to-end login flow manual test.
- **Definition of Done:** User can register and log into the application through polished UI pages.

---

### Ticket: AUTH-006
- **Feature Name:** Protected Route Guard Components
- **Priority:** Must Have
- **Description:** Implement frontend `ProtectedRoute` and `AdminRoute` wrapper components to restrict page access based on user session status and role (`STUDENT` vs `ADMIN`).
- **Acceptance Criteria:**
  - Unauthenticated users attempting to access `/dashboard` are redirected to `/login`.
  - Non-admin users attempting to access `/admin/*` are redirected to `/dashboard` with an alert.
  - Preserves attempt URL path for redirect post-login.
- **Dependencies:** AUTH-004
- **Suggested AI Prompt:**
  ```text
  Create frontend/src/components/ProtectedRoute.tsx and AdminRoute.tsx that inspect AuthContext state and render nested routes or redirect to /login /dashboard.
  ```
- **Estimated Complexity:** XS (Less than 1 hour)
- **Estimated Story Points:** 1
- **Testing Requirements:** Client routing integration tests.
- **Definition of Done:** Unauthorized path navigation is blocked and redirected correctly.

---

## Epic 3: Student Dashboard & Analytics Overview

### Ticket: DASH-001
- **Feature Name:** Student Dashboard Aggregation API
- **Priority:** Must Have
- **Description:** Implement `GET /api/dashboard/student` returning personalized dashboard statistics: academic summary (semester, branch), recent AI questions, enrolled/available subjects count, upcoming quizzes, document stats, and latest notifications.
- **Acceptance Criteria:**
  - Endpoint requires `STUDENT` authentication token.
  - Fetches and formats count of study resources for student's branch/semester.
  - Returns top 5 recent AI chat interactions and pending notification items.
  - Response time under 200ms using optimized database queries.
- **Dependencies:** AUTH-003, SETUP-002
- **Suggested AI Prompt:**
  ```text
  Create backend/src/controllers/dashboardController.ts with GET /api/dashboard/student returning user stats, semester info, recent chats, subjects summary, and upcoming quizzes.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** API Unit test for student dashboard stats payload.
- **Definition of Done:** Dashboard aggregation API returns accurate structured JSON for authenticated student.

---

### Ticket: DASH-002
- **Feature Name:** Student Dashboard Layout & Stat Cards UI
- **Priority:** Must Have
- **Description:** Build student main dashboard view (`StudentDashboard.tsx`) featuring hero welcome banner, quick action cards (AI Assistant, Resources, Quizzes, Locker), academic summary widgets, and recent activity timelines.
- **Acceptance Criteria:**
  - Personal welcome greeting displaying student name, branch, and current semester.
  - Quick action buttons navigating to major app modules.
  - Metric summary cards: Active Subjects, Resources Available, Quizzes Attempted, Stored Documents.
  - Fully responsive grid layout across desktop, tablet, and mobile views.
- **Dependencies:** DASH-001, SETUP-004
- **Suggested AI Prompt:**
  ```text
  Create frontend/src/pages/StudentDashboard.tsx with hero greeting banner, metric cards (subjects, resources, quizzes, documents), quick action buttons, and responsive grid layout using Tailwind CSS.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** UI Responsive rendering tests across device breakpoints.
- **Definition of Done:** Student dashboard displays visual metrics and quick action shortcuts cleanly.

---

### Ticket: DASH-003
- **Feature Name:** Quick AI Query Widget on Dashboard
- **Priority:** Should Have
- **Description:** Integrate an interactive quick question widget on the student dashboard allowing instantaneous AI concept queries directly from the home screen without navigating away.
- **Acceptance Criteria:**
  - Input field for typing syllabus or conceptual questions.
  - "Ask AI" button triggers immediate stream/response dialog.
  - Seamless redirection or modal opening to complete AI Assistant view.
- **Dependencies:** DASH-002, AI-002
- **Suggested AI Prompt:**
  ```text
  Build a Quick AI Query widget inside StudentDashboard.tsx with an auto-suggest input box that submits prompt directly to AI Assistant service.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 2
- **Testing Requirements:** UI component interaction test.
- **Definition of Done:** Widget allows submitting initial AI prompt directly from dashboard hero area.

---

### Ticket: DASH-004
- **Feature Name:** Recent Notifications & Career Highlights Carousel
- **Priority:** Should Have
- **Description:** Add interactive widgets on the dashboard showcasing recent academic notifications and featured internship/job postings tailored to the student's branch.
- **Acceptance Criteria:**
  - Displays top 3 recent unread notifications with quick mark-as-read toggle.
  - Displays active internship/job highlights matching student degree/branch.
  - Clicking item opens detail view or relevant resource tab.
- **Dependencies:** DASH-002, NOTIF-002
- **Suggested AI Prompt:**
  ```text
  Add Recent Notifications list and Career Highlights widget to StudentDashboard.tsx with unread indicator badges and click-through navigation.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** UI click action testing.
- **Definition of Done:** Dashboard dynamically previews active notifications and career opportunities.

---

## Epic 4: Student Profile & Personalization Management

### Ticket: PROF-001
- **Feature Name:** Get & Update Profile Backend APIs
- **Priority:** Must Have
- **Description:** Implement `GET /api/profile` and `PUT /api/profile` endpoints to fetch and update student academic details (university, branch, semester, phone, bio, githubUrl, linkedinUrl).
- **Acceptance Criteria:**
  - `GET /api/profile` returns full student profile with user account details.
  - `PUT /api/profile` validates phone format, social URL formats, and updates StudentProfile database table.
  - Semester updates trigger notification for resource catalog update.
- **Dependencies:** AUTH-003, SETUP-002
- **Suggested AI Prompt:**
  ```text
  Implement GET /api/profile and PUT /api/profile in backend/src/controllers/profileController.ts. Add validation for social links, phone number, and bio updates.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** API unit tests for valid and invalid profile field updates.
- **Definition of Done:** Profile APIs return and update student profile attributes correctly.

---

### Ticket: PROF-002
- **Feature Name:** Student Profile Management UI Page
- **Priority:** Must Have
- **Description:** Build `Profile.tsx` page providing student profile overview, academic attributes editor, avatar display, contact details form, and social media link configuration.
- **Acceptance Criteria:**
  - Academic metadata section (University, Degree, Branch, Current Semester) prominently displayed.
  - Editable form for phone number, bio, GitHub link, LinkedIn link, and profile picture avatar.
  - Form validation with inline visual error alerts.
  - "Save Changes" button updates local state and fires backend API.
- **Dependencies:** PROF-001, AUTH-004
- **Suggested AI Prompt:**
  ```text
  Build frontend/src/pages/Profile.tsx using Tailwind CSS components. Include academic info cards, editable profile details form, validation feedback, and profile update API integration.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** UI Form submission and state update tests.
- **Definition of Done:** Student can view and save profile changes seamlessly in the browser.

---

### Ticket: PROF-003
- **Feature Name:** User Avatar & Media Profile Picture Upload
- **Priority:** Nice to Have
- **Description:** Allow students to upload a custom profile avatar picture, store the image file in Firebase Storage, and save the public image URL into `StudentProfile.profilePicture`.
- **Acceptance Criteria:**
  - Accepts image files (JPEG, PNG, WEBP) up to 2MB.
  - Uploads file directly to Firebase Storage bucket under `avatars/{userId}/`.
  - Updates profile record with output public URL.
- **Dependencies:** PROF-002, DOC-001
- **Suggested AI Prompt:**
  ```text
  Integrate Firebase Storage file upload for student avatar images in Profile.tsx. Validate file size < 2MB and mime type image/* before uploading.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** File size/format validation test, Firebase upload integration test.
- **Definition of Done:** Avatar image uploads to cloud storage and renders across user profile and header.

---

### Ticket: PROF-004
- **Feature Name:** Security & Password Reset Settings Tab
- **Priority:** Must Have
- **Description:** Add Security section to profile page enabling users to change their password securely (`PUT /api/auth/change-password`).
- **Acceptance Criteria:**
  - Form requires current password, new password, and confirm new password.
  - Validates current password using bcrypt before allowing modification.
  - Enforces minimum 6 characters password strength rule.
- **Dependencies:** PROF-002, AUTH-002
- **Suggested AI Prompt:**
  ```text
  Implement PUT /api/auth/change-password endpoint and add Password Change form inside Profile.tsx security tab with validation.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 2
- **Testing Requirements:** Unit test for password change authorization and verification.
- **Definition of Done:** User can successfully update account password after verifying current credential.

---

## Epic 5: AI Academic Assistant System

### Ticket: AI-001
- **Feature Name:** OpenAI API Service Integration & Context Builder
- **Priority:** Must Have
- **Description:** Build backend AI service (`backend/src/services/aiService.ts`) integrating OpenAI API (`gpt-4o-mini` or similar). Build dynamic system prompts injected with student metadata (University, Branch, Semester, Subject context).
- **Acceptance Criteria:**
  - System prompt restricts AI to academic assistant persona.
  - Automatically includes student's branch, semester, and selected subject in system message context.
  - Handles API rate limits, timeouts, and gracefully returns fallback messages on OpenAI service downtime.
  - Secures API keys using backend environment variables (`OPENAI_API_KEY`).
- **Dependencies:** SETUP-003, PROF-001
- **Suggested AI Prompt:**
  ```text
  Create backend/src/services/aiService.ts configuring OpenAI client with personalized system prompts built from student academic context (university, branch, semester, subject).
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** Service unit test with mocked OpenAI response payloads.
- **Definition of Done:** AI service generates structured context-aware responses using OpenAI client.

---

### Ticket: AI-002
- **Feature Name:** Ask AI Question Backend API & Chat History Persistence
- **Priority:** Must Have
- **Description:** Implement `POST /api/ai/ask` endpoint accepting question and subject context, executing AI query, saving request/response to `ChatHistory` database table, and returning answer.
- **Acceptance Criteria:**
  - Accepts `question`, optional `subject` string.
  - Calls `aiService` with user profile context.
  - Creates record in `ChatHistory` table linked to user ID.
  - Returns 200 OK with `{ id, question, answer, subject, createdAt }`.
- **Dependencies:** AI-001, SETUP-002
- **Suggested AI Prompt:**
  ```text
  Implement POST /api/ai/ask in backend/src/controllers/aiController.ts saving questions and responses to ChatHistory Prisma model and returning generated response.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** API Integration test (query submission, chat history record creation).
- **Definition of Done:** Question is answered by AI and saved to user's chat history table.

---

### Ticket: AI-003
- **Feature Name:** Fetch & Manage Chat History APIs
- **Priority:** Must Have
- **Description:** Implement `GET /api/ai/history` to retrieve user's past AI interactions, `DELETE /api/ai/history/:id` to remove a chat item, and `PATCH /api/ai/history/:id/bookmark` to bookmark answers.
- **Acceptance Criteria:**
  - `GET /api/ai/history` supports optional subject query filter and pagination.
  - `PATCH /api/ai/history/:id/bookmark` toggles `isBookmarked` flag.
  - `DELETE /api/ai/history/:id` deletes record belonging only to authenticated user.
- **Dependencies:** AI-002
- **Suggested AI Prompt:**
  ```text
  Add GET /api/ai/history, DELETE /api/ai/history/:id, and PATCH /api/ai/history/:id/bookmark endpoints in aiController.ts with user ownership checks.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** API unit tests for bookmarking, list retrieval, and ownership authorization.
- **Definition of Done:** Student can retrieve, filter, bookmark, and delete their AI chat history items.

---

### Ticket: AI-004
- **Feature Name:** AI Assistant Conversational Interface UI
- **Priority:** Must Have
- **Description:** Design and construct interactive chat UI (`AIAssistant.tsx`) featuring real-time message stream/chat list, subject selector filter, code snippet syntax highlighter, and copy-to-clipboard buttons.
- **Acceptance Criteria:**
  - Sidebar displaying recent chat history and bookmarked questions.
  - Main chat area rendering user queries and markdown-formatted AI responses.
  - Code syntax highlighting for programming answers (C++, Python, Java, JS).
  - Subject dropdown context selector to focus AI response on specific subject syllabus.
  - Loading skeleton typing indicators during response generation.
- **Dependencies:** AI-002, AI-003, SETUP-004
- **Suggested AI Prompt:**
  ```text
  Build frontend/src/pages/AIAssistant.tsx with sidebar chat history list, markdown renderer for AI responses, syntax highlighting for code blocks, subject dropdown filter, and copy buttons.
  ```
- **Estimated Complexity:** L (1 day)
- **Estimated Story Points:** 8
- **Testing Requirements:** UI Chat interaction test, Code block syntax rendering verification.
- **Definition of Done:** Interactive chat UI renders formatted AI answers with code syntax highlighting.

---

### Ticket: AI-005
- **Feature Name:** Suggested Academic Prompts & Quick Topic Chips
- **Priority:** Should Have
- **Description:** Provide interactive suggestion chips (e.g., "Explain Time Complexity of QuickSort", "Summarize Module 2 DBMS", "Write a Python script for Linked List") on AI chat landing screen.
- **Acceptance Criteria:**
  - Dynamic topic cards based on student's current semester subjects.
  - Clicking chip populates prompt input and submits query automatically.
- **Dependencies:** AI-004
- **Suggested AI Prompt:**
  ```text
  Add prompt suggestion chips to AIAssistant.tsx that trigger pre-formulated syllabus queries when clicked.
  ```
- **Estimated Complexity:** XS (Less than 1 hour)
- **Estimated Story Points:** 1
- **Testing Requirements:** Component click handler UI test.
- **Definition of Done:** Pre-built prompt chips trigger chat submission directly.

---

### Ticket: AI-006
- **Feature Name:** Streaming Response AI Generator
- **Priority:** Nice to Have
- **Description:** Enhance `POST /api/ai/ask` with Server-Sent Events (SSE) or chunked HTTP streaming to render AI text token-by-token in real time.
- **Acceptance Criteria:**
  - Backend streams OpenAI response tokens to HTTP client.
  - Frontend renders incoming stream dynamically without waiting for full completion.
- **Dependencies:** AI-004
- **Suggested AI Prompt:**
  ```text
  Refactor backend POST /api/ai/ask and frontend AIAssistant.tsx to support token streaming using Server-Sent Events (SSE).
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** SSE Connection and stream output test.
- **Definition of Done:** AI response streams smoothly character-by-character on frontend UI.

---

## Epic 6: Study Resources Management & Drive Links

### Ticket: RES-001
- **Feature Name:** Study Resource Backend APIs & Subject Filtering
- **Priority:** Must Have
- **Description:** Implement `GET /api/resources` endpoint to list study resources filtered by `subjectId`, `moduleNumber`, resource `type` (PDF_NOTES, PPT, TUTORIAL, PREVIOUS_PAPER, LAB_MANUAL, CODING_EXERCISE), and search keyword.
- **Acceptance Criteria:**
  - Returns list of study resources matching student's branch/semester by default.
  - Includes related Subject details (code, name, branch, semester).
  - Supports search filter query string against `title` and `description`.
- **Dependencies:** SETUP-002, AUTH-003
- **Suggested AI Prompt:**
  ```text
  Create backend/src/controllers/resourceController.ts with GET /api/resources filtering resources by subject, module number, type, and keyword search.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** API Query filter unit tests.
- **Definition of Done:** Resource list API returns filtered resource metadata records correctly.

---

### Ticket: RES-002
- **Feature Name:** Subjects Catalog API for Enrolled Semester
- **Priority:** Must Have
- **Description:** Implement `GET /api/subjects` to list all academic subjects matching user's branch and semester, with module count and resource stats.
- **Acceptance Criteria:**
  - Lists subjects tailored to authenticated student's semester and branch.
  - Includes count of available study materials per subject.
- **Dependencies:** SETUP-002, AUTH-003
- **Suggested AI Prompt:**
  ```text
  Implement GET /api/subjects in backend/src/controllers/subjectController.ts returning subjects filtered by student's branch and semester with resource count aggregates.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 2
- **Testing Requirements:** API unit test for subject listing per semester.
- **Definition of Done:** Subjects endpoint returns relevant academic subjects for student branch.

---

### Ticket: RES-003
- **Feature Name:** Study Resources Hub UI Page
- **Priority:** Must Have
- **Description:** Build `StudyResources.tsx` featuring Subject selection cards, module tabs (Module 1-5), resource type filter pills, search input, and resource item cards.
- **Acceptance Criteria:**
  - Subject cards carousel/grid showcasing active subjects for semester.
  - Filter bar for resource type (Notes, Previous Papers, Tutorials, Lab Manuals).
  - Clean card displaying resource title, module badge, file size, and Google Drive access button.
  - Empty state graphic when no resources match active filter.
- **Dependencies:** RES-001, RES-002, SETUP-004
- **Suggested AI Prompt:**
  ```text
  Build frontend/src/pages/StudyResources.tsx with subject selector cards, module tabs, type filter badges, search bar, and clean card grid using Tailwind CSS.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** UI Filtering and navigation test.
- **Definition of Done:** Students can browse, search, and filter study resources visually by module/subject.

---

### Ticket: RES-004
- **Feature Name:** Subject Detail & Module Material View UI
- **Priority:** Should Have
- **Description:** Build a detailed subject breakdown page (`SubjectDetail.tsx`) showing complete syllabus description, module-by-module breakdown, and associated notes/papers list.
- **Acceptance Criteria:**
  - Deep-link route `/resources/subject/:subjectId`.
  - Accordion view expanding each module's specific learning content.
  - Direct download and Google Drive view triggers per item.
- **Dependencies:** RES-003
- **Suggested AI Prompt:**
  ```text
  Create frontend/src/pages/SubjectDetail.tsx displaying subject overview, module accordions, and detailed resource download lists.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** Route parameter UI test.
- **Definition of Done:** Subject detail page displays structured module breakdown and resource links.

---

### Ticket: RES-005
- **Feature Name:** Resource Bookmark & Quick Favorites System
- **Priority:** Nice to Have
- **Description:** Enable students to pin frequently accessed study resources to their dashboard favorites for quick access.
- **Acceptance Criteria:**
  - Star icon toggle on resource card.
  - Persists favorited resource IDs in local user preference or database.
  - "Favorites" tab in Study Resources page.
- **Dependencies:** RES-003
- **Suggested AI Prompt:**
  ```text
  Add resource bookmark toggle functionality to StudyResources.tsx and persist favorited items.
  ```
- **Estimated Complexity:** XS (Less than 1 hour)
- **Estimated Story Points:** 1
- **Testing Requirements:** State persistence test.
- **Definition of Done:** Pinned resources appear in dedicated Favorites tab.

---

## Epic 7: Google Drive Shared Resources Integration

### Ticket: DRIVE-001
- **Feature Name:** Google Drive URL Parser & Embed Helper Utility
- **Priority:** Must Have
- **Description:** Build backend and frontend helper utilities (`driveUtils.ts`) to validate Google Drive shareable URLs, extract Drive file IDs, and convert view links into embedded preview iframe URLs.
- **Acceptance Criteria:**
  - Extracts 33-character Google Drive file ID from view/sharing links (`https://drive.google.com/file/d/{FILE_ID}/view`).
  - Converts link into valid embedded preview URL (`https://drive.google.com/file/d/{FILE_ID}/preview`).
  - Validates URL syntax and flags invalid non-Google Drive links.
- **Dependencies:** SETUP-001
- **Suggested AI Prompt:**
  ```text
  Create src/utils/driveUtils.ts utility function to parse Google Drive URLs, extract file IDs, generate iframe preview URLs, and validate Drive link formats.
  ```
- **Estimated Complexity:** XS (Less than 1 hour)
- **Estimated Story Points:** 1
- **Testing Requirements:** Unit test with matrix of valid and invalid Google Drive link formats.
- **Definition of Done:** Utility reliably extracts file IDs and generates valid embed links.

---

### Ticket: DRIVE-002
- **Feature Name:** In-App Google Drive Document Viewer Modal
- **Priority:** Must Have
- **Description:** Implement a full-screen modal viewer component (`DriveViewerModal.tsx`) embedding Google Drive preview iframe, allowing students to read PDFs and slides directly inside the platform without leaving the app.
- **Acceptance Criteria:**
  - Modal overlay with close button, title bar, and full-screen toggle.
  - Responsive iframe rendering Google Drive preview link.
  - Fallback "Open in Google Drive" external link button if iframe fails or is blocked by browser policies.
- **Dependencies:** DRIVE-001, RES-003
- **Suggested AI Prompt:**
  ```text
  Create frontend/src/components/DriveViewerModal.tsx displaying Google Drive document preview iframe inside full-screen Shadcn modal with external tab fallback button.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** UI Modal render and iframe URL test.
- **Definition of Done:** PDF notes and slides render inside in-app modal preview cleanly.

---

### Ticket: DRIVE-003
- **Feature Name:** Direct Google Drive Open & Download Trigger
- **Priority:** Should Have
- **Description:** Configure secure direct open actions that open Google Drive links in clean target `_blank` windows with security attributes (`rel="noopener noreferrer"`).
- **Acceptance Criteria:**
  - External link button opens Google Drive share link directly.
  - Implements security tags preventing tabnabbing vulnerabilities.
- **Dependencies:** DRIVE-002
- **Suggested AI Prompt:**
  ```text
  Add secure external link opener buttons with rel="noopener noreferrer" across all study resource items.
  ```
- **Estimated Complexity:** XS (Less than 1 hour)
- **Estimated Story Points:** 1
- **Testing Requirements:** Vulnerability scan and target attribute check.
- **Definition of Done:** Drive links open securely in new browser tabs.

---

## Epic 8: Video Recommendation Engine

### Ticket: VID-001
- **Feature Name:** YouTube Data API Integration & Video Fetcher Service
- **Priority:** Must Have
- **Description:** Create backend service (`youtubeService.ts`) integrating YouTube Data API v3 to search curated educational video tutorials and playlists based on subject title, module topic, and branch keywords.
- **Acceptance Criteria:**
  - Searches YouTube API for relevant academic tutorials using query context.
  - Formats output JSON containing `videoId`, `title`, `description`, `thumbnailUrl`, `channelTitle`, `publishedAt`.
  - Caches API results in memory or database to preserve YouTube API quota limits.
  - Fallback fallback dataset when API key quota is exceeded or unavailable.
- **Dependencies:** SETUP-003, RES-002
- **Suggested AI Prompt:**
  ```text
  Create backend/src/services/youtubeService.ts integrating YouTube API v3 search endpoint with quota caching and structured video payload formatting.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** Service unit test with mocked YouTube API response.
- **Definition of Done:** Backend service retrieves typed video recommendation objects.

---

### Ticket: VID-002
- **Feature Name:** Video Recommendations Backend API
- **Priority:** Must Have
- **Description:** Implement `GET /api/videos/recommendations` endpoint accepting `subjectId` and `moduleNumber`, returning curated list of educational video tutorials.
- **Acceptance Criteria:**
  - Endpoint requires authentication token.
  - Queries `youtubeService` with combined subject name and topic terms.
  - Returns 200 OK with list of video objects.
- **Dependencies:** VID-001, AUTH-003
- **Suggested AI Prompt:**
  ```text
  Implement GET /api/videos/recommendations in backend/src/controllers/videoController.ts returning video lists filtered by subject and module topic.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** API integration test for video recommendation payload.
- **Definition of Done:** Endpoint provides relevant video recommendation list for given subject.

---

### Ticket: VID-003
- **Feature Name:** Video Recommendations UI Page & Grid Layout
- **Priority:** Must Have
- **Description:** Build `VideoRecommendations.tsx` displaying subject video topics, YouTube thumbnail cards, duration badges, channel titles, and interactive embedded video player.
- **Acceptance Criteria:**
  - Subject and module filter controls at top of page.
  - Grid of video recommendation cards with high-res thumbnails and titles.
  - Clicking card launches embedded YouTube video player modal or inline player.
  - "Watch on YouTube" direct external action button.
- **Dependencies:** VID-002, SETUP-004
- **Suggested AI Prompt:**
  ```text
  Build frontend/src/pages/VideoRecommendations.tsx displaying YouTube recommendation cards, thumbnail graphics, channel metadata, and embedded iframe video player.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** UI player render test and thumbnail load test.
- **Definition of Done:** Video recommendation grid renders thumbnails and plays videos inside embedded player.

---

### Ticket: VID-004
- **Feature Name:** Subject Topic AI Video Recommender Trigger
- **Priority:** Nice to Have
- **Description:** Allow students chatting with AI Assistant to ask for recommended video tutorials on any topic and receive clickable video preview cards in chat response.
- **Acceptance Criteria:**
  - AI Assistant detects request for video explanations.
  - Appends video recommendation cards directly inside chat response window.
- **Dependencies:** VID-003, AI-004
- **Suggested AI Prompt:**
  ```text
  Integrate video recommendation card previews inside AI Assistant chat response components when user requests video learning materials.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** AI Chat component integration test.
- **Definition of Done:** Video cards embed into conversational AI responses.

---

## Epic 9: Quiz System & Knowledge Assessment

### Ticket: QUIZ-001
- **Feature Name:** Quiz System Backend APIs (Fetch Quizzes & Questions)
- **Priority:** Must Have
- **Description:** Implement `GET /api/quizzes` (filtered by subject/module) and `GET /api/quizzes/:id` (retrieving quiz metadata and randomized questions without revealing correct answer keys).
- **Acceptance Criteria:**
  - `GET /api/quizzes` returns list of quizzes with total marks, time limit, and module number.
  - `GET /api/quizzes/:id` parses JSON stringified options and strips `correctOption` index before returning payload to prevent cheating.
- **Dependencies:** SETUP-002, AUTH-003
- **Suggested AI Prompt:**
  ```text
  Create backend/src/controllers/quizController.ts with GET /api/quizzes and GET /api/quizzes/:id. Ensure correctOption key is excluded from question payloads sent to frontend.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** API security unit test (verify correctOption index is obscured).
- **Definition of Done:** Quiz retrieval APIs return question options while keeping answer keys hidden.

---

### Ticket: QUIZ-002
- **Feature Name:** Quiz Submission & Automated Grading API
- **Priority:** Must Have
- **Description:** Implement `POST /api/quizzes/:id/submit` accepting user selected answers, calculating total score against correct options, storing `QuizSubmission` record, and returning detailed score report with explanations.
- **Acceptance Criteria:**
  - Accepts payload `{ answers: { [questionId]: optionIndex } }`.
  - Calculates score dynamically by comparing against database `correctOption` fields.
  - Creates `QuizSubmission` record with score, totalMarks, JSON stringified answers, and timestamp.
  - Returns score percentage, pass/fail status, and explanation text per question.
- **Dependencies:** QUIZ-001
- **Suggested AI Prompt:**
  ```text
  Implement POST /api/quizzes/:id/submit in quizController.ts. Compare submitted answers against correct answer keys, calculate score, persist QuizSubmission, and return breakdown with explanations.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** API Grading unit test (verify scoring calculation accuracy).
- **Definition of Done:** Submission endpoint accurately calculates quiz marks and returns feedback.

---

### Ticket: QUIZ-003
- **Feature Name:** Student Quiz Submissions & Performance History API
- **Priority:** Should Have
- **Description:** Implement `GET /api/quizzes/my-submissions` returning past quiz attempts, scores achieved, dates, and subject performance metrics for the authenticated student.
- **Acceptance Criteria:**
  - Lists attempts sorted by `submittedAt` descending.
  - Returns average score percentage across attempted subjects.
- **Dependencies:** QUIZ-002
- **Suggested AI Prompt:**
  ```text
  Implement GET /api/quizzes/my-submissions in quizController.ts returning user quiz attempt history and aggregated average performance stats.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 2
- **Testing Requirements:** API aggregation test.
- **Definition of Done:** Student can view history of all past completed quiz attempts.

---

### Ticket: QUIZ-004
- **Feature Name:** Quiz Catalog & Selection Dashboard UI Page
- **Priority:** Must Have
- **Description:** Build `QuizSystem.tsx` page showcasing available subject quizzes, module badges, difficulty indicators, time limits, and past performance summaries.
- **Acceptance Criteria:**
  - Subject and module filter tabs.
  - Quiz card listing total questions, time limit (mins), total marks, and "Start Quiz" button.
  - Badge showing best score for previously attempted quizzes.
- **Dependencies:** QUIZ-001, SETUP-004
- **Suggested AI Prompt:**
  ```text
  Build frontend/src/pages/QuizSystem.tsx showcasing subject quiz cards, time limits, total marks, past attempt scores, and start quiz action triggers using Tailwind CSS.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** UI layout and filter navigation test.
- **Definition of Done:** Quiz catalog page renders available quizzes with attempt metrics.

---

### Ticket: QUIZ-005
- **Feature Name:** Interactive Quiz Taking & Countdown Timer UI Component
- **Priority:** Must Have
- **Description:** Build interactive quiz execution view (`TakeQuiz.tsx`) featuring question stepper, option selection radio cards, live countdown timer, and automatic submit on timeout.
- **Acceptance Criteria:**
  - Clean single-question or multi-question card interface with clear progress bar.
  - Live ticking countdown timer based on `timeLimitMin`.
  - Auto-submits quiz payload when timer hits zero (`00:00`).
  - Confirmation prompt before manual early submission.
- **Dependencies:** QUIZ-004, QUIZ-002
- **Suggested AI Prompt:**
  ```text
  Build frontend/src/pages/TakeQuiz.tsx with question progress bar, radio option cards, live countdown timer with auto-submit on expiry, and submission payload dispatch.
  ```
- **Estimated Complexity:** L (1 day)
- **Estimated Story Points:** 8
- **Testing Requirements:** Timer auto-submit UI unit test, Option selection state test.
- **Definition of Done:** Interactive quiz interface allows question answering with ticking timer auto-submit.

---

### Ticket: QUIZ-006
- **Feature Name:** Quiz Results & Detailed Answer Explanation Modal
- **Priority:** Must Have
- **Description:** Build quiz result breakdown view (`QuizResultModal.tsx`) displaying score percentage badge, correct vs incorrect question indicators, and step-by-step concept explanations.
- **Acceptance Criteria:**
  - Confetti animation for high scores (> 80%).
  - Breakdown table listing user answer vs correct option for each question.
  - Displays concept explanation text for review.
  - "Retake Quiz" and "Back to Quizzes" action buttons.
- **Dependencies:** QUIZ-005
- **Suggested AI Prompt:**
  ```text
  Build frontend/src/components/QuizResultModal.tsx displaying score badge, correct/incorrect answer comparisons, detailed explanations, and retake buttons.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** Score badge and explanation rendering test.
- **Definition of Done:** Detailed results modal presents full score review and academic explanations.

---

## Epic 10: Digital Document Locker (Firebase Storage)

### Ticket: DOC-001
- **Feature Name:** Firebase Storage Initialization & Config setup
- **Priority:** Must Have
- **Description:** Configure Firebase Storage SDK initialization (`firebase.ts`) with client keys, bucket URL, and file upload validation utilities for student academic documents.
- **Acceptance Criteria:**
  - Firebase app initializes using environment variables (`FIREBASE_API_KEY`, `FIREBASE_STORAGE_BUCKET`).
  - Exported helper function uploads files to specified cloud storage paths (`documents/{userId}/{filename}`).
  - Returns public download URL and storage path reference upon completion.
- **Dependencies:** SETUP-001
- **Suggested AI Prompt:**
  ```text
  Configure frontend/src/config/firebase.ts with Firebase Storage SDK initialization, storage reference creation, and typed upload helper functions.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** Firebase storage initialization unit test.
- **Definition of Done:** Firebase Storage helper connects and uploads dummy blob to bucket.

---

### Ticket: DOC-002
- **Feature Name:** Document Metadata Database APIs
- **Priority:** Must Have
- **Description:** Implement `POST /api/documents` (saves document metadata after Firebase upload), `GET /api/documents` (lists user documents), and `DELETE /api/documents/:id` (removes metadata & triggers Firebase file deletion).
- **Acceptance Criteria:**
  - `POST /api/documents` validates name, type (`RESUME`, `CERTIFICATE`, `MARKS_CARD`, `INTERNSHIP_CERTIFICATE`), fileUrl, storagePath, fileSize, and mimeType.
  - `GET /api/documents` retrieves documents for authenticated user only.
  - `DELETE /api/documents/:id` verifies record ownership and deletes from database.
- **Dependencies:** DOC-001, SETUP-002, AUTH-003
- **Suggested AI Prompt:**
  ```text
  Create backend/src/controllers/documentController.ts with POST /api/documents, GET /api/documents, and DELETE /api/documents/:id with document type validations.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** API Unit tests for document CRUD operations.
- **Definition of Done:** Document metadata endpoints process document upload records reliably.

---

### Ticket: DOC-003
- **Feature Name:** Digital Document Locker UI Page
- **Priority:** Must Have
- **Description:** Build `DocumentLocker.tsx` UI allowing students to manage academic documents (Resumes, Certificates, Marks Cards) with category tabs, upload dropzone, file previews, and delete triggers.
- **Acceptance Criteria:**
  - Filter tabs by document type (All, Resumes, Certificates, Marks Cards, Internships).
  - Drag-and-drop file upload area supporting PDF and image formats (max 5MB).
  - Table/Grid listing file name, category badge, file size, upload date, download link, and delete icon.
  - Visual storage usage meter (e.g., 4.2 MB / 50 MB used).
- **Dependencies:** DOC-002, SETUP-004
- **Suggested AI Prompt:**
  ```text
  Build frontend/src/pages/DocumentLocker.tsx with drag-and-drop file uploader, document category tabs, storage quota progress bar, and file list table using Tailwind CSS.
  ```
- **Estimated Complexity:** L (1 day)
- **Estimated Story Points:** 8
- **Testing Requirements:** UI File drag-and-drop test, Upload progress state test.
- **Definition of Done:** Document locker enables drag-and-drop uploads and renders categorized document lists.

---

### Ticket: DOC-004
- **Feature Name:** In-Browser Document Previewer Modal
- **Priority:** Should Have
- **Description:** Build a document viewer modal (`DocumentPreviewModal.tsx`) allowing inline viewing of uploaded PDF resumes and certificate images directly in the browser.
- **Acceptance Criteria:**
  - PDF previewer using iframe or canvas renderer.
  - Image viewer with zoom and download controls for certificate images.
- **Dependencies:** DOC-003
- **Suggested AI Prompt:**
  ```text
  Create frontend/src/components/DocumentPreviewModal.tsx to preview PDF documents and image certificates in a clean modal window.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** Modal render test with PDF and image URLs.
- **Definition of Done:** PDFs and image certificates preview clearly in the browser modal.

---

### Ticket: DOC-005
- **Feature Name:** Document Expiry & Certificate Tracking Alerts
- **Priority:** Nice to Have
- **Description:** Allow students to set optional expiry dates on certifications or documents and receive proactive notification alerts before expiration.
- **Acceptance Criteria:**
  - Optional `expiryDate` field on document metadata record.
  - Highlights expiring certificates on Document Locker page.
- **Dependencies:** DOC-003, NOTIF-001
- **Suggested AI Prompt:**
  ```text
  Add optional expiry date tracking to document models and display warning indicators for expiring credentials in DocumentLocker.tsx.
  ```
- **Estimated Complexity:** XS (Less than 1 hour)
- **Estimated Story Points:** 1
- **Testing Requirements:** Expiry date check unit test.
- **Definition of Done:** Expiring certificates display clear visual alert badges.

---

## Epic 11: Skill & Project Tracking

### Ticket: SKILL-001
- **Feature Name:** Skills & Projects Backend Management APIs
- **Priority:** Must Have
- **Description:** Implement `POST /api/skills`, `GET /api/skills`, `DELETE /api/skills/:id`, and corresponding `/api/projects` CRUD endpoints for student technical skill tracking and portfolio project showcases.
- **Acceptance Criteria:**
  - `POST /api/skills` accepts name, category (Programming, Framework, Database, Tool), proficiency (Beginner, Intermediate, Advanced).
  - `POST /api/projects` accepts title, description, techStack (array), githubUrl, liveUrl.
  - Endpoints enforce student user token authorization.
- **Dependencies:** SETUP-002, AUTH-003
- **Suggested AI Prompt:**
  ```text
  Create backend/src/controllers/skillController.ts and projectController.ts implementing full CRUD APIs for User Skill and Project Prisma models.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** API unit tests for skill and project CRUD handlers.
- **Definition of Done:** Skills and project records can be created, retrieved, updated, and deleted.

---

### Ticket: SKILL-002
- **Feature Name:** Student Skill Matrix & Project Portfolio UI Component
- **Priority:** Must Have
- **Description:** Build `SkillProfile.tsx` page featuring interactive technical skills manager (badge grid by proficiency level), project creation modal, and portfolio project cards with GitHub links.
- **Acceptance Criteria:**
  - Technical skills organized by category (Languages, Frameworks, Tools).
  - Visual proficiency badges (Beginner = Blue, Intermediate = Amber, Advanced = Emerald).
  - Project cards featuring tech stack tags, repository links, live preview buttons, and edit/delete actions.
- **Dependencies:** SKILL-001, SETUP-004
- **Suggested AI Prompt:**
  ```text
  Build frontend/src/pages/SkillProfile.tsx with skill category badges, proficiency indicators, project creation modal, and project card grid using Tailwind CSS.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** UI Form submission and badge rendering test.
- **Definition of Done:** Student can add technical skills and showcase projects on their profile page.

---

### Ticket: SKILL-003
- **Feature Name:** AI Skill Gap Analyzer & Learning Path Suggestions
- **Priority:** Should Have
- **Description:** Provide an AI-powered analyzer that inspects the student's branch, semester, and current skill profile, identifying missing industry skills and suggesting targeted learning steps.
- **Acceptance Criteria:**
  - "Analyze Skill Profile" button triggers AI evaluation.
  - Displays skill gap summary (e.g., "For Computer Science Sem 6, consider learning Docker & Kubernetes").
  - Provides direct links to related study materials or video recommendations.
- **Dependencies:** SKILL-002, AI-001
- **Suggested AI Prompt:**
  ```text
  Add AI Skill Gap Analysis feature to SkillProfile.tsx querying AI service for industry skill suggestions based on student branch and added skills.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** AI response parsing and recommendation list test.
- **Definition of Done:** AI skill gap report displays relevant technical recommendations.

---

### Ticket: SKILL-004
- **Feature Name:** Digital Student Resume Builder Preview
- **Priority:** Nice to Have
- **Description:** Render a clean printable web view compiling the student's profile info, top skills, featured projects, and education credentials into a standard academic resume layout.
- **Acceptance Criteria:**
  - Formats user metadata, skills, and projects into single-page clean layout.
  - "Export PDF" / Print button triggers clean print CSS output.
- **Dependencies:** SKILL-002, PROF-002
- **Suggested AI Prompt:**
  ```text
  Create frontend/src/pages/ResumePreview.tsx rendering a clean printable academic resume layout populated from user profile, skills, and project data.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** Print layout rendering test.
- **Definition of Done:** Printable resume layout generates cleanly formatted view.

---

## Epic 12: Internship Opportunities Portal

### Ticket: INT-001
- **Feature Name:** Internship Listings Backend API & Filtering
- **Priority:** Must Have
- **Description:** Implement `GET /api/internships` listing available internships with filtering by location, title keyword, stipend, and active status (`status = 'ACTIVE'`).
- **Acceptance Criteria:**
  - Supports query parameter filters (`location`, `keyword`, `minStipend`).
  - Returns title, company, location, stipend, duration, applyUrl, description, deadline.
  - Excludes expired deadlines automatically or marks status as EXPIRED.
- **Dependencies:** SETUP-002, AUTH-003
- **Suggested AI Prompt:**
  ```text
  Create backend/src/controllers/internshipController.ts with GET /api/internships filtering active listings by keyword, location, and stipend.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** API query filter test.
- **Definition of Done:** Internship endpoint returns active listings with filter support.

---

### Ticket: INT-002
- **Feature Name:** Student Internship Portal UI Page
- **Priority:** Must Have
- **Description:** Build `InternshipPortal.tsx` featuring search bar, location/stipend filter dropdowns, internship card grid, detailed view modal, and direct "Apply Now" external link buttons.
- **Acceptance Criteria:**
  - Cards showcase company name, role title, location tag, stipend badge, and application deadline countdown.
  - Slide-over or modal view displaying complete role description and eligibility criteria.
  - "Apply Now" button opens official application URL safely in new browser tab.
- **Dependencies:** INT-001, SETUP-004
- **Suggested AI Prompt:**
  ```text
  Build frontend/src/pages/InternshipPortal.tsx with search filters, role cards, stipend badges, deadline indicators, and detail view modal using Tailwind CSS.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** UI search and filter execution test.
- **Definition of Done:** Internship portal allows browsing and applying for active internship roles.

---

### Ticket: INT-003
- **Feature Name:** Saved Internships & Application Tracker
- **Priority:** Should Have
- **Description:** Allow students to save interesting internships and mark application status (Saved, Applied, Interviewing, Offered).
- **Acceptance Criteria:**
  - Bookmark icon to save internship listings.
  - Tracker board tab showing status columns for saved roles.
- **Dependencies:** INT-002
- **Suggested AI Prompt:**
  ```text
  Add saved listings bookmark feature and application status tracker tab to InternshipPortal.tsx.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** UI application tracker state test.
- **Definition of Done:** Student can bookmark listings and track personal application stages.

---

### Ticket: INT-004
- **Feature Name:** Deadline Alert Notifications for Saved Internships
- **Priority:** Nice to Have
- **Description:** Trigger automatic notification alerts 48 hours before the application deadline for saved internships.
- **Acceptance Criteria:**
  - Scheduled background check or route trigger generating notification items for impending deadlines.
- **Dependencies:** INT-003, NOTIF-001
- **Suggested AI Prompt:**
  ```text
  Implement deadline alert checker for saved internships generating user notification items when deadline is within 48 hours.
  ```
- **Estimated Complexity:** XS (Less than 1 hour)
- **Estimated Story Points:** 2
- **Testing Requirements:** Notification trigger time logic test.
- **Definition of Done:** Impending deadline alerts appear in student notification tray.

---

## Epic 13: Job Opportunities Portal

### Ticket: JOB-001
- **Feature Name:** Job Listings Backend API & Filtering
- **Priority:** Must Have
- **Description:** Implement `GET /api/jobs` endpoint returning graduate job postings with filtering by title, company, location, salary package range, and status.
- **Acceptance Criteria:**
  - Filters listings by location, job title, and min package.
  - Returns full metadata (title, company, package, location, applyUrl, description, deadline).
- **Dependencies:** SETUP-002, AUTH-003
- **Suggested AI Prompt:**
  ```text
  Create backend/src/controllers/jobController.ts with GET /api/jobs endpoint returning active job postings with query filtering.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** API unit test for job filters.
- **Definition of Done:** Jobs endpoint lists career openings matching search criteria.

---

### Ticket: JOB-002
- **Feature Name:** Job Portal UI Page & Role Detail View
- **Priority:** Must Have
- **Description:** Build `JobPortal.tsx` showcasing full-time job openings for graduating students, featuring salary package indicators, company badges, search filters, and application links.
- **Acceptance Criteria:**
  - Clean job cards displaying CTC package (e.g., "$70,000 / year" or "8 LPA"), job location, and target graduation batch.
  - Expanded detail view showing job requirements and company profile.
  - Direct application trigger button.
- **Dependencies:** JOB-001, SETUP-004
- **Suggested AI Prompt:**
  ```text
  Build frontend/src/pages/JobPortal.tsx with CTC package badges, location filters, role detail drawer, and direct apply action buttons.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** UI filtering and detail drawer render test.
- **Definition of Done:** Job portal renders active graduate openings with clear CTC and application options.

---

### Ticket: JOB-003
- **Feature Name:** Career Match Score Calculator
- **Priority:** Nice to Have
- **Description:** Compare student's registered skills against job requirement descriptions and display a visual match score percentage (e.g., "85% Skill Match").
- **Acceptance Criteria:**
  - Analyzes overlapping skill tags between student profile and job posting.
  - Displays color-coded match badge on job card (Green = > 75%, Yellow = 50-75%, Gray = < 50%).
- **Dependencies:** JOB-002, SKILL-001
- **Suggested AI Prompt:**
  ```text
  Calculate skill match percentage between student skills and job requirements, rendering visual match score badges on job cards.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** Match algorithm unit test.
- **Definition of Done:** Job cards display visual skill match badges based on student skills.

---

### Ticket: JOB-004
- **Feature Name:** Job Application History Tracker
- **Priority:** Should Have
- **Description:** Allow students to log their off-campus job applications, dates applied, and interview progress status.
- **Acceptance Criteria:**
  - Form to log applied jobs and interview dates.
  - Summary table listing user's active job application pipeline.
- **Dependencies:** JOB-002
- **Suggested AI Prompt:**
  ```text
  Add off-campus job application tracker logger to JobPortal.tsx.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 2
- **Testing Requirements:** Application log form submission test.
- **Definition of Done:** Student can maintain personal log of job applications.

---

## Epic 14: Government Competitive Exam Tracker

### Ticket: GOV-001
- **Feature Name:** Government Exam Listings Backend API
- **Priority:** Must Have
- **Description:** Implement `GET /api/government-exams` returning public competitive exam announcements (e.g., GATE, UPSC, SSC, Banking, State PSCs) with eligibility requirements and exam dates.
- **Acceptance Criteria:**
  - Returns exam title, organizer, eligibility criteria, exam date, application link, and description.
  - Supports filtering by target branch eligibility and upcoming exam dates.
- **Dependencies:** SETUP-002, AUTH-003
- **Suggested AI Prompt:**
  ```text
  Create backend/src/controllers/governmentExamController.ts with GET /api/government-exams filtering exam records by eligibility and exam date.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** API filter unit test.
- **Definition of Done:** Endpoint lists active competitive government exam notifications.

---

### Ticket: GOV-002
- **Feature Name:** Government Exams Portal UI Page
- **Priority:** Must Have
- **Description:** Build `GovernmentExams.tsx` page presenting competitive exams, eligibility calculator check, exam dates calendar timeline, and official notification link triggers.
- **Acceptance Criteria:**
  - Exam cards showcasing organizing body (e.g., IIT/IISc for GATE), eligibility summary, and countdown to exam date.
  - Filter tabs (Engineering Exams, Banking, Civil Services, Defense).
  - Link to official notification document and online registration portal.
- **Dependencies:** GOV-001, SETUP-004
- **Suggested AI Prompt:**
  ```text
  Build frontend/src/pages/GovernmentExams.tsx showcasing competitive exam cards, organizing body badges, countdown timers, and official portal links using Tailwind CSS.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** UI render and date format display test.
- **Definition of Done:** Government exam portal displays upcoming exams with countdown timers.

---

### Ticket: GOV-003
- **Feature Name:** Exam Syllabus & Resource Quick Link Overlay
- **Priority:** Should Have
- **Description:** Provide syllabus breakdown and direct quick links to recommended study materials or past papers for selected government exams (e.g., GATE CS syllabus).
- **Acceptance Criteria:**
  - Clicking exam card opens syllabus accordion and linked study materials.
- **Dependencies:** GOV-002, RES-003
- **Suggested AI Prompt:**
  ```text
  Add syllabus drawer overlay to GovernmentExams.tsx displaying exam pattern, syllabus topics, and related platform study materials.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** Syllabus drawer rendering test.
- **Definition of Done:** Students can inspect official syllabus breakdown per exam.

---

### Ticket: GOV-004
- **Feature Name:** Exam Date Reminder Subscription
- **Priority:** Nice to Have
- **Description:** Enable students to subscribe to exam reminders and receive email/in-app notifications 7 days prior to application deadlines and exam dates.
- **Acceptance Criteria:**
  - "Remind Me" bell toggle on exam card.
  - Automatically enqueues notification for target user.
- **Dependencies:** GOV-002, NOTIF-001
- **Suggested AI Prompt:**
  ```text
  Add exam reminder subscription toggle button generating scheduled notification alerts for upcoming exam dates.
  ```
- **Estimated Complexity:** XS (Less than 1 hour)
- **Estimated Story Points:** 2
- **Testing Requirements:** Reminder subscription unit test.
- **Definition of Done:** Subscribed exams generate timely notification reminders.

---

## Epic 15: Academic & Career Notification System

### Ticket: NOTIF-001
- **Feature Name:** Notification Delivery Backend APIs
- **Priority:** Must Have
- **Description:** Implement `GET /api/notifications` (retrieving user notifications + broadcast alerts), `PATCH /api/notifications/:id/read` (marking notification read), and `PATCH /api/notifications/read-all`.
- **Acceptance Criteria:**
  - `GET /api/notifications` returns items where `userId` matches authenticated student or `userId` is null (broadcast).
  - Returns unread count count aggregate.
  - Updates `isRead = true` upon request.
- **Dependencies:** SETUP-002, AUTH-003
- **Suggested AI Prompt:**
  ```text
  Create backend/src/controllers/notificationController.ts implementing GET /api/notifications, PATCH /api/notifications/:id/read, and PATCH /api/notifications/read-all.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** API unit test for broadcast and individual notification retrieval.
- **Definition of Done:** Notifications API delivers targeted and global notification messages.

---

### Ticket: NOTIF-002
- **Feature Name:** Notification Bell Dropdown & Toast Alert UI
- **Priority:** Must Have
- **Description:** Implement interactive Notification Bell icon in application top navbar displaying unread count badge, interactive dropdown list, mark-all-as-read action, and instant toast notifications.
- **Acceptance Criteria:**
  - Red notification badge displaying count of unread items.
  - Dropdown menu rendering list of notifications with icon by type (`ACADEMIC`, `QUIZ`, `CAREER`, `GENERAL`).
  - Clicking item marks it read and opens associated resource URL.
  - Toast popup appears when new notification arrives during active session.
- **Dependencies:** NOTIF-001, SETUP-004
- **Suggested AI Prompt:**
  ```text
  Create frontend/src/components/NotificationDropdown.tsx with unread count badge, category icons, mark-as-read click handler, and toast popup integration.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** Dropdown click state test, Unread badge counter test.
- **Definition of Done:** Navbar notification bell displays unread badge count and list popover.

---

### Ticket: NOTIF-003
- **Feature Name:** System-Wide Broadcast Dispatcher API (Admin)
- **Priority:** Must Have
- **Description:** Implement `POST /api/admin/notifications` endpoint allowing administrators to send broadcast notifications to all registered students or target specific semesters/branches.
- **Acceptance Criteria:**
  - Endpoint requires `ADMIN` role.
  - Accepts `title`, `message`, `type`, `targetBranch`, `targetSemester`.
  - Creates broadcast records in Notification database table.
- **Dependencies:** NOTIF-001, AUTH-003
- **Suggested AI Prompt:**
  ```text
  Implement POST /api/admin/notifications in backend allowing admin users to issue system-wide academic or career alerts.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** Admin broadcast API unit test.
- **Definition of Done:** Admin can dispatch targeted broadcast notifications to students.

---

### Ticket: NOTIF-004
- **Feature Name:** Notification Preference Configuration Settings
- **Priority:** Nice to Have
- **Description:** Provide toggle controls on user settings page allowing students to mute specific notification categories (e.g., disable career alerts, keep academic alerts).
- **Acceptance Criteria:**
  - Toggles for Academic, Quiz, Career, and Exam notification types.
  - Filters out muted notification types from student dropdown feed.
- **Dependencies:** NOTIF-002
- **Suggested AI Prompt:**
  ```text
  Add notification channel preference toggles to Settings.tsx and filter notification feed based on preferences.
  ```
- **Estimated Complexity:** XS (Less than 1 hour)
- **Estimated Story Points:** 1
- **Testing Requirements:** Preference filter test.
- **Definition of Done:** Muted notification categories are suppressed from user feed.

---

## Epic 16: Semester Upgrade & Academic Progression

### Ticket: SEM-001
- **Feature Name:** Semester Upgrade Logic Backend API
- **Priority:** Must Have
- **Description:** Implement `POST /api/profile/upgrade-semester` endpoint enabling students to increment their current academic semester (e.g., Sem 3 -> Sem 4), automatically refreshing resource catalogs and subjects.
- **Acceptance Criteria:**
  - Verifies current semester < maximum program semester (e.g., 8).
  - Updates `StudentProfile.semester` attribute.
  - Generates confirmation notification: "Welcome to Semester {N}! Your dashboard and study materials have been updated."
  - Returns updated profile object and new list of enrolled subjects.
- **Dependencies:** PROF-001, NOTIF-001
- **Suggested AI Prompt:**
  ```text
  Implement POST /api/profile/upgrade-semester in profileController.ts incrementing student semester, updating subject catalog, and generating congratulatory notification.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** Semester upgrade unit test (verify boundary checks and subject refresh).
- **Definition of Done:** Semester upgrades smoothly and refreshes active academic catalog.

---

### Ticket: SEM-002
- **Feature Name:** Semester Upgrade Modal & Academic Progression UI
- **Priority:** Must Have
- **Description:** Design an interactive "Upgrade Semester" wizard modal (`SemesterUpgradeModal.tsx`) prompting students at end-of-term to advance their semester with confetti animation and course overview.
- **Acceptance Criteria:**
  - Modal displaying current semester vs target new semester.
  - Summary of new subjects and modules that will unlock upon upgrade.
  - Visual celebration state (confetti animation) upon successful upgrade trigger.
  - Instant re-fetch of dashboard metrics and study resources without page reload.
- **Dependencies:** SEM-001, SETUP-004
- **Suggested AI Prompt:**
  ```text
  Build frontend/src/components/SemesterUpgradeModal.tsx displaying current vs target semester, unlocking subjects preview, celebration animation, and API trigger.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** Modal trigger and dashboard refresh UI integration test.
- **Definition of Done:** Semester upgrade modal advances student profile and updates app views seamlessly.

---

### Ticket: SEM-003
- **Feature Name:** Historical Academic Archive Access
- **Priority:** Should Have
- **Description:** Allow students who have upgraded semesters to access past semester study materials and quizzes via an "Academic Archive" filter dropdown.
- **Acceptance Criteria:**
  - Semester selector dropdown allowing view of completed past semesters (e.g., view Sem 1 notes while in Sem 4).
  - Read-only browsing state for archived semester materials.
- **Dependencies:** SEM-002, RES-003
- **Suggested AI Prompt:**
  ```text
  Add historical semester archive toggle to StudyResources.tsx allowing students to view notes from previous semesters.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 2
- **Testing Requirements:** Historical filter UI test.
- **Definition of Done:** Archived study materials remain accessible for past semesters.

---

## Epic 17: Administrator Dashboard & High-Level Metrics

### Ticket: ADMIN-001
- **Feature Name:** Admin Summary & System Overview Aggregation API
- **Priority:** Must Have
- **Description:** Implement `GET /api/admin/stats` returning global platform metrics: total registered students, total study resources, total quizzes, active job/internship listings, AI queries processed today, and recent audit events.
- **Acceptance Criteria:**
  - Enforces `ADMIN` role middleware restriction.
  - Aggregates counts across User, StudyResource, Quiz, Internship, Job, and ChatHistory tables.
  - Response time under 250ms using efficient Prisma counts.
- **Dependencies:** AUTH-003, SETUP-002
- **Suggested AI Prompt:**
  ```text
  Create backend/src/controllers/adminController.ts with GET /api/admin/stats aggregating total users, resources, quizzes, career listings, and daily AI query counts.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** Admin authorization test, Aggregation calculation test.
- **Definition of Done:** Admin stats endpoint returns platform-wide metrics securely.

---

### Ticket: ADMIN-002
- **Feature Name:** Admin Main Dashboard UI Page
- **Priority:** Must Have
- **Description:** Build `AdminDashboard.tsx` presenting executive metric cards, platform user growth charts, quick management navigation panels, and active system status monitors.
- **Acceptance Criteria:**
  - Hero statistics grid (Total Students, Active Resources, Quizzes Taken, AI Queries).
  - Quick link buttons to Student Management, Resource Management, Quiz Manager, and Career Manager.
  - Analytics visual cards (Bar charts for resource breakdown by branch).
- **Dependencies:** ADMIN-001, SETUP-004
- **Suggested AI Prompt:**
  ```text
  Build frontend/src/pages/admin/AdminDashboard.tsx featuring high-level stat cards, quick action panels, usage charts, and system status indicators using Tailwind CSS.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** UI Chart rendering and responsive layout test.
- **Definition of Done:** Admin dashboard displays high-level system analytics and quick admin links.

---

### Ticket: ADMIN-003
- **Feature Name:** Student User Management API & List Table UI
- **Priority:** Must Have
- **Description:** Implement `GET /api/admin/students` (paginated list of registered students with search), `PATCH /api/admin/students/:id/status` (toggle account active status), and corresponding admin UI table (`StudentManagement.tsx`).
- **Acceptance Criteria:**
  - Paginated student table displaying Name, Email, University, Branch, Semester, Joined Date, and Status (Active/Deactivated).
  - Search box filtering by student name or email.
  - Deactivate / Reactivate toggle button with instant API call.
- **Dependencies:** ADMIN-002, AUTH-003
- **Suggested AI Prompt:**
  ```text
  Implement student list and status toggle APIs, and build frontend/src/pages/admin/StudentManagement.tsx with paginated data table and account status toggle.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** Admin student management API & UI unit tests.
- **Definition of Done:** Admin can search, inspect, and toggle active status of student accounts.

---

### Ticket: ADMIN-004
- **Feature Name:** System Audit Log Viewer UI Component
- **Priority:** Should Have
- **Description:** Build `AuditLogViewer.tsx` presenting security and system audit logs (`GET /api/admin/audit-logs`) tracking admin actions, login attempts, and document uploads.
- **Acceptance Criteria:**
  - Table displaying Timestamp, User/Admin, Action Type, IP Address, and Event Details.
  - Filter dropdown by Action type (`LOGIN`, `RESOURCE_CREATE`, `USER_DEACTIVATE`).
- **Dependencies:** ADMIN-002, SEC-003
- **Suggested AI Prompt:**
  ```text
  Build frontend/src/pages/admin/AuditLogViewer.tsx displaying system security logs with event filtering and timestamp sorting.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** Audit log table filtering test.
- **Definition of Done:** System audit log viewer displays recorded security events cleanly.

---

## Epic 18: Admin Content & Master Data Management

### Ticket: ADMRES-001
- **Feature Name:** Admin Subject & Curriculum CRUD APIs & UI Page
- **Priority:** Must Have
- **Description:** Implement admin CRUD endpoints (`/api/admin/subjects`) and UI page (`SubjectManagement.tsx`) for creating, editing, and organizing academic subjects by university, branch, and semester.
- **Acceptance Criteria:**
  - Admin form to add subject (Subject Code, Subject Name, Branch, Semester, Description).
  - Validates uniqueness of `subjectCode`.
  - Data table listing subjects with edit modal and delete triggers.
- **Dependencies:** SETUP-002, ADMIN-002
- **Suggested AI Prompt:**
  ```text
  Implement CRUD backend APIs and frontend/src/pages/admin/SubjectManagement.tsx for adding, editing, and listing academic subjects.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** Subject CRUD API and UI component test.
- **Definition of Done:** Admin can manage academic subjects across all university branches.

---

### Ticket: ADMRES-002
- **Feature Name:** Admin Study Resource & Google Drive Link Manager
- **Priority:** Must Have
- **Description:** Implement `POST /api/admin/resources` and UI (`ResourceManagement.tsx`) enabling admins to add notes, PPTs, lab manuals, and previous year papers by attaching title, subjectId, module number, type, and Google Drive share URL.
- **Acceptance Criteria:**
  - Accepts title, description, subjectId, moduleNumber, type, and Google Drive URL.
  - Validates Google Drive URL format using `driveUtils`.
  - Instantly publishes resource to student study catalog.
- **Dependencies:** ADMRES-001, DRIVE-001
- **Suggested AI Prompt:**
  ```text
  Implement POST/PUT/DELETE /api/admin/resources and build ResourceManagement.tsx with Google Drive link validation and module selector.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** Resource management CRUD and URL validation test.
- **Definition of Done:** Admin can post Google Drive study materials linked to specific subject modules.

---

### Ticket: ADMRES-003
- **Feature Name:** Admin Quiz & Question Builder Manager
- **Priority:** Must Have
- **Description:** Build `QuizManagement.tsx` enabling admins to construct quizzes, set time limits, total marks, and add multiple-choice questions with option choices and correct answer designations.
- **Acceptance Criteria:**
  - Quiz creation form (Title, Subject, Module Number, Time Limit in mins, Total Marks).
  - Interactive question builder allowing addition of questions, 4 option choices, correct option radio selection, and explanation note.
  - Saves quiz and nested questions inside Prisma transaction.
- **Dependencies:** ADMRES-001, QUIZ-001
- **Suggested AI Prompt:**
  ```text
  Build frontend/src/pages/admin/QuizManagement.tsx with dynamic question builder form (question text, 4 options, correct answer toggle, explanation text) and backend nested creation endpoint.
  ```
- **Estimated Complexity:** L (1 day)
- **Estimated Story Points:** 8
- **Testing Requirements:** Quiz nested creation integration test.
- **Definition of Done:** Admin can build full multi-question quizzes with answer keys and explanations.

---

### Ticket: ADMRES-004
- **Feature Name:** Admin Internship & Job Portal Management
- **Priority:** Must Have
- **Description:** Build `CareerManagement.tsx` allowing admins to post, edit, deactivate, or delete internship and job postings.
- **Acceptance Criteria:**
  - Form fields: Title, Company, Location, Stipend/Package, Duration/Job Type, Application URL, Description, Deadline.
  - Toggle listing status between `ACTIVE` and `EXPIRED`.
- **Dependencies:** ADMIN-002, INT-001, JOB-001
- **Suggested AI Prompt:**
  ```text
  Build frontend/src/pages/admin/CareerManagement.tsx for creating and editing internship/job postings with active status toggles.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** Career management CRUD test.
- **Definition of Done:** Admin can publish and manage student career listings.

---

### Ticket: ADMRES-005
- **Feature Name:** Admin Government Exam Manager
- **Priority:** Should Have
- **Description:** Build interface for adding competitive government exam notifications, dates, eligibility details, and official notification links.
- **Acceptance Criteria:**
  - Exam posting form (Title, Organizing Body, Eligibility, Exam Date, Official Apply URL, Description).
  - Updates list of active government exams.
- **Dependencies:** ADMRES-004, GOV-001
- **Suggested AI Prompt:**
  ```text
  Add Government Exam creation tab inside CareerManagement.tsx with official notification link inputs.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** Exam posting form test.
- **Definition of Done:** Admin can post new government exam alerts.

---

## Epic 19: Reports, Platform Usage & Export Analytics

### Ticket: REPO-001
- **Feature Name:** Academic Content Usage Analytics API
- **Priority:** Should Have
- **Description:** Implement `GET /api/admin/reports/content-usage` returning metrics on most downloaded resources, most attempted quizzes, and top queried AI subjects.
- **Acceptance Criteria:**
  - Aggregates resource views/access stats.
  - Aggregates quiz completion counts and average pass rates.
  - Aggregates AI chat subject distribution.
- **Dependencies:** ADMIN-001, SETUP-002
- **Suggested AI Prompt:**
  ```text
  Implement GET /api/admin/reports/content-usage returning resource views, quiz pass rates, and AI chat topic breakdowns.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** Report aggregation calculation unit test.
- **Definition of Done:** Analytics API returns accurate content usage metrics.

---

### Ticket: REPO-002
- **Feature Name:** Platform Reports & Visual Analytics UI Page
- **Priority:** Should Have
- **Description:** Build `ReportsAnalytics.tsx` presenting interactive visual charts (Bar charts, Pie charts, Line graphs) for student engagement, quiz pass rates, and resource utilization.
- **Acceptance Criteria:**
  - Student engagement line chart (Daily active queries).
  - Subject resource breakdown bar chart.
  - Quiz score distribution pie chart.
- **Dependencies:** REPO-001, SETUP-004
- **Suggested AI Prompt:**
  ```text
  Build frontend/src/pages/admin/ReportsAnalytics.tsx rendering visual charts for student engagement, quiz scores, and content usage using Lucide/Recharts.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** UI Chart component render test.
- **Definition of Done:** Admin can analyze visual platform usage and student performance metrics.

---

### Ticket: REPO-003
- **Feature Name:** CSV / Excel Export Engine for Platform Data
- **Priority:** Should Have
- **Description:** Implement CSV export endpoints (`GET /api/admin/export/students`, `GET /api/admin/export/quizzes`) enabling administrators to download raw data reports.
- **Acceptance Criteria:**
  - Generates valid CSV formatted responses with standard headers (`Content-Type: text/csv`).
  - Student export includes Name, Email, Branch, Semester, Joined Date.
  - Quiz export includes Student Name, Quiz Title, Score, Submitted Date.
- **Dependencies:** REPO-001
- **Suggested AI Prompt:**
  ```text
  Implement CSV file export endpoints in adminController.ts for downloading student lists and quiz submission results as downloadable .csv files.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** CSV formatting and download header test.
- **Definition of Done:** Admin can download platform reports in standard CSV file format.

---

### Ticket: REPO-004
- **Feature Name:** Student Individual Academic Progress Report
- **Priority:** Nice to Have
- **Description:** Generate downloadable individual PDF/Summary report for a student showing their quiz scores, skills, stored credentials, and completed modules.
- **Acceptance Criteria:**
  - Formats personal academic progress summary report.
- **Dependencies:** REPO-002, PROF-002
- **Suggested AI Prompt:**
  ```text
  Create student academic progress report view with print/download option summarizing quiz history and skill profile.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** Student progress report generator test.
- **Definition of Done:** Student progress summary report renders cleanly.

---

## Epic 20: System & User Preference Settings

### Ticket: SET-001
- **Feature Name:** User Preference & Theme Configuration API
- **Priority:** Should Have
- **Description:** Implement user settings state management allowing customization of UI theme mode (Light, Dark, System default), layout density, and notification channels.
- **Acceptance Criteria:**
  - Persists preference selections in LocalStorage and Auth state.
  - Applies Dark/Light theme class to root element dynamically.
- **Dependencies:** SETUP-004, AUTH-004
- **Suggested AI Prompt:**
  ```text
  Create frontend/src/pages/Settings.tsx with theme mode selector (Light/Dark/System), layout density controls, and local persistence.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 2
- **Testing Requirements:** Theme class toggling UI test.
- **Definition of Done:** Settings page toggles dark mode theme and preserves state across sessions.

---

### Ticket: SET-002
- **Feature Name:** System-Wide Configuration & Maintenance Mode API (Admin)
- **Priority:** Nice to Have
- **Description:** Implement admin system settings endpoint (`/api/admin/settings`) to set application banner announcements or toggle scheduled maintenance window flags.
- **Acceptance Criteria:**
  - Maintenance mode flag blocks non-admin API traffic with 503 Maintenance response.
  - System banner text displays across all student header banners.
- **Dependencies:** ADMIN-001, SETUP-003
- **Suggested AI Prompt:**
  ```text
  Implement system maintenance mode middleware and announcement banner API in backend server.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** Maintenance mode middleware interception test.
- **Definition of Done:** Admin can trigger site announcement banners or enable maintenance mode.

---

### Ticket: SET-003
- **Feature Name:** Account Deactivation & Data Export (GDPR Compliance)
- **Priority:** Nice to Have
- **Description:** Allow students to download a JSON archive of all their stored profile data, AI chats, and document metadata, or request permanent account deletion.
- **Acceptance Criteria:**
  - "Download My Data" button returns JSON blob containing all user database records.
  - "Delete Account" button verifies password and cascades deletion of user records.
- **Dependencies:** SET-001, AUTH-002
- **Suggested AI Prompt:**
  ```text
  Implement user data export endpoint GET /api/profile/export-data and account self-deletion endpoint DELETE /api/profile/account.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** User data export JSON verification test, Cascade delete test.
- **Definition of Done:** Student can export personal data or execute account self-deletion cleanly.

---

## Epic 21: Performance Optimization & Caching Layer

### Ticket: PERF-001
- **Feature Name:** In-Memory Caching for Academic Master Data
- **Priority:** Should Have
- **Description:** Implement in-memory Node caching (`node-cache` or Redis) for static database queries like Subject catalogs, Study Resources, and Government Exam listings.
- **Acceptance Criteria:**
  - Caches subject and resource catalog responses with 15-minute TTL.
  - Invalidate cache automatically when admin updates subject or resource records.
  - Reduces average response latency for `/api/subjects` to < 20ms.
- **Dependencies:** SETUP-003, RES-001
- **Suggested AI Prompt:**
  ```text
  Add node-cache middleware to backend endpoints for caching subject catalog and study resource queries with TTL and cache invalidation on admin edits.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** Cache hit/miss timing benchmark test.
- **Definition of Done:** Master data API routes execute with sub-50ms response latency.

---

### Ticket: PERF-002
- **Feature Name:** Frontend Lazy Loading & Bundle Code-Splitting
- **Priority:** Should Have
- **Description:** Optimize Vite frontend bundle size using React `lazy()` and `Suspense` for page routes, reducing initial JavaScript bundle load size.
- **Acceptance Criteria:**
  - Lazy-loads heavy pages (AIAssistant, DocumentLocker, QuizSystem, Admin Dashboard).
  - Shows smooth loading spinner skeleton during chunk fetch.
  - Initial JS bundle size remains under 350KB gzip.
- **Dependencies:** SETUP-004
- **Suggested AI Prompt:**
  ```text
  Configure React.lazy() and Suspense dynamic imports across all main router pages in App.tsx to enable route-level code splitting.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 2
- **Testing Requirements:** Bundle analyzer inspection test.
- **Definition of Done:** Page routes lazy load in separate bundle chunks cleanly.

---

### Ticket: PERF-003
- **Feature Name:** Image & Asset Optimization Utility
- **Priority:** Nice to Have
- **Description:** Implement client-side image compression before Firebase uploads and add WebP image format rendering for thumbnails.
- **Acceptance Criteria:**
  - Compresses avatar images before cloud upload to maintain file size < 300KB.
- **Dependencies:** DOC-001, PROF-003
- **Suggested AI Prompt:**
  ```text
  Add browser-image-compression utility before Firebase upload in DocumentLocker.tsx and Profile.tsx.
  ```
- **Estimated Complexity:** XS (Less than 1 hour)
- **Estimated Story Points:** 1
- **Testing Requirements:** Image compression file size ratio test.
- **Definition of Done:** Uploaded images compress automatically before network upload.

---

## Epic 22: Security Hardening & Audit Logging

### Ticket: SEC-001
- **Feature Name:** Rate Limiting & Brute-Force Protection
- **Priority:** Must Have
- **Description:** Apply `express-rate-limit` middleware across all API routes, with strict rate limits on authentication endpoints (`POST /api/auth/login`, `POST /api/auth/register`) to prevent brute-force attacks.
- **Acceptance Criteria:**
  - Limits login requests to maximum 5 attempts per 15 minutes per IP.
  - Limits global API calls to 100 requests per minute per IP.
  - Returns 429 Too Many Requests response with standard error JSON.
- **Dependencies:** SETUP-003, AUTH-002
- **Suggested AI Prompt:**
  ```text
  Add express-rate-limit middleware configuring strict rate limits on /api/auth/* endpoints and global rate limits across /api/*.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 2
- **Testing Requirements:** API rate limit threshold test (verify 429 status response).
- **Definition of Done:** Excessive login requests trigger HTTP 429 rate limit responses.

---

### Ticket: SEC-002
- **Feature Name:** Input Sanitization & XSS / Injection Prevention
- **Priority:** Must Have
- **Description:** Implement strict input sanitization middleware using DOMPurify/validator on all user text inputs (chat queries, bio, project descriptions) to eliminate Cross-Site Scripting (XSS) and SQL injection vectors.
- **Acceptance Criteria:**
  - Sanitizes HTML/JS scripts from user inputs before DB persistence or AI prompt processing.
  - Ensures Prisma parameterized queries prevent all SQL injection attacks.
- **Dependencies:** SETUP-003, AI-002
- **Suggested AI Prompt:**
  ```text
  Create backend input sanitization middleware stripping script tags and malicious characters from incoming request bodies.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** Security XSS attack payload unit test.
- **Definition of Done:** Malicious script payloads are sanitized safely.

---

### Ticket: SEC-003
- **Feature Name:** Automated Audit Log Interceptor Middleware
- **Priority:** Must Have
- **Description:** Implement `auditLogger` middleware recording critical actions (login failures, profile edits, admin resource creations, document deletions) into the `AuditLog` database table with user ID and IP address.
- **Acceptance Criteria:**
  - Automatically records timestamp, userId, action name, IP address, and details payload.
  - Captures failed authentication attempts for security monitoring.
- **Dependencies:** SETUP-002, AUTH-003
- **Suggested AI Prompt:**
  ```text
  Create backend/src/middlewares/auditMiddleware.ts capturing critical actions and persisting security events into AuditLog model.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** Audit log creation unit test.
- **Definition of Done:** Critical operations generate audit log entries in the database.

---

### Ticket: SEC-004
- **Feature Name:** Security Headers & CORS Policy Tightening
- **Priority:** Must Have
- **Description:** Configure Helmet security headers (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`) and restrict CORS origins to authorized frontend domains.
- **Acceptance Criteria:**
  - CORS rejects requests from unauthorized origins.
  - Helmet attaches standard security headers to every HTTP response.
- **Dependencies:** SETUP-003
- **Suggested AI Prompt:**
  ```text
  Configure helmet security headers and environment-driven CORS origin validator inside backend/src/server.ts.
  ```
- **Estimated Complexity:** XS (Less than 1 hour)
- **Estimated Story Points:** 1
- **Testing Requirements:** Security header inspection test using cURL/Postman.
- **Definition of Done:** HTTP headers contain required security enforcement flags.

---

## Epic 23: Automated & End-to-End Testing

### Ticket: TEST-001
- **Feature Name:** Backend Unit & Controller Test Suite (Jest / Supertest)
- **Priority:** Must Have
- **Description:** Implement Jest and Supertest test suite (`backend/src/__tests__/`) covering Authentication, Profile, Resource, Quiz, and AI endpoints.
- **Acceptance Criteria:**
  - Unit tests for all controllers and middlewares.
  - Integration tests for user auth flow (Register -> Login -> Fetch Profile).
  - Minimum 70% backend code coverage.
- **Dependencies:** AUTH-002, RES-001, QUIZ-002
- **Suggested AI Prompt:**
  ```text
  Set up Jest and Supertest in backend/ package.json and write unit and integration tests for Auth, Profile, and Quiz controllers.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** Automated Jest execution (`npm test`).
- **Definition of Done:** `npm test` executes all backend tests with >70% coverage.

---

### Ticket: TEST-002
- **Feature Name:** Frontend Component Unit Tests (Vitest + React Testing Library)
- **Priority:** Should Have
- **Description:** Set up Vitest and React Testing Library in frontend directory to test key UI components (LoginForm, Navbar, QuizRunner, DocumentLocker).
- **Acceptance Criteria:**
  - Tests form submit interactions and error state rendering.
  - Mocks Axios network calls cleanly.
- **Dependencies:** SETUP-004, AUTH-005
- **Suggested AI Prompt:**
  ```text
  Configure Vitest and React Testing Library in frontend/ and write component tests for LoginForm, Navbar, and TakeQuiz components.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** Vitest execution command.
- **Definition of Done:** Frontend unit tests pass cleanly without warnings.

---

### Ticket: TEST-003
- **Feature Name:** End-to-End User Flow Test Script (Playwright / Cypress)
- **Priority:** Nice to Have
- **Description:** Write Playwright end-to-end integration test automating critical user journey: Registration -> Log In -> Ask AI Question -> View Study Resources -> Submit Quiz -> Upload Document.
- **Acceptance Criteria:**
  - Automated test script launches browser, completes entire student user journey, and verifies DOM assertions.
- **Dependencies:** TEST-001, TEST-002
- **Suggested AI Prompt:**
  ```text
  Write a Playwright end-to-end test script in e2e/ testing student registration, login, AI query, quiz submission, and document upload.
  ```
- **Estimated Complexity:** L (1 day)
- **Estimated Story Points:** 8
- **Testing Requirements:** Playwright E2E browser run.
- **Definition of Done:** E2E test script completes student workflow automatically.

---

### Ticket: TEST-004
- **Feature Name:** API Mocking & Seed Database Reset Runner
- **Priority:** Should Have
- **Description:** Provide test helper script to reset and re-seed database before running integration tests to maintain clean testing state.
- **Acceptance Criteria:**
  - `npm run test:reset` clears database and seeds fresh test data.
- **Dependencies:** SETUP-005, TEST-001
- **Suggested AI Prompt:**
  ```text
  Create npm run test:reset script that drops, migrates, and seeds test database before test execution.
  ```
- **Estimated Complexity:** XS (Less than 1 hour)
- **Estimated Story Points:** 1
- **Testing Requirements:** Database seed reset script check.
- **Definition of Done:** Test database resets cleanly before test runner launch.

---

## Epic 24: Cloud Deployment & CI/CD Pipeline

### Ticket: DEPL-001
- **Feature Name:** Dockerization & Container Configuration
- **Priority:** Should Have
- **Description:** Write `Dockerfile` for backend Node service and multi-stage `Dockerfile` (Nginx) for frontend React web app, along with `docker-compose.yml` orchestrating application services.
- **Acceptance Criteria:**
  - `docker-compose up` builds and runs backend, frontend, and database services smoothly.
  - Multi-stage build minimizes container image footprint (< 150MB).
- **Dependencies:** SETUP-001, SETUP-003
- **Suggested AI Prompt:**
  ```text
  Create backend/Dockerfile, frontend/Dockerfile (with Nginx web server stage), and root docker-compose.yml for local container orchestration.
  ```
- **Estimated Complexity:** M (Half day)
- **Estimated Story Points:** 5
- **Testing Requirements:** Container build and execution test (`docker-compose up`).
- **Definition of Done:** Docker containers build and run full stack without errors.

---

### Ticket: DEPL-002
- **Feature Name:** GitHub Actions CI/CD Automated Workflow
- **Priority:** Should Have
- **Description:** Create GitHub Actions workflow (`.github/workflows/ci.yml`) executing linting, TypeScript compilation, backend unit tests, and frontend build on every pull request to `main` branch.
- **Acceptance Criteria:**
  - Automated workflow triggers on push/PR.
  - Fails build step if type check or tests fail.
- **Dependencies:** TEST-001, DEPL-001
- **Suggested AI Prompt:**
  ```text
  Create .github/workflows/ci.yml configuring GitHub Actions pipeline for ESLint checking, TypeScript compilation, and Jest test execution.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** GitHub Actions workflow execution verification.
- **Definition of Done:** CI pipeline automatically checks code quality on push.

---

### Ticket: DEPL-003
- **Feature Name:** Cloud Deployment Blueprint (Vercel / Render / Supabase)
- **Priority:** Should Have
- **Description:** Document and configure deployment scripts for hosting frontend on Vercel/Netlify, backend Node.js API on Render/Railway, and database on PostgreSQL hosting.
- **Acceptance Criteria:**
  - Production build environment variables properly set.
  - Frontend connects cleanly to production API URL via CORS.
- **Dependencies:** DEPL-001
- **Suggested AI Prompt:**
  ```text
  Provide production deployment configuration guide for deploying frontend to Vercel and backend Express API to Render/Railway.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** Live URL connectivity test.
- **Definition of Done:** Application builds and deploys to production cloud hosting.

---

## Epic 25: Technical & User Documentation

### Ticket: DOCS-001
- **Feature Name:** Comprehensive API Documentation (OpenAPI / Swagger)
- **Priority:** Should Have
- **Description:** Generate OpenAPI 3.0 / Swagger documentation (`/api/docs`) listing all API endpoints, request schemas, authentication requirements, and example responses.
- **Acceptance Criteria:**
  - Swagger UI accessible at `/api/docs` in development mode.
  - Interactive "Try it out" button for testing API routes.
- **Dependencies:** SETUP-003, AUTH-003
- **Suggested AI Prompt:**
  ```text
  Integrate swagger-ui-express in backend server serving OpenAPI spec documentation for all API routes at /api/docs.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 3
- **Testing Requirements:** Swagger UI render and endpoint test.
- **Definition of Done:** Swagger documentation displays interactive API reference.

---

### Ticket: DOCS-002
- **Feature Name:** Project Architecture & Setup README
- **Priority:** Must Have
- **Description:** Update root `README.md` with complete installation instructions, project architecture overview, environment variable list, database migration commands, and technology stack breakdown suitable for project evaluation.
- **Acceptance Criteria:**
  - Clear step-by-step setup guide (`npm install`, `npx prisma migrate dev`, `npm run dev`).
  - Architecture diagram text description.
  - Documented list of features and tech stack details.
- **Dependencies:** SETUP-001, SETUP-002
- **Suggested AI Prompt:**
  ```text
  Create root README.md detailing project overview, tech stack, prerequisite tools, step-by-step local setup guide, and feature breakdown.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 2
- **Testing Requirements:** Documentation review.
- **Definition of Done:** README.md provides complete project setup instructions.

---

### Ticket: DOCS-003
- **Feature Name:** User Guide & Evaluation Presentation Summary
- **Priority:** Should Have
- **Description:** Create user guide artifact (`USER_GUIDE.md`) explaining feature workflows for Students and Admins, suitable for demonstration during project evaluation.
- **Acceptance Criteria:**
  - User walkthrough for Student features (AI Assistant, Resources, Quizzes, Document Locker).
  - Admin walkthrough for Content Management and Platform Reports.
- **Dependencies:** DOCS-002
- **Suggested AI Prompt:**
  ```text
  Create USER_GUIDE.md detailing step-by-step feature walkthroughs for Students and Administrators for academic presentation.
  ```
- **Estimated Complexity:** S (1–3 hours)
- **Estimated Story Points:** 2
- **Testing Requirements:** User guide review.
- **Definition of Done:** USER_GUIDE.md presents end-to-end software demonstration steps.

---

## Story Point & Ticket Summary Matrix

| Epic | Epic Title | Ticket Count | Total Story Points |
|---|---|---|---|
| **Epic 1** | Project Setup & Core Infrastructure | 5 | 15 |
| **Epic 2** | Authentication & Role-Based Authorization | 6 | 22 |
| **Epic 3** | Student Dashboard & Analytics Overview | 4 | 15 |
| **Epic 4** | Student Profile & Personalization | 4 | 13 |
| **Epic 5** | AI Academic Assistant System | 6 | 25 |
| **Epic 6** | Study Resources Management & Drive Links | 5 | 14 |
| **Epic 7** | Google Drive Integration | 3 | 5 |
| **Epic 8** | Video Recommendation Engine | 4 | 16 |
| **Epic 9** | Quiz System & Knowledge Assessment | 6 | 32 |
| **Epic 10** | Digital Document Locker (Firebase Storage) | 5 | 18 |
| **Epic 11** | Skill & Project Tracking | 4 | 14 |
| **Epic 12** | Internship Opportunities Portal | 4 | 13 |
| **Epic 13** | Job Opportunities Portal | 4 | 13 |
| **Epic 14** | Government Competitive Exam Tracker | 4 | 11 |
| **Epic 15** | Academic & Career Notification System | 4 | 12 |
| **Epic 16** | Semester Upgrade & Progression | 3 | 10 |
| **Epic 17** | Administrator Dashboard & Metrics | 4 | 16 |
| **Epic 18** | Admin Content & Master Data | 5 | 26 |
| **Epic 19** | Reports & Export Analytics | 4 | 16 |
| **Epic 20** | System & User Settings | 3 | 8 |
| **Epic 21** | Performance Optimization | 3 | 6 |
| **Epic 22** | Application Security Hardening | 4 | 9 |
| **Epic 23** | Automated & End-to-End Testing | 4 | 19 |
| **Epic 24** | Cloud Deployment & CI/CD | 3 | 11 |
| **Epic 25** | System Documentation | 3 | 7 |
| **TOTAL** | **25 Epics** | **104 Tickets** | **370 Points** |

---
*End of Production Engineering Backlog*
