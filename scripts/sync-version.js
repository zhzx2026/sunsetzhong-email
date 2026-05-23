import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const version = readFileSync(resolve(root, "VERSION"), "utf8").trim();
const [major, minor] = version.split(".").map(Number);
const versionCode = major * 100 + minor;

// sw.js
let sw = readFileSync(resolve(root, "public/sw.js"), "utf8");
sw = sw.replace(/const VERSION = "[^"]*"/, `const VERSION = "${version}"`);
writeFileSync(resolve(root, "public/sw.js"), sw);

// src/index.ts
let idx = readFileSync(resolve(root, "src/index.ts"), "utf8");
idx = idx.replace(/version: "[^"]*"/, `version: "${version}"`);
writeFileSync(resolve(root, "src/index.ts"), idx);

console.log(`Synced version ${version}`);
