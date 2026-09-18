from pathlib import Path
import os, re, json, collections, xml.etree.ElementTree as ET
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from pypdf import PdfReader

ROOT=Path(r'E:\Astittva Emergent version 4')
OUT=ROOT/'output/pdf'; OUT.mkdir(parents=True,exist_ok=True)
skip={'.git','node_modules','__pycache__','.venv','venv','build','dist','output','tmp'}
files=[]; dirs=[]
for base, ds, fs in os.walk(ROOT):
    ds[:]=sorted(d for d in ds if d not in skip)
    rel=Path(base).relative_to(ROOT).as_posix()
    if rel!='.': dirs.append(rel)
    for f in sorted(fs): files.append((Path(base)/f).relative_to(ROOT).as_posix())

desc={
'server.js':'Node/Express API entry point. Handles authentication, property and blog CRUD, lead storage, user management, statistics, cached news and serving a compiled React site.',
'db.js':'Reusable MongoDB connection pool, environment loading, database-name selection and retry cooldown for the Node server.',
'package.json':'Root Node dependencies and commands: start Express, build the frontend, and run the database connection test.',
'README.md':'Root documentation placeholder; currently contains only an instruction heading.',
'render.yaml':'Render deployment blueprint selecting backend/server.py through Gunicorn/Uvicorn, with environment variables and health probe.',
'design_guidelines.json':'Brand and UI design guidance for typography, colors, layout and visual presentation.',
'test_result.md':'Development/testing handoff notes and historical verification context; not a current test run.',
'.gitconfig':'Repository-provided Git configuration file; presence alone does not establish that Git loads it.',
'.gitignore':'Ignore patterns controlling which generated/local files Git normally excludes.',
'backend/server.py':'Configured FastAPI entry point. Defines its own models, helpers and routes, including uploads, sitemap, CRM forwarding, RSS news and database index startup work.',
'backend/config.py':'Separate configuration/database module used by modular backend helpers; duplicates configuration also defined by server.py.',
'backend/auth.py':'Modular password hashing, JWT/cookie authentication and staff/admin role checks.',
'backend/models.py':'Modular Pydantic request/response schemas for users, properties, leads and blogs; includes serialization helpers.',
'backend/storage.py':'Modular object-storage initialization, upload and download helpers using the Emergent storage service.',
'backend/crm_service.py':'Maps saved website enquiries to CRM webhook payloads, forwards with timeout/retry handling, and reports delivery results. Requires CRM configuration.',
'backend/news_service.py':'Fetches Google News RSS topics, classifies articles, merges/deduplicates cached items and retains last-known-good results. Cache TTL is 3 hours.',
'backend/seed_properties.py':'Utility to insert sample property records into MongoDB; changes data when executed.',
'backend/Dockerfile':'Builds a container image for the Python backend and declares its execution environment.',
'backend/.dockerignore':'Excludes unnecessary/local files from the backend Docker build context.',
'backend/Procfile':'Process command for hosting the Python API.',
'backend/requirements.txt':'Python runtime dependency list for API, database, authentication and integrations.',
'backend/requirements-dev.txt':'Additional Python development/test dependencies.',
'frontend/src/App.js':'Root route map, lazy page loading, public/admin layouts, protected routes, authentication provider and toast/SEO providers.',
'frontend/src/index.js':'Browser entry point that mounts the React application.',
'frontend/src/index.css':'Global styling, brand typography, utility rules and visual design foundation.',
'frontend/src/App.css':'Application-level CSS rules layered over the global styles.',
'frontend/src/context/AuthContext.jsx':'Shares logged-in user state and login/logout/session lifecycle with React components.',
'frontend/src/lib/api.js':'Axios client: /api URL selection, cookies, local-storage Bearer fallback, 30-second timeout, readable errors and file URL generation.',
'frontend/src/lib/sanitize.js':'DOMPurify allowlist for blog HTML; hardens links opening new browser tabs.',
'frontend/src/lib/formatters.js':'Formats Indian-locale dates and relative time, strips HTML text, and generates URL slugs.',
'frontend/src/lib/utils.js':'Shared utility for composing and merging UI class names.',
'frontend/src/lib/site.js':'Shared brand/contact/site constants consumed by the interface.',
'frontend/src/constants/siteData.js':'Reusable site data and option lists for website content.',
'frontend/src/constants/testIds.js':'Shared test-selector constants or compatibility exports for UI automation.',
'frontend/src/constants/testIds/index.js':'Exports grouped test-selector constants.',
'frontend/src/constants/testIds/home.js':'Stable test identifiers for homepage elements.',
'frontend/src/constants/testIds/auth.js':'Stable test identifiers for authentication elements.',
'frontend/src/data/evergreenNews.js':'Bundled editorial fallback articles shown when live/cached market news is unavailable or has no matching results.',
'frontend/src/hooks/use-toast.js':'Reusable toast notification state and actions for the component system.',
'frontend/src/layouts/PublicLayout.jsx':'Shared public-page shell with navigation, footer and site-wide presentation components.',
'frontend/src/layouts/AdminLayout.jsx':'Shared admin navigation and content outlet for staff workflows.',
'frontend/src/components/LuxImage.jsx':'Responsive picture wrapper selecting desktop/mobile WebP siblings with original-image fallback and lazy/eager loading.',
'frontend/src/components/LeadForm.jsx':'Reusable consultation/contact/property enquiry forms, submission state, validation feedback and POST /api/leads calls.',
'frontend/src/components/ProtectedRoute.jsx':'Restricts frontend navigation to authenticated users and optional allowed roles; backend authorization remains necessary.',
'frontend/src/components/Seo.jsx':'Per-page metadata and search/social presentation support.',
'frontend/src/components/CinematicHero.jsx':'Homepage cinematic image slideshow and hero presentation.',
'frontend/src/components/AmbientGlow.jsx':'Reusable decorative ambient background treatment.',
'frontend/src/components/ExpansionRoadmap.jsx':'Presents geographic expansion/brand roadmap content; not an operational expansion tracking system.',
'frontend/src/components/FloatingWhatsApp.jsx':'Persistent WhatsApp contact shortcut.',
'frontend/src/components/Header.jsx':'Public navigation and responsive header.',
'frontend/src/components/Footer.jsx':'Shared footer with brand, navigation and contact information.',
'frontend/src/components/PropertyCard.jsx':'Reusable property summary card linking into listing details.',
'frontend/src/components/ScrollToTop.jsx':'Resets scroll position on client-side route navigation.',
'frontend/src/components/admin/StatusBadge.jsx':'Consistent visual labels for administrative record statuses.',
'frontend/src/components/admin/AdminPageHeader.jsx':'Reusable title/action header for admin pages.',
'frontend/package.json':'React UI dependencies, frontend scripts and local API proxy configuration.',
'frontend/README.md':'Frontend setup/scaffold documentation.',
'frontend/craco.config.js':'Customizes Create React App build tooling and aliases/plugins.',
'frontend/tailwind.config.js':'Tailwind theme tokens and stylesheet source scanning.',
'frontend/postcss.config.js':'CSS transformation plugin configuration.',
'frontend/jsconfig.json':'JavaScript editor/compiler path configuration.',
'frontend/components.json':'UI component generator configuration.',
'frontend/public/index.html':'HTML shell into which the React application is mounted.',
'frontend/public/robots.txt':'Instructions for search-engine crawlers.',
'frontend/public/site.webmanifest':'Browser application metadata and icon references; does not establish offline support.',
'frontend/plugins/health-check/webpack-health-plugin.js':'Build/development health-check plugin integrated with webpack.',
'frontend/plugins/health-check/health-endpoints.js':'HTTP health endpoint helpers for frontend development tooling.',
'scripts/optimize_images.py':'Generates desktop and mobile WebP assets from original website images.',
'scripts/test_db_connection.js':'Node database connectivity diagnostic invoked by the root npm test command.',
'scripts/test_server_api.js':'Express integration checks for health, API root, authentication/404 behavior and SPA fallback.',
'docs/ARCHITECTURE.md':'Historical architecture/business report. Useful context, but several details differ from this checkout.',
'docs/RENDER_DEPLOYMENT.md':'Instructions for configuring and deploying the Python backend on Render.',
'memory/PRD.md':'Product requirements and accumulated project decisions; intent/history rather than proof of deployed behavior.',
'.emergent/emergent.yml':'Emergent platform project configuration.',
'.emergent/system_deps.txt':'Platform-level system dependency declarations.',
'.emergent/cron/dispatch_webhook.sh':'Dispatches configured scheduled webhook requests using environment-provided settings.',
'.emergent/cron/watch_crons.sh':'Checks cron configuration changes and asks the preview service to reconcile schedules.',
'.emergent/cron/webhook_crond.sh':'Starts and restores the platform webhook cron daemon under process supervision.',
'.emergent/cron/webhook-crons':'Persisted platform-generated crontab entries.',
'.emergent/cron/applied.hash':'Tracks the last applied cron configuration hash.',
'.emergent/markers/.restore-complete':'Platform marker indicating a restoration step completed.'}
pages={
'HomePage':'Brand landing page, featured properties, location/brand sections and consultation lead capture.',
'PropertiesPage':'Property catalogue with URL-based filters for location, type, budget, builder, availability and category; responsive filter controls.',
'PropertyDetailPage':'Property gallery, pricing, location, specifications, amenities and property-specific enquiry submission.',
'MarketIntelligencePage':'Trending news and geographic/category filtering with live API requests and bundled fallback content.',
'AboutPage':'Brand story and real estate advisory positioning.',
'ContactPage':'Office/contact information and enquiry form.',
'BlogsListPage':'Published editorial/blog listing with links to articles.',
'BlogDetailPage':'Loads an article by slug and displays sanitized HTML plus article metadata.',
'AdminLoginPage':'Staff email/password login and validation feedback.',
'AdminDashboardPage':'Loads API statistics for properties, leads and users.',
'AdminPropertiesPage':'Staff property listing with publication-state changes and permitted deletion.',
'AdminPropertyFormPage':'Creates/edits property content, image uploads, amenities and publication details.',
'AdminLeadsPage':'Lead inbox, enquiry details, status changes and permitted deletion.',
'AdminUsersPage':'Admin-only staff account creation, role selection and account deletion.',
'AdminBlogsPage':'Lists editorial content, changes publication status and deletes permitted records.',
'AdminBlogFormPage':'Creates/edits blog HTML, slug, image and SEO fields with preview and upload support.'}
routerdesc={'auth':'login/logout/session refresh and user management','properties':'public property search/detail and staff listing CRUD','blogs':'public blog summaries/detail and staff editorial CRUD','leads':'lead capture, status management and CRM delivery retry','files':'staff file uploads and public stored-file access','news':'news feeds, grouping, diagnostics and staff refresh','seo':'dynamic sitemap generation','stats':'admin dashboard counts'}
testdesc={'backend_test':'General API/authentication/property/lead regression suite','test_market_intelligence':'Market news feeds and classification checks','test_performance':'Backend performance-related regression checks','test_blogs':'Public/admin blog lifecycle tests','test_aramya_leads':'Aramya campaign lead submission and CRM-related regression checks'}
def explain(p):
    if p in desc:return desc[p]
    path=Path(p); stem=path.stem; name=path.name
    if p.startswith('frontend/src/pages/'):return pages.get(stem,'Page implementation; see source for route-specific presentation.')
    if p.startswith('backend/routers/') and stem in routerdesc:return 'Modular routes for '+routerdesc[stem]+'. Present in source, but not imported/mounted by the configured server.py entry point.'
    if p.startswith('backend/tests/'):return testdesc.get(stem,'Python test support')+'. Test code exists; not executed for this report.'
    if name=='__init__.py':return 'Python package marker; enables package/module organization.'
    if name=='.gitkeep':return 'Empty placeholder preserving this directory in version control.'
    if name=='package-lock.json':return 'Records the resolved npm dependency tree and integrity data for reproducible installations.'
    if name=='.gitignore':return 'Local Git ignore rules for generated/developer files.'
    if p.startswith('frontend/src/components/ui/'):return 'Reusable '+stem.replace('-',' ')+' UI primitive/wrapper. Library availability does not mean it is used on every page.'
    if p.startswith('backend/gen_'):return 'One-off image generation utility for '+stem.removeprefix('gen_').replace('_',' ')+'. Produces visual assets; not a visitor-facing AI feature.'
    if p.startswith('backups/'):
        if name.endswith('.bson'):return 'MongoDB binary backup of the '+stem+' collection. Historical snapshot; contents were not decoded or exposed.'
        if name.endswith('.metadata.json'):return 'Backup metadata/index definitions for the '+name.split('.')[0]+' collection; not application execution code.'
        return 'MongoDB backup snapshot metadata; retained for restore context.'
    if p.startswith('test_reports/iteration_'):return 'Historical iteration '+stem.split('_')[-1]+' QA report: findings and handoff notes; not fresh verification.'
    if p.startswith('test_reports/pytest/') and path.suffix=='.xml':return 'Saved pytest/JUnit results for '+stem.replace('_',' ')+'. Historical evidence only.'
    if p.startswith('frontend/public/images/'):
        subject=stem.replace('-mobile','').replace('_',' ').replace('-',' ')
        variant='mobile-optimized WebP' if '-mobile' in stem else ('desktop WebP' if path.suffix=='.webp' else 'original image')
        return subject.capitalize()+': '+variant+' asset for property/brand/location visuals. Usage depends on component references.'
    if name.startswith('favicon') or name=='apple-touch-icon.png':return 'Brand icon for browser tabs, shortcuts or home-screen use at the indicated size.'
    if name.startswith('.env'):return 'Environment configuration. Values intentionally omitted from this report.'
    return 'Supporting project file. Purpose not conclusively established by static inspection; review this source before changing it.'

