import React, { useState } from "react";
import { Share2 } from "lucide-react";
import ShareModal from "./ShareModal";

/**
 * Reusable Standardised ShareButton Component
 *
 * Props:
 *  - title         (string)
 *  - description   (string)
 *  - url           (string)
 *  - image         (string)
 *  - type          ("property" | "blog" | "generic")
 *  - location      (string, for property)
 *  - price         (string, for property)
 *  - propertyType  (string, for property)
 *  - category      (string, for blog or property)
 *  - author        (string, for blog)
 *  - date          (string, for blog)
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
  category = "",
  author = "",
  date = "",
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
        return "bg-white hover:bg-[#FAF8F5] text-[#1C1C1C] hover:text-copper border border-[#E8DED2] hover:border-copper/40 shadow-xs";
      case "compact":
        return "bg-white hover:bg-[#FAF8F5] text-[#1C1C1C] hover:text-copper border border-[#E8DED2] text-[10px] py-1 px-2.5 rounded-md";
      case "iconOnly":
        return "w-8 h-8 rounded-full bg-white hover:bg-copper text-[#1C1C1C] hover:text-white border border-[#E8DED2] hover:border-copper flex items-center justify-center !p-0 transition-colors shadow-xs";
      case "outline":
      default:
        return "bg-white hover:bg-copper/10 text-copper hover:text-copper-hover border border-copper/40 hover:border-copper shadow-xs";
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        aria-label={`Share ${title || "this item"}`}
        className={`inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${getVariantStyles()} ${className}`}
        {...props}
      >
        <Share2 className="w-3.5 h-3.5 shrink-0" />
        {variant !== "iconOnly" && label && <span>{label}</span>}
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
        category={category}
        author={author}
        date={date}
      />
    </>
  );
}
