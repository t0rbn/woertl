#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * generate-dicts-from-german-txt.js
 *
 * Generates dictionary files for all three game levels from the source file
 * `tickets/01 todo/german.txt` (ISO-8859-1 encoded, CRLF line endings).
 *
 * For each level word length (5, 8, 12), ALL words of that exact character
 * length are included. Umlauts (Ä, Ö, Ü) count as one character each.
 *
 * Output:
 *   src/data/words5.ts, words8.ts, words12.ts  -- solution pool (TypeScript)
 *   public/dicts/dict5.json, dict8.json, dict12.json  -- validation dicts (JSON)
 *
 * The script is idempotent: running it twice on the same source produces
 * identical output (words are sorted alphabetically).
 */

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SOURCE_FILE = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  "tickets",
  "01 todo",
  "german.txt"
);

const LENGTHS = [5, 8, 12];

const REPO_ROOT = path.join(__dirname, "..");

// ---------------------------------------------------------------------------
// Load source file
// ---------------------------------------------------------------------------

if (!fs.existsSync(SOURCE_FILE)) {
  console.error(`[ERROR] Source file not found: ${SOURCE_FILE}`);
  process.exit(1);
}

console.log(`[INFO] Reading source file: ${SOURCE_FILE}`);

// Read as latin1 (ISO-8859-1) so multi-byte sequences are not mangled.
const raw = fs.readFileSync(SOURCE_FILE, { encoding: "latin1" });

// Split on CRLF or LF, trim whitespace, drop empty lines.
const lines = raw
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => l.length > 0);

console.log(`[INFO] Source contains ${lines.length} raw entries`);

// ---------------------------------------------------------------------------
// Build buckets: for each target length, collect all matching words
// ---------------------------------------------------------------------------

// effectiveLength: use Array.from so multi-codepoint chars count as 1.
function effectiveLength(word) {
  return Array.from(word).length;
}

const buckets = {};
for (const len of LENGTHS) {
  buckets[len] = new Set();
}

for (const rawWord of lines) {
  // Uppercase the word. latin1 upper-cases map correctly for German umlauts.
  const upper = rawWord.toUpperCase();

  const len = effectiveLength(upper);
  if (buckets[len] !== undefined) {
    buckets[len].add(upper);
  }
}

for (const len of LENGTHS) {
  console.log(`[INFO] Unique ${len}-letter words: ${buckets[len].size}`);
}

// ---------------------------------------------------------------------------
// Write output files
// ---------------------------------------------------------------------------

const dataDir = path.join(REPO_ROOT, "src", "data");
const dictsDir = path.join(REPO_ROOT, "public", "dicts");

for (const dir of [dataDir, dictsDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

for (const len of LENGTHS) {
  const words = Array.from(buckets[len]).sort();

  // --- TypeScript solution pool file ---
  const tsLines = words.map((w) => `  "${w}",`).join("\n");
  const tsContent =
    `// Valid German words of exactly ${len} letters (umlauts count as 1 character)\n` +
    `// Generated from german.txt – do not edit manually.\n` +
    `const WORDS${len}: string[] = [\n` +
    tsLines +
    `\n];\n\n` +
    `export default WORDS${len};\n`;

  const tsPath = path.join(dataDir, `words${len}.ts`);
  fs.writeFileSync(tsPath, tsContent, { encoding: "utf-8" });
  console.log(`[OK] ${tsPath}: ${words.length} words`);

  // --- JSON validation dictionary ---
  const jsonContent = JSON.stringify(words);
  const jsonPath = path.join(dictsDir, `dict${len}.json`);
  fs.writeFileSync(jsonPath, jsonContent, { encoding: "utf-8" });
  const sizeKB = (fs.statSync(jsonPath).size / 1024).toFixed(1);
  console.log(`[OK] ${jsonPath}: ${words.length} words (${sizeKB} KB)`);
}

console.log("[DONE] All dictionary files written.");
