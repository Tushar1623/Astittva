const fs = require('fs');
const path = require('path');

// 1. Enhance ResalePage.jsx
const resalePagePath = path.resolve(__dirname, '../frontend/src/pages/ResalePage.jsx');
let rp = fs.readFileSync(resalePagePath, 'utf8');
rp = rp.replace(/\r\n/g, '\n');

// Luxury hero gradient
rp = rp.replace(
  'from-[#250306] via-[#35050A] to-[#1F0205]',
  'from-[#220508] via-[#2F080D] to-[#1C0306]'
);

// Card classes for featured
rp = rp.replace(
  'className="group bg-white rounded-xl border border-[#E8DED2] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#B87333]/50 transition-all duration-300 flex flex-col"',
  'className="group bg-white rounded-2xl border border-[#E8DED2] overflow-hidden shadow-xs hover:shadow-[0_16px_36px_-10px_rgba(184,115,51,0.18)] hover:border-[#D4A359] hover:-translate-y-1 transition-all duration-400 flex flex-col"'
);

// Card classes for all listings
rp = rp.replace(
  'className="group bg-white rounded-xl border border-[#E8DED2] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#B87333]/50 transition-all duration-300 flex flex-col"',
  'className="group bg-white rounded-2xl border border-[#E8DED2] overflow-hidden shadow-xs hover:shadow-[0_16px_36px_-10px_rgba(184,115,51,0.18)] hover:border-[#D4A359] hover:-translate-y-1 transition-all duration-400 flex flex-col"'
);

// Quick search box
rp = rp.replace(
  'className="bg-white/95 backdrop-blur-md rounded-xl p-4 sm:p-5 text-left border border-white/20 shadow-2xl max-w-5xl mx-auto"',
  'className="bg-white/95 backdrop-blur-md rounded-2xl p-6 text-left border border-[#E8DED2] shadow-[0_16px_40px_rgba(30,10,12,0.12)] max-w-5xl mx-auto"'
);

// Reset filter button
rp = rp.replace(
  'bg-[#35050A] text-white',
  'bg-[#2A080C] text-white hover:bg-[#3D0C13]'
);

fs.writeFileSync(resalePagePath, rp, 'utf8');
console.log('ResalePage enhanced!');

// 2. Enhance ResaleDetailPage.jsx
const resaleDetailPath = path.resolve(__dirname, '../frontend/src/pages/ResaleDetailPage.jsx');
let rdp = fs.readFileSync(resaleDetailPath, 'utf8');
rdp = rdp.replace(/\r\n/g, '\n');

// Image container
rdp = rdp.replace(
  'relative aspect-[16/10] bg-black/95 rounded-xl overflow-hidden border border-[#E8DED2] shadow-sm',
  'relative aspect-[16/10] bg-black/95 rounded-2xl overflow-hidden border border-[#E8DED2] shadow-xs'
);

// Sticky enquiry card
rdp = rdp.replace(
  'bg-white rounded-xl border border-[#E8DED2] p-6 sm:p-7 shadow-sm sticky top-[120px]',
  'bg-white rounded-2xl border border-[#E8DED2] p-7 shadow-xs sticky top-[120px]'
);

// Form inputs
rdp = rdp.replace(/h-11 px-3.5 bg-\[#FAF8F5\] border border-\[#E8DED2\] rounded-lg/g, 'h-11 px-3.5 bg-white border border-[#E8DED2] rounded-xl focus:border-[#D4A359] focus:ring-2 focus:ring-[#D4A359]/15');

fs.writeFileSync(resaleDetailPath, rdp, 'utf8');
console.log('ResaleDetailPage enhanced!');

