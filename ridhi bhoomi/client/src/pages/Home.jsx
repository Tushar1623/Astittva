import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';
import NewWebsiteSection from '../components/NewWebsiteSection';
import MasterPlanViewer from '../components/MasterPlanViewer';
import LocationSection from '../components/LocationSection';
import MapSection from '../components/MapSection';
import PriceCalculator from '../components/PriceCalculator';
import { SiteVisitForm } from '../components/LeadForm';
import { propertyTypes, amenities } from '../data/project';

import img1 from '../assets/site-images/img 1.png';
import img2 from '../assets/site-images/img 2.png';
import img3 from '../assets/site-images/img 3.png';
import img4 from '../assets/site-images/img 4.png';
import img5 from '../assets/site-images/img 5.png';

export default function Home() {

  return (
    <>
      <SEO />

      {/* 01 — HERO (DEEP FOREST #0F1F17 WITH ROYAL GOLD & LEAF GREEN ACCENTS) */}
      <section className="relative min-h-[88vh] flex flex-col justify-between overflow-hidden bg-[#0F1F17] text-white">
        {/* Land/Nature Background Image with Dark Emerald Overlay */}
        <div className="absolute inset-0 z-0 opacity-45">
          <img
            src={img1}
            alt="Riddhi Bhumi Actual Site Land"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0F1F17] via-[#0F1F17]/70 to-[#0F1F17]/30" />

        {/* Hero Content */}
        <div className="container-main relative z-10 my-auto pt-20 pb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#C88E00]/40 bg-[#C88E00]/10 text-xs font-bold uppercase tracking-widest text-[#C88E00] shadow-sm">
              <Leaf size={14} className="text-[#388E3C]" />
              <span>Wellburg Reality Pvt. Ltd.</span>
            </div>

            <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-none">
              <span className="text-[#C88E00]">RIDHI</span> BHOOMI
            </h1>

            <div className="w-48 h-0.5 mx-auto bg-gradient-to-r from-transparent via-[#C88E00] to-transparent my-3" />

            <p className="font-serif text-xl sm:text-2xl italic text-[#388E3C] font-semibold tracking-wider uppercase">
              WHERE PROSPERITY MEETS LAND
            </p>

            <p className="text-base sm:text-xl text-stone-200 font-light max-w-xl mx-auto tracking-wide">
              Premium Residential & Commercial Plots near New Town Kolkata
            </p>

            <div className="pt-6 flex flex-wrap justify-center gap-4">
              <Link to="/master-plan" className="btn-gold px-8 py-4 text-xs uppercase tracking-widest">
                Explore Master Plan
              </Link>
              <Link to="/site-visit" className="btn-secondary text-[#0F1F17] border-white/80 bg-white hover:bg-[#FAF8F3] px-8 py-4 text-xs uppercase tracking-widest">
                Book Site Visit
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="relative z-10 pb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#C88E00]/80">
          ↓ Scroll Down
        </div>
      </section>

      {/* 02 — PROJECT SNAPSHOT */}
      <section className="bg-[#0F1F17] text-white border-y border-[#24382B] py-6">
        <div className="container-main">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="font-serif text-2xl sm:text-3xl font-extrabold text-[#C88E00]">150 BIGHAS*</div>
              <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-stone-300">Targeted Area</div>
            </div>

            <div className="space-y-1">
              <div className="font-serif text-2xl sm:text-3xl font-extrabold text-[#388E3C]">50%+*</div>
              <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-stone-300">Open Area & Greenery</div>
            </div>

            <div className="space-y-1">
              <div className="font-serif text-2xl sm:text-3xl font-extrabold text-white">RESIDENTIAL</div>
              <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-stone-300">Plotting Zone</div>
            </div>

            <div className="space-y-1">
              <div className="font-serif text-2xl sm:text-3xl font-extrabold text-white">COMMERCIAL</div>
              <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-stone-300">Plots (CP01–CP38)</div>
            </div>
          </div>
          <p className="text-[10px] text-stone-400 text-center mt-3">
            *150 Bighas represents the targeted project area as indicated in the conceptual master plan (CMP).
          </p>
        </div>
      </section>

      {/* 02.5 — EXPLORE NEW ASTITTVA BANNER */}
      <NewWebsiteSection secondaryHref="#project-story" />

      {/* 03 — PROJECT STORY + PROPERTY TYPES */}
      <section id="project-story" className="section-normal bg-[#FAF8F3]">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Image */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-200 group">
                <img
                  src={img4}
                  alt="Actual Site Land & New Town Skyline View"
                  loading="lazy"
                  decoding="async"
                  className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-3 left-3 bg-[#0F1F17]/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#C88E00]/30 text-[11px] font-bold text-[#C88E00]">
                  ✦ Live Site Photograph • Ground Progress
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-6 space-y-5">
              <span className="badge-gold">Vision & Master Plan</span>
              <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#0F1F17] leading-tight">
                A Place Designed Around Possibilities
              </h2>
              <p className="text-xs sm:text-sm text-[#6E736B] leading-relaxed">
                Ridhi Bhoomi brings together residential plots, commercial spaces, duplex zones, farmhouse areas and planned community elements within a larger development vision.
              </p>

              {/* Property Tiles */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {propertyTypes.map((p) => (
                  <Link
                    key={p.id}
                    to={p.link}
                    className="p-3.5 rounded-2xl bg-white border border-stone-200/90 hover:border-[#C88E00] transition-all group shadow-sm hover:shadow-md"
                  >
                    <h3 className="font-serif font-bold text-sm text-[#0F1F17] group-hover:text-[#C88E00]">{p.title}</h3>
                    <span className="text-[11px] font-bold text-[#388E3C] flex items-center gap-1 pt-1">
                      Explore →
                    </span>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 03.5 — REAL ON-SITE LAND PHOTOGRAPHS SHOWCASE */}
      <section className="section-normal bg-white border-t border-stone-200/80">
        <div className="container-main space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="badge-leaf">Authentic Field Photographs</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0F1F17]">
                On-Site Development Progress
              </h2>
              <p className="text-xs sm:text-sm text-[#6E736B]">
                Actual ground images showcasing land elevation, access road clearing, and proximity to New Town.
              </p>
            </div>
            <Link to="/gallery" className="btn-secondary self-start md:self-auto text-xs py-2.5 px-5">
              View Full Gallery →
            </Link>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { src: img1, title: "Access Road Corridor", tag: "Ground Clearing", desc: "Access road demarcation and leveling for 30ft main road." },
              { src: img2, title: "Open Land Horizon", tag: "Land Elevation", desc: "High, flood-free land parcel near New Town expansion zone." },
              { src: img3, title: "Leveling & Preparation", tag: "Site Progress", desc: "Ongoing ground preparation and plot division alignment." },
              { src: img4, title: "Skyline & Surroundings", tag: "New Town Proximity", desc: "View showing surrounding high-rises and open environment." },
              { src: img5, title: "Boundary & Green Space", tag: "150 Bigha Layout", desc: "Future green zone and boundary demarcation posts." },
            ].slice(0, 3).map((item, idx) => (
              <Link key={idx} to="/gallery" className="group rounded-2xl overflow-hidden bg-[#FAF8F3] border border-stone-200 hover:border-[#C88E00] shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-[#0F1F17]/80 text-[#C88E00] text-[10px] font-bold uppercase tracking-widest border border-[#C88E00]/30 shadow-sm">
                      {item.tag}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="font-serif font-bold text-sm text-[#0F1F17] group-hover:text-[#C88E00] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#6E736B] line-clamp-2">
                    {item.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 04 — OFFICIAL MAPS, MASTER PLAN & LOCATION HUB */}
      <section className="section-normal bg-[#FAF8F3] border-t border-stone-200/80">
        <div className="container-main space-y-12">
          {/* Master Plan & Plot Blueprint Viewer */}
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="badge-leaf">Official Master Plan & Maps Hub</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0F1F17]">Master Plan, Block & Location Maps</h2>
              <p className="text-xs text-[#6E736B]">Interactive 150-Bigha CMP diagram, official Block A plot blueprint, and project location map</p>
            </div>

            <MasterPlanViewer />
          </div>

          {/* Location & Connectivity Details */}
          <div className="pt-6 border-t border-stone-200/80">
            <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
              <span className="badge-forest">Strategic Connectivity</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0F1F17]">Connected to What Matters</h2>
              <p className="text-xs text-[#6E736B]">Adjacent to New Town with direct 6-lane, Basanti Highway & 91B Bus Road connectivity</p>
            </div>

            <LocationSection />
          </div>

          {/* 04.B — Live Google Maps & Site Navigation */}
          <div className="pt-8 border-t border-stone-200/80">
            <MapSection />
          </div>
        </div>
      </section>

      {/* 05 — PRICE + PAYMENT */}
      <section className="section-normal bg-[#0F1F17] text-white">
        <div className="container-main space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C88E00]">Transparent Schedule</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold">Price & Installment Estimator</h2>
          </div>

          <PriceCalculator />
        </div>
      </section>

      {/* 08 — LIVING + INFRASTRUCTURE */}
      <section className="section-normal bg-white border-y border-stone-200">
        <div className="container-main space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="badge-gold">Lifestyle & Infrastructure</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0F1F17]">Designed for Everyday Living</h2>
            <p className="text-xs text-[#6E736B]">Basic infrastructure provided in scheme & proposed community features</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Group 1: Infrastructure */}
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#0F1F17] border-b border-stone-200 pb-2">
                Project Infrastructure
              </h3>
              <div className="space-y-2.5">
                {[
                  { name: "30ft / 28ft / 20ft Wide Metal Roads", desc: "Wide access roads serving individual blocks" },
                  { name: "Underground Drainage System", desc: "Dedicated drainage network across project" },
                  { name: "Electric Facilities & Street Lights", desc: "Power supply network & street lighting" },
                  { name: "Gated Main Entry Gate", desc: "Connected directly to 91B Bus Road" },
                  { name: "Cafeteria Space", desc: "Planned refreshment space" },
                  { name: "Commercial Frontage Restaurant", desc: "Front road retail & dining zone" }
                ].map((item, i) => (
                  <div key={i} className="info-row">
                    <div>
                      <span className="font-bold text-xs text-[#0F1F17]">{item.name}</span>
                      <p className="text-[11px] text-[#6E736B]">{item.desc}</p>
                    </div>
                    <CheckCircle2 size={16} className="text-[#388E3C] shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Group 2: Proposed Features */}
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#0F1F17] border-b border-stone-200 pb-2 flex items-center justify-between">
                <span>Proposed Community Features</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C88E00]">Proposed</span>
              </h3>
              <div className="space-y-2.5">
                {amenities.map((a, i) => (
                  <div key={i} className="info-row">
                    <span className="font-bold text-xs text-[#0F1F17]">{a.name}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#C88E00] px-2 py-0.5 rounded bg-[#C88E00]/10 border border-[#C88E00]/20">Proposed</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 09 — SITE VISIT */}
      <section className="section-normal bg-[#FAF8F3]">
        <div className="container-main">
          <div className="grid gap-10 lg:grid-cols-12 items-center">
            
            {/* Left Story */}
            <div className="lg:col-span-5 space-y-4">
              <span className="badge-leaf">Visit the Site</span>
              <h2 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#0F1F17] leading-tight">
                See Ridhi Bhoomi for Yourself
              </h2>
              <p className="text-xs sm:text-sm text-[#6E736B] leading-relaxed">
                Walk the land. Understand the surrounding road network and New Town connectivity. Our dedicated sales representatives will guide you across Block A plots.
              </p>
              <div className="pt-2 text-xs font-bold text-[#0F1F17] space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#388E3C]" /> Free Site Visit Pick-up & Guidance
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#388E3C]" /> Direct Plot Inspection
                </div>
              </div>
            </div>

            {/* Right Form */}
            <div className="lg:col-span-7">
              <SiteVisitForm />
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
