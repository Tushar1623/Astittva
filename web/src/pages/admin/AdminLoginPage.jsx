import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LOGO_URL } from "@/lib/site";
import { toast } from "sonner";

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
    <div data-testid="admin-login-page" className="min-h-screen bg-charcoal flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <img src={LOGO_URL} alt="Astittva" className="h-16 sm:h-20 mx-auto mb-6 object-contain" />
          <div className="overline mb-2">Astittva Group</div>
          <h1 className="font-display font-light text-3xl text-ivory">Admin Console</h1>
        </div>

        <form onSubmit={submit} className="luxury-card p-8 sm:p-10 space-y-5" data-testid="login-form">
          <div>
            <label className="input-label">Email</label>
            <input
              type="email"
              required
              data-testid="login-email"
              className="input-filled"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="input-label">Password</label>
            <input
              type="password"
              required
              data-testid="login-password"
              className="input-filled"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div data-testid="login-error" className="text-red-400 text-sm">{error}</div>}
          <button type="submit" disabled={loading} data-testid="login-submit" className="btn-primary w-full disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
