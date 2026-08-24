# বই লাগবে (Boi Lagbe) — Build Progress Log

## Project: Campus Used-Book Marketplace
## Status: ✅ Phase 1 + Phase 2 COMPLETE
## Last Updated: 2026-08-24
## Stack: Next.js 16 · FastAPI · PostgreSQL (Neon) · Cloudflare R2 · Vercel

---

## 🏗️ Architecture Overview

```
Browser  →  Next.js (Vercel)  →  FastAPI backend (Vercel)  →  Neon PostgreSQL
                                        ↕
                               Cloudflare R2 (images)
```

Images are uploaded **directly from the browser to R2** via presigned URLs — file bytes never pass through Vercel serverless functions.

Chat uses **polling every 4 seconds** instead of WebSockets (Vercel free tier has no persistent connections).

---

## ✅ Phase 1 — Frontend (Completed earlier)

### Core UI & Layout
- [x] Next.js 16 App Router project scaffold
- [x] Tailwind CSS 4 with warm color palette (primary teal, accent coral)
- [x] Mobile-first responsive design
- [x] Bottom navigation bar for mobile
- [x] Navbar with language toggle and auth state
- [x] Footer

### Bilingual System (Bangla + English)
- [x] `LanguageContext` — global language toggle
- [x] Full `en.json` and `bn.json` locale files
- [x] Bangla as default language, 100% pure English mode available
- [x] All UI strings, buttons, labels, error messages translated

### Location System
- [x] `LocationContext` — browser GPS via Geolocation API
- [x] `findNearestDistrict(lat, lng)` — maps GPS to nearest Bangladeshi district
- [x] Manual Division → District fallback dropdown (8 divisions / 64 districts)
- [x] LocationModal for manual selection
- [x] RadarScanner animation while location resolves

### Authentication (now real — see Phase 2)
- [x] Login page with email + password
- [x] Signup page with name, email, phone, institute, password
- [x] Admin panel protected route (`/admin`)

### Listing Flow (4-step wizard)
- [x] Step 1 — Category: Academic Book / General Book / Notes & Suggestions
- [x] Step 2 — Institute & Location (institute type, autosuggest, GPS or manual district)
- [x] Step 3 — Book details (title, author, Bangla description, English description, condition, price, negotiable toggle, images)
- [x] Step 4 — Contact preferences (chat / phone reveal / WhatsApp)
- [x] Multi-select contact preferences
- [x] Image uploader (canvas resize to 1200px, JPEG 75% quality)

### Browse & Search
- [x] Browse page with FilterBar (category, institute type, condition, price range, sort)
- [x] Search bar with query param routing
- [x] Listing card grid (cover photo, title, price, condition badge, distance)
- [x] Listing detail page (image gallery, seller card, price offer feed, report button)

### Chat (now real — see Phase 2)
- [x] Conversation list page
- [x] Chat conversation UI (message bubbles, offer messages highlighted)
- [x] In-chat price offer modal
- [x] "Deal Done" → triggers review modal

### Other Pages
- [x] Wanted board (post + offer flow)
- [x] Favorites page
- [x] User profile page (tabs: active listings / sold / reviews)
- [x] Safety tips page (`/safety`)
- [x] Admin panel (analytics, listing moderation, institute management, user management, reports queue)

---

## ✅ Phase 2 — Real Backend (Completed 2026-08-24)

### FastAPI Backend (`backend/`)

#### Database (Neon PostgreSQL + SQLAlchemy async)
- [x] `models.py` — 12 ORM models: `User`, `Institute`, `Listing`, `ListingImage`, `Conversation`, `Message`, `PriceOffer`, `WantedPost`, `WantedOffer`, `Favorite`, `Review`, `Report`
- [x] `database.py` — async SQLAlchemy engine, `get_db` dependency, `postgresql+asyncpg` URL handling
- [x] `migrate.py` — creates all tables, enables `pg_trgm` + `unaccent` extensions, creates GIN search indexes
- [x] `seed.py` — seeds 20 verified institutes + admin user

#### Search (§8 from build plan — implemented)
- [x] `pg_trgm` GIN index on `listings.title` for typo-tolerant search
- [x] Full-text GIN index on `title + description_bn + description_en`
- [x] Trigram similarity + ILIKE fallback at query time
- [x] Distance sort via Haversine approximation (lat/lng columns)
- [x] Filter by: category, institute_type, institute_id, level_label, condition, price range, division, district, status

#### Auth Router (`/api/auth`)
- [x] `POST /api/auth/signup` — bcrypt password hash, duplicate email/phone check, returns JWT
- [x] `POST /api/auth/login` — credential verify, returns JWT
- [x] `GET /api/auth/me` — returns current user from token
- [x] `PATCH /api/auth/me` — update name, phone, avatar_url, institute_id

