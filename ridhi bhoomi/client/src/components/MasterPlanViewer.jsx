import { useState } from 'react';
import { Compass, Download, Eye, MapPin, X, Table, Layers, Navigation } from 'lucide-react';
import cmpImg from '../assets/cmp.jpg';
import plotMapImg from '../assets/plot_map.jpg';
import locationMapImg from '../assets/location_map.jpg';

export default function MasterPlanViewer() {
  const [activeModalImg, setActiveModalImg] = useState(null); // null | 'cmp' | 'plot_map' | 'location_map'

  const landAnalysis = [
    { zone: 'Residential Plots', area: '12 Bighas 18 Chattak' },
    { zone: 'Duplex Zone', area: '19 Bighas' },
    { zone: 'Duplex Premium', area: '26 Bighas' },
    { zone: 'Duplex Customise', area: '40 Bighas' },
    { zone: 'Farmhouses Zone', area: '13 Bighas' },
    { zone: 'Commercial Market', area: '3 Bighas 28 Chattak' },
  ];

  const officialDistances = [
    { destination: 'AIR PORT', distance: '17.20 KM' },
    { destination: 'NEW TOWN', distance: 'BESIDE' },
    { destination: 'BISWA BANGLA GATE', distance: '8.0 KM' },
    { destination: 'SECTOR V', distance: '13.0 KM' },
    { destination: 'SCIENCE CITY', distance: '17.0 KM' },
    { destination: 'RUBI', distance: '13.0 KM' },
    { destination: 'SEALDAH STATION', distance: '20.0 KM' },
  ];

  const mapsData = [
    {
      id: 'cmp',
      badge: '150-Bigha Master Plan',
      title: '150-Bigha Conceptual Master Plan (CMP)',
      subtitle: 'Complete 150-bigha targeted land layout & sector distribution',
      icon: Compass,
      accentColor: '#C88E00',
      badgeBg: 'bg-[#C88E00]/10 text-[#C88E00] border-[#C88E00]/30',
      imgSrc: cmpImg,
      downloadUrl: '/cmp.jpg',
      downloadFilename: 'Riddhi_Bhumi_150_Bigha_CMP_Master_Plan.jpg',
      sideType: 'land_analysis',
    },
    {
      id: 'plot_map',
      badge: 'Block A Blueprint',
      title: 'Official Block A Residential Plot Layout Map',
      subtitle: 'Individual plot layouts, 30ft/28ft/20ft roads & commercial frontage',
      icon: Layers,
      accentColor: '#388E3C',
      badgeBg: 'bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/30',
      imgSrc: plotMapImg,
      downloadUrl: '/plot_map.jpg',
      downloadFilename: 'Riddhi_Bhumi_Block_A_Plot_Map.jpg',
      sideType: 'block_specs',
    },
    {
      id: 'location_map',
      badge: 'Location & Connectivity',
      title: 'Official Project Location & Access Route Map',
      subtitle: 'Proximity to New Town, 6-lane artery road, 91B bus route & Sector V',
      icon: Navigation,
      accentColor: '#C88E00',
      badgeBg: 'bg-[#C88E00]/10 text-[#C88E00] border-[#C88E00]/30',
      imgSrc: locationMapImg,
      downloadUrl: '/location_map.jpg',
      downloadFilename: 'Riddhi_Bhumi_Official_Location_Map.jpg',
      sideType: 'distances',
    },
  ];

  const getModalTitle = (id) => {
    if (id === 'cmp') return '150-Bigha Conceptual Master Plan (CMP)';
    if (id === 'plot_map') return 'Official Block A Residential Plot Map Blueprint';
    if (id === 'location_map') return 'Official Project Location & Route Map';
    return 'Project Map';
  };

  const getModalSrc = (id) => {
    if (id === 'cmp') return cmpImg;
    if (id === 'plot_map') return plotMapImg;
    if (id === 'location_map') return locationMapImg;
    return null;
  };

  const getModalDownload = (id) => {
    if (id === 'cmp') return { url: '/cmp.jpg', name: 'Riddhi_Bhumi_150_Bigha_CMP_Master_Plan.jpg' };
    if (id === 'plot_map') return { url: '/plot_map.jpg', name: 'Riddhi_Bhumi_Block_A_Plot_Map.jpg' };
    if (id === 'location_map') return { url: '/location_map.jpg', name: 'Riddhi_Bhumi_Official_Location_Map.jpg' };
    return { url: '', name: '' };
  };

  return (
    <div className="space-y-12">
      {/* Quick Navigation Anchor Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#0A150F] border border-stone-800 text-white">
        <span className="text-xs font-bold uppercase tracking-widest text-[#C88E00] flex items-center gap-1.5 px-2">
          <MapPin size={15} /> All Project Maps & Blueprints
        </span>
        <div className="flex flex-wrap gap-2">
          {mapsData.map((m) => {
            const Icon = m.icon;
            return (
              <a
                key={m.id}
                href={`#map-${m.id}`}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs font-semibold text-stone-200 hover:text-white hover:border-[#C88E00] transition-colors"
              >
                <Icon size={14} style={{ color: m.accentColor }} />
                <span>{m.badge}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Render Each Map Separately */}
      {mapsData.map((m, index) => {
        const Icon = m.icon;

        return (
          <div
            key={m.id}
            id={`map-${m.id}`}
            className="rounded-3xl overflow-hidden bg-[#0F1F17] border border-[#C88E00]/30 p-4 sm:p-6 text-white shadow-2xl space-y-6 scroll-mt-24"
          >
            {/* Header Bar for this specific map */}
            <div className="flex flex-wrap items-center justify-between border-b border-stone-800 pb-4 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${m.badgeBg}`}>
                    0{index + 1} — {m.badge}
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2 pt-1">
                  <Icon size={22} style={{ color: m.accentColor }} />
                  {m.title}
                </h3>
                <p className="text-xs text-stone-400 font-light">{m.subtitle}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <a
                  href={m.downloadUrl}
                  download={m.downloadFilename}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 text-stone-200 hover:text-white hover:bg-stone-700 text-xs font-semibold transition-colors shadow-sm"
                >
                  <Download size={14} className="text-[#C88E00]" /> Download JPG
                </a>

                <button
                  type="button"
                  onClick={() => setActiveModalImg(m.id)}
                  className="btn-gold py-2 px-3.5 text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Eye size={14} /> Fullscreen Zoom
                </button>
              </div>
            </div>

            {/* Map Frame & Side Panel */}
            <div className="grid gap-6 lg:grid-cols-12 items-center">
              {/* Map Display Image Frame */}
              <div
                className="lg:col-span-8 relative rounded-2xl overflow-hidden bg-white border border-stone-800 cursor-pointer group shadow-2xl p-2 flex justify-center items-center"
                onClick={() => setActiveModalImg(m.id)}
              >
                <div className="w-full overflow-auto max-h-[550px] flex items-center justify-center p-1">
                  <img
                    src={m.imgSrc}
                    alt={m.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto max-h-[520px] object-contain rounded-xl transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                  <span className="btn-gold text-xs py-2.5 px-5 shadow-xl font-bold">Click for Fullscreen High-Res Zoom</span>
                </div>
              </div>

              {/* Side Panel for this specific map */}
              <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0A150F] border border-stone-800 space-y-4 shadow-inner">
                {m.sideType === 'land_analysis' && (
                  <>
                    <div className="flex items-center gap-2 text-[#C88E00] border-b border-stone-800 pb-2">
                      <Table size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">Saleable Land Analysis</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      {landAnalysis.map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-1.5 border-b border-stone-800/60">
                          <span className="text-stone-300 font-medium">{item.zone}</span>
                          <span className="font-bold text-[#C88E00]">{item.area}</span>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-stone-700 flex justify-between items-baseline">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Project Targeted Area</span>
                        <span className="font-serif text-lg font-extrabold text-[#388E3C]">150 BIGHAS</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-stone-400 leading-relaxed pt-1">
                      *Land distribution breakdown per official CMP diagram by Wellburg Reality Pvt. Ltd.
                    </p>
                  </>
                )}

                {m.sideType === 'block_specs' && (
                  <>
                    <div className="flex items-center gap-2 text-[#388E3C] border-b border-stone-800 pb-2">
                      <Layers size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">Block A Layout Specs</span>
                    </div>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center py-1.5 border-b border-stone-800/60">
                        <span className="text-stone-300 font-medium">Road Widths</span>
                        <span className="font-bold text-[#C88E00]">30ft / 28ft / 20ft</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-stone-800/60">
                        <span className="text-stone-300 font-medium">Plot Sizes</span>
                        <span className="font-bold text-white">2 to 5 Katha</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-stone-800/60">
                        <span className="text-stone-300 font-medium">Project Gate Access</span>
                        <span className="font-bold text-[#388E3C]">91B Bus Road</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-stone-800/60">
                        <span className="text-stone-300 font-medium">Frontage Market Zone</span>
                        <span className="font-bold text-[#C88E00]">CP01 – CP38</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-stone-800/60">
                        <span className="text-stone-300 font-medium">Duplex Zone</span>
                        <span className="font-bold text-white">Proposed Area</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-stone-400 leading-relaxed pt-1">
                      *Official Block A plot map layout blueprint.
                    </p>
                  </>
                )}

                {m.sideType === 'distances' && (
                  <>
                    <div className="flex items-center gap-2 text-[#C88E00] border-b border-stone-800 pb-2">
                      <Navigation size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">Key Distances</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      {officialDistances.map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-1.5 border-b border-stone-800/60">
                          <span className="text-stone-300 font-medium">{item.destination}</span>
                          <span className={`font-bold ${item.distance === 'BESIDE' ? 'text-[#388E3C] bg-[#388E3C]/10 px-2 py-0.5 rounded border border-[#388E3C]/20' : 'text-[#C88E00]'}`}>
                            {item.distance}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-stone-400 leading-relaxed pt-1">
                      *Distances from official project location chart.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Lightbox Modal for High-Res View */}
      {activeModalImg && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-6xl w-full max-h-[92vh] overflow-hidden bg-[#0F1F17] rounded-3xl border border-[#C88E00]/40 p-4 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-3 text-white">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#C88E00]">
                  {getModalTitle(activeModalImg)}
                </h3>
                <p className="text-xs text-stone-400">Ridhi Bhoomi — Developed by Wellburg Reality Pvt. Ltd.</p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={getModalDownload(activeModalImg).url}
                  download={getModalDownload(activeModalImg).name}
                  className="btn-gold text-xs py-1.5 px-3 flex items-center gap-1"
                >
                  <Download size={13} /> Download JPG
                </a>
                <button
                  type="button"
                  onClick={() => setActiveModalImg(null)}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="overflow-auto flex-1 flex justify-center items-center p-2 bg-[#0A150F] rounded-2xl border border-stone-800">
              <img
                src={getModalSrc(activeModalImg)}
                alt={getModalTitle(activeModalImg)}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


