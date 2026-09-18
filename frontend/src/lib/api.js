import axios from "axios";

const RAW_BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "https://astittva-backend.onrender.com";

// Ensure all API calls correctly reach the deployed backend
function getBaseURL() {
  if (RAW_BACKEND_URL && RAW_BACKEND_URL.trim() !== "") {
    const cleanUrl = RAW_BACKEND_URL.trim().replace(/\/+$/, "");
    return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
  }
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

  try {
    const fileMatch = url.match(
      /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
    );

    if (fileMatch) {
      return fileMatch[1];
    }

    const parsed = new URL(url);

    if (parsed.hostname === "drive.google.com") {
      return parsed.searchParams.get("id");
    }
  } catch {}

  return null;
}

export function isGoogleDriveImage(url) {
  return Boolean(getGoogleDriveFileId(url));
}

export function driveImageUrl(url) {
  const id = getGoogleDriveFileId(url);

  if (!id) return "";

  return `https://drive.google.com/thumbnail?id=${id}&sz=w2000`;
}

export function fileUrl(path) {
  if (!path) return "";

  const driveId = getGoogleDriveFileId(path);

  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w2000`;
  }

  // Do NOT request legacy Astittva storage paths anymore.
  if (!path.startsWith("http")) {
    return "";
  }

  // Keep normal external http images only if required.
  return path;
}

export default api;
