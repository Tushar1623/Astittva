import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api, { fileUrl, formatApiErrorDetail } from "@/lib/api";
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react";
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
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [amenityInput, setAmenityInput] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isEdit) {
      api.get(`/admin/properties/${id}`)
        .then(({ data }) => setForm({ ...data, starting_price: data.starting_price ?? "" }))
        .catch(() => toast.error("Failed to load property"))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const newPaths = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const { data } = await api.post("/admin/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        newPaths.push(data.path);
      } catch (err) {
        toast.error(`Upload failed for ${file.name}: ${formatApiErrorDetail(err.response?.data?.detail)}`);
      }
    }
    setForm((f) => ({ ...f, images: [...(f.images || []), ...newPaths] }));
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (path) => {
    setForm((f) => ({ ...f, images: f.images.filter((p) => p !== path) }));
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

  if (loading) return <div className="text-ivory/50 text-center py-16 tracking-[0.3em] uppercase text-xs">Loading...</div>;

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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {form.images.map((path) => (
              <div key={path} className="relative aspect-[4/3] group border border-copper/20">
                <img loading="lazy" src={fileUrl(path)} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(path)}
                  data-testid={`remove-image`}
                  className="absolute top-1 right-1 w-7 h-7 bg-charcoal/90 border border-copper/40 flex items-center justify-center text-copper hover:bg-copper hover:text-charcoal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <label className="btn-outline inline-flex cursor-pointer">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Uploading..." : "Upload Images"}
            <input ref={fileInputRef} type="file" data-testid="form-image-upload" accept="image/*" multiple className="hidden" onChange={onFiles} />
          </label>
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
