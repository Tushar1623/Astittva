import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Award, ShieldCheck, Compass, Users } from "lucide-react";
import Seo from "@/components/Seo";

const TEXTURE = "https://static.prod-images.emergentagent.com/jobs/50ac1e2c-4ee3-4d48-ad5e-fd37063ae3c0/images/1f5da7f44ad5aab6c1f6ab3c12df3ec89723084c1042e95749a6b4658dcffcc6.png";

export default function AboutPage() {
  return (
    <div data-testid="about-page" className="pt-28 pb-16 sm:pt-32 sm:pb-24">
      <Seo
        title="About Astittva Marketing · Luxury Real Estate Advisory"
        description="Astittva Marketing is a luxury real estate advisory representing India's most trusted developers. We curate verified residential, commercial and investment opportunities for discerning clients across Kolkata, New Town, Rajarhat and beyond."
        path="/about"
        keywords="Astittva Marketing about, luxury real estate advisory Kolkata, trusted real estate consulting"
      />
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
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
            Curated real estate opportunities across most promising destinations.
          </p>
          <div className="copper-divider mt-10" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 mt-20">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 className="font-display font-light text-2xl sm:text-3xl text-ivory mb-6">Our Mission</h2>
            <p className="text-ivory/70 leading-relaxed font-light text-lg">
              At Astittva, our mission is to help buyers and investors make confident real estate decisions through verified properties, expert consultation, and trusted guidance.
            </p>
            <p className="text-ivory/65 leading-relaxed font-light mt-4">
              We believe a property purchase is far more than a transaction — it's the foundation of a family's future or a portfolio's resilience. Every relationship we build starts with that gravity in mind.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 className="font-display font-light text-2xl sm:text-3xl text-ivory mb-6">Our Vision</h2>
            <p className="text-ivory/70 leading-relaxed font-light text-lg">
              We are building a growing real estate network across Greater Kolkata, West Bengal, India, and global investment destinations — without ever diluting the personal trust that defines us.
            </p>
            <p className="text-ivory/65 leading-relaxed font-light mt-4">
              From a single advisory office in New Town to a transnational platform — our roadmap is deliberate, our standards uncompromising.
            </p>
          </motion.div>
        </div>

        {/* Values */}
        <section className="mt-20 sm:mt-32 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center max-w-2xl mx-auto mb-16">
            <div className="overline mb-4">Our Values</div>
            <h2 className="font-display font-light text-3xl sm:text-4xl text-ivory">The four pillars of how we work.</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-copper/15">
            {[
              { icon: ShieldCheck, title: "Integrity", body: "Transparent advice. Always. Even when it costs us a transaction." },
              { icon: Award, title: "Craftsmanship", body: "We partner only with builders who treat construction as artistry." },
              { icon: Compass, title: "Foresight", body: "We don't sell what's hot. We surface what will compound." },
              { icon: Users, title: "Stewardship", body: "Long after the deal closes, we remain accountable to outcomes." },
            ].map((v) => (
              <div key={v.title} className="bg-charcoal p-10">
                <v.icon className="w-8 h-8 text-copper mb-5" strokeWidth={1.2} />
                <h3 className="font-display text-ivory text-xl mb-3 font-normal">{v.title}</h3>
                <p className="text-ivory/60 font-light text-sm leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="mt-20 sm:mt-32 relative overflow-hidden border border-copper/20 p-12 sm:p-20 text-center"
        >
          <div className="absolute inset-0 opacity-20"><img src={TEXTURE} alt="" className="w-full h-full object-cover" /></div>
          <div className="absolute inset-0 bg-charcoal/85" />
          <div className="relative">
            <h3 className="font-display font-light text-2xl sm:text-4xl text-ivory mb-6">Begin the conversation.</h3>
            <p className="text-ivory/65 font-light max-w-xl mx-auto mb-10">Whether you're investing your first crore or your fiftieth, a 30-minute call with our team will reframe what's possible.</p>
            <Link to="/contact" className="btn-primary">Book a Private Consultation</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
