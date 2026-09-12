import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { HelmetProvider } from "react-helmet-async";

import { AuthProvider } from "@/context/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";

import PublicLayout from "@/layouts/PublicLayout";
import HomePage from "@/pages/HomePage";

// Route-level code-splitting: load public pages and admin pages on demand
const PropertiesPage = lazy(() => import("@/pages/PropertiesPage"));
const PropertyDetailPage = lazy(() => import("@/pages/PropertyDetailPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const MarketIntelligencePage = lazy(() => import("@/pages/MarketIntelligencePage"));
const BlogsListPage = lazy(() => import("@/pages/BlogsListPage"));
const BlogDetailPage = lazy(() => import("@/pages/BlogDetailPage"));

const AdminLoginPage = lazy(() => import("@/pages/admin/AdminLoginPage"));
const AdminLayout = lazy(() => import("@/layouts/AdminLayout"));
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"));
const AdminPropertiesPage = lazy(() => import("@/pages/admin/AdminPropertiesPage"));
const AdminPropertyFormPage = lazy(() => import("@/pages/admin/AdminPropertyFormPage"));
const AdminLeadsPage = lazy(() => import("@/pages/admin/AdminLeadsPage"));
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage"));
const AdminBlogsPage = lazy(() => import("@/pages/admin/AdminBlogsPage"));
const AdminBlogFormPage = lazy(() => import("@/pages/admin/AdminBlogFormPage"));

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

function App() {
  return (
    <div className="App min-h-screen">
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <ScrollToTop />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                {/* Public routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/properties" element={<PropertiesPage />} />
                  <Route path="/properties/:id" element={<PropertyDetailPage />} />
                  <Route path="/market-intelligence" element={<MarketIntelligencePage />} />
                  <Route path="/blogs" element={<BlogsListPage />} />
                  <Route path="/blogs/:slug" element={<BlogDetailPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                </Route>

                {/* Admin authentication */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Admin protected console */}
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
              theme="dark"
              toastOptions={{
                style: {
                  background: "#1B1B1B",
                  color: "#F8F5F1",
                  border: "1px solid rgba(184,115,51,0.4)",
                  borderRadius: "2px",
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
