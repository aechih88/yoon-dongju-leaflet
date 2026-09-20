import fs from "node:fs";
import path from "node:path";

const projectHost = (
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL ||
  ""
).toLowerCase();

const sourceDir = projectHost.includes("admin-v2") ? "admin" : "public";
const outDir = "dist";

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
fs.cpSync(sourceDir, outDir, { recursive: true });

function injectBeforeLast(file, marker, patchFile) {
  const patch = fs.readFileSync(patchFile, "utf8");
  let src = fs.readFileSync(file, "utf8");
  const i = src.lastIndexOf(marker);
  if (i < 0) throw new Error(`Injection marker not found in ${file}`);
  src = src.slice(0, i) + "\n" + patch + "\n" + src.slice(i);
  fs.writeFileSync(file, src);
}

if (sourceDir === "admin") {
  injectBeforeLast(path.join(outDir, "index.html"), "})();</script>", path.join("patches", "admin-image-transform.js"));
} else {
  injectBeforeLast(path.join(outDir, "public-render.js"), "})();", path.join("patches", "public-image-transform.js"));
}

console.log(`Vercel project host: ${projectHost || "(unknown)"}`);
console.log(`Deploying ${sourceDir}/ -> ${outDir}/ with image transform controls`);
