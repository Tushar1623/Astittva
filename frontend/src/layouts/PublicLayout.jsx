import { Outlet } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import AmbientGlow from "@/components/AmbientGlow";
import { PHONE_E164, EMAIL, SOCIAL_LINKS } from "@/lib/site";

// Organization + LocalBusiness schema injected once for the whole public site.
const GLOBAL_JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": "https://astittva.in/#organization",
    name: "Astittva Marketing",
    legalName: "Astittva Marketing",
    url: "https://astittva.in",
    logo: "https://customer-assets.emergentagent.com/job_astitva-luxury-1/artifacts/c212hx9z_ASTITTVA%20MARKETING%20FINAL.png",
    image:
      "https://customer-assets.emergentagent.com/job_astitva-luxury-1/artifacts/c212hx9z_ASTITTVA%20MARKETING%20FINAL.png",
    description:
      "Astittva Marketing is a luxury real estate advisory and property consultancy in Kolkata, curating verified residential, commercial and investment opportunities across the city's most promising destinations — New Town, Rajarhat, Salt Lake, Alipore.",
    telephone: PHONE_E164,
    email: EMAIL,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kolkata",
      addressRegion: "West Bengal",
      addressCountry: "IN",
    },
    areaServed: ["Kolkata", "New Town", "Rajarhat", "Salt Lake", "Alipore", "India"],
    sameAs: [
      SOCIAL_LINKS.instagram.web,
      SOCIAL_LINKS.facebook.web,
      SOCIAL_LINKS.linkedin.web,
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://astittva.in/#localbusiness",
    name: "Astittva Marketing",
    url: "https://astittva.in",
    telephone: PHONE_E164,
    email: EMAIL,
    image:
      "https://customer-assets.emergentagent.com/job_astitva-luxury-1/artifacts/c212hx9z_ASTITTVA%20MARKETING%20FINAL.png",
    priceRange: "₹₹₹",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kolkata",
      addressRegion: "West Bengal",
      addressCountry: "IN",
    },
  },
];

export default function PublicLayout() {
  return (
    <div className="relative bg-charcoal text-ivory min-h-screen overflow-x-hidden">
      <Helmet prioritizeSeoTags>
        <script type="application/ld+json">{JSON.stringify(GLOBAL_JSON_LD)}</script>
      </Helmet>
      <AmbientGlow />
      <div className="relative z-10">
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
        <FloatingWhatsApp />
      </div>
    </div>
  );
}
