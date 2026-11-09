import { useEffect, useState, useMemo } from "react";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash2, Users, ShieldCheck, Mail, Lock, User, X } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminEmptyState from "@/components/admin/AdminEmptyState";

const ROLES = ["admin", "sales", "marketing"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", role: "sales", password: "" });
  const [submitting, setSubmitting] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name, email }
  const [isDeleting, setIsDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/users")
      .then(({ data }) => setUsers(Array.isArray(data) ? data : []))
      .catch((e) => {
        setUsers([]);
        toast.error(formatApiErrorDetail(e.response?.data?.detail));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const createUser = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post("/users", form);
      toast.success("User account created successfully");
      setForm({ email: "", name: "", role: "sales", password: "" });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmRemove = async () => {
    if (!deleteTarget || isDeleting) return;
    try {
      setIsDeleting(true);
      await api.delete(`/users/${deleteTarget.id}`);
      toast.success("User account deleted");
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to delete user account");
    } finally {
      setIsDeleting(false);
    }
  };

  // Role Counts
  const roleCounts = useMemo(() => {
    const counts = { admin: 0, sales: 0, marketing: 0 };
    users.forEach((u) => {
      const r = (u.role || "").toLowerCase();
      if (counts[r] !== undefined) counts[r]++;
    });
    return counts;
  }, [users]);

  // Filtered List
  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesRole =
        roleFilter === "ALL" || (u.role && u.role.toLowerCase() === roleFilter.toLowerCase());

      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q));

      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, search]);

  // Paginated List
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  return (
    <div data-testid="admin-users-page" className="space-y-6">
      {/* Unified Header */}
      <AdminHeader
        category="SYSTEM"
        subcategory="ACCESS CONTROL"
        title="Team &amp; User Accounts"
        subtitle="Manage staff credentials, assigned operational roles, and platform permissions."
        onRefresh={load}
        refreshing={loading}
        actions={
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            data-testid="toggle-user-form"
            className="btn-admin-primary"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showForm ? "Cancel" : "Add User"}</span>
          </button>
        }
      />

      {/* Collapsible Add User Form Card */}
      {showForm && (
        <div className="admin-card rounded-[8px] p-6 shadow-md space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--admin-border-subtle)]">
            <div>
              <h3 className="text-base font-display font-medium text-[var(--admin-text-primary)]">Create New User Account</h3>
              <p className="text-xs text-[var(--admin-text-muted)]">
                Configure account credentials and console access permissions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="w-8 h-8 rounded-full border border-[var(--admin-border)] hover:border-[var(--admin-accent)] flex items-center justify-center text-[var(--admin-text-muted)] hover:text-[var(--admin-accent)] bg-[var(--admin-surface)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form
            onSubmit={createUser}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            data-testid="create-user-form"
          >
            <div>
              <label className="text-[10px] tracking-[0.2em] uppercase text-[var(--admin-accent)] block mb-1.5 font-semibold">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
                <input
                  required
                  data-testid="user-name"
                  placeholder="e.g. John Doe"
                  className="w-full h-10 pl-9 pr-3 bg-[var(--admin-surface-muted)] border border-[var(--admin-border)] rounded-[4px] text-xs text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--admin-accent)] font-medium"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] tracking-[0.2em] uppercase text-[var(--admin-accent)] block mb-1.5 font-semibold">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
                <input
                  required
                  type="email"
                  data-testid="user-email"
                  placeholder="name@astitva.com"
                  className="w-full h-10 pl-9 pr-3 bg-[var(--admin-surface-muted)] border border-[var(--admin-border)] rounded-[4px] text-xs text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--admin-accent)] font-medium"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] tracking-[0.2em] uppercase text-[var(--admin-accent)] block mb-1.5 font-semibold">
                Role &amp; Permissions
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
                <select
                  data-testid="user-role"
                  className="w-full h-10 pl-9 pr-3 bg-[var(--admin-surface-muted)] border border-[var(--admin-border)] rounded-[4px] text-xs text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)] uppercase tracking-wider font-mono cursor-pointer font-semibold"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r} className="bg-[var(--admin-surface)] text-[var(--admin-text-primary)]">
                      {r.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] tracking-[0.2em] uppercase text-[var(--admin-accent)] block mb-1.5 font-semibold">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
                <input
                  required
                  type="password"
                  minLength={6}
                  data-testid="user-password"
                  placeholder="Minimum 6 characters"
                  className="w-full h-10 pl-9 pr-3 bg-[var(--admin-surface-muted)] border border-[var(--admin-border)] rounded-[4px] text-xs text-[var(--admin-text-primary)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-[var(--admin-accent)]"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-admin-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                data-testid="create-user-submit"
                className="btn-admin-primary"
              >
                {submitting ? "Creating Account…" : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <AdminFilterBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by name, email, or role..."
        statusFilter={roleFilter}
        onStatusChange={(rf) => {
          setRoleFilter(rf);
          setCurrentPage(1);
        }}
        statusOptions={["ALL", "admin", "sales", "marketing"]}
        statusCounts={roleCounts}
        totalCount={users.length}
      />

      {/* Main Table */}
      {loading ? (
        <div className="text-[var(--admin-text-muted)] text-center py-20 tracking-[0.3em] uppercase text-xs">
          Loading Users…
        </div>
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          icon={Users}
          title={roleFilter === "ALL" && !search ? "No user accounts found." : "No users matched your search."}
          message="Try adjusting your search criteria or role filter."
          onClearFilters={
            roleFilter !== "ALL" || search
              ? () => {
                  setRoleFilter("ALL");
                  setSearch("");
                }
              : null
          }
        />
      ) : (
        <div className="admin-table-wrap">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]" data-testid="users-table">
              <thead className="admin-thead">
                <tr>
                  <th className="text-left p-4 font-semibold">Staff Member</th>
                  <th className="text-left p-4 font-semibold">Email Address</th>
                  <th className="text-left p-4 font-semibold">Assigned Role</th>
                  <th className="text-right p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((u) => (
                  <tr
                    key={u.id}
                    className="admin-tr transition-colors"
                  >
                    <td className="p-4 font-medium text-[var(--admin-text-primary)] text-sm">{u.name}</td>
                    <td className="p-4 text-[var(--admin-text-secondary)] text-xs font-mono">
                      <a href={`mailto:${u.email}`} className="hover:text-[var(--admin-accent)] transition-colors">
                        {u.email}
                      </a>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <StatusBadge status={u.role} />
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            id: u.id,
                            name: u.name || u.email,
                            email: u.email,
                          })
                        }
                        className="p-1.5 text-[var(--admin-text-muted)] hover:text-rose-500 hover:bg-rose-500/15 rounded transition-colors"
                        title="Delete User Account"
                        data-testid={`delete-user-${u.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
            itemLabel="users"
          />
        </div>
      )}

      {/* Unified Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Permanently Delete User Account"
        itemName={deleteTarget?.name}
        itemType="User Account"
        warning="This action cannot be undone. The staff member will immediately lose access to the Astittva admin console."
        onConfirm={confirmRemove}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
