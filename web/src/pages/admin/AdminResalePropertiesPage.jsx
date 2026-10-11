import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api, { formatApiErrorDetail, isGoogleDriveImage, driveImageUrl } from "@/lib/api";
import { Plus, Pencil, Trash2, Star, Filter, Search, RotateCcw, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

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

  const loadProperties = () => {
    setLoading(true);
    const params = {};
    if (statusFilter !== "All") params.status = statusFilter;
    if (typeFilter !== "All") params.propertyType = typeFilter;
    if (search.trim()) params.search = search.trim();

    api.get("/admin/resale", { params })
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
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadProperties();
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setTypeFilter("All");
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/resale/${id}/status`, { status });
      toast.success(`Status updated to ${status}`);
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

  const deleteProperty = async (id, title) => {
    if (!window.confirm(`Permanently delete resale property: "${title || "Selected"}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/admin/resale/${id}`);
      toast.success("Resale property deleted");
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to delete resale property");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "published":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
      case "draft":
        return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/30";
      case "pending review":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/30";
      case "sold":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/30";
      case "inactive":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/30";
      default:
        return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/30";
    }
  };

  return (
    <div data-testid="admin-resale-page">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 sm:mb-10">
        <div>
          <div className="overline mb-2 text-copper tracking-[0.25em] text-[11px] uppercase">
            Secondary Market
          </div>
          <h1 className="font-display font-light text-3xl sm:text-4xl text-ivory">
            Resale Properties
          </h1>
          <p className="text-ivory/50 text-xs sm:text-sm mt-1">
            Dedicated secondary market inventory (resale_properties)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/resale"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs tracking-wider uppercase font-semibold text-ivory/70 hover:text-white border border-copper/20 hover:border-copper/50 rounded transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Public Page
          </Link>
          <Link
            to="/admin/resale/new"
            data-testid="add-resale-property-btn"
            className="btn-primary"
          >
            <Plus className="w-4 h-4" /> Add Resale Property
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-charcoal-2/40 border border-copper/15 p-4 rounded-md mb-6 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          {/* Text Search */}
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-ivory/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search title, locality, seller name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-charcoal-3/60 border border-copper/20 rounded text-xs text-ivory placeholder-ivory/40 focus:outline-none focus:border-copper"
            />
          </div>

          {/* Status Filter */}
          <div className="min-w-[140px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-charcoal-3/60 border border-copper/20 rounded text-xs text-ivory focus:outline-none focus:border-copper"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st} className="bg-charcoal text-ivory">
                  Status: {st}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="min-w-[150px]">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-charcoal-3/60 border border-copper/20 rounded text-xs text-ivory focus:outline-none focus:border-copper"
            >
              {PROPERTY_TYPES.map((tp) => (
                <option key={tp} value={tp} className="bg-charcoal text-ivory">
                  Type: {tp}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="px-4 py-2 bg-copper/20 hover:bg-copper/30 border border-copper/40 text-copper rounded text-xs tracking-wider uppercase font-semibold transition-colors"
          >
            Filter
          </button>

          {/* Reset Button */}
          {(search || statusFilter !== "All" || typeFilter !== "All") && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2 text-ivory/50 hover:text-ivory transition-colors"
              title="Reset filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="text-ivory/50 text-center py-16 tracking-[0.3em] uppercase text-xs">
          Loading Resale Properties...
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 border border-copper/15 rounded bg-charcoal-2/20">
          <p className="text-ivory/60 font-light italic mb-4">
            No resale properties found matching the selected filters.
          </p>
          <Link to="/admin/resale/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add First Resale Property
          </Link>
        </div>
      ) : (
        <div className="border border-copper/15 rounded overflow-x-auto bg-charcoal-2/20">
          <table className="w-full text-sm min-w-[850px]" data-testid="resale-properties-table">
            <thead className="bg-charcoal-2/60 text-ivory/60 text-[10px] tracking-[0.25em] uppercase border-b border-copper/15">
              <tr>
                <th className="text-left p-4 font-normal">Property</th>
                <th className="text-left p-4 font-normal">Location</th>
                <th className="text-left p-4 font-normal">Type</th>
                <th className="text-left p-4 font-normal">Price</th>
                <th className="text-left p-4 font-normal">Area</th>
                <th className="text-center p-4 font-normal">Featured</th>
                <th className="text-left p-4 font-normal">Status</th>
                <th className="text-left p-4 font-normal hidden lg:table-cell">Created</th>
                <th className="text-right p-4 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => {
                const img =
                  p.featuredImage ||
                  (Array.isArray(p.images) && p.images[0]) ||
                  null;
                const isDrive = img && isGoogleDriveImage(img);

                return (
                  <tr
                    key={p.id}
                    className="border-t border-copper/10 hover:bg-charcoal-2/40 transition-colors"
                  >
                    {/* Property Title & Thumbnail */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {img ? (
                          <img
                            loading="lazy"
                            src={isDrive ? driveImageUrl(img, 120) : img}
                            alt=""
                            className="w-12 h-12 object-cover rounded border border-copper/20"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-charcoal-3 border border-copper/15 rounded flex items-center justify-center text-copper/40 text-[9px] tracking-widest uppercase">
                            Resale
                          </div>
                        )}
                        <div className="min-w-0 max-w-[220px]">
                          <div className="text-ivory font-display font-normal text-sm truncate">
                            {p.title || "Untitled Property"}
                          </div>
                          <div className="text-ivory/50 text-[11px] truncate">
                            {p.bedrooms ? `${p.bedrooms} BHK` : ""}
                            {p.bedrooms && p.furnishingStatus ? " · " : ""}
                            {p.furnishingStatus || ""}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="p-4">
                      <div className="text-ivory text-xs">
                        {p.locality || p.location || "—"}
                      </div>
                      <div className="text-ivory/40 text-[11px]">{p.city || "Kolkata"}</div>
                    </td>

                    {/* Property Type */}
                    <td className="p-4">
                      <span className="text-xs text-ivory/80">{p.propertyType || "Apartment"}</span>
                      <div className="text-[10px] text-ivory/40">{p.listingType || "For Sale"}</div>
                    </td>

                    {/* Price */}
                    <td className="p-4">
                      <div className="text-copper font-medium text-xs">
                        {formatPriceINR(p.price)}
                      </div>
                      {p.pricePerSqFt ? (
                        <div className="text-[10px] text-ivory/40">
                          ₹{Number(p.pricePerSqFt).toLocaleString("en-IN")}/{p.areaUnit || "sq.ft."}
                        </div>
                      ) : null}
                    </td>

                    {/* Area */}
                    <td className="p-4 text-xs text-ivory/70">
                      {p.area ? `${p.area} ${p.areaUnit || "sq.ft."}` : "—"}
                    </td>

                    {/* Featured Toggle */}
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleFeatured(p.id, p.featured)}
                        title={p.featured ? "Featured property (click to unfeature)" : "Click to feature"}
                        className={`p-1.5 rounded transition-colors ${
                          p.featured
                            ? "text-amber-400 hover:text-amber-300 bg-amber-400/10"
                            : "text-ivory/20 hover:text-ivory/50 hover:bg-charcoal-3"
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </td>

                    {/* Status Dropdown */}
                    <td className="p-4">
                      <select
                        value={p.status || "Draft"}
                        onChange={(e) => updateStatus(p.id, e.target.value)}
                        className={`text-[11px] uppercase tracking-wider font-semibold rounded px-2.5 py-1 focus:outline-none cursor-pointer ${getStatusBadgeClass(
                          p.status
                        )}`}
                      >
                        <option value="Draft" className="bg-charcoal text-ivory">Draft</option>
                        <option value="Pending Review" className="bg-charcoal text-ivory">Pending Review</option>
                        <option value="Published" className="bg-charcoal text-ivory">Published</option>
                        <option value="Sold" className="bg-charcoal text-ivory">Sold</option>
                        <option value="Inactive" className="bg-charcoal text-ivory">Inactive</option>
                      </select>
                    </td>

                    {/* Created Date */}
                    <td className="p-4 text-ivory/40 text-xs hidden lg:table-cell">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/resale/${p.id}/edit`}
                          title="Edit property"
                          className="p-1.5 text-ivory/70 hover:text-copper hover:bg-charcoal-3 rounded transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        {user?.role === "admin" && (
                          <button
                            type="button"
                            onClick={() => deleteProperty(p.id, p.title)}
                            title="Delete property"
                            className="p-1.5 text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
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
      )}
    </div>
  );
}
