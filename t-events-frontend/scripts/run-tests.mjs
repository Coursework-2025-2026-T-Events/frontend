import { readdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const testsDir = path.join(root, "tests");

async function findTests(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return findTests(fullPath);
      if (entry.isFile() && entry.name.endsWith(".test.ts")) return [fullPath];
      return [];
    }),
  );
  return files.flat().sort();
}

const testFiles = await findTests(testsDir);

if (testFiles.length === 0) {
  console.error("No test files found in tests/");
  process.exit(1);
}

const child = spawn(process.execPath, ["--import", "tsx", "--test", ...testFiles], {
  cwd: root,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`Test runner terminated by ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 1);
});
