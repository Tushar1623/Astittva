const fs = require('fs');
const path = require('path');

const aboutPath = path.resolve(__dirname, '../frontend/src/pages/AboutPage.jsx');
let content = fs.readFileSync(aboutPath, 'utf8');
content = content.replace(/\r\n/g, '\n');

const oldValues = `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-copper/15">
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
          </div>`;

const newValues = `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: ShieldCheck, title: "Integrity", body: "Transparent advice. Always. Even when it costs us a transaction." },
              { icon: Award, title: "Craftsmanship", body: "We partner only with builders who treat construction as artistry." },
              { icon: Compass, title: "Foresight", body: "We don't sell what's hot. We surface what will compound." },
              { icon: Users, title: "Stewardship", body: "Long after the deal closes, we remain accountable to outcomes." },
            ].map((v) => (
              <div key={v.title} className="bg-white rounded-xl border border-[#E8DED2] p-8 sm:p-9 shadow-xs hover:border-[#D4A359] hover:-translate-y-1 hover:shadow-[0_16px_36px_-10px_rgba(184,115,51,0.14)] transition-all duration-300 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#E8DED2] flex items-center justify-center text-[#B87333] mb-6 shadow-2xs">
                  <v.icon className="w-6 h-6" strokeWidth={1.4} />
                </div>
                <h3 className="font-serif-display text-xl text-[#1C1C1C] mb-2.5 font-medium">{v.title}</h3>
                <p className="text-[#5F5F5F] font-light text-sm leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>`;

content = content.replace(oldValues, newValues);
fs.writeFileSync(aboutPath, content, 'utf8');
console.log('AboutPage enhanced!');

