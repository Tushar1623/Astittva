import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { fileUrl, formatApiErrorDetail } from "@/lib/api";
import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

function blogImage(src) {
  if (!src) return "";
  if (src.startsWith("http")) return src;
  return fileUrl(src);
}

export default function AdminBlogsPage() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/admin/blogs")
      .then(({ data }) => setBlogs(Array.isArray(data) ? data : []))
      .catch((e) => toast.error(formatApiErrorDetail(e.response?.data?.detail)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id, status) => {
    try {
      await api.patch(`/admin/blogs/${id}/status`, { status });
      toast.success(`Status updated to ${status}`);
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this blog permanently?")) return;
    try {
      await api.delete(`/admin/blogs/${id}`);
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    }
  };

  return (
    <div data-testid="admin-blogs-page">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 sm:mb-12">
        <div>
          <div className="overline mb-3">Editorial</div>
          <h1 className="font-display font-light text-3xl sm:text-4xl text-ivory">
            Blogs
          </h1>
        </div>
        <Link
          to="/admin/blogs/new"
          data-testid="add-blog-btn"
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> New Blog
        </Link>
      </div>

      {loading ? (
        <div className="text-ivory/50 text-center py-16 tracking-[0.3em] uppercase text-xs">
          Loading...
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-16 border border-copper/15">
          <p className="text-ivory/60 font-light italic">
            No blogs yet. Publish your first piece.
          </p>
        </div>
      ) : (
        <div className="border border-copper/15 overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]" data-testid="admin-blogs-table">
            <thead className="bg-charcoal-2/60 text-ivory/60 text-[10px] tracking-[0.25em] uppercase">
              <tr>
                <th className="text-left p-4 font-normal">Blog</th>
                <th className="text-left p-4 font-normal hidden md:table-cell">Slug</th>
                <th className="text-left p-4 font-normal hidden lg:table-cell">
                  Publish Date
                </th>
                <th className="text-left p-4 font-normal">Status</th>
                <th className="text-right p-4 font-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((b) => (
                <tr
                  key={b.id}
                  className="border-t border-copper/10 hover:bg-charcoal-2/30"
                  data-testid={`admin-blog-row-${b.id}`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {b.featured_image ? (
                        <img
                          loading="lazy"
                          src={blogImage(b.featured_image)}
                          alt=""
                          className="w-14 h-14 object-cover border border-copper/20"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-charcoal-2 border border-copper/10 flex items-center justify-center text-copper/40 text-[9px] tracking-widest uppercase">
                          N/A
                        </div>
                      )}
                      <div>
                        <div className="text-ivory font-display font-normal max-w-xs truncate">
                          {b.title}
                        </div>
                        <div className="text-ivory/50 text-xs">
                          {b.author || "—"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-ivory/70 hidden md:table-cell font-mono text-xs">
                    {b.slug}
                  </td>
                  <td className="p-4 text-ivory/70 hidden lg:table-cell">
                    {b.publish_date || "—"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] tracking-[0.25em] uppercase px-3 py-1 border ${
                        b.status === "published"
                          ? "border-green-500/40 text-green-400"
                          : "border-copper/30 text-copper"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-3">
                      {b.status === "published" && (
                        <a
                          href={`/blogs/${b.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open live blog"
                          className="text-ivory/60 hover:text-copper"
                          data-testid={`view-blog-${b.id}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {b.status !== "published" ? (
                        <button
                          onClick={() => setStatus(b.id, "published")}
                          title="Publish"
                          className="text-ivory/60 hover:text-copper"
                          data-testid={`publish-blog-${b.id}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setStatus(b.id, "draft")}
                          title="Move to draft"
                          className="text-ivory/60 hover:text-copper"
                          data-testid={`unpublish-blog-${b.id}`}
                        >
                          <EyeOff className="w-4 h-4" />
                        </button>
                      )}
                      <Link
                        to={`/admin/blogs/${b.id}/edit`}
                        className="text-ivory/60 hover:text-copper"
                        data-testid={`edit-blog-${b.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      {user?.role === "admin" && (
                        <button
                          onClick={() => remove(b.id)}
                          className="text-ivory/60 hover:text-red-400"
                          data-testid={`delete-blog-${b.id}`}
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
      )}
    </div>
  );
}
