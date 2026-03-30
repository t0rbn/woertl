# Dictionary Sources

This directory contains the raw source word lists used by `scripts/generate-dicts.js` to generate the validation dictionaries.

## german-wordlist.txt

- **Source:** https://github.com/enz/german-wordlist
- **File URL:** https://raw.githubusercontent.com/enz/german-wordlist/master/words
- **License:** CC0 1.0 Universal (public domain dedication)
  - https://creativecommons.org/publicdomain/zero/1.0/
- **Download date:** 2026-03-30

### Description

A comprehensive list of German words for word games, curated following Scrabble rules. The list includes:
- Common nouns (all inflected forms: plurals, cases)
- Verbs (all conjugations across all common tenses)
- Adjectives (all declensions) and adverbs
- Participles and compound nouns

The list explicitly **excludes**:
- Proper nouns (personal names, city names, brand names)
- Abbreviations and acronyms
- Archaic words and outdated spellings
- Non-established foreign loanwords

### Re-downloading

If the source file is not present (it is gitignored due to its size ~8 MB), download it with:

```sh
curl -L -o scripts/sources/german-wordlist.txt \
  https://raw.githubusercontent.com/enz/german-wordlist/master/words
```

Then run `npm run generate-dicts` to regenerate the dictionary JSON files.
