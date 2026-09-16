/**
 * ASTITTVA — Central Site & Catalogue Constants
 * Single source of truth for catalogue options, budget tiers, and shared asset URLs.
 */
import { MapPin, Building2, TrendingUp, Globe2 } from "lucide-react";

export const TEXTURE_URL =
  "https://static.prod-images.emergentagent.com/jobs/50ac1e2c-4ee3-4d48-ad5e-fd37063ae3c0/images/1f5da7f44ad5aab6c1f6ab3c12df3ec89723084c1042e95749a6b4658dcffcc6.png";

export const LOCATIONS_CATALOGUE = [
  "New Town",
  "Rajarhat",
  "Salt Lake",
  "Alipore",
  "EM Bypass",
  "Ballygunge",
  "Park Street",
  "Action Area I",
  "Action Area II",
  "Action Area III",
];

export const FEATURED_LOCATIONS = [
  {
    name: "New Town",
    tag: "Smart City Hub",
    img: "/images/luxe/locations_newtown.jpg",
    blurb: "India's first planned smart-city — IT corridors and rising luxury sky-residences.",
    starting: "₹1.2 Cr",
    category: "Luxury · Premium",
  },
  {
    name: "Rajarhat",
    tag: "Investment Frontier",
    img: "/images/luxe/locations_rajarhat.jpg",
    blurb: "The fastest-appreciating corridor of Greater Kolkata, anchored by Eco Park & global IT.",
    starting: "₹35 L",
    category: "Premium · Plots",
  },
  {
    name: "Kolkata",
    tag: "Cultural Capital",
    img: "/images/luxe/locations_kolkata.jpg",
    blurb: "A legacy city reimagined — heritage, art, and a new wave of luxury residences.",
    starting: "₹4.5 Cr",
    category: "Heritage · Luxury",
  },
];

export const PROPERTY_TYPES = [
  "Residential — Luxury",
  "Residential — Premium",
  "Residential",
  "Commercial",
  "Retail",
  "Office Space",
  "Villa / Standalone",
  "Villa",
  "Apartment",
  "Penthouse",
  "Plot / Land",
  "Plot",
];

export const FILTER_PROPERTY_TYPES = [
  "Residential",
  "Commercial",
  "Retail",
  "Office Space",
  "Villa",
  "Apartment",
  "Penthouse",
  "Plot",
];

export const BUDGET_OPTIONS = [
  "Under ₹50 L",
  "₹50 L – ₹1 Cr",
  "₹1 – 3 Cr",
  "₹3 – 5 Cr",
  "₹5 Cr+",
];

export const FILTER_BUDGETS = [
  { id: "u1", label: "Under ₹1 Cr", min: 0, max: 10000000 },
  { id: "1-2", label: "₹1–2 Cr", min: 10000000, max: 20000000 },
  { id: "2-3", label: "₹2–3 Cr", min: 20000000, max: 30000000 },
  { id: "3-4", label: "₹3–4 Cr", min: 30000000, max: 40000000 },
  { id: "4-5", label: "₹4–5 Cr", min: 40000000, max: 50000000 },
  { id: "5-10", label: "₹5–10 Cr", min: 50000000, max: 100000000 },
  { id: "10+", label: "₹10 Cr+", min: 100000000, max: null },
];

export const BUILDERS = [
  "PS Group",
  "Merlin",
  "Siddha",
  "Godrej",
  "DLF",
  "Lodha",
  "Ambuja Neotia",
  "Mani Group",
  "Shrachi",
];

export const AVAILABILITIES = [
  "Ready To Move",
  "Under Construction",
  "New Launch",
  "Sold Out",
];

export const CATEGORIES = [
  "Luxury",
  "Ultra Luxury",
  "Investment",
  "Commercial",
  "Waterfront",
  "Golf Facing",
  "Smart Home",
];

export const PURPOSES = [
  "Self-Use",
  "Investment",
  "Rental Income",
  "Resale / Flip",
  "Diversification",
];

export const TIMELINES = [
  "Immediate (< 30 days)",
  "1 – 3 months",
  "3 – 6 months",
  "6 – 12 months",
  "Just exploring",
];

export const ROADMAP_STEPS = [
  { phase: "Today", area: "New Town · Rajarhat · Kolkata", icon: MapPin },
  { phase: "Next", area: "Greater Kolkata Metropolitan Region", icon: Building2 },
  { phase: "2027", area: "Tier-1 cities across India", icon: TrendingUp },
  { phase: "Vision", area: "Global investment destinations", icon: Globe2 },
];
