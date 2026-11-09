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
  ExternalLink,
  X,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AdminHeader from "@/components/admin/AdminHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminEmptyState from "@/components/admin/AdminEmptyState";

const STATUS_OPTIONS = [
  "New",
  "Contacted",
  "Follow Up",
  "Site Visit",
  "Converted",
  "Closed",
];

export default function AdminResaleLeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Selected Lead Details Modal
  const [selectedLead, setSelectedLead] = useState(null);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadLeads = () => {
    setLoading(true);
    api
      .get("/admin/leads/resale")
      .then(({ data }) => {
        setLeads(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setLeads([]);
        toast.error(
          formatApiErrorDetail(err.response?.data?.detail) ||
            "Failed to load resale leads"
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/leads/resale/${id}`, { status });
      toast.success(`Status updated to "${status}"`);
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status } : l))
      );
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead((prev) => ({ ...prev, status }));
      }
    } catch (err) {
      toast.error(
        formatApiErrorDetail(err.response?.data?.detail) ||
          "Failed to update status"
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    try {
      setIsDeleting(true);
      await api.delete(`/admin/leads/resale/${deleteTarget.id}`);
      toast.success("Resale enquiry deleted permanently");
      setLeads((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      if (selectedLead?.id === deleteTarget.id) {
        setSelectedLead(null);
      }
      setDeleteTarget(null);
    } catch (err) {
      toast.error(
        formatApiErrorDetail(err.response?.data?.detail) ||
          "Failed to delete resale enquiry"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter(
      (l) => (l.status || "").toLowerCase() === "new"
    ).length;
    const followUpCount = leads.filter((l) => {
      const s = (l.status || "").toLowerCase();
      return s === "follow up" || s === "site visit" || s === "contacted";
    }).length;
    const convertedCount = leads.filter(
      (l) => (l.status || "").toLowerCase() === "converted"
    ).length;
    return { total, newCount, followUpCount, convertedCount };
  }, [leads]);

  // Status Counts for Filter Tabs
  const statusCounts = useMemo(() => {
    const counts = { ALL: leads.length };
    STATUS_OPTIONS.forEach((st) => {
      counts[st] = leads.filter(
        (l) => (l.status || "").toLowerCase() === st.toLowerCase()
      ).length;
    });
    return counts;
  }, [leads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (
        statusFilter !== "ALL" &&
        (lead.status || "").toLowerCase() !== statusFilter.toLowerCase()
      ) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const name = (lead.name || "").toLowerCase();
        const email = (lead.email || "").toLowerCase();
        const phone = (lead.phone || "").toLowerCase();
        const propTitle = (lead.propertyTitle || "").toLowerCase();
        const msg = (lead.message || "").toLowerCase();
        return (
          name.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          propTitle.includes(q) ||
          msg.includes(q)
        );
      }
      return true;
    });
  }, [leads, statusFilter, searchTerm]);

  // Pagination slice
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage]);

  const filterTabs = [
    { key: "ALL", label: "All Enquiries", count: statusCounts.ALL },
    ...STATUS_OPTIONS.map((st) => ({
      key: st,
      label: st,
      count: statusCounts[st] || 0,
    })),
  ];

  return (
    <div data-testid="admin-resale-leads-page" className="space-y-6">
      {/* Header */}
      <AdminHeader
        category="Lead Management"
        title="Resale Enquiries"
        subtitle="Secondary marketplace client inquiries, property evaluation & buyer connection desk."
        actions={[
          {
            label: "Refresh",
            icon: RefreshCw,
            variant: "outline",
            onClick: loadLeads,
          },
        ]}
      />

      {/* KPI Summary Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Enquiries */}
        <div className="admin-card p-4 rounded-lg">
          <div className="text-[10.5px] uppercase tracking-wider text-[var(--admin-text-secondary)] font-medium">
            Total Resale Enquiries
          </div>
          <div className="text-2xl font-serif-display font-medium text-[var(--admin-text-primary)] mt-1">
            {metrics.total}
          </div>
        </div>

        {/* New Enquiries */}
        <div
          className="p-4 rounded-lg border text-left"
          style={{
            backgroundColor: "var(--admin-error-bg)",
            borderColor: "var(--admin-error-border)",
          }}
        >
          <div className="text-[10.5px] uppercase tracking-wider text-[var(--admin-error)] font-semibold">
            New Enquiries
          </div>
          <div className="text-2xl font-serif-display font-medium text-[var(--admin-error)] mt-1">
            {metrics.newCount}
          </div>
        </div>

        {/* Active Follow-ups */}
        <div
          className="p-4 rounded-lg border text-left"
          style={{
            backgroundColor: "var(--admin-warning-bg)",
            borderColor: "var(--admin-warning-border)",
          }}
        >
          <div className="text-[10.5px] uppercase tracking-wider text-[var(--admin-warning)] font-semibold">
            Active Follow-ups
          </div>
          <div className="text-2xl font-serif-display font-medium text-[var(--admin-warning)] mt-1">
            {metrics.followUpCount}
          </div>
        </div>

        {/* Converted Deals */}
        <div
          className="p-4 rounded-lg border text-left"
          style={{
            backgroundColor: "var(--admin-success-bg)",
            borderColor: "var(--admin-success-border)",
          }}
        >
          <div className="text-[10.5px] uppercase tracking-wider text-[var(--admin-success)] font-semibold">
            Converted Deals
          </div>
          <div className="text-2xl font-serif-display font-medium text-[var(--admin-success)] mt-1">
            {metrics.convertedCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <AdminFilterBar
        tabs={filterTabs}
        activeTab={statusFilter}
        onTabChange={(tab) => {
          setStatusFilter(tab);
          setCurrentPage(1);
        }}
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by buyer/seller name, phone, email, resale listing..."
      />

      {/* Leads Table */}
      {loading ? (
        <div className="text-[var(--admin-text-muted)] text-center py-20 tracking-[0.25em] uppercase text-xs">
          Loading resale enquiries...
        </div>
      ) : filteredLeads.length === 0 ? (
        <AdminEmptyState
          icon={Building2}
          title="No resale enquiries found"
          message={
            searchTerm || statusFilter !== "ALL"
              ? "No enquiries match your active filter criteria."
              : "No resale enquiries recorded yet."
          }
          actionLabel={searchTerm || statusFilter !== "ALL" ? "Clear Filters" : null}
          onAction={() => {
            setSearchTerm("");
            setStatusFilter("ALL");
            setCurrentPage(1);
          }}
        />
      ) : (
        <div className="admin-table-wrap">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[850px]" data-testid="resale-leads-table">
              <thead className="admin-thead">
                <tr>
                  <th className="text-left py-3.5 px-4 font-semibold">Enquirer</th>
                  <th className="text-left py-3.5 px-4 font-semibold">Contact</th>
                  <th className="text-left py-3.5 px-4 font-semibold">Resale Listing</th>
                  <th className="text-left py-3.5 px-4 font-semibold">Message</th>
                  <th className="text-left py-3.5 px-4 font-semibold">Status</th>
                  <th className="text-left py-3.5 px-4 font-semibold">Date</th>
                  <th className="text-right py-3.5 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeads.map((l) => (
                  <tr key={l.id} className="admin-tr group">
                    {/* Enquirer Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-xs sm:text-sm text-[var(--admin-text-primary)]">
                        {l.name || "Anonymous Enquiry"}
                      </div>
                      <div className="text-[var(--admin-text-muted)] text-[10px] uppercase tracking-wider mt-0.5">
                        Source: {l.source || "resale-page"}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {l.phone && (
                          <a
                            href={`tel:${l.phone}`}
                            className="flex items-center gap-1.5 text-xs text-[var(--admin-accent)] hover:underline font-mono"
                          >
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{l.phone}</span>
                          </a>
                        )}
                        {l.email && (
                          <a
                            href={`mailto:${l.email}`}
                            className="flex items-center gap-1.5 text-[11px] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] truncate max-w-[170px]"
                          >
                            <Mail className="w-3 h-3 shrink-0 opacity-70" />
                            <span className="truncate">{l.email}</span>
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Resale Property Title */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs max-w-[200px] truncate font-semibold text-[var(--admin-text-primary)]">
                        {l.propertyTitle || "General Resale Consultation"}
                      </div>
                      {l.resalePropertyId ? (
                        <Link
                          to={`/resale/${l.resalePropertyId}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[10px] text-[var(--admin-accent)] hover:underline mt-0.5 font-medium"
                        >
                          <span>View Listing</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      ) : (
                        <span className="text-[10px] text-[var(--admin-text-muted)]">Marketplace Desk</span>
                      )}
                    </td>

                    {/* Message */}
                    <td className="py-3.5 px-4">
                      <p className="text-xs text-[var(--admin-text-secondary)] max-w-[220px] line-clamp-2 leading-relaxed">
                        {l.message || "—"}
                      </p>
                    </td>

                    {/* Status Select */}
                    <td className="py-3.5 px-4">
                      <select
                        value={l.status || "New"}
                        onChange={(e) => updateStatus(l.id, e.target.value)}
                        className="text-[10px] uppercase tracking-wider font-semibold rounded-md px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)]"
                        style={{
                          backgroundColor: "var(--admin-input-bg)",
                          borderColor: "var(--admin-input-border)",
                          borderWidth: "1px",
                          color: "var(--admin-input-text)",
                        }}
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs text-[var(--admin-text-secondary)] font-mono whitespace-nowrap">
                      {l.createdAt
                        ? new Date(l.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedLead(l)}
                          title="View enquiry details"
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
                                name: l.name || "Anonymous",
                                title: l.propertyTitle || "Resale Enquiry",
                              })
                            }
                            title="Delete enquiry"
                            className="p-1.5 text-[var(--admin-error)] hover:bg-[var(--admin-error-bg)] rounded-md transition-colors cursor-pointer"
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
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalItems={filteredLeads.length}
            pageSize={pageSize}
            itemLabel="resale enquiries"
          />
        </div>
      )}

      {/* Enquiry Detail Modal */}
      {selectedLead && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fadeIn"
        >
          <div
            className="rounded-xl border max-w-lg w-full p-6 shadow-2xl space-y-5 transition-colors"
            style={{
              backgroundColor: "var(--admin-surface)",
              borderColor: "var(--admin-border)",
              color: "var(--admin-text-primary)",
            }}
          >
            <div className="flex items-start justify-between border-b pb-4" style={{ borderColor: "var(--admin-border)" }}>
              <div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-[var(--admin-accent)] font-semibold">
                  Resale Enquiry Details
                </div>
                <h3 className="text-xl font-serif-display font-medium text-[var(--admin-text-primary)] mt-1">
                  {selectedLead.name || "Anonymous Enquiry"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="w-8 h-8 rounded-full border border-[var(--admin-border)] hover:border-[var(--admin-accent)] flex items-center justify-center text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] bg-[var(--admin-surface-2)] transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div
                className="grid grid-cols-2 gap-3 p-3.5 rounded-lg border shadow-2xs"
                style={{
                  backgroundColor: "var(--admin-surface-2)",
                  borderColor: "var(--admin-border-subtle)",
                }}
              >
                <div>
                  <div className="text-[var(--admin-text-muted)] uppercase text-[10px] font-semibold">Phone Number</div>
                  {selectedLead.phone ? (
                    <a
                      href={`tel:${selectedLead.phone}`}
                      className="text-[var(--admin-accent)] hover:underline font-mono text-xs mt-0.5 inline-block font-semibold"
                    >
                      {selectedLead.phone}
                    </a>
                  ) : (
                    <span className="text-[var(--admin-text-muted)]">—</span>
                  )}
                </div>
                <div>
                  <div className="text-[var(--admin-text-muted)] uppercase text-[10px] font-semibold">Email Address</div>
                  {selectedLead.email ? (
                    <a
                      href={`mailto:${selectedLead.email}`}
                      className="text-[var(--admin-accent)] hover:underline text-xs mt-0.5 truncate block font-semibold"
                    >
                      {selectedLead.email}
                    </a>
                  ) : (
                    <span className="text-[var(--admin-text-muted)]">—</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-[var(--admin-text-secondary)] uppercase text-[10px] mb-1 font-semibold">Target Resale Listing</div>
                <div
                  className="p-3.5 rounded-lg border shadow-2xs flex items-center justify-between"
                  style={{
                    backgroundColor: "var(--admin-surface-2)",
                    borderColor: "var(--admin-border-subtle)",
                  }}
                >
                  <span className="text-[var(--admin-text-primary)] font-semibold text-xs">
                    {selectedLead.propertyTitle || "General Resale Consultation"}
                  </span>
                  {selectedLead.resalePropertyId && (
                    <Link
                      to={`/resale/${selectedLead.resalePropertyId}`}
                      target="_blank"
                      className="text-[11px] text-[var(--admin-accent)] hover:underline inline-flex items-center gap-1 shrink-0 ml-2 font-semibold"
                    >
                      <span>Open Listing</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>

              <div>
                <div className="text-[var(--admin-text-secondary)] uppercase text-[10px] mb-1 font-semibold">Enquiry Message</div>
                <div
                  className="p-3.5 rounded-lg border shadow-2xs leading-relaxed text-xs max-h-48 overflow-y-auto"
                  style={{
                    backgroundColor: "var(--admin-surface-2)",
                    borderColor: "var(--admin-border-subtle)",
                    color: "var(--admin-text-primary)",
                  }}
                >
                  {selectedLead.message || "No custom message provided with this enquiry."}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="text-[var(--admin-text-secondary)] uppercase text-[10px] mb-1 font-semibold">Enquiry Status</div>
                  <select
                    value={selectedLead.status || "New"}
                    onChange={(e) => updateStatus(selectedLead.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-md text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--admin-accent)] cursor-pointer"
                    style={{
                      backgroundColor: "var(--admin-input-bg)",
                      borderColor: "var(--admin-input-border)",
                      borderWidth: "1px",
                      color: "var(--admin-input-text)",
                    }}
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-[var(--admin-text-secondary)] uppercase text-[10px] mb-1 font-semibold">Submission Date</div>
                  <div
                    className="px-3 py-2 rounded-md text-xs font-mono"
                    style={{
                      backgroundColor: "var(--admin-surface-2)",
                      borderColor: "var(--admin-border-subtle)",
                      borderWidth: "1px",
                      color: "var(--admin-text-primary)",
                    }}
                  >
                    {selectedLead.createdAt
                      ? new Date(selectedLead.createdAt).toLocaleString("en-IN")
                      : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 flex justify-between items-center" style={{ borderColor: "var(--admin-border)" }}>
              {user?.role === "admin" && (
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTarget({
                      id: selectedLead.id,
                      name: selectedLead.name || "Anonymous",
                      title: selectedLead.propertyTitle || "Resale Enquiry",
                    });
                  }}
                  className="px-3.5 py-2 rounded-md text-xs font-semibold text-[var(--admin-error)] bg-[var(--admin-error-bg)] border border-[var(--admin-error-border)] transition-colors cursor-pointer"
                >
                  Delete Enquiry
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="ml-auto px-5 py-2 border rounded-md text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                style={{
                  backgroundColor: "var(--admin-surface-2)",
                  borderColor: "var(--admin-border)",
                  color: "var(--admin-text-primary)",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Resale Enquiry"
        itemName={deleteTarget?.name || "Anonymous Enquiry"}
        itemType="Resale Enquiry"
        warning="This will permanently remove the lead and all contact history from the database."
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
