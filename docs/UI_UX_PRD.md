# ASTITTVA MARKETING — UI & UX Product Requirements Document

Version: 1.0 | Prepared: 11 September 2026 | Status: proposed design and implementation requirements

Product: real estate consulting, property discovery and enquiry management website.

Audience: business owner, UI/UX designer, frontend/backend developers and QA.

## 1. Purpose and evidence

Make it easy for visitors to find suitable properties, understand the offering and request advice, while giving staff a clear interface to manage properties, blogs and enquiries. Preserve Astittva's premium identity without sacrificing readability, navigation or mobile usability.

This PRD is based on the current `web/src` frontend, `api/server.js`, shared site constants and styles. It describes the desired user experience, not a claim that every requirement already works. No live usability testing, production inspection or analytics review was performed for this document.

Current source now uses `web/` and `api/`; older documents reference `frontend/` and `backend/`. Current CSS and Tailwind tokens define a LIGHT theme, despite the older root `design_guidelines.json` describing a dark theme. This PRD adopts the current warm ivory theme as the proposed baseline.

Scope labels:

- **Existing:** a page or behavior is evidenced in current source; runtime verification is still required.
- **Improve:** a proposed UX requirement for an existing feature, not a completed feature.
- **Dependency:** requires backend/content/integration work before the experience can be considered complete.
- **Later:** optional future scope, excluded from the initial release.

Priority labels: **P0** release-critical; **P1** next usability improvement; **P2** optional later enhancement. Unless explicitly marked P1/P2, requirements below are P0 for the UI/UX release.

## 2. Product goals and boundaries

Goals:

1. Visitors understand what Astittva offers and its primary geography from the first screen.
2. Visitors can narrow properties by location, type, budget and other existing filters without losing context.
3. Property pages communicate essential information before asking visitors to enquire.
4. Enquiries are easy to submit, retain their property/source context and receive an honest confirmation.
5. Staff can publish accurate content and process leads with clear statuses and permissions.
6. The interface works on mobile, keyboard and assistive technology, including slow or failed requests.

The site is a discovery and advisory platform. Initial scope does not include property checkout, payments, a customer account portal, saved favourites, property comparisons, live inventory reservation, mortgage calculators, multilingual content or an AI chatbot. These must not be implied by decorative controls.

A site-visit enquiry is a request for coordination, not a confirmed calendar appointment. Add a date/booking interface only when its business process and supporting fields are agreed.

## 3. Users and principal journeys

### U1 — Homebuyer

Needs to match budget, location, property type and possession stage. Journey: homepage -> filtered catalogue -> property details -> request details or WhatsApp. Success: can identify a suitable listing and send an enquiry without assistance.

### U2 — Investor or remote/NRI buyer

Needs clear pricing, location context, credible market information and a way to contact an advisor. Journey: market intelligence/blog -> property or consultation page -> enquiry. Treat geographic expansion as a business vision unless current inventory/service coverage supports it.

### U3 — Returning visitor

Arrives through a shared catalogue or property URL. Filters must survive refresh and sharing; a return from a detail page should preserve the catalogue context and position where feasible.

### U4 — Sales/marketing staff

Needs to locate enquiries, inspect requirements, update lead status and manage permitted content. Primary journey: login -> leads -> enquiry details -> contact action -> status update.

### U5 — Administrator

Needs all staff workflows plus user management and authorized deletion. Primary journey: login -> dashboard -> content/user task -> confirmation and verified result.

## 4. Navigation and information architecture

Public navigation retains: Home (`/`), Properties (`/properties`), Market Intelligence (`/market-intelligence`), Blogs (`/blogs`), About (`/about`) and Contact (`/contact`). Detail pages remain `/properties/:id` and `/blogs/:slug`.

Staff navigation retains `/admin/login`, dashboard `/admin`, properties `/admin/properties`, leads `/admin/leads`, blogs `/admin/blogs` and users `/admin/users`. Property/blog editors retain their existing `new` and `:id/edit` routes. Users is visible only to administrators.