folderdesc={'.emergent':'Managed development-platform configuration and cron support.','.emergent/cron':'Webhook scheduling scripts and persisted cron state.','.emergent/markers':'Platform lifecycle markers.','backend':'Python API, integrations, image utilities and backend tests.','backend/routers':'Modular API route implementations; not wired into the configured monolithic entry point.','backend/tests':'Python API regression test source.','backups':'Historical database dumps; not the live database.','docs':'Architecture and deployment documentation.','frontend':'React browser application and frontend build configuration.','frontend/public':'Static HTML shell, icons and public media.','frontend/public/images':'Location/brand images with optimized variants.','frontend/public/images/luxe':'Luxury property and landmark visual assets.','frontend/plugins':'Frontend build/development extensions.','frontend/plugins/health-check':'Webpack development health checks.','frontend/src':'Application source code.','frontend/src/components':'Shared website components.','frontend/src/components/admin':'Reusable admin presentation components.','frontend/src/components/ui':'Reusable UI primitive library.','frontend/src/constants':'Shared values and test selectors.','frontend/src/constants/testIds':'Grouped test identifiers.','frontend/src/context':'Shared authentication state.','frontend/src/data':'Bundled fallback editorial data.','frontend/src/hooks':'Reusable React state hooks.','frontend/src/layouts':'Public and admin page shells.','frontend/src/lib':'API, formatting, HTML sanitization and other utilities.','frontend/src/pages':'Public visitor page implementations.','frontend/src/pages/admin':'Internal management page implementations.','memory':'Product requirements and project history.','scripts':'Maintenance and Node verification utilities.','test_reports':'Historical QA reports.','test_reports/pytest':'Saved machine-readable test results.','tests':'Root Python test package placeholder.'}

styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='BodyX',fontName='Helvetica',fontSize=9,leading=13,textColor=colors.HexColor('#243547'),spaceAfter=7))
styles.add(ParagraphStyle(name='CellX',fontName='Helvetica',fontSize=8,leading=11,wordWrap='CJK'))
styles.add(ParagraphStyle(name='PathX',fontName='Helvetica-Bold',fontSize=7.5,leading=10,wordWrap='CJK',textColor=colors.HexColor('#163a52')))
styles['Title'].fontSize=30;styles['Title'].leading=35;styles['Title'].textColor=colors.HexColor('#163a52')
for n in ['Heading1','Heading2']:
    styles[n].textColor=colors.HexColor('#163a52')
    styles[n].keepWithNext=True
story=[]
def p(s,style='BodyX'):return Paragraph(escape(str(s)),styles[style])
def para(s):story.append(p(s))
def h(s):story.append(Paragraph(escape(s),styles['Heading1']))
def sub(s):story.append(Paragraph(escape(s),styles['Heading2']))
def table(rows,headers=('Name / source','Task performed / feature brief'),widths=(183,328)):
    data=[[p(x,'PathX') for x in headers]]+[[p(a,'PathX'),p(b,'CellX')] for a,b in rows]
    t=Table(data,colWidths=widths,repeatRows=1,hAlign='LEFT')
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#dfeaf0')),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f4f7f9')]),('LINEBELOW',(0,0),(-1,0),.6,colors.HexColor('#8ba8b9'))]))
    if len(data)>1:t.setStyle(TableStyle([('NOSPLIT',(0,0),(-1,1))]))
    story.extend([t,Spacer(1,12)])
