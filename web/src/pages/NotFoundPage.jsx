import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Home, Building2, Calculator, BookOpen, PhoneCall } from "lucide-react";
import Seo from "@/components/Seo";

export default function NotFoundPage() {
  return (
    <div
      data-testid="not-found-page"
      className="min-h-screen bg-[#FAF8F5] text-[#1C1C1C] pt-28 sm:pt-36 pb-20 flex flex-col justify-center"
    >
      <Seo
        title="Page Not Found | Astittva Marketing"
        description="The page you are looking for does not exist or has been moved. Explore luxury properties, financial calculators, and Kolkata real estate insights."
        noIndex={true}
        path="/404"
      />

      <div className="max-w-3xl mx-auto px-6 text-center">
        {/* Subtle Brand Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#520C16]/[0.06] border border-[#520C16]/15 text-[#520C16] text-[11px] font-semibold tracking-wider uppercase mb-6">
          <span>Error 404</span>
        </div>

        {/* Heading */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1C1C1C] leading-tight mb-4">
          Page Not Found
        </h1>

        <p className="text-[#5F5F5F] font-sans text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-10">
          The property, analysis, or page you are looking for has either been relocated or is no longer available in our active registry.
        </p>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10 text-left">
          <Link
            to="/properties"
            className="p-4 rounded-[8px] bg-white border border-[#E8DED2] hover:border-[#520C16]/30 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3 mb-1 text-[#520C16]">
              <Building2 className="w-4 h-4 text-[#B87333]" />
              <span className="font-serif text-sm font-bold group-hover:text-[#520C16]">Properties</span>
            </div>
            <p className="text-[12px] text-[#5F5F5F]">Curated primary residences in Kolkata &amp; New Town</p>
          </Link>

          <Link
            to="/resale"
            className="p-4 rounded-[8px] bg-white border border-[#E8DED2] hover:border-[#520C16]/30 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3 mb-1 text-[#520C16]">
              <Home className="w-4 h-4 text-[#B87333]" />
              <span className="font-serif text-sm font-bold group-hover:text-[#520C16]">Resale Homes</span>
            </div>
            <p className="text-[12px] text-[#5F5F5F]">Verified secondary market flats and villas</p>
          </Link>

          <Link
            to="/calculators"
            className="p-4 rounded-[8px] bg-white border border-[#E8DED2] hover:border-[#520C16]/30 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3 mb-1 text-[#520C16]">
              <Calculator className="w-4 h-4 text-[#B87333]" />
              <span className="font-serif text-sm font-bold group-hover:text-[#520C16]">Calculators</span>
            </div>
            <p className="text-[12px] text-[#5F5F5F]">Home loan EMI, Stamp duty, &amp; ROI tools</p>
          </Link>

          <Link
            to="/blogs"
            className="p-4 rounded-[8px] bg-white border border-[#E8DED2] hover:border-[#520C16]/30 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3 mb-1 text-[#520C16]">
              <BookOpen className="w-4 h-4 text-[#B87333]" />
              <span className="font-serif text-sm font-bold group-hover:text-[#520C16]">Editorial &amp; Insights</span>
            </div>
            <p className="text-[12px] text-[#5F5F5F]">Market trends, RERA guidance, &amp; investment tips</p>
          </Link>

          <Link
            to="/contact"
            className="p-4 rounded-[8px] bg-white border border-[#E8DED2] hover:border-[#520C16]/30 hover:shadow-sm transition-all group col-span-1 sm:col-span-2 md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-1 text-[#520C16]">
              <PhoneCall className="w-4 h-4 text-[#B87333]" />
              <span className="font-serif text-sm font-bold group-hover:text-[#520C16]">Private Advisory Desk</span>
            </div>
            <p className="text-[12px] text-[#5F5F5F]">Connect directly with our Kolkata luxury property advisors</p>
          </Link>
        </div>

        {/* Return Home Action */}
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-[4px] bg-[#520C16] text-white text-[11px] font-semibold tracking-widest uppercase hover:bg-[#3D0910] transition-colors shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
}
