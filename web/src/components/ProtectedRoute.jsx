import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading || user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal">
        <div className="text-copper text-sm tracking-[0.3em] uppercase">Loading</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}
