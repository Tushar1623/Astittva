const fs = require('fs');
const path = require('path');

function updateAbout(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  const oldTarget = `        {/* Header Intro */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="overline mb-4">About Astittva</div>
          <h1 className="font-display font-light text-3xl sm:text-5xl lg:text-6xl text-ivory tracking-tight max-w-2xl leading-[1.1]">
            <span className="block">
              Find Your{" "}
              <span
                className="italic"
                style={{
                  color: "#B97832",
                  fontWeight: 600,
                  fontSize: "1.05em",
                  fontFamily: "'Cormorant Garamond', serif",
                }}
              >
                Astittva.
              </span>
            </span>
            <span className="block">Build Your Legacy.</span>
          </h1>
          <p className="mt-6 text-ivory/70 font-light text-lg sm:text-xl max-w-3xl leading-relaxed">
            Curated real estate opportunities across the most promising destinations.
          </p>
          <div className="copper-divider mt-10" />
        </motion.div>`;

  const newTarget = `        {/* Header Intro */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="overline mb-4">{isContactRoute ? "Contact Astittva" : "About Astittva"}</div>
          <h1 className="font-display font-light text-3xl sm:text-5xl lg:text-6xl text-ivory tracking-tight max-w-3xl leading-[1.1]">
            {isContactRoute ? (
              <>
                <span className="block">Contact Astittva Marketing</span>
                <span className="block text-2xl sm:text-3xl text-ivory/80 font-normal mt-2">
                  Connect with Kolkata&apos;s Luxury Real Estate Consultants
                </span>
              </>
            ) : (
              <>
                <span className="block">
                  About Astittva Marketing — Find Your{" "}
                  <span
                    className="italic"
                    style={{
                      color: "#B97832",
                      fontWeight: 600,
                      fontSize: "1.05em",
                      fontFamily: "'Cormorant Garamond', serif",
                    }}
                  >
                    Astittva.
                  </span>
                </span>
                <span className="block">Build Your Legacy.</span>
              </>
            )}
          </h1>
          <p className="mt-6 text-ivory/70 font-light text-lg sm:text-xl max-w-3xl leading-relaxed">
            {isContactRoute
              ? "Schedule a private consultation with our Kolkata property advisory team. Whether inquiring about luxury residences in New Town, Rajarhat, or EM Bypass, we are here to guide your real estate journey."
              : "Astittva Marketing is Kolkata's premier luxury real estate advisory firm. We curate verified residential and investment opportunities across New Town, Rajarhat, EM Bypass, and South Kolkata with uncompromising diligence."}
          </p>
          <div className="copper-divider mt-10" />
        </motion.div>`;

  const normalizedContent = content.replace(/\r\n/g, '\n');
  const normalizedOld = oldTarget.replace(/\r\n/g, '\n');
  const normalizedNew = newTarget.replace(/\r\n/g, '\n');

  if (normalizedContent.includes(normalizedOld)) {
    const updated = normalizedContent.replace(normalizedOld, normalizedNew);
    // preserve CRLF if original had it
    const finalContent = content.includes('\r\n') ? updated.replace(/\n/g, '\r\n') : updated;
    fs.writeFileSync(filePath, finalContent, 'utf8');
    console.log(`✓ Updated ${filePath}`);
  } else {
    console.error(`❌ Could not find target in ${filePath}`);
  }
}

function updateCareer(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  const oldTarget = `          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif-display text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.15] mb-6"
          >
            Shape the Future of <br className="hidden sm:inline" />
            <span className="italic font-light text-[#E8DCD5]">Luxury Real Estate Advisory</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-[14px] sm:text-[16px] lg:text-[17px] font-sans text-[#E8DCD5]/85 leading-relaxed font-light mb-8"
          >
            We are building Eastern India&apos;s most respected real estate marketing, architectural branding,
            and private client advisory firm. Our formal career application portal is launching shortly.
          </motion.p>`;

  const newTarget = `          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-serif-display text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.15] mb-6"
          >
            Careers at Astittva Marketing <br className="hidden sm:inline" />
            <span className="italic font-light text-[#E8DCD5]">Luxury Real Estate Advisory Practice</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-[14px] sm:text-[16px] lg:text-[17px] font-sans text-[#E8DCD5]/85 leading-relaxed font-light mb-8"
          >
            Explore careers at Astittva Marketing, Kolkata&apos;s premier luxury real estate advisory firm. We are building Eastern India&apos;s most respected real estate marketing, architectural branding,
            and private client advisory practice. Browse our active vacancies or submit your profile for ongoing career opportunities.
          </motion.p>`;

  const normalizedContent = content.replace(/\r\n/g, '\n');
  const normalizedOld = oldTarget.replace(/\r\n/g, '\n');
  const normalizedNew = newTarget.replace(/\r\n/g, '\n');

  if (normalizedContent.includes(normalizedOld)) {
    const updated = normalizedContent.replace(normalizedOld, normalizedNew);
    const finalContent = content.includes('\r\n') ? updated.replace(/\n/g, '\r\n') : updated;
    fs.writeFileSync(filePath, finalContent, 'utf8');
    console.log(`✓ Updated ${filePath}`);
  } else {
    console.error(`❌ Could not find target in ${filePath}`);
  }
}

updateAbout('frontend/src/pages/AboutPage.jsx');
updateAbout('web/src/pages/AboutPage.jsx');
updateCareer('frontend/src/pages/CareerPage.jsx');
updateCareer('web/src/pages/CareerPage.jsx');

