import React, { useState } from "react";
import { Share2 } from "lucide-react";
import ShareModal from "./ShareModal";

/**
 * Reusable ShareButton Component
 *
 * Props:
 *  - title         (string)
 *  - description   (string)
 *  - url           (string)
 *  - image         (string)
 *  - type          ("property" | "blog")
 *  - location      (string, for property)
 *  - price         (string, for property)
 *  - propertyType  (string, for property)
 *  - variant       ("outline" | "solid" | "light" | "compact" | "iconOnly")
 *  - className     (string)
 *  - label         (string) Defaults to "Share"
 */
export default function ShareButton({
  title,
  description,
  url,
  image,
  type = "property",
  location = "",
  price = "",
  propertyType = "",
  variant = "outline",
  className = "",
  label = "Share",
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case "solid":
        return "bg-copper hover:bg-copper-hover text-white border border-copper shadow-sm";
      case "light":
        return "bg-white hover:bg-[#FAF8F5] text-[#1C1C1C] hover:text-copper border border-[#E8DED2] hover:border-copper/40 shadow-sm";
      case "compact":
        return "bg-charcoal/70 hover:bg-charcoal text-ivory/80 hover:text-copper border border-copper/25 text-[10px] py-1 px-2.5";
      case "iconOnly":
        return "bg-white/5 hover:bg-copper/20 text-ivory/80 hover:text-copper border border-copper/20 p-2 rounded-full";
      case "outline":
      default:
        return "bg-charcoal/40 hover:bg-charcoal/80 text-ivory/90 hover:text-copper border border-copper/30 hover:border-copper";
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Share ${title || "this item"}`}
        className={`inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-[6px] text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${getVariantStyles()} ${className}`}
        {...props}
      >
        <Share2 className="w-3.5 h-3.5" />
        {variant !== "iconOnly" && <span>{label}</span>}
      </button>

      <ShareModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        description={description}
        url={url}
        image={image}
        type={type}
        location={location}
        price={price}
        propertyType={propertyType}
      />
    </>
  );
}
