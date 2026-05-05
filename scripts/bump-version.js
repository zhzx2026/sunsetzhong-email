import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const vf = resolve(root, "VERSION");
const version = readFileSync(vf, "utf8").trim();
const [major, minor] = version.split(".").map(Number);
const next = `${major}.${minor + 1}`;
writeFileSync(vf, next + "\n");
console.log(`Bumped ${version} → ${next}`);
