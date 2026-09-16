import SEO from '../components/SEO';
import FAQAccordion from '../components/FAQAccordion';
import { faqs } from '../data/project';

export default function FAQPage() {
  return (
    <>
      <SEO title="FAQ" description="Frequently asked questions about Ridhi Bhoomi plots, pricing, payment and booking." path="/faq" />
      <div className="section-padding pb-24">
        <div className="container-main">
          <h1 className="font-display text-4xl font-bold text-center">Frequently Asked Questions</h1>
          <p className="mt-2 text-center text-brand-muted">Answers based on official project documents</p>
          <div className="mt-10">
            <FAQAccordion items={faqs} />
          </div>
        </div>
      </div>
    </>
  );
}
