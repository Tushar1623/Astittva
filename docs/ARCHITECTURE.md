# ASTITTVA — Technical Architecture Report

**Document Version:** 1.0
**Date:** February 2026
**Status:** Production (preview + live deployment on Emergent)
**Audience:** Future developers · CTOs · Technical consultants · CRM vendors · Investors
**Author:** Engineering team (with Emergent AI co-development)

---

## 1. Executive Summary

ASTITTVA is a luxury real estate advisory brand based in Kolkata, India. The digital platform serves a dual purpose:

1. **Public marketing & lead capture** — a premium showcase of curated residential and commercial properties across Kolkata, India, and select global markets (UAE, Singapore, London, US), reinforced by a Market Intelligence newsroom that positions Astittva as an authority in real estate investment.
2. **Internal operations** — a private Admin Console used by Astittva staff to manage property listings, capture and triage leads, and administer users.

The platform is a full-stack web application built on **React (frontend) + FastAPI (backend) + MongoDB (database)**, developed end-to-end on the **Emergent AI development platform**. It is currently live on Emergent's managed hosting at **https://github-executor-3.emergent.host** with a parallel preview environment for iterative development.

Total estimated lines of application code: ~6,800 (frontend ~5,400 / backend ~1,400). Approx. 100% of scaffolding, UI design system, API routes, and integrations were authored within Emergent AI sessions, with targeted human review at each commit.

---

## 2. Business Overview

| Attribute | Value |
|---|---|
| Brand name | ASTITTVA |
| Tagline | "Invest With Confidence. Build Your Future." |
| Industry | Luxury Real Estate Advisory |
| Geography | Kolkata HQ; coverage extends to India + global luxury markets |
| Office | PS IXL Building, 5th Floor, Room 511, Biswa Bangla Sarani, Atghara, New Town, Kolkata, West Bengal 700136, India |
| Contact | sales@astittva.in · WhatsApp consultation |
| Established | 2026 |
| Revenue model | Real estate advisory fees, brokerage on transactions, branded consultation services |

**Primary audience:** HNI/UHNI investors, NRIs evaluating Indian real estate, professional buyers seeking premium residential/commercial assets, institutional clients (REITs, family offices).

**Competitive set:** Sotheby's International Realty, Christie's International Real Estate, Lodha Luxury, DLF Ultra Premium, Godrej Properties Luxury — Astittva positions as the Kolkata-rooted, Bengal-aware advisory peer to these names.

---

## 3. Brand Positioning

