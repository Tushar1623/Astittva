import { useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { SiteVisitForm } from '../components/LeadForm';

export default function SiteVisit() {
  const [params] = useSearchParams();
  const plot = params.get('plot');

  return (
    <>
      <SEO title="Book a Site Visit" description="Book a site visit to Ridhi Bhoomi. See the project and available plots in person." path="/site-visit" />
      <div className="section-padding pb-24">
        <div className="container-main">
          <h1 className="font-display text-4xl font-bold text-center">Book a Site Visit</h1>
          <p className="mt-2 text-center text-brand-muted">See Ridhi Bhoomi for yourself</p>
          <div className="mt-10">
            <SiteVisitForm plotNumber={plot} />
          </div>
        </div>
      </div>
    </>
  );
}
