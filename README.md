# ASTITTVA — Real Estate Advisory Platform

ASTITTVA is a luxury real estate advisory platform featuring a public property discovery experience, live market intelligence newsroom, editorial journal, and an authenticated administrative operations console.

---

## 📁 Repository Structure

The codebase is organized with strict separation of concerns between frontend and backend:

```
.
├── frontend/                     # React 19 Client Application
│   ├── public/                   # Static assets (images, favicons, robots.txt)
│   ├── src/                      # React components, pages, context, and layouts
│   ├── scripts/                  # Frontend scripts (e.g. optimize_images.py)
│   ├── design_guidelines.json    # UI/UX design tokens and style guide
│   ├── craco.config.js           # CRACO build & alias configuration
│   ├── tailwind.config.js        # Tailwind CSS theme settings
│   └── package.json              # Frontend client dependencies & scripts
│
├── backend/                      # Backend Services & APIs
│   ├── server.py                 # FastAPI production entrypoint (Render / Cloud)
│   ├── news_service.py           # RSS market news aggregation & caching engine
│   ├── crm_service.py            # Async CRM webhook forwarding & retry service
│   ├── models.py                 # Data models and Pydantic schemas
│   ├── routers/                  # Modular route controllers
│   ├── tests/                    # Backend pytest integration suites
│   ├── test_reports/             # Stored test results & QA iteration logs
│   ├── Dockerfile & Procfile     # Container & process definitions for Python API
│   ├── requirements.txt          # Python dependencies
│   └── node/                     # Node.js Express Alternative Backend (Hostinger / local)
│       ├── server.js             # Express API server & SPA static file host
│       ├── db.js                 # Reusable MongoDB Atlas connection pool
│       ├── scripts/              # Express API & DB connectivity tests
│       └── package.json          # Node backend dependencies
│
├── docs/                         # Architecture and deployment guides
├── memory/                       # Historical PRD and project decisions
├── backups/                      # MongoDB database snapshots
├── render.yaml                   # Render Cloud deployment blueprint
└── package.json                  # Root monorepo script orchestrator
```

---

## 🚀 Quick Start Commands (from Root)

| Command | Action |
|---|---|
| `npm run start:frontend` | Launch React frontend in development mode (`localhost:3000`) |
| `npm run build:frontend` | Compile React frontend production bundle into `frontend/build` |
| `npm run start:backend:python` | Launch FastAPI Python backend (`server.py`) |
| `npm run start:backend:node` | Launch Node.js / Express backend (`backend/node/server.js`) |
| `npm run test:backend:node:api`| Run verification tests against the Express API server |
| `npm run optimize:images` | Run the WebP image optimization pipeline for `frontend/public/images` |

---

## 🔐 Environment Configuration

- **Backend**: Configure `backend/.env` (see `backend/.env.example` for MongoDB, JWT, and admin user credentials).
- **Frontend**: Configure `frontend/.env` (sets `REACT_APP_BACKEND_URL`).
