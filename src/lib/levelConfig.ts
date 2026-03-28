import type { Level, LevelConfig } from "@/types/gameTypes";

export const LEVEL_CONFIGS: Record<Level, LevelConfig> = {
  easy: {
    wordLength: 5,
    maxAttempts: 6,
    label: "Einfach",
    statsKey: "stats_easy",
  },
  normal: {
    wordLength: 8,
    maxAttempts: 7,
    label: "Normal",
    statsKey: "stats_normal",
  },
  hard: {
    wordLength: 12,
    maxAttempts: 8,
    label: "Schwer",
    statsKey: "stats_hard",
  },
};
