import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api, { formatApiErrorDetail, isGoogleDriveImage, driveImageUrl } from "@/lib/api";
import { Plus, Pencil, Trash2, Star, Search, RotateCcw, ExternalLink, Repeat, Eye } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import AdminHeader from "@/components/admin/AdminHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminEmptyState from "@/components/admin/AdminEmptyState";

const STATUS_OPTIONS = ["All", "Draft", "Pending Review", "Published", "Sold", "Inactive"];
const PROPERTY_TYPES = [
  "All",
  "Apartment",
  "Flat",
  "Villa",
  "Independent House",
  "Builder Floor",
  "Plot",
  "Commercial Property",
  "Office",
  "Shop",
  "Land",
  "Other",
];

function formatPriceINR(val) {
  if (!val || isNaN(val)) return "₹0";
  const num = Number(val);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2).replace(/\.00$/, "")} Lakh`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
}

export default function AdminResalePropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProperties = () => {
    setLoading(true);
    const params = {};
    if (statusFilter !== "All") params.status = statusFilter;
    if (typeFilter !== "All") params.propertyType = typeFilter;
    if (search.trim()) params.search = search.trim();

    api
      .get("/admin/resale", { params })
      .then(({ data }) => {
        setProperties(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to load resale inventory");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProperties();
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setTypeFilter("All");
    setCurrentPage(1);
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/resale/${id}/status`, { status });
      toast.success(`Status updated to "${status}"`);
      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p))
      );
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to update status");
    }
  };

  const toggleFeatured = async (id, currentVal) => {
    try {
      const nextVal = !currentVal;
      await api.patch(`/admin/resale/${id}/featured`, { featured: nextVal });
      toast.success(nextVal ? "Marked as Featured" : "Removed from Featured");
      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, featured: nextVal } : p))
      );
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to toggle featured");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    try {
      setIsDeleting(true);
      await api.delete(`/admin/resale/${deleteTarget.id}`);
      toast.success("Resale property deleted successfully");
      setProperties((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to delete resale property");
    } finally {
      setIsDeleting(false);
    }
  };

  // Paginated List
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return properties.slice(start, start + pageSize);
  }, [properties, currentPage, pageSize]);

  return (
    <div data-testid="admin-resale-page" className="space-y-6">
      {/* Unified Header */}
      <AdminHeader
        category="INVENTORY"
        subcategory="SECONDARY MARKET"
        title="Resale Properties"
        subtitle="Manage verified secondary market inventory, seller submissions, pricing, and live public showcase status."
        onRefresh={loadProperties}
        refreshing={loading}
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/resale"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs uppercase tracking-[0.1em] font-semibold text-[var(--admin-text-secondary)] hover:text-[var(--admin-accent)] border border-[var(--admin-border)] hover:border-[var(--admin-accent)] rounded-md transition-colors bg-[var(--admin-surface)]"
            >
              <span>Public Resale Board</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-50" />
            </Link>
            <Link
              to="/admin/resale/new"
              data-testid="add-resale-property-btn"
              className="btn-admin-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Add Resale Property</span>
            </Link>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div
        className="p-3.5 sm:p-4 rounded-lg border transition-colors shadow-2xs"
        style={{
          backgroundColor: "var(--admin-surface)",
          borderColor: "var(--admin-border)",
        }}
      >
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          {/* Text Search */}
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-[var(--admin-placeholder)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search title, locality, seller name, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-md text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)]"
              style={{
                backgroundColor: "var(--admin-input-bg)",
                borderColor: "var(--admin-input-border)",
                borderWidth: "1px",
                color: "var(--admin-input-text)",
              }}
            />
          </div>

          {/* Status Filter */}
          <div className="min-w-[140px]">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-3 rounded-md text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] cursor-pointer"
              style={{
                backgroundColor: "var(--admin-input-bg)",
                borderColor: "var(--admin-input-border)",
                borderWidth: "1px",
                color: "var(--admin-input-text)",
              }}
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  Status: {st}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="min-w-[140px]">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-3 rounded-md text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] cursor-pointer"
              style={{
                backgroundColor: "var(--admin-input-bg)",
                borderColor: "var(--admin-input-border)",
                borderWidth: "1px",
                color: "var(--admin-input-text)",
              }}
            >
              {PROPERTY_TYPES.map((tp) => (
                <option key={tp} value={tp}>
                  Type: {tp}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Search Button */}
          <button
            type="submit"
            className="btn-admin-primary h-9 px-4"
          >
            Filter
          </button>

          {/* Reset Button */}
          {(search || statusFilter !== "All" || typeFilter !== "All") && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="h-9 px-3 text-xs border rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
              style={{
                backgroundColor: "var(--admin-surface-2)",
                borderColor: "var(--admin-border)",
                color: "var(--admin-text-secondary)",
              }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </form>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="text-[var(--admin-text-muted)] text-center py-20 tracking-[0.25em] uppercase text-xs flex flex-col items-center justify-center gap-3">
          <Repeat className="w-5 h-5 text-[var(--admin-accent)] animate-spin" />
          <span>Loading Resale Inventory…</span>
        </div>
      ) : properties.length === 0 ? (
        <AdminEmptyState
          icon={Repeat}
          title="No resale properties found."
          message="Adjust your search criteria or add your first verified resale property listing."
          actionLabel={search || statusFilter !== "All" || typeFilter !== "All" ? "Clear Filters" : "Add Resale Property"}
          actionTo={search || statusFilter !== "All" || typeFilter !== "All" ? null : "/admin/resale/new"}
          onAction={search || statusFilter !== "All" || typeFilter !== "All" ? handleResetFilters : null}
        />
      ) : (
        <div className="admin-table-wrap">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="admin-thead">
                <tr>
                  <th className="text-left p-4 font-semibold">Property</th>
                  <th className="text-left p-4 font-semibold hidden md:table-cell">Location &amp; Type</th>
                  <th className="text-left p-4 font-semibold">Price</th>
                  <th className="text-left p-4 font-semibold hidden lg:table-cell">Seller Contact</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-center p-4 font-semibold">Featured</th>
                  <th className="text-right p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p) => {
                  const firstImg =
                    Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null;
                  const thumbUrl = firstImg
                    ? isGoogleDriveImage(firstImg)
                      ? driveImageUrl(firstImg, 120)
                      : firstImg
                    : null;

                  return (
                    <tr
                      key={p.id}
                      className="admin-tr transition-colors"
                    >
                      {/* Property Title & Thumbnail */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {thumbUrl ? (
                            <img
                              src={thumbUrl}
                              alt=""
                              className="w-12 h-12 object-cover border border-[var(--admin-border)] rounded-md shrink-0 bg-[var(--admin-surface-2)]"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded-md flex items-center justify-center text-[var(--admin-text-muted)] text-xs shrink-0 font-mono">
                              N/A
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link
                              to={`/admin/resale/${p.id}/edit`}
                              className="font-serif-display text-sm font-medium text-[var(--admin-text-primary)] hover:text-[var(--admin-accent)] transition-colors block truncate max-w-[220px]"
                            >
                              {p.title}
                            </Link>
                            <div className="text-[10px] text-[var(--admin-text-muted)] font-mono">
                              ID: {p.id.slice(-6)} • {p.bedrooms ? `${p.bedrooms} BHK` : ""}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location & Type */}
                      <td className="p-4 text-xs text-[var(--admin-text-secondary)] hidden md:table-cell">
                        <div className="font-semibold text-[var(--admin-text-primary)]">{p.location || "Kolkata"}</div>
                        <div className="text-[11px] text-[var(--admin-text-muted)]">{p.propertyType || "Apartment"}</div>
                      </td>

                      {/* Price */}
                      <td className="p-4 font-mono font-semibold text-[var(--admin-accent)] text-xs whitespace-nowrap">
                        {formatPriceINR(p.price)}
                      </td>

                      {/* Seller Contact */}
                      <td className="p-4 text-xs text-[var(--admin-text-secondary)] hidden lg:table-cell">
                        <div className="font-medium text-[var(--admin-text-primary)]">{p.sellerName || "—"}</div>
                        <div className="text-[11px] font-mono text-[var(--admin-text-muted)]">{p.sellerPhone || ""}</div>
                      </td>

                      {/* Status */}
                      <td className="p-4 whitespace-nowrap">
                        <StatusBadge status={p.status || "Draft"} />
                      </td>

                      {/* Featured Star Toggle */}
                      <td className="p-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => toggleFeatured(p.id, p.featured)}
                          title={p.featured ? "Unmark Featured" : "Mark as Featured"}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            p.featured
                              ? "text-[var(--admin-accent)] bg-[var(--admin-surface-2)]"
                              : "text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)]"
                          }`}
                        >
                          <Star className={`w-4 h-4 ${p.featured ? "fill-[var(--admin-accent)] text-[var(--admin-accent)]" : ""}`} />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.status === "Published" && (
                            <Link
                              to={`/resale/${p.slug || p.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View Public Listing"
                              className="p-1.5 text-[var(--admin-text-secondary)] hover:text-[var(--admin-accent)] hover:bg-[var(--admin-surface-2)] rounded-md transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          )}
                          <Link
                            to={`/admin/resale/${p.id}/edit`}
                            title="Edit Listing"
                            className="p-1.5 text-[var(--admin-text-secondary)] hover:text-[var(--admin-accent)] hover:bg-[var(--admin-surface-2)] rounded-md transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          {user?.role === "admin" && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ id: p.id, title: p.title })}
                              title="Delete Listing"
                              className="p-1.5 text-[var(--admin-error)] hover:bg-[var(--admin-error-bg)] rounded-md transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Unified Pagination */}
          <AdminPagination
            totalItems={properties.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemLabel="resale listings"
          />
        </div>
      )}

      {/* Unified Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Permanently Delete Resale Property"
        itemName={deleteTarget?.title}
        itemType="Resale Property"
        warning="This action cannot be undone. The secondary market listing, floor plans, and seller submission details will be permanently deleted."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
