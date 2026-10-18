import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api, { formatApiErrorDetail, isGoogleDriveImage, driveImageUrl, getGoogleDriveFileId } from "@/lib/api";
import { ArrowLeft, X, Eye, Upload, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
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

import { resolveBlogImage, pickBlogFallback } from "@/lib/blogImages";

export default function AdminBlogFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [driveImageUrlInput, setDriveImageUrlInput] = useState("");
  const [preview, setPreview] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [driveValidation, setDriveValidation] = useState({ status: "idle", message: "" });

  const checkDriveAccess = async (rawUrl) => {
    if (!rawUrl || !isGoogleDriveImage(rawUrl)) {
      setDriveValidation({ status: "idle", message: "" });
      return;
    }
    const fileId = getGoogleDriveFileId(rawUrl);
    if (!fileId) return;

    setDriveValidation({ status: "checking", message: "Checking Google Drive link permissions..." });
    try {
      const { data } = await api.get(`/images/validate?id=${fileId}`);
      if (data.valid) {
        setDriveValidation({ status: "valid", message: "Google Drive photo is public and verified." });
      } else if (data.reason === "restricted") {
        setDriveValidation({
          status: "restricted",
          message: data.message || "File requires sign-in. Set General access to 'Anyone with the link' -> Viewer in Google Drive.",
        });
      } else {
        setDriveValidation({
          status: "error",
          message: data.message || "Unable to load image from Google Drive.",
        });
      }
    } catch {
      setDriveValidation({ status: "idle", message: "" });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("Image file must be under 15MB");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result;
          const { data } = await api.post("/upload", {
            filename: file.name,
            contentType: file.type,
            base64,
          });
          set("featured_image", data.url);
          setDriveImageUrlInput("");
          setDriveValidation({ status: "idle", message: "" });
          toast.success("Photo uploaded successfully!");
        } catch (err) {
          toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Upload failed");
        } finally {
          setUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Could not read image file");
      setUploading(false);
    }
  };

  useEffect(() => {
    if (isEdit) {
      api
        .get(`/admin/blogs/${id}`)
        .then(({ data }) => {
          setForm({ ...empty, ...data });
          if (data?.featured_image) {
            setDriveImageUrlInput(data.featured_image);
            if (isGoogleDriveImage(data.featured_image)) {
              checkDriveAccess(data.featured_image);
            }
          }
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

  const handleDriveUrlChange = (val) => {
    setDriveImageUrlInput(val);
    set("featured_image", val.trim());
  };

  const applyDriveImage = () => {
    const url = (driveImageUrlInput || form.featured_image || "").trim();
    if (!url) {
      toast.error("Paste a Google Drive image link");
      return;
    }
    set("featured_image", url);
    setDriveImageUrlInput(url);
    toast.success("Google Drive image linked");
  };

  const removeImage = () => {
    set("featured_image", "");
    setDriveImageUrlInput("");
  };

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
    const finalFeaturedImage = (driveImageUrlInput.trim() || form.featured_image || "").trim();
    const payload = { ...form, featured_image: finalFeaturedImage };
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

  const currentImageUrl = form.featured_image || driveImageUrlInput;
  const imgSrc = resolveBlogImage({ featured_image: currentImageUrl, slug: form.slug, title: form.title }, 800);

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

          <div className="border border-copper/15 p-6 bg-charcoal-2/30 space-y-5">
            <div className="flex items-center justify-between">
              <div className="overline">Featured Image</div>
              {currentImageUrl && (
                <span className="text-[10px] tracking-wider uppercase text-copper font-medium">
                  {isGoogleDriveImage(currentImageUrl) ? "Google Drive" : "Uploaded Image"}
                </span>
              )}
            </div>

            {/* Preview Box */}
            {imgSrc ? (
              <div className="relative group overflow-hidden border border-copper/20 rounded-[4px] aspect-[16/10] bg-charcoal-3">
                <img
                  src={imgSrc}
                  alt="Featured"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = pickBlogFallback({ slug: form.slug, title: form.title });
                  }}
                />

                {/* Status Overlay Badge */}
                {driveValidation.status === "restricted" && (
                  <div className="absolute inset-x-0 bottom-0 bg-red-950/95 text-red-200 p-2.5 text-xs flex items-center gap-2 border-t border-red-500/30">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                    <span className="text-[11px] leading-tight">
                      Google Drive file is restricted. Website visitors cannot see it until set to &quot;Anyone with the link&quot;.
                    </span>
                  </div>
                )}

                {driveValidation.status === "valid" && (
                  <div className="absolute top-2 left-2 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Public
                  </div>
                )}

                {currentImageUrl && (
                  <button
                    type="button"
                    onClick={removeImage}
                    data-testid="remove-featured-image"
                    className="absolute top-2 right-2 bg-black/75 text-white p-1.5 hover:bg-red-500/80 transition rounded"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="border border-dashed border-copper/25 p-8 text-center text-ivory/50 text-xs tracking-[0.25em] uppercase">
                No Featured Image
              </div>
            )}

            {/* Direct Upload Option */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn-outline w-full flex items-center justify-center gap-2 py-2.5 text-xs hover:border-copper"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading photo...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-copper" /> Upload Photo from Device
                  </>
                )}
              </button>
              <p className="text-[10px] text-ivory/50 mt-1.5 text-center font-light">
                JPG, PNG, WebP up to 15MB. Stored directly on site without Google Drive permissions.
              </p>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-copper/15"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase tracking-widest text-ivory/40">or link from Drive</span>
              <div className="flex-grow border-t border-copper/15"></div>
            </div>

            {/* Google Drive Link Input */}
            <div>
              <label className="input-label">Google Drive Image Link</label>
              <div className="space-y-2">
                <input
                  type="text"
                  data-testid="blog-drive-image-input"
                  className="input-filled text-xs font-mono"
                  placeholder="https://drive.google.com/file/d/.../view"
                  value={driveImageUrlInput || form.featured_image || ""}
                  onChange={(e) => {
                    handleDriveUrlChange(e.target.value);
                    checkDriveAccess(e.target.value);
                  }}
                  onBlur={(e) => checkDriveAccess(e.target.value)}
                />

                {driveValidation.status === "checking" && (
                  <div className="flex items-center gap-2 text-[11px] text-copper/80 pt-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Checking link permissions...</span>
                  </div>
                )}

                {driveValidation.status === "valid" && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Google Drive link is public & verified!</span>
                  </div>
                )}

                {driveValidation.status === "restricted" && (
                  <div className="p-3 bg-red-950/40 border border-red-500/40 rounded space-y-1.5 text-red-200 text-xs mt-2">
                    <div className="font-semibold flex items-center gap-1.5 text-red-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Google Drive Permission Notice
                    </div>
                    <p className="text-[11px] text-red-200/90 leading-relaxed font-light">
                      This file is set to <strong>Restricted</strong> (or requires sign-in). To allow visitors to see it:
                    </p>
                    <ol className="list-decimal list-inside text-[11px] text-red-200/80 space-y-0.5 pl-1 font-light">
                      <li>Open file in Google Drive</li>
                      <li>Click <strong>Share</strong> (top-right)</li>
                      <li>Under General access, change to <strong>Anyone with the link → Viewer</strong></li>
                    </ol>
                    <p className="text-[11px] text-copper pt-1">
                      Or click &quot;Upload Photo from Device&quot; above to bypass Drive permissions.
                    </p>
                  </div>
                )}
              </div>
            </div>
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
