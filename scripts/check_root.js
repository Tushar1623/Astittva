const fs = require("fs");

const html = fs.readFileSync("frontend/build/locations/em-bypass/index.html", "utf8");
const rootMatch = html.match(/<div id="root">([\s\S]*?)<\/div>/);
console.log("Root content snippet in em-bypass:\n", rootMatch ? rootMatch[1].slice(0, 300) : "NONE");
