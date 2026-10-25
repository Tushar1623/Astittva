import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api, { formatApiErrorDetail, isGoogleDriveImage, driveImageUrl } from "@/lib/api";
import { ArrowLeft, Plus, X, Star, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const PROPERTY_TYPES = [
  "Apartment",
  "Flat",
  "Villa",
  "Independent House",
  "Builder Floor",
  "Plot",
  "Commercial Property",
  "Office",
  "Shop",
  "Land",
  "Other",
];

const FURNISHING_OPTIONS = ["Unfurnished", "Semi-Furnished", "Fully Furnished"];
const POSSESSION_OPTIONS = ["Ready to Move", "Immediate", "Under Construction"];
const AGE_OPTIONS = ["Under 1 Year", "1-3 Years", "3-5 Years", "5-10 Years", "10+ Years"];
const PARKING_OPTIONS = ["None", "1 Covered", "2 Covered", "1 Open", "2 Open", "Multiple"];
const STATUS_OPTIONS = ["Draft", "Pending Review", "Published", "Sold", "Inactive"];

const POPULAR_AMENITIES = [
  "Swimming Pool",
  "Gymnasium",
  "24/7 Security",
  "Power Backup",
  "Clubhouse",
  "Children's Play Area",
  "Reserved Parking",
  "Lift / Elevator",
  "Intercom Facility",
  "Landscape Garden",
  "CCTV Surveillance",
  "Fire Fighting System",
  "Visitor Parking",
  "Gated Community",
];

const emptyResaleProperty = {
  title: "",
  propertyType: "Apartment",
  listingType: "For Sale",
  location: "",
  address: "",
  locality: "New Town",
  city: "Kolkata",
  pincode: "",

  price: "",
  pricePerSqFt: "",

  area: "",
  areaUnit: "sq.ft.",
  bedrooms: "3",
  bathrooms: "2",
  balconies: "1",
  floor: "",
  totalFloors: "",
  ageOfProperty: "1-3 Years",
  furnishingStatus: "Semi-Furnished",
  parking: "1 Covered",
  possessionStatus: "Ready to Move",

  description: "",
  amenities: [],

  images: [],
  featuredImage: "",

  sellerName: "",
  sellerPhone: "",
  sellerEmail: "",

  status: "Draft",
  featured: false,
};

export default function AdminResalePropertyFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyResaleProperty);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [customAmenity, setCustomAmenity] = useState("");
  const [imageInputUrl, setImageInputUrl] = useState("");

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api.get(`/admin/resale/${id}`)
        .then(({ data }) => {
          if (data && typeof data === "object") {
            setForm({
              ...emptyResaleProperty,
              ...data,
              price: data.price ?? "",
              pricePerSqFt: data.pricePerSqFt ?? "",
              area: data.area ?? "",
              images: Array.isArray(data.images) ? data.images : [],
              amenities: Array.isArray(data.amenities) ? data.amenities : [],
              featured: Boolean(data.featured),
            });
          }
        })
        .catch((err) => {
          toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed to load resale property");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const setField = (key, val) => {
    setForm((prev) => {
      const next = { ...prev, [key]: val };
      // Auto-calculate pricePerSqFt if price and area are provided and not manually overridden
      if (key === "price" || key === "area") {
        const p = parseFloat(key === "price" ? val : next.price);
        const a = parseFloat(key === "area" ? val : next.area);
        if (p > 0 && a > 0) {
          next.pricePerSqFt = Math.round(p / a);
        }
      }
      return next;
    });
  };

  const handleToggleAmenity = (amenity) => {
    setForm((prev) => {
      const current = prev.amenities || [];
      if (current.includes(amenity)) {
        return { ...prev, amenities: current.filter((a) => a !== amenity) };
      } else {
        return { ...prev, amenities: [...current, amenity] };
      }
    });
  };

  const handleAddCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (!trimmed) return;
    if (!form.amenities.includes(trimmed)) {
      setForm((prev) => ({ ...prev, amenities: [...prev.amenities, trimmed] }));
    }
    setCustomAmenity("");
  };

  const handleAddImages = () => {
    const raw = imageInputUrl.trim();
    if (!raw) return;

    const urls = raw
      .split(/[\n,;]+/)
      .map((s) => s.trim().replace(/^[<"']+|[>"']+$/g, ""))
      .filter(Boolean);

    if (urls.length === 0) return;

    setForm((prev) => {
      const current = prev.images || [];
      const updated = [...current];
      urls.forEach((u) => {
        if (!updated.includes(u)) updated.push(u);
      });
      // If no featured image yet, set first one
      const featured = prev.featuredImage || updated[0] || "";
      return { ...prev, images: updated, featuredImage: featured };
    });

    setImageInputUrl("");
    toast.success(`Added ${urls.length} image link(s)`);
  };

  const handleRemoveImage = (imgUrl) => {
    setForm((prev) => {
      const updated = (prev.images || []).filter((u) => u !== imgUrl);
      let featured = prev.featuredImage;
      if (featured === imgUrl) {
        featured = updated[0] || "";
      }
      return { ...prev, images: updated, featuredImage: featured };
    });
  };

  const handleSetFeaturedImage = (imgUrl) => {
    setForm((prev) => ({ ...prev, featuredImage: imgUrl }));
    toast.success("Set as primary thumbnail");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Please enter a property title");
      return;
    }
    if (!form.price || isNaN(parseFloat(form.price))) {
      toast.error("Please enter a valid price");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
        pricePerSqFt: parseFloat(form.pricePerSqFt) || 0,
        area: parseFloat(form.area) || 0,
        featured: Boolean(form.featured),
      };

      if (isEdit) {
        await api.put(`/admin/resale/${id}`, payload);
        toast.success("Resale property updated successfully");
      } else {
        await api.post("/admin/resale", payload);
        toast.success("Resale property created successfully");
      }
      navigate("/admin/resale");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed to save resale property");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24 text-ivory/50 tracking-[0.3em] uppercase text-xs">
        Loading property details...
      </div>
    );
  }

  return (
    <div data-testid="admin-resale-form-page" className="max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/admin/resale"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-ivory/60 hover:text-copper transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Resale Inventory
        </Link>
        <div className="overline mb-2 text-copper tracking-[0.25em] text-[11px] uppercase">
          Secondary Market Database
        </div>
        <h1 className="font-display font-light text-3xl sm:text-4xl text-ivory">
          {isEdit ? "Edit Resale Property" : "Add Resale Property"}
        </h1>
        <p className="text-ivory/50 text-xs sm:text-sm mt-1">
          This property will be stored strictly in the isolated <code className="text-copper">resale_properties</code> collection.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: PROPERTY INFORMATION */}
        <div className="bg-charcoal-2/30 border border-copper/15 rounded-lg p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-copper/10">
            <div className="w-2 h-2 rounded-full bg-copper" />
            <h2 className="text-sm font-semibold tracking-wider uppercase text-ivory">
              1. Property Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Property Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 3 BHK Luxury Resale Apartment in Uniworld City"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-copper"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Property Type *
              </label>
              <select
                value={form.propertyType}
                onChange={(e) => setField("propertyType", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory focus:outline-none focus:border-copper"
              >
                {PROPERTY_TYPES.map((pt) => (
                  <option key={pt} value={pt} className="bg-charcoal text-ivory">
                    {pt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Listing Type
              </label>
              <select
                value={form.listingType}
                onChange={(e) => setField("listingType", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory focus:outline-none focus:border-copper"
              >
                <option value="For Sale" className="bg-charcoal text-ivory">For Sale (Default)</option>
                <option value="For Rent" className="bg-charcoal text-ivory">For Rent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Locality / Sub-Area
              </label>
              <input
                type="text"
                placeholder="e.g. Action Area I, New Town"
                value={form.locality}
                onChange={(e) => setField("locality", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-copper"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                City *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kolkata"
                value={form.city}
                onChange={(e) => setField("city", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-copper"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                General Location / Landmark
              </label>
              <input
                type="text"
                placeholder="e.g. Near Eco Space / Major Arterial Road"
                value={form.location}
                onChange={(e) => setField("location", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-copper"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Pincode
              </label>
              <input
                type="text"
                placeholder="e.g. 700156"
                value={form.pincode}
                onChange={(e) => setField("pincode", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-copper"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Full Address
              </label>
              <input
                type="text"
                placeholder="e.g. Tower 4, Flat 12B, Uniworld City, Action Area III, New Town, Kolkata"
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-copper"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PRICING */}
        <div className="bg-charcoal-2/30 border border-copper/15 rounded-lg p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-copper/10">
            <div className="w-2 h-2 rounded-full bg-copper" />
            <h2 className="text-sm font-semibold tracking-wider uppercase text-ivory">
              2. Pricing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Total Resale Price (₹ INR) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="1000"
                placeholder="e.g. 8500000 (85 Lakh)"
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-copper"
              />
              {form.price && !isNaN(Number(form.price)) && (
                <div className="text-copper text-xs mt-1.5 font-medium">
                  Formatted: {Number(form.price) >= 10000000 ? `₹${(Number(form.price) / 10000000).toFixed(2)} Cr` : `₹${(Number(form.price) / 100000).toFixed(2)} Lakh`}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Price Per Sq. Ft. (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Auto-calculated from Price / Area"
                value={form.pricePerSqFt}
                onChange={(e) => setField("pricePerSqFt", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-copper"
              />
              <div className="text-ivory/40 text-[11px] mt-1.5">
                Auto-calculated if area is filled, or enter custom rate.
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: PROPERTY DETAILS */}
        <div className="bg-charcoal-2/30 border border-copper/15 rounded-lg p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-copper/10">
            <div className="w-2 h-2 rounded-full bg-copper" />
            <h2 className="text-sm font-semibold tracking-wider uppercase text-ivory">
              3. Property Details &amp; Specifications
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Super Built-up / Carpet Area
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 1450"
                value={form.area}
                onChange={(e) => setField("area", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-copper"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Area Unit
              </label>
              <select
                value={form.areaUnit}
                onChange={(e) => setField("areaUnit", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory focus:outline-none focus:border-copper"
              >
                <option value="sq.ft." className="bg-charcoal text-ivory">sq.ft.</option>
                <option value="sq.yd." className="bg-charcoal text-ivory">sq.yd.</option>
                <option value="sq.m." className="bg-charcoal text-ivory">sq.m.</option>
                <option value="kottah" className="bg-charcoal text-ivory">kottah</option>
                <option value="acres" className="bg-charcoal text-ivory">acres</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Bedrooms (BHK)
              </label>
              <input
                type="text"
                placeholder="e.g. 3 or 3 BHK"
                value={form.bedrooms}
                onChange={(e) => setField("bedrooms", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-copper"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Bathrooms
              </label>
              <input
                type="text"
                placeholder="e.g. 2"
                value={form.bathrooms}
                onChange={(e) => setField("bathrooms", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-copper"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Balconies
              </label>
              <input
                type="text"
                placeholder="e.g. 1"
                value={form.balconies}
                onChange={(e) => setField("balconies", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-copper"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Floor / Total Floors
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Floor (e.g. 7)"
                  value={form.floor}
                  onChange={(e) => setField("floor", e.target.value)}
                  className="w-1/2 px-3 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-copper"
                />
                <input
                  type="text"
                  placeholder="Total (e.g. 18)"
                  value={form.totalFloors}
                  onChange={(e) => setField("totalFloors", e.target.value)}
                  className="w-1/2 px-3 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-copper"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Furnishing Status
              </label>
              <select
                value={form.furnishingStatus}
                onChange={(e) => setField("furnishingStatus", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory focus:outline-none focus:border-copper"
              >
                {FURNISHING_OPTIONS.map((f) => (
                  <option key={f} value={f} className="bg-charcoal text-ivory">{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Parking
              </label>
              <select
                value={form.parking}
                onChange={(e) => setField("parking", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory focus:outline-none focus:border-copper"
              >
                {PARKING_OPTIONS.map((p) => (
                  <option key={p} value={p} className="bg-charcoal text-ivory">{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Age of Property
              </label>
              <select
                value={form.ageOfProperty}
                onChange={(e) => setField("ageOfProperty", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory focus:outline-none focus:border-copper"
              >
                {AGE_OPTIONS.map((a) => (
                  <option key={a} value={a} className="bg-charcoal text-ivory">{a}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Possession Status
              </label>
              <select
                value={form.possessionStatus}
                onChange={(e) => setField("possessionStatus", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory focus:outline-none focus:border-copper"
              >
                {POSSESSION_OPTIONS.map((pos) => (
                  <option key={pos} value={pos} className="bg-charcoal text-ivory">{pos}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: DESCRIPTION & AMENITIES */}
        <div className="bg-charcoal-2/30 border border-copper/15 rounded-lg p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-copper/10">
            <div className="w-2 h-2 rounded-full bg-copper" />
            <h2 className="text-sm font-semibold tracking-wider uppercase text-ivory">
              4. Description &amp; Amenities
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Property Overview &amp; Description
              </label>
              <textarea
                rows={4}
                placeholder="Highlight property USPs, legal clarity, ventilation, view, interior condition, and key reasons to purchase..."
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                className="w-full p-3.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-copper"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Select Amenities
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 mb-4">
                {POPULAR_AMENITIES.map((amenity) => {
                  const selected = form.amenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => handleToggleAmenity(amenity)}
                      className={`text-left px-3 py-2 rounded text-xs transition-colors border ${
                        selected
                          ? "bg-copper/20 border-copper text-copper font-medium"
                          : "bg-charcoal-3/40 border-copper/15 text-ivory/60 hover:text-ivory hover:border-copper/40"
                      }`}
                    >
                      {selected ? "✓ " : "+ "} {amenity}
                    </button>
                  );
                })}
              </div>

              {/* Custom Amenity Adder */}
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="Add custom amenity..."
                  value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomAmenity();
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-charcoal-3/60 border border-copper/20 rounded text-xs text-ivory placeholder-ivory/30 focus:outline-none focus:border-copper"
                />
                <button
                  type="button"
                  onClick={handleAddCustomAmenity}
                  className="px-4 py-2 bg-charcoal-3 hover:bg-copper/20 border border-copper/30 text-copper rounded text-xs uppercase tracking-wider font-semibold transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Selected Amenities Tags */}
              {form.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-copper/10">
                  {form.amenities.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-copper/15 border border-copper/30 text-copper text-xs"
                    >
                      {a}
                      <button
                        type="button"
                        onClick={() => handleToggleAmenity(a)}
                        className="hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 5: MEDIA */}
        <div className="bg-charcoal-2/30 border border-copper/15 rounded-lg p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-copper/10">
            <div className="w-2 h-2 rounded-full bg-copper" />
            <h2 className="text-sm font-semibold tracking-wider uppercase text-ivory">
              5. Media &amp; Photographs
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Paste Image Links (Google Drive link or Direct HTTP URL)
              </label>
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  placeholder="Paste Google Drive link or image URL (comma or newline separated for multiple)..."
                  value={imageInputUrl}
                  onChange={(e) => setImageInputUrl(e.target.value)}
                  className="flex-1 p-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-xs text-ivory placeholder-ivory/30 focus:outline-none focus:border-copper"
                />
                <button
                  type="button"
                  onClick={handleAddImages}
                  className="px-5 bg-copper/20 hover:bg-copper/30 border border-copper/40 text-copper rounded text-xs uppercase tracking-wider font-semibold transition-colors shrink-0"
                >
                  Attach Links
                </button>
              </div>
            </div>

            {/* Display Image Gallery & Primary Thumbnail Selector */}
            {form.images && form.images.length > 0 ? (
              <div>
                <div className="text-xs uppercase tracking-wider text-ivory/70 mb-3">
                  Property Gallery ({form.images.length} photos) — Click star to set primary thumbnail
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {form.images.map((imgUrl, idx) => {
                    const isDrive = isGoogleDriveImage(imgUrl);
                    const isFeatured = form.featuredImage === imgUrl;
                    const previewSrc = isDrive ? driveImageUrl(imgUrl, 250) : imgUrl;

                    return (
                      <div
                        key={idx}
                        className={`relative group rounded border overflow-hidden aspect-video bg-charcoal-3 ${
                          isFeatured ? "border-amber-400 ring-2 ring-amber-400/40" : "border-copper/20"
                        }`}
                      >
                        <img
                          src={previewSrc}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/images/luxe/luxury_villa.webp";
                          }}
                        />

                        {/* Badges / Controls Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-2">
                          <button
                            type="button"
                            onClick={() => handleSetFeaturedImage(imgUrl)}
                            title={isFeatured ? "Primary thumbnail" : "Set as primary thumbnail"}
                            className={`p-1.5 rounded ${
                              isFeatured
                                ? "text-amber-400 bg-black/70"
                                : "text-white/80 hover:text-amber-300 bg-black/50"
                            }`}
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(imgUrl)}
                            title="Remove photo"
                            className="p-1.5 text-rose-400 hover:text-rose-300 bg-black/60 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {isFeatured && (
                          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-amber-500/90 text-black text-[9px] font-bold uppercase tracking-wider">
                            Featured
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-copper/20 rounded-md p-8 text-center bg-charcoal-3/20">
                <ImageIcon className="w-8 h-8 text-copper/40 mx-auto mb-2" />
                <p className="text-xs text-ivory/50">
                  No images added yet. Paste a Google Drive share link above to preview.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 6: SELLER INFORMATION */}
        <div className="bg-charcoal-2/30 border border-copper/15 rounded-lg p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-copper/10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-copper" />
              <h2 className="text-sm font-semibold tracking-wider uppercase text-ivory">
                6. Seller Information (Private to Admin)
              </h2>
            </div>
            <span className="text-[10px] tracking-wider uppercase text-rose-400 font-medium">
              Confidential — Not displayed on public site
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Seller Name
              </label>
              <input
                type="text"
                placeholder="e.g. Joydeep Ghosh"
                value={form.sellerName}
                onChange={(e) => setField("sellerName", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-copper"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Seller Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. +91 98300 00000"
                value={form.sellerPhone}
                onChange={(e) => setField("sellerPhone", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-copper"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Seller Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. joydeep@example.com"
                value={form.sellerEmail}
                onChange={(e) => setField("sellerEmail", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory placeholder-ivory/30 focus:outline-none focus:border-copper"
              />
            </div>
          </div>
        </div>

        {/* SECTION 7: PUBLISHING */}
        <div className="bg-charcoal-2/30 border border-copper/15 rounded-lg p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-copper/10">
            <div className="w-2 h-2 rounded-full bg-copper" />
            <h2 className="text-sm font-semibold tracking-wider uppercase text-ivory">
              7. Publishing &amp; Visibility Controls
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2">
                Publishing Status *
              </label>
              <select
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-charcoal-3/60 border border-copper/20 rounded text-sm text-ivory focus:outline-none focus:border-copper"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st} className="bg-charcoal text-ivory">
                    {st}
                  </option>
                ))}
              </select>
              <div className="text-ivory/40 text-[11px] mt-1.5">
                Note: Only properties with status <strong className="text-emerald-400">Published</strong> are visible on the public /resale marketplace.
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 sm:pt-0">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setField("featured", e.target.checked)}
                  className="w-4 h-4 accent-copper rounded cursor-pointer"
                />
                <div>
                  <span className="text-xs uppercase tracking-wider text-ivory font-medium">
                    Mark as Featured Resale
                  </span>
                  <p className="text-[11px] text-ivory/40">
                    Featured properties are highlighted in the top carousel on /resale
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-copper/15">
          <Link
            to="/admin/resale"
            className="px-6 py-2.5 text-xs uppercase tracking-widest text-ivory/60 hover:text-white transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary min-w-[180px] justify-center"
          >
            {saving ? "Saving Property…" : isEdit ? "Update Property" : "Publish to Resale"}
          </button>
        </div>
      </form>
    </div>
  );
}
