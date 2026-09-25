// Packs the web version into one page for publishing as a claude.ai artifact:
//   node web/build.mjs  ->  web/dist/study-hub.html (+ web/dist/vendor/*)
import fs from "node:fs";
import accounting from "../public/lessons/accounting.js";
import sql from "../public/lessons/sql.js";
import formulas from "../public/lessons/formulas.js";

const root = new URL("../", import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), "utf8");
const out = new URL("web/dist/", root);
fs.mkdirSync(new URL("vendor/", out), { recursive: true });

const vendor = {
  "sql-asm.js": "node_modules/sql.js/dist/sql-asm.js",
  "marked.umd.js": "node_modules/marked/lib/marked.umd.js",
  "purify.min.js": "node_modules/dompurify/dist/purify.min.js",
  "pdf.min.js": "node_modules/pdfjs-dist/build/pdf.min.js",
  "pdf.worker.min.js": "node_modules/pdfjs-dist/build/pdf.worker.min.js",
  "jspdf.umd.min.js": "node_modules/jspdf/dist/jspdf.umd.min.js",
  "three.min.js": "node_modules/three/build/three.min.js", // loaded on demand by fx3d.js
};
const onDemand = ["pdf.worker.min.js", "three.min.js"];
for (const [name, src] of Object.entries(vendor)) fs.copyFileSync(new URL(src, root), new URL("vendor/" + name, out));

// Keep "</script>" inside embedded data from closing the tag.
const json = (v) => JSON.stringify(v).replace(/</g, "\\u003c");

const html = `<title>Study Hub</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=JetBrains+Mono:wght@400;600&family=Source+Sans+3:wght@400;600;700&family=Patrick+Hand&display=swap">
<style>
${read("web/app.css")}
</style>
<div id="app"></div>
${Object.keys(vendor).filter((n) => !onDemand.includes(n)).map((n) => `<script src="vendor/${n}"></script>`).join("\n")}
<script>
window.LESSONS = ${json({ accounting, sql, "language-arts": [], biology: [] })};
window.FORMULAS = ${json(formulas)};
window.PRACTICE = ${json({ schema: read("public/lessons/practice-db.sql"), data: read("public/lessons/practice-data.sql") })};
</script>
<script>
${read("web/fx3d.js")}
${read("web/app.js")}
</script>
`;
fs.writeFileSync(new URL("study-hub.html", out), html);
console.log(`Built web/dist/study-hub.html (${(html.length / 1024).toFixed(0)} KB)`);
