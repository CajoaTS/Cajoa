#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const name = process.argv[2];
if (!name) {
  console.log("Usage: npm create cajoa@latest <project-name>");
  process.exit(1);
}

const target = path.resolve(process.cwd(), name);
if (fs.existsSync(target) && fs.readdirSync(target).length > 0) {
  console.log(`Folder "${name}" is not empty.`);
  process.exit(1);
}

const here = path.dirname(fileURLToPath(import.meta.url));
fs.cpSync(path.join(here, "template"), target, { recursive: true });

// ibalik ang tunay na pangalan ng .gitignore
fs.renameSync(path.join(target, "_gitignore"), path.join(target, ".gitignore"));

// ilagay ang pangalan ng project sa package.json
const pkgPath = path.join(target, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
pkg.name = path
  .basename(target)
  .toLowerCase()
  .replace(/[^a-z0-9-_.]/g, "-");
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

console.log(`\nDone! Next:\n  cd ${name}\n  npm install\n  npm run dev\n`);
