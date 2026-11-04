const fs = require('fs');
const code = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');
const lines = code.split('\n');
let depth = 0;
let inStr = false;
let strChar = '';
let inComment = false;
let inLineComment = false;
const depths = [];
for (let li = 0; li < lines.length; li++) {
  const line = lines[li];
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    const n = line[i + 1];
    if (inLineComment) continue;
    if (inComment) { if (c === '*' && n === '/') { inComment = false; i++; } continue; }
    if (inStr) { if (c === '\\') { i++; continue; } if (c === strChar) inStr = false; continue; }
    if (c === '/' && n === '/') { inLineComment = true; continue; }
    if (c === '/' && n === '*') { inComment = true; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = true; strChar = c; continue; }
    if (c === '{') depth++;
    if (c === '}') depth--;
  }
  inLineComment = false;
  depths.push({ line: li + 1, depth });
}
// print last 15
for (let i = depths.length - 15; i < depths.length; i++) {
  console.log(depths[i].line, depths[i].depth, lines[i].trim().slice(0, 60));
}
// find where depth first becomes 1 at end region (last time depth==0)
let lastZero = -1;
for (let i = 0; i < depths.length; i++) if (depths[i].depth === 0) lastZero = i;
console.log('last zero depth at line', depths[lastZero].line);
console.log('line content:', lines[lastZero].trim().slice(0,80));
