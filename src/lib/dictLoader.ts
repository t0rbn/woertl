import type { Level } from "@/types/gameTypes";

// Module-scoped cache: once a dictionary is fetched and parsed, subsequent
// calls return the cached Set immediately without re-fetching.
const cache = new Map<Level, Set<string>>();

/**
 * Loads the validation dictionary for the given level.
 *
 * The dictionary is fetched from `/woertl/dicts/dict[N].json` (respecting the
 * Next.js basePath of `/woertl`) and returned as a Set<string> for O(1) lookups.
 *
 * The result is cached per level: subsequent calls for the same level return
 * the cached Set immediately without a network request.
 *
 * @throws An error with an informative message if the fetch fails, returns a
 *         non-OK status, or the response body cannot be parsed as a JSON array.
 */
export async function loadValidationDict(level: Level): Promise<Set<string>> {
  const cached = cache.get(level);
  if (cached !== undefined) {
    return cached;
  }

  const fileName = levelToFileName(level);
  // basePath is /woertl for the GitHub Pages deployment
  const url = `/woertl/dicts/${fileName}`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new Error(
      `Wörterbuch konnte nicht geladen werden (Netzwerkfehler): ${String(err)}`
    );
  }

  if (!response.ok) {
    throw new Error(
      `Wörterbuch konnte nicht geladen werden (HTTP ${response.status}): ${url}`
    );
  }

  let words: unknown;
  try {
    words = await response.json();
  } catch (err) {
    throw new Error(
      `Wörterbuch konnte nicht verarbeitet werden (Parsefehler): ${String(err)}`
    );
  }

  if (!Array.isArray(words)) {
    throw new Error(
      `Wörterbuch hat ein unerwartetes Format (kein Array): ${url}`
    );
  }

  const wordSet = new Set<string>(words.map((w: unknown) => String(w).toUpperCase()));
  cache.set(level, wordSet);
  return wordSet;
}

function levelToFileName(level: Level): string {
  switch (level) {
    case "easy":
      return "dict5.json";
    case "normal":
      return "dict8.json";
    case "hard":
      return "dict12.json";
  }
}