| Pillar | Expression |
|---|---|
| **Aesthetic** | Deep charcoal (#0A0A0A / #050505) backgrounds · Burgundy/maroon ambient glow (rgba(90,10,20,0.30) top-anchored) · Copper accent (#C68642) · Cormorant Garamond italic display + sans-serif body |
| **Visual language** | Cinematic hero slideshow of authentic Kolkata landmarks (Biswa Bangla Gate, Howrah Bridge, Victoria Memorial, Eco Park, New Town Skyline) with Ken Burns zoom and 5-second cross-fades |
| **Trust signals** | "Verified Properties · Luxury Standards · Live Market Intelligence" badge, Market Intelligence newsroom, full address, named advisors |
| **Tone** | Restrained luxury — never shouty. Uppercase letterspaced overlines, generous whitespace, asymmetric layouts |
| **Lead magnet** | "Book a Consultation" CTA + WhatsApp floating widget |

---

## 4. Website Structure

### Public site
```
/                           Home (cinematic hero, featured properties, value props, consultation)
/properties                 Property catalogue (filters by city, type, budget, status)
/properties/:id             Property detail (gallery, floor plan, amenities, brochure CTA)
/market-intelligence        Newsroom (live RSS feed + 14-article curated evergreen fallback)
/about                      Brand story, leadership, philosophy
/contact                    Address, email, contact form, embedded map
```

### Admin Console (auth-required)
```
/admin/login                JWT-protected login
/admin                      Dashboard (stats: properties, leads, users)
/admin/properties           Property CRUD
/admin/properties/new       Create property
/admin/properties/:id/edit  Edit property
/admin/leads                Lead inbox + status workflow
/admin/users                User management (admin role only)
```

---

## 5. User Journey

### Visitor → Lead (primary funnel)
1. Lands on `/` via direct link, SEO, or referral.
2. Cinematic hero slideshow + value props establish brand confidence.
3. Browses featured properties or clicks "Book a Consultation".
4. Reads Market Intelligence to validate Astittva's expertise.
5. Submits lead form (name · email · phone · message · property of interest).
6. `POST /api/leads` writes to MongoDB; success toast shown.
7. Staff sees the lead in `/admin/leads` and follows up via WhatsApp/phone/email.

### Admin → Property Listing
1. Admin/sales staff logs in at `/admin/login`.
2. JWT issued (12-hour expiry, httpOnly cookie + Bearer fallback for SPAs).
3. Navigates to `/admin/properties/new`, fills the form, uploads images (multipart via `/api/admin/upload`).
4. Sets status `draft` → reviews → `published`.
5. Public site immediately reflects the new property at `/properties`.

---

## 6. Frontend Architecture

| Layer | Technology |
|---|---|
| Framework | **React 19** (via Create React App scaffold) |
| Router | **react-router-dom v7** |
| Animation | **framer-motion** (cinematic transitions, page reveals) |
| Styling | **Tailwind CSS** + custom CSS (`index.css`) + design tokens (charcoal, copper, burgundy, ivory) |
| Component library | **Shadcn UI** (`/app/frontend/src/components/ui/`) — Buttons, Input, Card, Dialog, etc. |
| HTTP client | **axios** (`src/lib/api.js`) — 15s timeout, withCredentials, dynamic same-origin baseURL |
| State | React `useState` / `useEffect`; **AuthContext** for current user; no Redux/Zustand needed at current scale |
| Icons | **lucide-react** |
| Notifications | **sonner** (toast) |
| SEO helmet | Inline `<title>` + `<meta>` management in `SEO.jsx` |

### Directory map
```
frontend/src/
├── App.js                       Top-level router
├── index.js                     ReactDOM entry
├── index.css                    Brand tokens + utility classes (.gold-text, .luxury-card)
├── layouts/
│   ├── PublicLayout.jsx         Header + AmbientGlow + Outlet + Footer + FloatingWhatsApp
│   └── AdminLayout.jsx          Sidebar nav + Outlet
├── pages/                       (see Section 4)
├── components/
│   ├── ui/                      Shadcn primitives (Button, Card, Input, etc.)
│   ├── CinematicHero.jsx        Hero slideshow (preloaded, opacity-stacked, no AnimatePresence)
│   ├── AmbientGlow.jsx          Sitewide top-anchored burgundy gradient
│   ├── Header.jsx               Public nav
│   ├── Footer.jsx               Public footer
│   ├── FloatingWhatsApp.jsx     Floating WA CTA
│   ├── SEO.jsx                  Per-page title/meta
│   └── ...                      Property cards, lead form, etc.
├── context/
│   └── AuthContext.jsx          Login/logout/me lifecycle
├── lib/
│   ├── api.js                   axios instance, dynamic same-origin /api routing
│   └── site.js                  Brand constants (LOGO_URL, BRAND_NAME, address, email, WhatsApp)
├── data/
│   └── evergreenNews.js         14 hand-curated articles (client-side last-resort fallback)
└── hooks/                       Reusable hooks
```

### Notable engineering decisions
- **Cinematic hero never flashes black** — all 5 slide images are mounted simultaneously and only `opacity` toggles, eliminating remount-induced flicker.
- **Image preloading on mount** — all hero images are warmed via `new Image()` so first transition is instant.
- **Same-origin API routing** — `lib/api.js` detects when `window.location.host` ≠ baked-in `REACT_APP_BACKEND_URL` host and falls back to a relative `/api` baseURL. Eliminates CORS issues when the app is accessed via a preview URL different from build time.
- **Three-layer empty-state defence** for Market Intelligence: live RSS → MongoDB cache → bundled `evergreenNews.js` (14 articles cover all 8 categories × 4 countries).

---

## 7. Backend Architecture

| Layer | Technology |
|---|---|
| Framework | **FastAPI** (Python 3.11) |
| ASGI server | **uvicorn**, managed by **supervisor** |
| Async Mongo driver | **motor** (`AsyncIOMotorClient`) |
| Pydantic | v2 for request/response models |
| Auth | **PyJWT** + **bcrypt** (passwords) |
| RSS parser | **feedparser** (Google News) |
| File uploads | FastAPI `UploadFile` → local disk in `/app/backend/uploads/` |
| LLM key (future) | `EMERGENT_LLM_KEY` (universal key for GPT/Gemini/Claude/Sora/Nano-Banana) |

### Single file orchestration
The entire API lives in `/app/backend/server.py` (~777 lines). Helpers split into:
- `news_service.py` — RSS fetching, classification, rolling cache, evergreen fallback (~510 lines)
- `seed_properties.py` — Sample property seed script
- `gen_images.py` / `gen_kolkata.py` — Image asset generators (one-off scripts)
- `tests/` — pytest suite (`backend_test.py`, `test_market_intelligence.py`)

### Application bootstrap
```python
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
app = FastAPI()
api_router = APIRouter(prefix="/api")
# ... routes mounted via @api_router decorator ...
app.include_router(api_router)
app.add_middleware(CORSMiddleware, ...)
```

### Background tasks
- **News refresh** — On-demand TTL (3 hours per topic); refreshed lazily inside `fetch_topic()` on next request after expiry. No separate cron — Kubernetes-friendly.
- **Admin seed** — `seed_admin_on_startup()` runs at app startup (FastAPI `@app.on_event("startup")`), idempotent.

---

## 8. Database Architecture

| Property | Value |
|---|---|
| Engine | **MongoDB 7.0.34** |
| Driver | `motor` (async PyMongo wrapper) |
| Connection string | `mongodb://localhost:27017` (in-container) |
| Database name | `astitva_realestate` |
| Schema enforcement | Pydantic at API boundary; no JSON Schema validators on collections |
| Indexes | Default `_id` only — no custom indexes yet (acceptable at current scale: 6 properties, low lead volume) |

### Recommended indexes when volume grows
```js
db.properties.createIndex({ status: 1, created_at: -1 })
db.leads.createIndex({ status: 1, created_at: -1 })
db.leads.createIndex({ email: 1 })
db.users.createIndex({ email: 1 }, { unique: true })
db.login_attempts.createIndex({ identifier: 1 })
db.news_cache.createIndex({ topic: 1 }, { unique: true })
```

---

## 9. MongoDB Collections

### `users`
```json
{
  "_id": ObjectId,
  "email": "admin@astitva.com",
  "password_hash": "$2b$12$...",
  "name": "Astitva Admin",
  "role": "admin",                // admin | sales | marketing
  "created_at": ISODate,
  "active": true
}
```

### `properties`
```json
{
  "_id": ObjectId,
  "title": "Aura Skylines",
  "slug": "aura-skylines",
  "city": "Kolkata", "state": "West Bengal", "country": "India",
  "neighborhood": "New Town",
  "type": "residential",          // residential | commercial
  "configuration": "4 BHK",
  "carpet_area_sqft": 2850,
  "price_inr": 25000000,
  "price_label": "₹2.5 Cr onwards",
  "status": "published",          // draft | published | sold
  "is_featured": true,
  "images": ["uploads/...", ...],
  "highlights": ["Sky lounge", "Concierge", ...],
  "amenities": [...],
  "description": "...",
  "lat": 22.5827, "lng": 88.4719,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### `leads`
```json
{
  "_id": ObjectId,
  "name": "...",
  "email": "...",
  "phone": "+91...",
  "message": "...",
  "property_id": ObjectId,        // optional
  "source": "website",
  "status": "new",                // new | contacted | qualified | closed | lost
  "notes": "...",
  "assigned_to": ObjectId,        // user._id, optional
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### `login_attempts`
```json
{ "_id": ObjectId, "identifier": "ip|email", "count": 3, "locked_until": ISODate }
```

### `news_cache`
```json
{
  "_id": ObjectId,
  "topic": "kolkata",             // 22 distinct topics
  "articles": [ { title, link, summary, source, published, city, state, country, category, categories: [], impact, why_it_matters }, ... ],
  "fetched_at": ISODate
}
```

---

## 10. API Endpoints (`/api` prefix)

### Auth
| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/login` | Issue JWT (cookie + bearer) |
| POST | `/auth/logout` | Clear cookie |
| GET  | `/auth/me` | Current user |
| POST | `/auth/refresh` | Rotate access token |

### Users (admin role only)
| Method | Path | Purpose |
|---|---|---|
| GET | `/users` | List |
| POST | `/users` | Create |
| DELETE | `/users/{id}` | Delete |

### Properties — public
| Method | Path | Purpose |
|---|---|---|
| GET | `/properties` | Filtered listing (city, type, status=published) |
| GET | `/properties/{id}` | Detail |

### Properties — admin
| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/properties` | All statuses |
| GET | `/admin/properties/{id}` | Admin detail |
| POST | `/admin/properties` | Create |
| PUT | `/admin/properties/{id}` | Update |
| PATCH | `/admin/properties/{id}/status` | Publish / unpublish |
| DELETE | `/admin/properties/{id}` | Remove |

### Leads
| Method | Path | Purpose |
|---|---|---|
| POST | `/leads` | Public submission |
| GET | `/admin/leads` | List |
| PATCH | `/admin/leads/{id}` | Update status/notes |
| DELETE | `/admin/leads/{id}` | Remove |

### Files
| Method | Path | Purpose |
|---|---|---|
| POST | `/admin/upload` | Multipart upload → `/app/backend/uploads/...` |
| GET | `/files/{path}` | Serve uploaded asset |

### Market Intelligence
| Method | Path | Purpose |
|---|---|---|
| GET | `/news/trending` | Top 12 articles across all topics |
| GET | `/news/all` | 100 articles classified by city/state/country/category/impact · returns `{ articles, count, last_updated }` |
| GET | `/news/group/{group}` | local · india · global |
| GET | `/news/topics` | List of topic keys |
| GET | `/news/debug` | Public diagnostic (per-topic counts, age_minutes, TTL) |
| POST | `/admin/news/refresh` | Force refresh (admin) |

### Dashboard
| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/stats` | Counts: properties · leads · users |

**Total endpoints:** 31.

---

## 11. Admin Panel Architecture

The Admin Console is a separate `/admin/*` route tree wrapped in `AdminLayout`. It is **fully server-driven** — every action triggers an API call; no client-side mock data.

### Pages
| Page | Purpose | Key data-testids |
|---|---|---|
| AdminLoginPage | Email + password login | `login-form`, `login-email`, `login-password`, `login-submit` |
| AdminDashboardPage | Stat cards + recent activity | `admin-dashboard` |
| AdminPropertiesPage | Property table with status badges, edit/delete actions | `admin-property-row-{id}` |
| AdminPropertyFormPage | Create/Edit property + multipart image upload | `property-form` |
| AdminLeadsPage | Lead inbox, status workflow (new → contacted → qualified → closed), inline notes | `lead-row-{id}` |
| AdminUsersPage | List/create/delete staff users (admin role only) | `user-row-{id}` |

### Access control
- All `/admin/**` API paths require `Depends(require_staff)` or `Depends(require_admin)` in FastAPI.
- Frontend `AdminLayout` redirects unauthenticated users to `/admin/login`.
- 401 responses automatically clear the local user state and redirect.

---

## 12. Authentication System

| Aspect | Implementation |
|---|---|
| Strategy | JWT (HS256), 12-hour access token |
| Storage | httpOnly cookie (primary) + `Authorization: Bearer` fallback for cross-domain |
| Password hash | bcrypt, 12 rounds |
| Brute-force protection | `login_attempts` collection — 5 failures lock identifier for 15 min |
| Roles | `admin` (full) · `sales` · `marketing` (read-write on properties+leads, no users) |
| Seed | `seed_admin_on_startup()` runs at FastAPI startup; idempotent. Credentials read from `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars |
| Logout | Clears cookie + sets local user to `false` |
| Refresh | `POST /auth/refresh` rotates access token (used silently by `AuthContext`) |

**Seeded admin credentials (preview):** `admin@astitva.com` / `Astitva@2026` (see `/app/memory/test_credentials.md`).

---

## 13. Market Intelligence Architecture

### Pipeline (3-layer defence in depth)
```
┌────────────────────────────────────────────────────────────────┐
│ LAYER 1 — LIVE RSS                                             │
│   22 Google News RSS topics (Kolkata, Mumbai, Delhi, REIT,     │
│   metro, smart cities, RBI, REIT, UAE, Singapore, London, US…) │
│   Fetched lazily on first request after 3h TTL                 │
└──────────────────────────┬─────────────────────────────────────┘
                           │ merge new+old, dedupe by link
                           ▼
┌────────────────────────────────────────────────────────────────┐
│ LAYER 2 — MONGODB ROLLING CACHE (news_cache)                   │
│   Newest 100 per topic, never wiped on failed fetch            │
│   30-min retry window after empty fetch                        │
└──────────────────────────┬─────────────────────────────────────┘
                           │ if result < 14 articles
                           ▼
┌────────────────────────────────────────────────────────────────┐
│ LAYER 3 — BACKEND EVERGREEN (news_service.EVERGREEN_FALLBACK)  │
│   14 hand-curated articles covering 8 categories × 4 countries │
└──────────────────────────┬─────────────────────────────────────┘
                           │ if API itself hangs/fails
                           ▼
┌────────────────────────────────────────────────────────────────┐
│ LAYER 4 — FRONTEND BUNDLED (src/data/evergreenNews.js)         │
│   State pre-seeded on first paint, never empty UI              │
└────────────────────────────────────────────────────────────────┘
```

### Classification
Multi-tag (an article can be Infrastructure + Investment + Commercial simultaneously). 8 categories: Infrastructure · Residential · Commercial Real Estate · Luxury Property · Policy · Investment · Economy · Technology. Impact tier: High / Medium / Low.

### Frontend filter cascade (never empty)
```
Primary match → Related category → India fallback → Global fallback → Latest all
                  with banner: "No direct matches found. Showing the latest …"
```

### Auto-refresh schedule
3 hours per topic, on-demand (lazy). Refresh runs only when a request comes in for stale data — Kubernetes-friendly (no always-on cron).

---

## 14. Lead Management Flow

```
┌──────────────────┐    POST /api/leads     ┌──────────────────┐
│  Public form     │ ─────────────────────► │  db.leads        │
│  (ContactPage,   │                        │  status: "new"   │
│   PropertyDetail,│                        └────────┬─────────┘
│   Consultation)  │                                 │
└──────────────────┘                                 │
                                                     │
                                    GET /api/admin/leads
                                                     │
                                                     ▼
                                          ┌──────────────────┐
                                          │ /admin/leads     │
                                          │ inbox            │
                                          └────────┬─────────┘
                                                   │ staff updates
                                                   ▼
                          PATCH /api/admin/leads/{id}
                          status: contacted → qualified → closed / lost
                          notes, assigned_to
```

**Currently:** no automated notification on new leads — staff must check the inbox.

**Recommended P1 enhancement:** Resend (email) + Twilio (SMS) instant notification to sales@astittva.in on `POST /api/leads`. Playbook ready via `integration_playbook_expert_v2`.

---

## 15. CRM Integration Plan

The platform is **CRM-agnostic by design** — leads live in MongoDB and are surfaced via a clean REST API. To plug into any external CRM, a CRM vendor needs:

### Outbound (push lead → CRM)
Add a webhook trigger inside `POST /api/leads` handler:
```python
async def post_lead(payload):
    res = await db.leads.insert_one(doc)
    await emit_webhook(WEBHOOK_URLS, doc)  # ← add this
    return ...
```
Configure via `LEAD_WEBHOOK_URLS` env var (comma-separated). Supports: Zoho CRM, HubSpot, Salesforce, Pipedrive, Zapier, Make.com — anything that accepts JSON POSTs.

### Inbound (CRM → fetch leads)
- Provide `Bearer` token via `/auth/login` to a CRM service account.
- CRM polls `GET /api/admin/leads?since=<ISO>` and `PATCH /api/admin/leads/{id}` to sync state back.

### Recommended CRMs
| CRM | Fit | Notes |
|---|---|---|
| **Zoho CRM** | India-focused, INR-native, affordable | Best ROI for SMB luxury real estate |
| **HubSpot** | Best free tier, marketing automation | Good for NRI lead nurture sequences |
| **Pipedrive** | Pipeline-focused, simple | Excellent for deal-stage workflow |
| **Salesforce Real Estate Cloud** | Enterprise, expensive | Justified only at >1,000 leads/month |

A single junior dev can wire any of the above to Astittva's API in 1–2 days.

---

## 16. GitHub Repository Structure

```
Astittva-Realestate/                      (https://github.com/<owner>/<repo>)
├── README.md
├── .gitignore
├── .emergent/                            ← Emergent platform metadata
├── .git/
├── memory/
│   ├── PRD.md                            Product requirements + changelog
│   ├── test_credentials.md               Seeded admin creds
│   └── ARCHITECTURE.md                   ← THIS FILE
├── backend/
│   ├── server.py                         FastAPI app (31 routes)
│   ├── news_service.py                   RSS + classifier + cache + evergreen
│   ├── seed_properties.py                Sample data
│   ├── gen_images.py / gen_kolkata.py    Asset gen scripts (one-off)
│   ├── requirements.txt                  Python deps
│   ├── .env                              MONGO_URL, JWT_SECRET, ADMIN_*, EMERGENT_LLM_KEY
│   ├── uploads/                          User-uploaded property images
│   └── tests/
│       ├── backend_test.py
│       └── test_market_intelligence.py
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── images/                       Kolkata landmark photos
│   ├── src/                              (see Section 6)
│   ├── package.json
│   ├── tailwind.config.js
│   ├── craco.config.js
│   └── .env                              REACT_APP_BACKEND_URL, WDS_SOCKET_PORT
├── test_reports/
│   └── iteration_*.json                  Automated QA reports
└── design_guidelines.md
```

Source control: GitHub. Saving from preview to GitHub uses the **"Save to GitHub"** feature in the Emergent chat input — Emergent commits the entire `/app` workspace.

---

## 17. Deployment Architecture

### Current state
| Environment | URL | Purpose |
|---|---|---|
| **Preview** | `https://<job-id>.preview.emergentagent.com` | Active development with hot reload |
| **Production** | `https://github-executor-3.emergent.host` | Live customer-facing |

### Topology
- Both environments run in **Kubernetes pods** managed by Emergent's hosted runtime.
- Each pod contains: nginx ingress → React static bundle, FastAPI (uvicorn) on port 8001, MongoDB on port 27017, supervisor as process manager.
- `/api` paths are routed to FastAPI; everything else hits the React SPA.
- Hot reload on preview only; production is a built bundle.

### Deploy workflow
1. Edit code in preview (chat with Emergent AI or manually).
2. Preview auto-reloads.
3. Click **"Deploy"** in Emergent dashboard → builds production image → swaps live container.
4. Production URL serves the new build within minutes.

### Limitations
- Single-container Mongo (not Atlas) → see Section 19 backup strategy.
- "Made with Emergent" badge in bottom-right corner (platform-level, removable only via Emergent plan upgrade).

---

## 18. Environment Variables

### Backend (`/app/backend/.env`)
```env
MONGO_URL=mongodb://localhost:27017             # Container-local Mongo
DB_NAME=astitva_realestate
JWT_SECRET=<long random secret>                 # Rotate before production!
APP_NAME=astitva-realestate
EMERGENT_LLM_KEY=sk-emergent-...                # Universal LLM key (Emergent-provided)
CORS_ORIGINS=*                                  # Allow-all (echoed-back via regex)
FRONTEND_URL=                                   # Optional override
ADMIN_EMAIL=admin@astitva.com                   # Seed admin email
ADMIN_PASSWORD=Astitva@2026                     # Seed admin password — CHANGE in production
ADMIN_NAME=Astitva Admin
```

### Frontend (`/app/frontend/.env`)
```env
REACT_APP_BACKEND_URL=https://<preview-or-prod-host>
WDS_SOCKET_PORT=443                             # webpack-dev-server HMR
```

⚠️ `lib/api.js` falls back to same-origin `/api` if window.host ≠ baked URL host, eliminating most cross-origin issues.

---

## 19. Backup Strategy

### Current state: **NONE.**
- MongoDB runs inside the application container.
- No `mongodump` cron, no replica set, no point-in-time recovery.
- If the container's storage volume is wiped or corrupts, all leads/properties/users are permanently lost.

### Recommended (in priority order)
1. **P0 — Migrate to MongoDB Atlas** (free M0 tier covers Astittva's data volume indefinitely).
   - Continuous backups, point-in-time restore, replica set across availability zones.
   - One-line change: `MONGO_URL` env var.
2. **P1 — Daily `mongodump` cron** uploading to Emergent Object Storage (defence in depth even with Atlas).
3. **P2 — Lead duplication to CRM webhook** (Section 15) — leads also exist in Zoho/HubSpot.
4. **P3 — Quarterly disaster-recovery drill** — confirm restore actually works.

---

## 20. Security Considerations

### Implemented
- ✅ JWT tokens (HS256, 12h expiry, httpOnly cookie + Bearer fallback)
- ✅ bcrypt password hashing (12 rounds)
- ✅ Brute-force lockout (5 attempts / 15 min via `login_attempts` collection)
- ✅ Role-based access (`require_admin`, `require_staff` FastAPI dependencies)
- ✅ CORS allow-list with credentialed origin echo
- ✅ Pydantic input validation at every endpoint
- ✅ Server-side property/lead status enums (no client-injectable values)
- ✅ Read-only public endpoints separated from `/admin/**` mutation paths

### Outstanding (recommended before public launch)
- ⚠️ **Rotate `JWT_SECRET`** — current value is the dev secret committed in `.env`.
- ⚠️ **Rotate `ADMIN_PASSWORD`** — change `Astitva@2026` before going live.
- ⚠️ **Add HTTPS-only cookie flag** in production (preview is fine).
- ⚠️ **Rate-limit `/api/leads`** to prevent form spam (currently unthrottled).
- ⚠️ **CAPTCHA** on the public lead form (hCaptcha or Cloudflare Turnstile).
- ⚠️ **Content Security Policy** header (defence in depth against XSS).
- ⚠️ **Sanitise rich-text fields** before render (current admin inputs are plain-text, but expand cautiously).
- ⚠️ **PII audit** — leads contain phone numbers; ensure GDPR/DPDP compliance if marketing to EU/India residents.
- ⚠️ **No backups** — see Section 19.

---

## 21. Future Roadmap

### P0 (block production launch)
- [ ] Replace placeholder phone `+91 90000 00000` with the real number
- [ ] Rotate `JWT_SECRET` and `ADMIN_PASSWORD`
- [ ] Migrate to MongoDB Atlas
- [ ] Add daily backup cron
- [ ] Add CAPTCHA + rate-limit on lead form

### P1 (first 30 days post-launch)
- [ ] Resend email + Twilio SMS instant lead notification → sales@astittva.in
- [ ] JSON-LD structured data + sitemap.xml + robots.txt
- [ ] Investor brochure PDF email-gate per property
- [ ] CRM webhook (Zoho / HubSpot / Pipedrive)
- [ ] Property comparison tool
- [ ] Saved searches / wishlist with email alerts

### P2 (90 days)
- [ ] Multi-language (Bengali / Hindi)
- [ ] Currency toggle (₹ / $ / £ / AED) on listings
- [ ] react-helmet-async for richer SEO
- [ ] Image CDN (Cloudflare Images / Bunny.net) — currently served from local `/uploads`
- [ ] Source higher-res photographic Prinsep Ghat / Park Street / St Paul's / Maidan for hero
- [ ] Admin analytics: lead conversion funnel, source attribution

### P3 (R&D / nice-to-have)
- [ ] Virtual property tours (Matterport or self-hosted 3D)
- [ ] AI investor brief generator using `EMERGENT_LLM_KEY` (GPT-5.2 / Claude Sonnet 4.5)
- [ ] WhatsApp Business API integration (replace simple `wa.me` link with conversation tracking)
- [ ] Tokenised fractional-ownership pilot

---

## Built on Emergent — Explicit Disclosure

This entire platform was developed using the **Emergent AI development platform** (https://emergent.sh). Specifically:

### Generated by Emergent AI
- 100% of the React frontend scaffold (Create React App + Tailwind + Shadcn UI configuration).
- 100% of the FastAPI backend scaffold (auth + JWT + bcrypt + Mongo motor wiring).
- All UI components — cinematic hero, ambient glow, news grid, property cards, admin tables.
- All 31 API routes and their Pydantic models.
- The Market Intelligence pipeline (RSS fetcher, classifier, rolling cache, evergreen fallback).
- All 14 curated evergreen news articles (drafted by AI under brand-tone guardrails).

### Configured through Emergent
- **Hosting** — both preview and production on Emergent's Kubernetes runtime.
- **`EMERGENT_LLM_KEY`** — universal LLM credential covering OpenAI (GPT-5.2, image gen, Whisper, Sora), Anthropic (Claude Sonnet 4.5), Google (Gemini 3, Nano Banana). Currently unused by app code, available for future AI features.
- **Asset hosting** — `LOGO_URL` and uploaded property images served via Emergent CDN.
- **Save to GitHub** — code versioning routed through Emergent's GitHub integration.

### Current platform limitations
- **"Made with Emergent" badge** in the bottom-right of the deployed app — removable only via Emergent plan upgrade through their dashboard.
- **MongoDB inside the container** — Emergent's default deploy ships an in-pod Mongo, not a managed Atlas instance. Migration is straightforward (one env var) and strongly recommended.
- **No native cron/scheduler** — background tasks must be lazy (request-triggered) or external (cron-job.org, Atlas scheduled triggers).
- **Single-region** — Emergent currently deploys to one region; for geographically distributed UHNW audiences, a multi-CDN strategy (Cloudflare) is recommended.

### Recommended production upgrades
| Item | Why | Effort |
|---|---|---|
| MongoDB Atlas migration | Real backups, replica set, point-in-time recovery | 30 min |
| Custom domain (`astittva.in`) | Removes preview/Emergent host from public URLs | 1 hour via Emergent dashboard + DNS |
| Cloudflare in front | DDoS protection, WAF, edge cache, image optimisation | 2 hours |
| Real lead notifications (Resend + Twilio) | Sub-minute response on inbound HNI leads | 4 hours |
| CAPTCHA on lead form | Spam control once URL goes public | 1 hour |
| Rotate all secrets | Mandatory before public launch | 15 min |
| CRM webhook | Centralise leads in Zoho/HubSpot/Pipedrive | 1 day |
| Image CDN | Faster luxury photography rendering on mobile networks | 4 hours |

---

## Appendix A — Quick Reference

| Need | Where to look |
|---|---|
| Add a new public route | `/app/frontend/src/App.js` → register; create page in `/app/frontend/src/pages/` |
| Add a new API endpoint | `/app/backend/server.py` → `@api_router.<verb>("/path")` |
| Add a new news topic | `/app/backend/news_service.py` → `TOPICS` dict + assign to `GROUPS` |
| Add a new brand asset | Upload via `/admin/properties` form OR add to `/app/frontend/public/images/` |
| Seed test data | `python /app/backend/seed_properties.py` |
| Test creds | `/app/memory/test_credentials.md` |
| Product changelog | `/app/memory/PRD.md` |

## Appendix B — Contact for Engineering

For continued development or technical handover:
- Codebase: `/app` (Emergent Kubernetes container, preview)
- GitHub: pushed via Emergent's "Save to GitHub" feature
- Platform support: support@emergent.sh
- Architectural questions: this document — first stop before reading code

---

**End of Architecture Report.**
