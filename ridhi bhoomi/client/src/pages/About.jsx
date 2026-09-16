import SEO from '../components/SEO';
import { project, projectZones, infrastructure, developerInfo } from '../data/project';
import { CheckCircle2, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <>
      <SEO
        title="About Ridhi Bhoomi"
        description="Learn about Ridhi Bhoomi — a premium plotted development by Wellburg Reality Pvt. Ltd. near New Town, Kolkata."
        path="/about"
      />
      <div className="section-padding py-12 pb-24 bg-[#FAF8F3]">
        <div className="container-main max-w-4xl space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="badge-gold">Developer Vision & Story</span>
            <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-[#0F1F17]">
              About {project.name}
            </h1>
            <p className="font-serif text-sm sm:text-base italic text-[#388E3C] font-semibold tracking-wider uppercase">
              {project.tagline}
            </p>
          </div>

          {/* Narrative Card */}
          <div className="card p-6 sm:p-8 bg-white border border-stone-200 shadow-md rounded-3xl space-y-4">
            <p className="text-xs sm:text-sm text-[#6E736B] leading-relaxed">
              <strong className="text-[#0F1F17]">{project.name}</strong> represents a unique harmony of modern township living enveloped in lush green nature. Spanning an expansive targeted layout of 150 Bighas, the master development provides designated zones for residential plots, commercial frontage, duplex spaces, farmhouses, and reserved green corridors. Over 50% of the area is committed to open nature, wide internal roads, and environmental serenity.
            </p>
            <p className="text-xs sm:text-sm text-[#6E736B] leading-relaxed">
              Situated right beside the boundaries of <strong className="text-[#0F1F17]">New Town Action Area III</strong>, residents enjoy immediate proximity to major 6-lane artery corridors, Basanti Highway, and direct transit to Sector V IT parks and the airport, combining the conveniences of planned urban infrastructure with peaceful ownership.
            </p>
          </div>

          {/* Project Zones */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h2 className="font-serif text-2xl font-bold text-[#0F1F17]">Master Plan Zones</h2>
              <span className="text-xs text-[#6E736B]">Planned Sector Distribution</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {projectZones.map((z) => (
                <div key={z.id} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm">
                  <span className="h-3.5 w-3.5 rounded-full shrink-0 shadow-sm" style={{ background: z.color }} />
                  <span className="text-xs font-bold text-[#0F1F17]">{z.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Basic Infrastructure */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h2 className="font-serif text-2xl font-bold text-[#0F1F17]">Site Infrastructure</h2>
              <span className="text-xs text-[#388E3C] font-semibold">Included in Scheme</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {infrastructure.map((i) => (
                <div key={i} className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white border border-stone-200 shadow-sm">
                  <CheckCircle2 size={16} className="text-[#388E3C] shrink-0" />
                  <span className="text-xs font-semibold text-[#0F1F17]">{i}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Developer Section */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0F1F17] text-white border border-[#24382B] space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-[#C88E00] border-b border-stone-800 pb-3">
              <Building2 size={20} />
              <h2 className="font-serif text-xl font-bold text-white">About the Developer: {project.developer}</h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {developerInfo.overview}
            </p>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {developerInfo.philosophy}
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link to="/contact" className="btn-gold text-xs py-2.5 px-6">
                Get in Touch
              </Link>
              <Link to="/master-plan" className="btn-secondary text-xs py-2.5 px-6">
                View Master Plan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
