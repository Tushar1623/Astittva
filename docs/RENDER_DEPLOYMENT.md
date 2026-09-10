# Deploying Astittva Backend on Render

This guide provides complete, step-by-step instructions to deploy the FastAPI backend service of Astittva Real Estate onto [Render](https://render.com/).

---

## 1. Prerequisites

1. **GitHub Account**: Your repository pushed to GitHub (`https://github.com/Tushar1623/Astittva`).
2. **Render Account**: Sign up at [dashboard.render.com](https://dashboard.render.com/).
3. **MongoDB Atlas Account (Free)**: Since Render does not provide a managed free MongoDB service, use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) for a free (M0) MongoDB cluster.

---

## 2. Step 1: Set up MongoDB Atlas (Free)

1. Log into [MongoDB Atlas](https://cloud.mongodb.com/).
2. Create a new project or select an existing one.
3. Click **Create Cluster** and select the **M0 Free Tier** (choose the region closest to your Render service, e.g. Frankfurt, Oregon, or Singapore).
4. **Database User**:
   - Go to **Security > Database Access**.
   - Click **Add New Database User**.
   - Set Authentication Method: **Password**.
   - Create a username (e.g. `astitva_user`) and a secure password (note this down).
   - Set Built-in Role to **Read and write to any database**.
5. **Network Access (Whitelist IPs)**:
   - Go to **Security > Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`).
   - *Note*: Render's free tier uses dynamic IP addresses, so `0.0.0.0/0` is required.
6. **Get Connection String**:
   - Go to **Database > Deployment > Databases**.
   - Click **Connect** on your cluster.
   - Choose **Drivers** (Python 3.12 or later).
   - Copy the URI:
     ```text
     mongodb+srv://astitva_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user password.

---

## 3. Step 2: Push Changes to GitHub

Commit and push the configuration updates made to your repository:

```bash
git add backend/requirements.txt backend/server.py backend/Procfile backend/Dockerfile backend/.dockerignore render.yaml docs/RENDER_DEPLOYMENT.md
git commit -m "Configure backend for Render deployment with health checks and render.yaml"
git push origin main
```

---

## 4. Step 3: Deploy on Render

Choose either **Option A (Render Blueprint - Recommended)** or **Option B (Manual Web Service)**.

### Option A: Render Blueprint (Fastest & Automated)

1. Open your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** at the top right and choose **Blueprint**.
3. Connect your GitHub repository (`Tushar1623/Astittva`).
4. Render will read `render.yaml` automatically and configure the service:
   - **Service Name**: `astittva-backend`
   - **Runtime**: `Python 3.11.9`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn -k uvicorn.workers.UvicornWorker server:app --bind 0.0.0.0:$PORT --workers 2`
5. Render will prompt you to enter the environment variables with `sync: false`:
   - `MONGO_URL`: Paste your MongoDB Atlas URI.
   - `ADMIN_PASSWORD`: Enter your chosen admin password (e.g. `Astitva@2026`).
6. Click **Apply**.
7. Render will build and deploy the backend.

---

### Option B: Manual Web Service Setup

If you prefer to configure manually via the Render UI:

1. In the Render Dashboard, click **New +** > **Web Service**.
2. Select **Build and deploy from a Git repository** and connect `Tushar1623/Astittva`.
3. Fill in the service configuration:
   - **Name**: `astittva-backend`
   - **Region**: Oregon (US West) or Frankfurt (EU)
   - **Branch**: `main`
   - **Root Directory**: `backend` *(CRITICAL: must be set to `backend`)*
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn -k uvicorn.workers.UvicornWorker server:app --bind 0.0.0.0:$PORT --workers 2`
   - **Instance Type**: `Free`
4. Expand **Advanced**:
   - **Health Check Path**: `/healthz`
   - **Auto-Deploy**: `Yes`
5. In the **Environment Variables** section, add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `PYTHON_VERSION` | `3.11.9` | Python runtime version |
| `MONGO_URL` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
| `DB_NAME` | `astitva_db` | Name of the database |
| `JWT_SECRET` | *(Generate a 32+ char random string)* | Secret key for auth tokens |
| `ADMIN_EMAIL` | `admin@astitva.com` | Seed admin email |
| `ADMIN_PASSWORD` | `Astitva@2026` | Seed admin password |
| `ADMIN_NAME` | `Astitva Admin` | Seed admin display name |
| `CORS_ORIGINS` | `*` | Or your frontend URL (comma-separated) |
| `FRONTEND_URL` | `http://localhost:3000` | Frontend web address |
| `APP_NAME` | `astitva-realestate` | Application identifier |

6. Click **Create Web Service**.

---

## 5. Step 4: Verify Your Deployment

Once Render finishes the build (usually 1-2 minutes), your service status will turn **Live**.
Your service URL will look like: `https://astittva-backend.onrender.com`.

Test the service in your browser or with `curl`:

1. **Health Check**:
   ```bash
   curl https://astittva-backend.onrender.com/healthz
   ```
   **Expected Response**:
   ```json
   {"status": "ok", "service": "Astitva Real Estate API", "time": "..."}
   ```

2. **API Root Check**:
   ```bash
   curl https://astittva-backend.onrender.com/api/
   ```
   **Expected Response**:
   ```json
   {"service": "Astitva Real Estate API", "ok": true}
   ```

3. **Properties Endpoint**:
   ```bash
   curl https://astittva-backend.onrender.com/api/properties
   ```

---

## 6. Step 5: Connect Your Frontend

Once your backend is live on Render:

1. Update `frontend/.env`:
   ```env
   REACT_APP_BACKEND_URL=https://astittva-backend.onrender.com
   ```
2. Update the backend environment variable `CORS_ORIGINS` in Render:
   - Go to Render Dashboard > `astittva-backend` > **Environment**.
   - Set `CORS_ORIGINS`:
     ```text
     https://your-frontend.vercel.app,http://localhost:3000
     ```
   - Click **Save Changes** (Render will restart the service with the updated CORS policy).

---

## 7. Troubleshooting

- **Cold Start Delay**: Render Free Tier spins down after 15 minutes of inactivity. The first request may take ~30-50 seconds while the container spins up. The `/healthz` endpoint responds immediately once up.
- **MongoDB Connection Timeout**: Ensure `0.0.0.0/0` is whitelisted in MongoDB Atlas Network Access. Check that your user password in `MONGO_URL` does not contain unencoded special characters (e.g., encode `#` as `%23`, `@` as `%40`).
- **CORS Errors**: If frontend calls are blocked by CORS in the browser, ensure your exact frontend domain is present in `CORS_ORIGINS` on Render (or keep `*` during development).
