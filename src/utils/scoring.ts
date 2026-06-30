import type { ActivityKey, ProgressState } from "../types/game";

const emptyActivity = {
  attempts: 0,
  bestScore: 0,
  completed: false,
};

export function createInitialProgress(): ProgressState {
  return {
    quiz: { ...emptyActivity },
    terms: { ...emptyActivity },
    timeline: { ...emptyActivity },
    repair: { ...emptyActivity },
    boss: { ...emptyActivity },
  };
}

export function calculatePercent(correct: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  return Math.round((correct / total) * 100);
}

export function updateProgress(
  progress: ProgressState,
  key: ActivityKey,
  score: number,
): ProgressState {
  const current = progress[key];

  return {
    ...progress,
    [key]: {
      attempts: current.attempts + 1,
      bestScore: Math.max(current.bestScore, score),
      completed: current.completed || score >= 60,
    },
  };
}

export function getTotalScore(progress: ProgressState): number {
  const values = Object.values(progress);
  const total = values.reduce((sum, item) => sum + item.bestScore, 0);

  return Math.round(total / values.length);
}

export function getCompletedCount(progress: ProgressState): number {
  return Object.values(progress).filter((item) => item.completed).length;
}

export function getMasteryLabel(score: number): string {
  if (score >= 90) {
    return "Toetsklaar";
  }

  if (score >= 75) {
    return "Sterk bezig";
  }

  if (score >= 60) {
    return "Basis gehaald";
  }

  if (score > 0) {
    return "Nog oefenen";
  }

  return "Nog niet gestart";
}
