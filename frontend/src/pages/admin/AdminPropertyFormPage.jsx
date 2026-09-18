import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api, { formatApiErrorDetail, isGoogleDriveImage, driveImageUrl } from "@/lib/api";
import { ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";

const emptyProperty = {
  project_name: "",
  builder: "",
  location: "",
  city: "New Town",
  starting_price: "",
  price_label: "",
  property_type: "Residential",
  property_category: "Luxury",
  description: "",
  images: [],
  rera_number: "",
  possession_date: "",
  google_maps_url: "",
  bedrooms: "",
  area_sqft: "",
  amenities: [],
  status: "draft",
  availability: "Under Construction",
  is_featured: false,
};

export default function AdminPropertyFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(emptyProperty);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [amenityInput, setAmenityInput] = useState("");
  const [driveInputUrl, setDriveInputUrl] = useState("");

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      setLoadError(null);
      // Try admin endpoint first; fall back to public property endpoint if needed
      api.get(`/admin/properties/${id}`)
        .catch(() => api.get(`/properties/${id}`))
        .then(({ data }) => {
          if (data && typeof data === "object") {
            setForm({
              ...emptyProperty,
              ...data,
              starting_price: data.starting_price ?? "",
              images: Array.isArray(data.images) ? data.images : [],
              amenities: Array.isArray(data.amenities) ? data.amenities : [],
            });
          } else {
            throw new Error("Invalid data format received");
          }
        })
        .catch((err) => {
          console.error("Failed to load property:", err);
          setLoadError("Failed to load property details. Please try again.");
          toast.error("Failed to load property");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const removeImage = (path) => {
    setForm((f) => ({ ...f, images: (f.images || []).filter((p) => p !== path) }));
  };

  const addDriveImage = () => {
    const url = driveInputUrl.trim();
    if (!url) {
      toast.error("Paste a Google Drive image link");
      return;
    }
    if (!isGoogleDriveImage(url)) {
      toast.error("Please enter a valid Google Drive image link");
      return;
    }
    setForm((f) => ({
      ...f,
      images: [...(f.images || []), url],
    }));
    setDriveInputUrl("");
    toast.success("Google Drive image added");
  };

  const addAmenity = () => {
    const v = amenityInput.trim();
    if (!v) return;
    if (form.amenities.includes(v)) { setAmenityInput(""); return; }
    setForm((f) => ({ ...f, amenities: [...f.amenities, v] }));
    setAmenityInput("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      starting_price: form.starting_price === "" ? null : Number(form.starting_price),
    };
    try {
      if (isEdit) {
        await api.put(`/admin/properties/${id}`, payload);
        toast.success("Property updated");
      } else {
        await api.post("/admin/properties", payload);
        toast.success("Property created");
      }
      navigate("/admin/properties");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-copper/30 border-t-copper rounded-full animate-spin" />
        <div className="text-copper text-xs tracking-[0.3em] uppercase">Loading Property Details...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="py-24 text-center space-y-4">
        <p className="text-rose-400 text-sm">{loadError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-outline text-xs tracking-[0.2em] uppercase px-4 py-2"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div data-testid="admin-property-form">
      <Link to="/admin/properties" className="inline-flex items-center gap-2 text-copper text-xs tracking-[0.3em] uppercase mb-8 hover:text-rose-gold">
        <ArrowLeft className="w-4 h-4" /> Back to Properties
      </Link>

      <div className="mb-12">
        <div className="overline mb-3">{isEdit ? "Edit" : "Create"}</div>
        <h1 className="font-display font-light text-3xl sm:text-4xl text-ivory">
          {isEdit ? form.project_name || "Property" : "Add New Property"}
        </h1>
      </div>

      <form onSubmit={submit} className="space-y-8">
        {/* Basic */}
        <section className="border border-copper/15 p-8">
          <h3 className="overline mb-6">Basic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="input-label">Project Name *</label>
              <input required data-testid="form-project-name" className="input-filled" value={form.project_name} onChange={(e) => set("project_name", e.target.value)} />
            </div>
            <div>
              <label className="input-label">Builder</label>
              <input data-testid="form-builder" className="input-filled" value={form.builder} onChange={(e) => set("builder", e.target.value)} />
            </div>
            <div>
              <label className="input-label">Location *</label>
              <input required data-testid="form-location" className="input-filled" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Action Area II" />
            </div>
            <div>
              <label className="input-label">City *</label>
              <select required data-testid="form-city" className="input-filled" value={form.city} onChange={(e) => set("city", e.target.value)}>
                <option>New Town</option>
                <option>Rajarhat</option>
                <option>Kolkata</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="input-label">Property Type *</label>
              <select required data-testid="form-type" className="input-filled" value={form.property_type} onChange={(e) => set("property_type", e.target.value)}>
                <option>Residential</option>
                <option>Commercial</option>
                <option>Retail</option>
                <option>Office Space</option>
                <option>Villa</option>
                <option>Apartment</option>
                <option>Penthouse</option>
                <option>Plot</option>
              </select>
            </div>
            <div>
              <label className="input-label">Property Category</label>
              <select data-testid="form-category" className="input-filled" value={form.property_category} onChange={(e) => set("property_category", e.target.value)}>
                <option>Luxury</option>
                <option>Ultra Luxury</option>
                <option>Investment</option>
                <option>Commercial</option>
                <option>Waterfront</option>
                <option>Golf Facing</option>
                <option>Smart Home</option>
              </select>
            </div>
            <div>
              <label className="input-label">Availability</label>
              <select data-testid="form-availability" className="input-filled" value={form.availability} onChange={(e) => set("availability", e.target.value)}>
                <option>Ready To Move</option>
                <option>Under Construction</option>
                <option>New Launch</option>
                <option>Possession Soon</option>
                <option>Sold Out</option>
              </select>
            </div>
            <div>
              <label className="input-label">Starting Price (₹)</label>
              <input type="number" data-testid="form-starting-price" className="input-filled" value={form.starting_price} onChange={(e) => set("starting_price", e.target.value)} />
            </div>
            <div>
              <label className="input-label">Price Label</label>
              <input data-testid="form-price-label" className="input-filled" value={form.price_label} onChange={(e) => set("price_label", e.target.value)} placeholder="e.g. ₹1.2 Cr onwards" />
            </div>
            <div className="md:col-span-2">
              <label className="input-label">Description *</label>
              <textarea required rows={5} data-testid="form-description" className="input-filled" value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>
          </div>
        </section>

        {/* Images */}
        <section className="border border-copper/15 p-8">
          <h3 className="overline mb-6">Images</h3>
          {(() => {
            const driveImages = (form.images || []).filter(isGoogleDriveImage);
            return (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {driveImages.map((path) => (
                    <div key={path} className="relative aspect-[4/3] group border border-copper/20 bg-charcoal/30">
                      <img
                        loading="lazy"
                        src={driveImageUrl(path)}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(path)}
                        data-testid="remove-image"
                        className="absolute top-1 right-1 w-7 h-7 bg-charcoal/90 border border-copper/40 flex items-center justify-center text-copper hover:bg-copper hover:text-charcoal transition"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {driveImages.length === 0 && (
                  <p className="text-xs text-ivory/40 mb-6 italic">No Google Drive images added yet.</p>
                )}
              </>
            );
          })()}

          {/* Google Drive Image Link Input */}
          <div>
            <label className="input-label">Google Drive Image Link</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                data-testid="form-drive-image-url"
                className="input-filled flex-1"
                placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                value={driveInputUrl}
                onChange={(e) => setDriveInputUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addDriveImage();
                  }
                }}
              />
              <button
                type="button"
                onClick={addDriveImage}
                data-testid="add-drive-image-button"
                className="btn-outline shrink-0 inline-flex items-center justify-center gap-2"
              >
                + Add Drive Image
              </button>
            </div>
            <p className="text-[11px] text-ivory/50 mt-2 font-light">
              Before adding the image, open Google Drive → Share → General access → Anyone with the link → Viewer.
            </p>
          </div>
        </section>

        {/* Details */}
        <section className="border border-copper/15 p-8">
          <h3 className="overline mb-6">Additional Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="input-label">RERA Number</label>
              <input data-testid="form-rera" className="input-filled" value={form.rera_number} onChange={(e) => set("rera_number", e.target.value)} />
            </div>
            <div>
              <label className="input-label">Possession Date</label>
              <input data-testid="form-possession" className="input-filled" value={form.possession_date} onChange={(e) => set("possession_date", e.target.value)} placeholder="e.g. Dec 2027" />
            </div>
            <div>
              <label className="input-label">Bedrooms</label>
              <input data-testid="form-bedrooms" className="input-filled" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} placeholder="e.g. 3 BHK, 4 BHK" />
            </div>
            <div>
              <label className="input-label">Area (sqft)</label>
              <input data-testid="form-area" className="input-filled" value={form.area_sqft} onChange={(e) => set("area_sqft", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="input-label">Google Maps Embed URL</label>
              <input data-testid="form-maps" className="input-filled" value={form.google_maps_url} onChange={(e) => set("google_maps_url", e.target.value)} placeholder="https://www.google.com/maps/embed?..." />
            </div>
            <div className="md:col-span-2">
              <label className="input-label">Amenities</label>
              <div className="flex gap-2 mb-3">
                <input
                  data-testid="form-amenity-input"
                  className="input-filled flex-1"
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAmenity(); } }}
                  placeholder="e.g. Swimming Pool, Clubhouse"
                />
                <button type="button" onClick={addAmenity} className="btn-outline">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.amenities.map((a) => (
                  <span key={a} className="border border-copper/30 text-ivory/80 text-xs px-3 py-1.5 flex items-center gap-2">
                    {a}
                    <button type="button" onClick={() => setForm((f) => ({ ...f, amenities: f.amenities.filter((x) => x !== a) }))} className="text-copper hover:text-rose-gold">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Status */}
        <section className="border border-copper/15 p-8">
          <h3 className="overline mb-6">Visibility</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="input-label">Status</label>
              <select data-testid="form-status" className="input-filled" value={form.status} onChange={(e) => set("status", e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer text-ivory/80">
                <input
                  type="checkbox"
                  data-testid="form-featured"
                  checked={form.is_featured}
                  onChange={(e) => set("is_featured", e.target.checked)}
                  className="w-4 h-4 accent-copper"
                />
                <span className="text-xs tracking-[0.2em] uppercase">Mark as Featured</span>
              </label>
            </div>
          </div>
        </section>

        <div className="flex gap-4">
          <button type="submit" disabled={saving} data-testid="form-submit" className="btn-primary disabled:opacity-50">
            {saving ? "Saving..." : (isEdit ? "Update Property" : "Create Property")}
          </button>
          <Link to="/admin/properties" className="btn-outline">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
