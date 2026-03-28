"use client";

import type { Level } from "@/types/gameTypes";
import { LEVEL_CONFIGS } from "@/lib/levelConfig";
import styles from "./LevelSelect.module.css";

type LevelStatus = "available" | "won" | "lost";

type LevelSelectProps = {
  onSelectLevel: (level: Level) => void;
  levelStatuses: Record<Level, LevelStatus>;
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

const BADGE_LABELS: Record<LevelStatus, string> = {
  available: "Spielen",
  won: "Gewonnen ✓",
  lost: "Verloren",
};

function getStatusBadgeClass(status: LevelStatus): string {
  switch (status) {
    case "won":
      return styles.badgeWon ?? "";
    case "lost":
      return styles.badgeLost ?? "";
    default:
      return styles.badgeAvailable ?? "";
  }
}

function getCardClass(status: LevelStatus): string {
  if (status === "won") return `${styles.card ?? ""} ${styles.cardCompleted ?? ""}`;
  if (status === "lost") return `${styles.card ?? ""} ${styles.cardLost ?? ""}`;
  return styles.card ?? "";
}

const LEVELS: Level[] = ["easy", "normal", "hard"];

export default function LevelSelect({ onSelectLevel, levelStatuses }: LevelSelectProps) {
  const allCompleted = LEVELS.every(
    (l) => levelStatuses[l] === "won" || levelStatuses[l] === "lost"
  );

  const headingText = allCompleted ? "Heute geschafft!" : "Schwierigkeitsgrad wählen";

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>{headingText}</h2>
      <div className={styles.cardList}>
        {LEVELS.map((level) => {
          const config = LEVEL_CONFIGS[level];
          const status = levelStatuses[level];
          const ariaLabel = `${config.label} – ${config.wordLength} Buchstaben, ${config.maxAttempts} Versuche. Status: ${BADGE_LABELS[status]}`;

          return (
            <div
              key={level}
              className={getCardClass(status)}
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
              <div className={`${styles.badge} ${getStatusBadgeClass(status)}`}>
                {BADGE_LABELS[status]}
              </div>
              {status === "won" && (
                <span className={styles.completedOverlay} aria-hidden="true">✓</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
