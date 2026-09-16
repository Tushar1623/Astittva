import { motion } from "framer-motion";
import { ROADMAP_STEPS } from "@/constants/siteData";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};

export default function ExpansionRoadmap({
  eyebrow = "Future Expansion",
  title = "From Kolkata to the world.",
  subtitle = "Built on a foundation of local trust, designed for global ambition. Our roadmap charts a deliberate expansion across India and into key international investment markets.",
  testId = "roadmap-section",
}) {
  return (
    <section data-testid={testId} className="py-16 sm:py-24">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
        <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="eyebrow-line justify-center mb-8" style={{ display: "inline-flex" }}>
            <span className="text-[10px] tracking-[0.5em] uppercase text-[#5F5F5F]">{eyebrow}</span>
          </div>
          <h2 className="section-title text-3xl sm:text-5xl lg:text-6xl leading-[1.05] mt-2">
            {title.includes("to the world") ? (
              <>
                From Kolkata<br />
                <span className="italic text-[#5F5F5F]">to the world.</span>
              </>
            ) : (
              title
            )}
          </h2>
          {subtitle && (
            <p className="mt-8 text-[#5F5F5F] font-light leading-[1.85] text-base">
              {subtitle}
            </p>
          )}
        </motion.div>

        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-0">
          <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-copper/40 to-transparent" />

          {ROADMAP_STEPS.map((step, i) => (
            <motion.div
              key={step.phase}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="relative text-center flex flex-col items-center"
              data-testid={`roadmap-step-${i}`}
            >
              <div className="w-24 h-24 rounded-full border border-[#E8DED2] bg-white flex items-center justify-center mb-8 relative group hover:border-copper transition-colors duration-500">
                <step.icon className="w-7 h-7 text-copper" strokeWidth={1} />
              </div>
              <div className="text-copper text-[10px] tracking-[0.4em] uppercase mb-3">{step.phase}</div>
              <div className="font-serif-display text-ivory text-lg max-w-[180px]">{step.area}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
