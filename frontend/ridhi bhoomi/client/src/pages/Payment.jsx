import SEO from '../components/SEO';
import PriceCalculator from '../components/PriceCalculator';
import { paymentSteps, residentialPricing, formatCurrency } from '../data/project';

export default function PaymentPlan() {
  return (
    <>
      <SEO title="Payment Plan & Pricing" description="Ridhi Bhoomi payment plan — locking amount, down payment, EMI and price calculator." path="/payment-plan" />
      <div className="section-padding pb-24">
        <div className="container-main">
          <h1 className="font-display text-4xl font-bold">Payment Plan</h1>
          <p className="mt-2 text-brand-muted">Effective from {residentialPricing.effectiveDate}</p>

          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {paymentSteps.map((s) => (
              <div key={s.step} className="card text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-green text-white font-bold">{s.step}</div>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-2 text-xs text-brand-muted">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 card">
            <h2 className="font-display text-2xl font-bold mb-6">Residential Rates (per Katha)</h2>
            <p className="text-sm text-brand-muted mb-4">1 Katha = {residentialPricing.kathaSqft} sq.ft</p>
            <div className="space-y-3">
              {residentialPricing.categories.map((c) => (
                <div key={c.id} className="flex justify-between border-b border-black/5 py-3 text-sm">
                  <span>{c.name}</span>
                  <span className="font-bold">{formatCurrency(c.ratePerKatha)}/Katha</span>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3 text-sm">
              <div><span className="text-brand-muted">Locking Amount:</span> {formatCurrency(residentialPricing.lockingAmount)}/plot</div>
              <div><span className="text-brand-muted">Locking Period:</span> Max {residentialPricing.lockingPeriodDays} working days</div>
              <div><span className="text-brand-muted">Processing Fee:</span> {formatCurrency(residentialPricing.processingFee)}</div>
            </div>
            <p className="mt-4 text-xs text-brand-muted">Company may change and alter the price chart without prior information.</p>
          </div>

          <div className="mt-12">
            <PriceCalculator />
          </div>

          <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
            Please refer to the applicable booking agreement and official project documentation for final terms and conditions.
          </div>
        </div>
      </div>
    </>
  );
}
