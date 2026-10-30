# CV Tracker — Production-Ready Job Application & Resume Management Platform

A modern, responsive, full-stack CV Tracker web application built with **Next.js (App Router)**, **Node.js**, **Express.js**, and **MongoDB**. Designed for software engineers, product managers, and professionals to streamline job applications, maintain tailored resume versions, organize company research, track interview rounds, and visualize hiring conversion metrics.

---

## 🚀 Key Features

### 1. Authentication & Security
- **JWT Authentication**: Short-lived Access Tokens (15m) paired with HTTP-only Refresh Tokens (7d).
- **Password Security**: Strong hashing via `bcryptjs` with 12 salt rounds.
- **Role-based & Scoped Data**: Complete isolation of user records (`userId` derived strictly from verified JWT).
- **Security Middleware**: Express rate limiting on auth endpoints, Helmet security headers, CORS origin whitelisting, and strict MIME validation on file uploads.
- **User Profile Management**: Update headline/role, career bio, and change password securely.

### 2. Executive Analytics Dashboard
- **Real-Time KPI Cards**: Total Applications, Applied, Under Review, Interview Scheduled, Offers Received, and Rejected.
- **Calculated Conversion Metrics**:
  - **Interview Conversion Rate**: Percentage of applications that advance to technical/HR rounds.
  - **Offer Success Rate**: Overall ratio of job offers received to submitted applications.
- **Interactive Visualizations (Recharts)**:
  - 6-month monthly trends area chart (Applications vs. Interviews vs. Offers).
  - Pipeline status distribution donut chart.
- **Actionable Panels**:
  - Upcoming interview schedule with direct meeting join links.
  - Recent activity feed showing status changes and notes.

### 3. CV / Resume Management
- **File Uploads**: Supports PDF and DOCX formats (up to 10MB) powered by Multer.
- **Versioning**: Automatic version indexing (`v1`, `v2`, `v3`...) with customizable resume titles.
- **Application Association**: Track which resume version was submitted to which job application.
- **Default Resume**: One-click toggling of default resume used for auto-selection in new applications.
- **Direct Download & Deletion**: Stream resumes back to disk with original filename and clean file cleanup on deletion.
- **AI-Ready Schema**: Pre-configured with `skills` arrays and `parsedSummary` fields for future AI analysis (ATS scoring, keyword matching).

### 4. Job Application Tracker
- **Complete CRUD Operations**: Company name, Job title, Location, Workplace type (`Remote`, `Hybrid`, `On-site`), Employment type (`Full-time`, `Contract`, `Internship`, `Part-time`), Priority (`Low`, `Medium`, `High`), Salary range (`min`, `max`, `currency`, `period`), Job URL, Application date, Deadline, Notes, and Recruiter contact details.
- **Multi-Filter & Search**: Instant full-text search across company, job title, and location, with status filtering and pagination.

### 5. Interactive Kanban Pipeline
- **Visual Hiring Columns**:
  1. `Wishlist`
  2. `Applied`
  3. `Under Review`
  4. `Assessment`
  5. `Interview`
  6. `Offer`
  7. `Rejected`
- **Drag & Drop**: Native HTML5 drag-and-drop between columns with optimistic UI updates.
- **Quick Status Move**: Quick dropdown on every card for one-click stage progression.
- **Direct Card Actions**: Quick edit modal, deletion, and timeline notes directly from the board.

### 6. Interview Management
- **Round Categorization**: Screening, Technical, System Design, Behavioral, Managerial, HR, Final.
- **Meeting Links**: Zoom, Google Meet, Microsoft Teams one-click join buttons.
- **Preparation & Feedback**: Rich text notes for technical topics, interview questions asked, and outcome tracking (`Pending`, `Passed`, `Failed`, `Rescheduled`).

### 7. Company Directory
- **Centralized Company Profiles**: Website, Location, Industry, Rating (1–5 stars), and Description.
- **Recruiter Directory**: Associate recruiter names, emails, roles, and LinkedIn URLs per company.
- **Linked Job Count**: Real-time aggregation of how many applications are open at each company.

