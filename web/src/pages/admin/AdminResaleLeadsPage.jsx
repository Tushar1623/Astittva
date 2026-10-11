import { useEffect, useState } from "react";
import api, { formatApiErrorDetail } from "@/lib/api";
import { Search, RotateCcw, Trash2, Phone, Mail, MessageSquare, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

const STATUS_OPTIONS = ["All", "New", "Contacted", "Follow Up", "Site Visit", "Converted", "Closed"];

export default function AdminResaleLeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const loadLeads = () => {
    setLoading(true);
    const params = {};
    if (statusFilter !== "All") params.status = statusFilter;
    if (search.trim()) params.search = search.trim();

    api.get("/admin/leads/resale", { params })
      .then(({ data }) => {
        setLeads(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed to load resale leads");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLeads();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadLeads();
  };

  const handleReset = () => {
    setSearch("");
    setStatusFilter("All");
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/leads/resale/${id}`, { status });
      toast.success(`Lead status updated to ${status}`);
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed to update status");
    }
  };

  const deleteLead = async (id, name) => {
    if (!window.confirm(`Delete enquiry from ${name || "this user"} permanently?`)) return;
    try {
      await api.delete(`/admin/leads/resale/${id}`);
      toast.success("Resale lead deleted");
      setLeads((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed to delete lead");
    }
  };

  const getStatusBadge = (st) => {
    switch ((st || "").toLowerCase()) {
      case "new":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/30";
      case "contacted":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/30";
      case "follow up":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/30";
      case "site visit":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/30";
      case "converted":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
      case "closed":
        return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/30";
      default:
        return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/30";
    }
  };

  return (
    <div data-testid="admin-resale-leads-page">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 sm:mb-10">
        <div>
          <div className="overline mb-2 text-copper tracking-[0.25em] text-[11px] uppercase">
            Lead Management
          </div>
          <h1 className="font-display font-light text-3xl sm:text-4xl text-ivory">
            Resale Enquiries
          </h1>
          <p className="text-ivory/50 text-xs sm:text-sm mt-1">
            Dedicated secondary market buyer &amp; seller inquiries (resale_leads)
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-charcoal-2/40 border border-copper/15 p-4 rounded-md mb-6 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-ivory/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by lead name, phone, email, or property title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-charcoal-3/60 border border-copper/20 rounded text-xs text-ivory placeholder-ivory/40 focus:outline-none focus:border-copper"
            />
          </div>

          <div className="min-w-[160px]">
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

          <button
            type="submit"
            className="px-4 py-2 bg-copper/20 hover:bg-copper/30 border border-copper/40 text-copper rounded text-xs tracking-wider uppercase font-semibold transition-colors"
          >
            Filter
          </button>

          {(search || statusFilter !== "All") && (
            <button
              type="button"
              onClick={handleReset}
              className="p-2 text-ivory/50 hover:text-ivory transition-colors"
              title="Reset search"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-ivory/50 text-center py-16 tracking-[0.3em] uppercase text-xs">
          Loading resale enquiries...
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16 border border-copper/15 rounded bg-charcoal-2/20">
          <p className="text-ivory/60 font-light italic">
            No resale enquiries found matching the filters.
          </p>
        </div>
      ) : (
        <div className="border border-copper/15 rounded overflow-x-auto bg-charcoal-2/20">
          <table className="w-full text-sm min-w-[760px]" data-testid="resale-leads-table">
            <thead className="bg-charcoal-2/60 text-ivory/60 text-[10px] tracking-[0.25em] uppercase border-b border-copper/15">
              <tr>
                <th className="text-left p-4 font-normal">Enquirer</th>
                <th className="text-left p-4 font-normal">Contact</th>
                <th className="text-left p-4 font-normal">Resale Property</th>
                <th className="text-left p-4 font-normal">Message</th>
                <th className="text-left p-4 font-normal">Status</th>
                <th className="text-left p-4 font-normal">Received</th>
                <th className="text-right p-4 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr
                  key={l.id}
                  className="border-t border-copper/10 hover:bg-charcoal-2/40 transition-colors"
                >
                  {/* Lead Name */}
                  <td className="p-4">
                    <div className="text-ivory font-display font-medium text-sm">
                      {l.name || "Anonymous Enquiry"}
                    </div>
                    <div className="text-ivory/40 text-[11px]">
                      Source: {l.source || "resale-page"}
                    </div>
                  </td>

                  {/* Contact Info with Quick Actions */}
                  <td className="p-4">
                    <div className="space-y-1">
                      {l.phone && (
                        <a
                          href={`tel:${l.phone}`}
                          className="flex items-center gap-1.5 text-xs text-copper hover:underline"
                        >
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>{l.phone}</span>
                        </a>
                      )}
                      {l.email && (
                        <a
                          href={`mailto:${l.email}`}
                          className="flex items-center gap-1.5 text-[11px] text-ivory/60 hover:text-white truncate max-w-[180px]"
                        >
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{l.email}</span>
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Resale Property Title */}
                  <td className="p-4">
                    <div className="text-ivory text-xs max-w-[200px] truncate">
                      {l.propertyTitle || "General Resale Consultation"}
                    </div>
                    {l.resalePropertyId ? (
                      <Link
                        to={`/resale/${l.resalePropertyId}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[10px] text-copper hover:underline mt-0.5"
                      >
                        <span>View Listing</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    ) : (
                      <span className="text-[10px] text-ivory/40">Marketplace Desk</span>
                    )}
                  </td>

                  {/* Message */}
                  <td className="p-4">
                    <p className="text-xs text-ivory/70 max-w-[240px] line-clamp-2">
                      {l.message || "—"}
                    </p>
                  </td>

                  {/* Status Dropdown */}
                  <td className="p-4">
                    <select
                      value={l.status || "New"}
                      onChange={(e) => updateStatus(l.id, e.target.value)}
                      className={`text-[11px] uppercase tracking-wider font-semibold rounded px-2.5 py-1 focus:outline-none cursor-pointer ${getStatusBadge(
                        l.status
                      )}`}
                    >
                      <option value="New" className="bg-charcoal text-ivory">New</option>
                      <option value="Contacted" className="bg-charcoal text-ivory">Contacted</option>
                      <option value="Follow Up" className="bg-charcoal text-ivory">Follow Up</option>
                      <option value="Site Visit" className="bg-charcoal text-ivory">Site Visit</option>
                      <option value="Converted" className="bg-charcoal text-ivory">Converted</option>
                      <option value="Closed" className="bg-charcoal text-ivory">Closed</option>
                    </select>
                  </td>

                  {/* Date */}
                  <td className="p-4 text-xs text-ivory/50">
                    {l.createdAt
                      ? new Date(l.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    {user?.role === "admin" && (
                      <button
                        type="button"
                        onClick={() => deleteLead(l.id, l.name)}
                        title="Delete lead"
                        className="p-1.5 text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
