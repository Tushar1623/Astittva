import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import {
  Building2,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  UserCheck,
  Search,
  Filter,
  X,
  ArrowLeft,
  RefreshCw,
  Inbox,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AdminHeader from "@/components/admin/AdminHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminEmptyState from "@/components/admin/AdminEmptyState";

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

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Selected Lead Details
  const [selectedLead, setSelectedLead] = useState(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [editingAssignee, setEditingAssignee] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name, propertyName }
  const [isDeleting, setIsDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/admin/leads/property")
      .then(({ data }) => setLeads(Array.isArray(data) ? data : []))
      .catch((e) => {
        setLeads([]);
        toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to load property leads");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/leads/property/${id}`, { status });
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead((prev) => ({ ...prev, status }));
      }
      toast.success(`Lead status updated to "${status}"`);
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

  const confirmRemove = async () => {
    if (!deleteTarget || isDeleting) return;
    try {
      setIsDeleting(true);
      await api.delete(`/admin/leads/property/${deleteTarget.id}`);
      setLeads((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      if (selectedLead?.id === deleteTarget.id) setSelectedLead(null);
      toast.success("Property lead deleted successfully");
      setDeleteTarget(null);
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to delete lead");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDetails = (lead) => {
    setSelectedLead(lead);
    setEditingNotes(lead.notes || "");
    setEditingAssignee(lead.assignedTo || "Unassigned");
  };

  // Status Counts
  const statusCounts = useMemo(() => {
    const counts = {};
    STATUSES.forEach((s) => (counts[s] = 0));
    leads.forEach((l) => {
      const st = l.status || "New";
      const match = STATUSES.find((s) => s.toLowerCase() === st.toLowerCase());
      if (match) counts[match]++;
    });
    return counts;
  }, [leads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        (l.status && l.status.toLowerCase() === statusFilter.toLowerCase());
      const q = searchTerm.trim().toLowerCase();
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
  }, [leads, statusFilter, searchTerm]);

  // Paginated Leads
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  return (
    <div data-testid="admin-property-leads-page" className="space-y-6">
      {/* Unified Header */}
      <AdminHeader
        category="LEAD MANAGEMENT"
        subcategory="PORTFOLIO INQUIRIES"
        title="Property Leads"
        subtitle="Inquiries from luxury development listings, site inspection bookings, and private consultation requests."
        onRefresh={load}
        refreshing={loading}
        actions={
          <Link
            to="/admin/leads/resale"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-copper/30 hover:border-copper text-xs font-semibold uppercase tracking-[0.12em] text-ivory/80 hover:text-white rounded-[4px] transition-colors"
          >
            <span>Resale Leads</span>
            <span>→</span>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <AdminFilterBar
        search={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search client name, phone, project, location..."
        statusFilter={statusFilter}
        onStatusChange={(st) => {
          setStatusFilter(st);
          setCurrentPage(1);
        }}
        statusOptions={["ALL", ...STATUSES]}
        statusCounts={statusCounts}
        totalCount={leads.length}
      />

      {/* Main Table */}
      {loading ? (
        <div className="text-ivory/50 text-center py-20 tracking-[0.3em] uppercase text-xs">
          Loading Property Leads…
        </div>
      ) : filteredLeads.length === 0 ? (
        <AdminEmptyState
          icon={Inbox}
          title={statusFilter === "ALL" && !searchTerm ? "No property leads recorded yet." : "No leads matched your search."}
          message="Client consultation requests from property landing pages will appear here in real-time."
          onClearFilters={
            statusFilter !== "ALL" || searchTerm
              ? () => {
                  setStatusFilter("ALL");
                  setSearchTerm("");
                }
              : null
          }
        />
      ) : (
        <div className="border border-copper/15 rounded-[6px] overflow-hidden bg-charcoal-2/20 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-charcoal text-ivory/60 text-[10px] tracking-[0.22em] uppercase border-b border-copper/15">
                <tr>
                  <th className="text-left p-4 font-normal">Client Name</th>
                  <th className="text-left p-4 font-normal">Property Interest</th>
                  <th className="text-left p-4 font-normal hidden md:table-cell">Contact</th>
                  <th className="text-left p-4 font-normal hidden lg:table-cell">Received Date</th>
                  <th className="text-left p-4 font-normal">Status</th>
                  <th className="text-left p-4 font-normal hidden sm:table-cell">Assigned To</th>
                  <th className="text-right p-4 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeads.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => openDetails(l)}
                    className="border-t border-copper/10 hover:bg-charcoal/50 transition-colors cursor-pointer group"
                  >
                    {/* Client Name */}
                    <td className="p-4">
                      <div className="font-medium text-ivory text-sm group-hover:text-copper transition-colors">
                        {l.name}
                      </div>
                      <div className="text-[10px] text-ivory/40 font-mono mt-0.5">
                        {l.source || "Website Enquiry"}
                      </div>
                    </td>

                    {/* Property Interest */}
                    <td className="p-4">
                      <div className="text-xs text-ivory font-medium truncate max-w-[200px]">
                        {l.propertyName || "General Inquiry"}
                      </div>
                      <div className="text-[11px] text-ivory/45 truncate max-w-[180px]">
                        {l.location || "Kolkata"}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="p-4 text-xs text-ivory/70 hidden md:table-cell" onClick={(e) => e.stopPropagation()}>
                      <a href={`tel:${l.phone}`} className="hover:text-copper block font-mono text-[11px]">
                        {l.phone || "—"}
                      </a>
                      <a href={`mailto:${l.email}`} className="text-ivory/45 hover:text-copper block truncate max-w-[160px] text-[11px] mt-0.5">
                        {l.email || "—"}
                      </a>
                    </td>

                    {/* Received Date */}
                    <td className="p-4 text-xs text-ivory/60 hidden lg:table-cell font-mono whitespace-nowrap">
                      {l.createdAt || l.created_at
                        ? new Date(l.createdAt || l.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 whitespace-nowrap">
                      <StatusBadge status={l.status || "New"} />
                    </td>

                    {/* Assigned To */}
                    <td className="p-4 text-xs text-ivory/70 hidden sm:table-cell whitespace-nowrap">
                      {l.assignedTo && l.assignedTo !== "Unassigned" ? (
                        <span className="text-ivory font-medium">{l.assignedTo}</span>
                      ) : (
                        <span className="text-ivory/40 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openDetails(l)}
                          title="View Lead Profile"
                          className="p-1.5 text-ivory/60 hover:text-copper hover:bg-copper/10 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {user?.role === "admin" && (
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({
                                id: l.id,
                                name: l.name,
                                propertyName: l.propertyName,
                              })
                            }
                            title="Delete Lead"
                            className="p-1.5 text-ivory/40 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
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

          {/* Unified Pagination */}
          <AdminPagination
            totalItems={filteredLeads.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemLabel="leads"
          />
        </div>
      )}

      {/* LEAD DETAILS SLIDE-OVER SIDE PANEL / MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#18181b] border border-copper/30 rounded-[10px] max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 text-ivory">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-copper/15 pb-5 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-copper">
                    LEAD DOSSIER
                  </span>
                  <span className="text-ivory/30">•</span>
                  <StatusBadge status={selectedLead.status || "New"} />
                </div>
                <h2 className="font-display text-2xl text-ivory mt-1">{selectedLead.name}</h2>
                <div className="flex items-center gap-3 text-xs text-ivory/50 mt-1">
                  <span>
                    Received:{" "}
                    {new Date(selectedLead.createdAt || selectedLead.created_at).toLocaleString("en-IN")}
                  </span>
                  <span>•</span>
                  <span>Source: {selectedLead.source || "Website Enquiry"}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="p-2 text-ivory/60 hover:text-copper hover:bg-charcoal rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid Sections */}
            <div className="space-y-6">
              {/* Property & Lead Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-[6px] bg-charcoal/60 border border-copper/15 text-xs">
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper block mb-1">
                    Property of Interest
                  </span>
                  <p className="text-ivory font-medium text-sm">
                    {selectedLead.propertyName || "General Inquiry"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper block mb-1">
                    Target Locality / Location
                  </span>
                  <p className="text-ivory font-medium">
                    {selectedLead.location || "Kolkata, West Bengal"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper block mb-1">
                    Inquiry Type
                  </span>
                  <p className="text-copper font-semibold">
                    {selectedLead.leadType || "Property Enquiry"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper block mb-1">
                    Property ID Reference
                  </span>
                  <p className="text-ivory/60 font-mono">
                    {selectedLead.propertyId || "—"}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-5 rounded-[6px] bg-charcoal/60 border border-copper/15 space-y-3">
                <span className="text-[10px] tracking-[0.2em] uppercase text-copper font-semibold block">
                  Contact Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-copper shrink-0" />
                    <a
                      href={`tel:${selectedLead.phone}`}
                      className="text-ivory hover:text-copper font-mono"
                    >
                      {selectedLead.phone || "No phone provided"}
                    </a>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-copper shrink-0" />
                    <a
                      href={`mailto:${selectedLead.email}`}
                      className="text-ivory hover:text-copper truncate"
                    >
                      {selectedLead.email || "No email provided"}
                    </a>
                  </div>
                </div>
              </div>

              {/* Client Message */}
              {selectedLead.message && (
                <div className="p-5 rounded-[6px] bg-charcoal/60 border border-copper/15 text-xs">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-copper font-semibold block mb-2">
                    Client Message / Inquiry Details
                  </span>
                  <p className="text-ivory/85 leading-relaxed whitespace-pre-wrap bg-[#18181b] p-3 rounded border border-copper/10 font-sans">
                    {selectedLead.message}
                  </p>
                </div>
              )}

              {/* Management: Status & Assignment */}
              <div className="p-5 rounded-[6px] bg-charcoal/60 border border-copper/15 space-y-4">
                <span className="text-[10px] tracking-[0.2em] uppercase text-copper font-semibold block">
                  Lead Status &amp; Sales Representative
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.15em] text-copper block mb-1.5 font-semibold">
                      Pipeline Status
                    </label>
                    <select
                      value={selectedLead.status || "New"}
                      onChange={(e) => updateStatus(selectedLead.id, e.target.value)}
                      className="w-full h-10 px-3 bg-[#18181b] border border-copper/25 rounded-[4px] text-xs text-ivory focus:outline-none focus:border-copper"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-[0.15em] text-copper block mb-1.5 font-semibold">
                      Assigned Sales Advisory
                    </label>
                    <input
                      type="text"
                      value={editingAssignee}
                      onChange={(e) => setEditingAssignee(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full h-10 px-3 bg-[#18181b] border border-copper/20 rounded-[4px] text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-copper"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-[10px] uppercase tracking-[0.15em] text-copper block mb-1.5 font-semibold">
                    Internal Sales &amp; Follow-up Notes
                  </label>
                  <textarea
                    rows={3}
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    placeholder="Log site visit scheduling, client budget, preferences, or consultation outcome..."
                    className="w-full p-3 bg-[#18181b] border border-copper/20 rounded-[4px] text-xs text-ivory placeholder:text-ivory/40 focus:outline-none focus:border-copper"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    disabled={savingDetails}
                    onClick={saveLeadDetails}
                    className="px-4 py-2 bg-copper hover:bg-copper-light text-white font-semibold text-xs uppercase tracking-[0.12em] rounded-[4px] transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {savingDetails ? "Saving Details…" : "Save Lead Details"}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-copper/15 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 border border-copper/20 hover:border-copper/40 text-ivory/70 hover:text-ivory text-xs uppercase tracking-[0.1em] rounded-[4px] transition-colors"
              >
                Close
              </button>
              {user?.role === "admin" && (
                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget({
                      id: selectedLead.id,
                      name: selectedLead.name,
                      propertyName: selectedLead.propertyName,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-950/40 border border-red-500/30 hover:bg-red-900/60 text-red-400 hover:text-red-200 text-xs uppercase tracking-[0.1em] rounded-[4px] transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Lead</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Unified Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Permanently Delete Property Lead"
        itemName={deleteTarget?.name}
        itemType="Property Lead"
        warning="This action cannot be undone. All client contact information, inquiry message, and internal sales notes will be permanently removed."
        onConfirm={confirmRemove}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
