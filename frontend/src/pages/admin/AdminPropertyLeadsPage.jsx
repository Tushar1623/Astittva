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
  Calendar,
  X,
  RefreshCw,
  Inbox,
  UserCheck,
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
  const [deleteTarget, setDeleteTarget] = useState(null);
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
    leads.forEach((l) => {
      const s = l.status || "New";
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [leads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        (l.status || "New").toLowerCase() === statusFilter.toLowerCase();

      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.phone && l.phone.toLowerCase().includes(q)) ||
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.propertyName && l.propertyName.toLowerCase().includes(q)) ||
        (l.location && l.location.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [leads, statusFilter, searchTerm]);

  // Paginated
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  return (
    <div data-testid="admin-property-leads-page" className="space-y-6">
      {/* Header */}
      <AdminHeader
        category="Lead Management"
        subcategory="Direct Consultations"
        title="Property Inquiries"
        subtitle="Manage client consultations, site-visit schedules, developer referrals, and sales assignments."
        onRefresh={load}
        refreshing={loading}
        actions={
          <Link
            to="/admin/leads/resale"
            className="btn-admin-secondary text-xs"
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
        <div className="text-[var(--admin-text-muted)] text-center py-20 tracking-[0.25em] uppercase text-xs flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 text-[var(--admin-accent)] animate-spin" />
          <span>Loading Property Leads…</span>
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
        <div className="admin-table-wrap">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="admin-thead">
                <tr>
                  <th className="text-left p-4 font-semibold">Client Name</th>
                  <th className="text-left p-4 font-semibold">Property Interest</th>
                  <th className="text-left p-4 font-semibold hidden md:table-cell">Contact</th>
                  <th className="text-left p-4 font-semibold hidden lg:table-cell">Received Date</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold hidden sm:table-cell">Assigned To</th>
                  <th className="text-right p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeads.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => openDetails(l)}
                    className="admin-tr transition-colors cursor-pointer group"
                  >
                    {/* Client Name */}
                    <td className="p-4">
                      <div className="font-semibold text-[var(--admin-text-primary)] text-sm group-hover:text-[var(--admin-accent)] transition-colors">
                        {l.name}
                      </div>
                      <div className="text-[10px] text-[var(--admin-text-muted)] font-mono mt-0.5">
                        {l.source || "Website Enquiry"}
                      </div>
                    </td>

                    {/* Property Interest */}
                    <td className="p-4">
                      <div className="text-xs font-semibold text-[var(--admin-text-primary)] truncate max-w-[200px]">
                        {l.propertyName || "General Inquiry"}
                      </div>
                      <div className="text-[11px] text-[var(--admin-text-muted)] truncate max-w-[180px]">
                        {l.location || "Kolkata"}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="p-4 text-xs text-[var(--admin-text-secondary)] hidden md:table-cell" onClick={(e) => e.stopPropagation()}>
                      <a href={`tel:${l.phone}`} className="hover:text-[var(--admin-accent)] block font-mono text-[11px] font-semibold">
                        {l.phone || "—"}
                      </a>
                      <a href={`mailto:${l.email}`} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] block truncate max-w-[160px] text-[11px] mt-0.5">
                        {l.email || "—"}
                      </a>
                    </td>

                    {/* Received Date */}
                    <td className="p-4 text-xs text-[var(--admin-text-secondary)] hidden lg:table-cell font-mono whitespace-nowrap">
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
                    <td className="p-4 text-xs text-[var(--admin-text-secondary)] hidden sm:table-cell whitespace-nowrap">
                      {l.assignedTo && l.assignedTo !== "Unassigned" ? (
                        <span className="text-[var(--admin-text-primary)] font-semibold">{l.assignedTo}</span>
                      ) : (
                        <span className="text-[var(--admin-text-muted)] italic">Unassigned</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openDetails(l)}
                          title="View Lead Profile"
                          className="p-1.5 text-[var(--admin-text-secondary)] hover:text-[var(--admin-accent)] hover:bg-[var(--admin-surface-2)] rounded-md transition-colors cursor-pointer"
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
                            className="p-1.5 text-[var(--admin-error)] hover:bg-[var(--admin-error-bg)] rounded-md transition-colors cursor-pointer"
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

          {/* Pagination */}
          <AdminPagination
            totalItems={filteredLeads.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemLabel="inquiries"
          />
        </div>
      )}

      {/* LEAD DETAILS SLIDE-OVER MODAL */}
      {selectedLead && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fadeIn"
        >
          <div
            className="rounded-xl border max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 transition-colors"
            style={{
              backgroundColor: "var(--admin-surface)",
              borderColor: "var(--admin-border)",
              color: "var(--admin-text-primary)",
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b pb-5" style={{ borderColor: "var(--admin-border)" }}>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--admin-accent)]">
                    LEAD DOSSIER
                  </span>
                  <span className="opacity-40">•</span>
                  <StatusBadge status={selectedLead.status || "New"} />
                </div>
                <h2 className="font-serif-display text-2xl font-medium text-[var(--admin-text-primary)] mt-1">
                  {selectedLead.name}
                </h2>
                <div className="flex items-center gap-3 text-xs text-[var(--admin-text-secondary)] mt-1">
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
                className="w-8 h-8 rounded-full border border-[var(--admin-border)] hover:border-[var(--admin-accent)] flex items-center justify-center text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] bg-[var(--admin-surface-2)] transition-colors shrink-0 cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid Sections */}
            <div className="space-y-6">
              {/* Property & Lead Info */}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-lg border shadow-2xs text-xs"
                style={{
                  backgroundColor: "var(--admin-surface-2)",
                  borderColor: "var(--admin-border-subtle)",
                }}
              >
                <div>
                  <span className="text-[10px] tracking-[0.16em] uppercase text-[var(--admin-accent)] block mb-1 font-semibold">
                    Property of Interest
                  </span>
                  <p className="font-semibold text-sm text-[var(--admin-text-primary)]">
                    {selectedLead.propertyName || "General Inquiry"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.16em] uppercase text-[var(--admin-accent)] block mb-1 font-semibold">
                    Target Locality / Location
                  </span>
                  <p className="font-medium text-[var(--admin-text-primary)]">
                    {selectedLead.location || "Kolkata, West Bengal"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.16em] uppercase text-[var(--admin-accent)] block mb-1 font-semibold">
                    Inquiry Type
                  </span>
                  <p className="text-[var(--admin-accent)] font-semibold">
                    {selectedLead.leadType || "Property Enquiry"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] tracking-[0.16em] uppercase text-[var(--admin-accent)] block mb-1 font-semibold">
                    Property ID Reference
                  </span>
                  <p className="text-[var(--admin-text-muted)] font-mono">
                    {selectedLead.propertyId || "—"}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div
                className="p-5 rounded-lg border shadow-2xs space-y-3"
                style={{
                  backgroundColor: "var(--admin-surface-2)",
                  borderColor: "var(--admin-border-subtle)",
                }}
              >
                <span className="text-[10px] tracking-[0.16em] uppercase text-[var(--admin-accent)] font-semibold block">
                  Contact Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[var(--admin-accent)] shrink-0" />
                    <a
                      href={`tel:${selectedLead.phone}`}
                      className="hover:text-[var(--admin-accent)] font-mono font-semibold text-[var(--admin-text-primary)]"
                    >
                      {selectedLead.phone || "No phone provided"}
                    </a>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[var(--admin-accent)] shrink-0" />
                    <a
                      href={`mailto:${selectedLead.email}`}
                      className="hover:text-[var(--admin-accent)] font-medium text-[var(--admin-text-primary)] truncate"
                    >
                      {selectedLead.email || "No email provided"}
                    </a>
                  </div>
                </div>
              </div>

              {/* Client Message */}
              {selectedLead.message && (
                <div
                  className="p-5 rounded-lg border shadow-2xs text-xs space-y-2"
                  style={{
                    backgroundColor: "var(--admin-surface-2)",
                    borderColor: "var(--admin-border-subtle)",
                  }}
                >
                  <span className="text-[10px] tracking-[0.16em] uppercase text-[var(--admin-accent)] font-semibold block">
                    Client Message / Inquiry Details
                  </span>
                  <p
                    className="leading-relaxed whitespace-pre-wrap p-3.5 rounded-md border font-sans"
                    style={{
                      backgroundColor: "var(--admin-surface)",
                      borderColor: "var(--admin-border-subtle)",
                      color: "var(--admin-text-primary)",
                    }}
                  >
                    {selectedLead.message}
                  </p>
                </div>
              )}

              {/* Management: Status & Assignment */}
              <div
                className="p-5 rounded-lg border shadow-2xs space-y-4"
                style={{
                  backgroundColor: "var(--admin-surface-2)",
                  borderColor: "var(--admin-border-subtle)",
                }}
              >
                <span className="text-[10px] tracking-[0.16em] uppercase text-[var(--admin-accent)] font-semibold block">
                  Lead Status &amp; Sales Representative
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.14em] text-[var(--admin-text-secondary)] block mb-1.5 font-semibold">
                      Pipeline Status
                    </label>
                    <select
                      value={selectedLead.status || "New"}
                      onChange={(e) => updateStatus(selectedLead.id, e.target.value)}
                      className="w-full h-10 px-3 rounded-md text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] cursor-pointer"
                      style={{
                        backgroundColor: "var(--admin-input-bg)",
                        borderColor: "var(--admin-input-border)",
                        borderWidth: "1px",
                        color: "var(--admin-input-text)",
                      }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-[0.14em] text-[var(--admin-text-secondary)] block mb-1.5 font-semibold">
                      Assigned Sales Advisory
                    </label>
                    <input
                      type="text"
                      value={editingAssignee}
                      onChange={(e) => setEditingAssignee(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full h-10 px-3 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)]"
                      style={{
                        backgroundColor: "var(--admin-input-bg)",
                        borderColor: "var(--admin-input-border)",
                        borderWidth: "1px",
                        color: "var(--admin-input-text)",
                      }}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-[10px] uppercase tracking-[0.14em] text-[var(--admin-text-secondary)] block mb-1.5 font-semibold">
                    Internal Sales &amp; Follow-up Notes
                  </label>
                  <textarea
                    rows={3}
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    placeholder="Log site visit scheduling, client budget, preferences, or consultation outcome..."
                    className="w-full p-3 rounded-md text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)]"
                    style={{
                      backgroundColor: "var(--admin-input-bg)",
                      borderColor: "var(--admin-input-border)",
                      borderWidth: "1px",
                      color: "var(--admin-input-text)",
                    }}
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    disabled={savingDetails}
                    onClick={saveLeadDetails}
                    className="btn-admin-primary"
                  >
                    {savingDetails ? "Saving Details…" : "Save Lead Details"}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: "var(--admin-border)" }}>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2 border rounded-md text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                style={{
                  backgroundColor: "var(--admin-surface-2)",
                  borderColor: "var(--admin-border)",
                  color: "var(--admin-text-primary)",
                }}
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[var(--admin-error)] bg-[var(--admin-error-bg)] border border-[var(--admin-error-border)] rounded-md text-xs uppercase tracking-[0.1em] font-semibold transition-colors cursor-pointer"
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
