import { activities } from "../data/quests";
import type { ProgressState, ScreenKey } from "../types/game";
import type { RepairProgress } from "../types/question";
import { questBadges } from "../utils/badges";
import { getQuestionCount } from "../utils/questions";
import { getCompletedCount, getMasteryLabel, getTotalScore } from "../utils/scoring";
import { BadgeGrid } from "../components/BadgeGrid";
import { PageShell } from "../components/PageShell";
import { PrivacyNotice } from "../components/PrivacyNotice";
import { ProgressMeter } from "../components/ProgressMeter";

interface ProgressOverviewProps {
  progress: ProgressState;
  repairProgress: RepairProgress;
  earnedBadgeNames: readonly string[];
  onNavigate: (screen: ScreenKey) => void;
  onReset: () => void;
}

export function ProgressOverview({
  progress,
  repairProgress,
  earnedBadgeNames,
  onNavigate,
  onReset,
}: ProgressOverviewProps) {
  const totalScore = getTotalScore(progress);
  const completed = getCompletedCount(progress);

  return (
    <PageShell
      kicker="Voortgangsoverzicht"
      title="Bekijk je oefensessie"
      onBack={() => onNavigate("map")}
      aside={
        <>
          <h2>Samenvatting</h2>
          <ProgressMeter value={totalScore} label="Gemiddelde beheersing" />
          <div className="stat-list">
            <div>
              <span>Status</span>
              <strong>{getMasteryLabel(totalScore)}</strong>
            </div>
            <div>
              <span>Levels gehaald</span>
              <strong>{completed}/5</strong>
            </div>
            <div>
              <span>Docentcheck</span>
              <strong>Totaal aantal vragen: {getQuestionCount()}</strong>
            </div>
            <div>
              <span>XP</span>
              <strong>{repairProgress.totalXp}</strong>
            </div>
            <div>
              <span>Badges</span>
              <strong>
                {earnedBadgeNames.length}/{questBadges.length}
              </strong>
            </div>
          </div>
          <PrivacyNotice />
          <button className="secondary-button full" type="button" onClick={onReset}>
            Mijn voortgang wissen
          </button>
        </>
      }
    >
      <section className="badge-panel" aria-label="Badges">
        <div className="badge-panel-header">
          <div>
            <span>Badges</span>
            <h2>Wat heb je al vrijgespeeld?</h2>
          </div>
          <strong>
            {earnedBadgeNames.length}/{questBadges.length}
          </strong>
        </div>
        <BadgeGrid earnedBadgeNames={earnedBadgeNames} />
      </section>

      <div className="progress-grid">
        {activities.map((activity) => {
          const activityProgress = progress[activity.key];

          return (
            <article className={`progress-card accent-${activity.accent}`} key={activity.key}>
              <div className="progress-card-heading">
                <span>{activity.focus}</span>
                <strong>{activityProgress.bestScore}%</strong>
              </div>
              <h2>{activity.title}</h2>
              <p>{getMasteryLabel(activityProgress.bestScore)}</p>
              <ProgressMeter value={activityProgress.bestScore} label="Beste score" />
              <div className="progress-actions">
                <span>{activityProgress.attempts} poging(en)</span>
                <button type="button" onClick={() => onNavigate(activity.screen)}>
                  Oefen opnieuw
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </PageShell>
  );
}
