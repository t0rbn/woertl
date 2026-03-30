"use client";

import type { Level } from "@/types/gameTypes";
import { LEVEL_CONFIGS } from "@/lib/levelConfig";
import styles from "./LevelSelect.module.css";

type LevelSelectProps = {
  onSelectLevel: (level: Level) => void;
};

const LEVEL_ICONS: Record<Level, string> = {
  easy: "★",
  normal: "◆",
  hard: "⬟",
};

const LEVEL_ICON_CLASSES: Record<Level, string> = {
  easy: styles.iconEasy ?? "",
  normal: styles.iconNormal ?? "",
  hard: styles.iconHard ?? "",
};

const LEVELS: Level[] = ["easy", "normal", "hard"];

export default function LevelSelect({ onSelectLevel }: LevelSelectProps) {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Schwierigkeitsgrad wählen</h2>
      <div className={styles.cardList}>
        {LEVELS.map((level) => {
          const config = LEVEL_CONFIGS[level];
          const ariaLabel = `${config.label} – ${config.wordLength} Buchstaben, ${config.maxAttempts} Versuche. Spielen`;

          return (
            <div
              key={level}
              className={styles.card}
              role="button"
              tabIndex={0}
              aria-label={ariaLabel}
              onClick={() => onSelectLevel(level)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectLevel(level);
                }
              }}
            >
              <div className={`${styles.icon} ${LEVEL_ICON_CLASSES[level]}`}>
                {LEVEL_ICONS[level]}
              </div>
              <div className={styles.info}>
                <div className={styles.levelName}>{config.label}</div>
                <div className={styles.levelDesc}>
                  {config.wordLength} Buchstaben, {config.maxAttempts} Versuche
                </div>
                <div className={styles.tilePreview} aria-hidden="true">
                  {Array.from({ length: config.wordLength }, (_, i) => (
                    <div key={i} className={styles.miniTile} />
                  ))}
                </div>
              </div>
              <div className={`${styles.badge} ${styles.badgeAvailable}`}>
                Spielen
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
