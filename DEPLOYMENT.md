# Production Deployment Guide — Render (Backend) & Vercel (Frontend)

This guide provides step-by-step instructions for deploying **CV Tracker**:
- **Backend API**: Hosted on [Render](https://render.com) (Node.js/Express)
- **Frontend App**: Hosted on [Vercel](https://vercel.com) (Next.js App Router)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free M0 Tier or Dedicated)

---

## Architecture Overview

```
┌──────────────────────────────────────┐        ┌──────────────────────────────────────┐
│          Next.js Frontend            │        │           Express.js Backend         │
│          Hosted on Vercel            │───────▶│            Hosted on Render          │
│   https://your-cv-tracker.vercel.app │  REST  │  https://your-backend.onrender.com   │
└──────────────────────────────────────┘  APIs  └──────────────────┬───────────────────┘
                                                                   │
                                                                   ▼
                                                        ┌───────────────────────┐
                                                        │     MongoDB Atlas     │
                                                        │  Cluster (M0 or higher)│
                                                        └───────────────────────┘
```

---

## Step 1: Setup MongoDB Atlas (Database)

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Click **Create a Deployment** and choose the **M0 (Free)** shared cluster.
3. Choose a cloud provider and region closest to your Render service (e.g., `AWS / us-east-1` or `AWS / us-west-2`).
4. Under **Security Quickstart**:
   - Create a database user with username and strong password (e.g. `cv_tracker_user`).
   - Under **IP Access List**, click **Add IP Address** -> select **Allow Access from Anywhere (`0.0.0.0/0`)** so Render instances can connect dynamically.
5. In your cluster dashboard, click **Connect** -> **Drivers** -> Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/cv_tracker?retryWrites=true&w=majority
   ```
   *(Replace `<username>` and `<password>` with your database user credentials)*.

---

## Step 2: Deploy Backend to Render

### Option A: Using Render Blueprints (`render.yaml`) — Recommended (1-Click)
1. Push your repository to GitHub.
2. Sign in to the [Render Dashboard](https://dashboard.render.com).
3. Click **New** -> **Blueprint**.
4. Connect your GitHub repository. Render will automatically detect [`render.yaml`](./render.yaml).
5. Render will ask for the following two environment variables:
   - `MONGODB_URI`: Paste your MongoDB Atlas connection string from Step 1.
   - `CLIENT_URL`: Enter your Vercel URL (e.g. `https://your-cv-tracker.vercel.app` or temporary `http://localhost:3000` until frontend is deployed).
6. Click **Apply**. Render will generate the secrets, build the project, and provision your backend API!
7. Once deployed, copy your Render Web Service URL (e.g. `https://cv-tracker-backend.onrender.com`).
8. Test the health endpoint: `https://cv-tracker-backend.onrender.com/api/health` — it should return:
   ```json
   { "status": "healthy", ... }
   ```

### Option B: Manual Web Service Setup on Render
1. In Render Dashboard, click **New** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the following fields:
   - **Name**: `cv-tracker-backend`
   - **Region**: Oregon or Ohio (US)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Expand **Advanced** -> **Add Environment Variable**:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `5001` (Render binds to this automatically) |
   | `MONGODB_URI` | `mongodb+srv://...` (from Step 1) |
   | `CLIENT_URL` | `https://your-cv-tracker.vercel.app` |
   | `JWT_ACCESS_SECRET` | *(Random 32+ character string)* |
   | `JWT_REFRESH_SECRET` | *(Random 32+ character string)* |
   | `JWT_ACCESS_EXPIRES_IN` | `15m` |
   | `JWT_REFRESH_EXPIRES_IN` | `7d` |
   | `UPLOAD_DIR` | `uploads` |
5. Click **Create Web Service**.

---

## Step 3: Deploy Frontend to Vercel

### Option A: Via Vercel Dashboard (GitHub Import)
1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. In the **Configure Project** screen:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** and choose `frontend`.
5. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://<your-render-backend>.onrender.com/api` |
6. Click **Deploy**.
7. Vercel will build the Next.js App Router project and assign you a production URL (e.g. `https://cv-tracker-xyz.vercel.app`).

### Option B: Via Vercel CLI
```bash
cd frontend
npm install -g vercel
vercel
# Link project and follow the interactive prompts
vercel --prod
```

---

## Step 4: Link Frontend and Backend (Final Step)

1. Copy your final Vercel URL (e.g. `https://cv-tracker.vercel.app`).
2. Go back to your **Render Dashboard** -> Select `cv-tracker-backend` -> **Environment**.
3. Set or update `CLIENT_URL` to your Vercel URL:
   ```
   CLIENT_URL=https://cv-tracker.vercel.app
   ```
4. Click **Save Changes**. Render will automatically restart with the new CORS configuration.

---

## Step 5: Verification & Production Smoke Test

1. Visit your Vercel production URL: `https://your-cv-tracker.vercel.app`.
2. Click **Get Started** and register a new account.
3. Verify landing on the **Dashboard** with 0 total applications.
4. Click **New Application** and add an application (e.g. Stripe, Staff Software Engineer).
5. Navigate to **Kanban Board** and drag/move the card to "Interview".
6. Navigate to **My Resumes** and upload a test PDF/DOCX resume.
7. Navigate to **Interviews** and schedule an interview round.
8. Check **Settings** and test changing themes (Dark/Light).

---

## 🛠 Production Optimizations & Troubleshooting

### Render Cold Starts (Free Tier)
Render's free tier spins down web services after 15 minutes of inactivity. When a new request arrives, it may take 30–50 seconds for the service to wake up.
> **Tip**: You can use a free uptime monitor like [UptimeRobot](https://uptimerobot.com) to ping `https://your-backend.onrender.com/api/health` every 10 minutes to keep it warm.

### Cross-Origin Cookies & CORS
The backend server is pre-configured with:
- `app.set('trust proxy', 1);` for reverse proxy header forwarding on Render.
- `SameSite: 'none'` and `Secure: true` on production auth cookies for cross-origin authentication between Vercel and Render.
- Fallback refresh token handling in `localStorage` in case 3rd-party cookies are blocked by browser privacy settings.
- Regex CORS allowing any `*.vercel.app` preview deployment.