**NAV-01 — Existing / Improve:** header includes the logo/home link, primary links, current-page indication and one prominent “Book a consultation” action. Admin login need not occupy primary visitor navigation.

**NAV-02 — Improve:** mobile menu is a labelled modal/drawer with keyboard focus management, Escape dismissal, a visible close control and focus restoration. Selecting a route closes it. Desktop hover is never the only route to content.

**NAV-03 — Improve:** fixed navigation does not cover headings, form errors or focused controls. Add a skip-to-content link and clear page titles. Provide a helpful unknown-page view with Home and Properties actions.

**NAV-04 — Existing / Improve:** footer contains shared contact details, meaningful navigation and social links. Phone/email actions use their appropriate link types. Show a privacy link only when an approved destination exists; providing that content is a launch dependency for enquiry disclosures.

**NAV-05 — Existing / Improve:** WhatsApp is a secondary assistance channel. It must not overlap forms, mobile navigation or primary actions. Inform users they are opening WhatsApp; preserve a working browser fallback for social links.

Acceptance: all public routes are reachable using keyboard and mobile navigation; direct-link refresh works; current page is announced; no control points to an invented feature.

## 5. Visual identity and reusable design system

### Brand direction

Warm, editorial and premium: generous whitespace, strong property imagery, restrained copper accents, burgundy emphasis and readable dark text. Trust should come from useful property information and authentic brand content.

Use current token values as the starting palette:

- Page background: warm ivory `#FAF8F5`.
- Secondary surface: `#F5F1EC`; cards/form surfaces: `#FFFFFF`.
- Main text: `#1C1C1C`; supporting text: `#5F5F5F`.
- Brand copper: `#B87333`; secondary copper: `#C58A52`.
- Burgundy emphasis: `#5E1F28`; borders: `#E8DED2`.

These are brand starting points, not pre-approved accessible foreground/background pairs. Check actual contrast, including transparency and text over photography. Use darker copper variants or burgundy for text/buttons when necessary. Status colors require a written label or icon, not color alone.

### Typography and spacing

**VIS-01 — Existing / Improve:** Cormorant Garamond for selected editorial headings; Inter for body text, forms and admin work. Poppins may remain for interface headings if needed, but avoid loading redundant font weights. Do not use decorative lettering for property facts or form labels.

**VIS-02 — Improve:** body text starts at 16px with approximately 1.5–1.7 line height; essential metadata at least 14px. Use fluid headings around 32–40px on mobile and 48–64px on desktop. Prevent long property names from clipping.

**VIS-03 — Improve:** use an 8px-based spacing scale, about 20px mobile side padding, wider desktop gutters and a content maximum around 1280px. Editorial reading columns should remain approximately 60–75 characters wide. Admin screens use compact but readable spacing rather than oversized marketing sections.

**VIS-04 — Improve:** establish shared primary, secondary, text-link and destructive button styles. All controls have default, hover, focus, disabled, loading and error states. Match notifications, drawers, menus and editors to the light theme; remove stale dark overrides as part of implementation.

**VIS-05 — Existing / Improve:** use genuine listing imagery where available. Label architectural renders/representative imagery accurately. Keep image aspect ratios stable, provide useful alt text and reserve layout space during loading. Do not remove responsive variants merely to reduce file count.

**VIS-06 — Improve:** subtle transitions may support hierarchy; they must not delay interaction. Respect reduced-motion preferences. Any automatically moving hero that continues beyond five seconds needs an accessible pause/stop mechanism. No autoplay audio.

Core reusable components: site header/footer, navigation drawer, section header, property card, article card, filter control/chip, enquiry form field, alert, toast, skeleton, empty/error panel, confirmation dialog, admin status badge, editor section and upload item.

## 6. Public page requirements

### HOME — Homepage

Status: Existing / Improve. Purpose: establish the proposition and move visitors into discovery or consultation.

Suggested section order:

