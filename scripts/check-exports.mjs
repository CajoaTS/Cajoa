import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const REQUIRED = {
  cajoa: [".", "./jsx-runtime", "./jsx-dev-runtime", "./vite", "./server"],
};

let failed = false;
const fail = (message) => {
  console.error(message);
  failed = true;
};

function walk(value, where, dir, pkg) {
  if (typeof value === "string") {
    if (!existsSync(join(dir, value))) {
      fail(
        `${pkg}: ${where} points to ${value}, which does not exist (run the build first)`,
      );
    }
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (key.startsWith(".")) {
      fail(
        `${pkg}: "${key}" is nested inside ${where}. Subpaths must be top-level keys of "exports".`,
      );
    }
    walk(child, `${where}.${key}`, dir, pkg);
  }
}

for (const name of readdirSync("packages")) {
  const dir = join("packages", name);
  const pkgPath = join(dir, "package.json");
  if (!existsSync(pkgPath)) continue;

  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  if (!pkg.exports) continue;

  const subpaths = Object.keys(pkg.exports);
  for (const need of REQUIRED[pkg.name] ?? []) {
    if (!subpaths.includes(need))
      fail(`${pkg.name}: missing exports["${need}"]`);
  }
  for (const subpath of subpaths) {
    walk(pkg.exports[subpath], `exports["${subpath}"]`, dir, pkg.name);
  }

  for (const subpath of subpaths) {
    const specifier =
      subpath === "." ? pkg.name : `${pkg.name}/${subpath.slice(2)}`;
    try {
      await import(specifier);
    } catch (error) {
      fail(
        `${specifier} could not be imported: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
}

if (failed) process.exit(1);
console.log("All package exports resolve.");
