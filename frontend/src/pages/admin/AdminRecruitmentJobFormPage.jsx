import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Briefcase,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building,
  MapPin,
  Calendar,
  IndianRupee,
} from "lucide-react";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

export default function AdminRecruitmentJobFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    department: "Sales & Advisory",
    location: "New Town, Kolkata",
    employmentType: "Full-time",
    workplaceType: "On-site",
    experienceLevel: "Mid-Senior Level",
    experienceMinYears: 3,
    experienceMaxYears: 6,
    salaryRange: {
      min: 600000,
      max: 1200000,
      currency: "INR",
      period: "yearly",
      isDisclosed: true,
    },
    description: "",
    responsibilities: [""],
    requirements: [""],
    benefits: [""],
    tags: "",
    status: "published",
    isFeatured: false,
    expiresAt: "",
  });

  useEffect(() => {
    if (!isEdit) return;
    let isMounted = true;
    async function fetchJob() {
      try {
        setLoading(true);
        const res = await api.get(`/admin/recruitment/jobs/${id}`);
        if (isMounted && res.data) {
          const d = res.data;
          setForm({
            title: d.title || "",
            slug: d.slug || "",
            department: d.department || "Sales & Advisory",
            location: d.location || "New Town, Kolkata",
            employmentType: d.employmentType || "Full-time",
            workplaceType: d.workplaceType || "On-site",
            experienceLevel: d.experienceLevel || "Mid-Senior Level",
            experienceMinYears: d.experienceMinYears ?? 3,
            experienceMaxYears: d.experienceMaxYears ?? 6,
            salaryRange: d.salaryRange || {
              min: 0,
              max: 0,
              currency: "INR",
              period: "yearly",
              isDisclosed: false,
            },
            description: d.description || "",
            responsibilities: Array.isArray(d.responsibilities) && d.responsibilities.length > 0 ? d.responsibilities : [""],
            requirements: Array.isArray(d.requirements) && d.requirements.length > 0 ? d.requirements : [""],
            benefits: Array.isArray(d.benefits) && d.benefits.length > 0 ? d.benefits : [""],
            tags: Array.isArray(d.tags) ? d.tags.join(", ") : (d.tags || ""),
            status: d.status || "published",
            isFeatured: Boolean(d.isFeatured),
            expiresAt: d.expiresAt ? d.expiresAt.split("T")[0] : "",
          });
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load job:", err);
          setServerError(formatApiErrorDetail(err.response?.data?.detail));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchJob();
    return () => {
      isMounted = false;
    };
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSalaryChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      salaryRange: {
        ...prev.salaryRange,
        [field]: value,
      },
    }));
  };

  // Dynamic Array helpers
  const handleArrayChange = (field, index, value) => {
    setForm((prev) => {
      const copy = [...prev[field]];
      copy[index] = value;
      return { ...prev, [field]: copy };
    });
  };

  const handleAddArrayItem = (field) => {
    setForm((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const handleRemoveArrayItem = (field, index) => {
    setForm((prev) => {
      const copy = prev[field].filter((_, i) => i !== index);
      return { ...prev, [field]: copy.length > 0 ? copy : [""] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setServerError("");

    if (!form.title.trim()) {
      setServerError("Job title is required.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || undefined,
        department: form.department.trim(),
        location: form.location.trim(),
        employmentType: form.employmentType,
        workplaceType: form.workplaceType,
        experienceLevel: form.experienceLevel,
        experienceMinYears: parseInt(form.experienceMinYears, 10) || 0,
        experienceMaxYears: parseInt(form.experienceMaxYears, 10) || 0,
        salaryRange: {
          min: parseFloat(form.salaryRange.min) || 0,
          max: parseFloat(form.salaryRange.max) || 0,
          currency: form.salaryRange.currency || "INR",
          period: form.salaryRange.period || "yearly",
          isDisclosed: Boolean(form.salaryRange.isDisclosed),
        },
        description: form.description.trim(),
        responsibilities: form.responsibilities.map((s) => s.trim()).filter(Boolean),
        requirements: form.requirements.map((s) => s.trim()).filter(Boolean),
        benefits: form.benefits.map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        status: form.status,
        isFeatured: Boolean(form.isFeatured),
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };

      if (isEdit) {
        await api.patch(`/admin/recruitment/jobs/${id}`, payload);
        toast.success("Job opening updated successfully!");
      } else {
        await api.post("/admin/recruitment/jobs", payload);
        toast.success("New job opening published successfully!");
      }

      navigate("/admin/recruitment/jobs");
    } catch (err) {
      console.error("Save job error:", err);
      setServerError(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center font-mono text-copper/60 text-xs uppercase tracking-widest">
        Loading Job Opening…
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 font-sans max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-copper/15 pb-6">
        <div>
          <Link
            to="/admin/recruitment/jobs"
            className="inline-flex items-center gap-1.5 text-xs text-copper hover:text-copper/80 font-mono uppercase tracking-wider mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Vacancies
          </Link>
          <h1 className="text-2xl sm:text-3xl font-display text-ivory">
            {isEdit ? "Edit Job Opening" : "Create New Vacancy"}
          </h1>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-copper hover:bg-copper/90 text-charcoal font-semibold text-xs uppercase tracking-wider transition-colors shadow-lg disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-charcoal border-t-transparent rounded-full animate-spin" />
              <span>Saving…</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Opening</span>
            </>
          )}
        </button>
      </div>

      {serverError && (
        <div className="bg-red-950/30 border border-red-500/40 rounded-xl p-4 text-red-200 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Details */}
        <div className="bg-[#181818] border border-copper/20 rounded-xl p-6 space-y-4 shadow-xl">
          <h2 className="text-sm font-display text-ivory uppercase tracking-wider text-copper border-b border-copper/15 pb-2">
            1. Role Title &amp; Status
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-ivory/70 font-mono mb-1.5">
                Job Title <span className="text-copper">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Senior Real Estate Advisory Specialist"
                className="w-full px-4 py-2.5 bg-charcoal border border-copper/30 rounded-lg text-sm text-ivory focus:outline-none focus:border-copper"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 font-mono mb-1.5">
                Custom URL Slug (Optional)
              </label>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="auto-generated-from-title"
                className="w-full px-4 py-2.5 bg-charcoal border border-copper/30 rounded-lg text-sm text-ivory/80 font-mono focus:outline-none focus:border-copper"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 font-mono mb-1.5">
                Publishing Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-charcoal border border-copper/30 rounded-lg text-sm text-ivory focus:outline-none focus:border-copper"
              >
                <option value="published">Published (Visible on site)</option>
                <option value="draft">Draft (Internal only)</option>
                <option value="closed">Closed (No longer accepting apps)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={handleChange}
              className="w-4 h-4 accent-copper rounded"
            />
            <label htmlFor="isFeatured" className="text-xs text-ivory font-medium cursor-pointer">
              Mark as Featured Position (Pinned to top of careers page with gold badge)
            </label>
          </div>
        </div>

        {/* Department & Workplace Specs */}
        <div className="bg-[#181818] border border-copper/20 rounded-xl p-6 space-y-4 shadow-xl">
          <h2 className="text-sm font-display text-ivory uppercase tracking-wider text-copper border-b border-copper/15 pb-2">
            2. Department, Location &amp; Experience
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 font-mono mb-1.5">
                Department <span className="text-copper">*</span>
              </label>
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                required
                placeholder="e.g. Sales & Advisory"
                className="w-full px-4 py-2.5 bg-charcoal border border-copper/30 rounded-lg text-sm text-ivory focus:outline-none focus:border-copper"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 font-mono mb-1.5">
                Location <span className="text-copper">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                placeholder="e.g. New Town, Kolkata"
                className="w-full px-4 py-2.5 bg-charcoal border border-copper/30 rounded-lg text-sm text-ivory focus:outline-none focus:border-copper"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 font-mono mb-1.5">
                Employment Type
              </label>
              <select
                name="employmentType"
                value={form.employmentType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-charcoal border border-copper/30 rounded-lg text-sm text-ivory focus:outline-none focus:border-copper"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 font-mono mb-1.5">
                Workplace Model
              </label>
              <select
                name="workplaceType"
                value={form.workplaceType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-charcoal border border-copper/30 rounded-lg text-sm text-ivory focus:outline-none focus:border-copper"
              >
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 font-mono mb-1.5">
                Min Exp. (Years)
              </label>
              <input
                type="number"
                min="0"
                name="experienceMinYears"
                value={form.experienceMinYears}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-charcoal border border-copper/30 rounded-lg text-sm text-ivory focus:outline-none focus:border-copper"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 font-mono mb-1.5">
                Max Exp. (Years)
              </label>
              <input
                type="number"
                min="0"
                name="experienceMaxYears"
                value={form.experienceMaxYears}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-charcoal border border-copper/30 rounded-lg text-sm text-ivory focus:outline-none focus:border-copper"
              />
            </div>
          </div>
        </div>

        {/* Salary Range */}
        <div className="bg-[#181818] border border-copper/20 rounded-xl p-6 space-y-4 shadow-xl">
          <h2 className="text-sm font-display text-ivory uppercase tracking-wider text-copper border-b border-copper/15 pb-2">
            3. Compensation Package
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 font-mono mb-1.5">
                Min Annual CTC (INR)
              </label>
              <input
                type="number"
                min="0"
                step="50000"
                value={form.salaryRange.min}
                onChange={(e) => handleSalaryChange("min", e.target.value)}
                placeholder="600000"
                className="w-full px-4 py-2.5 bg-charcoal border border-copper/30 rounded-lg text-sm text-ivory focus:outline-none focus:border-copper"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 font-mono mb-1.5">
                Max Annual CTC (INR)
              </label>
              <input
                type="number"
                min="0"
                step="50000"
                value={form.salaryRange.max}
                onChange={(e) => handleSalaryChange("max", e.target.value)}
                placeholder="1200000"
                className="w-full px-4 py-2.5 bg-charcoal border border-copper/30 rounded-lg text-sm text-ivory focus:outline-none focus:border-copper"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-ivory">
                <input
                  type="checkbox"
                  checked={form.salaryRange.isDisclosed}
                  onChange={(e) => handleSalaryChange("isDisclosed", e.target.checked)}
                  className="w-4 h-4 accent-copper rounded"
                />
                <span>Display salary range publicly on job board</span>
              </label>
            </div>
          </div>
        </div>

        {/* Role Description */}
        <div className="bg-[#181818] border border-copper/20 rounded-xl p-6 space-y-4 shadow-xl">
          <h2 className="text-sm font-display text-ivory uppercase tracking-wider text-copper border-b border-copper/15 pb-2">
            4. Role Overview &amp; Description
          </h2>

          <textarea
            rows={5}
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Write a comprehensive overview of the role, team dynamics, and expectations..."
            className="w-full px-4 py-3 bg-charcoal border border-copper/30 rounded-lg text-sm text-ivory leading-relaxed focus:outline-none focus:border-copper"
          />
        </div>

        {/* Responsibilities List */}
        <div className="bg-[#181818] border border-copper/20 rounded-xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-copper/15 pb-2">
            <h2 className="text-sm font-display text-ivory uppercase tracking-wider text-copper">
              5. Key Responsibilities
            </h2>
            <button
              type="button"
              onClick={() => handleAddArrayItem("responsibilities")}
              className="text-xs text-copper hover:underline flex items-center gap-1 font-mono uppercase"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>

          <div className="space-y-2">
            {form.responsibilities.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange("responsibilities", idx, e.target.value)}
                  placeholder="e.g. Conduct high-touch consultations for HNI buyers in New Town corridor"
                  className="flex-1 px-4 py-2 bg-charcoal border border-copper/25 rounded-lg text-sm text-ivory focus:outline-none focus:border-copper"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem("responsibilities", idx)}
                  className="p-2 text-ivory/40 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements List */}
        <div className="bg-[#181818] border border-copper/20 rounded-xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-copper/15 pb-2">
            <h2 className="text-sm font-display text-ivory uppercase tracking-wider text-copper">
              6. Candidate Requirements
            </h2>
            <button
              type="button"
              onClick={() => handleAddArrayItem("requirements")}
              className="text-xs text-copper hover:underline flex items-center gap-1 font-mono uppercase"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>

          <div className="space-y-2">
            {form.requirements.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange("requirements", idx, e.target.value)}
                  placeholder="e.g. 3+ years experience in high-end residential sales in Kolkata"
                  className="flex-1 px-4 py-2 bg-charcoal border border-copper/25 rounded-lg text-sm text-ivory focus:outline-none focus:border-copper"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem("requirements", idx)}
                  className="p-2 text-ivory/40 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits List */}
        <div className="bg-[#181818] border border-copper/20 rounded-xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-copper/15 pb-2">
            <h2 className="text-sm font-display text-ivory uppercase tracking-wider text-copper">
              7. Benefits &amp; Perks
            </h2>
            <button
              type="button"
              onClick={() => handleAddArrayItem("benefits")}
              className="text-xs text-copper hover:underline flex items-center gap-1 font-mono uppercase"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>

          <div className="space-y-2">
            {form.benefits.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange("benefits", idx, e.target.value)}
                  placeholder="e.g. Uncapped incentive model and executive medical coverage"
                  className="flex-1 px-4 py-2 bg-charcoal border border-copper/25 rounded-lg text-sm text-ivory focus:outline-none focus:border-copper"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem("benefits", idx)}
                  className="p-2 text-ivory/40 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tags & Expiry */}
        <div className="bg-[#181818] border border-copper/20 rounded-xl p-6 space-y-4 shadow-xl">
          <h2 className="text-sm font-display text-ivory uppercase tracking-wider text-copper border-b border-copper/15 pb-2">
            8. Tags &amp; Expiry
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 font-mono mb-1.5">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="Kolkata, Luxury Housing, Advisory, Sales"
                className="w-full px-4 py-2.5 bg-charcoal border border-copper/30 rounded-lg text-sm text-ivory focus:outline-none focus:border-copper"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 font-mono mb-1.5">
                Expiry / Close Date (Optional)
              </label>
              <input
                type="date"
                name="expiresAt"
                value={form.expiresAt}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-charcoal border border-copper/30 rounded-lg text-sm text-ivory focus:outline-none focus:border-copper"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/admin/recruitment/jobs"
            className="px-6 py-2.5 rounded-lg border border-copper/30 text-ivory/70 hover:text-ivory text-xs uppercase tracking-wider font-mono transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-copper hover:bg-copper/90 text-charcoal font-semibold text-xs uppercase tracking-wider transition-colors shadow-lg disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Opening"}
          </button>
        </div>
      </form>
    </div>
  );
}
