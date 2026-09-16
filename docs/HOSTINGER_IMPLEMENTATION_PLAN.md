# Astittva: simplification and Hostinger implementation plan

Prepared: 11 September 2026

Status: proposed implementation plan. No application migration, deletion, database change or deployment has been performed by preparing this document.

## Intended result

One React frontend, one authoritative backend, one explicitly selected MongoDB database, and persistent image storage. Retain the existing visitor and staff features while removing duplicated implementation, unused dependencies and deployment clutter. Preserve public URLs and existing database identifiers.

Success means a reproducible installation and deployment, understandable feature folders, verified functionality and a tested rollback procedure. A lower file count is a secondary outcome, not a reason to merge unrelated code or delete useful tests.

## Decisions needed before dependent work

1. Confirm the exact Hostinger plan and whether managed Node.js deployment is available or a VPS will be used.
2. Identify the current production deployment, authoritative MongoDB database name and connection owner. The source uses both `astitva_db` defaults and an `astitva_realestate` backup directory; these must not be assumed interchangeable.
3. Confirm whether existing Emergent object storage remains available outside the current hosting environment. If it will be retired, choose persistent replacement storage and obtain access to export existing objects.
4. Identify the CRM test endpoint/account and the production domain/DNS owner. Store credentials in environment configuration, never in this plan or frontend bundles.
5. Decide whether the historical Aramya campaign is still required. Its tests/reports exist, but its standalone page source is absent from the inventoried checkout.

Recommended planning default: managed Hostinger Node.js hosting with MongoDB Atlas. This requires porting missing Python capabilities before switching production. If using a VPS and minimizing application rewriting is the priority, retain Python instead and consolidate its duplicated implementation. Select one path; do not implement both migrations.

## Current source evidence

- Root `package.json` starts `server.js`, builds `frontend`, and runs only the database diagnostic through `npm test`.
- `render.yaml` and `backend/Procfile` start the Python `backend/server.py` application.
- `backend/server.py` defines and mounts its own `api_router`. The separate `backend/routers/` modules are not imported into that configured entry point.
- Node implements core authentication, properties, blogs, leads, staff users, statistics and stored news-cache reads.
- Python additionally implements file upload/delivery, CRM forwarding/retry, RSS aggregation/grouping/refresh and sitemap generation. Matching API names do not prove matching validation, payloads or authorization.
- Frontend admin editors depend on `/api/admin/upload`; `fileUrl()` resolves storage paths through `/api/files/`.
- Frontend uses CRACO, npm lockfiles and a Yarn packageManager declaration. Choose and verify one installation tool before modifying dependency files.
- Historical reports are reference material, not proof of current operation.

## Phase 1 - Establish a recoverable baseline

Tasks:

- Inspect Git status and preserve existing uncommitted work. Create an isolated implementation branch, record the baseline revision and keep migration changes separate from unrelated edits.
- Inventory tracked source, imports, dynamic imports, CSS asset URLs, public HTML/manifest references, scripts and deployment hooks. Record file counts and deployment size with explicit exclusions for dependencies/build outputs.
- Record current API contracts: method, path, request fields, response fields, error codes, cookie behavior and allowed roles. Compare both entry points against frontend callers.
- Back up the authoritative database and export storage metadata/objects to protected storage outside the deployment tree. Verify a restore to an isolated database and representative media retrieval. Include blogs; the existing supplied dump does not contain a blog collection file.
- Capture baseline desktop/mobile views and key user journeys in a test environment. Route CRM requests to a mock/test destination so tests cannot contact real customers or create production CRM records.

Exit gate: recoverable code/data/media baseline, known runtime/database, and a documented feature contract. Any current failures are recorded separately from migration regressions.

## Phase 2 - Select and consolidate the backend

### Path A: managed Node.js hosting

