// Typechecks, lints and builds, then confirms the static export is the public
// site only: the expected number of pages and none of the dev-only dashboard.
// Usage: npm run check

import { execSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const EXPECTED_PAGES = 25;
const FORBIDDEN = ["dashboard", "api"];
const OUT = "out";

function run(label, command) {
  console.log(`\n▶ ${label}`);
  execSync(command, { stdio: "inherit" });
}

function countHtml(dir) {
  let n = 0;
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) n += countHtml(full);
    else if (entry.endsWith(".html")) n++;
  }
  return n;
}

try {
  run("Typecheck", "npx tsc --noEmit");
  run("Lint", "npx eslint .");
  run("Build", "npx next build");
} catch {
  process.exit(1);
}

const problems = [];
const pages = countHtml(OUT);
if (pages !== EXPECTED_PAGES) problems.push(`expected ${EXPECTED_PAGES} HTML pages in ${OUT}/, found ${pages}`);
for (const dir of FORBIDDEN) {
  if (existsSync(path.join(OUT, dir))) problems.push(`${OUT}/${dir} must not be in the public build`);
}

if (problems.length) {
  console.error(`\n✖ Export check failed:\n  - ${problems.join("\n  - ")}`);
  process.exit(1);
}
console.log(`\n✔ Export check passed: ${pages} pages, no dev-only routes.`);
