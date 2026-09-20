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

function readPatch(file) {
  if (fs.existsSync(file)) return fs.readFileSync(file, "utf8");
  const chunks = [];
  for (let i = 0; ; i++) {
    const p = file + ".b64." + i;
    if (!fs.existsSync(p)) break;
    chunks.push(fs.readFileSync(p, "utf8").trim());
  }
  if (!chunks.length) throw new Error("Patch not found: " + file);
  return Buffer.from(chunks.join(""), "base64").toString("utf8");
}

function injectBeforeLast(file, marker, patchFile) {
  const patch = readPatch(patchFile);
  let src = fs.readFileSync(file, "utf8");
  const i = src.lastIndexOf(marker);
  if (i < 0) throw new Error(`Injection marker not found in ${file}`);
  src = src.slice(0, i) + "\n" + patch + "\n" + src.slice(i);
  fs.writeFileSync(file, src);
}

if (sourceDir === "admin") {
  const file = path.join(outDir, "index.html");
  injectBeforeLast(file, "})();</script>", path.join("patches", "admin-image-transform.js"));
  injectBeforeLast(file, "})();</script>", path.join("patches", "admin-overlay-editor.js"));
} else {
  const file = path.join(outDir, "public-render.js");
  injectBeforeLast(file, "})();", path.join("patches", "public-image-transform.js"));
  injectBeforeLast(file, "})();", path.join("patches", "public-overlay-renderer.js"));
  fs.appendFileSync(
    path.join(outDir, "public.css"),
    "\n" + readPatch(path.join("patches", "public-mobile-fixes.css")) + "\n"
  );
}

console.log(`Vercel project host: ${projectHost || "(unknown)"}`);
console.log(`Deploying ${sourceDir}/ -> ${outDir}/ with JSON overlay editor`);
