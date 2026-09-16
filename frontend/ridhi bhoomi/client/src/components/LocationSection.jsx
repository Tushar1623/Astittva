import { CheckCircle2 } from 'lucide-react';

export default function LocationSection() {
  return (
    <div className="space-y-10">
      {/* Primary Road Connectivity & Nearby Landmarks Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Road Networks */}
        <div className="card p-6 bg-white border border-stone-200 shadow-md space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#0F1F17] border-b border-stone-200 pb-2 flex items-center justify-between">
            <span>Primary Road Connectivity</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#388E3C]">Strategic Access</span>
          </h3>

          <div className="space-y-2.5">
            {[
              { name: "Adjacent to New Town", desc: "Beside Kolkata's premier planned IT & residential township" },
              { name: "Six Lane (New Town) Access", desc: "Direct connectivity via major 6-lane artery road" },
              { name: "Basanti Highway Frontage", desc: "Direct connectivity to Basanti Expressway" },
              { name: "91B Bus Road Entrance", desc: "Project gate connects directly to 91B Bus route" },
              { name: "Jila Parishad & Canal Road", desc: "Multiple access corridors around Swapnabhumi" },
            ].map((road, i) => (
              <div key={i} className="info-row">
                <div>
                  <span className="font-bold text-xs text-[#0F1F17]">{road.name}</span>
                  <p className="text-[11px] text-[#6E736B]">{road.desc}</p>
                </div>
                <CheckCircle2 size={16} className="text-[#388E3C] shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Nearby Corporate & Tech Parks */}
        <div className="card p-6 bg-white border border-stone-200 shadow-md space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#0F1F17] border-b border-stone-200 pb-2 flex items-center justify-between">
            <span>Nearby Corporate & Tech Parks</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C88E00]">IT Hubs</span>
          </h3>

          <div className="space-y-2.5">
            {[
              { name: "Wipro Tech Campus", desc: "Short drive via Jila Parishad & 6-lane road" },
              { name: "ITC Infotech Park", desc: "Adjacent to major corporate offices in New Town" },
              { name: "Infosys Campus", desc: "Close proximity to New Town Action Area III tech zone" },
              { name: "Biswa Bangla Gate", desc: "8.0 KM from New Town iconic landmark" },
              { name: "Sector V IT Hub", desc: "13.0 KM direct connectivity" },
            ].map((item, i) => (
              <div key={i} className="info-row">
                <div>
                  <span className="font-bold text-xs text-[#0F1F17]">{item.name}</span>
                  <p className="text-[11px] text-[#6E736B]">{item.desc}</p>
                </div>
                <CheckCircle2 size={16} className="text-[#C88E00] shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