#### Listings Router (`/api/listings`)
- [x] `GET /api/listings` — search with all filters + pagination
- [x] `GET /api/listings/:id` — single listing with seller + institute + images eager-loaded, increments view_count
- [x] `POST /api/listings` — create with image_keys (R2 keys from presigned upload)
- [x] `PATCH /api/listings/:id` — update (owner or admin only)
- [x] `DELETE /api/listings/:id` — delete (owner or admin only)
- [x] `GET /api/listings/user/:user_id` — all listings by a seller

#### Upload Router (`/api/upload`)
- [x] `POST /api/upload/presign` — generates a presigned R2 PUT URL valid for 10 minutes
- [x] Browser PUTs image directly to R2 — zero backend bandwidth cost

#### Chat Router (`/api/chat`)
- [x] `GET /api/chat/conversations` — all conversations for current user with unread counts
- [x] `POST /api/chat/conversations?listing_id=` — start or return existing conversation
- [x] `GET /api/chat/conversations/:id/messages` — polling endpoint, supports `?after=` timestamp, marks messages read
- [x] `POST /api/chat/conversations/:id/messages` — send message; if `is_offer=true`, upserts `PriceOffer` (one per buyer per listing per §3.5)
- [x] `GET /api/chat/listings/:id/offers` — public anonymized price offer feed

#### Institutes Router (`/api/institutes`)
- [x] `GET /api/institutes` — list with name search and type filter
- [x] `POST /api/institutes` — create (pending approval, verified=false)
- [x] `POST /api/institutes/:id/approve` — admin only
- [x] `DELETE /api/institutes/:id` — admin only

#### Wanted Router (`/api/wanted`)
- [x] `GET /api/wanted` — active wanted posts
- [x] `POST /api/wanted` — create post
- [x] `POST /api/wanted/:id/fulfill` — mark fulfilled
- [x] `DELETE /api/wanted/:id`
- [x] `GET /api/wanted/:id/offers` — seller offers on a wanted post
- [x] `POST /api/wanted/:id/offers` — submit seller offer

#### Reviews Router (`/api/reviews`)
- [x] `GET /api/reviews/user/:id` — all reviews for a user with reviewer names
- [x] `POST /api/reviews` — create review, recalculates `rating_avg` + `rating_count` on `users` table

#### Reports Router (`/api/reports`)
- [x] `POST /api/reports` — submit report; crowd-sourced auto-sold detection (3 distinct "already_sold" reports → listing.status = 'sold')
- [x] `GET /api/reports` — admin: list open reports
- [x] `PATCH /api/reports/:id` — admin: resolve / dismiss

#### Favorites Router (`/api/favorites`)
- [x] `GET /api/favorites` — current user's favorite listings
- [x] `GET /api/favorites/check/:listing_id`
- [x] `POST /api/favorites/:listing_id` — add
- [x] `DELETE /api/favorites/:listing_id` — remove

#### Admin Router (`/api/admin`)
- [x] `GET /api/admin/stats` — users, listings, open reports, pending institutes
- [x] `GET /api/admin/users` — full user list
- [x] `POST /api/admin/users/:id/block` — toggle block
- [x] `POST /api/admin/users/:id/verify` — toggle verified badge
- [x] `GET /api/admin/institutes/pending`

### Cloudflare R2 (`backend/app/r2.py`)
- [x] boto3 S3-compatible client pointed at R2 endpoint
- [x] `generate_presigned_upload()` — 10-minute PUT URL, auto-generated key under `listings/`
- [x] `build_public_url()` — uses `R2_PUBLIC_URL` env var or falls back to direct storage URL
- [x] `delete_object()` — best-effort cleanup

### Frontend Wiring

#### `src/contexts/AuthContext.tsx` (rewritten)
- [x] Login/signup call real API endpoints
- [x] JWT stored in `localStorage` (key: `boi-lagbe-auth`)
- [x] On mount: rehydrate from storage, background-verify token with `GET /api/auth/me`
- [x] Expired token → auto-logout

#### `src/contexts/DataContext.tsx` (rewritten)
- [x] All mock `localStorage` data removed
- [x] Initial load: fetches listings, institutes, wanted posts from API
- [x] User-specific load: conversations, favorites, admin user list (when logged in)
- [x] All mutations: optimistic local state update + async server sync
- [x] Exposes `refreshListings`, `refreshConversations`, `refreshMessages`, `refreshWanted`, `refreshFavorites`

#### `src/lib/api.ts` (new)
- [x] Typed fetch wrapper for all API endpoints
- [x] `authApi`, `institutesApi`, `listingsApi`, `uploadApi`, `chatApi`, `wantedApi`, `reviewsApi`, `reportsApi`, `favoritesApi`, `adminApi`
- [x] `uploadApi.uploadFile()` — presign + PUT in one call