1. Hero: Astittva identity, concise advisory proposition, relevant geography, “Explore properties” primary CTA and “Book a consultation” secondary CTA.
2. Short trust/service explanation using verifiable statements.
3. Featured properties from published inventory.
4. Featured localities: New Town, Rajarhat and Kolkata, linked to meaningful catalogue filters.
5. Advisory process/value and selected editorial links where content exists.
6. Clearly labelled expansion vision, if retained.
7. Consultation form and shared footer.

**HOME-01:** first mobile screen communicates the service and a clear next action. Photography cannot make the headline or buttons difficult to read.

**HOME-02:** featured cards show image, project name, locality, property type, price/price qualifier and availability when available. Avoid repeating multiple large brand-story sections before visitors reach inventory.

**HOME-03:** location prices must be based on maintained content or actual matching inventory; do not present static illustrative prices as live starting prices. Unsupported superlatives, approval claims, testimonials or statistics must be removed or verified by the owner.

**HOME-04:** if featured loading fails, offer a retry or catalogue navigation; do not silently imply there are no properties. If the published collection is truly empty, show an honest consultation path without fabricated listings.

Acceptance: users can reach the catalogue or consultation in one intentional action; featured cards open the correct records; every location CTA produces an appropriate filter.

### CAT — Property catalogue

Status: Existing / Improve. Existing filters: location, property type, budget, builder, availability and category.

**CAT-01:** display page title, concise context, result count and active filters. Present location/type/budget first; group remaining filters as additional options on narrow screens.

**CAT-02:** preserve query-string filters. Active chips remove individual selections; “Clear all” resets all filters. Distinguish visitor-facing “Availability” from internal “Publication status.”

**CAT-03:** desktop changes update results with a visible loading state. On mobile use a filter drawer with draft selections and explicit “Apply filters”; cancellation leaves committed filters unchanged. This mobile interaction is a proposed improvement to the current controls.

**CAT-04:** do not show stale results as if they match newly selected filters. Handle requests finishing out of order. Avoid returning focus to the top of the page after every update.

**CAT-05:** cards prioritize name, locality, price and stage, with one obvious “View details” action. Use INR, lakh/crore notation and consistent “From”/“On request” wording. Never show missing price as zero or missing area/bedrooms as factual zeros.

**CAT-06:** no matches: state that the selected combination has no results, show selected filters and offer “Clear filters” or “Ask an advisor.” API failure: different message with retry, preserving selections.

**CAT-07 — P1 / Dependency:** add pagination or “Load more” when inventory exceeds the displayed page size; the backend must provide reliable pagination/count information. Never label a limited loaded subset as the total catalogue.

Acceptance: combining, removing, refreshing and sharing filters produces the expected listing set. No-match and request-failure screens are distinguishable. Cards are usable without hover.

### PROP — Property detail

Status: Existing / Improve.

**PROP-01:** content order is breadcrumb/back context, project name/locality, price/stage, image gallery, key facts, description, amenities, location/map, and enquiry. Desktop may use a sticky enquiry card beside content; mobile stacks content with a compact enquiry action that never covers it.

**PROP-02:** key facts include builder, property type/category, bedrooms, area with units, availability, possession information and RERA identifier when supplied. Distinguish publication state from project availability. Avoid unsupported legal or investment assurances.

**PROP-03:** gallery supports thumbnail selection, labelled previous/next buttons and keyboard use. Swiping may supplement buttons. Broken or missing images receive an intentional fallback with no layout collapse.

**PROP-04:** hide an unavailable map or offer a textual locality instead of an empty frame. Only display brochure/floor-plan/download controls when a real asset and supporting flow exist; these are not confirmed current capabilities.

**PROP-05:** “Request details” includes the property identity visibly and passes the record/source context to the enquiry flow. WhatsApp may use the project name and URL, but must not copy unsubmitted personal form data into a third-party message.

**PROP-06:** genuinely unavailable/not-found listing: explain and link back to properties. Network/service failure: offer retry; do not falsely state that the property does not exist.

