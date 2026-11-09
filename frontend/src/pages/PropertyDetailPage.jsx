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
import ShareButton from "@/components/ShareButton";
import SafeImage from "@/components/SafeImage";
import seedProperties from "@/data/seedProperties.json";

function findInitialProperty(id) {
  if (!id) return null;
  try {
    const cached = localStorage.getItem("astitva_cache_properties");
    if (cached) {
      const list = JSON.parse(cached);
      if (Array.isArray(list)) {
        const found = list.find((p) => String(p.id) === String(id) || String(p._id) === String(id));
        if (found) return found;
      }
    }
  } catch (e) {}
  if (Array.isArray(seedProperties)) {
    const found = seedProperties.find((p) => String(p.id) === String(id) || String(p._id) === String(id));
    if (found) return found;
  }
  return null;
}

// Per-property dynamic SEO: title/description/canonical/OG/Twitter + RealEstateListing JSON-LD.
function PropertySeo({ property, id }) {
  const loc = property.location || property.city || "Kolkata";
  const title = `${property.project_name} in ${loc} | Astittva Marketing`;
  const priceTxt = property.price_label || (property.starting_price ? `₹${property.starting_price.toLocaleString("en-IN")}` : "");
  const description =
    `Explore ${property.project_name}${property.location ? ` in ${property.location}` : ""}, Kolkata by ${property.builder || "Astittva Marketing"}. ${priceTxt ? `Starting ${priceTxt}. ` : ""}Verified details, floor plans, and site visits.`;

  const primaryFallback = pickPropertyFallback(property.id || id);
  const rawList = [
    ...(property.featured_image ? [property.featured_image] : []),
    ...(Array.isArray(property.images) ? property.images : []),
  ];
  const driveImg = rawList.find(isGoogleDriveImage);
  const firstResolved = driveImg
    ? driveImageUrl(driveImg, 1200)
    : rawList
        .filter((img) => typeof img === "string" && !img.startsWith("astitva-realestate"))
        .map((img) => fileUrl(img, 1200))
        .find(Boolean);
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
  const [property, setProperty] = useState(() => findInitialProperty(id));
  const [loading, setLoading] = useState(() => !findInitialProperty(id));
  const [activeImg, setActiveImg] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initial = findInitialProperty(id);
    if (!initial) setLoading(true);
    api.get(`/properties/${id}`)
      .then(({ data }) => setProperty(data))
      .catch(() => {
        if (!initial) setProperty(false);
      })
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

  if (loading) return <div className="pt-40 text-center text-[#5F5F5F] tracking-[0.3em] uppercase">Loading...</div>;
  if (!property) {
    return (
      <div className="pt-40 max-w-3xl mx-auto px-6 text-center">
        <Seo title="Property Not Found | Astittva Marketing" noIndex={true} />
        <h2 className="font-display text-3xl text-[#1C1C1C] mb-4">Property not found</h2>
        <Link to="/properties" className="btn-outline mt-4">Back to Properties</Link>
      </div>
    );
  }

  const primaryFallback = pickPropertyFallback(property.id || id);
  const rawList = [
    ...(property.featured_image ? [property.featured_image] : []),
    ...(Array.isArray(property.images) ? property.images : []),
  ];
  const uniqueRawList = Array.from(
    new Set(
      rawList.filter(
        (img) => typeof img === "string" && img.trim().length > 0 && !img.startsWith("astitva-realestate")
      )
    )
  );

  const resolvedImages = uniqueRawList
    .map((img) => (isGoogleDriveImage(img) ? driveImageUrl(img, 1200) : fileUrl(img, 1200)))
    .filter(Boolean);

  const images = resolvedImages.length > 0 ? resolvedImages : [primaryFallback];
  const primaryImage = images[0] || primaryFallback;

  return (
    <div data-testid="property-detail-page" className="pt-28 pb-24">
      <PropertySeo property={property} id={id} />
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-[#5F5F5F] mb-6">
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

        <div className="flex items-center justify-between gap-4 mb-8">
          <Link to="/properties" className="inline-flex items-center gap-2 text-copper text-xs tracking-[0.3em] uppercase hover:text-rose-gold">
            <ArrowLeft className="w-4 h-4" /> Back to Properties
          </Link>
          <ShareButton
            item={property}
            title={property.project_name}
            location={property.location ? `${property.location}, ${property.city || "Kolkata"}` : (property.city || "Kolkata")}
            price={property.price_label || (property.starting_price ? `₹${property.starting_price.toLocaleString("en-IN")}` : "Price on Request")}
            propertyType={property.bedrooms ? `${property.bedrooms} ${property.property_type || "Apartment"}` : (property.property_type || "Luxury Property")}
            category={property.property_category || ""}
            description={property.description}
            url={`https://astittva.in/properties/${id}`}
            image={primaryImage}
            type="property"
            variant="outline"
            label="Share"
          />
        </div>

        {/* Gallery */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-12">
          <div className={`${images.length > 1 ? "lg:col-span-9" : "lg:col-span-12"} aspect-[16/10] overflow-hidden bg-white border border-[#E8DED2] rounded-xl shadow-xs`}>
            {images.length > 0 && images[activeImg] ? (
              <SafeImage
                priority={true}
                src={images[activeImg]}
                alt={`${property.project_name} - ${property.bedrooms || property.property_type || "Luxury apartment"} in ${property.location || property.city || "Kolkata"}`}
                type="property"
                seed={property.id || id}
                fallbackSrc={primaryFallback}
                width={1200}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#8C827A] p-8 text-center bg-[#FAF8F5]">
                <span className="font-display text-lg tracking-widest uppercase text-copper/70 mb-2">No Image Available</span>
                <span className="text-xs text-[#8C827A]">Images will be updated shortly</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="lg:col-span-3 grid grid-cols-4 lg:flex lg:flex-col gap-4 lg:h-full">
              {images.slice(0, 4).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`relative aspect-[4/3] lg:aspect-auto lg:flex-1 lg:min-h-0 overflow-hidden rounded-lg border ${activeImg === i ? "border-[#B87333] ring-2 ring-[#B87333]/25" : "border-[#E8DED2]"} transition-all bg-[#FAF8F5]`}
                >
                  <SafeImage
                    src={img}
                    alt={`${property.project_name} gallery preview ${i + 1}`}
                    type="property"
                    seed={`${property.id || id}-${i}`}
                    fallbackSrc={primaryFallback}
                    width={400}
                    className="absolute inset-0 w-full h-full object-cover"
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
            <h1 className="font-serif-display font-medium text-4xl sm:text-5xl text-[#1C1C1C]">{property.project_name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[#5F5F5F] text-sm">
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

            <p className="text-[#4A4A4A] leading-relaxed font-light whitespace-pre-line text-base">{property.description}</p>

            <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                ["Type", property.property_type],
                ["Category", property.property_category || "—"],
                ["Bedrooms", property.bedrooms || "—"],
                ["Area", property.area_sqft ? `${property.area_sqft} sqft` : "—"],
                ["Possession", property.possession_date || "—"],
                ["Starting Price", property.price_label || (property.starting_price ? `₹${property.starting_price}` : "On request")],
              ].map(([k, v]) => (
                <div key={k} className="bg-white border border-[#E8DED2] rounded-xl p-5 shadow-2xs">
                  <div className="text-[10px] text-[#737373] tracking-[0.25em] uppercase mb-2">{k}</div>
                  <div className="text-[#1C1C1C] font-serif-display text-base font-medium">{v}</div>
                </div>
              ))}
            </div>

            {property.amenities?.length > 0 && (
              <div className="mt-12">
                <h2 className="overline mb-5">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span key={a} className="border border-[#E8DED2] bg-white text-[#1C1C1C] text-xs px-4 py-2 tracking-wider rounded-lg shadow-2xs font-medium">{a}</span>
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
                  className="p-5 border border-[#E8DED2] bg-white rounded-xl hover:border-[#D4A359] hover:shadow-xs transition-all group"
                >
                  <div className="text-copper text-xs tracking-widest uppercase font-medium mb-1 group-hover:text-rose-gold">
                    Home Loan EMI Calculator &rarr;
                  </div>
                  <p className="text-[#5F5F5F] text-xs font-light">
                    Calculate monthly EMI, interest, and repayment schedule for {property.project_name}.
                  </p>
                </Link>
                <Link
                  to="/calculators/stamp-duty-registration"
                  className="p-5 border border-[#E8DED2] bg-white rounded-xl hover:border-[#D4A359] hover:shadow-xs transition-all group"
                >
                  <div className="text-copper text-xs tracking-widest uppercase font-medium mb-1 group-hover:text-rose-gold">
                    West Bengal Stamp Duty Calculator &rarr;
                  </div>
                  <p className="text-[#5F5F5F] text-xs font-light">
                    Estimate registration fees and West Bengal stamp duty costs.
                  </p>
                </Link>
              </div>
              {property.location && (
                <div className="mt-4 text-xs text-[#5F5F5F]">
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
            <div className="sticky top-28 bg-white rounded-2xl border border-[#E8DED2] p-8 shadow-xs">
              <div className="text-[10px] tracking-[0.3em] uppercase text-[#B87333] font-semibold mb-3">Enquire</div>
              <h3 className="font-serif-display text-2xl text-[#1C1C1C] mb-2 font-medium">Request Details</h3>
              <p className="text-[#737373] text-sm mb-6 font-light">A senior advisor will share the brochure, pricing & site visit slots.</p>
              <form onSubmit={submit} className="space-y-4" data-testid="property-enquiry-form">
                <input required id="detail-name" name="name" aria-label="Your full name" placeholder="Name" data-testid="enquiry-name" className="input-consultation" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
                <input required type="tel" id="detail-phone" name="phone" aria-label="Your phone number" placeholder="Phone" data-testid="enquiry-phone" className="input-consultation" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
                <input required type="email" id="detail-email" name="email" aria-label="Your email address" placeholder="Email" data-testid="enquiry-email" className="input-consultation" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                <textarea rows={3} id="detail-message" name="message" aria-label="Message or questions" placeholder="Message (optional)" data-testid="enquiry-message" className="input-consultation" value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} />
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
                <div className="pt-2">
                  <ShareButton
                    item={property}
                    title={property.project_name}
                    location={property.location ? `${property.location}, ${property.city || "Kolkata"}` : (property.city || "Kolkata")}
                    price={property.price_label || (property.starting_price ? `₹${property.starting_price.toLocaleString("en-IN")}` : "Price on Request")}
                    propertyType={property.bedrooms ? `${property.bedrooms} ${property.property_type || "Apartment"}` : (property.property_type || "Luxury Property")}
            category={property.property_category || ""}
                    description={property.description}
                    url={`https://astittva.in/properties/${id}`}
                    image={primaryImage}
                    type="property"
                    variant="compact"
                    className="w-full py-2.5 bg-copper/10 hover:bg-copper/20 border-copper/30"
                    label="Share This Property"
                  />
                </div>
              </div>
            </div>

            {/* Financial Planning & Corridor Cross-Linking Widget */}
            <div className="bg-white rounded-2xl border border-[#E8DED2] p-6 mt-6 space-y-4 shadow-xs">
              <div className="text-[10px] tracking-[0.25em] uppercase text-[#B87333] font-semibold">
                Buyer Resources &amp; Advisory
              </div>
              <h4 className="font-serif-display text-xl text-[#1C1C1C] font-medium">Financial Planning Tools</h4>
              <p className="text-xs text-[#5F5F5F] leading-relaxed font-light">
                Plan your acquisition of {property.project_name} with verified calculators and regional market intelligence:
              </p>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/calculators/home-loan-emi" className="text-copper hover:underline flex items-center gap-1.5 font-medium">
                    → Calculate Home Loan EMI
                  </Link>
                </li>
                <li>
                  <Link to="/calculators/registration-cost" className="text-copper hover:underline flex items-center gap-1.5 font-medium">
                    → West Bengal Stamp Duty &amp; Registration
                  </Link>
                </li>
                <li>
                  <Link to="/resale" className="text-copper hover:underline flex items-center gap-1.5 font-medium">
                    → Curated Resale Homes in Kolkata
                  </Link>
                </li>
                <li>
                  <Link to="/blogs" className="text-copper hover:underline flex items-center gap-1.5 font-medium">
                    → Kolkata Real Estate Market Guides
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
