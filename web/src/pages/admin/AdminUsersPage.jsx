import { useEffect, useState } from "react";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const ROLES = ["admin", "sales", "marketing"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: "", name: "", role: "sales", password: "" });

  const load = () => {
    setLoading(true);
    api.get("/users")
      .then(({ data }) => setUsers(data))
      .catch((e) => toast.error(formatApiErrorDetail(e.response?.data?.detail)))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users", form);
      toast.success("User created");
      setForm({ email: "", name: "", role: "sales", password: "" });
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    }
  };

  return (
    <div data-testid="admin-users-page">
      <div className="flex items-center justify-between mb-12">
        <div>
          <div className="overline mb-3">Team</div>
          <h1 className="font-display font-light text-3xl sm:text-4xl text-ivory">Users</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} data-testid="toggle-user-form" className="btn-primary">
          <Plus className="w-4 h-4" /> {showForm ? "Cancel" : "Add User"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createUser} className="border border-copper/15 p-8 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="create-user-form">
          <div>
            <label className="input-label">Name</label>
            <input required data-testid="user-name" className="input-filled" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
          </div>
          <div>
            <label className="input-label">Email</label>
            <input required type="email" data-testid="user-email" className="input-filled" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
          </div>
          <div>
            <label className="input-label">Role</label>
            <select data-testid="user-role" className="input-filled" value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}>
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Password</label>
            <input required type="password" minLength={6} data-testid="user-password" className="input-filled" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
          </div>
          <div className="md:col-span-2">
            <button type="submit" data-testid="create-user-submit" className="btn-primary">Create User</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-ivory/50 text-center py-16 tracking-[0.3em] uppercase text-xs">Loading...</div>
      ) : (
        <div className="border border-copper/15 overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]" data-testid="users-table">
            <thead className="bg-charcoal-2/60 text-ivory/60 text-[10px] tracking-[0.25em] uppercase">
              <tr>
                <th className="text-left p-4 font-normal">Name</th>
                <th className="text-left p-4 font-normal">Email</th>
                <th className="text-left p-4 font-normal">Role</th>
                <th className="text-right p-4 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-copper/10">
                  <td className="p-4 text-ivory">{u.name}</td>
                  <td className="p-4 text-ivory/70">{u.email}</td>
                  <td className="p-4">
                    <span className="text-[10px] tracking-[0.25em] uppercase text-copper border border-copper/30 px-3 py-1">{u.role}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => remove(u.id)} className="text-ivory/60 hover:text-red-400" data-testid={`delete-user-${u.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
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
