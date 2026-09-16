import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X, Download, Sparkles } from 'lucide-react';
import SEO from '../components/SEO';

import img1 from '../assets/site-images/img 1.png';
import img2 from '../assets/site-images/img 2.png';
import img3 from '../assets/site-images/img 3.png';
import img4 from '../assets/site-images/img 4.png';
import img5 from '../assets/site-images/img 5.png';

const galleryImages = [
  {
    id: 1,
    src: img1,
    title: 'Access Road & Land Demarcation',
    category: 'Ground Work',
    tag: 'Site Progress',
    description: 'Wide internal access road corridor being leveled and prepared for 30ft metal road infrastructure.',
  },
  {
    id: 2,
    src: img2,
    title: 'Open Land & Elevation View',
    category: 'Land Landscape',
    tag: 'Block A',
    description: 'Clear, high-land elevation facing green horizons near New Town Kolkata.',
  },
  {
    id: 3,
    src: img3,
    title: 'Leveling & Ground Development',
    category: 'Ground Work',
    tag: 'Development',
    description: 'Ongoing site clearing, plot leveling and internal road network alignment.',
  },
  {
    id: 4,
    src: img4,
    title: 'Surrounding Green Horizon & Skyline View',
    category: 'Surroundings',
    tag: 'New Town View',
    description: 'Panoramic view showing proximity to New Town high-rises and open green surroundings.',
  },
  {
    id: 5,
    src: img5,
    title: 'Boundary Boundary Posts & Future Green Zone',
    category: 'Land Landscape',
    tag: 'Greenery',
    description: 'Boundary demarcations and open green spaces planned across the 150-bigha development.',
  },
];

const categories = ['All Photos', 'Ground Work', 'Land Landscape', 'Surroundings'];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All Photos');
  const [selectedImage, setSelectedImage] = useState(null);

  const filteredImages = activeCategory === 'All Photos'
    ? galleryImages
    : galleryImages.filter((img) => img.category === activeCategory);

  return (
    <>
      <SEO 
        title="Official Site Gallery" 
        description="Explore real ground photos and site development progress of Ridhi Bhoomi near New Town Kolkata." 
        path="/gallery" 
      />

      {/* Header */}
      <section className="bg-[#0F1F17] text-white py-16 border-b border-[#24382B]">
        <div className="container-main text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#C88E00]/40 bg-[#C88E00]/10 text-xs font-bold uppercase tracking-widest text-[#C88E00]">
            <Sparkles size={14} className="text-[#388E3C]" />
            <span>Authentic Site Photographs</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-extrabold text-white">
            Project <span className="text-[#C88E00]">Gallery</span>
          </h1>
          <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto font-light">
            Real on-site photographs capturing land elevation, internal access road preparation, and surrounding New Town skyline.
          </p>
        </div>
      </section>

      {/* Filter Tabs & Grid */}
      <div className="section-padding bg-[#FAF8F3] min-h-[70vh] pb-24">
        <div className="container-main space-y-10">

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm ${
                  activeCategory === cat
                    ? 'bg-[#0F1F17] text-[#C88E00] border-2 border-[#C88E00] shadow-md'
                    : 'bg-white text-[#6E736B] border border-stone-200 hover:border-[#C88E00] hover:text-[#0F1F17]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <motion.div 
            layout
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {filteredImages.map((img) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="group relative rounded-2xl overflow-hidden bg-white border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedImage(img)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                    <img
                      src={img.src}
                      alt={img.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F1F17]/80 via-[#0F1F17]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C88E00] text-[#0F1F17] font-bold text-xs shadow">
                        <Eye size={14} /> View Photo
                      </span>
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full bg-[#0F1F17]/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-[#C88E00] border border-[#C88E00]/30 shadow-sm">
                        {img.tag}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-serif font-bold text-base text-[#0F1F17] group-hover:text-[#C88E00] transition-colors">
                      {img.title}
                    </h3>
                    <p className="text-xs text-[#6E736B] leading-relaxed line-clamp-2">
                      {img.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Brochure & Visit CTA */}
          <div className="p-8 rounded-3xl bg-[#0F1F17] text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-[#C88E00]/30 shadow-xl">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#C88E00]">Want to Inspect the Land in Person?</h3>
              <p className="text-xs sm:text-sm text-stone-300 font-light max-w-xl">
                We arrange guided site visits with free pick-up & drop facilities. Walk the ground and see the ongoing development live.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <a 
                href="/documents/RIDDHI%20BHUMI%20BROCURE.pdf" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-secondary bg-transparent text-white border-white/40 hover:border-white px-5 py-3 text-xs uppercase tracking-wider"
              >
                <Download size={14} /> Download Brochure
              </a>
              <a 
                href="/site-visit" 
                className="btn-gold px-6 py-3 text-xs uppercase tracking-wider"
              >
                Book Site Visit
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Full-Screen Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full bg-[#0F1F17] rounded-3xl overflow-hidden border border-[#C88E00]/40 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 text-white hover:bg-[#C88E00] hover:text-[#0F1F17] transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                <X size={20} />
              </button>

              <div className="relative aspect-[16/10] bg-black">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-6 bg-[#0F1F17] border-t border-[#24382B] space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-serif text-xl font-bold text-white">
                    {selectedImage.title}
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-[#C88E00]/20 text-[#C88E00] text-xs font-bold uppercase tracking-widest border border-[#C88E00]/40">
                    {selectedImage.tag}
                  </span>
                </div>
                <p className="text-xs text-stone-300 font-light leading-relaxed">
                  {selectedImage.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