Acceptance: visitors can identify location, price qualifier and availability before submitting a form; gallery controls are accessible; a saved enquiry references the property that was viewed.

### FORM — Consultation, contact and property enquiries

Status: Existing / Improve. Submission remains a website enquiry, not a guaranteed booking or CRM delivery confirmation.

**FORM-01:** use one shared identity/validation pattern. Existing contracts require name information, phone and email; retain required email for this release unless frontend, API and CRM validation are changed together. Consultation currently captures first/last name and country code, while other forms use full name; normalize this intentionally without forcing users to repeat information.

**FORM-02:** show persistent labels, required/optional text, suitable autocomplete/input modes and examples. Country code defaults to +91 but remains editable. Support reasonable name/phone formats rather than accepting only a narrow assumed audience.

**FORM-03:** primary visible fields: name, phone and email. Optional qualification fields: budget, preferred locality, purpose, type, timeline and message. Consultation may reveal these under “Tell us more”; a property enquiry should not ask users to select the property again. Making optional fields required needs an explicit business reason.

**FORM-04:** validate on blur or submit, identify the affected field, give a corrective message and focus the first invalid field after submission. Preserve all values on error. Avoid errors before the user has interacted.

**FORM-05:** provide a clear submission state (“Sending…”), suppress repeated clicks while pending, and show confirmation only after the server acknowledges persistence. Timeouts with an unknown outcome should say confirmation was not received; do not falsely promise the request was never saved.

**FORM-06:** confirmation copy: “Thank you. Your enquiry has been received. Our team will contact you using the details provided.” Add a response-time promise only after the business confirms its service commitment. Do not show internal CRM/API terminology to visitors.

**FORM-07:** explain why contact details are collected and link to approved privacy information. Marketing subscription consent, if introduced later, is separate and optional. No preselected promotional subscription. Approved wording/content is a business dependency, not a completed legal review.

**FORM-08:** internal CRM failure must not negate a successfully saved website enquiry. Staff delivery warnings belong in admin tools only when backed by actual delivery status.

Acceptance: invalid inputs receive useful inline feedback; retry preserves values; rapid clicks do not create parallel UI submissions; success reflects saved data; each source/property field survives the journey. Backend retry/deduplication semantics must be verified separately.

### NEWS — Market Intelligence

Status: Existing / Improve; live fetching is a Dependency in the current API snapshot.

**NEWS-01:** show a concise page introduction, trending stories, geographic/category filters and a readable article feed. Existing editorial areas for investment insights, opportunities, tracked markets and expansion must remain clearly distinguishable from live reporting.

**NEWS-02:** cards show title, publisher/source, publication date when known, relevant category/location and “Read at source” for external articles. Source links should be discoverable and safe to open.

**NEWS-03:** distinguish fetched news, cached news and curated evergreen content. If no reliable fetch timestamp exists, omit “Updated now.” A fetch timestamp is not the article's publication date.

**NEWS-04:** if no articles match a selected filter, say so. Related/general fallback content may appear in a separately labelled section; it must not masquerade as an exact match. Live-feed failure should preserve useful content while explaining that the latest feed is temporarily unavailable.

**NEWS-05:** market opportunity/return claims must have a source or be removed. Avoid suggesting that editorial content guarantees investment outcomes.

Acceptance: users can tell what they are reading, where it came from and whether it is fresh or curated. Switching filters never silently substitutes unrelated results under the selected label.

### BLOG — Blog listing and article

Status: Existing / Improve.

**BLOG-01:** listing cards show title, excerpt, image, author/date when available and one article link. Use consistent image ratios and readable title wrapping. Empty listing and fetch failure require separate states.

**BLOG-02:** article page shows title, author/date, featured image and a narrow reading column. Support headings, lists, quotes and image captions; sanitize author-supplied HTML. Long content must not overflow on mobile.

**BLOG-03:** retain slug-based URLs, page metadata and article sharing through the browser's ordinary URL behavior. A contextual consultation link may follow the article without interrupting reading.

