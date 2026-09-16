import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, MapPin, CheckCircle2, Trees, Compass, Shield } from "lucide-react";

/**
 * RiddhiBhumiSection
 *
 * Featured showcase section for the flagship Riddhi Bhoomi township development
 * by Wellburg Reality, positioned adjacent to New Town Kolkata.
 * Uses client-side React Router navigation for an instant, silky-smooth transition
 * with zero page reloads.
 */
export default function RiddhiBhumiSection() {
  const highlights = [
    {
      icon: Compass,
      title: "150 Bighas* Master Plan",
      desc: "Comprehensive conceptual zoning with dedicated residential, duplex, commercial & club sectors.",
      tab: "master-plan",
    },
    {
      icon: Trees,
      title: "50%+ Greenery & Open Space",
      desc: "Designed with expansive central green boulevards, natural water bodies, and eco-parks.",
      tab: "about",
    },
    {
      icon: MapPin,
      title: "Adjacent to New Town",
      desc: "Direct arterial connectivity via six-lane New Town route, Basanti Highway & Shapoorji hub.",
      tab: "location",
    },
    {
      icon: Shield,
      title: "Verified Documentation",
      desc: "Clear-title land development with flexible investor-friendly payment and EMI structures.",
      tab: "documents",
    },
  ];

  return (
    <section
      id="riddhi-bhoomi"
      data-testid="riddhi-bhoomi-showcase"
      className="relative py-20 sm:py-28 lg:py-32 bg-[#FAF8F5] border-b border-[#E8DED2] overflow-hidden"
    >
      {/* Subtle architectural background accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-copper/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
        
        {/* Top Header Row */}
        <div className="max-w-3xl mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-copper shrink-0" aria-hidden="true" />
            <span className="text-[10.5px] sm:text-xs tracking-[0.4em] uppercase font-medium text-copper">
              Featured Township Showcase • Wellburg Reality
            </span>
          </div>

          <Link
            to="/ridhi-bhoomi"
            data-testid="riddhi-bhoomi-headline-link"
            className="group block"
            title="Explore Ridhi Bhoomi Township"
          >
            <h2 className="text-3xl sm:text-5xl lg:text-6xl text-[#1C1C1C] group-hover:text-copper transition-colors duration-300 leading-[1.08] tracking-[-0.015em] font-normal mb-6 font-serif-display">
              Ridhi Bhoomi — Plots & Land
              <br />
              <span className="text-[#5F5F5F] group-hover:text-copper/85 italic font-serif transition-colors duration-300">
                adjacent to New Town, Kolkata.
              </span>
            </h2>
          </Link>

          <p className="text-[#5F5F5F] font-light text-base sm:text-lg leading-[1.75] max-w-2xl">
            Astittva proudly presents Ridhi Bhoomi: a premier 150-Bigha master-planned township 
            crafted for high-value residential homes and commercial retail enterprises in Eastern India’s 
            fastest growing urban growth corridor.
          </p>
        </div>

        {/* Two-Column Editorial Feature Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Visual Site Image with Editorial Overlays (CLICKABLE SMOOTH LINK) */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 relative group"
          >
            <Link
              to="/ridhi-bhoomi"
              data-testid="riddhi-bhoomi-visual-card"
              className="block relative overflow-hidden rounded-xs border border-[#E8DED2] bg-[#F5F1EC] shadow-[0_4px_30px_-10px_rgba(28,28,28,0.08)] cursor-pointer hover:border-copper transition-all duration-500"
              title="Click to visit Ridhi Bhoomi interactive website"
            >
              <img
                src="/images/riddhi-bhumi-site.png"
                alt="Riddhi Bhoomi Land Site Photograph"
                className="w-full aspect-[16/10] object-cover transition-transform duration-[1.8s] ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/80 via-transparent to-black/20 pointer-events-none" />

              {/* Top Floating Badges */}
              <div className="absolute top-5 left-5 inline-flex items-center gap-2 bg-[#FAF8F5]/95 backdrop-blur-md px-4 py-2 border border-[#E8DED2] shadow-sm">
                <span className="w-2 h-2 rounded-full bg-copper animate-pulse" />
                <span className="text-[10px] tracking-[0.25em] uppercase font-semibold text-[#1C1C1C]">
                  Ground Progress • Actual Site Land
                </span>
              </div>

              <div className="absolute top-5 right-5 inline-flex items-center gap-1.5 bg-[#1C1C1C]/90 group-hover:bg-copper text-white backdrop-blur-md px-3.5 py-1.5 border border-white/20 text-[9.5px] tracking-[0.2em] uppercase font-medium transition-colors duration-300 shadow-sm">
                <span>Explore Project</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* Bottom Image Caption */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
                <div>
                  <div className="text-[11px] tracking-[0.2em] uppercase text-white/70 font-light mb-1">
                    Patharghata, Near Shapoorji • New Town
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif tracking-tight font-medium text-white group-hover:text-[#E8DED2] transition-colors">
                    Riddhi Bhoomi Township →
                  </h3>
                </div>

                <div className="bg-white/10 backdrop-blur-md px-4 py-2 border border-white/20 text-[11px] tracking-[0.18em] uppercase font-medium self-start sm:self-auto">
                  150 Bighas Target Area
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Right Column: Key Pillars & Actions */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 flex flex-col justify-between space-y-8"
          >
            {/* Highlights List - Clickable cards navigating smoothly */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-5">
              {highlights.map((h, i) => (
                <Link
                  key={i}
                  to={`/ridhi-bhoomi?tab=${h.tab}`}
                  data-testid={`riddhi-bhoomi-highlight-${i}`}
                  className="group flex items-start gap-4 p-4 rounded-xs bg-white border border-[#E8DED2]/80 transition-all duration-300 hover:border-copper hover:shadow-md cursor-pointer"
                  title={`View ${h.title} on Ridhi Bhoomi`}
                >
                  <div className="w-10 h-10 rounded-xs bg-[#FAF8F5] border border-[#E8DED2] group-hover:bg-copper group-hover:border-copper group-hover:text-white flex items-center justify-center shrink-0 text-copper transition-colors duration-300">
                    <h.icon className="w-5 h-5" strokeWidth={1.4} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[14px] font-semibold text-[#1C1C1C] group-hover:text-copper transition-colors duration-300 tracking-wide mb-1">
                        {h.title}
                      </h4>
                      <ArrowRight className="w-3 h-3 text-[#B87333]/40 group-hover:text-copper group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <p className="text-xs text-[#5F5F5F] font-light leading-relaxed">
                      {h.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to="/ridhi-bhoomi"
                data-testid="explore-riddhi-bhumi-btn"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 text-[11px] tracking-[0.22em] uppercase font-medium text-white bg-[#1C1C1C] hover:bg-copper transition-all duration-300 border border-[#1C1C1C] hover:border-copper shadow-sm hover:shadow-md"
              >
                <span>Go to Ridhi Bhoomi</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <a
                href="#consultation"
                data-testid="riddhi-bhumi-inquire-btn"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 text-[11px] tracking-[0.2em] uppercase font-medium text-[#1C1C1C] bg-white hover:bg-[#F5F1EC] border border-[#E8DED2] hover:border-[#1C1C1C] transition-all duration-300"
              >
                <span>Book Advisory Visit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Confidentiality / Advisory Notice */}
            <div className="flex items-center gap-2 text-[10.5px] tracking-[0.15em] uppercase text-[#888888] font-light pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-copper shrink-0" />
              <span>Direct Developer Partner Allocation • Zero Brokerage Advisory</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
