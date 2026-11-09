const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../frontend/src/pages/HomePage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Ensure PropertyCard is imported
content = content.replace(
  'import { pickPropertyFallback } from "@/components/PropertyCard";',
  'import PropertyCard, { pickPropertyFallback } from "@/components/PropertyCard";'
);

// 2. Pillars section styling
const oldPillars = `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.05]">
            {PILLARS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white p-7 sm:p-10 lg:p-12 group"
              >
                <p.icon className="w-7 h-7 text-copper mb-10 transition-colors duration-500" strokeWidth={1} />
                <h3 className="font-serif-display text-2xl text-ivory mb-4">{p.title}</h3>
                <p className="text-[#5F5F5F] leading-[1.7] font-light text-[15px]">{p.body}</p>
              </motion.div>
            ))}
          </div>`;

const newPillars = `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {PILLARS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-xl border border-[#E8DED2] p-8 sm:p-10 lg:p-11 group hover:border-[#D4A359] hover:-translate-y-1 hover:shadow-[0_16px_36px_-10px_rgba(184,115,51,0.14)] shadow-[0_2px_10px_rgba(28,28,28,0.03)] transition-all duration-500 flex flex-col"
              >
                <div className="w-14 h-14 rounded-xl bg-[#FAF8F5] border border-[#E8DED2] flex items-center justify-center text-[#B87333] mb-8 group-hover:bg-[#2A080C] group-hover:text-[#D4A359] group-hover:border-[#2A080C] transition-all duration-500 shadow-xs">
                  <p.icon className="w-7 h-7" strokeWidth={1.3} />
                </div>
                <h3 className="font-serif-display text-2xl text-[#1C1C1C] mb-3 group-hover:text-[#B87333] transition-colors duration-300 leading-snug">{p.title}</h3>
                <p className="text-[#5F5F5F] leading-[1.75] font-light text-[15px]">{p.body}</p>
              </motion.div>
            ))}
          </div>`;

// 3. Featured projects section using PropertyCard
const oldProjectsRegex = /\{\/\* ===================== FEATURED PROJECTS ===================== \*\/\}[\s\S]*?\{\/\* ===================== REGULATORY RESOURCES/;

const newProjects = `{/* ===================== FEATURED PROJECTS ===================== */}
      <section data-testid="projects-section" className="py-16 sm:py-24 bg-[#FAF8F5]">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div {...fadeUp} className="mb-10 sm:mb-14 max-w-3xl">
            <div className="eyebrow-line mb-8">
              <span className="text-[10px] tracking-[0.5em] uppercase text-[#5F5F5F]">Featured Projects</span>
            </div>
            <h2 className="section-title text-3xl sm:text-5xl lg:text-6xl leading-[1.05]">
              A handpicked portfolio.<br />
              <span className="italic text-[#5F5F5F]">Verified. Premium. Ready.</span>
            </h2>
          </motion.div>

          {projects.length === 0 ? (
            <div className="text-center py-24 border border-[#E8DED2] bg-white rounded-xl">
              <p className="text-[#737373] italic font-serif-display text-lg mb-8">New projects are being curated.</p>
              <Link to="/contact" className="btn-outline">Speak to an Advisor</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {projects.map((p, i) => (
                <PropertyCard key={p.id} property={p} index={i} variant="featured" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===================== REGULATORY RESOURCES`;

// 4. Kolkata Facts section
const oldFacts = `<div className="lg:col-span-7 grid grid-cols-2 gap-px bg-white/[0.06] self-start">
              {KOLKATA_FACTS.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  className="bg-[#F5F1EC] p-8 sm:p-10 lg:p-14 group hover:bg-white transition-colors duration-500"
                >
                  <div className="font-serif-display text-[3.5rem] sm:text-[5rem] lg:text-[6rem] leading-[0.95] tracking-[-0.02em] text-ivory mb-4 sm:mb-6">
                    {f.stat}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-px bg-copper" />
                    <div className="text-[#3A3A3A] text-[11px] sm:text-xs tracking-[0.2em] uppercase">{f.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>`;

const newFacts = `<div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 self-start">
              {KOLKATA_FACTS.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  className="bg-white rounded-xl border border-[#E8DED2] p-8 sm:p-10 group hover:border-[#D4A359] hover:shadow-[0_12px_32px_-8px_rgba(184,115,51,0.12)] transition-all duration-500 shadow-xs"
                >
                  <div className="font-serif-display text-[3.25rem] sm:text-[4.5rem] lg:text-[5.25rem] leading-[0.95] tracking-[-0.02em] text-[#1C1C1C] mb-4 group-hover:text-[#B87333] transition-colors duration-300">
                    {f.stat}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-px bg-[#B87333]" />
                    <div className="text-[#3A3A3A] text-[11px] sm:text-xs tracking-[0.2em] uppercase font-medium">{f.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>`;

// Normalize line endings for replacement
const normalize = (str) => str.replace(/\r\n/g, '\n');

content = normalize(content);
content = content.replace(normalize(oldPillars), normalize(newPillars));
content = content.replace(oldProjectsRegex, newProjects);
content = content.replace(normalize(oldFacts), normalize(newFacts));

fs.writeFileSync(filePath, content, 'utf8');
console.log('Homepage successfully enhanced!');

