import React, { useState, useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import Seo from "@/components/Seo";
import { buildBreadcrumbSchema } from "@/lib/seoConfig";
import { ArrowLeft, ArrowRight, Share2, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { CALCULATORS, getCalculatorBySlug } from "@/data/calculatorsData";
import CalculatorIcon from "@/components/calculators/CalculatorIcon";

// Format helper for Indian Rupee amounts
function formatIndianCurrency(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) return "₹0";
  const num = Math.round(Number(amount));
  if (num >= 10000000) {
    const cr = num / 10000000;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    const l = num / 100000;
    return `₹${l % 1 === 0 ? l.toFixed(0) : l.toFixed(2)} Lakh`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
}

export default function CalculatorDetailPage() {
  const { slug } = useParams();
  const calculator = useMemo(() => getCalculatorBySlug(slug), [slug]);

  // If calculator not found, redirect to main calculators index
  if (!calculator) {
    return <Navigate to="/calculators" replace />;
  }

  return <CalculatorInner key={calculator.id} calculator={calculator} />;
}

function CalculatorInner({ calculator }) {
  const [inputs, setInputs] = useState(calculator.defaultValues || {});

  // Real-time calculation
  const results = useMemo(() => {
    try {
      return calculator.calculate(inputs);
    } catch {
      return {};
    }
  }, [calculator, inputs]);

  const handleInputChange = (key, value) => {
    setInputs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  // Other calculators in the same category
  const relatedCalculators = useMemo(() => {
    return CALCULATORS.filter(
      (c) => c.category === calculator.category && c.id !== calculator.id
    ).slice(0, 3);
  }, [calculator]);

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Calculators", path: "/calculators" },
    { name: calculator.name, path: `/calculators/${calculator.slug}` },
  ];

  const calcSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: calculator.name,
    description: calculator.description,
    url: `https://astittva.in/calculators/${calculator.slug}`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    provider: {
      "@type": "RealEstateAgent",
      "@id": "https://astittva.in/#organization",
      name: "Astittva Marketing",
    },
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1C1C] pt-24 sm:pt-28 pb-20">
      <Seo
        title={`${calculator.name} | Astittva Marketing`}
        description={`${calculator.description} Calculate online for free with real-time financial math for Kolkata properties.`}
        path={`/calculators/${calculator.slug}`}
        keywords={`${calculator.name}, Kolkata real estate calculator, ${calculator.categoryLabel}, property financial tools`}
        schema={[calcSchema, buildBreadcrumbSchema(breadcrumbItems)]}
      />

      {/* Top Header & Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-[12px] text-[#5F5F5F] mb-6">
          <Link to="/" className="hover:text-[#520C16] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/calculators" className="hover:text-[#520C16] transition-colors">
            Calculators
          </Link>
          <span>/</span>
          <span className="text-[#1C1C1C] font-medium">{calculator.shortName}</span>
        </div>

        {/* Header Content */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8DED2]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[10px] bg-[#520C16] text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
              <CalculatorIcon name={calculator.iconName} className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#520C16]/[0.08] text-[#520C16]">
                  {calculator.categoryLabel}
                </span>
                <span className="text-[11px] font-medium text-[#5F5F5F]">
                  Target: {calculator.targetAudience}
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C1C1C]">
                {calculator.name}
              </h1>
              <p className="mt-2 text-[13px] sm:text-[14px] text-[#5F5F5F] max-w-2xl leading-relaxed">
                {calculator.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] text-[12px] font-semibold text-[#5F5F5F] bg-white border border-[#E8DED2] hover:text-[#520C16] hover:border-[#520C16]/30 transition-colors shadow-xs"
              title="Share this calculator"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <Link
              to="/calculators"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] text-[12px] font-semibold text-[#520C16] bg-[#520C16]/[0.06] hover:bg-[#520C16]/[0.12] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Calculators</span>
            </Link>
          </div>
        </div>

        {/* Main Two-Column Layout: Inputs (Left) & Results (Right) */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Inputs Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-[10px] border border-[#E8DED2] p-6 sm:p-8 shadow-xs">
              <h2 className="text-[14px] font-bold tracking-wider uppercase text-[#520C16] mb-6 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B87333]" />
                <span>Input Parameters</span>
              </h2>

              <div className="space-y-6">
                {calculator.fields.map((field) => {
                  const val = inputs[field.key] !== undefined ? inputs[field.key] : "";

                  return (
                    <div key={field.key} className="space-y-2.5 pb-5 border-b border-[#F5F1EC] last:border-0 last:pb-0">
                      <div className="flex items-center justify-between gap-4">
                        <label className="text-[13px] sm:text-[14px] font-semibold text-[#1C1C1C]">
                          {field.label}
                        </label>
                        {field.type === "currency" && (
                          <span className="text-[13px] font-bold text-[#520C16]">
                            {formatIndianCurrency(val)}
                          </span>
                        )}
                        {field.type === "percent" && (
                          <span className="text-[13px] font-bold text-[#520C16]">
                            {val}%
                          </span>
                        )}
                        {field.type === "number" && field.key === "tenureYears" && (
                          <span className="text-[13px] font-bold text-[#520C16]">
                            {val} Years
                          </span>
                        )}
                      </div>

                      {/* Select Field */}
                      {field.type === "select" && (
                        <select
                          value={val}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-[6px] border border-[#E8DED2] bg-[#FAF8F5] text-[13px] font-medium text-[#1C1C1C] focus:outline-none focus:border-[#520C16] transition-colors"
                        >
                          {field.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Number / Currency / Percent Input with Range Slider */}
                      {field.type !== "select" && (
                        <div className="space-y-3">
                          <div className="relative">
                            <input
                              type="number"
                              min={field.min}
                              max={field.max}
                              step={field.step}
                              value={val}
                              onChange={(e) =>
                                handleInputChange(field.key, parseFloat(e.target.value) || 0)
                              }
                              className="w-full px-3.5 py-2.5 rounded-[6px] border border-[#E8DED2] bg-[#FAF8F5] text-[14px] font-semibold text-[#1C1C1C] focus:outline-none focus:border-[#520C16] transition-colors"
                            />
                            {field.type === "percent" && (
                              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[#5F5F5F]">
                                %
                              </span>
                            )}
                          </div>

                          {/* Range Slider for quick tactile adjustment */}
                          {field.min !== undefined && field.max !== undefined && (
                            <div className="flex items-center gap-3 pt-1">
                              <input
                                type="range"
                                min={field.min}
                                max={field.max}
                                step={field.step}
                                value={val}
                                onChange={(e) =>
                                  handleInputChange(field.key, parseFloat(e.target.value) || 0)
                                }
                                className="w-full accent-[#520C16] cursor-pointer"
                              />
                            </div>
                          )}

                          {/* Quick Preset Buttons */}
                          {field.quickPresets && (
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <span className="text-[11px] text-[#5F5F5F] font-medium">Quick:</span>
                              {field.quickPresets.map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => handleInputChange(field.key, preset)}
                                  className={`px-2.5 py-1 rounded-[4px] text-[11px] font-semibold transition-colors ${
                                    val === preset
                                      ? "bg-[#520C16] text-white"
                                      : "bg-[#F5F1EC] text-[#5F5F5F] hover:bg-[#E8DED2]"
                                  }`}
                                >
                                  {field.type === "currency"
                                    ? formatIndianCurrency(preset)
                                    : `${preset}${field.type === "percent" ? "%" : ""}`}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Results Display (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <div className="bg-white rounded-[10px] border border-[#E8DED2] p-6 sm:p-7 shadow-sm">
              <h2 className="text-[13px] font-bold tracking-wider uppercase text-[#B87333] mb-4">
                Calculated Estimate
              </h2>

              {/* Dynamic Result Views Based on Calculator ID */}
              {renderCalculatorResults(calculator.id, results, inputs)}

              {/* Bottom Advisory CTA */}
              <div className="mt-6 pt-5 border-t border-[#E8DED2]">
                <div className="p-4 rounded-[8px] bg-[#FAF8F5] border border-[#E8DED2]">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#B87333] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[13px] font-bold text-[#1C1C1C]">
                        Verify with an Astittva Property Advisor
                      </h4>
                      <p className="mt-1 text-[12px] text-[#5F5F5F] leading-relaxed">
                        Bank eligibility, stamp duty rates, and exact returns depend on micro-market registration rules and your financial profile.
                      </p>
                      <Link
                        to="/contact"
                        className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#520C16] hover:text-[#B87333] transition-colors"
                      >
                        <span>Book 1-on-1 Advisory Session</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Calculators in the same category */}
        {relatedCalculators.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[#E8DED2]">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1C1C] mb-6">
              More Calculators for {calculator.categoryLabel}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedCalculators.map((rc) => (
                <Link
                  key={rc.id}
                  to={rc.path}
                  className="p-5 rounded-[8px] bg-white border border-[#E8DED2] hover:border-[#520C16]/40 hover:shadow-xs transition-all group"
                >
                  <div className="w-9 h-9 rounded-[6px] bg-[#520C16]/[0.08] text-[#520C16] flex items-center justify-center mb-3 group-hover:bg-[#520C16] group-hover:text-white transition-colors">
                    <CalculatorIcon name={rc.iconName} className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif text-[16px] font-bold text-[#1C1C1C] group-hover:text-[#520C16] transition-colors">
                    {rc.name}
                  </h4>
                  <p className="mt-1 text-[12px] text-[#5F5F5F] line-clamp-2">
                    {rc.shortDescription}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-[12px] font-semibold text-[#B87333] group-hover:text-[#520C16]">
                    <span>Calculate</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Specific KPI Renderers for Each Calculator
// ----------------------------------------------------------------------
function renderCalculatorResults(id, results, inputs) {
  if (!results) return null;

  switch (id) {
    case "home-loan-emi":
      return (
        <div className="space-y-5">
          <div className="p-4 rounded-[8px] bg-[#520C16]/[0.06] border border-[#520C16]/15">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5F5F5F]">
              Monthly Home Loan EMI
            </span>
            <div className="font-serif text-3xl font-extrabold text-[#520C16] mt-1">
              {formatIndianCurrency(results.monthlyEmi)}
              <span className="text-[13px] font-sans font-normal text-[#5F5F5F]"> / month</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2]">
              <span className="text-[11px] text-[#5F5F5F]">Principal Amount</span>
              <div className="text-[15px] font-bold text-[#1C1C1C] mt-0.5">
                {formatIndianCurrency(results.principalAmount)}
              </div>
            </div>
            <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2]">
              <span className="text-[11px] text-[#5F5F5F]">Total Interest</span>
              <div className="text-[15px] font-bold text-[#B87333] mt-0.5">
                {formatIndianCurrency(results.totalInterest)}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex items-center justify-between">
            <span className="text-[12px] text-[#5F5F5F]">Total Repayment (Principal + Interest)</span>
            <span className="text-[15px] font-bold text-[#1C1C1C]">
              {formatIndianCurrency(results.totalPayment)}
            </span>
          </div>

          {/* Visual Breakdown Bar */}
          <div>
            <div className="flex justify-between text-[11px] font-medium text-[#5F5F5F] mb-1.5">
              <span>Principal: {100 - (results.interestRatio || 0)}%</span>
              <span>Interest: {results.interestRatio || 0}%</span>
            </div>
            <div className="h-2.5 w-full bg-[#E8DED2] rounded-full overflow-hidden flex">
              <div
                className="bg-[#520C16] h-full"
                style={{ width: `${100 - (results.interestRatio || 0)}%` }}
              />
              <div
                className="bg-[#B87333] h-full"
                style={{ width: `${results.interestRatio || 0}%` }}
              />
            </div>
          </div>
        </div>
      );

    case "property-affordability":
      return (
        <div className="space-y-5">
          <div className="p-4 rounded-[8px] bg-[#520C16]/[0.06] border border-[#520C16]/15">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5F5F5F]">
              Maximum Property Budget
            </span>
            <div className="font-serif text-3xl font-extrabold text-[#520C16] mt-1">
              {formatIndianCurrency(results.totalBudget)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2]">
              <span className="text-[11px] text-[#5F5F5F]">Max Home Loan Capacity</span>
              <div className="text-[15px] font-bold text-[#1C1C1C] mt-0.5">
                {formatIndianCurrency(results.maxLoanCapacity)}
              </div>
            </div>
            <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2]">
              <span className="text-[11px] text-[#5F5F5F]">Down Payment Cash</span>
              <div className="text-[15px] font-bold text-[#B87333] mt-0.5">
                {formatIndianCurrency(results.downPaymentSavings)}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex items-center justify-between">
            <span className="text-[12px] text-[#5F5F5F]">Max Allowable Monthly EMI (50% FOIR)</span>
            <span className="text-[15px] font-bold text-[#1C1C1C]">
              {formatIndianCurrency(results.maxMonthlyEmi)}/mo
            </span>
          </div>
        </div>
      );

    case "rent-vs-buy":
      return (
        <div className="space-y-5">
          <div
            className={`p-4 rounded-[8px] border ${
              results.isBuyingBetter
                ? "bg-[#520C16]/[0.06] border-[#520C16]/20"
                : "bg-[#B87333]/[0.08] border-[#B87333]/20"
            }`}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5F5F5F]">
              Financial Verdict ({inputs.timeHorizon} Years)
            </span>
            <div className="font-serif text-2xl font-extrabold text-[#520C16] mt-1">
              {results.verdict}
            </div>
            <div className="text-[12px] text-[#5F5F5F] mt-1">
              Net Wealth Difference: <strong className="text-[#1C1C1C]">{formatIndianCurrency(results.netDifference)}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2]">
              <span className="text-[11px] text-[#5F5F5F]">Total Rent Paid Out</span>
              <div className="text-[15px] font-bold text-[#1C1C1C] mt-0.5">
                {formatIndianCurrency(results.totalRentPaid)}
              </div>
            </div>
            <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2]">
              <span className="text-[11px] text-[#5F5F5F]">Future Property Value</span>
              <div className="text-[15px] font-bold text-[#B87333] mt-0.5">
                {formatIndianCurrency(results.futurePropertyValue)}
              </div>
            </div>
          </div>
        </div>
      );

    case "down-payment":
      return (
        <div className="space-y-5">
          <div className="p-4 rounded-[8px] bg-[#520C16]/[0.06] border border-[#520C16]/15">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5F5F5F]">
              Total Upfront Cash Required
            </span>
            <div className="font-serif text-3xl font-extrabold text-[#520C16] mt-1">
              {formatIndianCurrency(results.totalUpfront)}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex justify-between items-center text-[13px]">
              <span className="text-[#5F5F5F]">Down Payment to Builder/Seller ({inputs.downPaymentPercent}%)</span>
              <strong className="text-[#1C1C1C]">{formatIndianCurrency(results.downPaymentAmount)}</strong>
            </div>
            <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex justify-between items-center text-[13px]">
              <span className="text-[#5F5F5F]">Stamp Duty &amp; Govt Registration ({inputs.stampDutyPercent}%)</span>
              <strong className="text-[#B87333]">{formatIndianCurrency(results.stampDuty)}</strong>
            </div>
            <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex justify-between items-center text-[13px]">
              <span className="text-[#5F5F5F]">Furnishing &amp; Incidental Buffer</span>
              <strong className="text-[#1C1C1C]">{formatIndianCurrency(results.bufferAmount)}</strong>
            </div>
            <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex justify-between items-center text-[13px]">
              <span className="text-[#5F5F5F]">Remaining Home Loan Amount</span>
              <strong className="text-[#520C16]">{formatIndianCurrency(results.loanAmount)}</strong>
            </div>
          </div>
        </div>
      );

    case "registration-cost":
      return (
        <div className="space-y-5">
          <div className="p-4 rounded-[8px] bg-[#520C16]/[0.06] border border-[#520C16]/15">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5F5F5F]">
              Total Registration &amp; Stamp Duty
            </span>
            <div className="font-serif text-3xl font-extrabold text-[#520C16] mt-1">
              {formatIndianCurrency(results.totalCost)}
            </div>
            <div className="text-[12px] text-[#5F5F5F] mt-1">
              Effective Cost: <strong className="text-[#1C1C1C]">{results.effectiveRate}%</strong> of property value
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex justify-between items-center text-[13px]">
              <span className="text-[#5F5F5F]">Stamp Duty ({inputs.locationType === "urban" ? "6% Urban" : "5% Rural"})</span>
              <strong className="text-[#1C1C1C]">{formatIndianCurrency(results.stampDuty)}</strong>
            </div>
            <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex justify-between items-center text-[13px]">
              <span className="text-[#5F5F5F]">Registration Fee (1% SRO)</span>
              <strong className="text-[#B87333]">{formatIndianCurrency(results.registrationFee)}</strong>
            </div>
            <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex justify-between items-center text-[13px]">
              <span className="text-[#5F5F5F]">Legal &amp; Mutation Charges</span>
              <strong className="text-[#1C1C1C]">{formatIndianCurrency(results.legalCharges)}</strong>
            </div>
          </div>
        </div>
      );

    case "property-roi":
      return (
        <div className="space-y-5">
          <div className="p-4 rounded-[8px] bg-[#520C16]/[0.06] border border-[#520C16]/15">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5F5F5F]">
              Total Return on Investment (ROI)
            </span>
            <div className="font-serif text-3xl font-extrabold text-[#520C16] mt-1">
              {results.totalRoiPct}%
              <span className="text-[13px] font-sans font-medium text-[#B87333] ml-2">
                ({results.cagr}% Annual CAGR)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2]">
              <span className="text-[11px] text-[#5F5F5F]">Total Net Profit</span>
              <div className="text-[15px] font-bold text-[#1C1C1C] mt-0.5">
                {formatIndianCurrency(results.netProfit)}
              </div>
            </div>
            <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2]">
              <span className="text-[11px] text-[#5F5F5F]">Capital Gains</span>
              <div className="text-[15px] font-bold text-[#B87333] mt-0.5">
                {formatIndianCurrency(results.capitalGains)}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex justify-between items-center text-[13px]">
            <span className="text-[#5F5F5F]">Rental Income Collected ({inputs.holdingYears} Yrs)</span>
            <strong className="text-[#1C1C1C]">{formatIndianCurrency(results.totalRentCollected)}</strong>
          </div>
        </div>
      );

    case "rental-yield":
      return (
        <div className="space-y-5">
          <div className="p-4 rounded-[8px] bg-[#520C16]/[0.06] border border-[#520C16]/15">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5F5F5F]">
              Net Rental Yield
            </span>
            <div className="font-serif text-3xl font-extrabold text-[#520C16] mt-1">
              {results.netYield}%
              <span className="text-[13px] font-sans font-medium text-[#5F5F5F] ml-2">
                (Gross: {results.grossYield}%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2]">
              <span className="text-[11px] text-[#5F5F5F]">Net Annual Rental Income</span>
              <div className="text-[15px] font-bold text-[#1C1C1C] mt-0.5">
                {formatIndianCurrency(results.netAnnualIncome)}
              </div>
            </div>
            <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2]">
              <span className="text-[11px] text-[#5F5F5F]">Monthly Cash Flow</span>
              <div className="text-[15px] font-bold text-[#B87333] mt-0.5">
                {formatIndianCurrency(results.monthlyNetCashflow)}
              </div>
            </div>
          </div>
        </div>
      );

    case "property-appreciation":
      return (
        <div className="space-y-5">
          <div className="p-4 rounded-[8px] bg-[#520C16]/[0.06] border border-[#520C16]/15">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5F5F5F]">
              Estimated Future Value ({inputs.years} Years)
            </span>
            <div className="font-serif text-3xl font-extrabold text-[#520C16] mt-1">
              {formatIndianCurrency(results.futureValue)}
            </div>
            <div className="text-[12px] text-[#5F5F5F] mt-1">
              Wealth Multiplier: <strong className="text-[#B87333]">{results.multiplier}</strong>
            </div>
          </div>

          <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex justify-between items-center text-[13px]">
            <span className="text-[#5F5F5F]">Total Value Growth</span>
            <strong className="text-[#520C16]">{formatIndianCurrency(results.totalGrowth)}</strong>
          </div>

          {results.milestones && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F5F5F]">Milestone Projections</span>
              {results.milestones.map((m) => (
                <div key={m.year} className="flex justify-between items-center text-[12px] py-1 border-b border-[#F5F1EC]">
                  <span className="text-[#5F5F5F]">Year {m.year}</span>
                  <span className="font-semibold text-[#1C1C1C]">{formatIndianCurrency(m.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case "area-conversion":
      return (
        <div className="space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F5F5F]">
            Converted Values Across Units
          </span>
          <div className="space-y-2">
            <div className="p-2.5 rounded-[6px] bg-[#520C16]/[0.06] border border-[#520C16]/15 flex justify-between items-center text-[13px]">
              <span className="text-[#520C16] font-semibold">Square Feet (Sq. Ft.)</span>
              <strong className="text-[#520C16] font-mono text-[14px]">{results.sqft}</strong>
            </div>
            <div className="p-2.5 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex justify-between items-center text-[13px]">
              <span className="text-[#5F5F5F]">Square Meters (Sq. M.)</span>
              <strong className="text-[#1C1C1C] font-mono">{results.sqm}</strong>
            </div>
            <div className="p-2.5 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex justify-between items-center text-[13px]">
              <span className="text-[#5F5F5F]">Square Yards / Gaj</span>
              <strong className="text-[#1C1C1C] font-mono">{results.sqyd}</strong>
            </div>
            <div className="p-2.5 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex justify-between items-center text-[13px]">
              <span className="text-[#5F5F5F]">Kottah / Katha (Bengal: 720 sqft)</span>
              <strong className="text-[#B87333] font-mono">{results.kottah}</strong>
            </div>
            <div className="p-2.5 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex justify-between items-center text-[13px]">
              <span className="text-[#5F5F5F]">Bigha (Bengal: 20 Kottah)</span>
              <strong className="text-[#1C1C1C] font-mono">{results.bigha}</strong>
            </div>
            <div className="p-2.5 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex justify-between items-center text-[13px]">
              <span className="text-[#5F5F5F]">Acres</span>
              <strong className="text-[#1C1C1C] font-mono">{results.acre}</strong>
            </div>
            <div className="p-2.5 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex justify-between items-center text-[13px]">
              <span className="text-[#5F5F5F]">Hectares</span>
              <strong className="text-[#1C1C1C] font-mono">{results.hectare}</strong>
            </div>
          </div>
        </div>
      );

    case "price-per-sqft":
      return (
        <div className="space-y-5">
          <div className="p-4 rounded-[8px] bg-[#520C16]/[0.06] border border-[#520C16]/15">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5F5F5F]">
              Super Built-up Rate
            </span>
            <div className="font-serif text-3xl font-extrabold text-[#520C16] mt-1">
              ₹{results.ratePerSbu?.toLocaleString("en-IN")}
              <span className="text-[13px] font-sans font-normal text-[#5F5F5F]"> / sq. ft.</span>
            </div>
          </div>

          <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex justify-between items-center text-[13px]">
            <span className="text-[#5F5F5F]">Carpet Area True Rate</span>
            <strong className="text-[#B87333]">₹{results.ratePerCarpet?.toLocaleString("en-IN")} / sq. ft.</strong>
          </div>

          <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex justify-between items-center text-[13px]">
            <span className="text-[#5F5F5F]">Developer Loading Factor</span>
            <strong className="text-[#1C1C1C]">{results.loadingFactor}%</strong>
          </div>
        </div>
      );

    case "construction-cost":
      return (
        <div className="space-y-5">
          <div className="p-4 rounded-[8px] bg-[#520C16]/[0.06] border border-[#520C16]/15">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5F5F5F]">
              Total Construction Budget
            </span>
            <div className="font-serif text-3xl font-extrabold text-[#520C16] mt-1">
              {formatIndianCurrency(results.totalCost)}
            </div>
            <div className="text-[12px] text-[#5F5F5F] mt-1">
              Slab Area: <strong>{results.totalSlabArea?.toLocaleString("en-IN")} sq. ft.</strong> @ ₹{results.ratePerSqft}/sqft
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex justify-between items-center text-[13px]">
              <span className="text-[#5F5F5F]">Structure &amp; Civil Works (55%)</span>
              <strong className="text-[#1C1C1C]">{formatIndianCurrency(results.civilCost)}</strong>
            </div>
            <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex justify-between items-center text-[13px]">
              <span className="text-[#5F5F5F]">Finishing, Flooring &amp; Paint (30%)</span>
              <strong className="text-[#B87333]">{formatIndianCurrency(results.finishingCost)}</strong>
            </div>
            <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex justify-between items-center text-[13px]">
              <span className="text-[#5F5F5F]">Electrical, Plumbing &amp; Sanitary (15%)</span>
              <strong className="text-[#1C1C1C]">{formatIndianCurrency(results.mepCost)}</strong>
            </div>
          </div>
        </div>
      );

    case "brokerage":
      return (
        <div className="space-y-5">
          <div className="p-4 rounded-[8px] bg-[#520C16]/[0.06] border border-[#520C16]/15">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5F5F5F]">
              Total Brokerage Payable (with GST)
            </span>
            <div className="font-serif text-3xl font-extrabold text-[#520C16] mt-1">
              {formatIndianCurrency(results.totalPayable)}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex justify-between items-center text-[13px]">
              <span className="text-[#5F5F5F]">Base Professional Fee</span>
              <strong className="text-[#1C1C1C]">{formatIndianCurrency(results.baseCommission)}</strong>
            </div>
            <div className="p-3 rounded-[6px] bg-[#FAF8F5] border border-[#E8DED2] flex justify-between items-center text-[13px]">
              <span className="text-[#5F5F5F]">Statutory 18% GST</span>
              <strong className="text-[#B87333]">{formatIndianCurrency(results.gstAmount)}</strong>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