#### `src/components/listings/ImageUploader.tsx` (updated)
- [x] When token is present: presigns + uploads to R2, stores public URL as preview
- [x] When no token: falls back to canvas data: URL (graceful degradation)
- [x] Passes `File[]` back via `onChange(urls, files)` for listing creation

#### `src/app/(main)/listings/BrowseClient.tsx` (rewritten)
- [x] Real API search with all filters
- [x] Pagination (20 per page, prev/next controls)
- [x] Loading spinner while fetching
- [x] Syncs lat/lng into filters once location resolves

#### `src/app/(main)/listings/[id]/ListingDetailClient.tsx` (updated)
- [x] Reads `seller` and `institute` from API-enriched listing object (no more mockData helpers)
- [x] `imageUrls` normalizes both string URLs and `ListingImageOut` objects
- [x] `contactPrefs` array handles both string and array from API

#### `src/app/(main)/listings/new/CreateListingClient.tsx` (updated)
- [x] `handleSubmit` is now `async` — awaits `createListing()`
- [x] Passes `imageFiles` alongside `images` for R2 upload
- [x] Error toast on submit failure

#### `next.config.ts` (updated)
- [x] `images.remotePatterns` — allows `*.r2.dev` and `*.r2.cloudflarestorage.com`
- [x] `rewrites()` — proxies `/api/*` to `NEXT_PUBLIC_API_URL` (removes need for absolute URLs in dev)

---

## � Final File Structure (key files)

```
Boi-Lagbe/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, router registration
│   │   ├── config.py        # Pydantic Settings (env vars)
│   │   ├── database.py      # Async SQLAlchemy engine + session
│   │   ├── models.py        # 12 ORM models
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   ├── auth.py          # JWT helpers, FastAPI dependencies
│   │   ├── r2.py            # Cloudflare R2 presigned URL helpers
│   │   ├── migrate.py       # One-shot migration script
│   │   ├── seed.py          # Institute + admin user seeder
│   │   └── routers/
│   │       ├── auth.py
│   │       ├── listings.py
│   │       ├── upload.py
│   │       ├── chat.py
│   │       ├── institutes.py
│   │       ├── wanted.py
│   │       ├── reviews.py
│   │       ├── reports.py
│   │       ├── favorites.py
│   │       └── admin.py
│   ├── requirements.txt
│   ├── vercel.json
│   └── .env.example
├── src/
│   ├── app/(main)/
│   │   ├── page.tsx              # Homepage with live listing count
│   │   ├── listings/
│   │   │   ├── BrowseClient.tsx  # Real API search + pagination
│   │   │   ├── [id]/ListingDetailClient.tsx
│   │   │   └── new/CreateListingClient.tsx
│   │   ├── chat/
│   │   │   ├── ChatListClient.tsx
│   │   │   └── [id]/ChatConversationClient.tsx  # 4s polling
│   │   ├── profile/ProfileClient.tsx
│   │   ├── wanted/WantedClient.tsx
│   │   ├── favorites/page.tsx
│   │   └── admin/page.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx    # Real JWT auth
│   │   ├── DataContext.tsx    # Real API data layer
│   │   ├── LanguageContext.tsx
│   │   ├── LocationContext.tsx
│   │   └── ToastContext.tsx
│   ├── lib/
│   │   ├── api.ts             # Typed API client
│   │   ├── utils.ts
│   │   ├── constants.ts
│   │   ├── levels.ts
│   │   ├── mockData.ts        # Still used for institute autosuggest seed
│   │   └── search.ts          # Client-side search (institutes only now)
│   └── components/
│       ├── listings/
│       │   ├── ImageUploader.tsx   # R2 upload wired
│       │   ├── InstituteAutosuggest.tsx
│       │   ├── FilterBar.tsx
│       │   ├── ListingCard.tsx
│       │   ├── ListingGrid.tsx
│       │   ├── PriceOfferFeed.tsx
│       │   ├── ReportModal.tsx
│       │   ├── ReviewModal.tsx
│       │   └── ReviewList.tsx
│       ├── layout/
│       │   ├── Navbar.tsx
│       │   ├── BottomNav.tsx
│       │   ├── Footer.tsx
│       │   └── LanguageToggle.tsx
│       └── ui/  (Button, Input, Modal, Avatar, Badge, etc.)
├── next.config.ts       # R2 image domains + /api/* rewrite
├── vercel.json          # Frontend Vercel config
├── .env.local.example
└── BUILD_PROGRESS.md
```

---

## 🚀 Next Steps (Phase 3 — when ready)

- [ ] SEO institute/district landing pages (`/dhaka/dhaka-polytechnic`)
- [ ] PWA manifest + service worker for push notifications
- [ ] PostGIS extension for accurate geo distance queries
- [ ] Email verification on signup
- [ ] Avatar upload (extend presign endpoint for `avatars/` prefix)
- [ ] Campus ambassador referral system
- [ ] Promoted listings / monetization
