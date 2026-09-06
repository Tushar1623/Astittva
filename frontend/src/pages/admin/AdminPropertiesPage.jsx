import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { fileUrl, formatApiErrorDetail } from "@/lib/api";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function AdminPropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/admin/properties")
      .then(({ data }) => setProperties(data))
      .catch((e) => toast.error(formatApiErrorDetail(e.response?.data?.detail)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    try {
      await api.patch(`/admin/properties/${id}/status`, { status });
      toast.success(`Status updated to ${status}`);
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this property permanently?")) return;
    try {
      await api.delete(`/admin/properties/${id}`);
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    }
  };

  return (
    <div data-testid="admin-properties-page">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 sm:mb-12">
        <div>
          <div className="overline mb-3">Inventory</div>
          <h1 className="font-display font-light text-3xl sm:text-4xl text-ivory">Properties</h1>
        </div>
        <Link to="/admin/properties/new" data-testid="add-property-btn" className="btn-primary">
          <Plus className="w-4 h-4" /> Add Property
        </Link>
      </div>

      {loading ? (
        <div className="text-ivory/50 text-center py-16 tracking-[0.3em] uppercase text-xs">Loading...</div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 border border-copper/15">
          <p className="text-ivory/60 font-light italic">No properties yet. Create your first one.</p>
        </div>
      ) : (
        <div className="border border-copper/15 overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]" data-testid="properties-table">
            <thead className="bg-charcoal-2/60 text-ivory/60 text-[10px] tracking-[0.25em] uppercase">
              <tr>
                <th className="text-left p-4 font-normal">Project</th>
                <th className="text-left p-4 font-normal hidden md:table-cell">City</th>
                <th className="text-left p-4 font-normal hidden lg:table-cell">Type</th>
                <th className="text-left p-4 font-normal">Status</th>
                <th className="text-right p-4 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id} className="border-t border-copper/10 hover:bg-charcoal-2/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        <img loading="lazy" src={fileUrl(p.images[0])} alt="" className="w-12 h-12 object-cover border border-copper/20" />
                      ) : (
                        <div className="w-12 h-12 bg-charcoal-2 border border-copper/10 flex items-center justify-center text-copper/40 text-[10px] tracking-widest uppercase">
                          N/A
                        </div>
                      )}
                      <div>
                        <div className="text-ivory font-display font-normal">{p.project_name}</div>
                        <div className="text-ivory/50 text-xs">{p.builder || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-ivory/70 hidden md:table-cell">{p.city}</td>
                  <td className="p-4 text-ivory/70 hidden lg:table-cell">{p.property_type}</td>
                  <td className="p-4">
                    <span className={`text-[10px] tracking-[0.25em] uppercase px-3 py-1 border ${
                      p.status === "published" ? "border-green-500/40 text-green-400" :
                      p.status === "unpublished" ? "border-yellow-500/40 text-yellow-400" :
                      "border-copper/30 text-copper"
                    }`}>{p.status}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-3">
                      {p.status !== "published" ? (
                        <button onClick={() => setStatus(p.id, "published")} title="Publish" className="text-ivory/60 hover:text-copper" data-testid={`publish-${p.id}`}>
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => setStatus(p.id, "unpublished")} title="Unpublish" className="text-ivory/60 hover:text-copper" data-testid={`unpublish-${p.id}`}>
                          <EyeOff className="w-4 h-4" />
                        </button>
                      )}
                      <Link to={`/admin/properties/${p.id}/edit`} className="text-ivory/60 hover:text-copper" data-testid={`edit-${p.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Link>
                      {user?.role === "admin" && (
                        <button onClick={() => remove(p.id)} className="text-ivory/60 hover:text-red-400" data-testid={`delete-${p.id}`}>
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
      )}
    </div>
  );
}
