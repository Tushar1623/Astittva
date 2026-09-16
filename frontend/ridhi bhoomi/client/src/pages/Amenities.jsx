import SEO from '../components/SEO';
import { amenities } from '../data/project';

export default function Amenities() {
  return (
    <>
      <SEO title="Proposed Amenities" description="Proposed amenities at Ridhi Bhoomi — park, club house, gym, swimming pool and more." path="/amenities" />
      <div className="section-padding pb-24">
        <div className="container-main">
          <h1 className="font-display text-4xl font-bold">Proposed Amenities</h1>
          <p className="mt-2 text-brand-muted">As per project brochure — not represented as already completed</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {amenities.map((a) => (
              <div key={a.name} className="card text-center">
                <h3 className="font-display text-lg font-semibold">{a.name}</h3>
                <span className="mt-2 inline-block rounded-full bg-brand-gold/20 px-3 py-1 text-xs text-brand-gold">Proposed</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
