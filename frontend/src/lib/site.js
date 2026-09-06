// Site-wide constants
export const PHONE_E164 = "+919230374700";
export const PHONE_DISPLAY = "+91 92303 74700";
export const WHATSAPP_NUMBER = "919230374700";

// Social profile URLs (web) + mobile app deep-links.
// On mobile, the click handler tries the app:// scheme first and falls back
// to the web URL if the app isn't installed. On desktop, the web URL opens
// in a new tab.
export const SOCIAL_LINKS = {
  instagram: {
    web: "https://www.instagram.com/astittvamarketing",
    app: "instagram://user?username=astittvamarketing",
    label: "Instagram",
  },
  facebook: {
    web: "https://www.facebook.com/people/Astittva-Marketing/61589787526878/",
    app: "fb://profile/61589787526878",
    label: "Facebook",
  },
  linkedin: {
    web: "https://www.linkedin.com/company/astittva-marketing/",
    app: "linkedin://company/astittva-marketing",
    label: "LinkedIn",
  },
};

export function openSocialLink(e, link) {
  if (typeof navigator === "undefined") return;
  const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent || "");
  if (!isMobile || !link?.app) return; // desktop: let the default <a target="_blank"> behave
  e.preventDefault();
  const start = Date.now();
  // Attempt the native app
  window.location.href = link.app;
  // Fall back to the web URL if the app didn't take over within ~800ms
  setTimeout(() => {
    if (Date.now() - start < 1500 && document.visibilityState === "visible") {
      window.open(link.web, "_blank", "noopener,noreferrer");
    }
  }, 800);
}

export const EMAIL = "sales@astittva.in";

export const LOGO_URL = "https://customer-assets.emergentagent.com/job_astitva-luxury-1/artifacts/c212hx9z_ASTITTVA%20MARKETING%20FINAL.png";

export const BRAND_NAME = "ASTITTVA MARKETING";
export const BRAND_SHORT = "ASTITTVA";
export const BRAND_TAGLINE = "Real Estate Consulting & Marketing";

export const OFFICE_ADDRESS = {
  building: "PS IXL Building",
  line1: "5th Floor, Room 511",
  street: "Biswa Bangla Sarani",
  area: "Atghara, New Town",
  city: "Kolkata",
  state: "West Bengal",
  pincode: "700136",
  country: "India",
};

export const OFFICE_ADDRESS_LINES = [
  "PS IXL Building",
  "5th Floor, Room 511",
  "Biswa Bangla Sarani",
  "Atghara, New Town",
  "Kolkata, West Bengal 700136",
  "India",
];

export function whatsappLink(message = "") {
  const text = encodeURIComponent(message || "Hi ASTITTVA MARKETING, I'd like to know more about your properties.");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
