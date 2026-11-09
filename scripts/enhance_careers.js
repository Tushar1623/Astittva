const fs = require('fs');
const path = require('path');

const careerPagePath = path.resolve(__dirname, '../frontend/src/pages/CareerPage.jsx');
let cp = fs.readFileSync(careerPagePath, 'utf8');
cp = cp.replace(/\r\n/g, '\n');

// 1. Luxury hero gradient
cp = cp.replace(
  'from-[#250306] via-[#35050A] to-[#1F0205]',
  'from-[#220508] via-[#2F080D] to-[#1C0306]'
);

// 2. Why Astittva cards
cp = cp.replace(
  /className="bg-white p-7 sm:p-8 rounded-\[8px\] border border-\[#E8DED2\] shadow-\[0_4px_20px_rgba\(0,0,0,0.03\)\] hover:border-\[#B87333\]\/40 transition-colors"/g,
  'className="bg-white p-8 rounded-xl border border-[#E8DED2] shadow-xs hover:border-[#D4A359] hover:-translate-y-1 hover:shadow-[0_16px_36px_-10px_rgba(184,115,51,0.14)] transition-all duration-300"'
);

// 3. Job cards
cp = cp.replace(
  'className="bg-white p-5 sm:p-6 rounded-[6px] border border-[#E8DED2] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#B87333]/50 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.02)]"',
  'className="bg-white p-6 sm:p-7 rounded-xl border border-[#E8DED2] flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:border-[#D4A359] hover:shadow-xs transition-all shadow-2xs"'
);

// 4. Form container
cp = cp.replace(
  'className="bg-white p-8 sm:p-10 lg:p-12 rounded-[10px] border border-[#E8DED2] shadow-[0_12px_40px_rgba(0,0,0,0.05)]"',
  'className="bg-white p-8 sm:p-10 lg:p-12 rounded-2xl border border-[#E8DED2] shadow-[0_16px_40px_rgba(30,10,12,0.06)]"'
);

fs.writeFileSync(careerPagePath, cp, 'utf8');
console.log('CareerPage enhanced!');

