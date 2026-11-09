import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LOGO_URL } from "@/lib/site";
import { toast } from "sonner";
import Seo from "@/components/Seo";

export default function AdminLoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user && user !== false) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await login(email, password);
    if (res.ok) {
      toast.success("Welcome back");
      navigate("/admin");
    } else {
      setError(res.error || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div data-testid="admin-login-page" className="min-h-screen relative flex items-center justify-center px-4 sm:px-6 py-12 overflow-hidden bg-gradient-to-br from-[#180306] via-[#26060B] to-[#100204]">
      <Seo title="Admin Console | Astittva Marketing" noIndex={true} path="/admin/login" />

      {/* Ambient luxury radial halos */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 25%, rgba(184, 115, 51, 0.16) 0%, transparent 70%), " +
            "radial-gradient(ellipse 40% 40% at 80% 80%, rgba(106, 30, 45, 0.20) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-[14px] bg-[#3D060E] border border-[#D4A359]/35 shadow-[0_8px_24px_rgba(0,0,0,0.5)] p-2.5 mx-auto mb-5">
            <img src={LOGO_URL} alt="Astittva" className="w-full h-full object-contain" />
          </div>
          <div className="font-sans text-[10px] tracking-[0.45em] uppercase text-[#D4A359] font-semibold mb-2">
            Astittva Marketing Group
          </div>
          <h1 className="font-serif-display text-3xl sm:text-4xl text-white font-medium tracking-tight">
            Advisory Console
          </h1>
          <p className="text-white/50 text-xs mt-2 max-w-xs mx-auto">
            Authorized management access for private client listings and candidate applications.
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={submit}
          className="rounded-[14px] border border-white/12 p-8 sm:p-10 space-y-5 shadow-[0_24px_64px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(42, 10, 16, 0.85) 0%, rgba(28, 6, 10, 0.90) 100%)",
          }}
          data-testid="login-form"
        >
          <div>
            <label className="block text-[10px] tracking-[0.25em] uppercase text-[#D4A359] font-semibold mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              data-testid="login-email"
              className="w-full h-12 px-4 rounded-[8px] bg-black/35 border border-white/15 focus:border-[#D4A359] focus:bg-black/50 text-white text-sm placeholder-white/30 transition-all outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@astitva.com"
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] tracking-[0.25em] uppercase text-[#D4A359] font-semibold">
                Password
              </label>
            </div>
            <input
              type="password"
              required
              data-testid="login-password"
              className="w-full h-12 px-4 rounded-[8px] bg-black/35 border border-white/15 focus:border-[#D4A359] focus:bg-black/50 text-white text-sm placeholder-white/30 transition-all outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
            />
          </div>

          {error && (
            <div data-testid="login-error" className="p-3 rounded-[6px] bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            data-testid="login-submit"
            className="w-full h-12 rounded-[8px] text-white font-sans text-xs tracking-[0.20em] uppercase font-semibold transition-all duration-300 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 shadow-[0_6px_20px_rgba(184,115,51,0.35)]"
            style={{
              background: "linear-gradient(135deg, #B87333 0%, #D4A359 50%, #B87333 100%)",
            }}
          >
            {loading ? "Authenticating…" : "Access Console"}
          </button>

          <div className="pt-3 flex items-center justify-between border-t border-white/10 text-xs">
            <span className="font-mono text-[11px] text-white/40">admin@astitva.com</span>
            <button
              type="button"
              onClick={() => {
                setEmail("admin@astitva.com");
                setPassword("Astitva@2026");
              }}
              className="text-[#D4A359] hover:text-white text-xs transition cursor-pointer font-medium"
            >
              Fill Credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
