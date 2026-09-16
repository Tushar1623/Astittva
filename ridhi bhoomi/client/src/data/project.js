// Comprehensive Project Configuration & Data Store

export const project = {
  name: 'Ridhi Bhoomi',
  developer: 'Wellburg Reality Pvt. Ltd.',
  tagline: 'Where Prosperity Meets Land',
  website: 'www.riddhibhumi.com',
  email: 'ridhibhoomikol@gmail.com',
  transactionEmail: 'wellburgreality@gmail.com',
  phone: '9230374700',
  whatsapp: '9230374700',
  officeAddress:
    'Ekajul, Patharghata, New Town, Kolkata, West Bengal, Pin - 700135, Near Shapoorji Bus Stop',
  targetAreaBighas: 150,
  openAreaPercent: '50%+',
  priceEffectiveDate: '01.04.2026',
  location: {
    area: 'Adjacent to New Town / Rajarhat',
    description:
      'Ridhi Bhoomi is positioned adjacent to New Town with connectivity via six-lane New Town route, Basanti Highway, Canal Road and 91B Bus Road.',
  },
  disclaimers: [
    'This brochure and website content is conceptual and for representative purposes.',
    'Master plan may modify/change over time. Booking agreement details shall be final and binding.',
    'Distances and timelines are tentative and approximate.',
    'Proposed amenities are planned and not represented as completed unless verified.',
    'Prices are subject to change and availability per company price chart.',
  ],
  bankDetails: {
    accountName: 'WELLBURG REALITY PRIVATE LIMITED',
    accountNumber: '924020021442893',
    bank: 'AXIS BANK LTD',
    branch: 'DOWNTOWN MALL',
    ifsc: 'UTIB0005347',
  },
};

export const projectZones = [
  { id: 'residential', name: 'Residential Plots', color: '#22c55e', link: '/master-plan' },
  { id: 'commercial', name: 'Commercial', color: '#3b82f6', link: '/master-plan' },
  { id: 'duplex', name: 'Duplex', color: '#a855f7', link: '/about' },
  { id: 'farmhouse', name: 'Farmhouses', color: '#84cc16', link: '/about' },
  { id: 'club', name: 'Club', color: '#06b6d4', link: '/amenities' },
  { id: 'water-body', name: 'Water Body', color: '#0ea5e9', link: '/about' },
  { id: 'reserve', name: 'Reserve/Future Development', color: '#94a3b8', link: '/about' },
];

export const propertyTypes = [
  { id: 'residential', title: 'Residential Plots', desc: 'Choose your plot size and road-facing category.', link: '/master-plan' },
  { id: 'commercial', title: 'Commercial Plots', desc: 'Retail and business plots with flexible sizes.', link: '/master-plan' },
  { id: 'duplex', title: 'Duplex', desc: 'Planned duplex living zones within the development.', link: '/about' },
  { id: 'farmhouse', title: 'Farmhouse', desc: 'Dedicated farmhouse zone in the master plan.', link: '/about' },
];

export const whyRidhiBhoomi = [
  { icon: 'tree', title: 'Green Environment', desc: 'Entire project planned with more than 50% open area and greenery.' },
  { icon: 'road', title: 'Road Connectivity', desc: 'Connected via six-lane New Town route, Basanti Highway, Canal Road and 91B Bus Road.' },
  { icon: 'home', title: 'Multiple Options', desc: 'Residential plots, commercial plots, duplex, farmhouse and more.' },
  { icon: 'credit', title: 'Flexible Payment', desc: 'Minimum 30% down payment with remaining amount through EMI (as per current price chart).' },
  { icon: 'map', title: 'Near New Town', desc: 'Project positioned adjacent to New Town / Rajarhat area.' },
];

export const paymentSteps = [
  { step: 1, title: 'Select Plot', desc: 'Choose your preferred residential or commercial plot.' },
  { step: 2, title: 'Lock Plot', desc: 'Minimum locking payment ₹10,000 per plot (max 14 working days).' },
  { step: 3, title: 'Pay 30%+', desc: 'Minimum 30% down payment for booking agreement.' },
  { step: 4, title: 'Booking Agreement', desc: 'Agreement executed after payment of 30% and above.' },
  { step: 5, title: 'EMI', desc: 'Remaining amount payable through equal monthly installments (36 months default).' },
];

