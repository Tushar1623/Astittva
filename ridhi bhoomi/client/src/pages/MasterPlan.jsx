import SEO from '../components/SEO';
import MasterPlanViewer from '../components/MasterPlanViewer';
import LocationSection from '../components/LocationSection';

export default function MasterPlanPage() {
  return (
    <>
      <SEO
        title="Official Master Plan, Block Map & Location"
        description="Explore the official 150-Bigha Conceptual Master Plan (CMP), Block A Plot Blueprint Map, and Location map for Ridhi Bhoomi."
        path="/master-plan"
      />
      <div className="section-padding py-12 pb-24 bg-[#FAF8F3]">
        <div className="container-main space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="badge-forest">Official Project Layout & Maps</span>
            <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-[#0F1F17]">
              Master Plan, Block & Location
            </h1>
            <p className="text-xs sm:text-sm text-[#6E736B]">
              150-Bigha Conceptual Master Plan (CMP), Block A Plot Blueprint & Strategic Location Access
            </p>
          </div>

          <div className="mt-8">
            <MasterPlanViewer />
          </div>

          <div className="pt-8 border-t border-stone-200/80">
            <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
              <span className="badge-leaf">Location & Connectivity</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0F1F17]">Strategic Project Location</h2>
            </div>
            <LocationSection />
          </div>
        </div>
      </div>
    </>
  );
}

