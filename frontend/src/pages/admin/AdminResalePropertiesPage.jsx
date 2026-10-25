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
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title }
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
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs uppercase tracking-[0.12em] font-semibold text-ivory/80 hover:text-white border border-copper/30 hover:border-copper rounded-[4px] transition-colors"
            >
              <span>Public Resale Board</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/admin/resale/new"
              data-testid="add-resale-property-btn"
              className="inline-flex items-center gap-2 px-4 py-2 bg-copper hover:bg-copper-light text-white font-semibold text-xs uppercase tracking-[0.12em] rounded-[4px] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Resale Property</span>
            </Link>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-charcoal-2/40 border border-copper/15 p-4 rounded-[6px] space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          {/* Text Search */}
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-ivory/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search title, locality, seller name, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-charcoal border border-copper/20 rounded-[4px] text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-copper"
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
              className="w-full h-9 px-3 bg-charcoal border border-copper/20 rounded-[4px] text-xs text-ivory focus:outline-none focus:border-copper"
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
              className="w-full h-9 px-3 bg-charcoal border border-copper/20 rounded-[4px] text-xs text-ivory focus:outline-none focus:border-copper"
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
            className="px-4 h-9 bg-copper hover:bg-copper-light text-white font-semibold rounded-[4px] text-xs tracking-wider uppercase transition-colors shadow-sm"
          >
            Filter
          </button>

          {/* Reset Button */}
          {(search || statusFilter !== "All" || typeFilter !== "All") && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 h-9 text-xs text-ivory/60 hover:text-ivory border border-copper/20 rounded-[4px] flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </form>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="text-ivory/50 text-center py-20 tracking-[0.3em] uppercase text-xs">
          Loading Resale Inventory…
        </div>
      ) : properties.length === 0 ? (
        <AdminEmptyState
          icon={Repeat}
          title="No resale properties found."
          message="Adjust your search criteria or add your first verified resale property listing."
          onClearFilters={
            search || statusFilter !== "All" || typeFilter !== "All"
              ? handleResetFilters
              : null
          }
        />
      ) : (
        <div className="border border-copper/15 rounded-[6px] overflow-hidden bg-charcoal-2/20 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-charcoal text-ivory/60 text-[10px] tracking-[0.22em] uppercase border-b border-copper/15">
                <tr>
                  <th className="text-left p-4 font-normal">Property</th>
                  <th className="text-left p-4 font-normal hidden md:table-cell">Location &amp; Type</th>
                  <th className="text-left p-4 font-normal">Price</th>
                  <th className="text-left p-4 font-normal hidden lg:table-cell">Seller Contact</th>
                  <th className="text-left p-4 font-normal">Status</th>
                  <th className="text-center p-4 font-normal">Featured</th>
                  <th className="text-right p-4 font-normal">Actions</th>
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
                      className="border-t border-copper/10 hover:bg-charcoal/50 transition-colors"
                    >
                      {/* Property Title & Thumbnail */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {thumbUrl ? (
                            <img
                              src={thumbUrl}
                              alt=""
                              className="w-12 h-12 object-cover border border-copper/20 rounded-[4px] shrink-0 bg-charcoal-2"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-charcoal-2/80 border border-copper/15 rounded-[4px] flex items-center justify-center text-ivory/30 text-xs shrink-0 font-mono">
                              N/A
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link
                              to={`/admin/resale/${p.id}/edit`}
                              className="text-ivory font-display text-sm font-medium hover:text-copper transition-colors block truncate max-w-[220px]"
                            >
                              {p.title}
                            </Link>
                            <div className="text-[10px] text-ivory/45 font-mono">
                              ID: {p.id.slice(-6)} • {p.bedrooms ? `${p.bedrooms} BHK` : ""}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location & Type */}
                      <td className="p-4 text-xs text-ivory/75 hidden md:table-cell">
                        <div className="font-medium text-ivory">{p.location || "Kolkata"}</div>
                        <div className="text-ivory/45 text-[11px]">{p.propertyType || "Apartment"}</div>
                      </td>

                      {/* Price */}
                      <td className="p-4 font-mono font-medium text-copper text-xs whitespace-nowrap">
                        {formatPriceINR(p.price)}
                      </td>

                      {/* Seller Contact */}
                      <td className="p-4 text-xs text-ivory/70 hidden lg:table-cell">
                        <div>{p.sellerName || "—"}</div>
                        <div className="text-ivory/45 text-[11px] font-mono">{p.sellerPhone || ""}</div>
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
                          className={`p-1.5 rounded transition-colors ${
                            p.featured
                              ? "text-copper bg-copper/10 hover:bg-copper/20"
                              : "text-ivory/30 hover:text-copper"
                          }`}
                        >
                          <Star className={`w-4 h-4 ${p.featured ? "fill-copper" : ""}`} />
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
                              className="p-1.5 text-ivory/60 hover:text-copper hover:bg-copper/10 rounded transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          )}
                          <Link
                            to={`/admin/resale/${p.id}/edit`}
                            title="Edit Listing"
                            className="p-1.5 text-ivory/60 hover:text-copper hover:bg-copper/10 rounded transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          {user?.role === "admin" && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ id: p.id, title: p.title })}
                              title="Delete Listing"
                              className="p-1.5 text-ivory/40 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
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