// --- PRICING & PAYMENT CALCULATIONS ---
export const residentialPricing = {
  kathaSqft: 720,
  effectiveDate: '01.04.2026',
  lockingAmount: 10000,
  lockingPeriodDays: 14,
  processingFee: 2000,
  minimumDownPaymentPercent: 30,
  defaultTenureMonths: 36,
  tenureOptions: [36, 48],
  downPaymentOptions: [30, 50, 70, 80, 100],
  categories: [
    {
      id: '20ft_normal',
      name: '20 Feet Wide Road Facing - Normal Plot',
      ratePerKatha: 1000000,
    },
    {
      id: '30ft_normal',
      name: '30 Feet Wide Road Facing - Normal Plot',
      ratePerKatha: 1200000,
    },
    {
      id: '20x28_corner',
      name: '20 ft × 28 ft Wide Road Facing - Corner Plot',
      ratePerKatha: 1300000,
    },
    {
      id: '28x30_corner',
      name: '28 ft × 30 ft Wide Road Facing - Corner Plot',
      ratePerKatha: 1600000,
    },
  ],
  plotSizes: [
    { katha: 1, sqft: 720 },
    { katha: 1.5, sqft: 1080 },
    { katha: 2, sqft: 1440 },
    { katha: 2.5, sqft: 1800 },
    { katha: 3, sqft: 2160 },
    { katha: 4, sqft: 2880 },
    { katha: 5, sqft: 3600 },
  ],
};

export const commercialPricing = {
  effectiveDate: '01.04.2026',
  lockingAmount: 10000,
  processingFee: 2000,
};

export function calculateResidentialPrice(categoryId, katha) {
  const category = residentialPricing.categories.find((c) => c.id === categoryId);
  if (!category) return null;
  return Math.round(category.ratePerKatha * katha);
}

export function calculateDownPayment(totalPrice, percent = 30) {
  return Math.round((totalPrice * percent) / 100);
}

