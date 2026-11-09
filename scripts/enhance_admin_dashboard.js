const fs = require('fs');
const path = require('path');

const adminDashPath = path.resolve(__dirname, '../frontend/src/pages/admin/AdminDashboardPage.jsx');
let content = fs.readFileSync(adminDashPath, 'utf8');
content = content.replace(/\r\n/g, '\n');

// 1. KPI Metric tiles
content = content.replace(
  /className="bg-charcoal p-5 rounded-\[6px\] border border-copper\/20 shadow-sm relative overflow-hidden group hover:border-copper\/40 transition-colors"/g,
  'className="bg-[#180509] p-6 rounded-xl border border-[#D4A359]/20 shadow-xs relative overflow-hidden group hover:border-[#D4A359]/40 hover:-translate-y-0.5 transition-all"'
);

// 2. Launchpad Grid
content = content.replace(
  /className="p-3\.5 rounded-\[4px\] border border-copper\/20 bg-charcoal-2\/30 hover:bg-charcoal-2\/60 hover:border-copper transition-all flex items-center gap-3 group"/g,
  'className="p-4 rounded-xl border border-[#D4A359]/20 bg-[#180509] hover:bg-[#22070D] hover:border-[#D4A359]/50 transition-all flex items-center gap-3.5 group shadow-xs"'
);

// 3. Section Containers
content = content.replace(
  /className="bg-charcoal-2\/30 border border-copper\/20 rounded-\[8px\] p-6 sm:p-7"/g,
  'className="bg-[#180509] border border-[#D4A359]/20 rounded-xl p-6 sm:p-7 shadow-xs"'
);

// 4. Sub-cards inside breakdown
content = content.replace(
  /className="bg-charcoal p-4 rounded-\[6px\] border border-copper\/15"/g,
  'className="bg-[#22070D] p-4 rounded-lg border border-[#D4A359]/15"'
);

fs.writeFileSync(adminDashPath, content, 'utf8');
console.log('AdminDashboardPage enhanced!');

