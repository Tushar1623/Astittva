import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, ShieldCheck, MapPin, Calendar, Compass } from "lucide-react";
import Seo from "@/components/Seo";

/**
 * RidhiBhoomiPage
 *
 * Silky-smooth, directly integrated presentation page for Riddhi Bhoomi Township.
 * Eliminates jarring page reloads with seamless client-side routing,
 * native iframe sandboxing, and luxury Astittva transition controls.
 */
export default function RidhiBhoomiPage() {
  const [loaded, setLoaded] = useState(false);
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab");

  const iframeSrc = tab ? `/ridhi-bhoomi/#${tab}` : "/ridhi-bhoomi/";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col pt-16 sm:pt-20 md:pt-24">
      <Seo
        title="Ridhi Bhoomi Township — Residential & Commercial Plots Near New Town"
        description="Explore Ridhi Bhoomi: 150-Bigha luxury plotting township by Wellburg Reality adjacent to New Town, Kolkata. Verified master plan, pricing, and site visit booking."
      />

      {/* Top Contextual Navigation Strip */}
      <div className="bg-[#F5F1EC] border-b border-[#E8DED2] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 z-20 shrink-0">
        
        {/* Left: Back to Astittva Link */}
        <Link
          to="/"
          data-testid="back-to-astittva-btn"
          className="group inline-flex items-center gap-2 text-[11px] sm:text-xs tracking-[0.2em] uppercase font-medium text-[#1C1C1C] hover:text-copper transition-colors py-1 shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
          <span>Back to Astittva</span>
        </Link>

        {/* Center: Brand Indicator */}
        <div className="hidden md:flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-copper animate-pulse" />
          <span className="text-[11px] tracking-[0.22em] uppercase font-semibold text-[#1C1C1C]">
            Ridhi Bhoomi Township
          </span>
          <span className="text-copper/40 text-xs">•</span>
          <span className="text-[10.5px] tracking-[0.16em] uppercase text-[#5F5F5F] font-light">
            Wellburg Reality Partner Showcase
          </span>
        </div>

        {/* Right: Quick Action & Standalone Link */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <a
            href="/#consultation"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] tracking-[0.18em] uppercase font-medium text-white bg-[#B87333] hover:bg-[#C58A52] transition-colors shadow-sm"
          >
            <Calendar className="w-3 h-3" />
            <span>Book Visit</span>
          </a>

          <a
            href="/ridhi-bhoomi/"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="open-standalone-btn"
            title="Open in standalone tab"
            className="inline-flex items-center gap-1.5 text-[10px] sm:text-[10.5px] tracking-[0.18em] uppercase font-medium text-[#5F5F5F] hover:text-[#1C1C1C] transition-colors py-1"
          >
            <span className="hidden xs:inline">Standalone</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Integrated Viewport Container */}
      <div className="relative flex-1 w-full bg-[#FAF8F5] overflow-hidden flex flex-col">
        
        {/* Loading Skeleton Indicator (Fades out once loaded) */}
        {!loaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#FAF8F5] transition-opacity duration-500">
            <div className="flex flex-col items-center gap-4">
              <div className="w-9 h-9 border-2 border-[#E8DED2] border-t-copper rounded-full animate-spin" />
              <div className="text-[11px] tracking-[0.3em] uppercase text-[#5F5F5F] font-medium">
                Loading Ridhi Bhoomi Experience…
              </div>
            </div>
          </div>
        )}

        {/* Seamless Embedded Frame */}
        <iframe
          id="riddhi-bhoomi-interactive-frame"
          data-testid="riddhi-bhoomi-frame"
          src={iframeSrc}
          title="Riddhi Bhoomi Township Interactive Platform"
          className={`w-full flex-1 border-0 transition-opacity duration-700 ease-out ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          style={{
            minHeight: "calc(100vh - 120px)",
            height: "calc(100vh - 120px)",
          }}
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}
