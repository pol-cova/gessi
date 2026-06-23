import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const level = process.argv[2] ?? "patch";
const allowed = new Set(["patch", "minor", "major"]);

if (!allowed.has(level)) {
  console.error("Usage: npm run release:patch|release:minor|release:major");
  process.exit(1);
}

const pkgPath = new URL("../package.json", import.meta.url);
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const [major, minor, patch] = pkg.version.split(".").map(Number);

const nextVersion = {
  patch: `${major}.${minor}.${patch + 1}`,
  minor: `${major}.${minor + 1}.0`,
  major: `${major + 1}.0.0`,
}[level];

pkg.version = nextVersion;
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

execFileSync("npm", ["run", "build"], { stdio: "inherit" });
execFileSync("npm", ["pack", "--dry-run"], { stdio: "inherit" });

console.log(`\nPrepared ${pkg.name}@${nextVersion}`);
console.log("Review the diff, commit it, then publish with:");
console.log("npm publish --access public");