def new():story.append(PageBreak())
story.extend([Spacer(1,45),p('ASTITTVA','Title'),p('Project file & folder analysis','Title'),Spacer(1,18)])
para('Detailed responsibility directory and feature brief | 11 September 2026')
para('Workspace: '+str(ROOT))
para('Purpose: explain the task performed by each project file and folder, with its name alongside the explanation, and connect the code to the website features.')
para(f'Inventory: {len(files)} project/support files and {len(dirs)} traversed folders. Third-party dependencies, Git internals, generated builds/caches and this report output are excluded from individual enumeration.')
para('Evidence level: static source inspection, route/configuration tracing and saved test-artifact review. No application tests, database connections, CRM calls, image generators or deployment actions were run. Implemented in source does not mean verified live.')
sub('Reading guide')
para('1. Feature brief and user journeys. 2. Architecture and backend differences. 3. Folder responsibility map. 4. File-by-file directory. 5. API inventory. 6. Test evidence and maintenance priorities.')
new();h('1. Feature brief')
features=[('Property discovery','Visitors browse published real estate listings with location, property type, budget, builder, availability and category filters. Filter values are stored in the URL for shareable catalogue views. Sources: PropertiesPage.jsx; property APIs.'),('Property details and enquiries','A detail page presents images, price, location, amenities and property information, then captures a property-specific enquiry. This is a lead-generation flow, not a purchase/checkout flow. Source: PropertyDetailPage.jsx.'),('Consultation and contact','Homepage, contact page and reusable forms submit enquiries to /api/leads. The Python implementation stores the lead first and performs CRM forwarding separately. Sources: HomePage.jsx, ContactPage.jsx, LeadForm.jsx, crm_service.py.'),('Editorial publishing','Public blog list/detail pages are paired with admin editing, image upload, slug and SEO fields, draft/published controls and sanitized HTML rendering. Sources: blog pages; sanitize.js; blog APIs.'),('Market intelligence','Newsroom offers trending content and location/category filters. Python fetches and classifies RSS topics with cached fallback; the UI also includes evergreen content. Node only reads stored news cache.'),('Staff operations','Protected dashboard, property management, blog management, lead status updates and admin-only staff account management. Roles in code: admin, sales, marketing. Sources: App.js, admin pages and API authorization.'),('Brand and navigation','Cinematic homepage imagery, responsive header/footer, WhatsApp shortcuts, about content and expansion narrative support the advisory business presentation.'),('SEO and loading support','Per-page metadata, a Python dynamic sitemap, route-level lazy loading, responsive WebP images and backend compression/index setup are present. These are implementation mechanisms, not measured SEO or performance results.')]
table(features,('Feature','What it does'))
sub('Typical workflows')
para('Visitor: home or catalogue -> choose filters -> open a property -> submit an enquiry -> database lead -> Python CRM delivery when configured -> staff follow-up.')
para('Staff: log in -> create/edit property or blog -> upload imagery where supported -> publish -> public API exposes published content. Administrators additionally manage accounts and destructive operations.')
new();h('2. Architecture and implementation status')
para('The React frontend calls an Axios client configured with REACT_APP_BACKEND_URL plus /api, or same-origin /api when no URL is supplied. Node starts from root package.json; Render selects backend/server.py. Both backends use MongoDB, but they are alternative runtimes with different behavior.')
table([('React frontend','Browser routes and presentation in frontend/src; public and protected admin experiences share API and authentication helpers.'),('Node execution path','npm start -> server.js -> db.js -> MongoDB. Can also serve frontend/build if the compiled index exists.'),('Python execution path','Render/Gunicorn or Procfile -> backend/server.py -> MongoDB, news_service.py and crm_service.py. server.py owns its route definitions.'),('Modular Python code','backend/routers, config.py, auth.py, models.py and storage.py form a separate modular implementation. The configured server.py does not import the router package. Editing those routers alone will not change its registered endpoints.'),('External dependencies','MongoDB is needed for persistent records. Python storage requires its integration key; CRM requires its environment configuration; live RSS requires external network availability.'),('Historical backups','backups/local_20260612_074339 contains an astitva_realestate database dump. The snapshot directory name does not prove backup completeness or restorability.')])
sub('Backend differences that affect the interface')
table([('Core catalogue, blog and admin APIs','Both backends define these API families. Equivalent route names do not establish identical validation, fields or behavior.'),('File uploads / file delivery','Python defines /api/admin/upload and /api/files/{path:path}. No matching routes are defined in server.js. Admin forms call upload endpoints, so Node-only deployment needs additional support for this flow.'),('CRM lead forwarding','Python calls crm_service.py and defines a staff CRM retry endpoint. Node lead handling stores records but does not implement this forwarding/retry integration.'),('Live news refresh','Python has RSS fetch/classification, grouped feeds, topics, diagnostics and refresh routes. Node offers trending/all reads from MongoDB cache.'),('Sitemap','Python defines /api/sitemap.xml. No matching Node sitemap route is defined.'),('Authentication implementation','Both use JWT and bcrypt with role checks. Cookie behavior and login protections must be assessed separately for each runtime; this report does not assert full parity.')])
para('Documentation drift: docs/ARCHITECTURE.md describes an older state. For example, the current Axios timeout is 30 seconds, Python startup creates indexes, blog routes exist, and storage is integrated with an object service. Source/configuration takes precedence over historical prose.')
new();h('3. Folder responsibility map')
table([(d+'/',folderdesc.get(d,'Historical MongoDB snapshot directory.' if d.startswith('backups/') else 'Supporting project directory; contents are listed in the file inventory.')) for d in dirs])
table([('node_modules/','Installed third-party Node packages. Excluded from per-file analysis because they are dependency internals, not project-owned feature code.'),('.git/','Version history, refs, index and local repository metadata. Excluded from per-file analysis.'),('Generated build/cache directories','build/, dist/, virtual environments and Python caches, where present, are excluded. Their source/configuration is documented instead.')])
new();h('4. File-by-file responsibility directory')
para('Paths are relative to the workspace root. Every inventoried file appears once below. Descriptions identify intended source responsibilities; assets and historical records are not treated as independently working product features.')
groups=collections.defaultdict(list)
for f in files:groups[str(Path(f).parent).replace('\\','/')].append(f)
for group in sorted(groups,key=lambda s:(s!='.',s)):
    sub('Workspace root' if group=='.' else group+'/')
    table([(Path(f).name,explain(f)) for f in groups[group]])
