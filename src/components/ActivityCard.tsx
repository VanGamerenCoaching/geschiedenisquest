import type { ActivityDefinition, ActivityProgress } from "../types/game";
import { getMasteryLabel } from "../utils/scoring";

interface ActivityCardProps {
  activity: ActivityDefinition;
  progress: ActivityProgress;
  onOpen: () => void;
}

export function ActivityCard({ activity, progress, onOpen }: ActivityCardProps) {
  return (
    <article className={`activity-card accent-${activity.accent}`}>
      <div className="activity-topline">
        <span className="activity-pill">{activity.focus}</span>
        <span>{activity.duration}</span>
      </div>
      <h3>{activity.title}</h3>
      <p>{activity.subtitle}</p>
      <div className="activity-meta">
        <span>{getMasteryLabel(progress.bestScore)}</span>
        <strong>{progress.bestScore}%</strong>
      </div>
      <button className="primary-button" type="button" onClick={onOpen}>
        Open level
      </button>
    </article>
  );
}
