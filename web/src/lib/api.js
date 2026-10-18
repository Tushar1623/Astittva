import axios from "axios";

const RAW_BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";

function getBaseURL() {
  if (typeof window !== "undefined" && window.location) {
    const host = window.location.hostname;
    // When served in production on astittva.in or any non-localhost host,
    // always use relative "/api" to eliminate Mixed Content HTTPS->HTTP localhost failures
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return "/api";
    }
  }
  if (RAW_BACKEND_URL && RAW_BACKEND_URL.trim() !== "") {
    const cleanUrl = RAW_BACKEND_URL.trim().replace(/\/+$/, "");
    return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
  }
  // When served by Express, Hostinger, or local development dev-server proxy, route to /api on the current origin
  return "/api";
}

export const API = getBaseURL();

const api = axios.create({
  baseURL: API,
  withCredentials: true,
  timeout: 30000, // 30s timeout handles Render free-tier cold starts
});

// Inject Bearer fallback from localStorage if present
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("astitva_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Reject HTML fallback responses (e.g. from static hostings returning index.html with 200 OK for API routes)
api.interceptors.response.use(
  (response) => {
    if (
      typeof response.data === "string" &&
      (response.data.trim().startsWith("<!DOCTYPE") || response.data.trim().startsWith("<html"))
    ) {
      return Promise.reject({
        response: {
          status: 502,
          data: { detail: "Backend API service unreachable. Please try again shortly." },
        },
        message: "Received HTML document instead of JSON API response",
      });
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export function getGoogleDriveFileId(url) {
  if (!url || typeof url !== "string") return null;
  const clean = url.trim();

  // 1. Matches drive.google.com/file/d/<id> (Drive IDs are at least 20 chars)
  const fileMatch = clean.match(/\/file\/d\/([a-zA-Z0-9_-]{20,})/);
  if (fileMatch) return fileMatch[1];

  // 2. Matches googleusercontent.com/d/<id> or /d/<id> (Drive IDs are at least 20 chars)
  const dMatch = clean.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  if (dMatch) return dMatch[1];

  // 3. Matches query param ?id=<id> or &id=<id> (Drive IDs are at least 20 chars)
  const idParamMatch = clean.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
  if (idParamMatch) return idParamMatch[1];

  // 4. Raw Google Drive file ID (20 to 50 alphanumeric characters with underscores/dashes)
  if (/^[a-zA-Z0-9_-]{20,50}$/.test(clean)) {
    return clean;
  }

  return null;
}

export function isGoogleDriveImage(url) {
  return Boolean(getGoogleDriveFileId(url));
}

export function driveImageUrl(url, width = 1000) {
  const id = getGoogleDriveFileId(url);
  if (!id) return "";

  // Direct high-resolution Google Drive thumbnail URL (previous Drive link)
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${width || 1000}`;
}

export function driveDirectFallbackUrl(url, width = 1000) {
  const id = getGoogleDriveFileId(url);
  if (!id) return "";
  return `https://lh3.googleusercontent.com/d/${id}=w${width || 1000}`;
}

export function driveProxyUrl(url, width = 1000) {
  const id = getGoogleDriveFileId(url);
  if (!id) return "";
  return `${API}/images/thumbnail?id=${encodeURIComponent(id)}&w=${width || 1000}`;
}

export function fileUrl(path, width = 1000) {
  if (!path || typeof path !== "string") return "";

  const clean = path.trim();
  const driveId = getGoogleDriveFileId(clean);
  if (driveId) {
    return driveImageUrl(clean, width);
  }

  // If already an absolute http/https URL, preserve it
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }

  // If local static asset from public/ (e.g. /images/...) or /uploads/
  if (clean.startsWith("/images/") || clean.startsWith("/static/") || clean.startsWith("/uploads/") || clean.startsWith("/favicon")) {
    return clean;
  }

  // Do NOT request legacy dead storage paths ("astitva-realestate/properties/...")
  return "";
}

export default api;