**BLOG-04:** article unavailable and transient load error have different recovery messages. Only published content is public.

Acceptance: a published article can be reached through the listing and a direct URL; body formatting remains legible at mobile widths; draft HTML does not appear publicly.

### ABOUT — About Astittva

Status: Existing / Improve.

Explain the advisory service, primary geography, approach, values and consultation process using short sections. Add people, credentials or testimonials only when authentic content and permission are available. Separate present service coverage from expansion vision. End with a clear consultation action.

Acceptance: a first-time visitor can explain what the business does, where it operates and how to contact it without relying on slogans alone.

### CONTACT — Contact page

Status: Existing / Improve; uses FORM requirements.

Present phone, email, office address, WhatsApp and the enquiry form. Use shared contact constants to prevent inconsistent details. Show office map/directions only for a verified destination. On mobile, keep contact methods above or near the form; do not force users to scroll through a large map first. Publish working hours only after business confirmation.

Current source values for owner verification: +91 92303 74700; sales@astittva.in; PS IXL Building, 5th Floor, Room 511, Biswa Bangla Sarani, Atghara, New Town, Kolkata, West Bengal 700136.

Acceptance: phone, email and WhatsApp actions resolve correctly; address matches approved copy; enquiry qualification fields are optional unless documented otherwise.

## 7. Admin experience requirements

### ADMIN — Shared shell and permissions

**ADMIN-01 — Existing / Improve:** persistent desktop navigation and accessible mobile drawer. Show current user/role, clear page title and logout. Use readable controls and compact information hierarchy.

**ADMIN-02 — Existing / Improve:** preserve current roles. Admin, sales and marketing can access staff workflows for properties, blogs, leads and statistics. Only admin manages users and deletes protected records under the current API. Do not invent narrower sales/marketing permissions without changing the agreed authorization contract.

**ADMIN-03 — Improve:** hide unavailable actions where useful, but enforce permissions server-side. Unauthorized direct routes provide a clear message. Session expiry leads to re-authentication with a safe return route; protect in-progress edits and do not persist sensitive lead data to public browser storage by default.

**ADMIN-04 — Improve:** list failures must not look like empty databases. Show loading, empty, error/retry and permission states consistently. Successful actions update the relevant record visibly; failed optimistic changes must revert.

### AUTH — Staff login

**AUTH-01:** persistent email/password labels, show/hide password, appropriate autocomplete and support for paste/password managers. Submit using Enter; indicate pending login.

**AUTH-02:** incorrect credentials receive a neutral message; rate limiting/session problems receive an actionable explanation without exposing internals. Avoid fake password-reset controls when no reset flow exists. Provide an approved administrator support route if needed.

Acceptance: all permitted roles can log in and land on an allowed page; failed attempts preserve email but do not expose account existence; keyboard-only use works.

### DASH — Dashboard

**DASH-01:** retain existing counts: total properties, published properties, total leads, new leads and users. Explain labels and distinguish a confirmed zero from loading/unavailable data.

**DASH-02 — P1:** make count cards useful navigation shortcuts when the destination supports the requested filter. Do not add revenue, conversion or trend charts without actual data and definitions.

Acceptance: displayed counts match API results; failed loading provides retry; no fabricated statistics appear.

### EDIT-PROP — Property management

**EDIT-PROP-01:** list rows show project, locality, price, availability and publication state with explicit edit/publish/unpublish actions. Admin delete uses a confirmation naming the record and stating the consequence. Publishing and deleting must never share indistinguishable icons.

**EDIT-PROP-02:** group the editor into basic details, pricing, media, specifications/amenities, location and publication. Keep required labels visible. Save draft and publish are distinct actions; validation must align with the server's actual required fields.

**EDIT-PROP-03:** separate “Publication: Draft/Published/Unpublished” from “Availability: Ready to move/Under construction/New launch/Sold out.” Confirm the listing is no longer public after unpublishing.

