#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * generate-dicts.js
 *
 * Generates validation dictionary JSON files for the three game levels:
 *   public/dicts/dict5.json   – 5-letter words (easy level)
 *   public/dicts/dict8.json   – 8-letter words (normal level)
 *   public/dicts/dict12.json  – 12-letter words (hard level)
 *
 * The dictionaries are a superset of the curated solution pools.
 * They include common German words of each length to allow players to
 * enter real German words that are not in the solution pool.
 *
 * Word format:
 *   - Fully uppercase
 *   - Umlauts stored as Unicode characters: Ä, Ö, Ü (not digraphs AE/OE/UE)
 *   - Sharp S stored as SS
 *   - Effective character length: each umlaut (Ä, Ö, Ü) counts as 1 character
 *
 * Source: German word list from enz/german-wordlist (CC0 public domain).
 * See src/data/DICTIONARY_LICENSE.md for details.
 *
 * ---------------------------------------------------------------------------
 * External source:
 *   Repository:   https://github.com/enz/german-wordlist
 *   File:         scripts/sources/german-wordlist.txt
 *   License:      CC0 1.0 Universal (public domain)
 *   Download URL: https://raw.githubusercontent.com/enz/german-wordlist/master/words
 *   Download date: 2026-03-30
 *
 *   The source is a curated list of German words for word games, following
 *   Scrabble rules: no proper nouns (personal names, city names, brand names),
 *   no abbreviations, no archaic words or outdated spellings.
 *   It includes nouns, verbs (all conjugations), adjectives (all declensions),
 *   adverbs, plurals, compound nouns, and participles.
 * ---------------------------------------------------------------------------
 *
 * Bundle size note:
 *   The raw JSON files may exceed 500 KB (dict8 ~622 KB, dict12 ~1059 KB).
 *   These files are lazy-loaded by dictLoader.ts and are never part of the
 *   initial bundle. GitHub Pages and modern servers serve them with gzip
 *   compression, resulting in transfer sizes well under 250 KB each.
 *   Switching to a more compact format would complicate dictLoader.ts without
 *   meaningful benefit given gzip compression. Decision: keep JSON array format.
 */

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// Helper: count effective character length (umlauts count as 1)
// ---------------------------------------------------------------------------
function effectiveLength(word) {
  return Array.from(word).length;
}

// ---------------------------------------------------------------------------
// Helper: normalise a word for storage
// ---------------------------------------------------------------------------
function normalise(word) {
  return word
    .toUpperCase()
    // Replace ß with SS
    .replace(/ß/g, "SS")
    .trim();
}

// ---------------------------------------------------------------------------
// Helper: check if a word contains non-alphabetic characters
// (hyphens, spaces, digits, periods, apostrophes – these are excluded)
// ---------------------------------------------------------------------------
function hasInvalidChars(word) {
  return /[^a-zA-ZäöüÄÖÜß]/.test(word);
}

// ---------------------------------------------------------------------------
// Solution pools – read directly from src/data/words*.ts
// This ensures the generation script always stays in sync with the actual
// solution pool files without requiring manual updates.
// ---------------------------------------------------------------------------

/**
 * Extract all quoted uppercase strings from a TypeScript file.
 * This is intentionally simple: it only looks for strings that match
 * the pattern used in words5.ts, words8.ts, words12.ts.
 */
