import { questBadges } from "../utils/badges";

interface BadgeGridProps {
  earnedBadgeNames: readonly string[];
}

export function BadgeGrid({ earnedBadgeNames }: BadgeGridProps) {
  const earned = new Set(earnedBadgeNames);

  return (
    <div className="badge-grid" aria-label="Badges">
      {questBadges.map((badge) => {
        const isEarned = earned.has(badge.title);

        return (
          <article
            className={`quest-badge accent-${badge.accent} ${isEarned ? "earned" : "locked"}`}
            key={badge.id}
          >
            <span className="badge-medal" aria-hidden="true">
              {badge.shortLabel}
            </span>
            <span>
              <strong>{badge.title}</strong>
              <small>{isEarned ? badge.description : "Nog te halen"}</small>
            </span>
          </article>
        );
      })}
    </div>
  );
}
