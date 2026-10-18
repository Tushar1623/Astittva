import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Building2, Calendar, BadgeCheck, Home, ArrowLeft, Phone, MessageCircle } from "lucide-react";
import api, { formatApiErrorDetail, isGoogleDriveImage, driveImageUrl, driveDirectFallbackUrl, fileUrl } from "@/lib/api";
import { pickPropertyFallback } from "@/components/PropertyCard";
import { toast } from "sonner";
import { whatsappLink, PHONE_DISPLAY } from "@/lib/site";
import Seo from "@/components/Seo";
import { buildBreadcrumbSchema } from "@/lib/seoConfig";

// Per-property dynamic SEO: title/description/canonical/OG/Twitter + RealEstateListing JSON-LD.
function PropertySeo({ property, id }) {
  const loc = property.location || property.city || "Kolkata";
  const title = `${property.project_name} in ${loc} | Astittva Marketing`;
  const priceTxt = property.price_label || (property.starting_price ? `₹${property.starting_price.toLocaleString("en-IN")}` : "");
  const description =
    `Explore ${property.project_name}${property.location ? ` in ${property.location}` : ""}, Kolkata by ${property.builder || "Astittva Marketing"}. ${priceTxt ? `Starting ${priceTxt}. ` : ""}Verified details, floor plans, and site visits.`;

  const primaryFallback = pickPropertyFallback(property.id || id);
  const driveImg = (property.images || []).find(isGoogleDriveImage);
  const firstResolved = driveImg
    ? driveImageUrl(driveImg, 1200)
    : (property.images || []).map((img) => (typeof img === "string" ? fileUrl(img, 1200) : "")).find(Boolean);
  const image = firstResolved || primaryFallback;

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Properties", path: "/properties" },
  ];
  if (property.location) {
    breadcrumbs.push({
      name: property.location,
      path: `/properties?location=${encodeURIComponent(property.location)}`,
    });
  }
  breadcrumbs.push({
    name: property.project_name,
    path: `/properties/${id}`,
  });

  const listingJsonLd = {
    "@context": "https://schema.org",
    "@type": "SingleFamilyResidence",
    name: property.project_name,
    description,
    url: `https://astittva.in/properties/${id}`,
    image: image ? [image] : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.location || "",
      addressLocality: property.city || "Kolkata",
      addressRegion: "West Bengal",
      addressCountry: "IN",
    },
    numberOfRooms: property.bedrooms || undefined,
    floorSize: property.area_sqft
      ? { "@type": "QuantitativeValue", value: property.area_sqft, unitText: "SQFT" }
      : undefined,
    offers: {
      "@type": "Offer",
      url: `https://astittva.in/properties/${id}`,
      priceCurrency: "INR",
      price: property.starting_price || undefined,
      priceSpecification: priceTxt
        ? { "@type": "PriceSpecification", price: priceTxt }
        : undefined,
      availability:
        property.availability === "Sold Out"
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      seller: {
        "@type": "RealEstateAgent",
        "@id": "https://astittva.in/#organization",
        name: "Astittva Marketing",
      },
    },
    additionalProperty: [
      property.rera_number && {
        "@type": "PropertyValue",
        name: "RERA",
        value: property.rera_number,
      },
      property.possession_date && {
        "@type": "PropertyValue",
        name: "Possession",
        value: property.possession_date,
      },
    ].filter(Boolean),
  };

  return (
    <Seo
      title={title}
      description={description}
      path={`/properties/${id}`}
      type="product"
      image={image}
      schema={[listingJsonLd, buildBreadcrumbSchema(breadcrumbs)]}
    />
  );
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/properties/${id}`)
      .then(({ data }) => setProperty(data))
      .catch(() => setProperty(false))
      .finally(() => setLoading(false));
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/leads/property", {
        name: form.name,
        phone: form.phone,
        email: form.email,
        propertyId: id || property?.id || "",
        propertyName: property?.project_name || property?.title || "Property Enquiry",
        location: property?.location || property?.city || "",
        leadType: "Property Enquiry",
        message: form.message,
        source: `property:${id}`,
        project: property?.project_name || "",
        property_location: property?.location || property?.city || "",
        interest: property?.project_name || "Property Enquiry",
      });
      toast.success("Enquiry sent. Our team will reach out shortly.");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="pt-40 text-center text-ivory/50 tracking-[0.3em] uppercase">Loading...</div>;
  if (!property) {
    return (
      <div className="pt-40 max-w-3xl mx-auto px-6 text-center">
        <h2 className="font-display text-3xl text-ivory mb-4">Property not found</h2>
        <Link to="/properties" className="btn-outline mt-4">Back to Properties</Link>
      </div>
    );
  }

  const primaryFallback = pickPropertyFallback(property.id || id);
  const rawList = Array.isArray(property.images) ? property.images : [];
  const driveImg = rawList.find(isGoogleDriveImage);
  const resolvedImages = rawList
    .map((img) => (typeof img === "string" ? fileUrl(img, 1200) : ""))
    .filter(Boolean);
  const finalImages = driveImg
    ? [driveImageUrl(driveImg, 1200), ...resolvedImages.filter((u) => u !== driveImageUrl(driveImg, 1200))]
    : resolvedImages;
  const images = finalImages.length > 0 ? finalImages : [primaryFallback];

  return (
    <div data-testid="property-detail-page" className="pt-28 pb-24">
      <PropertySeo property={property} id={id} />
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-ivory/50 mb-6">
          <Link to="/" className="hover:text-copper transition-colors">Home</Link>
          <span>/</span>
          <Link to="/properties" className="hover:text-copper transition-colors">Properties</Link>
          {property.location && (
            <>
              <span>/</span>
              <Link to={`/properties?location=${encodeURIComponent(property.location)}`} className="hover:text-copper transition-colors">
                {property.location}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-copper font-medium">{property.project_name}</span>
        </nav>

        <Link to="/properties" className="inline-flex items-center gap-2 text-copper text-xs tracking-[0.3em] uppercase mb-8 hover:text-rose-gold">
          <ArrowLeft className="w-4 h-4" /> Back to Properties
        </Link>

        {/* Gallery */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-12">
          <div className={`${images.length > 1 ? "lg:col-span-9" : "lg:col-span-12"} aspect-[16/10] overflow-hidden bg-charcoal-2/40 border border-copper/15`}>
            {images.length > 0 && images[activeImg] ? (
              <img
                loading="lazy"
                referrerPolicy="no-referrer"
                src={images[activeImg]}
                alt={`${property.project_name} - ${property.bedrooms || property.property_type || "Luxury apartment"} in ${property.location || property.city || "Kolkata"}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const currentSrc = e.currentTarget.src || "";
                  if (driveImg && currentSrc.includes("drive.google.com/thumbnail")) {
                    e.currentTarget.src = driveDirectFallbackUrl(driveImg, 1200);
                    return;
                  }
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = primaryFallback;
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-ivory/40 p-8 text-center bg-charcoal/50">
                <span className="font-display text-lg tracking-widest uppercase text-copper/70 mb-2">No Image Available</span>
                <span className="text-xs text-ivory/40">Images will be updated shortly</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="lg:col-span-3 grid grid-cols-4 lg:flex lg:flex-col gap-4 lg:h-full">
              {images.slice(0, 4).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`relative aspect-[4/3] lg:aspect-auto lg:flex-1 lg:min-h-0 overflow-hidden border ${activeImg === i ? "border-copper" : "border-copper/15"} transition bg-charcoal/30`}
                >
                  <img
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    src={img}
                    alt={`${property.project_name} gallery preview ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      const currentSrc = e.currentTarget.src || "";
                      if (driveImg && currentSrc.includes("drive.google.com/thumbnail")) {
                        e.currentTarget.src = driveDirectFallbackUrl(driveImg, 400);
                        return;
                      }
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = primaryFallback;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="overline mb-3">{property.property_category || property.property_type}</div>
            <h1 className="font-display font-light text-4xl sm:text-5xl text-ivory">{property.project_name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-ivory/60 text-sm">
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-copper" /> {property.location}, {property.city}</span>
              {property.builder && <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-copper" /> {property.builder}</span>}
              {property.rera_number && <span className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-copper" /> RERA: {property.rera_number}</span>}
              {property.availability && (
                <span
                  data-testid="property-status-badge"
                  className="inline-flex items-center gap-2 border border-copper/40 bg-copper/5 text-copper px-3 py-1 text-[10px] tracking-[0.25em] uppercase font-medium"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-copper" /> {property.availability}
                </span>
              )}
            </div>
            <div className="copper-divider mt-8 mb-8" />

            <p className="text-ivory/75 leading-relaxed font-light whitespace-pre-line text-base">{property.description}</p>

            <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-px bg-copper/15">
              {[
                ["Type", property.property_type],
                ["Category", property.property_category || "—"],
                ["Bedrooms", property.bedrooms || "—"],
                ["Area", property.area_sqft ? `${property.area_sqft} sqft` : "—"],
                ["Possession", property.possession_date || "—"],
                ["Starting Price", property.price_label || (property.starting_price ? `₹${property.starting_price}` : "On request")],
              ].map(([k, v]) => (
                <div key={k} className="bg-white border border-[#E8DED2] p-5">
                  <div className="text-[10px] text-[#737373] tracking-[0.25em] uppercase mb-2">{k}</div>
                  <div className="text-ivory font-display text-sm font-light">{v}</div>
                </div>
              ))}
            </div>

            {property.amenities?.length > 0 && (
              <div className="mt-12">
                <h2 className="overline mb-5">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span key={a} className="border border-copper/25 text-ivory/80 text-xs px-4 py-2 tracking-wider">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {property.google_maps_url && (
              <div className="mt-12">
                <h2 className="overline mb-5">Location</h2>
                <div className="aspect-video border border-copper/15">
                  <iframe
                    title="map"
                    src={property.google_maps_url}
                    className="w-full h-full"
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {/* Internal Linking & Next Steps */}
            <div className="mt-12 pt-8 border-t border-copper/15">
              <h2 className="overline mb-4">Advisory &amp; Financial Planning</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/calculators/home-loan-emi"
                  className="p-4 border border-copper/20 bg-charcoal-2/30 hover:border-copper/50 transition-colors group"
                >
                  <div className="text-copper text-xs tracking-widest uppercase font-medium mb-1 group-hover:text-rose-gold">
                    Home Loan EMI Calculator &rarr;
                  </div>
                  <p className="text-ivory/60 text-xs">
                    Calculate monthly EMI, interest, and repayment schedule for {property.project_name}.
                  </p>
                </Link>
                <Link
                  to="/calculators/stamp-duty-registration"
                  className="p-4 border border-copper/20 bg-charcoal-2/30 hover:border-copper/50 transition-colors group"
                >
                  <div className="text-copper text-xs tracking-widest uppercase font-medium mb-1 group-hover:text-rose-gold">
                    West Bengal Stamp Duty Calculator &rarr;
                  </div>
                  <p className="text-ivory/60 text-xs">
                    Estimate registration fees and West Bengal stamp duty costs.
                  </p>
                </Link>
              </div>
              {property.location && (
                <div className="mt-4 text-xs text-ivory/50">
                  <span>Looking for other projects nearby? </span>
                  <Link
                    to={`/properties?location=${encodeURIComponent(property.location)}`}
                    className="text-copper underline hover:text-rose-gold ml-1"
                  >
                    View more properties in {property.location}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Enquiry */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28 luxury-card p-8">
              <div className="overline mb-3">Enquire</div>
              <h3 className="font-display text-2xl text-ivory mb-2 font-light">Request details</h3>
              <p className="text-ivory/60 text-sm mb-6 font-light">A senior advisor will share the brochure, pricing & site visit slots.</p>
              <form onSubmit={submit} className="space-y-4" data-testid="property-enquiry-form">
                <input required placeholder="Name" data-testid="enquiry-name" className="input-luxury" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
                <input required type="tel" placeholder="Phone" data-testid="enquiry-phone" className="input-luxury" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
                <input required type="email" placeholder="Email" data-testid="enquiry-email" className="input-luxury" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                <textarea rows={3} placeholder="Message (optional)" data-testid="enquiry-message" className="input-luxury" value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} />
                <button type="submit" disabled={submitting} data-testid="enquiry-submit" className="btn-primary w-full disabled:opacity-50">
                  {submitting ? "Sending..." : "Send Enquiry"}
                </button>
              </form>
              <div className="mt-6 pt-6 border-t border-copper/10 space-y-3">
                <a
                  href={whatsappLink(`Hi Astittva, I'm interested in ${property.project_name} (${property.city}). Please share details.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="property-whatsapp"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-[#0a0a0a] py-3 text-xs tracking-[0.18em] uppercase font-medium transition"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp Inquiry
                </a>
                <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`} className="text-copper text-sm tracking-wider flex items-center justify-center gap-2 hover:text-rose-gold pt-1">
                  <Phone className="w-4 h-4" /> {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
