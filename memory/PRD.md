# ASTITTVA — Luxury Real Estate Platform · PRD (v5 · Production)

## Brand
- **Wordmark:** ASTITTVA (double T) — used throughout site (header, footer, mobile menu, page title, metadata)
- **Logo:** Official copper monogram on burgundy texture
- **Palette:** #050505 background · #2A0608 burgundy · #3A0B10 wine · #C68642 copper · #D4A373 rose-gold · #B7792E gold · #F7F3EE ivory · #B8AEA4 muted
- **Type:** Cormorant Garamond (display) · Poppins (headings) · Inter (body)
- **Ambient:** Sitewide burgundy radial + copper sheen (`AmbientGlow` component)

## Architecture
- **Backend:** FastAPI + MongoDB + feedparser (Google News RSS, **3h cache, rolling archive**)
- **Frontend:** React 19, React Router v7, Framer Motion, Tailwind
- **Storage:** Emergent Object Storage
- **Auth:** JWT (HttpOnly + Bearer fallback) · roles admin/sales/marketing

## Contact (Public)
- **Email:** sales@astittva.in
- **Office:** PS IXL Building, 5th Floor Room 511, Biswa Bangla Sarani, Atghara, New Town, Kolkata, West Bengal 700136, India
- **Phone:** +91 90000 00000 (placeholder — replace before launch)

## What's been implemented

- **v1:** MVP — auth, admin panel, properties CRUD, lead gen, multi-page site
- **v2:** UI/UX refinement — trust signals, stats redesign, WhatsApp, lead form upgrade
- **v3:** New logo, deeper palette, Market Intelligence page (8 sections, live RSS), extended contact form
- **v4:** Final brand consistency — burgundy palette, AmbientGlow component, classified news cards, filter system, Market Opportunities, Markets We Track, SEO
- **v5 (FINAL PRODUCTION):**
  - **Brand correction:** ASTITTVA (double T) everywhere
  - **Contact details:** PS IXL Building New Town address + sales@astittva.in in footer + contact page + metadata
  - **Market Intelligence cards** now show full geo hierarchy: CITY · STATE · COUNTRY (e.g. MUMBAI · MAHARASHTRA · INDIA, LONDON · GREATER LONDON · UK)
  - **2 new filter chips:** ECONOMY · TECHNOLOGY (with proper backend classification rules)
  - **CinematicHero**: rotating Kolkata landmarks every 6s with Ken Burns zoom + 1.6s crossfade + slide caption + progress dots — 6 hand-curated images (Biswa Bangla Gate, Howrah Bridge, Victoria Memorial, New Town Skyline, Eco Park, City Centre 2)
  - Page title updated to "Astittva · Luxury Real Estate Advisory · Kolkata"
- **v5.1 (Market Intelligence resilience — Feb 2026):**
  - **Multi-tag classification:** every keyword pattern adds a category (no early break) — articles surface in all relevant filters
  - **Added missing topics:** `economy`, `technology` (queries against Google News RSS for India macro & PropTech)
  - **Rolling archive cache:** `_merge_articles()` merges new+old, dedupes by link, keeps newest 100 per topic — empty/failed fetches never wipe data
  - **TTL:** 3h (was 6h); failed refresh shortens retry window to 30 min instead of holding a full 3h lockout
  - **Frontend fallback cascade:** when a filter returns 0, cascade to related-category → India → Global → latest — graceful banner ("No direct matches found. Showing the latest relevant market intelligence.") instead of empty state
  - **Skeleton loaders** replace plain spinner during first uncached load
  - **Console debug logs** (`[MI] ...`) for fetched / filtered / fallback counts
  - **Backend country defaults** now mark India-topic articles with `country=India` (previously left blank → "—")
  - Tested: 100% backend + frontend, all 13 filters return content
- **v5.2 (Market Intelligence triple-layer failsafe — Feb 2026):**
  - **Evergreen fallback:** 14 curated, hand-written articles baked into `news_service.EVERGREEN_FALLBACK` covering all 8 categories × 4 countries — auto-engages when live + cache < 14 articles
  - **/api/news/all now returns `{ articles, count, last_updated }`** — last_updated = newest fetched_at across all topics
  - **Hero "LAST UPDATED · {timeAgo}"** indicator in copper
  - **Removed "Feed Temporarily Unavailable" banner path** — pipeline now guarantees ≥14 articles always, so the empty-state UI was unreachable and removed
  - **/api/news/debug** public diagnostic endpoint listing per-topic counts, age_minutes, TTL
