import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api, { formatApiErrorDetail, getGoogleDriveFileId, driveProxyUrl } from "@/lib/api";
import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { resolveBlogImage, pickBlogFallback } from "@/lib/blogImages";
import AdminHeader from "@/components/admin/AdminHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminFilterBar from "@/components/admin/AdminFilterBar";
import AdminEmptyState from "@/components/admin/AdminEmptyState";

export default function AdminBlogsPage() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title }
  const [isDeleting, setIsDeleting] = useState(false);

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
      toast.success(`Blog status updated to "${status}"`);
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    }
  };

  const confirmRemove = async () => {
    if (!deleteTarget || isDeleting) return;
    try {
      setIsDeleting(true);
      await api.delete(`/admin/blogs/${deleteTarget.id}`);
      toast.success("Blog article deleted successfully");
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to delete blog article");
    } finally {
      setIsDeleting(false);
    }
  };

  // Status Counts
  const statusCounts = useMemo(() => {
    let pub = 0;
    let drf = 0;
    blogs.forEach((b) => {
      if (b.status === "published") pub++;
      else drf++;
    });
    return {
      published: pub,
      draft: drf,
    };
  }, [blogs]);

  // Filtered List
  const filtered = useMemo(() => {
    return blogs.filter((b) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "published" && b.status === "published") ||
        (statusFilter === "draft" && b.status !== "published");

      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.slug && b.slug.toLowerCase().includes(q)) ||
        (b.author && b.author.toLowerCase().includes(q)) ||
        (b.excerpt && b.excerpt.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [blogs, statusFilter, search]);

  // Paginated List
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  return (
    <div data-testid="admin-blogs-page" className="space-y-6">
      {/* Unified Header */}
      <AdminHeader
        category="EDITORIAL"
        subcategory="PUBLICATIONS"
        title="Blogs &amp; Editorial"
        subtitle="Manage market insights, real estate investment guides, editorial features, and SEO publication status."
        onRefresh={load}
        refreshing={loading}
        actions={
          <Link
            to="/admin/blogs/new"
            data-testid="add-blog-btn"
            className="inline-flex items-center gap-2 px-4 py-2 bg-copper hover:bg-copper-light text-white font-semibold text-xs uppercase tracking-[0.12em] rounded-[4px] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Blog</span>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <AdminFilterBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search article title, slug, author..."
        statusFilter={statusFilter}
        onStatusChange={(st) => {
          setStatusFilter(st);
          setCurrentPage(1);
        }}
        statusOptions={["ALL", "published", "draft"]}
        statusCounts={statusCounts}
        totalCount={blogs.length}
      />

      {/* Main Table */}
      {loading ? (
        <div className="text-ivory/50 text-center py-20 tracking-[0.3em] uppercase text-xs">
          Loading Blog Articles…
        </div>
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          icon={BookOpen}
          title={statusFilter === "ALL" && !search ? "No blog articles published yet." : "No blogs matched your search."}
          message={
            statusFilter === "ALL" && !search
              ? "Draft your first market insight article using the button above."
              : "Try adjusting your search terms or status filter."
          }
          onClearFilters={
            statusFilter !== "ALL" || search
              ? () => {
                  setStatusFilter("ALL");
                  setSearch("");
                }
              : null
          }
        />
      ) : (
        <div className="border border-copper/15 rounded-[6px] overflow-hidden bg-charcoal-2/20 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]" data-testid="admin-blogs-table">
              <thead className="bg-charcoal text-ivory/60 text-[10px] tracking-[0.22em] uppercase border-b border-copper/15">
                <tr>
                  <th className="text-left p-4 font-normal">Article &amp; Author</th>
                  <th className="text-left p-4 font-normal hidden md:table-cell">URL Slug</th>
                  <th className="text-left p-4 font-normal hidden lg:table-cell">Publish Date</th>
                  <th className="text-left p-4 font-normal">Status</th>
                  <th className="text-right p-4 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((b) => (
                  <tr
                    key={b.id}
                    className="border-t border-copper/10 hover:bg-charcoal/50 transition-colors"
                    data-testid={`admin-blog-row-${b.id}`}
                  >
                    {/* Title & Author */}
                    <td className="p-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          loading="lazy"
                          src={resolveBlogImage(b, 200)}
                          alt={b.title}
                          className="w-12 h-12 object-cover border border-copper/20 rounded-[4px] shrink-0 bg-charcoal-2"
                          onError={(e) => {
                            const currentSrc = e.currentTarget.src || "";
                            const driveId = getGoogleDriveFileId(b?.featured_image);
                            if (driveId && !currentSrc.includes("/images/thumbnail")) {
                              e.currentTarget.src = driveProxyUrl(driveId, 200);
                              return;
                            }
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = pickBlogFallback(b);
                          }}
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/admin/blogs/${b.id}/edit`}
                            className="text-ivory font-display text-sm font-medium hover:text-copper transition-colors block truncate max-w-sm"
                          >
                            {b.title}
                          </Link>
                          <div className="text-ivory/50 text-xs mt-0.5">
                            By {b.author || "Editorial Team"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="p-4 text-ivory/65 hidden md:table-cell font-mono text-xs">
                      <span className="truncate block max-w-[200px]" title={b.slug}>
                        /blogs/{b.slug}
                      </span>
                    </td>

                    {/* Publish Date */}
                    <td className="p-4 text-xs text-ivory/70 hidden lg:table-cell font-mono whitespace-nowrap">
                      {b.publish_date
                        ? new Date(b.publish_date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Status */}
                    <td className="p-4 whitespace-nowrap">
                      <StatusBadge status={b.status || "draft"} />
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === "published" && (
                          <a
                            href={`/blogs/${b.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open live article"
                            className="p-1.5 text-ivory/60 hover:text-copper hover:bg-copper/10 rounded transition-colors"
                            data-testid={`view-blog-${b.id}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        {b.status !== "published" ? (
                          <button
                            type="button"
                            onClick={() => setStatus(b.id, "published")}
                            title="Publish Live"
                            className="p-1.5 text-ivory/60 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors"
                            data-testid={`publish-blog-${b.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setStatus(b.id, "draft")}
                            title="Move to Draft"
                            className="p-1.5 text-ivory/60 hover:text-amber-400 hover:bg-amber-500/10 rounded transition-colors"
                            data-testid={`unpublish-blog-${b.id}`}
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}

                        <Link
                          to={`/admin/blogs/${b.id}/edit`}
                          className="p-1.5 text-ivory/60 hover:text-copper hover:bg-copper/10 rounded transition-colors"
                          title="Edit Article"
                          data-testid={`edit-blog-${b.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>

                        {user?.role === "admin" && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ id: b.id, title: b.title })}
                            className="p-1.5 text-ivory/40 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                            title="Delete Article"
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

          {/* Unified Pagination */}
          <AdminPagination
            totalItems={filtered.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemLabel="articles"
          />
        </div>
      )}

      {/* Unified Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Permanently Delete Blog Article"
        itemName={deleteTarget?.title}
        itemType="Blog Article"
        warning="This action cannot be undone. The article text, meta tags, and public URL will be permanently removed from the website."
        onConfirm={confirmRemove}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
