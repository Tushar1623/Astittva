import SEO from '../components/SEO';
import LocationSection from '../components/LocationSection';
import MapSection from '../components/MapSection';
import MasterPlanViewer from '../components/MasterPlanViewer';
import { project } from '../data/project';
import { Building, Phone, Mail } from 'lucide-react';

export default function LocationPage() {
  return (
    <>
      <SEO title="Location, Access & Master Plan" description="Ridhi Bhoomi location near New Town Kolkata, Biswa Bangla Gate, Sector V, Airport and interactive plot & location maps." path="/location" />
      <div className="section-padding py-12 pb-24 bg-[#FAF8F3]">
        <div className="container-main space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="badge-forest">Strategic Connectivity & Maps</span>
            <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-[#0F1F17]">Location, Access & Maps</h1>
            <p className="text-xs sm:text-sm text-[#6E736B]">Adjacent to New Town Kolkata with 6-lane, Basanti Highway & 91B Bus Road connectivity</p>
          </div>

          {/* Location & Road Connectivity */}
          <div className="mt-6">
            <LocationSection />
          </div>

          {/* Interactive Google Map Section */}
          <div className="pt-8 border-t border-stone-200/80">
            <MapSection />
          </div>

          {/* Interactive Maps Hub (Location, Master Plan, Block A) */}
          <div className="pt-8 border-t border-stone-200/80 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="badge-leaf">All Project Blueprints & Layouts</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0F1F17]">Master Plan, Plot & Location Maps</h2>
            </div>
            <MasterPlanViewer defaultTab="location_map" />
          </div>

          {/* Developer Corporate Office */}
          <div className="mt-12 p-6 rounded-3xl bg-white border border-stone-200 shadow-md max-w-3xl mx-auto space-y-4">
            <div className="flex items-center gap-2 text-[#C88E00] border-b border-stone-200 pb-3">
              <Building size={20} />
              <h2 className="font-serif text-xl font-bold text-[#0F1F17]">Developer Corporate Office</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#6E736B] leading-relaxed">
              <strong>{project.developer}</strong><br />
              {project.officeAddress}
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs font-bold text-[#0F1F17]">
              <a href={`tel:+91${project.phone}`} className="flex items-center gap-1.5 hover:text-[#C88E00]">
                <Phone size={14} className="text-[#388E3C]" /> +91 9230374700
              </a>
              <a href={`mailto:${project.email}`} className="flex items-center gap-1.5 hover:text-[#C88E00]">
                <Mail size={14} className="text-[#C88E00]" /> {project.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