new();h('5. Registered route inventory')
para('Routes below are extracted from configured entry-point source. Python api_router routes receive the /api prefix; decorators attached directly to app retain their literal path. This lists declarations, not successful endpoint tests.')
for label,file in [('Node / Express','server.js'),('Python / FastAPI','backend/server.py')]:
    sub(label)
    source=(ROOT/file).read_text(encoding='utf-8')
    routes=[]
    if file.endswith('.js'):
        for i,l in enumerate(source.splitlines(),1):
            m=re.search(r'app\.(get|post|put|patch|delete|all)\((.+?),(?:\s|$)',l)
            if m:
                target=m.group(2)
                if target.startswith('['):target=l.split('[',1)[1].split(']',1)[0]
                routes.append((m.group(1).upper()+' '+target,f'{file}:{i}'))
    else:
        for i,l in enumerate(source.splitlines(),1):
            m=re.search(r'@(app|api_router)\.(get|post|put|patch|delete)\("([^"]+)"',l)
            if m:routes.append((m.group(2).upper()+' '+('/api' if m.group(1)=='api_router' else '')+m.group(3),f'{file}:{i}'))
    table(routes,('Method and path','Source reference'))
new();h('6. Verification evidence and follow-up work')
para('The tests below already existed in the workspace. They were read, not run. Some suites submit records or rely on a configured remote backend; running them was outside this documentation task.')
table([(p,explain(p)) for p in files if p.startswith('backend/tests/') or p.startswith('scripts/test_')])
sub('Saved pytest result summaries')
results=[]
for f in files:
    if f.startswith('test_reports/pytest/') and f.endswith('.xml'):
        try:
            root=ET.parse(ROOT/f).getroot(); suites=[root] if root.tag=='testsuite' else list(root.iter('testsuite'))
            nums={k:sum(int(s.attrib.get(k,0)) for s in suites) for k in ('tests','failures','errors','skipped')}
            results.append((Path(f).name,', '.join(f'{k}: {v}' for k,v in nums.items())+'. Saved report only.'))
        except Exception:results.append((Path(f).name,'Could not reliably extract summary; retained as historical artifact.'))
