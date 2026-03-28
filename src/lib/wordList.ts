import type { Level } from "@/types/gameTypes";
import WORDS5 from "@/data/words5";
import WORDS8 from "@/data/words8";
import WORDS12 from "@/data/words12";

export function getWordList(level: Level): string[] {
  switch (level) {
    case "easy":
      return WORDS5;
    case "normal":
      return WORDS8;
    case "hard":
      return WORDS12;
  }
}
