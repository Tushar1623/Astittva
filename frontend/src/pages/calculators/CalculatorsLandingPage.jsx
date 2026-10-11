import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { CALCULATORS, CALCULATOR_CATEGORIES } from "@/data/calculatorsData";
import CalculatorIcon from "@/components/calculators/CalculatorIcon";

export default function CalculatorsLandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1C1C] pt-24 sm:pt-28 pb-20">
      <Helmet>
        <title>Property Calculators — Astittva Real Estate Advisory</title>
        <meta
          name="description"
          content="Make smarter property decisions with simple, practical calculators for home buyers, real estate investors, and developers in Kolkata."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6 sm:pt-10 pb-12 sm:pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#520C16]/[0.06] border border-[#520C16]/15 text-[#520C16] text-[11px] font-semibold tracking-wider uppercase mb-5">
          <Sparkles className="w-3.5 h-3.5 text-[#B87333]" />
          <span>Financial Planning &amp; Advisory Tools</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#1C1C1C] max-w-3xl mx-auto leading-tight">
          Property Calculators
        </h1>

        <p className="mt-4 sm:mt-5 text-base sm:text-lg md:text-xl text-[#5F5F5F] max-w-2xl mx-auto font-sans leading-relaxed">
          Make smarter property decisions with simple, practical calculators.
        </p>

        {/* Quick stat highlights */}
        <div className="mt-8 sm:mt-10 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto">
          <div className="p-3.5 sm:p-4 rounded-[8px] bg-white border border-[#E8DED2] shadow-xs">
            <div className="font-serif text-xl sm:text-2xl font-bold text-[#520C16]">12</div>
            <div className="text-[11px] sm:text-[12px] text-[#5F5F5F] font-medium mt-0.5">Specialized Tools</div>
          </div>
          <div className="p-3.5 sm:p-4 rounded-[8px] bg-white border border-[#E8DED2] shadow-xs">
            <div className="font-serif text-xl sm:text-2xl font-bold text-[#B87333]">100% Free</div>
            <div className="text-[11px] sm:text-[12px] text-[#5F5F5F] font-medium mt-0.5">Instant Real-Time Math</div>
          </div>
          <div className="col-span-2 sm:col-span-1 p-3.5 sm:p-4 rounded-[8px] bg-white border border-[#E8DED2] shadow-xs">
            <div className="font-serif text-xl sm:text-2xl font-bold text-[#1C1C1C]">India &amp; WB</div>
            <div className="text-[11px] sm:text-[12px] text-[#5F5F5F] font-medium mt-0.5">Stamp Duty &amp; Local Rules</div>
          </div>
        </div>
      </section>

      {/* Calculator Categories & Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
        {CALCULATOR_CATEGORIES.map((category) => {
          const categoryCalculators = CALCULATORS.filter((c) => c.category === category.id);

          return (
            <section key={category.id} className="relative scroll-mt-28" id={category.id}>
              {/* Category Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-[#E8DED2]">
                <div>
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#B87333]">
                    Category
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1C1C] mt-1">
                    {category.name}
                  </h2>
                  <p className="text-[13px] sm:text-[14px] text-[#5F5F5F] mt-1">
                    {category.tagline}
                  </p>
                </div>
                <div className="text-[12px] font-semibold text-[#520C16] bg-[#520C16]/[0.06] px-3 py-1 rounded-full self-start sm:self-auto">
                  {categoryCalculators.length} Calculators
                </div>
              </div>

              {/* Grid of Cards */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {categoryCalculators.map((calc) => (
                  <Link
                    key={calc.id}
                    to={calc.path}
                    className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-[10px] bg-white border border-[#E8DED2] transition-all duration-300 hover:border-[#520C16]/40 hover:shadow-[0_12px_32px_rgba(82,12,22,0.08)] hover:-translate-y-1"
                  >
                    <div>
                      {/* Top Row: Icon + Target Audience */}
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="w-11 h-11 rounded-[8px] bg-[#520C16]/[0.08] text-[#520C16] flex items-center justify-center transition-colors duration-300 group-hover:bg-[#520C16] group-hover:text-white">
                          <CalculatorIcon name={calc.iconName} className="w-5 h-5" />
                        </div>
                        <span className="inline-block text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-[#FAF8F5] text-[#5F5F5F] border border-[#E8DED2]">
                          {calc.targetAudience}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-serif text-[18px] sm:text-[19px] font-bold text-[#1C1C1C] group-hover:text-[#520C16] transition-colors duration-200 leading-snug">
                        {calc.name}
                      </h3>

                      {/* Description */}
                      <p className="mt-2.5 text-[13px] text-[#5F5F5F] leading-relaxed">
                        {calc.shortDescription}
                      </p>
                    </div>

                    {/* Bottom CTA */}
                    <div className="mt-6 pt-4 border-t border-[#F5F1EC] flex items-center justify-between text-[#B87333] group-hover:text-[#520C16] font-semibold text-[13px] transition-colors duration-200">
                      <span>Calculate</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Advisory Banner at Bottom */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div
          className="relative rounded-[12px] p-8 sm:p-12 overflow-hidden text-white"
          style={{
            background: "linear-gradient(135deg, #470811 0%, #59101C 100%)",
            boxShadow: "0 16px 48px rgba(71, 8, 17, 0.25)",
          }}
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E8DCD5] text-[11px] font-semibold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4A359]" />
              <span>Bespoke Real Estate Advisory</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
              Need personalized advice on your property numbers?
            </h3>
            <p className="mt-3 text-[14px] sm:text-[15px] text-[#E8DCD5] leading-relaxed">
              Our real estate wealth advisors analyze Kolkata micro-market capital yields, tax structuring, and verified developer inventories for your unique goals.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-[6px] text-[13px] font-semibold uppercase tracking-wider text-white transition-all duration-200 hover:brightness-110"
                style={{
                  background: "linear-gradient(135deg, #BD7732 0%, #DA9B48 100%)",
                  boxShadow: "0 4px 16px rgba(189, 119, 50, 0.35)",
                }}
              >
                <span>Book Free Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/properties"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-[6px] text-[13px] font-semibold uppercase tracking-wider text-white border border-white/20 hover:bg-white/10 transition-colors"
              >
                <span>Browse Verified Properties</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
