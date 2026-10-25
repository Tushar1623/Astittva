import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api, {
  formatApiErrorDetail,
  isGoogleDriveImage,
  driveImageUrl,
  driveDirectFallbackUrl,
  fileUrl,
} from "@/lib/api";
import { pickPropertyFallback } from "@/components/PropertyCard";
import { Plus, Pencil, Trash2, Eye, EyeOff, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import AdminHeader from "@/components/admin/AdminHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminEmptyState from "@/components/admin/AdminEmptyState";

export default function AdminPropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [isDeleting, setIsDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/admin/properties")
      .then(({ data }) => setProperties(Array.isArray(data) ? data : []))
      .catch((e) => {
        setProperties([]);
        toast.error(formatApiErrorDetail(e.response?.data?.detail));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id, status) => {
    try {
      await api.patch(`/admin/properties/${id}/status`, { status });
      toast.success(`Property status updated to "${status}"`);
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    }
  };

  const confirmRemove = async () => {
    if (!deleteTarget || isDeleting) return;
    try {
      setIsDeleting(true);
      await api.delete(`/admin/properties/${deleteTarget.id}`);
      toast.success("Property deleted successfully");
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to delete property");
    } finally {
      setIsDeleting(false);
    }
  };

  // Status Counts
  const statusCounts = useMemo(() => {
    let pub = 0;
    let drf = 0;
    properties.forEach((p) => {
      if (p.status === "published") pub++;
      else drf++;
    });
    return {
      published: pub,
      draft: drf,
    };
  }, [properties]);

  // Filtered List
  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "published" && p.status === "published") ||
        (statusFilter === "draft" && p.status !== "published");

      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (p.project_name && p.project_name.toLowerCase().includes(q)) ||
        (p.builder && p.builder.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.property_type && p.property_type.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [properties, statusFilter, search]);

  // Paginated List
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  return (
    <div data-testid="admin-properties-page" className="space-y-6">
      {/* Unified Header */}
      <AdminHeader
        category="INVENTORY"
        subcategory="PORTFOLIO"
        title="Properties"
        subtitle="Manage luxury residential projects, commercial towers, floor plans, pricing, and public showcase status."
        onRefresh={load}
        refreshing={loading}
        actions={
          <Link
            to="/admin/properties/new"
            data-testid="add-property-btn"
            className="inline-flex items-center gap-2 px-4 py-2 bg-copper hover:bg-copper-light text-white font-semibold text-xs uppercase tracking-[0.12em] rounded-[4px] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <AdminFilterBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search project, builder, city, type..."
        statusFilter={statusFilter}
        onStatusChange={(st) => {
          setStatusFilter(st);
          setCurrentPage(1);
        }}
        statusOptions={["ALL", "published", "draft"]}
        statusCounts={statusCounts}
        totalCount={properties.length}
      />

      {/* Main Table */}
      {loading ? (
        <div className="text-ivory/50 text-center py-20 tracking-[0.3em] uppercase text-xs">
          Loading Properties…
        </div>
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          icon={Building2}
          title={statusFilter === "ALL" && !search ? "No properties created yet." : "No properties matched your search."}
          message={
            statusFilter === "ALL" && !search
              ? "Create your first luxury development project using the button above."
              : "Try adjusting your search keywords or filter status."
          }
          onClearFilters={
            statusFilter !== "ALL" || search
              ? () => {
                  setStatusFilter("ALL");
                  setSearch("");
                }
              : null
          }
        />
      ) : (
        <div className="border border-copper/15 rounded-[6px] overflow-hidden bg-charcoal-2/20 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]" data-testid="properties-table">
              <thead className="bg-charcoal text-ivory/60 text-[10px] tracking-[0.22em] uppercase border-b border-copper/15">
                <tr>
                  <th className="text-left p-4 font-normal">Project &amp; Builder</th>
                  <th className="text-left p-4 font-normal hidden md:table-cell">City &amp; Location</th>
                  <th className="text-left p-4 font-normal hidden lg:table-cell">Type &amp; Category</th>
                  <th className="text-left p-4 font-normal">Status</th>
                  <th className="text-right p-4 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-copper/10 hover:bg-charcoal/50 transition-colors"
                  >
                    {/* Project */}
                    <td className="p-4">
                      <div className="flex items-center gap-3.5">
                        {(() => {
                          const fallback = pickPropertyFallback(p.id);
                          const driveImg = (p.images || []).find(isGoogleDriveImage);
                          const anyHttpImg = (p.images || []).find(
                            (img) =>
                              typeof img === "string" &&
                              (img.startsWith("http") || img.startsWith("/uploads/")) &&
                              !img.includes("astitva-realestate")
                          );
                          const imgSrc = driveImg
                            ? driveImageUrl(driveImg, 150)
                            : anyHttpImg
                            ? fileUrl(anyHttpImg, 150)
                            : p.images?.[0]
                            ? fileUrl(p.images[0], 150)
                            : fallback || fallback;
                          return (
                            <img
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              src={imgSrc}
                              alt=""
                              className="w-12 h-12 object-cover border border-copper/20 rounded-[4px] shrink-0 bg-charcoal-2"
                              onError={(e) => {
                                const currentSrc = e.currentTarget.src || "";
                                if (driveImg && currentSrc.includes("googleusercontent.com")) {
                                  e.currentTarget.src = driveDirectFallbackUrl(driveImg, 150);
                                  return;
                                }
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = fallback;
                              }}
                            />
                          );
                        })()}
                        <div className="min-w-0">
                          <Link
                            to={`/admin/properties/${p.id}/edit`}
                            className="text-ivory font-display text-sm font-medium hover:text-copper transition-colors block truncate max-w-[220px]"
                          >
                            {p.project_name}
                          </Link>
                          <div className="text-ivory/50 text-xs truncate max-w-[200px]">
                            {p.builder || "—"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* City & Location */}
                    <td className="p-4 text-xs text-ivory/75 hidden md:table-cell">
                      <div className="font-medium text-ivory">{p.city || "Kolkata"}</div>
                      <div className="text-ivory/45 text-[11px] truncate max-w-[180px]">
                        {p.location || "—"}
                      </div>
                    </td>

                    {/* Type & Category */}
                    <td className="p-4 text-xs text-ivory/70 hidden lg:table-cell">
                      <div>{p.property_type || "Residential"}</div>
                      <div className="text-copper/80 text-[10px] tracking-wider uppercase">
                        {p.property_category || "Luxury"}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 whitespace-nowrap">
                      <StatusBadge status={p.status || "draft"} />
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.status !== "published" ? (
                          <button
                            type="button"
                            onClick={() => setStatus(p.id, "published")}
                            title="Publish Live"
                            className="p-1.5 text-ivory/60 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors"
                            data-testid={`publish-${p.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setStatus(p.id, "unpublished")}
                            title="Unpublish (Save as Draft)"
                            className="p-1.5 text-ivory/60 hover:text-amber-400 hover:bg-amber-500/10 rounded transition-colors"
                            data-testid={`unpublish-${p.id}`}
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}

                        <Link
                          to={`/admin/properties/${p.id}/edit`}
                          className="p-1.5 text-ivory/60 hover:text-copper hover:bg-copper/10 rounded transition-colors"
                          title="Edit Property"
                          data-testid={`edit-${p.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>

                        {user?.role === "admin" && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ id: p.id, name: p.project_name })}
                            className="p-1.5 text-ivory/40 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                            title="Delete Property"
                            data-testid={`delete-${p.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Unified Pagination */}
          <AdminPagination
            totalItems={filtered.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemLabel="properties"
          />
        </div>
      )}

      {/* Unified Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Permanently Delete Property"
        itemName={deleteTarget?.name}
        itemType="Property"
        warning="This action cannot be undone. All project details, specifications, and associated media links will be permanently deleted."
        onConfirm={confirmRemove}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
