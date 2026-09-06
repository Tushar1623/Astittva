import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Linkedin, Facebook, ArrowRight, MessageCircle, ShieldCheck, Users, MessageSquareQuote } from "lucide-react";
import { whatsappLink, PHONE_DISPLAY, EMAIL, LOGO_URL, BRAND_NAME, SOCIAL_LINKS, openSocialLink } from "@/lib/site";

export default function Footer() {
  return (
    <footer data-testid="site-footer" className="relative">
      {/* ──────────────────────────────────────────────────────────────
       *  LUXURY CONCIERGE CTA — ivory/champagne, Four Seasons-grade
       *  Anchored by a serif headline, supporting trust pillars, dual CTA.
       * ────────────────────────────────────────────────────────────── */}
      <section data-testid="footer-cta" className="relative overflow-hidden bg-[#F8F6F2]">
        {/* Champagne radial halo */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(182,141,64,0.10) 0%, transparent 65%)," +
              "radial-gradient(ellipse 40% 30% at 15% 100%, rgba(106,30,45,0.06) 0%, transparent 55%)",
          }}
        />
        {/* Hairline divider top */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#B68D40]/35 to-transparent" />

        <div className="relative max-w-[1240px] mx-auto px-6 sm:px-10 lg:px-16 py-20 sm:py-28 text-center">
          <div className="section-eyebrow justify-center mb-6">Astittva Concierge</div>
          <h2 className="display-headline text-[#1C1C1C] text-[2.25rem] sm:text-[3.5rem] lg:text-[4.5rem] leading-[1.02] max-w-3xl mx-auto">
            Speak with an
            <span className="block mt-1.5"><span className="italic" style={{ color: "#B68D40" }}>Astittva Marketing</span> advisor.</span>
          </h2>

          {/* Trust pillars */}
          <div className="mt-8 sm:mt-10 flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-[#2A2A2A]">
            {[
              { icon: ShieldCheck, label: "Verified projects" },
              { icon: MessageSquareQuote, label: "Trusted advice" },
              { icon: Users, label: "End-to-end guidance" },
            ].map(({ icon: Icon, label }, i) => (
              <span key={i} className="inline-flex items-center gap-2 text-[11px] sm:text-sm font-medium tracking-wide">
                <Icon className="w-4 h-4 text-[#B68D40]" strokeWidth={1.6} />
                {label}
              </span>
            ))}
          </div>

          <p className="mt-7 text-[#3A3A3A] text-base sm:text-lg leading-[1.7] font-normal max-w-2xl mx-auto">
            Book your consultation today. Most conversations begin within 30 minutes — by phone, WhatsApp or at our New Town office.
          </p>

          {/* Dual luxury CTA */}
          <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              data-testid="cta-primary"
              className="group relative inline-flex items-center justify-center gap-2.5 px-10 py-4 bg-[#B87333] hover:bg-[#6A1E2D] border border-[#B87333] hover:border-[#6A1E2D] text-white text-[11px] tracking-[0.32em] uppercase font-semibold transition-all duration-500 min-w-[230px] shadow-[0_6px_24px_-8px_rgba(184,115,51,0.45)] hover:shadow-[0_12px_30px_-8px_rgba(106,30,45,0.55)]"
            >
              Book Consultation
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
            <a
              href={whatsappLink("Hi Astittva Marketing, I'd like to speak with an advisor.")}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="cta-whatsapp"
              className="group inline-flex items-center justify-center gap-2.5 px-10 py-4 bg-white hover:bg-[#1C1C1C] border border-[#1C1C1C] text-[#1C1C1C] hover:text-white text-[11px] tracking-[0.32em] uppercase font-semibold transition-all duration-500 min-w-[230px]"
            >
              <MessageCircle className="w-4 h-4" strokeWidth={1.8} />
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────
       *  FOOTER PROPER — luxury merlot, Sotheby's/Knight Frank-grade contrast
       * ────────────────────────────────────────────────────────────── */}
      <div className="relative text-[#F5EFE7] border-t border-[#C78B47]/30" style={{ backgroundColor: "#2A080C" }}>
        {/* Top champagne sheen */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-40 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(199,139,71,0.10) 0%, transparent 100%)" }} />

        <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-16 py-16 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
            <div className="md:col-span-5">
              {/* Brand signature — mobile: clean stacked signature, no card.
                  Desktop: subtle premium card with softened border (70% lighter than v1). */}
              <div
                className="
                  flex flex-col items-start gap-5 mb-8 max-w-full
                  md:inline-flex md:flex-row md:items-center md:gap-5
                  md:p-7 md:rounded-2xl md:mb-7
                  md:bg-[rgba(255,255,255,0.025)]
                  md:border md:border-[rgba(199,139,71,0.05)]
                "
              >
                <img
                  src={LOGO_URL}
                  alt="Astittva Marketing"
                  className="h-[68px] w-[68px] sm:h-[80px] sm:w-[80px] md:h-[88px] md:w-[88px] object-contain shrink-0"
                />
                <div className="md:border-l md:border-[#C78B47]/40 md:pl-5">
                  <div
                    className="font-serif-display text-[1.35rem] sm:text-[1.55rem] md:text-[1.6rem]"
                    style={{
                      color: "#F5EFE7",
                      letterSpacing: "0.18em",
                      fontWeight: 600,
                      lineHeight: 1.1,
                      textShadow: "0 1px 12px rgba(199,139,71,0.20)",
                    }}
                  >
                    ASTITTVA MARKETING
                  </div>
                  <div
                    className="text-[10px] sm:text-[11px]"
                    style={{
                      color: "#C78B47",
                      letterSpacing: "0.42em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      marginTop: "10px",
                    }}
                  >
                    Luxury Real Estate Advisory
                  </div>
                </div>
              </div>

              <p className="text-[15px] leading-[1.85] font-normal max-w-md" style={{ color: "#F5EFE7" }}>
                Verified projects · Strategic investments · End-to-end advisory.
                <br />
                Across <span style={{ color: "#E5C68C", fontWeight: 500 }}>New Town, Rajarhat &amp; Kolkata</span> — expanding nationally and into global investment markets.
              </p>

              {/* Champagne hairline divider */}
              <div className="mt-8 mb-8 w-16 h-px" style={{ background: "linear-gradient(90deg, #C78B47, rgba(199,139,71,0))" }} />

              <div className="flex gap-3">
                {[
                  { Icon: Instagram, link: SOCIAL_LINKS.instagram },
                  { Icon: Linkedin,  link: SOCIAL_LINKS.linkedin },
                  { Icon: Facebook,  link: SOCIAL_LINKS.facebook },
                ].map(({ Icon, link }) => (
                  <a
                    key={link.label}
                    href={link.web}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    data-testid={`social-${link.label.toLowerCase()}`}
                    onClick={(e) => openSocialLink(e, link)}
                    className="w-11 h-11 border flex items-center justify-center transition-all duration-500 hover:bg-[#C78B47]/10"
                    style={{ borderColor: "rgba(199,139,71,0.45)" }}
                  >
                    <Icon className="w-[18px] h-[18px]" strokeWidth={1.4} style={{ color: "#F5EFE7" }} />
                  </a>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-[10px] tracking-[0.4em] uppercase text-[#C78B47] mb-6 font-semibold">Explore</h4>
              <ul className="space-y-3.5 text-[14px] text-[#F5EFE7]/90 font-normal">
                <li><Link to="/" className="hover:text-[#C78B47] transition">Home</Link></li>
                <li><Link to="/properties" className="hover:text-[#C78B47] transition">Properties</Link></li>
                <li><Link to="/market-intelligence" className="hover:text-[#C78B47] transition">Market Intelligence</Link></li>
                <li><Link to="/about" className="hover:text-[#C78B47] transition">About</Link></li>
                <li><Link to="/contact" className="hover:text-[#C78B47] transition">Contact</Link></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-[10px] tracking-[0.4em] uppercase text-[#C78B47] mb-6 font-semibold">Markets</h4>
              <ul className="space-y-3.5 text-[14px] text-[#F5EFE7]/90 font-normal">
                <li>New Town</li>
                <li>Rajarhat</li>
                <li>Kolkata</li>
                <li className="text-[#F5EFE7]/55 italic font-serif-display text-xs pt-2">Greater Kolkata · India · Global</li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <h4 className="text-[10px] tracking-[0.4em] uppercase text-[#C78B47] mb-6 font-semibold">Reach Us</h4>
              <ul className="space-y-4 text-[14px] text-[#F5EFE7]/90 font-normal">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#C78B47] mt-0.5 shrink-0" strokeWidth={1.5} />
                  <span className="leading-[1.7]">PS IXL Building, 5th Flr, Room 511<br />Biswa Bangla Sarani, Atghara<br />New Town, Kolkata, WB 700136</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#C78B47] shrink-0" strokeWidth={1.5} />
                  <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, "")}`} className="hover:text-[#C78B47] transition">{PHONE_DISPLAY}</a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#C78B47] shrink-0" strokeWidth={1.5} />
                  <a href={`mailto:${EMAIL}`} className="hover:text-[#C78B47] transition">{EMAIL}</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom champagne divider strip */}
          <div className="mt-16 sm:mt-20 pt-7 border-t border-[#C78B47]/25 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#F5EFE7]/75 text-xs tracking-wider">© {new Date().getFullYear()} <span className="text-[#F5EFE7] font-semibold tracking-[0.1em]">Astittva Marketing</span> · All rights reserved.</p>
            <p className="text-[#F5EFE7]/75 text-[10px] tracking-[0.4em] uppercase">Crafted with conviction · Luxury Real Estate Advisory</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