- Move the existing Node entry point and database connector into the final backend location. Update root start scripts, dotenv paths, static-build paths and test imports in the same change.
- Extract feature routes gradually: authentication, users, properties, blogs, leads, statistics, files, news and SEO. Keep common middleware/configuration in one place.
- Port Python request validation and serialization deliberately. Preserve MongoDB ObjectIds, property publication/availability distinctions, price parsing, blog slugs, lead identity fields and existing password-hash compatibility.
- Implement staff image uploads and public file delivery with existing response shapes, MIME/size checks, metadata records and persistent storage. Existing image URLs must keep resolving.
- Port CRM mapping, save-before-forward behavior, delivery status, timeout/retry rules and staff retry authorization. Define safe handling of unknown delivery outcomes; do not claim exactly-once delivery without CRM support. Recover pending delivery from persisted state after a process restart, using a supported worker/scheduler or explicit staff retry workflow.
- Port RSS fetching, topic/group classification, cache TTL, deduplication, last-known-good fallback and refresh behavior. Retain bundled frontend fallback articles.
- Add the dynamic sitemap and preserve existing public paths.
- Consolidate role checks, input validation, login protections, configuration validation and required database indexes. Remove production default-secret/default-password fallbacks from the final runtime.
- Use an explicit database name rather than relying on cluster discovery. Keep unknown `/api/*` requests as JSON 404 responses and allow SPA fallback only for website routes.

Exit gate: every retained frontend flow and required Python capability passes against Node. Only then archive the Python implementation and remove its runtime dependencies from the deployment.

### Path B: Hostinger VPS with Python

- Keep FastAPI and port any required Node-only behavior identified by the contract comparison.
- Compare modular routers with the monolithic server before mounting them. Do not assume the copies are identical.
- Make the Python entry point a small application bootstrap using one configuration/database module and one set of route definitions. Preserve initialization, indexes, middleware, uploads, CRM and RSS behavior.
- Serve the compiled React site through a reverse proxy and route `/api` to FastAPI on the same public origin.
- Configure process restart, TLS, logs, database connectivity and persistent storage for the VPS.
- Remove the Node API implementation after parity checks. Retain Node build tooling required to compile React.

Exit gate: one Python implementation passes the same functional contract, with no production dependence on the removed Node API.

## Phase 3 - Simplify folder names and frontend organization

Retain conventional names that already communicate purpose: `frontend`, `backend`, `docs`, `scripts`, `tests`. Avoid renaming solely for appearance.

Suggested Node target:

```text
astittva/
  frontend/
    public/               # Static icons and responsive images
    src/
      pages/              # Public pages; preserve external URLs
      admin/              # Staff pages and admin layout
      components/         # Shared UI and public layout
      services/           # API client and authentication provider
      utils/              # Formatting, sanitization, class helpers
      data/               # Brand/options and fallback news data
      styles/             # Global and application styles
    package.json
    package-lock.json
    ...                   # Required HTML/build/style configuration
  backend/
    server.js
    database.js
    config.js
    middleware/           # Shared authentication/error handling
    routes/               # Feature endpoint handlers
    services/             # CRM, news and storage integrations
  tests/
  scripts/
  docs/
  package.json
  package-lock.json
  .env.example
  .gitignore
  README.md
```

For Python, keep the same business grouping but use Python modules and its requirements file. The diagram omits some necessary config files; it is not an exhaustive deletion whitelist.

Tasks:

- Move root `db.js` to `backend/database.js` on the Node path. Update every import and configuration/static path with the move.
- Move `frontend/src/pages/admin/` to `frontend/src/admin/`, with admin layout in that area. Update lazy imports and route references.
- Group API/authentication code under `services/`, pure helpers under `utils/`, and shared site/options/fallback content under `data/`.
- Consolidate repeated site/contact constants and test-selector definitions; remove aliases only after all consumers migrate.
- Reuse lead submission/validation behavior while retaining each form's fields, source tags, property metadata and success/error states.
- Keep important shared components, responsive image handling, lazy routes and HTML sanitization.
- Update Tailwind content scanning, the `@` alias if affected, CSS imports, scripts and test paths. Check case-sensitive imports on Linux.
- Retain the current React/CRACO toolchain during migration. A build-system upgrade should be a separate later change with its own justification.

