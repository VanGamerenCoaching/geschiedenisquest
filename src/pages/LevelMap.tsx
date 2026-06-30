import { PageShell } from "../components/PageShell";
import { ProgressMeter } from "../components/ProgressMeter";
import { levels, type LevelDefinition } from "../data/levels";
import type { ProgressState, ScreenKey } from "../types/game";
import type { QuestionProgress } from "../types/question";
import { getBadgeForLevel } from "../utils/badges";
import {
  getLevelQuestions,
  getQuestionCount,
  getQuestionSetProgress,
  MASTERY_PERCENTAGE,
} from "../utils/questions";

interface LevelMapProps {
  progress: ProgressState;
  questionProgress: QuestionProgress;
  earnedBadgeNames: readonly string[];
  onNavigate: (screen: ScreenKey) => void;
  onOpenLevel: (level: LevelDefinition) => void;
}

function getActivityScore(level: LevelDefinition, progress: ProgressState): number {
  if (level.id === "section-6-4") {
    return progress.timeline.bestScore;
  }

  if (level.id === "terms-mix") {
    return progress.terms.bestScore;
  }

  if (level.id === "boss-level") {
    return progress.boss.bestScore;
  }

  return 0;
}

export function LevelMap({
  progress,
  questionProgress,
  earnedBadgeNames,
  onNavigate,
  onOpenLevel,
}: LevelMapProps) {
  const earnedBadges = new Set(earnedBadgeNames);
  const levelSummaries = levels.map((level) => {
    const questions = getLevelQuestions(level);
    const questionSetProgress = getQuestionSetProgress(questions, questionProgress);
    const activityScore = getActivityScore(level, progress);
    const progressPercent = Math.max(questionSetProgress.progressPercent, activityScore);
    const totalQuestions = level.isBoss ? 20 : questionSetProgress.totalQuestions;
    const answeredQuestions =
      level.isBoss && progress.boss.attempts > 0 ? 20 : questionSetProgress.answeredQuestions;
    const estimatedCorrectQuestions = Math.round((progressPercent / 100) * totalQuestions);
    const correctQuestions = level.isBoss
      ? estimatedCorrectQuestions
      : Math.max(questionSetProgress.correctQuestions, estimatedCorrectQuestions);
    const levelProgress = {
      ...questionSetProgress,
      totalQuestions,
      answeredQuestions,
      correctQuestions,
      progressPercent,
      mastered: progressPercent >= MASTERY_PERCENTAGE,
    };

    return {
      level,
      questions,
      levelProgress,
    };
  });
  const masteredCount = levelSummaries.filter((summary) => summary.levelProgress.mastered).length;
  const totalQuestions = getQuestionCount();
  const totalScore =
    levelSummaries.length === 0
      ? 0
      : Math.round(
          levelSummaries.reduce((sum, summary) => sum + summary.levelProgress.progressPercent, 0) /
            levelSummaries.length,
        );
  const bossCompleted = progress.boss.bestScore >= MASTERY_PERCENTAGE;

  return (
    <PageShell
      kicker="Levelkaart"
      title="Hoofdstuk 6 levelkaart"
      onBack={() => onNavigate("start")}
      aside={
        <>
          <h2>Quest-status</h2>
          <ProgressMeter value={totalScore} label="Totale beheersing" />
          <div className="stat-list">
            <div>
              <span>Beheerst</span>
              <strong>{masteredCount}/{levels.length}</strong>
            </div>
            <div>
              <span>Norm</span>
              <strong>{MASTERY_PERCENTAGE}% goed</strong>
            </div>
            <div>
              <span>Vraagbank</span>
              <strong>Totaal aantal vragen: {totalQuestions}</strong>
            </div>
            <div>
              <span>Boss Level</span>
              <strong>{bossCompleted ? "Beheerst" : "Nog oefenen"}</strong>
            </div>
          </div>
        </>
      }
    >
      <div className="level-grid">
        {levelSummaries.map(({ level, questions, levelProgress }, index) => {
          const badge = getBadgeForLevel(level);
          const badgeEarned = badge ? earnedBadges.has(badge.title) : false;

          return (
            <article className={`level-card accent-${level.accent}`} key={level.id}>
              <div className="level-card-topline">
                <span>Level {index + 1}</span>
                <strong className={levelProgress.mastered ? "status-mastered" : "status-practice"}>
                  {levelProgress.mastered ? "Beheerst" : "Nog oefenen"}
                </strong>
              </div>
              <h2>{level.title}</h2>
              <p>{level.description}</p>
              <div className="level-details">
                <div>
                  <span>Vragen</span>
                  <strong>{level.isBoss ? 20 : questions.length}</strong>
                </div>
                <div>
                  <span>Goed</span>
                  <strong>
                    {levelProgress.correctQuestions}/{levelProgress.totalQuestions}
                  </strong>
                </div>
                <div>
                  <span>Gedaan</span>
                  <strong>
                    {levelProgress.answeredQuestions}/{levelProgress.totalQuestions}
                  </strong>
                </div>
              </div>
              <ProgressMeter value={levelProgress.progressPercent} label="Voortgang" />
              {badge && (
                <div className={badgeEarned ? "level-badge earned" : "level-badge"}>
                  <span>{badge.shortLabel}</span>
                  <div>
                    <strong>{badge.title}</strong>
                    <small>{badgeEarned ? "Badge gehaald" : "Haal 80% goed"}</small>
                  </div>
                </div>
              )}
              <button className="primary-button" type="button" onClick={() => onOpenLevel(level)}>
                Start level
              </button>
            </article>
          );
        })}
      </div>
    </PageShell>
  );
}