function extractWordsFromTs(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  // Match all double-quoted strings consisting of uppercase letters and German special chars
  const matches = content.match(/"([A-ZÄÖÜ]+)"/g) || [];
  return [...new Set(matches.map((m) => m.replace(/"/g, "")))];
}

const srcDataDir = path.join(__dirname, "..", "src", "data");
const SOLUTION_POOL_5 = extractWordsFromTs(path.join(srcDataDir, "words5.ts"));
const SOLUTION_POOL_8 = extractWordsFromTs(path.join(srcDataDir, "words8.ts"));
const SOLUTION_POOL_12 = extractWordsFromTs(path.join(srcDataDir, "words12.ts"));

console.log(`[INFO] Solution pools loaded: words5=${SOLUTION_POOL_5.length}, words8=${SOLUTION_POOL_8.length}, words12=${SOLUTION_POOL_12.length}`);

// ---------------------------------------------------------------------------
// Load and filter the external word list
// ---------------------------------------------------------------------------

const SOURCE_FILE = path.join(__dirname, "sources", "german-wordlist.txt");

if (!fs.existsSync(SOURCE_FILE)) {
  console.error(
    `[ERROR] Source file not found: ${SOURCE_FILE}\n` +
    `Please download it from:\n` +
    `  https://raw.githubusercontent.com/enz/german-wordlist/master/words\n` +
    `and save it to scripts/sources/german-wordlist.txt`
  );
  process.exit(1);
}

console.log(`[INFO] Reading source word list from: ${SOURCE_FILE}`);
const sourceLines = fs
  .readFileSync(SOURCE_FILE, "utf-8")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l.length > 0);

console.log(`[INFO] Source contains ${sourceLines.length} entries`);

// Filtering pipeline
const buckets = { 5: new Set(), 8: new Set(), 12: new Set() };
let filteredInvalidChars = 0;

for (const rawWord of sourceLines) {
  // Skip words with non-alphabetic characters (hyphens, spaces, digits, etc.)
  if (hasInvalidChars(rawWord)) {
    filteredInvalidChars++;
    continue;
  }

  const norm = normalise(rawWord);
  const len = effectiveLength(norm);

  if (buckets[len] !== undefined) {
    buckets[len].add(norm);
  }
}

console.log(`[INFO] Filtered ${filteredInvalidChars} entries with non-alphabetic characters`);
console.log(`[INFO] Words per bucket from source: 5-letter=${buckets[5].size}, 8-letter=${buckets[8].size}, 12-letter=${buckets[12].size}`);

// ---------------------------------------------------------------------------
// Build the dictionaries
// ---------------------------------------------------------------------------

function buildDictionary(solutionPool, sourceBucket, targetLength) {
  const wordSet = new Set(sourceBucket);

  // Add all solution-pool words (guarantees solution pool ⊆ validation dict)
  for (const word of solutionPool) {
    const norm = normalise(word);
    if (effectiveLength(norm) !== targetLength) {
      console.warn(
        `[WARN] Solution-pool word "${word}" has effective length ${effectiveLength(norm)}, expected ${targetLength}. Adding anyway.`
      );
    }
    if (!sourceBucket.has(norm)) {
      console.warn(
        `[WARN] Solution-pool word "${norm}" not found in external source – adding it explicitly.`
      );
    }
    wordSet.add(norm);
  }

  return Array.from(wordSet).sort();
}

// Build the three dictionaries
const dict5 = buildDictionary(SOLUTION_POOL_5, buckets[5], 5);
const dict8 = buildDictionary(SOLUTION_POOL_8, buckets[8], 8);
const dict12 = buildDictionary(SOLUTION_POOL_12, buckets[12], 12);

// Verify solution pools are fully covered
function verifySolutionCoverage(pool, dict, level) {
  const dictSet = new Set(dict);
  let missing = 0;
  for (const word of pool) {
    const norm = normalise(word);
    if (!dictSet.has(norm)) {
      console.warn(`[WARN] Solution-pool word missing from ${level} dict: "${norm}"`);
      missing++;
    }
  }
  if (missing === 0) {
    console.log(`[OK] All solution-pool words present in ${level} dict.`);
  } else {
    console.warn(`[WARN] ${missing} solution-pool words missing from ${level} dict.`);
  }
}

verifySolutionCoverage(SOLUTION_POOL_5, dict5, "dict5");
verifySolutionCoverage(SOLUTION_POOL_8, dict8, "dict8");
verifySolutionCoverage(SOLUTION_POOL_12, dict12, "dict12");

// Write output files
const outputDir = path.join(__dirname, "..", "public", "dicts");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, "dict5.json"), JSON.stringify(dict5));
fs.writeFileSync(path.join(outputDir, "dict8.json"), JSON.stringify(dict8));
fs.writeFileSync(path.join(outputDir, "dict12.json"), JSON.stringify(dict12));

const sizeKB = (filePath) =>
  (fs.statSync(filePath).size / 1024).toFixed(1);

console.log(`[OK] dict5.json:  ${dict5.length} words  (${sizeKB(path.join(outputDir, "dict5.json"))} KB)`);
console.log(`[OK] dict8.json:  ${dict8.length} words  (${sizeKB(path.join(outputDir, "dict8.json"))} KB)`);
console.log(`[OK] dict12.json: ${dict12.length} words (${sizeKB(path.join(outputDir, "dict12.json"))} KB)`);
console.log("[DONE] Dictionary files written to public/dicts/");
console.log("[NOTE] These files are lazy-loaded and served with gzip compression in production.");
console.log("       Gzip transfer sizes are typically 75-80% smaller than the raw file sizes.");