Exit gate: a clean production build and unchanged public URLs, presentation, form behavior and admin navigation.

## Phase 4 - Remove unused material using evidence

- Move `memory/PRD.md` into `docs/requirements.md`, reconcile stale statements and remove the empty memory folder afterward.
- Consolidate useful instructions from `test_result.md`, architecture notes and deployment notes into maintained documentation. Archive old QA reports outside the production deployment.
- Move generated PDF output and scratch files outside the deployment package. Preserve the requested report for the user.
- Store database backups separately from application releases; do not delete the only verified recovery copy.
- Retire `.emergent/`, frontend health-check plugins and the visual-edit dependency only after checking build imports and replacing any still-required platform scheduling/integration behavior. Removing platform scaffolding does not replace object storage.
- Remove Render configuration only after production no longer depends on Render and the rollback arrangement is established.
- Archive image-generation and sample-seeding scripts that are no longer operationally needed. Keep the image optimizer if it remains part of asset maintenance.
- Remove UI primitives/dependencies only after inspecting static/dynamic imports and build configuration, then rebuilding and checking affected screens.
- Check asset references in source, styles, HTML, manifests and database records. Keep mobile/desktop WebP and originals when the image wrapper still expects them. Do not treat similarly named variants as duplicates.
- Consolidate real tests into `tests/` and remove the now-redundant empty root package marker if no test tooling needs it.
- Keep `.git` locally and retain dependency lockfiles. Exclude locally installed dependencies, caches, test output, backups and secrets from release uploads.
- Permit a sanitized `.env.example` explicitly in `.gitignore`; current `.env.*` rules would otherwise ignore it. Include variable names and placeholders only.

Exit gate: each deletion has a no-consumer/replacement explanation, the clean build still passes, and before/after counts distinguish source reduction from deployment exclusions.

## Phase 5 - Make installation and deployment reproducible

- Standardize on npm if the existing npm locks reproduce the application. Resolve the frontend Yarn declaration consistently; do not delete lockfiles to hide resolution problems.
- Use a supported Hostinger runtime verified at implementation time and pin the selected major version consistently with the tested build.
- For the Node target, define a root build command that installs frontend build dependencies and compiles React. Root start should run `node backend/server.js`. Verify the exact Hostinger install/build/start settings on a staging deployment.
- Use the same public origin for website and `/api` where possible. Avoid baking preview backend URLs into the production frontend build.
- Configure MongoDB URI and explicit database name, JWT secret, permitted origins, bootstrap credentials where needed, CRM configuration and persistent storage settings. Frontend variables must contain no server secrets.
- Verify hosting-to-database network access, database user permissions and restart behavior.
- Add lightweight liveness and meaningful database readiness checks; an HTTP process being alive does not prove the database works.
- Ensure deployment restarts cannot erase uploaded media. Retain object storage or use a deliberately managed persistent volume on VPS.
- Update README with local setup, required variables, commands, deployment steps, backup location and recovery instructions.

Exit gate: a fresh staging installation can build and start from committed source/locks, connect to the intended test database, and retain uploads across restart/redeploy.

## Phase 6 - Required acceptance checks

Use isolated fixtures and test storage/CRM configuration. Historical XML/JSON reports do not satisfy these gates.

