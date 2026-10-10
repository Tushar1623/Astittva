import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import { 
  Building2, Trash2, Eye, Phone, Mail, MapPin, 
  Calendar, UserCheck, Search, Filter, X, ArrowLeft, RefreshCw 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const STATUSES = [
  "New",
  "Contacted",
  "Site Visit",
  "Follow Up",
  "Converted",
  "Closed",
];

export default function AdminPropertyLeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedLead, setSelectedLead] = useState(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [editingAssignee, setEditingAssignee] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/admin/leads/property")
      .then(({ data }) => setLeads(data))
      .catch((e) => toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to load property leads"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/leads/property/${id}`, { status });
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status } : l))
      );
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead((prev) => ({ ...prev, status }));
      }
      toast.success(`Status updated to "${status}"`);
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to update status");
    }
  };

  const saveLeadDetails = async () => {
    if (!selectedLead) return;
    setSavingDetails(true);
    try {
      await api.patch(`/admin/leads/property/${selectedLead.id}`, {
        assignedTo: editingAssignee,
        notes: editingNotes,
      });
      setLeads((prev) =>
        prev.map((l) =>
          l.id === selectedLead.id
            ? { ...l, assignedTo: editingAssignee, notes: editingNotes }
            : l
        )
      );
      setSelectedLead((prev) => ({
        ...prev,
        assignedTo: editingAssignee,
        notes: editingNotes,
      }));
      toast.success("Lead details saved successfully");
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to save details");
    } finally {
      setSavingDetails(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this property lead?")) return;
    try {
      await api.delete(`/admin/leads/property/${id}`);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      if (selectedLead?.id === id) setSelectedLead(null);
      toast.success("Property lead deleted");
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to delete lead");
    }
  };

  const openDetails = (lead) => {
    setSelectedLead(lead);
    setEditingNotes(lead.notes || "");
    setEditingAssignee(lead.assignedTo || "Unassigned");
  };

  // Filter & Search
  const filteredLeads = leads.filter((l) => {
    const matchesStatus =
      statusFilter === "ALL" ||
      (l.status && l.status.toLowerCase() === statusFilter.toLowerCase());
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      (l.name && l.name.toLowerCase().includes(q)) ||
      (l.phone && l.phone.toLowerCase().includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.propertyName && l.propertyName.toLowerCase().includes(q)) ||
      (l.location && l.location.toLowerCase().includes(q)) ||
      (l.leadType && l.leadType.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  return (
    <div data-testid="admin-property-leads-page">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-copper">
              LEAD MANAGEMENT
            </span>
            <span className="text-ivory/30">•</span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-ivory/50">
              REAL ESTATE
            </span>
          </div>
          <h1 className="font-display font-light text-3xl sm:text-4xl text-ivory">
            Property Leads
          </h1>
          <p className="text-ivory/55 text-sm mt-1">
            Enquiries from property listings, site visits, and private property consultations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/leads/careers"
            className="inline-flex items-center gap-2 px-4 py-2 border border-copper/30 hover:border-copper text-xs font-semibold uppercase tracking-[0.15em] text-ivory/80 hover:text-white rounded-[4px] transition-colors"
          >
            <span>View Career Applications</span>
            <span>→</span>
          </Link>
          <button
            onClick={load}
            disabled={loading}
            title="Refresh"
            className="p-2 border border-copper/20 hover:border-copper/40 text-ivory/70 hover:text-copper rounded-[4px] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-charcoal-2/40 border border-copper/15 p-4 rounded-[6px] mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {["ALL", ...STATUSES].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-medium tracking-[0.08em] transition-all ${
                statusFilter === st
                  ? "bg-copper text-charcoal font-semibold shadow-sm"
                  : "bg-charcoal/50 text-ivory/70 hover:text-ivory hover:bg-charcoal"
              }`}
            >
              {st}
              {st === "ALL" ? ` (${leads.length})` : ""}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ivory/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search leads..."
            className="w-full h-9 pl-9 pr-3 bg-charcoal border border-copper/20 rounded-[4px] text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-copper"
          />
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="text-ivory/50 text-center py-20 tracking-[0.3em] uppercase text-xs">
          Loading Property Leads...
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-20 border border-copper/15 bg-charcoal-2/20 text-ivory/60 italic rounded-[6px]">
          {leads.length === 0
            ? "No property leads registered yet."
            : "No leads matched your search/filter criteria."}
        </div>
      ) : (
        <div className="border border-copper/15 rounded-[6px] overflow-hidden bg-charcoal-2/20">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="property-leads-table">
              <thead className="bg-charcoal-2/80 text-ivory/60 text-[10px] tracking-[0.22em] uppercase border-b border-copper/15">
                <tr>
                  <th className="text-left p-4 font-normal">Name</th>
                  <th className="text-left p-4 font-normal">Phone</th>
                  <th className="text-left p-4 font-normal hidden md:table-cell">Email</th>
                  <th className="text-left p-4 font-normal">Property</th>
                  <th className="text-left p-4 font-normal hidden lg:table-cell">Location</th>
                  <th className="text-left p-4 font-normal">Lead Type</th>
                  <th className="text-left p-4 font-normal">Status</th>
                  <th className="text-left p-4 font-normal hidden xl:table-cell">Assigned To</th>
                  <th className="text-right p-4 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-copper/10">
                {filteredLeads.map((l) => (
                  <tr
                    key={l.id}
                    className="hover:bg-charcoal-2/50 transition-colors cursor-pointer"
                    onClick={() => openDetails(l)}
                  >
                    <td className="p-4">
                      <div className="font-medium text-ivory">{l.name}</div>
                      <div className="text-[11px] text-ivory/40 mt-0.5">
                        {new Date(l.createdAt || l.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="p-4 text-ivory/80 whitespace-nowrap">
                      {l.phone ? (
                        <a
                          href={`tel:${l.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-copper transition-colors"
                        >
                          {l.phone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-4 text-ivory/70 hidden md:table-cell max-w-[180px] truncate">
                      {l.email ? (
                        <a
                          href={`mailto:${l.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-copper transition-colors"
                        >
                          {l.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-4 text-ivory/90 font-medium max-w-[180px] truncate">
                      {l.propertyName || "—"}
                    </td>
                    <td className="p-4 text-ivory/70 hidden lg:table-cell max-w-[140px] truncate">
                      {l.location || "—"}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.08em] uppercase rounded-[3px] bg-[#C89A55]/15 text-[#E6BF80] border border-[#C89A55]/25">
                        {l.leadType || "Enquiry"}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={l.status || "New"}
                        onChange={(e) => updateStatus(l.id, e.target.value)}
                        data-testid={`lead-status-${l.id}`}
                        className="bg-charcoal border border-copper/30 text-ivory text-xs px-2.5 py-1.5 rounded-[4px] focus:outline-none focus:border-copper"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-ivory/60 text-xs hidden xl:table-cell whitespace-nowrap">
                      {l.assignedTo || "Unassigned"}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetails(l)}
                          title="View Details"
                          className="p-1.5 text-ivory/60 hover:text-copper hover:bg-copper/10 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {user?.role === "admin" && (
                          <button
                            onClick={() => remove(l.id)}
                            title="Delete Lead"
                            className="p-1.5 text-ivory/50 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                            data-testid={`delete-lead-${l.id}`}
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
        </div>
      )}

      {/* LEAD DETAILS MODAL / DRAWER */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#1A1817] border border-copper/30 rounded-[10px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-copper/15 pb-5 mb-6">
              <div>
                <span className="text-[10.5px] font-semibold tracking-[0.2em] uppercase text-copper">
                  PROPERTY LEAD DETAILS
                </span>
                <h2 className="font-display text-2xl text-ivory mt-1">
                  {selectedLead.name}
                </h2>
                <div className="flex items-center gap-3 text-xs text-ivory/50 mt-1">
                  <span>
                    Received:{" "}
                    {new Date(selectedLead.createdAt || selectedLead.created_at).toLocaleString()}
                  </span>
                  <span>•</span>
                  <span>Source: {selectedLead.source || "Website"}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 text-ivory/60 hover:text-copper transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid Sections */}
            <div className="space-y-6">
              {/* Property & Lead Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-[6px] bg-charcoal/60 border border-copper/15">
                <div>
                  <span className="text-[10px] tracking-[0.18em] uppercase text-copper block mb-1">
                    Property Name
                  </span>
                  <p className="text-sm font-medium text-ivory">
                    {selectedLead.propertyName || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.18em] uppercase text-copper block mb-1">
                    Location
                  </span>
                  <p className="text-sm text-ivory/80">
                    {selectedLead.location || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.18em] uppercase text-copper block mb-1">
                    Lead Type
                  </span>
                  <p className="text-sm font-semibold text-[#E6BF80]">
                    {selectedLead.leadType || "Property Enquiry"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.18em] uppercase text-copper block mb-1">
                    Property ID
                  </span>
                  <p className="text-xs font-mono text-ivory/60">
                    {selectedLead.propertyId || "—"}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-4 rounded-[6px] bg-charcoal/60 border border-copper/15 space-y-3">
                <span className="text-[10px] tracking-[0.18em] uppercase text-copper block">
                  Contact Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-copper shrink-0" />
                    <a
                      href={`tel:${selectedLead.phone}`}
                      className="text-ivory hover:text-copper underline-offset-2 hover:underline"
                    >
                      {selectedLead.phone || "No phone provided"}
                    </a>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-copper shrink-0" />
                    <a
                      href={`mailto:${selectedLead.email}`}
                      className="text-ivory hover:text-copper underline-offset-2 hover:underline truncate"
                    >
                      {selectedLead.email || "No email provided"}
                    </a>
                  </div>
                </div>
              </div>

              {/* Message */}
              {selectedLead.message && (
                <div className="p-4 rounded-[6px] bg-charcoal/60 border border-copper/15">
                  <span className="text-[10px] tracking-[0.18em] uppercase text-copper block mb-2">
                    Client Message / Notes
                  </span>
                  <p className="text-sm text-ivory/80 leading-relaxed whitespace-pre-wrap">
                    {selectedLead.message}
                  </p>
                </div>
              )}

              {/* Management: Status & Assignment */}
              <div className="p-4 rounded-[6px] bg-charcoal/60 border border-copper/15 space-y-4">
                <span className="text-[10px] tracking-[0.18em] uppercase text-copper block">
                  Lead Management &amp; Assignment
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.1em] text-ivory/60 block mb-1.5">
                      Status
                    </label>
                    <select
                      value={selectedLead.status || "New"}
                      onChange={(e) => updateStatus(selectedLead.id, e.target.value)}
                      className="w-full h-9 px-3 bg-charcoal border border-copper/25 rounded-[4px] text-xs text-ivory focus:outline-none focus:border-copper"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.1em] text-ivory/60 block mb-1.5">
                      Assigned Agent
                    </label>
                    <input
                      type="text"
                      value={editingAssignee}
                      onChange={(e) => setEditingAssignee(e.target.value)}
                      placeholder="e.g. Sales Desk / Rohan Gupta"
                      className="w-full h-9 px-3 bg-charcoal border border-copper/25 rounded-[4px] text-xs text-ivory focus:outline-none focus:border-copper"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-[0.1em] text-ivory/60 block mb-1.5">
                    Internal Advisory Notes
                  </label>
                  <textarea
                    rows={3}
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    placeholder="Log client call notes, preferences, or scheduled site visits..."
                    className="w-full p-3 bg-charcoal border border-copper/25 rounded-[4px] text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-copper"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={saveLeadDetails}
                    disabled={savingDetails}
                    className="px-5 py-2 bg-copper hover:bg-copper-light text-charcoal font-semibold text-xs tracking-[0.12em] uppercase rounded-[4px] transition-colors"
                  >
                    {savingDetails ? "Saving…" : "Save Details"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
