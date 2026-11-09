const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../frontend/src/pages/PropertyDetailPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/\r\n/g, '\n');

// 1. Gallery containers
content = content.replace(
  'aspect-[16/10] overflow-hidden bg-charcoal-2/40 border border-copper/15',
  'aspect-[16/10] overflow-hidden bg-white border border-[#E8DED2] rounded-xl shadow-xs'
);

content = content.replace(
  'className={`relative aspect-[4/3] lg:aspect-auto lg:flex-1 lg:min-h-0 overflow-hidden border ${activeImg === i ? "border-copper" : "border-copper/15"} transition bg-charcoal/30`}',
  'className={`relative aspect-[4/3] lg:aspect-auto lg:flex-1 lg:min-h-0 overflow-hidden rounded-lg border ${activeImg === i ? "border-[#B87333] ring-2 ring-[#B87333]/25" : "border-[#E8DED2]"} transition-all bg-[#FAF8F5]`}'
);

// 2. Specs grid
content = content.replace(
  '<div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-px bg-copper/15">',
  '<div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-3">'
);

content = content.replace(
  '<div key={k} className="bg-white border border-[#E8DED2] p-5">',
  '<div key={k} className="bg-white border border-[#E8DED2] rounded-xl p-5 shadow-2xs">'
);

// 3. Amenities
content = content.replace(
  '<span key={a} className="border border-copper/25 text-ivory/80 text-xs px-4 py-2 tracking-wider">{a}</span>',
  '<span key={a} className="border border-[#E8DED2] bg-white text-[#1C1C1C] text-xs px-4 py-2 tracking-wider rounded-lg shadow-2xs font-medium">{a}</span>'
);

// 4. Advisory & Financial planning cards
content = content.replace(
  'className="p-4 border border-copper/20 bg-charcoal-2/30 hover:border-copper/50 transition-colors group"',
  'className="p-5 border border-[#E8DED2] bg-white rounded-xl hover:border-[#D4A359] hover:shadow-xs transition-all group"'
);
content = content.replace(
  'className="p-4 border border-copper/20 bg-charcoal-2/30 hover:border-copper/50 transition-colors group"',
  'className="p-5 border border-[#E8DED2] bg-white rounded-xl hover:border-[#D4A359] hover:shadow-xs transition-all group"'
);

// 5. Enquiry aside card
content = content.replace(
  '<div className="sticky top-28 luxury-card p-8">',
  '<div className="sticky top-28 bg-white rounded-2xl border border-[#E8DED2] p-8 shadow-xs">'
);
content = content.replace(
  '<div className="overline mb-3">Enquire</div>',
  '<div className="text-[10px] tracking-[0.3em] uppercase text-[#B87333] font-semibold mb-3">Enquire</div>'
);
content = content.replace(
  '<h3 className="font-display text-2xl text-ivory mb-2 font-light">Request details</h3>',
  '<h3 className="font-serif-display text-2xl text-[#1C1C1C] mb-2 font-medium">Request Details</h3>'
);
content = content.replace(
  '<p className="text-ivory/60 text-sm mb-6 font-light">A senior advisor will share the brochure, pricing & site visit slots.</p>',
  '<p className="text-[#737373] text-sm mb-6 font-light">A senior advisor will share the brochure, pricing & site visit slots.</p>'
);

// Use input-consultation for cleaner inputs
content = content.replace(/className="input-luxury"/g, 'className="input-consultation"');

// 6. Financial Planning widget
content = content.replace(
  '<div className="luxury-card p-6 mt-6 space-y-4">',
  '<div className="bg-white rounded-2xl border border-[#E8DED2] p-6 mt-6 space-y-4 shadow-xs">'
);
content = content.replace(
  '<div className="text-[10px] tracking-[0.25em] uppercase text-copper font-semibold">',
  '<div className="text-[10px] tracking-[0.25em] uppercase text-[#B87333] font-semibold">'
);
content = content.replace(
  '<h4 className="font-serif-display text-lg text-ivory">Financial Planning Tools</h4>',
  '<h4 className="font-serif-display text-xl text-[#1C1C1C] font-medium">Financial Planning Tools</h4>'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('PropertyDetailPage successfully enhanced!');