- **v5.3 (Hierarchical Location Filtering — Feb 2026):**
  - **Parent-city expansion** in `GET /api/properties`: filtering by `location=Kolkata` now returns all properties in Kolkata + New Town + Rajarhat (via `LOCATION_HIERARCHY` map)
  - Sub-market filters (`New Town`, `Rajarhat`, `Alipore`, …) remain scoped to themselves — unchanged behaviour
  - Hierarchy map is easily extensible for future parent cities (Mumbai, Delhi, Bengaluru, …)
  - Verified via curl: Kolkata→6, New Town→3, Rajarhat→2, Alipore→1 ✓
- **v5.4 (Aramya Greens → Astittva CRM unification — Feb 2026):**
  - Aramya Greens standalone landing page (`/aramya-greens` → iframe `/aramya/index.html`) contact form now submits through the EXACT same `POST /api/leads` pipeline as every other Astittva enquiry form — no new endpoint, no duplicated CRM code
  - Field mapping: Name → first_name + last_name (space-split), Contact → phone + email (auto-parsed for @; synthetic `leads+<phone>@astittva.in` when only phone given), Requirements → message
  - Every Aramya submission is tagged `{ project: "Aramya Greens", source: "aramya-greens", form: "Site Visit Enquiry" }` so it's distinguishable inside the Azure CRM
  - Backend: added optional `form` field to `LeadIn` model; `crm_service._resolve_lead_type` now honours the explicit form label → CRM sees `Lead Type: Site Visit Enquiry` as first line of additionalNotes
  - Fixed a duplicate `id="contact"` collision (section + input) by scoping form lookups to `propForm.querySelector()`
  - Verified E2E: iframe submit → 201 Created → Mongo persisted → Azure CRM webhook `HTTP 200 OK` (same production endpoint as Astittva Marketing)
  - **Tests: iteration 7 (backend 5/5) + iteration 8 (frontend 4/4) — 100% pass**
- **v5.5 (Market Intelligence — Snapshot removal & live-feed audit — Feb 2026):**
  - Removed the entire "Market Snapshot" section (SNAPSHOTS constant + snapshot dashboard block) from `/app/frontend/src/pages/MarketIntelligencePage.jsx` per user request
  - Renumbered downstream section eyebrows: Live Intelligence = Section 02, Investor Lens = 03, Curated for Investors = 04, Coverage = 05, Future Expansion Tracker = 06
  - Pruned unused lucide-react imports (Train, IndianRupee, MapPin, Sparkles, Globe2, Activity, Loader2, ShieldCheck, Layers)
  - Audited the live news pipeline end-to-end — no backend changes needed: `/api/news/all` returns 100 live articles with `last_updated`, `/api/news/trending` returns 12; page renders 12 live cards, filters (Kolkata / India / All) all work, no console errors beyond the pre-existing `/api/auth/me` 401 noise (P3 backlog)
  - **Tests: iteration 9 — backend 100% + frontend 100% pass**
- **v5.6 (Editorial — full Blogs CMS module — Feb 2026):**
  - New "Blogs" primary nav item between Market Intelligence and About (desktop + mobile)
  - Public `/blogs` list page ("The Astittva Journal") + SEO-friendly `/blogs/:slug` detail pages with per-blog SEO tags (title, description, keywords, OG image) and JSON-LD BlogPosting/Blog schema via `Seo` component
  - Admin CMS at `/admin/blogs` — reuses existing JWT auth, staff can create/edit/publish/unpublish, admin can delete
  - Blog schema: title, slug (auto, unique, `-2/-3…` suffix on collision), featured_image (existing /api/admin/upload), short_description, body (HTML rich text with live preview toggle in the form), seo_title/seo_description/seo_keywords, status (draft/published), publish_date (auto-stamped on publish), author, created_at/updated_at
  - Backend: `blogs` Mongo collection with `slug` unique + `(status,publish_date)` indexes; endpoints `GET /api/blogs`, `GET /api/blogs/{slug}` (public), `GET/POST/PUT/PATCH/DELETE /api/admin/blogs[/{id}][/status]` (auth-scoped)
  - `/api/sitemap.xml` auto-includes `/blogs` and every published `/blogs/<slug>` URL
  - New `.blog-prose` typography (Cormorant Garamond headings, Inter body, copper accents) for editorial reading
  - **Tests: iteration 10 — backend 12/12 pytest + frontend 100% pass** (`/app/backend/tests/test_blogs.py`)
