# Dictionary License and Source Information

## Validation Dictionaries

The validation dictionaries (`public/dicts/dict5.json`, `public/dicts/dict8.json`, `public/dicts/dict12.json`) are derived from the **German word list by Peter Enz** (`enz/german-wordlist`), a curated German word list for word games.

- **Source:** https://github.com/enz/german-wordlist
- **Raw file:** https://raw.githubusercontent.com/enz/german-wordlist/master/words
- **License:** CC0 1.0 Universal (Creative Commons Public Domain Dedication)
  - https://creativecommons.org/publicdomain/zero/1.0/
- **Downloaded:** 2026-03-30

### About the Source

The `enz/german-wordlist` is a comprehensive list of German words curated specifically for word games, following the inclusion rules of Scrabble Deutschland e. V. The list includes:

- Common nouns with all inflected forms (plurals, cases)
- Verbs with all conjugations across all common tenses
- Adjectives with all declensions, and adverbs
- Participles and compound nouns

The source explicitly **excludes**:
- Proper nouns (personal names, city names, brand names)
- Abbreviations and acronyms
- Archaic words and outdated spellings
- Non-established foreign loanwords

### Previous Sources

The previous validation dictionaries were derived from:
1. The German word list by Jan Schreiber (`schreiber-j/german-wordlist`, CC BY 4.0)
2. The Hunspell de_DE dictionary (`elastic/hunspell`, LGPL-2.1+)

These sources are **no longer used** as of 2026-03-30. They have been replaced entirely by the `enz/german-wordlist` (CC0), which provides significantly broader coverage of everyday German vocabulary and is in the public domain.

## Notes on Processing

The raw word list is processed by `scripts/generate-dicts.js` to:
1. Skip entries containing non-alphabetic characters (hyphens, spaces, digits, periods, apostrophes).
2. Convert all words to uppercase.
3. Replace sharp S (ß) with SS, consistent with the game's word format.
4. Store umlauts as Unicode characters (Ä, Ö, Ü), each counting as 1 tile.
5. Filter by effective character count (each umlaut counts as 1 character).
6. Ensure all words from the curated solution pools are included (solution pool ⊆ validation dictionary).

The source file (`scripts/sources/german-wordlist.txt`) is listed in `.gitignore` due to its size (~8 MB). See `scripts/sources/README.md` for download instructions.

## Solution Word Pools

The curated solution word pools (`src/data/words5.ts`, `src/data/words8.ts`, `src/data/words12.ts`) were compiled manually and are original to this project. They are released under the project's MIT license.
