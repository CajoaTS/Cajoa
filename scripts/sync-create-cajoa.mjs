import { readFileSync, writeFileSync } from "node:fs";

const check = process.argv.includes("--check");
const read = (f) => JSON.parse(readFileSync(f, "utf8"));

const { version } = read("packages/cajoa/package.json");
const file = "create-cajoa/template/package.json";
const tpl = read(file);
const wanted = `^${version}`;

if (tpl.dependencies?.cajoa === wanted) process.exit(0);

if (check) {
  console.error(
    `${file}: cajoa is "${tpl.dependencies?.cajoa}", expected "${wanted}" (run: npm run sync:create)`,
  );
  process.exit(1);
}

tpl.dependencies.cajoa = wanted;
writeFileSync(file, JSON.stringify(tpl, null, 2) + "\n");
console.log(`Set ${file} cajoa to ${wanted}`);
