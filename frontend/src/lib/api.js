import axios from "axios";

const RAW_BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";

// Ensure all API calls correctly reach the active backend
function getBaseURL() {
  if (RAW_BACKEND_URL && RAW_BACKEND_URL.trim() !== "") {
    const cleanUrl = RAW_BACKEND_URL.trim().replace(/\/+$/, "");
    return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
  }
  // When served by Express / Hostinger / local server, always route to /api on the current origin
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

  // 1. Matches drive.google.com/file/d/<id>
  const fileMatch = clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];

  // 2. Matches googleusercontent.com/d/<id> or /d/<id>
  const dMatch = clean.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch) return dMatch[1];

  // 3. Matches query param ?id=<id> or &id=<id> (drive.google.com/open?id=... or /thumbnail?id=...)
  const idParamMatch = clean.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch) return idParamMatch[1];

  // 4. Raw Google Drive file ID (25 to 45 alphanumeric characters with underscores/dashes)
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(clean)) {
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

  // Direct high-resolution Google Drive thumbnail URL
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${width || 1000}`;
}

export function fileUrl(path, width = 1000) {
  if (!path) return "";

  const driveId = getGoogleDriveFileId(path);
  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w${width || 1000}`;
  }

  // Do NOT request legacy Astittva storage paths anymore.
  if (!path.startsWith("http")) {
    return "";
  }

  // Keep normal external http images only if required.
  return path;
}

export default api;