### 8. Activity Timeline & Notes
- Every job application maintains a chronological activity trail:
  - Application created
  - Status transitions
  - Interview scheduled & updated
  - Custom user notes & comments

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Dark/Light Theme System
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms & Validation**: React Hook Form + Zod
- **Networking**: Axios with request/response token interceptors

### Backend
- **Runtime**: Node.js v22+
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Zero-Friction Dev DB**: Built-in automatic fallback to `mongodb-memory-server` if local MongoDB is not running
- **Authentication**: JWT (`jsonwebtoken`) + `bcryptjs` + `cookie-parser`
- **File Storage**: `multer`
- **Security**: `helmet`, `cors`, `express-rate-limit`

---

## 📁 Repository Structure

```
cv-tracker/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection & memory fallback
│   │   ├── controllers/     # Auth, Application, Resume, Company, Interview, Analytics, Activity
│   │   ├── middleware/      # Auth JWT, Multer upload, Rate limiting
│   │   ├── models/          # Mongoose Schemas (User, Application, Resume, Company, Interview, Activity)
│   │   ├── routes/          # Express route definitions
│   │   ├── utils/           # JWT helper, Param sanitization
│   │   ├── validators/      # Zod validation schemas
│   │   └── server.ts        # Express entry point
│   ├── uploads/             # Resume storage directory
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── (auth)/          # /login, /register
│   │   ├── (dashboard)/     # /dashboard, /applications, /kanban, /resumes, /interviews, /companies, /analytics, /settings
│   │   ├── globals.css      # Design tokens, dark mode, glassmorphism
│   │   ├── layout.tsx       # Root layout with Theme, Auth, and Toast providers
│   │   └── page.tsx         # SaaS landing page
│   ├── components/
│   │   ├── applications/    # ApplicationModal, ApplicationTimelineModal
│   │   ├── companies/       # CompanyModal
│   │   ├── dashboard/       # StatCard, TrendsChart, StatusPieChart, UpcomingInterviewsList, RecentActivityFeed
│   │   ├── interviews/      # InterviewModal
│   │   ├── kanban/          # KanbanBoard, columns, cards
│   │   ├── layout/          # Sidebar, TopNav, DashboardShell
│   │   ├── resumes/         # ResumeUploadModal
│   │   └── ui/              # Button, Input, Select, Modal, Badge, Card, Toast
│   ├── context/             # AuthContext, ThemeContext
│   ├── lib/                 # Axios client (api.ts), utils (cn, formatters)
│   ├── types/               # TypeScript interfaces
│   ├── .env.example
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .gitignore
├── package.json
└── README.md
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)
- npm (v9+)

> **Zero-Friction Database**: If you do not have MongoDB running locally, the backend **automatically starts an embedded in-memory MongoDB instance** so you can develop immediately without configuring an external database.

### 1. Clone & Setup Backend
```bash
cd backend
cp .env.example .env
npm install
npm run build
```

To run the backend development server:
```bash
npm run dev
# Running on http://localhost:5001
```

### 2. Setup Frontend
In another terminal:
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
# Running on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Cloud Deployment (Vercel + Render)

The project is fully configured and ready for production deployment:
- **Frontend on Vercel**: Configured with Next.js App Router, `@/*` aliases, and [`vercel.json`](./vercel.json).
- **Backend on Render**: Configured with [`render.yaml`](./render.yaml) Blueprint, reverse proxy trust (`trust proxy`), and cross-domain authentication (`SameSite=None`, `Secure`).

👉 **Read the complete step-by-step guide in [DEPLOYMENT.md](./DEPLOYMENT.md)**.

### Quick Deploy Checklist
1. **Database**: Create a free MongoDB Atlas cluster and copy the connection string.
2. **Backend (Render)**: Deploy `backend/` using [`render.yaml`](./render.yaml) or Manual Web Service with `npm install && npm run build` and start command `npm start`. Set `MONGODB_URI` and `CLIENT_URL`.
3. **Frontend (Vercel)**: Import repo, set Root Directory to `frontend`, and configure `NEXT_PUBLIC_API_URL=https://<your-render-backend>.onrender.com/api`.
4. **Link**: Set Render `CLIENT_URL` to your Vercel URL.

---

## 🐳 Docker Deployment

To spin up the entire production system (MongoDB + Express Backend + Next.js Frontend) using Docker Compose:

```bash
docker-compose up --build -d
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5001/api/health](http://localhost:5001/api/health)
- **MongoDB**: `localhost:27017`

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` — Create a new user account
- `POST /api/auth/login` — Sign in and receive access token + refresh cookie
- `POST /api/auth/refresh` — Renew access token via refresh token cookie
- `POST /api/auth/logout` — Clear refresh token cookie
- `GET  /api/auth/me` — Retrieve current user session profile
- `PUT  /api/auth/profile` — Update name, headline, bio, or change password

### Applications
- `GET    /api/applications` — Query applications (supports `search`, `status`, `jobType`, `priority`, `page`, `limit`)
- `POST   /api/applications` — Create a new application (automatically links company and creates activity log)
- `GET    /api/applications/:id` — Get application with company, resume, and interview history
- `PUT    /api/applications/:id` — Update application fields
- `PATCH  /api/applications/:id/status` — Quick status & Kanban column update
- `DELETE /api/applications/:id` — Delete application and clean up linked events

### Resumes
- `GET    /api/resumes` — List user resumes with application count
- `POST   /api/resumes/upload` — Upload PDF/DOCX file with title and versioning
- `GET    /api/resumes/:id` — Get resume metadata and linked applications
- `GET    /api/resumes/:id/download` — Download resume file
- `PATCH  /api/resumes/:id/default` — Mark resume as default
- `DELETE /api/resumes/:id` — Delete resume file and database record

### Companies
- `GET    /api/companies` — List companies with application counts
- `POST   /api/companies` — Add company and recruiter contacts
- `GET    /api/companies/:id` — Get company profile with linked applications
- `PUT    /api/companies/:id` — Update company details
- `DELETE /api/companies/:id` — Remove company

### Interviews
- `GET    /api/interviews` — List interviews (filter by `timeframe=upcoming|past|all`)
- `POST   /api/interviews` — Schedule interview (automatically advances application status)
- `PUT    /api/interviews/:id` — Update interview round, notes, or outcome
- `DELETE /api/interviews/:id` — Delete interview record

### Analytics
- `GET /api/analytics/dashboard` — KPI stats cards, conversion rates, upcoming interviews, and recent activities
- `GET /api/analytics/applications` — 6-month application and interview trends
- `GET /api/analytics/status-distribution` — Status counts and chart color mapping

### Activities
- `GET  /api/activities` — Timeline events (supports `applicationId` filter)
- `POST /api/activities` — Add custom note or timeline event

---

## 🤖 Future AI Integration Architecture

The codebase is architecturally prepared for AI features:
1. **Resume Schema**: Contains `skills: string[]` and `parsedSummary: string` ready for LLM-based parsing and skill extraction.
2. **Service Layer Isolation**: The backend is organized to accommodate an `aiService.ts` layer without refactoring controllers or database schemas:
   - ATS Resume Scoring against specific `jobDescription`
   - Keyword Match Percentage & Missing Skill Suggestions
   - AI Cover Letter Generator based on linked resume and job posting
   - AI Interview Question Generator tailored to company and role

---

## 🔒 Security Best Practices Implemented

- Passwords hashed with **bcrypt** (12 rounds).
- Token authentication using **Bearer JWTs** and **HTTP-only secure cookies**.
- All data queries scoped strictly by verified `req.user.userId`.
- Request body sanitization and strict validation via **Zod**.
- Multer file upload whitelist: only `application/pdf`, `.docx`, `.doc` allowed up to 10MB.
- Centralized error handling preventing stack leak in production.
- Rate limiting on authentication routes to mitigate brute force attacks.
- Strict CORS configuration.
