const fs = require('fs');
const path = require('path');

// 1. BlogsListPage
const listPath = path.resolve(__dirname, '../frontend/src/pages/BlogsListPage.jsx');
let lp = fs.readFileSync(listPath, 'utf8');
lp = lp.replace(/\r\n/g, '\n');

lp = lp.replace(
  'className="group luxury-card overflow-hidden flex flex-col"',
  'className="group bg-white rounded-2xl border border-[#E8DED2] overflow-hidden flex flex-col shadow-xs hover:border-[#D4A359] hover:-translate-y-1 hover:shadow-[0_16px_36px_-10px_rgba(184,115,51,0.18)] transition-all duration-400"'
);

lp = lp.replace(
  'className="w-8 h-8 !p-0"',
  'className="w-10 h-10 min-w-[40px] min-h-[40px] sm:w-11 sm:h-11 sm:min-w-[44px] sm:min-h-[44px] !p-0"'
);

fs.writeFileSync(listPath, lp, 'utf8');
console.log('BlogsListPage enhanced!');

// 2. BlogDetailPage
const detailPath = path.resolve(__dirname, '../frontend/src/pages/BlogDetailPage.jsx');
let dp = fs.readFileSync(detailPath, 'utf8');
dp = dp.replace(/\r\n/g, '\n');

dp = dp.replace(
  'aspect-[16/9] overflow-hidden bg-charcoal-2/40 border border-copper/15',
  'aspect-[16/9] overflow-hidden bg-white rounded-2xl border border-[#E8DED2] shadow-xs'
);

fs.writeFileSync(detailPath, dp, 'utf8');
console.log('BlogDetailPage enhanced!');

