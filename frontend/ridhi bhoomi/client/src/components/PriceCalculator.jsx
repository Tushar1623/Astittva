import { useState } from 'react';
import {
  residentialPricing,
  calculateResidentialPrice,
  calculateDownPayment,
  calculateEMI,
  formatCurrency,
} from '../data/project';
import { Calculator, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PriceCalculator() {
  const [category, setCategory] = useState('20ft_normal');
  const [katha, setKatha] = useState(1.5);
  const [downPercent, setDownPercent] = useState(30);
  const [tenure, setTenure] = useState(36);

  const totalPrice = calculateResidentialPrice(category, katha) || 0;
  const downPayment = calculateDownPayment(totalPrice, downPercent);
  const remaining = totalPrice - downPayment;
  const emi = calculateEMI(remaining, tenure);

  return (
    <div className="card-dark max-w-5xl mx-auto overflow-hidden border border-[#C88E00]/30 shadow-2xl">
      <div className="grid gap-8 lg:grid-cols-12 items-center">
        
        {/* Left Side: Controls */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center gap-2 text-[#C88E00]">
            <Calculator size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Rate Schedule & EMI Estimator</span>
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
            Find the Right Plot. Understand the Price.
          </h3>

          <div className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                Road Width & Facing
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-[#0A150F] px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#C88E00]"
              >
                {residentialPricing.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {formatCurrency(c.ratePerKatha)}/Katha
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                Plot Size (Katha)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {residentialPricing.plotSizes.map((s) => (
                  <button
                    key={s.katha}
                    type="button"
                    onClick={() => setKatha(s.katha)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                      katha === s.katha
                        ? 'bg-[#C88E00] text-white shadow-md'
                        : 'bg-[#0A150F] border border-stone-700 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    {s.katha} Katha
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                Down Payment Option
              </label>
              <div className="flex flex-wrap gap-2">
                {residentialPricing.downPaymentOptions.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setDownPercent(p)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      downPercent === p
                        ? 'bg-[#388E3C] text-white border border-[#388E3C]'
                        : 'bg-[#0A150F] border border-stone-700 text-stone-400 hover:text-white'
                    }`}
                  >
                    {p}% {p === 30 ? '(Min)' : ''}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                Tenure Options
              </label>
              <div className="flex gap-2">
                {residentialPricing.tenureOptions.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTenure(t)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      tenure === t
                        ? 'bg-[#C88E00] text-white'
                        : 'bg-[#0A150F] border border-stone-700 text-stone-400 hover:text-white'
                    }`}
                  >
                    {t} Months
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Live Summary */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0A150F] border border-stone-800 space-y-4 shadow-inner">
          <div className="text-xs font-bold uppercase tracking-widest text-[#C88E00] border-b border-stone-800 pb-2">
            Your Payment Estimate
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-stone-400">Estimated Plot Value</span>
              <span className="font-serif text-2xl font-extrabold text-[#C88E00]">
                {formatCurrency(totalPrice)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs text-stone-300">
              <span>{downPercent}% Down Payment</span>
              <span className="font-bold text-white">{formatCurrency(downPayment)}</span>
            </div>

            <div className="flex justify-between items-center text-xs text-stone-400">
              <span>Balance Financed</span>
              <span>{formatCurrency(remaining)}</span>
            </div>

            <div className="pt-3 border-t border-stone-800 flex justify-between items-baseline">
              <span className="text-xs font-bold text-stone-200">{tenure}-Month EMI</span>
              <span className="font-serif text-xl font-extrabold text-[#388E3C]">
                {formatCurrency(emi)}<span className="text-xs font-normal text-stone-400">/mo*</span>
              </span>
            </div>
          </div>

          <p className="text-[10px] text-stone-500 leading-relaxed pt-1">
            *Illustrative calculation per price chart effective {residentialPricing.effectiveDate}. Minimum locking payment ₹10,000. Final terms per booking agreement.
          </p>

          <Link
            to={`/contact?category=${encodeURIComponent(category)}&katha=${katha}`}
            className="btn-gold w-full text-center py-3 text-xs uppercase tracking-widest mt-2"
          >
            Enquire About This Plot <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}

export { PriceCalculator as EMICalculator };
export { PriceCalculator };
