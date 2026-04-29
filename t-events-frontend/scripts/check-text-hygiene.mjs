import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scanRoots = ["src", "tests", "docs", ".github", "README.md", "AGENTS.md", "CLAUDE.md"];
const scannedExtensions = new Set([".css", ".js", ".json", ".md", ".mjs", ".ts", ".tsx", ".yml", ".yaml"]);
const ignoredDirectories = new Set([".git", ".next", "coverage", "node_modules", "out"]);

const mojibakePatterns = [
  {
    name: "utf8_as_windows_1251",
    pattern: /[\u0420\u0421][\u0402-\u040f\u0450-\u045f\u00a0-\u00bf\u201a-\u201e\u2020-\u2022]/u,
  },
  {
    name: "utf8_as_windows_1251_box_or_punctuation",
    pattern: /\u0432[\u0402-\u040f\u20ac\u201a-\u201e\u2020-\u2022]/u,
  },
  {
    name: "latin_mojibake",
    pattern: /(?:Ã.|Â.|Ð.|Ñ.)/u,
  },
  {
    name: "replacement_character",
    pattern: /\ufffd/u,
  },
];

async function collectFiles(target) {
  const absolutePath = path.join(root, target);
  const entryStat = await stat(absolutePath).catch(() => null);
  if (!entryStat) return [];

  if (entryStat.isDirectory()) {
    const entries = await readdir(absolutePath, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map((entry) => {
        if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return [];
        return collectFiles(path.join(target, entry.name));
      }),
    );
    return nested.flat();
  }

  if (entryStat.isFile() && scannedExtensions.has(path.extname(absolutePath))) {
    return [absolutePath];
  }

  return [];
}

function toRelativePath(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, "/");
}

const files = (await Promise.all(scanRoots.map(collectFiles))).flat();
const findings = [];

for (const filePath of files) {
  const content = await readFile(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const { name, pattern } of mojibakePatterns) {
      if (pattern.test(line)) {
        findings.push(`${toRelativePath(filePath)}:${index + 1} ${name}: ${line.trim()}`);
        break;
      }
    }
  });
}

if (findings.length > 0) {
  console.error("Text hygiene check failed. Possible mojibake or invalid text found:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log(`Text hygiene check passed for ${files.length} files.`);
