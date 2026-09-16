import { useEffect, useState } from "react";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const STATUSES = ["new", "contacted", "qualified", "closed"];

export default function AdminLeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/admin/leads")
      .then(({ data }) => setLeads(data))
      .catch((e) => toast.error(formatApiErrorDetail(e.response?.data?.detail)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/leads/${id}`, { status });
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this lead?")) return;
    try {
      await api.delete(`/admin/leads/${id}`);
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    }
  };

  return (
    <div data-testid="admin-leads-page">
      <div className="mb-12">
        <div className="overline mb-3">CRM</div>
        <h1 className="font-display font-light text-3xl sm:text-4xl text-ivory">Leads</h1>
      </div>

      {loading ? (
        <div className="text-ivory/50 text-center py-16 tracking-[0.3em] uppercase text-xs">Loading...</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16 border border-copper/15 text-ivory/60 italic">No leads yet.</div>
      ) : (
        <div className="border border-copper/15 overflow-x-auto">
          <table className="w-full text-sm" data-testid="leads-table">
            <thead className="bg-charcoal-2/60 text-ivory/60 text-[10px] tracking-[0.25em] uppercase">
              <tr>
                <th className="text-left p-4 font-normal">Name</th>
                <th className="text-left p-4 font-normal hidden md:table-cell">Phone</th>
                <th className="text-left p-4 font-normal hidden lg:table-cell">Email</th>
                <th className="text-left p-4 font-normal hidden lg:table-cell">Interest</th>
                <th className="text-left p-4 font-normal">Status</th>
                <th className="text-right p-4 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-t border-copper/10 hover:bg-charcoal-2/30">
                  <td className="p-4">
                    <div className="text-ivory">{l.name}</div>
                    <div className="text-ivory/40 text-xs mt-1">{new Date(l.created_at).toLocaleString()}</div>
                  </td>
                  <td className="p-4 text-ivory/70 hidden md:table-cell">{l.phone}</td>
                  <td className="p-4 text-ivory/70 hidden lg:table-cell">{l.email}</td>
                  <td className="p-4 text-ivory/70 hidden lg:table-cell">{l.interest || "—"}</td>
                  <td className="p-4">
                    <select
                      value={l.status}
                      onChange={(e) => updateStatus(l.id, e.target.value)}
                      data-testid={`lead-status-${l.id}`}
                      className="input-filled py-1.5 px-2 text-xs"
                    >
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    {user?.role === "admin" && (
                      <button onClick={() => remove(l.id)} className="text-ivory/60 hover:text-red-400" data-testid={`delete-lead-${l.id}`}>
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