table(results)
sub('Specific gaps and maintenance priorities')
table([('Choose and document the active backend','Resolve whether production should use Node or Python, then verify every frontend API dependency against that implementation. This directly affects uploads, CRM, sitemap and news.'),('Resolve duplicate Python implementations','Either wire the modular routers into an entry point with regression validation or clearly mark their status. Maintaining two copies of route logic invites inconsistent fixes.'),('Confirm campaign page availability','Saved reports and test_aramya_leads.py reference /aramya/index.html, but no such page is present in this inventoried checkout. Do not describe it as a current delivered page without locating its source/deployment.'),('Update project documentation','Replace the root README placeholder with setup/runtime guidance and bring ARCHITECTURE.md into line with the current code and environment variables.'),('Validate operational configuration','Before claiming readiness, confirm database, JWT/admin settings, allowed origins, storage and CRM configuration for the selected runtime. Default credential/secret fallbacks are visible in source; their actual deployment values were not inspected.'),('Perform fresh verification','Run relevant API/UI checks against a designated test environment, including uploads, login, publication, lead persistence, CRM outcomes and news fallback. Saved success percentages are not current evidence.'),('Confirm backup coverage','The supplied dump lists users, properties, leads, files, login_attempts and news_cache artifacts; no blog collection dump is present. Review required backup coverage and perform a controlled restore test.')])
sub('Scope and interpretation')
para('This report describes responsibilities, not the identity of whoever wrote each file, time spent, or task completion history. Those require version history and project-management evidence. Image subjects are inferred from asset names; binary image content and BSON records were not individually audited. UI primitives are listed as available components without claiming each is currently imported.')
para('Source basis: this local checkout on 11 September 2026; source paths and API declaration line references are provided for traceability. No external deployment or website was inspected.')

def footer(c,doc):
    w,h=A4;c.setStrokeColor(colors.HexColor('#cedbe3'));c.line(42,40,w-42,40)
    c.setFont('Helvetica',8);c.setFillColor(colors.HexColor('#5b6e7a'));c.drawString(42,27,'ASTITTVA | File, folder and feature analysis');c.drawRightString(w-42,27,str(doc.page))
pdf=OUT/'Astittva_File_Folder_Feature_Report.pdf'
doc=SimpleDocTemplate(str(pdf),pagesize=A4,rightMargin=42,leftMargin=42,topMargin=42,bottomMargin=54,title='Astittva - File, Folder and Feature Analysis',author='Project source analysis')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
r=PdfReader(pdf)
alltext='\n'.join(x.extract_text() or '' for x in r.pages)
missing=[f for f in files if Path(f).name not in alltext]
summary={'files':len(files),'folders':len(dirs),'pages':len(r.pages),'missing_inventory_names':missing,'pdf':str(pdf),'unclassified':[f for f in files if explain(f).startswith('Supporting project file')]}
(ROOT/'tmp/pdfs/qa_summary.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
print(json.dumps(summary,indent=2))
