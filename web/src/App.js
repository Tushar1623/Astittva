import "@/App.css";
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { HelmetProvider } from "react-helmet-async";

import { AuthProvider } from "@/context/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";
import SkipLink from "@/components/SkipLink";

import PublicLayout from "@/layouts/PublicLayout";
import HomePage from "@/pages/HomePage";

// Route-level code-splitting: everything below is loaded on demand so the
// initial JS bundle for a first-time visitor landing on "/" stays lean.
// Admin bundle (form editors, table pages) never ships to public visitors.
const PropertiesPage = lazy(() => import("@/pages/PropertiesPage"));
const PropertyDetailPage = lazy(() => import("@/pages/PropertyDetailPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const MarketIntelligencePage = lazy(() => import("@/pages/MarketIntelligencePage"));
const BlogsListPage = lazy(() => import("@/pages/BlogsListPage"));
const BlogDetailPage = lazy(() => import("@/pages/BlogDetailPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

const AdminLoginPage = lazy(() => import("@/pages/admin/AdminLoginPage"));
const AdminLayout = lazy(() => import("@/layouts/AdminLayout"));
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"));
const AdminPropertiesPage = lazy(() => import("@/pages/admin/AdminPropertiesPage"));
const AdminPropertyFormPage = lazy(() => import("@/pages/admin/AdminPropertyFormPage"));
const AdminLeadsPage = lazy(() => import("@/pages/admin/AdminLeadsPage"));
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage"));
const AdminBlogsPage = lazy(() => import("@/pages/admin/AdminBlogsPage"));
const AdminBlogFormPage = lazy(() => import("@/pages/admin/AdminBlogFormPage"));

// Route-level fallback while the chunk downloads — deliberately minimal so it
// doesn't cause a layout shift or a visual flash on fast connections.
function RouteFallback() {
  return (
    <div
      className="w-full min-h-[60vh] flex items-center justify-center"
      aria-busy="true"
      data-testid="route-loading"
    >
      <span className="text-[10px] tracking-[0.4em] uppercase text-copper/60">
        Loading…
      </span>
    </div>
  );
}

function RidhiBhoomiRedirect() {
  useEffect(() => {
    const targetUrl = process.env.REACT_APP_RIDDHI_BHOOMI_URL || "http://localhost:5173";
    window.location.href = targetUrl;
  }, []);

  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-[#FAF8F5] gap-3" data-testid="ridhi-bhoomi-redirect">
      <div className="w-8 h-8 rounded-full border-2 border-copper border-t-transparent animate-spin" />
      <span className="text-[11px] tracking-[0.3em] uppercase text-copper font-medium">
        Redirecting to Ridhi Bhoomi…
      </span>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <HelmetProvider>
        <BrowserRouter>
        <AuthProvider>
          <SkipLink />
          <ScrollToTop />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Public */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/properties" element={<PropertiesPage />} />
                <Route path="/properties/:id" element={<PropertyDetailPage />} />
                <Route path="/market-intelligence" element={<MarketIntelligencePage />} />
                <Route path="/blogs" element={<BlogsListPage />} />
                <Route path="/blogs/:slug" element={<BlogDetailPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/ridhi-bhoomi" element={<RidhiBhoomiRedirect />} />
                <Route path="/riddhi-bhumi" element={<RidhiBhoomiRedirect />} />
                {/* 404 — must be last inside the public layout */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>


              {/* Admin auth */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Admin protected */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="properties" element={<AdminPropertiesPage />} />
                <Route path="properties/new" element={<AdminPropertyFormPage />} />
                <Route path="properties/:id/edit" element={<AdminPropertyFormPage />} />
                <Route path="leads" element={<AdminLeadsPage />} />
                <Route path="blogs" element={<AdminBlogsPage />} />
                <Route path="blogs/new" element={<AdminBlogFormPage />} />
                <Route path="blogs/:id/edit" element={<AdminBlogFormPage />} />
                <Route
                  path="users"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminUsersPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </Suspense>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#FFFFFF",
                color: "#1C1C1C",
                border: "1px solid #E8DED2",
                borderRadius: "2px",
                boxShadow: "0 4px 24px -8px rgba(94,31,40,0.15)",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.875rem",
              },
              classNames: {
                toast: "!bg-white",
                title: "!text-[#1C1C1C] !font-medium",
                description: "!text-[#5F5F5F]",
                actionButton: "!bg-[#B87333] !text-white",
                cancelButton: "!bg-[#F5F1EC] !text-[#1C1C1C]",
                success: "!border-l-4 !border-l-[#B87333]",
                error: "!border-l-4 !border-l-red-500",
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
      </HelmetProvider>
    </div>
  );
}

export default App;
