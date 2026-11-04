const fs = require('fs');
const path = require('path');

function getFiles(dir, filter, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('build')) {
        getFiles(filePath, filter, fileList);
      }
    } else if (filter(file)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const jsxFiles = getFiles(path.resolve('frontend/src'), f => f.endsWith('.jsx') || f.endsWith('.js'));
console.log(`Found ${jsxFiles.length} JSX/JS files in frontend/src`);

const inputMissingLabel = [];
const smallButtons = [];
const missingImgAlt = [];
const fixedWidths = [];

for (const file of jsxFiles) {
  const rel = path.relative(path.resolve('.'), file);
  const content = fs.readFileSync(file, 'utf8');

  // 1. Check <input without aria-label or id or label
  const inputMatches = content.match(/<input\b[^>]*>/gi) || [];
  for (const input of inputMatches) {
    if (!input.includes('type="hidden"') && !input.includes('type="checkbox"') && !input.includes('type="radio"')) {
      if (!input.includes('aria-label') && !input.includes('id=') && !input.includes('name=')) {
        inputMissingLabel.push({ file: rel, tag: input.slice(0, 100) });
      }
    }
  }

  // 2. Check small button sizes (w-7, w-8, h-7, h-8 without min-w / min-h)
  const buttonMatches = content.match(/<button\b[^>]*>/gi) || [];
  for (const btn of buttonMatches) {
    if (/\b(w-7|h-7|w-8|h-8|w-6|h-6)\b/.test(btn) && !/\b(min-w-\[44px\]|p-3|p-4)\b/.test(btn)) {
      smallButtons.push({ file: rel, tag: btn.slice(0, 120) });
    }
  }

  // 3. Check <img> missing alt
  const imgMatches = content.match(/<img\b[^>]*>/gi) || [];
  for (const img of imgMatches) {
    if (!img.includes('alt=')) {
      missingImgAlt.push({ file: rel, tag: img.slice(0, 100) });
    }
  }

  // 4. Fixed pixel widths that might cause horizontal overflow on mobile
  const fixedWidthMatches = content.match(/(?:width|minWidth|maxWidth):\s*["']?(\d{4,})px["']?/gi) || [];
  for (const fw of fixedWidthMatches) {
    fixedWidths.push({ file: rel, match: fw });
  }
}

console.log('--- USABILITY ISSUES FOUND ---');
console.log(`Inputs potentially missing label/id: ${inputMissingLabel.length}`);
if (inputMissingLabel.length > 0) console.log(inputMissingLabel.slice(0, 5));

console.log(`\nSmall button touch targets (< 44px): ${smallButtons.length}`);
if (smallButtons.length > 0) console.log(smallButtons.slice(0, 10));

console.log(`\nImages missing alt attribute: ${missingImgAlt.length}`);
if (missingImgAlt.length > 0) console.log(missingImgAlt.slice(0, 5));

console.log(`\nLarge fixed widths: ${fixedWidths.length}`);
if (fixedWidths.length > 0) console.log(fixedWidths.slice(0, 5));

