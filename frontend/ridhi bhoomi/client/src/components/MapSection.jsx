import { MapPin, Navigation, ExternalLink, Compass, Car, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MapSection({
  className = '',
  title = 'Live Site Location on Google Maps',
  subtitle = 'Navigate directly to Riddhi Bhumi. Centrally situated near New Town Kolkata with immediate access to 6-lane artery corridors and Basanti Highway.',
  showHeader = true,
  compact = false
}) {
  const googleMapsUrl = 'https://maps.google.com/?q=22.513417,88.5327908';
  const directionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=22.513417,88.5327908';

  return (
    <section className={`w-full ${className}`} id="google-map-section">
      {showHeader && (
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="badge-forest inline-flex items-center gap-1.5">
            <MapPin size={12} className="text-[#388E3C]" />
            <span>Interactive Google Map</span>
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0F1F17]">{title}</h2>
          <p className="text-xs sm:text-sm text-[#6E736B]">{subtitle}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12 items-stretch">
        {/* Interactive Google Map Embed Card */}
        <div className={`${compact ? 'lg:col-span-12' : 'lg:col-span-8'} flex flex-col`}>
          <div className="relative w-full h-[380px] sm:h-[450px] lg:h-[500px] rounded-3xl overflow-hidden shadow-lg border border-stone-200/90 bg-stone-100 group">
            {/* Top Overlay Badge */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#0F1F17]/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#C88E00]/30 text-[11px] font-bold text-white shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Riddhi Bhumi • Live Site Pin</span>
            </div>

            {/* Google Map Iframe */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3685.7538401072143!2d88.5327908!3d22.513417099999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a020d0030b5d241%3A0x48fb45e2b86bf2!2sRiddhi%20Bhumi!5e0!3m2!1sen!2sjp!4v1789540645634!5m2!1sen!2sjp"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Riddhi Bhumi Google Maps Location"
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          </div>
        </div>

        {/* Quick Route & Navigation Panel */}
        <div className={`${compact ? 'lg:col-span-12' : 'lg:col-span-4'} flex flex-col justify-between gap-5`}>
          <div className="card p-6 bg-white border border-stone-200/90 shadow-md rounded-3xl space-y-5 flex-1">
            <div className="border-b border-stone-200 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C88E00]">GPS Location</span>
              <h3 className="font-serif text-lg font-bold text-[#0F1F17]">Riddhi Bhumi Township</h3>
              <p className="text-xs text-[#6E736B] mt-1">Adjacent to New Town Action Area III & Basanti Highway Corridors</p>
            </div>

            {/* Distance Highlights */}
            <div className="space-y-2.5">
              {[
                { name: 'Biswa Bangla Gate', distance: '8.0 KM', icon: Car },
                { name: 'Sector V Tech Hub', distance: '13.0 KM', icon: Clock },
                { name: 'NSCBI Airport', distance: '17.2 KM', icon: Compass },
                { name: 'New Town 6-Lane Artery', distance: 'Adjacent', icon: Navigation },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F3] border border-stone-200/70 text-xs">
                    <span className="flex items-center gap-2 font-medium text-[#0F1F17]">
                      <Icon size={14} className="text-[#388E3C]" />
                      {item.name}
                    </span>
                    <span className="font-bold text-[#C88E00]">{item.distance}</span>
                  </div>
                );
              })}
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-2 space-y-2.5">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold w-full flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-widest text-center shadow-sm"
              >
                <Navigation size={14} />
                <span>Get Driving Directions</span>
              </a>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full flex items-center justify-center gap-2 py-3 text-xs uppercase tracking-widest text-center"
              >
                <ExternalLink size={14} />
                <span>Open in Google Maps App</span>
              </a>
            </div>
          </div>

          {/* Book Site Visit Banner */}
          <div className="p-4 rounded-2xl bg-[#0F1F17] text-white border border-[#24382B] flex items-center justify-between gap-3 shadow-sm">
            <div>
              <div className="text-xs font-bold text-[#C88E00]">Visiting the Site?</div>
              <div className="text-[11px] text-stone-300">Free pickup & guided plot inspection</div>
            </div>
            <Link
              to="/site-visit"
              className="px-3.5 py-2 rounded-xl bg-white text-[#0F1F17] hover:bg-[#FAF8F3] text-[11px] font-bold tracking-wide shrink-0 transition-colors"
            >
              Book Visit →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