export function calculateEMI(remainingAmount, months = 36) {
  if (!months || months <= 0) return 0;
  return Math.round(remainingAmount / months);
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// --- LOCATION & CONNECTIVITY DATA ---
export const nearbyLocations = [
  { name: 'New Town', distance: 'Beside', note: 'Adjacent to project' },
  { name: 'Biswa Bangla Gate', distance: '8 km', note: 'Approximate' },
  { name: 'Sector V', distance: '13 km', note: 'Approximate' },
  { name: 'Ruby', distance: '13 km', note: 'Approximate' },
  { name: 'Airport', distance: '17.2 km', note: 'Approximate' },
  { name: 'Science City', distance: '17 km', note: 'Approximate' },
  { name: 'Sealdah Station', distance: '20 km', note: 'Approximate' },
  { name: 'Salt Lake', distance: 'Nearby', note: 'As per project map' },
];

export const connectivity = [
  'Six Lane (New Town)',
  'Basanti Highway',
  'Canal Road',
  '91B Bus Road',
  'Swapnabhumi Proposed Road',
  'Gram Panchayat Road',
  '30 Feet Wide Project Road',
];

export const locationDisclaimer =
  'Distances are approximate and based on the project information provided. Actual travel distance/time may vary depending on route and infrastructure.';

// --- CONTENT, AMENITIES, FAQS & DOCUMENTS ---
export const amenities = [
  { name: 'Park', proposed: true },
  { name: 'Community Hall', proposed: true },
  { name: 'Market', proposed: true },
  { name: 'Club House', proposed: true },
  { name: 'Modern Gym', proposed: true },
  { name: 'Kids Activity Area', proposed: true },
  { name: 'Security System', proposed: true },
  { name: 'Swimming Pool', proposed: true },
  { name: 'Playground', proposed: true },
];

export const infrastructure = [
  '30ft / 28ft / 20ft Wide Metal Road',
  'Pavement by the side of the road',
  'Well Planned drainage system',
  'Electric Facilities',
  'Entry Gate on Bus Road',
];

export const faqs = [
  {
    q: 'What is Ridhi Bhoomi?',
    a: 'Ridhi Bhoomi is a mixed development project by Wellburg Reality Pvt. Ltd., positioned adjacent to New Town, offering residential plots, commercial plots, duplex, farmhouse and other zones.',
  },
  {
    q: 'Where is Ridhi Bhoomi located?',
    a: 'The project is adjacent to New Town / Rajarhat, Kolkata, with connectivity via six-lane New Town route, Basanti Highway, Canal Road and 91B Bus Road. Corporate office: Ekajul, Patharghata, New Town, Kolkata - 700135.',
  },
  {
    q: 'What types of plots are available?',
    a: 'Residential plots, commercial plots (CP series), and planned zones for duplex, farmhouses, market, club, resorts and reserve areas.',
  },
  {
    q: 'What is 1 Katha?',
    a: 'As per the residential price chart, 1 Katha = 720 sq.ft.',
  },
  {
    q: 'What is the current residential pricing?',
    a: 'Residential rates per Katha (effective 01.04.2026): ₹10 lakh (20 ft road normal), ₹12 lakh (30 ft road normal), ₹13 lakh (20×28 ft corner), ₹16 lakh (28×30 ft corner). Subject to company price chart.',
  },
  {
    q: 'What is the minimum locking/booking amount?',
    a: 'Minimum plot locking payment is ₹10,000 per plot with a maximum locking period of 14 working days. Processing fee: ₹2,000 (non-refundable).',
  },
  {
    q: 'What is the minimum down payment?',
    a: 'Minimum 30% down payment is required for booking agreement execution, as per the current residential price chart.',
  },
  {
    q: 'How does EMI work?',
    a: 'After minimum 30% payment and booking agreement, the remaining amount is payable through equal monthly installments. Default tenure is 36 months.',
  },
  {
    q: 'Are commercial plots available?',
    a: 'Yes. Commercial plots CP01 through CP38 are listed in the commercial price chart with individual areas and rates per sq.ft.',
  },
  {
    q: 'Can I choose my plot?',
    a: 'Yes. You can explore available plots on the interactive map and enquire about specific plot numbers.',
  },
  {
    q: 'What are the cancellation terms?',
    a: 'As per booking terms: cancellation after booking agreement may incur 30% deduction on paid amount. Refund timelines and conditions apply as per official booking agreement.',
  },
  {
    q: 'Are amenities already built?',
    a: 'Amenities listed on this website are proposed amenities as per project brochure.',
  },
];

export const documents = [
  { name: 'Project Brochure', file: 'RIDDHI BHUMI BROCURE.pdf', category: 'Brochure' },
  { name: 'Residential Plot Map - Block A', file: 'PLOT MAP BLOCK A.pdf', category: 'Plot Map' },
  { name: 'Commercial Plot Map', file: 'COMMERCIAL PLOTS.pdf', category: 'Plot Map' },
  { name: 'Residential Price Chart', file: 'PRICE CHART OF RESIDENTIAL PLOTS.pdf', category: 'Pricing' },
  { name: 'Commercial Price Chart', file: 'PRICE CHART OF COMMERCIAL PLOTS.pdf', category: 'Pricing' },
  { name: 'Booking Form & Terms', file: 'booking form.pdf', category: 'Booking' },
  { name: 'Location Map', file: 'Location Map new.pdf', category: 'Location' },
];

export const blogPosts = [
  {
    slug: 'what-is-katha-kolkata',
    title: 'What is Katha? 1 Katha = How Many Sq.ft in Kolkata?',
    excerpt: 'Understanding plot measurement units used in Kolkata real estate.',
    date: '2026-03-01',
    category: 'Property Buying Guide',
  },
  {
    slug: 'buying-plot-near-new-town',
    title: 'How to Buy a Residential Plot Near New Town Kolkata',
    excerpt: 'Key steps and checks before investing in plotted development near New Town.',
    date: '2026-03-05',
    category: 'New Town Property',
  },
  {
    slug: 'plot-vs-flat-investment',
    title: 'Residential Plot vs Flat: Which is Right for You?',
    excerpt: 'Compare plot ownership and apartment living for Kolkata buyers.',
    date: '2026-03-10',
    category: 'Plot Investment',
  },
];

export const developerInfo = {
  overview:
    'Wellburg Reality Pvt. Ltd. focuses on quality, professionalism, communication and timely project management.',
  philosophy:
    'Hard-core professionalism, avoiding compromises or shortcuts. We listen carefully, respond promptly and honour our promises.',
  commitment:
    'Commitment to quality, efficiency and professionalism, with social responsibility around each project.',
};
