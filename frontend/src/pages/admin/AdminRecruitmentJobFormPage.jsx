import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Briefcase,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  IndianRupee,
} from "lucide-react";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import AdminHeader from "@/components/admin/AdminHeader";

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

    if (!form.title.trim()) {
      toast.error("Please enter a job title.");
      return;
    }

    try {
      setSaving(true);
      setServerError("");

      const payload = {
        ...form,
        responsibilities: form.responsibilities.map((s) => s.trim()).filter(Boolean),
        requirements: form.requirements.map((s) => s.trim()).filter(Boolean),
        benefits: form.benefits.map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        experienceMinYears: parseInt(form.experienceMinYears, 10) || 0,
        experienceMaxYears: parseInt(form.experienceMaxYears, 10) || 0,
        salaryRange: {
          min: parseInt(form.salaryRange.min, 10) || 0,
          max: parseInt(form.salaryRange.max, 10) || 0,
          currency: form.salaryRange.currency || "INR",
          period: form.salaryRange.period || "yearly",
          isDisclosed: Boolean(form.salaryRange.isDisclosed),
        },
      };

      if (isEdit) {
        await api.patch(`/admin/recruitment/jobs/${id}`, payload);
        toast.success("Job opening updated successfully!");
      } else {
        await api.post("/admin/recruitment/jobs", payload);
        toast.success("Job opening published successfully!");
      }

      navigate("/admin/recruitment/jobs");
    } catch (err) {
      console.error("Save job error:", err);
      const detail = formatApiErrorDetail(err.response?.data?.detail) || "Failed to save job opening";
      setServerError(detail);
      toast.error(detail);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-[var(--admin-text-muted)] text-center py-20 tracking-[0.3em] uppercase text-xs">
        Loading Vacancy Details…
      </div>
    );
  }

  return (
    <div data-testid="admin-recruitment-job-form" className="space-y-8 max-w-5xl">
      <AdminHeader
        category="Recruitment Console"
        title={isEdit ? "Edit Vacancy" : "Create New Vacancy"}
        subtitle="Configure role specifications, qualifications, compensation brackets, and publishing visibility."
        actions={[
          {
            label: "Back to Vacancies",
            icon: ArrowLeft,
            to: "/admin/recruitment/jobs",
            variant: "outline",
          },
          {
            label: saving ? "Saving…" : (isEdit ? "Save Changes" : "Publish Vacancy"),
            icon: Save,
            variant: "primary",
            onClick: handleSubmit,
            disabled: saving,
          },
        ]}
      />

      {serverError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-[6px] p-4 text-rose-500 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Main Form Sections */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: Core Details */}
        <div className="admin-card rounded-[8px] p-6 sm:p-8 space-y-6">
          <h2 className="font-display font-light text-xl text-[var(--admin-text-primary)] border-b border-[var(--admin-border-subtle)] pb-3">
            1. Role Title &amp; Publishing Status
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[var(--admin-text-secondary)] block mb-2">
                Job Title <span className="text-[var(--admin-accent)]">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Senior Luxury Real Estate Consultant"
                className="w-full px-3.5 py-2.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-[4px] text-xs text-[var(--admin-text-primary)] placeholder:[var(--admin-text-muted)] focus:outline-none focus:border-[var(--admin-accent)]"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[var(--admin-text-secondary)] block mb-2">
                Custom URL Slug (Optional)
              </label>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="auto-generated-from-title"
                className="w-full px-3.5 py-2.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-[4px] text-xs font-mono text-[var(--admin-text-primary)] placeholder:[var(--admin-text-muted)] focus:outline-none focus:border-[var(--admin-accent)]"
              />
              <p className="text-[11px] text-[var(--admin-text-muted)] mt-1 font-mono">
                Live URL: <span className="text-[var(--admin-accent)]">/careers/jobs/{form.slug || "…"}</span>
              </p>
            </div>

            <div>
              <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[var(--admin-text-secondary)] block mb-2">
                Publishing Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-[4px] text-xs text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)]"
              >
                <option value="published">Published (Visible on public board)</option>
                <option value="draft">Draft (Internal preparation)</option>
                <option value="closed">Closed (No longer accepting apps)</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isFeatured"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 accent-[var(--admin-accent)] rounded"
              />
              <label htmlFor="isFeatured" className="text-xs text-[var(--admin-text-primary)] cursor-pointer select-none">
                Mark as <strong className="text-[var(--admin-accent)]">Featured Opportunity</strong> (highlighted on job board)
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 2: Role Specifications */}
        <div className="admin-card rounded-[8px] p-6 sm:p-8 space-y-6">
          <h2 className="font-display font-light text-xl text-[var(--admin-text-primary)] border-b border-[var(--admin-border-subtle)] pb-3">
            2. Department, Location &amp; Employment Type
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[var(--admin-text-secondary)] block mb-2">
                Department
              </label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-[4px] text-xs text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)]"
              >
                <option value="Sales & Advisory">Sales &amp; Advisory</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
                <option value="Legal & Advisory">Legal &amp; Advisory</option>
                <option value="Finance & Accounting">Finance &amp; Accounting</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[var(--admin-text-secondary)] block mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. New Town, Kolkata"
                className="w-full h-10 px-3 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-[4px] text-xs text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)]"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[var(--admin-text-secondary)] block mb-2">
                Workplace Type
              </label>
              <select
                name="workplaceType"
                value={form.workplaceType}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-[4px] text-xs text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)]"
              >
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[var(--admin-text-secondary)] block mb-2">
                Employment Type
              </label>
              <select
                name="employmentType"
                value={form.employmentType}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-[4px] text-xs text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)]"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div>
              <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[var(--admin-text-secondary)] block mb-2">
                Seniority / Level
              </label>
              <select
                name="experienceLevel"
                value={form.experienceLevel}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-[4px] text-xs text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)]"
              >
                <option value="Entry Level">Entry Level</option>
                <option value="Associate">Associate</option>
                <option value="Mid-Senior Level">Mid-Senior Level</option>
                <option value="Director / Executive">Director / Executive</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[var(--admin-text-secondary)] block mb-2">
                Min Experience (Years)
              </label>
              <input
                type="number"
                name="experienceMinYears"
                min="0"
                value={form.experienceMinYears}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-[4px] text-xs text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)]"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[var(--admin-text-secondary)] block mb-2">
                Max Experience (Years)
              </label>
              <input
                type="number"
                name="experienceMaxYears"
                min="0"
                value={form.experienceMaxYears}
                onChange={handleChange}
                className="w-full h-10 px-3 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-[4px] text-xs text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Compensation & Schema.org Salary */}
        <div className="admin-card rounded-[8px] p-6 sm:p-8 space-y-6">
          <h2 className="font-display font-light text-xl text-[var(--admin-text-primary)] border-b border-[var(--admin-border-subtle)] pb-3">
            3. Compensation &amp; Salary Structure
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[var(--admin-text-secondary)] block mb-2">
                Min Annual CTC (₹)
              </label>
              <input
                type="number"
                value={form.salaryRange.min}
                onChange={(e) => handleSalaryChange("min", e.target.value)}
                placeholder="600000"
                className="w-full h-10 px-3 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-[4px] text-xs text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)]"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[var(--admin-text-secondary)] block mb-2">
                Max Annual CTC (₹)
              </label>
              <input
                type="number"
                value={form.salaryRange.max}
                onChange={(e) => handleSalaryChange("max", e.target.value)}
                placeholder="1200000"
                className="w-full h-10 px-3 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-[4px] text-xs text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)]"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[var(--admin-text-secondary)] block mb-2">
                Currency
              </label>
              <input
                type="text"
                value={form.salaryRange.currency}
                onChange={(e) => handleSalaryChange("currency", e.target.value)}
                className="w-full h-10 px-3 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-[4px] text-xs text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isDisclosed"
              checked={form.salaryRange.isDisclosed}
              onChange={(e) => handleSalaryChange("isDisclosed", e.target.checked)}
              className="w-4 h-4 accent-[var(--admin-accent)] rounded"
            />
            <label htmlFor="isDisclosed" className="text-xs text-[var(--admin-text-primary)] cursor-pointer select-none">
              Disclose compensation publicly (enables Google Jobs structured salary indexing)
            </label>
          </div>
        </div>

        {/* SECTION 4: Role Overview & Markdown */}
        <div className="admin-card rounded-[8px] p-6 sm:p-8 space-y-6">
          <h2 className="font-display font-light text-xl text-[var(--admin-text-primary)] border-b border-[var(--admin-border-subtle)] pb-3">
            4. Role Overview &amp; Description
          </h2>

          <div>
            <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[var(--admin-text-secondary)] block mb-2">
              Role Summary &amp; Overview
            </label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the opportunity, core missions, and daily mandate for this position..."
              className="w-full p-3.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-[4px] text-xs text-[var(--admin-text-primary)] placeholder:[var(--admin-text-muted)] focus:outline-none focus:border-[var(--admin-accent)]"
            />
          </div>
        </div>

        {/* SECTION 5: Responsibilities, Requirements & Benefits */}
        <div className="admin-card rounded-[8px] p-6 sm:p-8 space-y-8">
          <h2 className="font-display font-light text-xl text-[var(--admin-text-primary)] border-b border-[var(--admin-border-subtle)] pb-3">
            5. Detailed Specifications &amp; Benefits
          </h2>

          {/* Key Responsibilities */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[var(--admin-text-secondary)] block">
                Key Responsibilities
              </label>
              <button
                type="button"
                onClick={() => handleAddArrayItem("responsibilities")}
                className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--admin-accent)] hover:text-[var(--admin-accent-hover)] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Bullet
              </button>
            </div>

            {form.responsibilities.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange("responsibilities", idx, e.target.value)}
                  placeholder={`Responsibility #${idx + 1}`}
                  className="flex-1 px-3.5 py-2.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-[4px] text-xs text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)]"
                />
                {form.responsibilities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveArrayItem("responsibilities", idx)}
                    className="p-2 text-[var(--admin-text-muted)] hover:text-rose-500 rounded hover:bg-rose-500/10 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Candidate Requirements */}
          <div className="space-y-3 pt-4 border-t border-[var(--admin-border-subtle)]">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[var(--admin-text-secondary)] block">
                Required Qualifications &amp; Skills
              </label>
              <button
                type="button"
                onClick={() => handleAddArrayItem("requirements")}
                className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--admin-accent)] hover:text-[var(--admin-accent-hover)] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Bullet
              </button>
            </div>

            {form.requirements.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange("requirements", idx, e.target.value)}
                  placeholder={`Requirement #${idx + 1}`}
                  className="flex-1 px-3.5 py-2.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-[4px] text-xs text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)]"
                />
                {form.requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveArrayItem("requirements", idx)}
                    className="p-2 text-[var(--admin-text-muted)] hover:text-rose-500 rounded hover:bg-rose-500/10 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="space-y-3 pt-4 border-t border-[var(--admin-border-subtle)]">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[var(--admin-text-secondary)] block">
                Perks &amp; Benefits
              </label>
              <button
                type="button"
                onClick={() => handleAddArrayItem("benefits")}
                className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--admin-accent)] hover:text-[var(--admin-accent-hover)] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Bullet
              </button>
            </div>

            {form.benefits.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange("benefits", idx, e.target.value)}
                  placeholder={`Benefit #${idx + 1}`}
                  className="flex-1 px-3.5 py-2.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-[4px] text-xs text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)]"
                />
                {form.benefits.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveArrayItem("benefits", idx)}
                    className="p-2 text-[var(--admin-text-muted)] hover:text-rose-500 rounded hover:bg-rose-500/10 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="pt-4 border-t border-[var(--admin-border-subtle)]">
            <label className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[var(--admin-text-secondary)] block mb-2">
              Tags / Keywords (comma separated)
            </label>
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="e.g. Luxury Advisory, New Town, High Net Worth, Sales"
              className="w-full px-3.5 py-2.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-[4px] text-xs text-[var(--admin-text-primary)] focus:outline-none focus:border-[var(--admin-accent)]"
            />
          </div>
        </div>

        {/* Bottom Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--admin-border-subtle)]">
          <Link
            to="/admin/recruitment/jobs"
            className="btn-admin-secondary"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-admin-primary"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving…</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEdit ? "Save Changes" : "Publish Vacancy"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
