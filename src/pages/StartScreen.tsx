import { activities } from "../data/quests";
import type { ProgressState, ScreenKey } from "../types/game";
import type { RepairProgress } from "../types/question";
import { questBadges } from "../utils/badges";
import { getQuestionCount } from "../utils/questions";
import { getCompletedCount, getMasteryLabel, getTotalScore } from "../utils/scoring";
import { PrivacyNotice } from "../components/PrivacyNotice";
import { ProgressMeter } from "../components/ProgressMeter";

interface StartScreenProps {
  progress: ProgressState;
  repairProgress: RepairProgress;
  earnedBadgeNames: readonly string[];
  onNavigate: (screen: ScreenKey) => void;
}

export function StartScreen({
  progress,
  repairProgress,
  earnedBadgeNames,
  onNavigate,
}: StartScreenProps) {
  const completed = getCompletedCount(progress);
  const totalScore = getTotalScore(progress);
  const nextActivity =
    activities.find((activity) => !progress[activity.key].completed) ?? activities[activities.length - 1];

  return (
    <main className="start-screen">
      <section className="start-hero">
        <div className="hero-copy">
          <p className="kicker">Geschiedenis oefenen</p>
          <h1>GeschiedenisQuest</h1>
          <p className="hero-text">
            Oefen hoofdstuk 6 in korte quests. Kies een level, krijg meteen feedback en verzamel badges.
          </p>
          <div className="hero-actions">
            <button className="primary-button large" type="button" onClick={() => onNavigate("map")}>
              Start levelkaart
            </button>
            <button className="secondary-button large" type="button" onClick={() => onNavigate("progress")}>
              Bekijk voortgang
            </button>
          </div>
        </div>

        <div className="quest-board" aria-label="Huidige voortgang">
          <div className="quest-board-header">
            <span>Sessie</span>
            <strong>{getMasteryLabel(totalScore)}</strong>
          </div>
          <ProgressMeter value={totalScore} label="Gemiddelde score" />
          <div className="reward-strip" aria-label="Beloningen">
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
          <div className="stat-row">
            <span>Quests gehaald</span>
            <strong>{completed}/5</strong>
          </div>
          <div className="stat-row">
            <span>Totaal aantal vragen: {getQuestionCount()}</span>
          </div>
          <div className="next-card">
            <span>Volgende level</span>
            <button type="button" onClick={() => onNavigate(nextActivity.screen)}>
              {nextActivity.title}
            </button>
          </div>
          <PrivacyNotice />
        </div>
      </section>

      <section className="quick-levels" aria-label="Levels">
        {activities.map((activity) => (
          <button
            className={`quick-level accent-${activity.accent}`}
            type="button"
            key={activity.key}
            onClick={() => onNavigate(activity.screen)}
          >
            <span>{activity.shortTitle}</span>
            <strong>{progress[activity.key].bestScore}%</strong>
            <small>{activity.duration}</small>
          </button>
        ))}
      </section>
    </main>
  );
}
