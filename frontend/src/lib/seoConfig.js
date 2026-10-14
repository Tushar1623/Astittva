/**
 * Astittva Marketing — Centralized SEO & Structured Data Configuration
 * Domain: https://astittva.in
 */

export const SITE_URL = "https://astittva.in";
export const SITE_NAME = "Astittva Marketing";
export const SITE_TAGLINE = "Luxury Real Estate Advisory & Property Consultants in Kolkata";

export const DEFAULT_OG_IMAGE = "https://astittva.in/images/astittva-social-preview.png";
export const BRAND_LOGO_URL = "https://astittva.in/images/brand-logo.png";

export const COMPANY_INFO = {
  name: "Astittva Marketing",
  legalName: "Astittva Marketing Private Limited",
  url: SITE_URL,
  logo: BRAND_LOGO_URL,
  image: DEFAULT_OG_IMAGE,
  telephone: "+91 92303 74700",
  email: "sales@astittva.in",
  address: {
    streetAddress: "PS IXL Building, 5th Floor, Room 511, Biswa Bangla Sarani, Atghara",
    addressLocality: "New Town, Kolkata",
    addressRegion: "West Bengal",
    postalCode: "700136",
    addressCountry: "IN",
  },
  geo: {
    latitude: 22.6214,
    longitude: 88.4552,
  },
  areaServed: [
    "Kolkata",
    "New Town",
    "Rajarhat",
    "Salt Lake",
    "EM Bypass",
    "Action Area I",
    "Action Area II",
    "Action Area III",
  ],
  priceRange: "₹₹₹₹",
  currenciesAccepted: "INR",
  paymentAccepted: "Cheque, Bank Transfer, Net Banking",
  openingHours: "Mo-Sa 10:00-19:00",
};

/**
 * Default RealEstateAgent + Organization JSON-LD Schema
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${SITE_URL}/#organization`,
    name: COMPANY_INFO.name,
    legalName: COMPANY_INFO.legalName,
    url: SITE_URL,
    logo: COMPANY_INFO.logo,
    image: COMPANY_INFO.image,
    description:
      "Astittva Marketing is a real estate consultancy and property advisory firm based in Kolkata, specializing in residential and commercial investments in New Town, Rajarhat, and Salt Lake.",
    telephone: COMPANY_INFO.telephone,
    email: COMPANY_INFO.email,
    priceRange: COMPANY_INFO.priceRange,
    currenciesAccepted: COMPANY_INFO.currenciesAccepted,
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY_INFO.address.streetAddress,
      addressLocality: COMPANY_INFO.address.addressLocality,
      addressRegion: COMPANY_INFO.address.addressRegion,
      postalCode: COMPANY_INFO.address.postalCode,
      addressCountry: COMPANY_INFO.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: COMPANY_INFO.geo.latitude,
      longitude: COMPANY_INFO.geo.longitude,
    },
    areaServed: COMPANY_INFO.areaServed.map((area) => ({
      "@type": "AdministrativeArea",
      name: area,
    })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "10:00",
        closes: "19:00",
      },
    ],
  };
}

/**
 * WebSite schema with potential search action
 */
export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_TAGLINE,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/properties?location={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "en-IN",
  };
}

/**
 * BreadcrumbList Schema Builder
 * @param {Array<{ name: string, path: string }>} items
 */
export function buildBreadcrumbSchema(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path.startsWith("http") ? item.path : `${SITE_URL}${item.path}`,
    })),
  };
}
