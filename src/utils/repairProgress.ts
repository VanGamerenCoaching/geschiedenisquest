import type { Question, QuestionProgress, RepairProgress, RepairQuestionStats } from "../types/question";
import { getAllQuestions, getRandomQuestions } from "./questions";

const storageKey = "geschiedenisquest_local_progress_v1";
const legacyStorageKey = "geschiedenisquest_repair_progress_v1";

export function createEmptyRepairProgress(): RepairProgress {
  return {
    questions: {},
    earnedBadges: [],
    totalXp: 0,
  };
}

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function createInitialStats(questionId: string): RepairQuestionStats {
  return {
    questionId,
    correctCount: 0,
    wrongCount: 0,
    lastAnsweredAt: "",
    mastered: false,
  };
}

function toRepairQuestionStats(value: unknown): RepairQuestionStats | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const stats = value as RepairQuestionStats;

  if (
    typeof stats.questionId === "string" &&
    typeof stats.correctCount === "number" &&
    typeof stats.wrongCount === "number" &&
    typeof stats.lastAnsweredAt === "string" &&
    typeof stats.mastered === "boolean"
  ) {
    return {
      questionId: stats.questionId,
      correctCount: stats.correctCount,
      wrongCount: stats.wrongCount,
      lastAnsweredAt: stats.lastAnsweredAt,
      mastered: stats.mastered,
    };
  }

  return null;
}

function normalizeProgress(value: unknown): RepairProgress {
  if (!value || typeof value !== "object") {
    return createEmptyRepairProgress();
  }

  const progress = value as Partial<RepairProgress>;
  const questions =
    progress.questions && typeof progress.questions === "object"
      ? Object.entries(progress.questions).reduce<Record<string, RepairQuestionStats>>(
          (questionDraft, [, value]) => {
            const stats = toRepairQuestionStats(value);

            if (stats) {
              questionDraft[stats.questionId] = stats;
            }

            return questionDraft;
          },
          {},
        )
      : {};

  return {
    questions,
    earnedBadges: Array.isArray(progress.earnedBadges)
      ? progress.earnedBadges.filter((badge): badge is string => typeof badge === "string")
      : [],
    totalXp: typeof progress.totalXp === "number" ? progress.totalXp : 0,
  };
}

export function loadRepairProgress(): RepairProgress {
  if (!canUseLocalStorage()) {
    return createEmptyRepairProgress();
  }

  const rawValue = window.localStorage.getItem(storageKey);

  if (!rawValue) {
    return createEmptyRepairProgress();
  }

  try {
    return normalizeProgress(JSON.parse(rawValue));
  } catch {
    return createEmptyRepairProgress();
  }
}

export function saveRepairProgress(progress: RepairProgress): void {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(normalizeProgress(progress)));
}

export function clearRepairProgress(): void {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.removeItem(storageKey);
  window.localStorage.removeItem(legacyStorageKey);
}

export function updateRepairProgress(
  currentProgress: RepairProgress,
  questionResults: QuestionProgress,
): RepairProgress {
  const answeredAt = new Date().toISOString();
  const normalizedProgress = normalizeProgress(currentProgress);
  const correctAnswers = Object.values(questionResults).filter((result) => result.isCorrect).length;
  const nextProgress = Object.entries(questionResults).reduce<RepairProgress>(
    (progressDraft, [questionId, result]) => {
      const currentStats = progressDraft.questions[questionId] ?? createInitialStats(questionId);

      if (result.isCorrect) {
        const correctCount = currentStats.correctCount + 1;
        progressDraft.questions[questionId] = {
          questionId: currentStats.questionId,
          correctCount,
          wrongCount: currentStats.wrongCount,
          lastAnsweredAt: answeredAt,
          mastered: currentStats.mastered || (currentStats.wrongCount > 0 && correctCount >= 2),
        };
      } else {
        progressDraft.questions[questionId] = {
          questionId: currentStats.questionId,
          correctCount: 0,
          wrongCount: currentStats.wrongCount + 1,
          lastAnsweredAt: answeredAt,
          mastered: false,
        };
      }

      return progressDraft;
    },
    {
      questions: { ...normalizedProgress.questions },
      earnedBadges: [...normalizedProgress.earnedBadges],
      totalXp: normalizedProgress.totalXp,
    },
  );

  const totalXp = nextProgress.totalXp + correctAnswers * 10;
  const earnedBadges = new Set(nextProgress.earnedBadges);

  if (totalXp >= 100) {
    earnedBadges.add("10 goede antwoorden");
  }

  return {
    ...nextProgress,
    totalXp,
    earnedBadges: Array.from(earnedBadges),
  };
}

export function awardEarnedBadges(
  currentProgress: RepairProgress,
  badgeNames: readonly string[],
): RepairProgress {
  const normalizedProgress = normalizeProgress(currentProgress);
  const earnedBadges = new Set(normalizedProgress.earnedBadges);

  badgeNames.forEach((badgeName) => earnedBadges.add(badgeName));

  return {
    ...normalizedProgress,
    earnedBadges: Array.from(earnedBadges),
  };
}

export function getRepairQuestionIds(progress: RepairProgress): string[] {
  return Object.values(progress.questions)
    .filter((stats) => stats.wrongCount > 0 && !stats.mastered)
    .map((stats) => stats.questionId);
}

export function getRepairQuestionCount(progress: RepairProgress): number {
  return getRepairQuestionIds(progress).length;
}

export function getWeightedRepairQuestions(progress: RepairProgress, count = 6): Question[] {
  const questionsById = new Map(getAllQuestions().map((question) => [question.id, question]));
  const weightedQuestionIds = Object.values(progress.questions)
    .filter((stats) => stats.wrongCount > 0 && !stats.mastered)
    .flatMap((stats) => {
      const weight = Math.min(6, 1 + stats.wrongCount * 2 - stats.correctCount);

      return Array.from({ length: Math.max(1, weight) }, () => stats.questionId);
    });
  const selectedIds: string[] = [];

  for (const questionId of getRandomQuestions(weightedQuestionIds, weightedQuestionIds.length)) {
    if (!selectedIds.includes(questionId)) {
      selectedIds.push(questionId);
    }

    if (selectedIds.length === count) {
      break;
    }
  }

  return selectedIds
    .map((questionId) => questionsById.get(questionId))
    .filter((question): question is Question => question !== undefined);
}