**EDIT-PROP-04 — Dependency:** uploads show selected filename, thumbnail, progress/pending state, removal and retry. Explain accepted types/limits using the implemented API policy. Failed uploads must not be recorded as successful image references.

**EDIT-PROP-05 — Improve:** warn before leaving with unsaved edits. Keep form data when saving fails. Prevent overlapping save requests; confirm only after persistence.

**EDIT-PROP-06 — P1:** add list search/filtering once data volume warrants it. Search over a limited loaded subset must be labelled, or supported by a server query.

Acceptance: staff creates, saves, reopens, edits and publishes an accurate listing; unavailable fields do not render as misleading public values; upload and authorization failures preserve the form.

### EDIT-BLOG — Blog management

**EDIT-BLOG-01:** list title, author, date and draft/published status. Offer edit, publication controls, public-view link when published and authorized delete.

**EDIT-BLOG-02:** editor includes title, slug, summary, featured image, body, author/date and grouped SEO fields. Keep the existing HTML editor with sanitized preview for initial scope; a rich-text editor is P2, not presumed implemented.

**EDIT-BLOG-03:** draft save and publish are explicit. Explain slug purpose and warn that changing a published slug can break shared links; preserve the old slug or implement redirects before changing it.

**EDIT-BLOG-04:** a date field alone does not mean scheduled publication. Do not label it “Schedule” unless background scheduling and timezone behavior exist.

Acceptance: preview matches safe public rendering, failures preserve edits, and publishing exposes only intended content at its working URL.

### LEAD — Lead inbox

**LEAD-01 — Existing / Improve:** retain statuses New, Contacted, Qualified and Closed. Keep business outcome status separate from CRM delivery status. “Closed” must not be presented as a sale unless the business defines it that way.

**LEAD-02 — Improve:** each lead has a detail view/panel with received date, contact information, source, property interest, budget/locality/purpose/timeline and message when collected. Missing optional fields show “Not provided.” Mobile users must be able to open all details rather than permanently losing hidden table columns.

**LEAD-03 — Improve:** staff can use explicit phone/email/WhatsApp links and update status with visible confirmation. Clicking a contact link does not automatically prove contact occurred or change the status.

**LEAD-04 — P1:** search and filters for status/source/date; preserve position and selections after an update. Requires a backend contract if results are paginated or incomplete.

**LEAD-05 — P1 / Dependency:** if CRM delivery fields and authorized retry are available, show plain staff labels such as Pending, Delivered or Needs attention, with last attempt and safe retry. Omit the panel when unsupported; do not display invented success.

Acceptance: a staff user can find a newly saved enquiry, read its message on mobile and update its status. Sales/marketing cannot perform admin-only deletion. Website-save and CRM-delivery outcomes remain distinct.

### USER — Staff account management

**USER-01:** administrators see name, email and role, with create and permitted delete actions. Display role descriptions accurately. Preserve existing protection against deleting the current account.

**USER-02:** user creation errors explain duplicate email/invalid fields where allowed. Never show passwords in lists or toasts. Do not add role editing or password reset controls unless the backend supports them.

Acceptance: non-admin users cannot access account management through navigation or direct URL/API requests; successful creation displays a persisted user record.

## 8. Responsive, accessibility and performance requirements

### Responsive behavior

Design from narrow screens upward and test representative widths of 320, 375, 768, 1024 and 1440 CSS pixels. These are QA sizes, not a requirement for five independent layouts.

- Public content has no accidental horizontal overflow. Wide admin tables may scroll within a labelled region, but core lead/contact information must also be accessible in a mobile detail view.
- Forms use one column on mobile; related short fields may pair only when labels/input values remain readable.
- Property grids scale from one to two/three columns as space permits. No fixed card height may hide essential information.
- Sticky controls account for device safe areas and the on-screen keyboard. They do not cover submit buttons or error messages.
- Test portrait/landscape, text resizing and long content, not only standard mockup examples.

### Accessibility target

