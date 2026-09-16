import React from "react";
import { motion } from "framer-motion";

/**
 * NewWebsiteSection
 *
 * Editorial transition banner introducing the new Astittva digital experience.
 * Crafted with warm ivory tones, copper accent lines, and editorial serif typography.
 *
 * @param {Object} props
 * @param {string} [props.eyebrow="EXPLORE ASTITTVA"] - Small uppercase letter-spaced label
 * @param {string} [props.headlineMain="Your next property decision,"] - First line of headline
 * @param {string} [props.headlineEmphasis="starts here."] - Italicized second line of headline
 * @param {string} [props.description] - Editorial description paragraph
 * @param {string} [props.ctaText="EXPLORE THE NEW ASTITTVA"] - Primary CTA text
 * @param {string} [props.ctaUrl="https://astittva.com"] - Destination URL for new platform
 * @param {string} [props.target="_blank"] - Link target ('_blank' or '_self')
 * @param {string} [props.secondaryText="Continue on this website"] - Secondary dismiss/scroll link
 * @param {string} [props.secondaryHref="#content"] - Secondary target anchor or URL
 * @param {Function} [props.onSecondaryClick] - Optional callback when secondary link is clicked
 * @param {boolean} [props.centered=true] - Center-aligned (default) or left-aligned
 * @param {string} [props.className=""] - Additional container classes
 */
export default function NewWebsiteSection({
  eyebrow = "EXPLORE ASTITTVA",
  headlineMain = "Your next property decision,",
  headlineEmphasis = "starts here.",
  description = "Discover our new digital experience for curated properties, expert advisory and smarter real estate decisions across Eastern India.",
  ctaText = "EXPLORE THE NEW ASTITTVA",
  ctaUrl = "https://astittva.com",
  target = "_blank",
  secondaryText = "Continue on this website",
  secondaryHref = "#content",
  onSecondaryClick,
  centered = true,
  className = "",
}) {
  const alignClass = centered ? "text-center items-center" : "text-left items-start";
  const flexJustify = centered ? "justify-center" : "justify-start";

  const handleSecondary = (e) => {
    if (onSecondaryClick) {
      e.preventDefault();
      onSecondaryClick(e);
      return;
    }
    if (secondaryHref.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(secondaryHref);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
      }
    }
  };

  return (
    <section
      data-testid="new-website-section"
      className={`relative w-full bg-[#FAF8F5] border-y border-[#E8DED2] py-20 sm:py-28 lg:py-32 px-6 sm:px-8 lg:px-16 overflow-hidden ${className}`}
      style={{
        backgroundColor: "#FAF8F5",
        borderColor: "#E8DED2",
      }}
    >
      <div className={`max-w-[1100px] mx-auto flex flex-col ${alignClass}`}>
        {/* Eyebrow Label with Thin Copper Accent Line */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`inline-flex items-center gap-3 mb-6 sm:mb-8 ${flexJustify}`}
        >
          <span
            className="w-8 h-px bg-[#B87333] shrink-0"
            aria-hidden="true"
            style={{ backgroundColor: "#B87333", height: "1px", width: "32px" }}
          />
          <span
            className="text-[10px] sm:text-[11px] tracking-[0.45em] uppercase font-medium text-[#5F5F5F]"
            style={{ letterSpacing: "0.45em", color: "#5F5F5F" }}
          >
            {eyebrow}
          </span>
          {centered && (
            <span
              className="w-8 h-px bg-[#B87333] shrink-0 hidden sm:inline-block"
              aria-hidden="true"
              style={{ backgroundColor: "#B87333", height: "1px", width: "32px" }}
            />
          )}
        </motion.div>

        {/* Serif Editorial Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl sm:text-5xl lg:text-6xl text-[#1C1C1C] leading-[1.12] tracking-[-0.015em] mb-6 sm:mb-8 max-w-4xl font-normal"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 400,
            color: "#1C1C1C",
          }}
        >
          {headlineMain}
          <br />
          <span
            className="text-[#5F5F5F] italic font-light"
            style={{
              fontStyle: "italic",
              color: "#5F5F5F",
              fontWeight: 300,
            }}
          >
            {headlineEmphasis}
          </span>
        </motion.h2>

        {/* Editorial Description */}
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-[#5F5F5F] font-light text-base sm:text-lg lg:text-[19px] leading-[1.75] max-w-2xl mb-10 sm:mb-12"
            style={{
              color: "#5F5F5F",
              lineHeight: 1.75,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {description}
          </motion.p>
        )}

        {/* Actions Row: Primary CTA + Secondary Link */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={`flex flex-col sm:flex-row items-center gap-5 sm:gap-8 ${flexJustify} w-full sm:w-auto`}
        >
          {/* Primary CTA */}
          <a
            href={ctaUrl}
            target={target}
            rel={target === "_blank" ? "noopener noreferrer" : undefined}
            data-testid="new-website-cta"
            className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 text-[11px] tracking-[0.22em] uppercase font-medium text-white bg-[#1C1C1C] hover:bg-[#B87333] border border-[#1C1C1C] hover:border-[#B87333] transition-all duration-500 w-full sm:w-auto shadow-[0_2px_15px_-4px_rgba(28,28,28,0.15)] hover:shadow-[0_4px_20px_-4px_rgba(184,115,51,0.35)]"
            style={{
              letterSpacing: "0.22em",
              borderRadius: "1px",
            }}
          >
            <span>{ctaText}</span>
            <span
              className="text-sm transition-transform duration-300 ease-out group-hover:translate-x-1.5"
              aria-hidden="true"
            >
              →
            </span>
          </a>

          {/* Secondary Link */}
          {secondaryText && (
            <a
              href={secondaryHref}
              onClick={handleSecondary}
              data-testid="continue-website-link"
              className="inline-flex items-center text-[11px] sm:text-xs tracking-[0.18em] uppercase text-[#737373] hover:text-[#1C1C1C] transition-colors duration-300 py-2 border-b border-transparent hover:border-[#1C1C1C]"
              style={{
                letterSpacing: "0.18em",
              }}
            >
              {secondaryText}
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
}
