import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { isGoogleDriveImage, driveImageUrl, driveDirectFallbackUrl, fileUrl } from "@/lib/api";
import SafeImage from "@/components/SafeImage";
import ShareButton from "@/components/ShareButton";

const FALLBACK_IMAGES = [
  "/images/luxe/luxury_villa.webp",
  "/images/luxe/property_tower.webp",
  "/images/luxe/property_villa_garden.webp",
  "/images/luxe/property_heritage_estate.webp",
];

export function pickPropertyFallback(id) {
  const key = String(id || "");
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return FALLBACK_IMAGES[h % FALLBACK_IMAGES.length];
}

export default function PropertyCard({
  property,
  index = 0,
  variant = "grid", // "grid" | "featured"
  testId,
}) {
  const p = property;
  const cardTestId =
    testId ||
    (variant === "featured" ? `project-card-${p.id}` : `property-card-${p.id}`);

  const fallback = pickPropertyFallback(p.id);
  const candidateImages = [
    ...(p.featured_image ? [p.featured_image] : []),
    ...(Array.isArray(p.images) ? p.images : []),
  ];
  const driveImg = candidateImages.find(isGoogleDriveImage);
  const anyHttpImg = candidateImages.find(
    (img) =>
      typeof img === "string" &&
      (img.startsWith("http") || img.startsWith("/uploads/")) &&
      !img.includes("astitva-realestate")
  );
  const primaryCandidate = driveImg || anyHttpImg || candidateImages[0] || fallback;

  const price =
    p.price_label ||
    (p.starting_price ? `₹${Number(p.starting_price).toLocaleString("en-IN")}` : "Price on request");

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: Math.min(index, 8) * 0.08 }}
      className="group luxury-card overflow-hidden flex flex-col transition-all duration-500 hover:border-copper/40"
      data-testid={cardTestId}
    >
      <Link to={`/properties/${p.id}`} className="block relative aspect-[4/3] overflow-hidden bg-[#FAF8F5]">
        <SafeImage
          src={primaryCandidate}
          alt={`${p.project_name} - ${p.bedrooms || p.property_type || "Luxury Property"} in ${p.location ? `${p.location}, ${p.city}` : p.city || "Kolkata"}`}
          type="property"
          seed={p.id}
          fallbackSrc={fallback}
          width={1000}
          priority={index < 3}
          className="w-full h-full object-cover transition-transform duration-[1.8s] ease-out group-hover:scale-105"
        />
        {p.property_category && (
          <div className="absolute top-4 left-4 inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-[#E8DED2] px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-copper" />
            <span className="text-[#1C1C1C] text-[9px] tracking-[0.25em] uppercase font-semibold">
              {p.property_category}
            </span>
          </div>
        )}
        {p.availability && (
          <div className="absolute top-4 right-4 bg-charcoal/85 backdrop-blur-sm border border-copper/30 px-2.5 py-1 text-[9px] tracking-[0.2em] uppercase text-copper font-medium">
            {p.availability}
          </div>
        )}
      </Link>

      <div className="p-7 sm:p-8 flex flex-col flex-1">
        <div className="text-[#737373] text-[10px] tracking-[0.35em] uppercase mb-2.5 flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-copper" />
          <span>{p.location ? `${p.location}, ${p.city}` : p.city}</span>
        </div>

        <Link to={`/properties/${p.id}`} className="block">
          <h3 className="font-serif-display text-2xl text-ivory mb-2 group-hover:text-copper transition-colors duration-500 leading-snug">
            {p.project_name}
          </h3>
        </Link>

        {p.builder && (
          <div className="text-xs text-copper/90 tracking-widest uppercase mb-3 font-medium">
            {p.builder}
          </div>
        )}

        <p className="text-[#5F5F5F] text-sm font-light line-clamp-2 leading-[1.7] mb-6 flex-1">
          {p.description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-5 border-t border-[#E8DED2]">
          <div>
            <div className="text-[9px] tracking-[0.3em] uppercase text-[#737373] mb-0.5">Starting</div>
            <span className="text-ivory font-serif-display text-lg font-medium">{price}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShareButton
              item={p}
              title={p.project_name}
              location={p.location ? `${p.location}, ${p.city || "Kolkata"}` : (p.city || "Kolkata")}
              price={price}
              propertyType={p.bedrooms ? `${p.bedrooms} ${p.property_type || "Apartment"}` : (p.property_type || "Luxury Property")}
              category={p.property_category}
              description={p.description}
              url={`https://astittva.in/properties/${p.id}`}
              image={primaryCandidate}
              type="property"
              variant="iconOnly"
              className="w-10 h-10 min-w-[40px] min-h-[40px] sm:w-11 sm:h-11 sm:min-w-[44px] sm:min-h-[44px] !p-0"
              label=""
            />
            <Link
              to={`/properties/${p.id}`}
              aria-label={`Explore ${p.project_name} in ${p.location ? `${p.location}, ${p.city || "Kolkata"}` : p.city || "Kolkata"}`}
              className="inline-flex items-center gap-1.5 text-copper text-xs tracking-[0.2em] uppercase font-medium hover:text-copper-hover transition-transform duration-300 group-hover:translate-x-1 py-2 px-1"
            >
              Explore Property <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