Target WCAG 2.2 AA. This is a release objective, not a certification. Requirements include keyboard operation, visible/unobscured focus, meaningful labels/headings, accessible status announcements, errors associated with fields, alt text and modal focus management. Normal text needs at least 4.5:1 contrast; qualifying large text 3:1; meaningful UI boundaries/states need applicable non-text contrast. Adopt 44×44 CSS-pixel touch targets as the product preference, while assessing WCAG's actual minimum criterion and exceptions separately. Test reflow and text resizing, and provide movement controls/reduced-motion support. Reference: [W3C WCAG quick reference](https://www.w3.org/WAI/WCAG22/quickref/).

### Performance target

Target Core Web Vitals at the 75th percentile of real visits: LCP at or below 2.5 seconds, INP at or below 200 milliseconds and CLS at or below 0.1. These are proposed acceptance targets, not current measurements. Use lab testing before release and field data after sufficient traffic. Reference: [web.dev Web Vitals](https://web.dev/articles/vitals).

Retain responsive media, reserve image space, prioritize only essential first-screen assets, lazy-load below-fold media/admin routes and avoid excessive font weights. Requests need visible progress and useful failure handling. Slow services must not leave blank pages or endless spinners.

## 9. Content and microcopy rules

- Use ASTITTVA MARKETING consistently; keep the double T spelling.
- Prefer clear actions: “Explore properties,” “View details,” “Request details,” “Send enquiry,” “Save draft,” “Publish,” “Retry.”
- Use “Book a consultation” only as an enquiry CTA, with confirmation that does not imply a reserved appointment.
- Write “From ₹1.2 Cr” only when that value is supported. Use “Price on request” when the business intentionally withholds price.
- Never disguise an API error as “No properties found.” Suggested error: “We couldn't load properties. Your filters are saved. Try again.”
- Delete confirmation names the item: “Delete [project name]? This removes the listing.” Do not promise recoverability unless undo/restore exists.
- Do not publish fabricated scarcity, views, customer counts, verification badges, returns, testimonials or availability.
- Maintain one source for contact details and catalogue option labels. Reconcile “Villa / Standalone” and “Villa,” or other synonyms, with stored values before renaming them.

## 10. Measurement and usability validation

No analytics baseline was supplied. These are proposed metrics and research tasks, not observed results or guaranteed uplifts.

Measure property-detail visits leading to confirmed enquiries, form starts/submissions/errors, filter use/no-result frequency, contact-link clicks and staff task completion. Count enquiries using server-confirmed saves, not button clicks. WhatsApp clicks are intent signals, not completed conversations.

Suggested events: `property_view`, `filter_apply`, `enquiry_start`, `enquiry_validation_error`, `enquiry_submit_success`, `enquiry_submit_failure`, `contact_click`, `admin_save_success`, `admin_save_failure`. Use page/source, record identifier and non-sensitive error category where appropriate. Never include names, emails, phone numbers or message bodies in analytics. Select tooling and consent behavior separately.

Proposed moderated study: five representative visitors and three staff participants. Visitor tasks: find a property within stated criteria, explain price/availability, submit a test enquiry and identify the source/freshness of a news item. Staff tasks: publish a test listing, inspect a mobile lead and publish a draft article.

Proposed initial usability gate: at least four of five visitors complete discovery/enquiry without facilitator intervention; all staff participants complete assigned permitted tasks without accidental publication/deletion. Record task times and observed confusion to establish a baseline; these small samples guide iteration, not statistical conversion claims.

## 11. Implementation dependencies and current gaps

1. **Build paths:** the inspected root `package.json` still references root `server.js` and `frontend`, while current files are in `api/` and `web/`. Correct and verify build/start paths before release; this PRD does not perform that work.
2. **Uploads:** current editors call upload/file APIs, but these routes were not found in the inspected `api/server.js`. Working persistent storage and compatible endpoints are release dependencies for editors using images.
3. **CRM:** current Node source does not establish the historical Python forwarding/retry workflow. Do not claim delivery or expose retry UI until implemented and tested.
4. **News:** current Node endpoints read MongoDB cache. Installing an RSS package does not establish live aggregation; verify fetching/refresh separately before using “live” labels.
5. **SEO:** verify sitemap generation and hosting routing independently of per-page metadata components.
6. **Theme drift:** older design JSON and some component overrides use dark styling; reconcile against approved light tokens and contrast checks.
7. **Missing campaign source:** Aramya is not in the current route map. Include it only after the owner confirms scope and source is located; no new campaign implementation is assumed.
8. **Business content:** approve contact details, claims, service coverage, privacy copy, response-time promise and any imagery permissions.

These findings are static-source observations at preparation time and should be rechecked before implementation. The Hostinger implementation plan remains the companion for deployment/data migration; this document owns user-facing behavior.

## 12. Release priorities and acceptance checklist

### P0 — Initial UI/UX release

- [ ] Public navigation and every existing page/detail/editor route work on desktop and mobile.
- [ ] Light-theme tokens, typography, controls and feedback are consistent and readable.
- [ ] Property filters preserve/share state; loading, empty, error and missing-record states are distinct.
- [ ] Property facts, prices, media and enquiry context are accurate.
- [ ] All enquiry forms have labels, useful validation, retained error-state data and server-confirmed success.
- [ ] News freshness/fallback labels are honest; blogs are readable and safely rendered.
- [ ] Staff login, role restrictions, content editing/publication and lead/user management work as specified.
- [ ] Staff can access full lead details on mobile; failed data requests are recoverable.
- [ ] Upload-dependent workflows have working persistent storage, or the release is blocked until they do.
- [ ] Keyboard, focus, contrast, screen-reader form feedback and reduced-motion checks pass.
- [ ] Long text, missing images, network failures, session expiry and denied permissions are tested.
- [ ] Production build/deep links/API routing are verified; no broken controls advertise unsupported functionality.
- [ ] Business copy/contact/privacy content is approved and technical dependencies are resolved.

### P1 — Follow-up usability work

Lead search/filtering, catalogue pagination, dashboard shortcuts, staff list filtering and truthful CRM delivery tooling after the required backend support exists.

### P2 — Separately scoped enhancements

Rich-text authoring, saved properties, comparisons, customer accounts, multilingual content, calendar booking or additional market tools. Each requires business prioritization and a separate data/interaction contract.

## 13. Design handover deliverables

1. Approved token/type/spacing specification and reusable component state library.
2. Desktop/mobile wireframes for every public page template, admin list/editor template and lead detail view.
3. Clickable prototypes for discovery-to-enquiry and staff publication/lead workflows.
4. High-fidelity layouts including loading, empty, error, success, unauthorized and unsaved-edit states.
5. Field rules, CTA destinations, responsive annotations and approved copy.
6. Requirement-to-test checklist using the identifiers in this document; usability findings and implementation issue list.

Definition of done: P0 requirements are implemented and verified with representative data on the deployed test environment, user-facing dependencies are functional, and any deferred P1/P2 items are documented without misleading controls in the released interface.

## 14. Source references and decisions to confirm

Local evidence: `web/src/App.js`; `web/src/index.css`; `web/tailwind.config.js`; `web/src/lib/site.js`; `web/src/constants/siteData.js`; public/admin pages; `web/src/components/LeadForm.jsx`; `web/src/components/Header.jsx`; `web/src/layouts/AdminLayout.jsx`; `web/src/lib/sanitize.js`; `api/server.js`; root `package.json`; `design_guidelines.json`.

Owner decisions: confirm light theme, enquiry response-time wording, required qualification fields, current coverage/claims, privacy content and Aramya scope. Defaults in this PRD preserve current core fields and current light styling; unconfirmed claims and new feature promises are excluded.

Recommended review order: business owner confirms scope/content -> designer validates journeys and hierarchy -> developer validates API/field feasibility -> QA maps acceptance criteria -> owner reviews the working test release.
