# Deployment Guide — বই লাগবে (Boi Lagbe)

> **Current architecture:** Next.js frontend + FastAPI backend, both deployed to Vercel. Neon serverless PostgreSQL as the database. Cloudflare R2 for image storage.

---

## 📦 Prerequisites

| Tool | Purpose | Install |
|------|---------|---------|
| Node.js v20+ | Build the Next.js frontend | [nodejs.org](https://nodejs.org) |
| Python 3.11+ | Run the FastAPI backend | [python.org](https://www.python.org) |
| Git | Version control | [git-scm.com](https://git-scm.com) |
| Vercel account | Host both frontend + backend | [vercel.com](https://vercel.com) (free) |
| Neon account | Serverless PostgreSQL | [neon.tech](https://neon.tech) (free) |
| Cloudflare account | R2 image storage | [cloudflare.com](https://cloudflare.com) (free) |

---

## 1️⃣ Neon PostgreSQL Setup

1. Go to [console.neon.tech](https://console.neon.tech) → **New Project**
2. Choose a region close to your users (e.g. `ap-southeast-1` for Bangladesh)
3. Copy the **Connection string** — it looks like:
   ```
   postgresql://user:password@ep-xxx-yyy.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Keep this — it goes into `DATABASE_URL`

---

## 2️⃣ Cloudflare R2 Setup

### Create a Bucket
1. Cloudflare dashboard → **R2 Object Storage** → **Create bucket**
2. Name it `boi-lagbe-assets`
3. Leave all other settings as default

### Get Your Account ID
In the R2 overview page, copy the **Account ID** from the right sidebar (or from the S3 API URL shown in bucket settings).

### Generate API Keys
1. R2 overview page → **Manage R2 API tokens** (top-right link)
2. **Create API token** → name it `boi-lagbe-token`
3. Permissions: **Object Read & Write**, Bucket: `boi-lagbe-assets`
4. Copy the **Access Key ID** and **Secret Access Key** — the secret is only shown once

### Enable Public Development URL
1. Go into the `boi-lagbe-assets` bucket → **Settings** → **Public Development URL**
2. Click **Enable** — you'll get a URL like `https://pub-xxxxxxxxxxxxxxxx.r2.dev`
3. This becomes `R2_PUBLIC_URL` and `NEXT_PUBLIC_R2_PUBLIC_URL`

### Configure CORS
1. Bucket settings → **CORS Policy** → add this JSON:
   ```json
   [
     {
       "AllowedOrigins": ["https://your-frontend.vercel.app", "http://localhost:3000"],
       "AllowedMethods": ["GET", "HEAD", "PUT"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

---

## 3️⃣ Run the Database Migration in local

Once you have your Neon connection string, run the migration script once to create all tables and search indexes.

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Copy the env template and fill in your values
copy .env.example .env
# (edit .env — at minimum set DATABASE_URL, SECRET_KEY, R2_* vars)

# Create tables + enable pg_trgm extension + create GIN search indexes
python -m app.migrate

# Seed 20 institutes + admin user (mahadi379377@gmail.com / idahamsm@)
python -m app.seed
```

If the `pg_trgm` extension step fails with a permissions error, run this manually in the Neon SQL editor:
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
```

---

## 4️⃣ Deploy the FastAPI Backend to Vercel

The backend lives in the `backend/` folder and has its own `vercel.json`.

### Option A — Vercel Dashboard (recommended)
1. Vercel dashboard → **New Project** → Import the same GitHub repo
2. Set **Root Directory** to `backend`
3. Framework preset: **Other**
4. Add the following **Environment Variables**:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `SECRET_KEY` | A random 64-char string (see below) |
| `R2_ACCESS_KEY_ID` | From Cloudflare R2 API token |
| `R2_SECRET_ACCESS_KEY` | From Cloudflare R2 API token |
| `R2_BUCKET_NAME` | `boi-lagbe-assets` |
| `R2_ACCOUNT_ID` | Your Cloudflare Account ID |
| `R2_PUBLIC_URL` | `https://pub-xxxxxxxxxxxxxxxx.r2.dev` |
| `FRONTEND_URL` | Your frontend Vercel URL (set after frontend is deployed) |
| `ENVIRONMENT` | `production` |

Generate a secure `SECRET_KEY`:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

5. Deploy → note the backend URL (e.g. `https://boi-lagbe-api.vercel.app`)

### Option B — Vercel CLI
```bash
cd backend
vercel --prod
# Follow the prompts, then set env vars in the Vercel dashboard
```

---

## 5️⃣ Deploy the Next.js Frontend to Vercel

### Option A — Vercel Dashboard
1. Vercel dashboard → **New Project** → Import the same GitHub repo
2. **Root Directory**: leave as `/` (the repo root)
3. Framework preset: **Next.js** (auto-detected)
4. Add **Environment Variables**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | Your backend Vercel URL (e.g. `https://boi-lagbe-api.vercel.app`) |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | `https://pub-xxxxxxxxxxxxxxxx.r2.dev` |

5. Deploy

### Option B — Vercel CLI
```bash
# From the repo root
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_API_URL and NEXT_PUBLIC_R2_PUBLIC_URL

vercel --prod
```

---

## 6️⃣ Wire Frontend ↔ Backend

After both are deployed:

1. In the **backend** Vercel project → Settings → Environment Variables
   - Update `FRONTEND_URL` to your actual frontend URL (e.g. `https://boi-lagbe.vercel.app`)
   - Click **Redeploy** (no code change needed, just a redeploy to pick up the new env var)

2. Verify the CORS is working by opening your frontend URL and checking that the API calls succeed in the browser Network tab.

---

## 7️⃣ Verify Everything Works

Open the frontend URL and run through this checklist:

- [ ] Homepage loads with listings from the database (not mock data)
- [ ] Signup creates a real account (check Neon dashboard → users table)
- [ ] Login returns a JWT and persists across page refresh
- [ ] Posting a new listing uploads images to R2 (check R2 bucket → Objects tab)
- [ ] The listing is visible from a different browser / device
- [ ] Chat messages persist across page reload
- [ ] Language toggle switches between Bangla and English
- [ ] Admin panel accessible at `/admin` with `mahadi379377@gmail.com` / `idahamsm@`

---

## 🌐 Custom Domain (optional)

1. Vercel → your frontend project → **Domains** → **Add**
2. Enter `boilagbe.com` (or your domain)
3. Add a **CNAME** record pointing to `cname.vercel-dns.com` in your DNS provider
4. Vercel provisions SSL automatically once DNS propagates (~5 min to 48h)
5. Also update `FRONTEND_URL` in the backend env vars to the custom domain

---

## � Updating After a Code Change

```bash
git add .
git commit -m "your change description"
git push origin main
```

Vercel automatically triggers a new build and deployment for both the frontend and backend projects when you push to `main`.

To force a production deploy without a code change (e.g. after updating env vars):
```bash
vercel --prod          # from repo root (frontend)
cd backend && vercel --prod   # backend
```

---

## 📐 Environment Variables Reference

### Frontend (`.env.local` / Vercel frontend project)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ Yes | FastAPI backend base URL. In dev: `http://localhost:8000`. In prod: your backend Vercel URL. |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | ✅ Yes | R2 public development URL for displaying uploaded images. |

### Backend (`backend/.env` / Vercel backend project)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Yes | Neon PostgreSQL connection string (`postgresql://...?sslmode=require`) |
| `SECRET_KEY` | ✅ Yes | JWT signing secret — 64 random hex chars |
| `R2_ACCESS_KEY_ID` | ✅ Yes | Cloudflare R2 API token Access Key ID |
| `R2_SECRET_ACCESS_KEY` | ✅ Yes | Cloudflare R2 API token Secret |
| `R2_BUCKET_NAME` | ✅ Yes | R2 bucket name (default: `boi-lagbe-assets`) |
| `R2_ACCOUNT_ID` | ✅ Yes | Cloudflare Account ID |
| `R2_PUBLIC_URL` | ✅ Yes | Public R2 URL (e.g. `https://pub-xxx.r2.dev`) |
| `FRONTEND_URL` | ✅ Yes | Frontend URL for CORS (e.g. `https://boi-lagbe.vercel.app`) |
| `ENVIRONMENT` | ✅ Yes | `development` or `production` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ❌ Optional | JWT lifetime in minutes (default: 10080 = 7 days) |

---

## 🏠 Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
copy .env.example .env
# Fill in DATABASE_URL (use Neon dev branch), SECRET_KEY, R2 vars

# Run database migration once
python -m app.migrate
python -m app.seed

# Start the dev server
uvicorn app.main:app --reload --port 8000
# API docs available at http://localhost:8000/api/docs
```

### Frontend
```bash
# From repo root
copy .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000

npm install
npm run dev
# App available at http://localhost:3000
```

---

## 🆓 Free Tier Limits (August 2026)

| Service | Free Tier | Limit to watch |
|---------|-----------|----------------|
| Vercel Hobby | 100 GB bandwidth/month, ~1M function invocations | 10s function timeout on free tier |
| Neon Free | 0.5 GB storage, 100 compute-hours/month | Cold start ~300ms after 5min idle |
| Cloudflare R2 | 10 GB storage, 1M writes/month, 10M reads/month | **Zero egress fees** — no surprise bills |

---

## 🛠️ Troubleshooting

**"বিজ্ঞাপন প্রকাশে ত্রুটি হয়েছে" when creating a listing**
→ Check that `NEXT_PUBLIC_API_URL` points to the correct backend URL and the backend is deployed.

**Images not showing after upload**
→ Verify `R2_PUBLIC_URL` (backend) and `NEXT_PUBLIC_R2_PUBLIC_URL` (frontend) both point to the same R2 public URL. Check CORS is configured on the R2 bucket.

**Login always fails**
→ Confirm `DATABASE_URL` is correct and `python -m app.migrate` + `python -m app.seed` have been run.

**CORS error in browser console**
→ Update `FRONTEND_URL` in the backend env vars to match your exact frontend URL (no trailing slash).

**Neon connection timeout on first request**
→ Expected — Neon's free tier scales to zero after 5 minutes idle. The first query after inactivity takes ~300ms to wake up.
