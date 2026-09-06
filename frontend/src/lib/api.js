import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
// Use absolute baseURL only when REACT_APP_BACKEND_URL is set AND we're on the same host.
// Otherwise fall back to "/api" so requests are same-origin via the platform ingress
// — this avoids CORS issues when the app is opened through a preview URL different from
// the one baked into the bundle.
function getBaseURL() {
  if (typeof window === "undefined") return `${BACKEND_URL}/api`;
  try {
    const configured = new URL(BACKEND_URL);
    if (configured.host === window.location.host) {
      return `${BACKEND_URL}/api`;
    }
  } catch (_) {}
  return "/api";
}

export const API = getBaseURL();

const api = axios.create({
  baseURL: API,
  withCredentials: true,
  timeout: 15000, // 15s default — prevents stuck loading states on slow upstream
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

export function fileUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API}/files/${path}`;
}

export default api;
