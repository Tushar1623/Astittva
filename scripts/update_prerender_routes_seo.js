const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('frontend/scripts/prerender_routes.js');

const newContent = `/**
 * Astittva Marketing — Static Pre-renderer & Build-Time Snapshot Generator
 * 
 * Generates crawlable, SEO-compliant HTML snapshots for all public routes:
 * - Directs title (max 60 chars), description (max 155 chars), self-referencing canonical
 * - Injects semantic <h1>, descriptive <h2> sections, and rich main page body text (300-450+ words)
 * - Retains compiled React script & CSS links for zero-friction client hydration
 * - No cloaking: initial snapshot content matches React rendered content
 * - Enforces single <h1> on all routes and sanitizes noscript phantom headings
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");

const SITE_DOMAIN = "https://astittva.in";
const BRAND_SUFFIX = " | Astittva Marketing";
const OG_IMAGE = "https://astittva.in/og-image.png";

function clampTitle(title, brandSuffix = BRAND_SUFFIX) {
  let clean = (title || "").replace(/\\s+/g, " ").trim();
  clean = clean.replace(/\\s*\\|\\s*Astittva.*$/i, "").trim();
  const maxPrefix = 60 - brandSuffix.length;
  if (clean.length > maxPrefix) {
    clean = clean.slice(0, maxPrefix - 3).trim() + "...";
  }
  return \`\${clean}\${brandSuffix}\`;
}

function clampDescription(desc) {
  let clean = (desc || "").replace(/\\s+/g, " ").trim();
  if (clean.length > 155) {
    const truncated = clean.slice(0, 152);
    const lastSpace = truncated.lastIndexOf(" ");
    return (lastSpace > 110 ? truncated.slice(0, lastSpace) : truncated) + "...";
  }
  return clean;
}

function fetchJson(url) {
  return new Promise((resolve) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, { timeout: 10000 }, (res) => {
        if (res.statusCode !== 200) return resolve(null);
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(null);
          }
        });
      })
      .on("error", () => resolve(null));
  });
}

const STATIC_PAGES = [
  {
    path: "/",
    title: "Astittva Marketing | Real Estate Company in Kolkata",
    rawTitle: "Real Estate Company in Kolkata",
    description: "Premier real estate company in Kolkata. Astittva Marketing provides trusted advisory for luxury properties, flats & investments across EM Bypass & New Town.",
    h1: "Real Estate Company in Kolkata | Find Your Astittva. Build Your Legacy.",
    lead: "Astittva Marketing is Kolkata's premier luxury real estate company and property advisory firm. Headquartered in New Town, we guide homebuyers, investors, and families to vetted residential, commercial, and secondary market developments across EM Bypass, Rajarhat, New Alipore, and Salt Lake with absolute transparency and institutional rigor.",
    sections: [
      {
        h2: "Premier Real Estate Corridors in Kolkata",
        content: "From the high-tech smart city corridors of New Town Action Area I, II & III to the rapidly appreciating residential townships of Rajarhat, the high-velocity skyline along Eastern Metropolitan (EM) Bypass, and prestigious heritage addresses in South Kolkata, Astittva Marketing curates vetted developments from Kolkata's most reputable builders. Every corridor offers distinct investment dynamics, connectivity advantages via the Kolkata Metro network, and world-class healthcare and education infrastructure.",
      },
      {
        h2: "Institutional Advisory Pillars & Due Diligence",
        content: "Every property in our portfolio undergoes thorough WBRERA regulatory diligence, 30-year chain of title verification, and developer pedigree evaluation. We provide transparent pricing without hidden brokerage, detailed carpet-to-super-built-up floor plan analysis, comparative market valuations, and advisor-led on-site inspections. Our clients make well-informed capital commitments backed by verifiable data.",
      },
      {
        h2: "Curated Luxury Developments & Secondary Market Resale",
        content: "Whether you are seeking newly launched high-rise sky residences, ready-to-move condominiums, or verified secondary market resale apartments, our dedicated desks manage the entire acquisition lifecycle. From bank financing approvals and legal document drafting to KMC or NKDA mutation and West Bengal stamp duty registration, our senior consultants ensure seamless execution.",
      },
      {
        h2: "Why Discerning Buyers Choose Astittva Marketing",
        content: "Unlike volume-driven real estate portals, Astittva operates as a high-touch private client advisory. We align our recommendations with your long-term capital preservation, lifestyle aspirations, and rental yield objectives. Our deep local footprint across Kolkata ensures privileged developer access, preferred inventory selection, and enduring post-transaction support.",
      },
    ],
  },
  {
    path: "/properties",
    rawTitle: "Properties in Kolkata",
    description: "Explore luxury and premium properties in Kolkata, New Town, and Rajarhat with Astittva Marketing. Verified projects with complete RERA compliance.",
    h1: "Properties in Kolkata: Verified Luxury Apartments & Residential Developments",
    lead: "Discover verified properties in Kolkata across premier growth corridors including New Town, Rajarhat, EM Bypass, and South Kolkata. Astittva Marketing handpicks luxury apartments, sky villas, and modern residential developments offering superior architectural design, prime connectivity, and complete WBRERA compliance.",
    sections: [
      {
        h2: "Verified Residential Properties in Kolkata",
        content: "Browse Kolkata's most coveted residential developments featuring 2 BHK, 3 BHK, 4 BHK, and penthouses from the city's foremost builders including Srijan Realty, Vinayak Group, Sattvik Homes, and Shrachi Keventer. Each residential listing provides verified floor plans, super built-up versus carpet area transparency, possession timelines, and approved construction milestones.",
      },
      {
        h2: "Prime Kolkata Corridors & Micro-Market Insights",
        content: "Explore properties strategically situated along New Town Action Area I, II, and III, the thriving residential hub of Rajarhat Chowmatha and Chinar Park, the rapid arterial growth of EM Bypass, and prestigious South Kolkata enclaves. Properties benefit from immediate access to the Orange Line and Green Line Metro networks, Netaji Subhash Chandra Bose International Airport, and premier IT hubs in Salt Lake Sector V.",
      },
      {
        h2: "Comprehensive Regulatory & Legal Due Diligence",
        content: "Every property featured in our portfolio is thoroughly vetted for West Bengal Real Estate Regulatory Authority (WBRERA) registration, sanctioned building plans, fire safety clearances, and environmental clearances. Our advisory desk eliminates uncertainty, verifying developer track records and financial health before listing.",
      },
      {
        h2: "Private Client Advisory & Site Inspections",
        content: "Our experienced real estate advisors provide private, chauffeur-assisted site inspections, personalized comparative market analysis, price negotiations, and loan structuring support. Experience a transparent, pressure-free buying experience tailored to your residential and investment criteria.",
      },
    ],
  },
  {
    path: "/resale",
    rawTitle: "Resale Properties in Kolkata",
    description: "Browse verified resale flats and houses in Kolkata, New Town, and Rajarhat. Title-checked secondary market properties ready for immediate possession.",
    h1: "Curated Resale Homes in Kolkata: Secondary Market Residences",
    lead: "Astittva Marketing presents a curated portfolio of verified resale homes and secondary market residences across New Town, Rajarhat, Salt Lake, and EM Bypass in Kolkata. Every resale flat offers immediate possession, established neighborhood infrastructure, and title-checked legal documentation for complete peace of mind.",
    sections: [
      {
        h2: "Secondary Market Advisory & Resale Advantage",
        content: "Investing in resale properties in Kolkata eliminates construction delays and GST liabilities associated with under-construction projects. Homebuyers benefit from ready amenities, active resident welfare associations, and immediate rental yields. Astittva Marketing's resale desk provides end-to-end transaction management for both buyers and property owners.",
      },
      {
        h2: "30-Year Chain of Title Verification & Legal Clearance",
        content: "Secondary market acquisitions require stringent legal verification. Our legal team conducts exhaustive 30-year searches at local registry offices (ARA Kolkata and District Registries), reviews original mother deeds, obtains non-encumbrance certificates (Form 15 & 16), and verifies society No Objection Certificates (NOCs) to protect your investment.",
      },
      {
        h2: "Accurate Valuation & West Bengal Stamp Duty Support",
        content: "We provide realistic market valuations based on recent registered circle rates and actual neighborhood transaction data. Our team guides you through the revised West Bengal stamp duty calculations (5% or 6% based on property value thresholds), registration fees, and municipal mutation processes with KMC and NKDA.",
      },
      {
        h2: "Seamless Ownership Transfer & Mutation Services",
        content: "From drafting registered agreements for sale and coordinating home loan transfers to final deed execution and municipal tax book updates, our advisors oversee every milestone. We ensure a frictionless transition from seller to buyer without unexpected legal bottlenecks.",
      },
    ],
  },
  {
    path: "/calculators",
    rawTitle: "Real Estate Financial Calculators",
    description: "Free real estate and home loan calculators by Astittva Marketing. Calculate EMI, affordability, property ROI, rental yield, and West Bengal stamp duty.",
    h1: "Real Estate Financial Calculators: Planning Tools for Kolkata Buyers",
    lead: "Plan your Kolkata property purchase with analytical accuracy using Astittva Marketing's comprehensive suite of real estate financial calculators. Model your home loan EMIs, evaluate rental yields in New Town, calculate West Bengal stamp duty and registration charges, and assess long-term capital appreciation.",
    sections: [
      {
        h2: "Home Loan EMI & Affordability Modelling",
        content: "Understand your true monthly commitment before committing to a property purchase. Our Home Loan EMI and Affordability calculators incorporate prevailing lending rates across top Indian banks (SBI, HDFC, ICICI, Axis), factoring in loan tenures up to 30 years and healthy Debt-to-Income (DTI) ratios.",
      },
      {
        h2: "West Bengal Stamp Duty & Registration Computation",
        content: "Calculate government acquisition costs accurately. In West Bengal, stamp duty rates differ between Kolkata Municipal Corporation (KMC) jurisdiction and panchayat/municipality areas, alongside progressive rate slabs based on property valuation thresholds (above or below Rs 40 Lakhs). Our dedicated calculator delivers instant cost breakdowns.",
      },
      {
        h2: "Investment ROI, Rental Yield & Capital Appreciation",
        content: "For property investors evaluating residential or commercial assets in Rajarhat, New Town, and EM Bypass, our Rental Yield and ROI calculators project gross and net yields after property maintenance, municipal taxes, and vacancy allowances, helping you benchmark against other asset classes.",
      },
      {
        h2: "Rent vs Buy & Land Area Unit Conversion",
        content: "Compare the long-term wealth creation of homeownership versus renting in Kolkata, taking into account inflation, rental escalations, and equity accumulation. In addition, convert regional land units such as Cottah, Bigha, and Chatak into standard square feet and square meters effortlessly.",
      },
    ],
  },
  {
    path: "/blogs",
    rawTitle: "Real Estate Journal & Market Insights",
    description: "Read real estate insights, market analyses, and Kolkata property buying guides from the editorial team at Astittva Marketing.",
    h1: "Astittva Real Estate Journal: Kolkata Property Insights & Market Analysis",
    lead: "The Astittva Real Estate Journal delivers independent market intelligence, homebuyer guides, regulatory updates, and micro-market analyses for property buyers and investors across Kolkata, New Town, Rajarhat, and EM Bypass.",
    sections: [
      {
        h2: "Authoritative Micro-Market Analyses",
        content: "Our editorial team tracks pricing dynamics, absorption patterns, and infrastructure milestones across Kolkata's most sought-after corridors. Gain data-driven insights into New Town Action Areas I, II & III, the rapid development along Rajarhat Main Road, and emerging luxury enclaves along EM Bypass.",
      },
      {
        h2: "WBRERA Guidance & Legal Compliance Checklists",
        content: "Navigating real estate regulations requires clear, practical guidance. We break down the West Bengal Real Estate Regulatory Authority (WBRERA) rules, model agreement clauses, statutory builder obligations, and essential legal document checklists for both primary and secondary market acquisitions.",
      },
      {
        h2: "Infrastructure Watch: Metro Expansions & Smart City Growth",
        content: "Stay ahead of urban transformations shaping Kolkata property valuations. Read in-depth coverage of the Kolkata Metro Orange Line, Purple Line, Green Line underground expansion, Silicon Valley IT hub progress, and East Kolkata connectivity enhancements.",
      },
      {
        h2: "Homebuyer Education & Investment Strategies",
        content: "From choosing between under-construction and ready-to-move residences to optimizing tax exemptions under Section 54 of the Income Tax Act, our articles equip buyers, NRI investors, and first-time homeowners with actionable knowledge.",
      },
    ],
  },
  {
    path: "/news",
    rawTitle: "Kolkata Real Estate Market Intelligence",
    description: "Latest Kolkata real estate news, infrastructure developments, metro corridor expansions, and property market updates curated by Astittva Marketing.",
    h1: "Kolkata Real Estate Market Intelligence: Infrastructure & Industry Updates",
    lead: "Stay informed with curated real estate market intelligence, urban development updates, and macroeconomic trends impacting property valuations and residential demand across Greater Kolkata, New Town, and Rajarhat.",
    sections: [
      {
        h2: "Kolkata Infrastructure & Transit Growth Drivers",
        content: "Tracking the transformative urban infrastructure reshaping Kolkata's property landscape. From the Orange Line Metro linking New Town directly with Netaji Subhash Chandra Bose International Airport to the completed Maa Flyover ramps and EM Bypass widening, transit accessibility continues to drive residential capital appreciation.",
      },
      {
        h2: "Commercial IT SEZ Developments & Commercial Demand",
        content: "The continuous expansion of Salt Lake Sector V and the New Town Silicon Valley IT Hub attracts national and multinational technology enterprises. Commercial leasing velocity directly fuels residential rental yields and luxury housing absorption across surrounding action areas.",
      },
      {
        h2: "Regulatory Policy & Housing Finance Shifts",
        content: "Monitor government policy shifts, West Bengal stamp duty circulars, municipal building rule amendments, and RBI monetary policy interest rate adjustments. Our market intelligence desk synthesizes complex policy announcements into strategic takeaways for property buyers and investors.",
      },
      {
        h2: "Quarterly Market Trends & Supply-Demand Dynamics",
        content: "We analyze quarterly launch trends, inventory overhang levels, and absorption patterns across Kolkata's mid-income, premium, and ultra-luxury residential segments, providing investors with forward-looking clarity.",
      },
    ],
  },
  {
    path: "/about",
    rawTitle: "About Astittva Marketing",
    description: "Learn about Astittva Marketing, trusted real estate advisory in Kolkata. Expert guidance for residential purchases and investments across New Town and Rajarhat.",
    h1: "About Astittva Marketing: Kolkata Luxury Real Estate Advisory Practice",
    lead: "Astittva Marketing is a premier real estate advisory firm headquartered in New Town, Kolkata. Founded on the principles of institutional integrity, architectural discernment, and client advocacy, we guide discerning buyers, investors, and developers through high-value real estate transactions.",
    sections: [
      {
        h2: "Our Philosophy: Find Your Astittva, Build Your Legacy",
        content: "A home is more than an asset; it is the cornerstone of a family's legacy and personal identity. At Astittva, we approach every mandate with the gravity it deserves. We reject aggressive sales tactics, choosing instead to serve as trusted advisors who evaluate structural quality, developer integrity, and long-term livability.",
      },
      {
        h2: "Uncompromising Due Diligence & Developer Vetting",
        content: "Every project in our portfolio undergoes exhaustive scrutiny before representation. We verify land titles, WBRERA compliance, environmental sanctions, and past delivery records of developer partners. Our clients commit capital with total confidence, knowing every risk factor has been identified and mitigated.",
      },
      {
        h2: "Regional Expertise Across Kolkata's Prime Corridors",
        content: "Our senior consultants specialize in Kolkata's high-growth residential corridors: New Town Action Areas I, II, and III, Rajarhat, Salt Lake, EM Bypass, and South Kolkata. Our intimate understanding of neighborhood zoning, civic master plans, and upcoming transit links ensures our clients secure prime positioning.",
      },
      {
        h2: "Leadership & Advisory Headquarters",
        content: "Headquartered at PS IXL Building, 5th Floor, Room 511, Biswa Bangla Sarani, Atghara, New Town, Kolkata 700136. Our multidisciplinary team combines decades of experience in real estate transactions, architectural planning, financial modelling, and legal advisory.",
      },
    ],
  },
  {
    path: "/contact",
    rawTitle: "Contact Astittva Marketing",
    description: "Contact Astittva Marketing for real estate advisory in Kolkata, New Town and Rajarhat. Schedule a consultation with our experienced property consultants.",
    h1: "Contact Astittva Marketing: Kolkata Real Estate Consultants & Advisory",
    lead: "Schedule a private consultation with Kolkata's leading luxury real estate advisors. Whether you are seeking a premier residence in New Town, evaluating commercial assets along EM Bypass, or listing a secondary market property, our senior team provides responsive, confidential guidance.",
    sections: [
      {
        h2: "Direct Advisory Channels & Rapid Response",
        content: "Our advisory desk is accessible by telephone at +91 92303 74700, via WhatsApp, and by email at sales@astittva.in. Most inquiries receive a dedicated consultant response within 30 minutes during business hours. We coordinate private property walkthroughs, floor plan reviews, and personalized portfolio discussions at your convenience.",
      },
      {
        h2: "Corporate Office Location in New Town, Kolkata",
        content: "Visit our consultation suites located at PS IXL Building, 5th Floor, Room 511, Biswa Bangla Sarani, Atghara, New Town, Kolkata, West Bengal 700136. Our office is conveniently situated on the Major Arterial Road, minutes from Kolkata International Airport and Salt Lake Sector V, offering dedicated parking and modern meeting facilities.",
      },
      {
        h2: "Consultation Services & Tailored Advisory",
        content: "We provide comprehensive advisory services including primary homebuyer representation, secondary market title diligence, investment portfolio structuring, home loan eligibility evaluation, and West Bengal stamp duty calculations. Every consultation is strictly confidential and tailored to your timeline.",
      },
      {
        h2: "Advisory Hours & Appointment Booking",
        content: "Our corporate office and site inspection teams operate Monday through Saturday from 10:00 AM to 7:00 PM IST. Sunday private inspections are available upon prior appointment. Connect with us today to begin your real estate journey.",
      },
    ],
  },
  {
    path: "/career",
    rawTitle: "Careers at Astittva Marketing",
    description: "Join the Astittva Marketing advisory team in Kolkata. Explore career opportunities in luxury real estate consulting, marketing, and client relations.",
    h1: "Careers at Astittva Marketing: Luxury Real Estate Advisory Practice",
    lead: "Build an exceptional career with Astittva Marketing, Kolkata's premier luxury real estate advisory firm. We are expanding our professional practice and seeking passionate, high-integrity professionals across private client advisory, real estate marketing, secondary market consulting, and investment analysis.",
    sections: [
      {
        h2: "A Culture of Meritocracy, Ethics & Professional Excellence",
        content: "At Astittva Marketing, we believe that an advisory firm is defined by the quality and integrity of its people. We have built an empowering corporate culture where analytical rigor, client-first ethics, and entrepreneurial ambition are recognized and rewarded. Our team members work with Kolkata's leading developers and advise high-net-worth individuals.",
      },
      {
        h2: "Core Advisory Practice Areas",
        content: "Our practice encompasses diverse disciplines: Private Client Advisory (guiding premium homebuyers), Developer Representation (managing project launches and marketing strategies), Resale & Secondary Market Desk (managing title diligence and transactions), and Market Intelligence (researching pricing dynamics and micro-market trends).",
      },
      {
        h2: "Structured Mentorship & Professional Development",
        content: "We invest in the continuous growth of our team. New associates receive direct mentorship from seasoned real estate strategists, in-depth training on WBRERA regulatory frameworks, architectural blueprint analysis, and advanced negotiation practices. We foster long-term career trajectories with clear advancement milestones.",
      },
      {
        h2: "Industry-Leading Compensation & Incentives",
        content: "We offer competitive base compensation paired with industry-leading, transparent performance incentives. Team members enjoy a modern, collaborative workplace at our New Town headquarters, equipped with enterprise CRM tools and dedicated marketing resources.",
      },
    ],
  },
  {
    path: "/careers/jobs",
    rawTitle: "Job Openings & Vacancies in Kolkata",
    description: "Explore published career opportunities at Astittva Marketing. Join Kolkata's premier luxury real estate advisory team in New Town and Salt Lake.",
    h1: "Career Opportunities & Job Vacancies at Astittva Marketing Kolkata",
    lead: "Explore current career opportunities and job vacancies at Astittva Marketing in Kolkata. We are hiring talented professionals for our Private Client Advisory, Capital Markets, Digital Growth, and Secondary Market teams in New Town, Rajarhat, and Salt Lake.",
    sections: [
      {
        h2: "Active Career Opportunities in Kolkata Real Estate",
        content: "Astittva Marketing is actively recruiting for key roles including Senior Luxury Property Consultant, Relationship Manager (Private Wealth), Real Estate Content & Digital Strategist, and Resale Documentation Specialist. Each role offers direct exposure to high-profile developers, premium residential inventory, and discerning property buyers across West Bengal.",
      },
      {
        h2: "What We Look for in Prospective Candidates",
        content: "We value integrity, intellectual curiosity, articulate communication skills, and a genuine passion for real estate advisory. Whether you have years of experience in luxury property consulting or a proven track record in financial advisory and corporate sales, we look for individuals who take ownership of client outcomes.",
      },
      {
        h2: "Comprehensive Benefits & Career Progression",
        content: "Successful candidates receive competitive salary packages, transparent performance bonuses, corporate health benefits, and continuous professional development. Our fast-growing footprint in New Town provides rapid pathways to team leadership and practice management.",
      },
      {
        h2: "Application Process & Interview Stages",
        content: "To apply for open job vacancies, review the specific position requirements on this portal and submit your updated resume alongside a brief statement of purpose. Our recruitment committee conducts structured initial screenings followed by in-depth panel discussions at our New Town corporate office.",
      },
    ],
  },
  {
    path: "/locations/em-bypass",
    rawTitle: "Flats & Properties in EM Bypass Kolkata",
    description: "Explore luxury apartments & flats in EM Bypass Kolkata. Discover verified residential projects near Ruby, Science City & Kalikapur with Astittva Marketing.",
    h1: "Luxury Properties & Flats on EM Bypass, Kolkata",
    lead: "The Eastern Metropolitan (EM) Bypass is Kolkata's premier high-velocity growth artery, connecting North, South, and Salt Lake with luxury high-rises, Orange Line Metro connectivity, and world-class healthcare corridors.",
    sections: [
      {
        h2: "Locality Overview & Transit Advantage",
        content: "Spanning 21+ km from Ultadanga to Garia, EM Bypass offers panoramic views of the East Kolkata Wetlands, Orange Line metro connectivity to the Airport and Ruby Hospital, and signal-free access via Maa Flyover and AJC Bose Road Flyover. The corridor connects seamlessly with Park Circus, Ballygunge, and Salt Lake Sector V.",
      },
      {
        h2: "Featured Residential Developments on EM Bypass",
        content: "Showcasing premier residences including Ambuja Utpalaa (near Ruby), Niyasa, and luxury condominiums with 100% WBRERA compliance. These developments offer sky-residences, infinity pools, double-height terraces, and multi-tier clubhouses designed by international architectural practices.",
      },
      {
        h2: "Super-Specialty Healthcare & Social Infrastructure",
        content: "EM Bypass is Eastern India's healthcare capital, home to Apollo Gleneagles, Ruby General Hospital, Fortis Healthcare, Medica Superspecialty, and RN Tagore Hospital. Families also benefit from elite educational institutions including Calcutta International School, Heritage School, and top-tier retail hubs like Acropolis Mall.",
      },
      {
        h2: "Investment Potential & Rental Appreciation",
        content: "With the progressive operationalization of the Orange Line Metro line and continuous commercial expansion around Science City and Silver Spring, residential properties along EM Bypass command steady capital appreciation and premium rental yields from corporate executives and medical professionals.",
      },
    ],
  },
  {
    path: "/locations/new-alipore",
    rawTitle: "Properties in New Alipore Kolkata",
    description: "Discover luxury residences & flats in New Alipore Kolkata. Expert advisory, RERA-verified developments & South Kolkata property insights with Astittva.",
    h1: "Luxury Real Estate & Residences in New Alipore, Kolkata",
    lead: "New Alipore is South Kolkata's distinguished, green, affluent residential enclave planned with serene tree-lined avenues, boutique luxury condominiums, and Purple Line Majerhat metro connectivity.",
    sections: [
      {
        h2: "South Kolkata's Distinguished Enclave",
        content: "Minutes from Alipore, Chetla, and Taratala, New Alipore represents unparalleled capital preservation, quiet residential blocks A through O, and high-prestige living. It is one of Kolkata's most sought-after addresses for multi-generational families and prominent industrialists.",
      },
      {
        h2: "Connectivity & Purple Line Metro Infrastructure",
        content: "Benefiting from the newly commissioned Purple Line Metro station at Majerhat, Taratala Flyover, and Durgapur Bridge, New Alipore provides swift transit to Central Kolkata, Park Street, and the Vidyasagar Setu (Second Hooghly Bridge) connecting to Howrah.",
      },
      {
        h2: "Healthcare, Education & Elite Lifestyle Hubs",
        content: "Surrounded by leading medical institutions including The Calcutta Medical Research Institute (CMRI), BM Birla Heart Research Centre, and Kothari Medical Centre. Top educational schools such as Sri Sri Academy, Lakshmipat Singhania Academy, and South City International are minutes away, alongside South City Mall and Royal Calcutta Golf Club.",
      },
      {
        h2: "Boutique Residential Projects & Heritage Value",
        content: "Unlike the high-density developments of newer suburbs, New Alipore features low-density, high-privacy boutique developments offering 3 BHK, 4 BHK, and bespoke duplex penthouses. Land scarcity ensures exceptional resale value and steady capital appreciation.",
      },
    ],
  },
  {
    path: "/locations/new-town-rajarhat",
    rawTitle: "Properties in New Town & Rajarhat",
    description: "Find verified luxury flats & properties in New Town & Rajarhat Kolkata. Explore top projects, RERA verified homes, price trends & metro connectivity.",
    h1: "Luxury Properties & Real Estate in New Town & Rajarhat, Kolkata",
    lead: "India's award-winning planned smart city and Eastern India's largest technology corridor, spanning Action Areas I, II, III and Rajarhat with Silicon Valley IT parks, 480-acre Eco Park, and Orange Line Metro connectivity.",
    sections: [
      {
        h2: "Smart City Master Planning & Infrastructure",
        content: "Featuring underground utility tunnels, wide 6-lane expressways, dedicated cycling tracks, automated water supply systems, and solar street lighting. The Major Arterial Road and Orange Line Metro provide direct high-speed transit to Kolkata International Airport and Salt Lake Sector V.",
      },
      {
        h2: "Landmark Developments & Town Square Highlights",
        content: "Home to Town Square by Srijan Realty in Action Area I, Vinayak Amara, Vaanya, Sattvik Gateway, Newtown Villa, and premier corporate office complexes including PS New Town Square. Developments offer resort-style clubhouses, sports amenities, and high-efficiency green building certifications.",
      },
      {
        h2: "Thriving Commercial & Educational Ecosystem",
        content: "New Town hosts global technology campuses (TCS Gitanjali Park, Wipro, Cognizant, Infosys, Capgemini) and prestigious educational institutions including Presidency University Second Campus, St. Xavier's University, and Delhi Public School Megacity. World-class healthcare is provided by Tata Medical Center and Ohio Hospital.",
      },
      {
        h2: "Residential Demand & Long-Term Investment Dynamics",
        content: "Rajarhat and New Town continue to lead Kolkata in capital appreciation and rental yield velocity. With commercial tech hiring continuing at scale, residential demand for 2, 3, and 4 BHK luxury residences remains exceptionally robust.",
      },
    ],
  },
];

const CALCULATOR_PAGES = [
  {
    path: "/calculators/home-loan-emi",
    rawTitle: "Home Loan EMI Calculator",
    description: "Calculate your monthly home loan EMI, total interest, and complete loan amortization schedule for Kolkata property purchases.",
    h1: "Home Loan EMI Calculator for Kolkata Property Buyers",
    lead: "Estimate your monthly loan payments, total interest payable, and amortization schedule with precision. Our Home Loan EMI Calculator is tailored for Kolkata property buyers evaluating financing across leading banks including SBI, HDFC, ICICI, and Axis Bank.",
    sections: [
      {
        h2: "Understanding Home Loan EMI Calculation",
        content: "Your Equated Monthly Installment (EMI) consists of both principal repayment and interest components. In the initial years of a long-term mortgage, interest represents the majority of your payment. Our calculator uses the standard reducing balance formula to give you a transparent year-by-year amortization breakdown.",
      },
      {
        h2: "Optimizing Your Home Loan Strategy in Kolkata",
        content: "When purchasing an apartment in New Town, Rajarhat, or EM Bypass, structuring your loan tenure (typically 15 to 25 years) significantly impacts overall interest outflow. We advise maintaining an overall debt-to-income (DTI) ratio below 40% and exploring prepayments to curtail interest costs over the life of the loan.",
      },
      {
        h2: "Bank Partnerships & Advisory Support",
        content: "Astittva Marketing works closely with premier mortgage lenders in Kolkata to secure preferential interest rates, expedited processing, and pre-approved project clearances for our clients. Connect with our advisory desk for personalized financial assessment.",
      },
    ],
  },
  {
    path: "/calculators/property-affordability",
    rawTitle: "Affordability Calculator",
    description: "Determine the maximum property price you can comfortably afford in Kolkata based on monthly income, existing debts, and down payment.",
    h1: "Property Affordability Calculator for Kolkata Real Estate",
    lead: "Determine the maximum property price and comfortable budget you can afford in Kolkata based on your monthly household income, existing loan obligations, and available upfront down payment.",
    sections: [
      {
        h2: "How Property Affordability is Computed",
        content: "Affordability assessment calculates your disposable income after accounting for statutory deductions and existing liabilities. Financial institutions generally permit an EMI outflow of 40% to 50% of your net monthly income (Fixed Obligation to Income Ratio or FOIR).",
      },
      {
        h2: "Budgeting for Kolkata Property Acquisitions",
        content: "Beyond the base property agreement value, prospective buyers in Kolkata must budget approximately 7% to 8% for statutory charges, including West Bengal stamp duty, registration fees, maintenance deposits, and electricity connection charges. Our tool factors in these auxiliary costs.",
      },
      {
        h2: "Advisory Guidance on Sustainable Ownership",
        content: "Our property advisors assist families in finding the optimal balance between lifestyle aspirations and financial prudence across New Town, Rajarhat, and EM Bypass developments.",
      },
    ],
  },
  {
    path: "/calculators/property-roi",
    rawTitle: "Property ROI Calculator",
    description: "Calculate return on investment (ROI) and annualized IRR for residential and commercial property investments in Kolkata.",
    h1: "Property ROI Calculator: Real Estate Investment Returns",
    lead: "Calculate overall Return on Investment (ROI) and annualized internal rate of return (IRR) for residential and commercial property investments across New Town, Rajarhat, and Kolkata.",
    sections: [
      {
        h2: "Measuring Real Estate Returns Accurately",
        content: "Total property ROI blends recurring net rental yields with capital appreciation over your holding horizon. Factoring in acquisition expenses, holding costs, and exit taxes ensures realistic financial modeling.",
      },
      {
        h2: "High-ROI Micro-Markets in Greater Kolkata",
        content: "Corridors with impending metro transit links, such as New Town Action Area II & III and the EM Bypass arterial stretch, have historically demonstrated annualized capital appreciation between 7% and 11%, outperforming conventional fixed-income assets.",
      },
      {
        h2: "Strategic Portfolio Advisory",
        content: "Astittva Marketing provides institutional-grade portfolio advisory for domestic investors and Non-Resident Indians (NRIs) seeking wealth preservation and growth in Eastern India.",
      },
    ],
  },
  {
    path: "/calculators/rental-yield",
    rawTitle: "Rental Yield Calculator",
    description: "Calculate gross and net rental yield for residential flats in New Town, Rajarhat, and Kolkata.",
    h1: "Rental Yield Calculator for Kolkata Property Investors",
    lead: "Evaluate gross and net rental yield percentages for residential apartments and commercial properties across Kolkata, New Town, Rajarhat, and Salt Lake.",
    sections: [
      {
        h2: "Gross vs. Net Rental Yield Explained",
        content: "Gross yield simply divides annual rental earnings by total property cost. Net rental yield provides the true picture by deducting society maintenance fees, municipal property taxes, tenant management expenses, and vacancy allowances.",
      },
      {
        h2: "Rental Yield Benchmarks Across Kolkata Corridors",
        content: "In IT hubs like New Town Action Area I and Salt Lake Sector V, residential rental yields typically range between 3.5% and 4.8%, driven by sustained corporate housing demand. Fully furnished luxury units and co-living residences frequently command even higher yields.",
      },
      {
        h2: "Maximizing Your Rental Asset Performance",
        content: "Our asset management specialists guide property owners on optimal furnishing standards, corporate tenant leasing, and legal tenancy agreements to secure steady cash flow.",
      },
    ],
  },
  {
    path: "/calculators/rent-vs-buy",
    rawTitle: "Rent vs Buy Calculator",
    description: "Compare the total long-term financial cost of renting versus buying a home in Kolkata over 5 to 25 years.",
    h1: "Rent vs Buy Comparison Calculator for Kolkata",
    lead: "Analyze the long-term wealth impact of renting versus buying a residential flat in Kolkata. Model property appreciation, rental inflation, tax deductions, and home equity accumulation over a 5 to 25 year horizon.",
    sections: [
      {
        h2: "The True Economics of Renting vs Owning",
        content: "While renting preserves short-term liquidity, homeownership builds permanent tangible equity and protects against rental inflation. Over a 10 to 15 year window, capital appreciation combined with mortgage amortization consistently surpasses long-term rental expenditure.",
      },
      {
        h2: "Tax Advantages & Net Wealth Creation",
        content: "Under Indian Income Tax provisions (Section 24(b) for interest and Section 80C for principal), homeowner deductions lower effective mortgage borrowing costs, accelerating long-term net worth creation.",
      },
      {
        h2: "Personalized Advisory for Aspiring Homebuyers",
        content: "Our consultants assist young professionals and expanding families in evaluating transition timing from rented accommodations to verified homes in Kolkata.",
      },
    ],
  },
  {
    path: "/calculators/property-appreciation",
    rawTitle: "Appreciation Calculator",
    description: "Project future property value based on historical Kolkata real estate annual appreciation rates.",
    h1: "Property Capital Appreciation Calculator Kolkata",
    lead: "Forecast the compounding future valuation of your property across New Town, Rajarhat, EM Bypass, and Greater Kolkata based on historical compound annual growth rates (CAGR).",
    sections: [
      {
        h2: "How Real Estate Capital Appreciation Compounds",
        content: "Property appreciation is driven by infrastructural catalysts, municipal enhancements, transit expansion, and commercial job creation. Compounding over a 7 to 10 year cycle produces substantial equity multiples.",
      },
      {
        h2: "Historical Appreciation Trends in Kolkata",
        content: "Planned smart city regions like New Town and major arterial stretches along EM Bypass have delivered steady 6% to 10% annual valuation gains, reflecting disciplined master planning and sustained civic investment.",
      },
      {
        h2: "Exit Planning & Wealth Realization",
        content: "Astittva Marketing advises investors on optimal market cycles, secondary resale timing, and reinvestment strategies under Section 54 of the Income Tax Act.",
      },
    ],
  },
  {
    path: "/calculators/area-conversion",
    rawTitle: "Area Conversion Calculator",
    description: "Convert land and apartment area between Cottah, Sq Ft, Sq Yards, Bigha, Acres, and Sq Meters in West Bengal.",
    h1: "Real Estate Land & Area Conversion Calculator West Bengal",
    lead: "Convert traditional West Bengal land measurement units including Cottah (Katha), Bigha, and Chatak into standard modern units like Square Feet, Square Meters, Acres, and Square Yards instantly.",
    sections: [
      {
        h2: "Standard West Bengal Land Measurement Benchmarks",
        content: "In West Bengal real estate, 1 Cottah (Katha) equals exactly 720 Square Feet (or 16 Chataks). 20 Cottahs make 1 Bigha (14,400 Square Feet). Approximately 3 Bighas constitute 1 Acre (43,560 Square Feet).",
      },
      {
        h2: "Avoiding Unit Confusion in Property Deeds",
        content: "Legal deed documents, land revenue records (Porcha), and KMC/NKDA municipal sanction plans frequently alternate between imperial, metric, and regional units. Our conversion tool ensures error-free documentation checks.",
      },
      {
        h2: "Carpet vs Super Built-up Area Verification",
        content: "Beyond plot measurements, our advisory desk verifies actual RERA carpet area ratios for apartment buyers, ensuring complete transparency before deed execution.",
      },
    ],
  },
  {
    path: "/calculators/price-per-sqft",
    rawTitle: "Price Per Sq Ft Calculator",
    description: "Calculate price per square foot from total property price and carpet or super built-up area in Kolkata.",
    h1: "Price Per Square Foot Calculator: Kolkata Real Estate",
    lead: "Quickly determine the effective rate per square foot based on total property price and super built-up or carpet area for transparent comparison across residential developments in Kolkata.",
    sections: [
      {
        h2: "Carpet Area vs Super Built-up Rate Comparison",
        content: "Developers often quote rates on super built-up area (including common lobbies, elevators, and clubhouse amenities). Computing the effective price per square foot of usable carpet area allows honest project-to-project comparisons.",
      },
      {
        h2: "Current Square Foot Rates Across Kolkata Corridors",
        content: "Average residential prices range from Rs 4,500 – Rs 7,500 per sq ft in Rajarhat, Rs 6,500 – Rs 11,000 per sq ft in New Town, and Rs 9,000 – Rs 16,000+ per sq ft along EM Bypass and South Kolkata luxury enclaves.",
      },
      {
        h2: "Transparent Price Negotiation Advisory",
        content: "Astittva Marketing empowers buyers with granular price benchmarks, ensuring you secure fair market rates without unexpected add-on premiums.",
      },
    ],
  },
  {
    path: "/calculators/stamp-duty-registration",
    rawTitle: "Stamp Duty Calculator",
    description: "Calculate West Bengal stamp duty and registration fees for property purchases in Kolkata and New Town.",
    h1: "West Bengal Stamp Duty & Registration Charges Calculator",
    lead: "Compute exact government stamp duty and statutory registration fees applicable for property conveyances and sale deeds across Kolkata Municipal Corporation (KMC), NKDA, and Panchayat jurisdictions in West Bengal.",
    sections: [
      {
        h2: "Current West Bengal Stamp Duty Slabs & Structure",
        content: "In West Bengal, stamp duty rates depend on property market value (or circle rate, whichever is higher) and municipal classification. Standard rates are 6% for properties valued above Rs 40 Lakhs in municipal corporation areas (5% in panchayat areas), plus a statutory 1% registration fee.",
      },
      {
        h2: "Registration Process & E-Deed Stamping",
        content: "Property deeds in Kolkata are processed through the Directorate of Registration and Stamp Revenue (e-Nathikaran system). Timely calculation and e-payment prevent penalties during deed presentation at registry offices.",
      },
      {
        h2: "End-to-End Legal & Registration Desk",
        content: "Astittva Marketing's legal desk assists clients with title search reports, draft conveyance review, stamp duty token generation, and registry appointment coordination.",
      },
    ],
  },
  {
    path: "/calculators/construction-cost",
    rawTitle: "Construction Cost Calculator",
    description: "Estimate house and villa construction costs in Kolkata based on built-up area and construction quality grade.",
    h1: "House Construction Cost Calculator: Kolkata & Bengal",
    lead: "Estimate residential bungalow, villa, and house construction costs across Kolkata and West Bengal based on total built-up area, architectural specifications, and quality grade finish.",
    sections: [
      {
        h2: "Construction Cost Parameters in Greater Kolkata",
        content: "Civil construction costs vary from Rs 1,600 to Rs 2,200 per sq ft for standard quality, Rs 2,300 to Rs 3,200 per sq ft for premium specifications, and Rs 3,500+ per sq ft for luxury architectural finishes including Italian marble, VRV air-conditioning, and automation.",
      },
      {
        h2: "Cost Distribution: Civil, Electrical, Plumbing & Finishes",
        content: "Typically, RCC structural works account for 45% to 50% of the total budget, while internal MEP (mechanical, electrical, plumbing), flooring, joinery, and facade finishes account for the remaining 50% to 55%.",
      },
      {
        h2: "Architectural Planning & Contractor Vetting",
        content: "Our team collaborates with leading architectural consultants and structural engineers to ensure cost-efficient, structurally resilient residential construction.",
      },
    ],
  },
  {
    path: "/calculators/down-payment",
    rawTitle: "Down Payment Calculator",
    description: "Calculate required down payment, initial upfront cash, and loan financing balance for buying property in Kolkata.",
    h1: "Property Down Payment & Initial Cash Requirement Calculator",
    lead: "Calculate the exact upfront savings and down payment needed to purchase a home in Kolkata, factoring in RBI loan-to-value (LTV) limits, stamp duty, registration, and initial milestone payments.",
    sections: [
      {
        h2: "RBI Loan-to-Value (LTV) Guidelines Explained",
        content: "Under Reserve Bank of India mandates, banks finance up to 90% for property loans up to Rs 30 Lakhs, up to 80% for loans between Rs 30 Lakhs and Rs 75 Lakhs, and up to 75% for loans exceeding Rs 75 Lakhs. The remaining balance represents your mandatory own-contribution down payment.",
      },
      {
        h2: "Upfront Cash Reserve Planning for Homebuyers",
        content: "In addition to the 10% to 25% down payment, buyers must set aside liquidity for booking tokens, legal consultation fees, stamp duty, registration charges, and initial fit-out expenses.",
      },
      {
        h2: "Structured Payment Plan Advisory",
        content: "Astittva Marketing guides clients through construction-linked payment plans (CLP) and subvention schemes offered by premier Kolkata developers to ease upfront financial requirements.",
      },
    ],
  },
  {
    path: "/calculators/capital-gains-tax",
    rawTitle: "Capital Gains Tax Calculator",
    description: "Calculate short-term and long-term capital gains tax (LTCG / STCG) on real estate property sales in India.",
    h1: "Capital Gains Tax Calculator: Real Estate Sales in India",
    lead: "Calculate Long-Term Capital Gains (LTCG) and Short-Term Capital Gains (STCG) on real estate property transactions in India. Identify potential tax liabilities and evaluate reinvestment exemptions under Section 54 and 54EC.",
    sections: [
      {
        h2: "Understanding Real Estate Capital Gains Rules",
        content: "Properties held for more than 24 months are classified as long-term capital assets. Post-Union Budget amendments, LTCG on immovable property is taxed at 12.5% without indexation (or under grandfathered provisions for assets acquired prior to the cutoff date). STCG is taxed at applicable slab rates.",
      },
      {
        h2: "Tax Exemption Strategies Under Section 54 & 54EC",
        content: "Property sellers can legally minimize or eliminate capital gains liabilities by reinvesting net capital proceeds into another residential house property within statutory timelines under Section 54, or by investing in designated capital gains bonds under Section 54EC.",
      },
      {
        h2: "Secondary Market Resale & Tax Advisory",
        content: "Our resale advisory desk works closely with chartered accountants to help property sellers in Kolkata structure smooth, legally compliant transactions while optimizing net proceeds.",
      },
    ],
  },
];

function buildCrawlableBody(page) {
  const sectionsHtml = (page.sections || [])
    .map(
      (sec) => \`
      <section style="margin:28px 0;padding:24px;background:#FAF8F5;border:1px solid #EAE0D5;border-radius:6px;">
        <h2 style="font-family:'Cinzel',serif;font-size:22px;color:#3B0A11;margin-bottom:12px;">\${sec.h2}</h2>
        <p style="font-family:'Manrope',sans-serif;font-size:16px;line-height:1.75;color:#3A3A3A;">\${sec.content}</p>
      </section>\`
    )
    .join("\\n");

  return \`
    <div class="prerender-shell" style="max-width:1140px;margin:0 auto;padding:120px 24px 60px;font-family:'Manrope',sans-serif;color:#1C1C1C;">
      <header style="margin-bottom:40px;border-bottom:1px solid #EAE0D5;padding-bottom:30px;">
        <div style="font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#B4773F;margin-bottom:12px;font-weight:600;">
          Astittva Marketing · Kolkata Property Advisory
        </div>
        <h1 style="font-family:'Cinzel',serif;font-size:36px;color:#3B0A11;line-height:1.2;margin:0 0 16px;">
          \${page.h1}
        </h1>
        <p style="font-size:18px;line-height:1.75;color:#4A4A4A;max-width:860px;margin:0;">
          \${page.lead}
        </p>
      </header>

      <main>
        \${sectionsHtml}
      </main>

      <footer style="margin-top:60px;padding-top:30px;border-top:1px solid #EAE0D5;font-size:14px;color:#666;line-height:1.8;">
        <p><strong>Astittva Marketing Private Limited</strong> — Real Estate Consultants & Advisory</p>
        <p>Office: PS IXL Building, 5th Floor, Room 511, Biswa Bangla Sarani, Atghara, New Town, Kolkata 700136</p>
        <p>Direct Advisory: +91 92303 74700 · Email: sales@astittva.in</p>
        <p style="color:#B4773F;font-weight:600;margin-top:10px;">WBRERA Registration No: [FILL IN]</p>
      </footer>
    </div>
  \`;
}

function renderHtml(templateHtml, page) {
  const finalTitle = page.title || clampTitle(page.rawTitle);
  const finalDesc = clampDescription(page.description);
  const canonicalUrl = \`\${SITE_DOMAIN}\${page.path === "/" ? "/" : page.path}\`;
  const crawlableBody = buildCrawlableBody(page);

  let html = templateHtml;

  // Sanitize any phantom <h1> or <h2> inside <noscript> from older templates to avoid duplicate H1 warnings
  html = html.replace(/<noscript>[\\s\\S]*?<\\/noscript>/gi, (match) => {
    return match
      .replace(/<h1(\\s[^>]*)?>([\\s\\S]*?)<\\/h1>/gi, '<div style="font-size:24px;font-weight:700;margin-bottom:12px;color:#3B0A11;">$2</div>')
      .replace(/<h2(\\s[^>]*)?>([\\s\\S]*?)<\\/h2>/gi, '<div style="font-size:18px;font-weight:600;margin:16px 0 8px;color:#3B0A11;">$2</div>');
  });

  // Replace Title
  html = html.replace(/<title>.*?<\\/title>/i, \`<title>\${finalTitle}</title>\`);

  // Replace Meta Description
  html = html.replace(
    /<meta\\s+name="description"\\s+content=".*?"\\s*\\/?>/i,
    \`<meta name="description" content="\${finalDesc}" />\`
  );

  // Replace Canonical Link
  html = html.replace(
    /<link\\s+rel="canonical"\\s+href=".*?"\\s*\\/?>/i,
    \`<link rel="canonical" href="\${canonicalUrl}" />\`
  );

  // Replace Open Graph Tags
  html = html.replace(
    /<meta\\s+property="og:title"\\s+content=".*?"\\s*\\/?>/i,
    \`<meta property="og:title" content="\${finalTitle}" />\`
  );
  html = html.replace(
    /<meta\\s+property="og:description"\\s+content=".*?"\\s*\\/?>/i,
    \`<meta property="og:description" content="\${finalDesc}" />\`
  );
  html = html.replace(
    /<meta\\s+property="og:url"\\s+content=".*?"\\s*\\/?>/i,
    \`<meta property="og:url" content="\${canonicalUrl}" />\`
  );
  html = html.replace(
    /<meta\\s+property="og:image"\\s+content=".*?"\\s*\\/?>/i,
    \`<meta property="og:image" content="\${OG_IMAGE}" />\`
  );

  // Replace Twitter Tags
  html = html.replace(
    /<meta\\s+name="twitter:title"\\s+content=".*?"\\s*\\/?>/i,
    \`<meta name="twitter:title" content="\${finalTitle}" />\`
  );
  html = html.replace(
    /<meta\\s+name="twitter:description"\\s+content=".*?"\\s*\\/?>/i,
    \`<meta name="twitter:description" content="\${finalDesc}" />\`
  );
  html = html.replace(
    /<meta\\s+name="twitter:image"\\s+content=".*?"\\s*\\/?>/i,
    \`<meta name="twitter:image" content="\${OG_IMAGE}" />\`
  );

  // Inject crawlable content inside <div id="root">
  html = html.replace(
    /<div id="root">[\\s\\S]*?<\\/div>/i,
    \`<div id="root">\${crawlableBody}</div>\`
  );

  return html;
}

async function fetchDynamicPages() {
  const pages = [];

  // Fetch properties
  const properties = (await fetchJson("http://localhost:8000/api/properties?limit=100")) ||
    (await fetchJson("https://astittva-backend.onrender.com/api/properties?limit=100")) || [];

  for (const p of properties) {
    if (p.id && p.status === "published") {
      const loc = p.location || p.city || "Kolkata";
      const rawTitle = \`\${p.project_name} in \${loc}\`;
      pages.push({
        path: \`/properties/\${p.id}\`,
        rawTitle,
        description: \`Explore \${p.project_name} in \${loc}, Kolkata by \${p.builder || "Astittva Marketing"}. RERA-verified luxury homes with detailed floor plans.\`,
        h1: \`\${p.project_name} in \${loc}, Kolkata\`,
        lead: p.description || \`Luxury residential project in \${loc}, Kolkata represented by \${p.builder || "Astittva Marketing"}. Features verified architectural master planning and premier lifestyle amenities.\`,
        sections: [
          {
            h2: "Property Specifications & Configuration",
            content: \`Bedrooms: \${p.bedrooms || "Luxury configurations"} | Price: \${p.price_label || "Price on Request"} | Possession: \${p.possession_date || "Contact Advisor"} | RERA Registration: \${p.rera_number || "Verified"}. Designed for modern discerning living with premium finishes.\`,
          },
          {
            h2: "Prime Location & Transit Connectivity",
            content: \`Strategically positioned in \${loc}, Kolkata, offering rapid connectivity to major arterial corridors, Kolkata Metro networks, premier IT SEZ parks in Salt Lake Sector V and New Town, and Netaji Subhash Chandra Bose International Airport.\`,
          },
          {
            h2: "Regulatory Compliance & Advisory Representation",
            content: "Every residence represented by Astittva Marketing undergoes comprehensive West Bengal Real Estate Regulatory Authority (WBRERA) compliance verification, title deed scrutiny, and developer delivery analysis to ensure complete buyer security.",
          },
        ],
      });
    }
  }

  // Fetch blogs
  const blogs = (await fetchJson("http://localhost:8000/api/blogs?limit=100")) ||
    (await fetchJson("https://astittva-backend.onrender.com/api/blogs?limit=100")) || [];

  for (const b of blogs) {
    if (b.slug && b.status === "published") {
      const matchedArea = ["New Town", "Rajarhat", "Salt Lake", "EM Bypass", "Kolkata"].find((a) =>
        \`\${b.title} \${b.short_description || ""}\`.toLowerCase().includes(a.toLowerCase())
      ) || "Kolkata";

      const hasArea = new RegExp(\`\\\\bin\\\\s+(\${matchedArea}|Kolkata)\\\\b\`, "i").test(b.title);
      const rawTitle = hasArea ? b.title : \`\${b.title} in \${matchedArea}\`;

      pages.push({
        path: \`/blogs/\${b.slug}\`,
        rawTitle,
        description: b.short_description || \`Read \${b.title} from the real estate editorial team at Astittva Marketing Kolkata.\`,
        h1: b.title,
        lead: b.short_description || \`Astittva Editorial analysis for Kolkata real estate buyers and investors examining micro-market trends in \${matchedArea}.\`,
        sections: [
          {
            h2: "Editorial Summary & Key Insights",
            content: \`Published by \${b.author || "Astittva Editorial"} focusing on \${matchedArea}, Greater Kolkata. This analysis evaluates emerging price trends, buyer sentiment, and regulatory benchmarks for prospective property purchasers.\`,
          },
          {
            h2: "Micro-Market Real Estate Implications",
            content: "Understanding localized supply-demand dynamics, upcoming infrastructure developments, and connectivity improvements helps buyers and investors timing their entry or capital deployment in Kolkata's prime corridors.",
          },
          {
            h2: "Advisory Consultation & Guidance",
            content: "For detailed project-specific due diligence, floor plan analysis, or site inspections related to this topic, connect with our senior property advisory consultants at Astittva Marketing.",
          },
        ],
      });
    }
  }

  return pages;
}

async function main() {
  console.log("==========================================================");
  console.log("🚀 Starting Astittva Static Pre-Renderer (Task 4)");
  console.log("==========================================================");

  const baseBuildDir = path.resolve(__dirname, "../build");
  const templatePath = path.join(baseBuildDir, "index.html");

  if (!fs.existsSync(templatePath)) {
    console.error(\`❌ Template not found at: \${templatePath}. Run 'craco build' first.\`);
    return;
  }

  let templateHtml = fs.readFileSync(templatePath, "utf8");

  // Sanitize template immediately so old build noscript H1 is removed
  templateHtml = templateHtml.replace(/<noscript>[\\s\\S]*?<\\/noscript>/gi, (match) => {
    return match
      .replace(/<h1(\\s[^>]*)?>([\\s\\S]*?)<\\/h1>/gi, '<div style="font-size:24px;font-weight:700;margin-bottom:12px;color:#3B0A11;">$2</div>')
      .replace(/<h2(\\s[^>]*)?>([\\s\\S]*?)<\\/h2>/gi, '<div style="font-size:18px;font-weight:600;margin:16px 0 8px;color:#3B0A11;">$2</div>');
  });

  console.log(\`✓ Loaded and sanitized base template (\${templateHtml.length} bytes)\`);

  const dynamicPages = await fetchDynamicPages();
  console.log(\`✓ Loaded \${dynamicPages.length} dynamic property & blog pages\`);

  const allPages = [...STATIC_PAGES, ...CALCULATOR_PAGES, ...dynamicPages];
  console.log(\`✓ Pre-rendering total of \${allPages.length} public routes\`);

  const targetDirs = [
    baseBuildDir,
    path.resolve(__dirname, "../../web/build"),
    "C:\\\\Users\\\\lenovo\\\\Downloads\\\\astittva marketing\\\\frontend\\\\build",
  ];

  let generatedCount = 0;

  for (const page of allPages) {
    const renderedHtml = renderHtml(templateHtml, page);
    const cleanPath = page.path.replace(/^\\/+|\\/+$/g, "");

    for (const buildDir of targetDirs) {
      if (!fs.existsSync(buildDir)) continue;

      if (cleanPath === "") {
        // Root index.html
        fs.writeFileSync(path.join(buildDir, "index.html"), renderedHtml, "utf8");
      } else {
        // Nested route: {buildDir}/{route}/index.html
        const routeDir = path.join(buildDir, cleanPath);
        if (!fs.existsSync(routeDir)) {
          fs.mkdirSync(routeDir, { recursive: true });
        }
        fs.writeFileSync(path.join(routeDir, "index.html"), renderedHtml, "utf8");

        // Flat fallback: {buildDir}/{route}.html
        fs.writeFileSync(path.join(buildDir, \`\${cleanPath}.html\`), renderedHtml, "utf8");
      }
    }

    generatedCount++;
  }

  console.log(\`✅ Successfully generated \${generatedCount} static pre-rendered routes.\`);
  console.log("==========================================================");
}

if (require.main === module) {
  main().catch((err) => {
    console.error("❌ Pre-rendering failed:", err);
    process.exit(1);
  });
}

module.exports = { main, renderHtml };
`;

fs.writeFileSync(targetFile, newContent, 'utf8');
console.log('✓ Successfully wrote ' + targetFile);

