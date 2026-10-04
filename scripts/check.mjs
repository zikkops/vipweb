// Typechecks, lints, tests and builds, then confirms the static export has the
// expected pages: the public site plus the dashboard, and no API routes.
// Usage: npm run check

import { execSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const EXPECTED_PAGES = 8; // home, 404 (two copies), _not-found and the 4 dashboard pages
const REQUIRED = ["dashboard", "dashboard/login", "dashboard/admin", "dashboard/account"].map((d) => `${d}/index.html`);
const FORBIDDEN = ["api"];
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
  run("Tests", "npm test");
  run("Database security (RLS) tests", "npm run test:rls");
  run("Build", "npm run build");
} catch {
  process.exit(1);
}

const problems = [];
const pages = countHtml(OUT);
if (pages !== EXPECTED_PAGES) problems.push(`expected ${EXPECTED_PAGES} HTML pages in ${OUT}/, found ${pages}`);
for (const page of REQUIRED) {
  if (!existsSync(path.join(OUT, page))) problems.push(`${OUT}/${page} is missing`);
}
for (const dir of FORBIDDEN) {
  if (existsSync(path.join(OUT, dir))) problems.push(`${OUT}/${dir} must not be in the build`);
}

if (problems.length) {
  console.error(`\n✖ Export check failed:\n  - ${problems.join("\n  - ")}`);
  process.exit(1);
}
console.log(`\n✔ Export check passed: ${pages} pages, dashboard included, no API routes.`);