1. Public pages: home, catalogue, property detail, blogs, blog detail, market intelligence, about and contact render on desktop/mobile; direct deep-link refresh works.
2. Properties: filters, Indian price handling, publication rules, availability and featured listings retain expected behavior; drafts remain private.
3. Authentication: login, logout, refresh, expired sessions, invalid credentials and role restrictions behave correctly through cookies and the existing Bearer fallback. Server-side checks prevent unauthorized writes.
4. Staff management: permitted property/blog create-edit-publish flows, user management, lead status changes and delete restrictions pass.
5. Images: existing URLs load, new images upload, oversized/invalid uploads fail safely, and media survives redeployment.
6. Leads: each form preserves its source and details, writes once per accepted request, and shows useful success/error states. CRM outage does not lose the saved lead; retry/status behavior works without blindly duplicating delivered leads.
7. Blogs/SEO: slugs, sanitized HTML, metadata, canonical URLs and sitemap records remain valid.
8. News: fresh fetch, cache hit, empty feed, remote failure, classification and evergreen fallback are exercised with deterministic test inputs.
9. Data compatibility: existing users authenticate, IDs/slugs remain stable, representative records and collection counts match expectations, and indexes exist where required.
10. Reliability: database failure returns a useful API response; unknown API endpoints never return SPA HTML; startup/restart and pending CRM recovery are checked.
11. Cleanup: clean installation/build succeeds on Linux; no removed-file imports, unintended missing assets or secrets in frontend bundles; dependency/file metrics use the same baseline scope.
12. Campaigns: if Aramya is retained, locate its source and include its public page and lead flow in verification before release.

Exit gate: all required flows pass; any nonblocking pre-existing issue is explicitly documented. Migration regressions must be fixed before cutover.

## Phase 7 - Production cutover and rollback

- Keep the old deployment available until the new deployment is validated. Record its release identifier and routing configuration.
- Prepare a final database/media backup. Keep schema changes additive and compatible with the old runtime wherever possible.
- If moving databases, schedule a controlled write pause or explicitly implemented synchronization, copy final changes, compare records and resume with one authoritative writer. Do not allow two independent databases to accept production leads.
- If reusing the existing database, verify both release versions remain compatible and prevent duplicate background CRM processing during overlap.
- Verify Hostinger staging through a temporary address, TLS behavior and production configuration before changing domain routing.
- Switch routing, then check public pages, authenticated administration, existing media and a controlled lead workflow. Arrange ongoing log/error and CRM-delivery monitoring with an identified owner.
- Roll back traffic if critical login, lead persistence, media access or data-integrity checks fail. Restore the previous application/routing first where compatible.
- Do not blindly restore the pre-release database: that can erase new leads. Preserve and reconcile all writes accepted since cutover; use an explicit recovery procedure if data was corrupted.
- Retire old hosting/runtime only after the agreed observation period, successful backup/restore checks and confirmed rollback readiness.

Exit gate: production checks pass, there is one authoritative backend/data path, recent leads are accounted for, and recovery instructions are verified.

## Implementation order and review boundaries

1. Baseline, API contracts and recovery verification.
2. Chosen backend consolidation and feature parity.
3. Frontend organization and shared behavior cleanup.
4. Proven-unused files/dependencies and documentation cleanup.
5. Hostinger staging and full acceptance checks.
6. Production cutover, observation and retirement of old infrastructure.

Use a separate reviewable commit for each meaningful stage. Prepare deployment artifacts and evidence before requesting any needed production switch authorization. No production messages or real CRM test submissions should be sent without authorization.

Timing and deletion counts should be estimated after Phase 1, when hosting capabilities, storage access, contract differences and the required campaign scope are known.

## Final handover deliverables

- One maintained backend and organized frontend with preserved functionality.
- Updated README, requirements, environment example and Hostinger deployment/recovery instructions.
- Versioned dependency locks and reproducible build/start commands.
- Verified backup location and restore procedure, with no confidential data included in documentation.
- Fresh acceptance evidence and before/after source/deployment metrics.
- Removal/archive manifest and any remaining known issues.

## Hosting references

Confirm plan-specific capabilities in hPanel before implementation; these references were checked during planning on 11 September 2026.

- Hostinger Node.js deployment: https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/
- Hostinger runtime/framework support: https://www.hostinger.com/support/which-programming-languages-and-frameworks-are-supported-at-hostinger/
- Hostinger database support: https://www.hostinger.com/support/which-databases-and-data-tools-are-supported-at-hostinger/
