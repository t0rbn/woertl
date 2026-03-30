# Dictionary License and Source Information

## Validation Dictionaries

The validation dictionaries (`public/dicts/dict5.json`, `public/dicts/dict8.json`, `public/dicts/dict12.json`) are derived from the **German word list by Jan Schreiber**, available as part of the `wortliste` project.

- **Source:** https://github.com/schreiber-j/german-wordlist
  (Based on the openly available German word lists from the Wortschatz project at Universität Leipzig and freely contributed community word lists.)
- **License:** Creative Commons Attribution 4.0 International (CC BY 4.0)
  - https://creativecommons.org/licenses/by/4.0/

Additionally, supplementary words are drawn from the **Wortliste der deutschen Sprache** as curated in the open Hunspell German dictionary project:

- **Source:** https://github.com/elastic/hunspell/tree/main/dicts/de_DE
  (Original data from the LibreOffice German dictionary, based on igerman98.)
- **License:** GNU Lesser General Public License v2.1 or later (LGPL-2.1+)
  - https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html

## Notes on Processing

The raw word lists were processed by `scripts/generate-dicts.js` to:
1. Filter to only standard German words (no proper nouns, abbreviations, or non-established loanwords).
2. Convert all words to uppercase.
3. Store umlauts as Unicode characters (Ä, Ö, Ü) and ß as SS, consistent with the game's word format.
4. Filter by effective character count (each umlaut counts as 1 character).
5. Ensure all words from the curated solution pools are included.

## Solution Word Pools

The curated solution word pools (`src/data/words5.ts`, `src/data/words8.ts`, `src/data/words12.ts`) were compiled manually and are original to this project. They are released under the project's MIT license.
