import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api, { fileUrl, formatApiErrorDetail } from "@/lib/api";
import { ArrowLeft, Upload, X, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { sanitizeBlogHtml } from "@/lib/sanitize";

const empty = {
  title: "",
  slug: "",
  featured_image: "",
  short_description: "",
  body: "",
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  status: "draft",
  publish_date: "",
  author: "Astittva Editorial",
};

function slugify(s) {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function blogImage(src) {
  if (!src) return "";
  if (src.startsWith("http")) return src;
  return fileUrl(src);
}

export default function AdminBlogFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isEdit) {
      api
        .get(`/admin/blogs/${id}`)
        .then(({ data }) => {
          setForm({ ...empty, ...data });
          setSlugTouched(true); // don't auto-overwrite existing slug
        })
        .catch(() => toast.error("Failed to load blog"))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onTitleChange = (v) => {
    set("title", v);
    if (!slugTouched) set("slug", slugify(v));
  };

  const onFile = async (e) => {
    const file = (e.target.files || [])[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/admin/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set("featured_image", data.path);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(
        `Upload failed: ${formatApiErrorDetail(err.response?.data?.detail)}`,
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = () => set("featured_image", "");

  const submit = async (e, overrideStatus) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.body.trim()) {
      toast.error("Body is required");
      return;
    }
    setSaving(true);
    const payload = { ...form };
    if (overrideStatus) payload.status = overrideStatus;
    if (!payload.slug) payload.slug = slugify(payload.title);
    try {
      if (isEdit) {
        await api.put(`/admin/blogs/${id}`, payload);
        toast.success("Blog updated");
      } else {
        await api.post("/admin/blogs", payload);
        toast.success("Blog created");
      }
      navigate("/admin/blogs");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-ivory/50 text-center py-16 tracking-[0.3em] uppercase text-xs">
        Loading...
      </div>
    );
  }

  const imgSrc = blogImage(form.featured_image);

  return (
    <div data-testid="admin-blog-form-page">
      <Link
        to="/admin/blogs"
        className="inline-flex items-center gap-2 text-ivory/60 hover:text-copper text-xs tracking-[0.25em] uppercase mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Blogs
      </Link>

      <div className="flex items-start justify-between mb-10 gap-6 flex-wrap">
        <div>
          <div className="overline mb-3">Editorial</div>
          <h1 className="font-display font-light text-3xl sm:text-4xl text-ivory">
            {isEdit ? "Edit Blog" : "New Blog"}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          data-testid="toggle-preview"
          className="btn-outline"
        >
          <Eye className="w-4 h-4" /> {preview ? "Hide Preview" : "Preview Body"}
        </button>
      </div>

      <form onSubmit={(e) => submit(e)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="input-label">Title *</label>
            <input
              data-testid="blog-title-input"
              className="input-filled"
              value={form.title}
              onChange={(e) => onTitleChange(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="input-label">Slug (URL) *</label>
            <input
              data-testid="blog-slug-input"
              className="input-filled font-mono text-sm"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", slugify(e.target.value));
              }}
              placeholder="auto-generated-from-title"
            />
            <p className="text-ivory/40 text-xs mt-1.5">
              Live URL: <span className="text-copper">/blogs/{form.slug || "…"}</span>
            </p>
          </div>

          <div>
            <label className="input-label">Short Description</label>
            <textarea
              data-testid="blog-short-desc-input"
              className="input-filled min-h-[80px]"
              rows={3}
              value={form.short_description}
              onChange={(e) => set("short_description", e.target.value)}
              placeholder="1-2 sentence teaser shown on the blogs list page."
            />
          </div>

          <div>
            <label className="input-label">Body (Rich Text · HTML supported) *</label>
            <textarea
              data-testid="blog-body-input"
              className="input-filled min-h-[400px] font-mono text-sm leading-[1.55]"
              rows={20}
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
              placeholder={
                'Write with HTML: <h2>Section</h2>, <p>Paragraph…</p>, <strong>bold</strong>, <em>italic</em>, <a href="…">link</a>, <ul><li>…</li></ul>, <blockquote>…</blockquote>, <img src="…" alt="…" />'
              }
            />
            <p className="text-ivory/40 text-xs mt-1.5">
              Supports HTML: h2, h3, p, strong, em, a, ul/ol, blockquote, img.
            </p>
          </div>

          {preview && (
            <div
              data-testid="blog-body-preview"
              className="border border-copper/20 p-6 bg-white blog-prose text-[#1C1C1C]"
              dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(form.body) || "<em>Nothing to preview yet.</em>" }}
            />
          )}

          {/* SEO */}
          <div className="border border-copper/15 p-6 bg-charcoal-2/30 space-y-5">
            <div className="overline">SEO Metadata</div>
            <div>
              <label className="input-label">SEO Title</label>
              <input
                data-testid="blog-seo-title-input"
                className="input-filled"
                value={form.seo_title}
                onChange={(e) => set("seo_title", e.target.value)}
                placeholder="Defaults to blog title"
              />
            </div>
            <div>
              <label className="input-label">SEO Description</label>
              <textarea
                data-testid="blog-seo-desc-input"
                className="input-filled min-h-[70px]"
                rows={2}
                value={form.seo_description}
                onChange={(e) => set("seo_description", e.target.value)}
                placeholder="~150-160 characters. Defaults to short description."
              />
            </div>
            <div>
              <label className="input-label">SEO Keywords</label>
              <input
                data-testid="blog-seo-keywords-input"
                className="input-filled"
                value={form.seo_keywords}
                onChange={(e) => set("seo_keywords", e.target.value)}
                placeholder="comma, separated, keywords"
              />
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-6">
          <div className="border border-copper/15 p-6 bg-charcoal-2/30 space-y-4">
            <div className="overline">Publishing</div>
            <div>
              <label className="input-label">Status</label>
              <select
                data-testid="blog-status-select"
                className="input-filled"
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="input-label">Publish Date</label>
              <input
                data-testid="blog-publish-date-input"
                type="date"
                className="input-filled"
                value={(form.publish_date || "").slice(0, 10)}
                onChange={(e) => set("publish_date", e.target.value)}
              />
              <p className="text-ivory/40 text-xs mt-1.5">
                Auto-set to today when publishing (leave empty).
              </p>
            </div>
            <div>
              <label className="input-label">Author</label>
              <input
                data-testid="blog-author-input"
                className="input-filled"
                value={form.author}
                onChange={(e) => set("author", e.target.value)}
              />
            </div>
          </div>

          <div className="border border-copper/15 p-6 bg-charcoal-2/30 space-y-4">
            <div className="overline">Featured Image</div>
            {imgSrc ? (
              <div className="relative">
                <img
                  src={imgSrc}
                  alt="Featured"
                  className="w-full aspect-[16/10] object-cover border border-copper/20"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  data-testid="remove-featured-image"
                  className="absolute top-2 right-2 bg-black/60 text-white p-1.5 hover:bg-red-500/80 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="border border-dashed border-copper/25 p-6 text-center text-ivory/50 text-xs tracking-[0.25em] uppercase">
                No image
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFile}
              className="hidden"
              data-testid="featured-image-input"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-outline w-full"
              data-testid="upload-featured-image-btn"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> {imgSrc ? "Replace Image" : "Upload Image"}
                </>
              )}
            </button>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={saving}
              data-testid="save-blog-btn"
              className="btn-primary w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Save as Draft"
              )}
            </button>
            <button
              type="button"
              onClick={(e) => submit(e, "published")}
              disabled={saving}
              data-testid="publish-blog-btn"
              className="btn-outline w-full"
            >
              {isEdit ? "Save & Publish" : "Publish Now"}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