- **v5.7 (Performance & Core Web Vitals pass — Feb 2026):**
  - **Images**: batch-optimised every `/public/images/**/*.{jpg,png}` to WebP — desktop (≤1920w, q82) + mobile (≤720w, q78). Total on-the-wire image weight dropped **15.4 MB → 3.6 MB (-77%)**. Reusable `LuxImage` component + `<picture>` element in CinematicHero automatically serves the mobile crop below 768px.
  - **LCP**: hero first slide preloaded via media-scoped `<link rel="preload" as="image" fetchpriority="high">` (separate desktop + mobile hrefs). Hero LCP asset dropped 773 KB → 127 KB (-84%). Hero JS preloader now uses viewport-appropriate variant.
  - **JS bundle**: every non-home route (Properties, About, Contact, Market Intelligence, Blogs, Aramya, entire admin panel) is React.lazy-imported with a lightweight Suspense fallback (`data-testid="route-loading"`). Public visitors never download admin chunks.
  - **Backend compression**: `GZipMiddleware` added to FastAPI (`minimum_size=500`, level 6) — all JSON APIs now travel gzip-encoded (3-5× bandwidth reduction).
  - **Long-term cache**: `GET /api/files/{path}` returns `Cache-Control: public, max-age=2592000, stale-while-revalidate=604800` so browsers/CDNs don't re-fetch immutable upload bytes.
  - Optimiser is idempotent (`/app/scripts/optimize_images.py`) — safe to rerun after new hero assets land.
  - **Tests: iteration 11 — backend 7/7 pytest + frontend 100% pass**, zero visual/functional regressions
- **v5.8 (Full-site responsiveness pass — Feb 2026):**
  - Audited every public + admin route at 6 viewports (320 / 375 / 768 / 1024 / 1440 / 1920 px) — zero horizontal-scroll bugs remain
  - **Admin panel**: fully rebuilt for mobile — sticky top bar with hamburger, single `<aside>` that slides in as a drawer on <lg and becomes a static 256px column on ≥lg; drawer auto-closes on route change and locks body scroll while open. No more duplicated data-testids across two sidebars.
  - **Admin tables** (Blogs, Properties, Users): wrapped in `overflow-x-auto` with `min-w-[520px]` on the `<table>` so they scroll horizontally instead of getting cropped
  - **Admin list headers** (Properties, Blogs): use `flex-wrap gap-4` so the primary CTA drops below the title on mobile rather than colliding with it
  - **Market Intelligence filter bar** (13 chips ≈ 1450px): wraps to two rows on ≥sm via `sm:flex-wrap` + `sm:overflow-visible`; horizontally-swipeable on <sm with a hidden scrollbar (`.no-scrollbar` utility added to `index.css`)
  - **Tests: iteration 12 — frontend ~98% pass**, zero critical or functional regressions
- **v5.9 (Code-review hardening pass — XSS defense-in-depth — Feb 2026):**
  - **DOMPurify sanitisation**: added `/app/frontend/src/lib/sanitize.js` (`dompurify@3.4.13`) — every `dangerouslySetInnerHTML` on the site (public `/blogs/:slug` body AND admin form Preview panel) now runs through `sanitizeBlogHtml()` first
  - Whitelist covers editorial vocabulary (h1-h6, p, strong/em, a, ul/ol/li, blockquote, img, code, hr); scripts, iframes, style tags and inline event-handler attributes are stripped; every `target="_blank"` link is auto-hardened with `rel="noopener noreferrer"` via an `afterSanitizeAttributes` hook
  - **Prod console silence**: `MarketIntelligencePage` `mlog` helper is a no-op when `process.env.NODE_ENV === 'production'`; its catch-block `console.warn` calls are wrapped in the same env check. Dev experience unchanged.
  - **Env-configurable test credentials**: `test_blogs.py` and `test_aramya_leads.py` now read `ADMIN_TEST_EMAIL`/`ADMIN_TEST_PASSWORD` from process env
  - Documented rejection of code-review false positives (undefined vars that are defined in prior branches, `key={i}` on static skeleton arrays, missing hook deps for module-scope imports) and out-of-scope refactors (localStorage → httpOnly cookies, 500-line component splits)
  - **Tests: iteration 13 — frontend 100% (8/8 XSS + regression checks) + backend 10/12 (2 unrelated pre-existing seed failures)**

## Tests
- v1: 32/32 ✓ · v2: 34/34 ✓ · v3: 43/43 ✓ · v4: 56/56 ✓ · **v5: 68/68 ✓**
- Mobile verified at 375/390/414 — zero horizontal overflow on every page
- Brand verified: ASTITTVA wordmark in header/footer/title/MI eyebrow · 0 occurrences of "Astitva" (single T) in user copy

## Production Backlog
- **P0 (before public launch):** real phone number & email (currently placeholders)
- **P1:** Resend instant-email + Twilio SMS on new lead
- **P1:** JSON-LD structured data + sitemap.xml + robots.txt
- **P1:** Investor brochure PDF email-gate per property
- **P2:** Multi-language (Bengali / Hindi) · property comparison · saved searches
- **P3:** Currency toggle (₹/$/£) · react-helmet-async for cleaner SEO
- **P3:** Stack CinematicHero images (multi-img crossfade) instead of src-swap
- **P3:** Silence /api/auth/me 401 console noise for unauthenticated visitors

## Admin
- URL: `/admin/login`
- Credentials: `admin@astitva.com` / `Astitva@2026` (seeded on every backend boot)
