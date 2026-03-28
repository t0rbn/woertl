import type { Level } from "@/types/gameTypes";
import { getWordList } from "@/lib/wordList";

// Fixed epoch: 2024-01-01
const EPOCH = new Date("2024-01-01").getTime();

const LEVEL_OFFSETS: Record<Level, number> = {
  easy: 0,
  normal: 1000,
  hard: 2000,
};

function getDaysSinceEpoch(): number {
  const now = new Date();
  // Use UTC date to be consistent across timezones
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((todayUtc - EPOCH) / (1000 * 60 * 60 * 24));
}

export function getDailyWord(level: Level): string {
  const words = getWordList(level);
  const dayIndex = getDaysSinceEpoch();
  const offset = LEVEL_OFFSETS[level];
  const index = (dayIndex + offset) % words.length;
  return words[index] ?? words[0] ?? "";
}
