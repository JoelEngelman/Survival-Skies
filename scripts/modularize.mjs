import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const indexPath = path.join(root, "index.html");
const html = fs.readFileSync(indexPath, "utf8");

const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
const scriptMatches = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)];

if (!styleMatch || scriptMatches.length === 0) {
  throw new Error("Could not find the inline <style> and <script> blocks in index.html.");
}

const cssDir = path.join(root, "css");
const jsDir = path.join(root, "js");
fs.mkdirSync(cssDir, { recursive: true });
fs.mkdirSync(jsDir, { recursive: true });

// Keep the complete stylesheet intact first. This guarantees that modularization
// cannot accidentally change visual behaviour. It can be subdivided later.
fs.writeFileSync(path.join(cssDir, "main.css"), styleMatch[1].trim() + "\n");

const source = scriptMatches[0][1];

// Split the JavaScript at the existing large section headers. This preserves
// the original order and therefore preserves the game's dependency behaviour.
const header = /\/\*\s*=+\s*\n\s*([^\n*]+?)\s*\n(?:\s*[^\n*]+\s*\n)*\s*=+\s*\*\//g;
const matches = [...source.matchAll(header)];

const sections = [];
for (let i = 0; i < matches.length; i++) {
  const name = matches[i][1].trim();
  const start = matches[i].index;
  const end = i + 1 < matches.length ? matches[i + 1].index : source.length;
  const body = source.slice(start, end).trim();
  if (body) sections.push({ name, body });
}

if (!sections.length) {
  throw new Error("No JavaScript section headers were found.");
}

const used = new Set();
const files = [];
const slug = (name, index) => {
  const clean = name.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || `section-${index + 1}`;
  let out = clean;
  let n = 2;
  while (used.has(out)) out = `${clean}-${n++}`;
  used.add(out);
  return out;
};

sections.forEach((section, index) => {
  const filename = `${String(index + 1).padStart(2, "0")}-${slug(section.name, index)}.js`;
  fs.writeFileSync(path.join(jsDir, filename), section.body + "\n");
  files.push(filename);
});

// Replace the inline blocks with external files. The generated script tags are
// classic scripts and intentionally preserve the original execution order.
let output = html.replace(styleMatch[0], '<link rel="stylesheet" href="css/main.css">');
output = output.replace(scriptMatches[0][0], files.map(f => `  <script src="js/${f}"></script>`).join("\n"));

fs.writeFileSync(indexPath, output);

console.log(`Created css/main.css and ${files.length} JavaScript modules.`);
console.log(files.join("\n"));
