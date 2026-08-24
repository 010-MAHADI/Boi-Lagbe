# Deployment Guide for **Boi Lagbe** (বই লাগবে)

> This guide walks you through deploying the Next.js application to **Vercel** (frontend) and storing static assets (e.g., book‑cover placeholders, user avatars) on **Cloudflare R2**.  It assumes you already have a free Vercel account and a Cloudflare R2 bucket.

---

## 📦 Prerequisites

- **Node.js** (v20 or later) installed locally.
- **Git** repository for the project (the folder `Boi‑Lagbe` should be committed).
- A **Vercel** account (free tier is enough for the MVP).
- A **Cloudflare** account with **R2** enabled and a bucket created (e.g., `boi-lagbe-assets`).
- **`vercel` CLI** installed globally:
  ```bash
  npm i -g vercel
  ```

---

## ☁️ Cloudflare R2 Setup

1. **Create a Bucket**
   - Log in to the Cloudflare dashboard → **R2** → **Create bucket**.
   - Choose a name (e.g., `boi-lagbe-assets`). Remember the bucket name – you’ll need it as an env var.

2. **Generate Access Keys**
   - In the **R2** section click **Create Access Keys**.
   - You’ll receive an **Access Key ID** and **Secret Access Key**. Store them securely; they are used as environment variables in Vercel.

3. **Configure CORS (optional but recommended)**
   - Still in the R2 dashboard → **Settings** → **CORS**.
   - Add your Vercel domain (e.g., `https://boi‑lagbe.vercel.app`) to `Allowed Origins`.
   - Allow methods: `GET, HEAD, OPTIONS`.
   - Allow headers: `*` (or at least `Content-Type`).

4. **Upload the placeholder assets** (if you want them in R2 instead of `public/`):
   ```bash
   # Install the Cloudflare R2 CLI tool (wrangler)
   npm i -g wrangler
   wrangler r2 cp ./public/images/book-placeholder.svg r2://boi-lagbe-assets/book-placeholder.svg
   wrangler r2 cp ./public/images/avatar-placeholder.svg r2://boi-lagbe-assets/avatar-placeholder.svg
   ```
   > The app currently loads assets from `public/`.  If you decide to serve them from R2, replace the URLs with:
   ```ts
   const BOOK_PLACEHOLDER = `https://<ACCOUNT_ID>.r2.cloudflarestorage.com/boi-lagbe-assets/book-placeholder.svg`;
   ```

---

## 🚀 Vercel Deployment (Frontend)

### 1️⃣ Connect the Repository
1. Go to **vercel.com/dashboard** → **New Project**.
2. Import the Git repository (GitHub, GitLab, or Bitbucket) that contains `Boi‑Lagbe`.
3. Vercel automatically detects a **Next.js** app. Keep the default settings:
   - **Framework preset**: `Next.js`
   - **Build command**: `npm run build`
   - **Output directory**: `.next`
   - **Install command**: `npm ci`

### 2️⃣ Add Environment Variables
| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_R2_BUCKET` | `boi-lagbe-assets` | Bucket name (used by the client to build URLs). |
| `R2_ACCESS_KEY_ID` | *your Access Key ID* | Secret key for server‑side API routes (if you ever need to upload directly). |
| `R2_SECRET_ACCESS_KEY` | *your Secret Access Key* | Same as above. |
| `NEXT_PUBLIC_BASE_URL` | `https://boi‑lagbe.vercel.app` | Used by the mock API layer for absolute URLs (optional). |

1. In the Vercel dashboard → **Project Settings → Environment Variables**.
2. Click **Add** for each variable, set the **Target** to **All (Preview & Production)**, and paste the values.

### 3️⃣ Deploy
- **Automatic Deploy**: Every push to the main branch triggers a preview deployment.
- **Manual Deploy** (optional):
  ```bash
  vercel --prod   # from the project root
  ```
  This forces a production build.

### 4️⃣ Verify
1. Open the generated URL, e.g., `https://boi‑lagbe.vercel.app`.
2. Check that:
   - The homepage loads with the warm color palette.
   - Listings appear (mock data).
   - Images (book/avatar placeholders) show correctly.
   - Language toggle switches between Bangla and English.

---

## 🌐 Optional: Custom Domain
1. In Vercel → **Domain** → **Add**.
2. Enter your domain (e.g., `boilagbe.com`).
3. Follow the DNS instructions (add an **A** record pointing to Vercel’s IP or use a **CNAME** to `cname.vercel-dns.com`).
4. Once the DNS propagates, Vercel will automatically provision an SSL certificate.

---

## 📦 What Happens Under the Hood?
- **Vercel** builds the Next.js project, bundles the Tailwind CSS, and serves the static files from a global edge network.
- **R2** acts as an object store for any large assets (images, PDFs).  The frontend fetches them via a public URL (`https://<ACCOUNT_ID>.r2.cloudflarestorage.com/<bucket>/<object>`).
- Because the app is *mock‑API* only, there is no backend server to run.  In a future phase you could replace the `/api/*` routes with a FastAPI service (hosted on Railway, Render, or Cloudflare Workers) and point the Vercel app to that endpoint via an env var.

---

## 🛠️ Updating After a Change
1. Commit your changes locally:
   ```bash
   git add .
   git commit -m "Update UI / fix bugs"
   git push origin main
   ```
2. Vercel will automatically run a new build and publish a preview.  When you are happy, click **Promote to Production** (or use `vercel --prod`).

---

## 📚 TL;DR – One‑Liner Deploy
```bash
# 1️⃣ Create .env.local (optional for local dev)
cat <<EOF > .env.local
NEXT_PUBLIC_R2_BUCKET=boi-lagbe-assets
R2_ACCESS_KEY_ID=YOUR_ID
R2_SECRET_ACCESS_KEY=YOUR_SECRET
EOF

# 2️⃣ Push to Git & let Vercel do its magic
git add . && git commit -m "Deploy" && git push

# OR manual prod deploy
vercel --prod
```

---

### 🎉 Done!
Your **Boi Lagbe** marketplace is now live on Vercel and ready to serve assets from Cloudflare R2. 🎓

---

*If you ever need to switch to a real backend, replace the `src/app/api/*` mock routes with a FastAPI service and update the environment variable `NEXT_PUBLIC_API_URL` accordingly.*
