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

console.log(`Vercel project host: ${projectHost || "(unknown)"}`);
console.log(`Deploying ${sourceDir}/ -> ${outDir}/`);
