import React, { useState } from "react";
import { Share2 } from "lucide-react";
import ShareModal from "./ShareModal";

/**
 * Reusable Standardised ShareButton Component
 *
 * Props:
 *  - item          (object, optional full property/blog record)
 *  - title         (string)
 *  - description   (string)
 *  - url           (string)
 *  - image         (string)
 *  - type / contentType ("property" | "blog" | "generic")
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
  item,
  title,
  description,
  url,
  image,
  type = "property",
  contentType,
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
  const resolvedContentType = contentType || type || "property";

  const resolvedItem = item || {
    title,
    project_name: title,
    description,
    short_description: description,
    location,
    locality: location,
    price_label: price,
    property_type: propertyType || category,
    category,
    author,
    publish_date: date,
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "solid":
        return "bg-[#B87333] hover:bg-[#A35D27] text-white border border-[#B87333] shadow-xs active:scale-95";
      case "light":
        return "bg-white hover:bg-[#FAF8F5] text-[#1C1C1C] hover:text-[#B87333] border border-[#E8DED2] hover:border-[#B87333]/40 shadow-xs active:scale-95";
      case "compact":
        return "bg-white hover:bg-[#FAF8F5] text-[#1C1C1C] hover:text-[#B87333] border border-[#E8DED2] text-[10px] py-1 px-2.5 rounded-md active:scale-95";
      case "iconOnly":
        return "w-8 h-8 rounded-full bg-white hover:bg-[#B87333] text-[#1C1C1C] hover:text-white border border-[#E8DED2] hover:border-[#B87333] flex items-center justify-center !p-0 transition-all shadow-xs active:scale-95";
      case "outline":
      default:
        return "bg-white hover:bg-[#B87333]/10 text-[#B87333] hover:text-[#A35D27] border border-[#B87333]/40 hover:border-[#B87333] shadow-xs active:scale-95";
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
        aria-label={`Share ${title || resolvedItem?.project_name || resolvedItem?.title || "this item"}`}
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all duration-200 cursor-pointer ${getVariantStyles()} ${className}`}
        {...props}
      >
        <Share2 className="w-3.5 h-3.5 shrink-0" />
        {variant !== "iconOnly" && label && <span>{label}</span>}
      </button>

      <ShareModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        item={resolvedItem}
        contentType={resolvedContentType}
        title={title || resolvedItem?.project_name || resolvedItem?.title}
        description={description || resolvedItem?.description || resolvedItem?.short_description}
        url={url}
        image={image || resolvedItem?.featured_image}
        location={location || resolvedItem?.location || resolvedItem?.locality || resolvedItem?.city}
        price={price || resolvedItem?.price_label}
        propertyType={propertyType || resolvedItem?.property_type}
        category={category || resolvedItem?.category}
      />
    </>
  );
}
