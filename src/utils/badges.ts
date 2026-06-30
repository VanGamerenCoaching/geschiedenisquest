import type { LevelDefinition } from "../data/levels";
import type { ProgressState } from "../types/game";
import type { QuestionProgress } from "../types/question";
import {
  getQuestionSetProgress,
  getQuestionsBySection,
  MASTERY_PERCENTAGE,
} from "./questions";

export interface BadgeDefinition {
  id: string;
  title: string;
  shortLabel: string;
  description: string;
  accent: "blue" | "green" | "amber" | "red" | "purple";
  levelId: string;
}

const section61 = "6.1 Ontdekkingsreizen en wereldhandel";
const section62 = "6.2 Nieuwe ideeën en de hervorming";
const section63 = "6.3 De Nederlanden komen in opstand";
const section64 = "6.4 Van opstand naar nieuw land";
const termsSection = "Begrippenmix hoofdstuk 6";

export const questBadges: readonly BadgeDefinition[] = [
  {
    id: "badge-ontdekkingsreiziger",
    title: "Ontdekkingsreiziger",
    shortLabel: "6.1",
    description: "6.1 beheerst",
    accent: "blue",
    levelId: "section-6-1",
  },
  {
    id: "badge-hervormer",
    title: "Hervormer",
    shortLabel: "6.2",
    description: "6.2 beheerst",
    accent: "green",
    levelId: "section-6-2",
  },
  {
    id: "badge-opstandeling",
    title: "Opstandeling",
    shortLabel: "6.3",
    description: "6.3 beheerst",
    accent: "amber",
    levelId: "section-6-3",
  },
  {
    id: "badge-republiekbouwer",
    title: "Republiekbouwer",
    shortLabel: "6.4",
    description: "6.4 beheerst",
    accent: "red",
    levelId: "section-6-4",
  },
  {
    id: "badge-begrippenbaas",
    title: "Begrippenbaas",
    shortLabel: "BB",
    description: "Begrippenmix beheerst",
    accent: "green",
    levelId: "terms-mix",
  },
  {
    id: "badge-boss-verslagen",
    title: "Boss Verslagen",
    shortLabel: "B",
    description: "Boss Level gehaald",
    accent: "purple",
    levelId: "boss-level",
  },
];

function getSectionScore(section: string, questionProgress: QuestionProgress): number {
  return getQuestionSetProgress(getQuestionsBySection(section), questionProgress).progressPercent;
}

export function getBadgeProgressPercent(
  badge: BadgeDefinition,
  progress: ProgressState,
  questionProgress: QuestionProgress,
): number {
  switch (badge.levelId) {
    case "section-6-1":
      return getSectionScore(section61, questionProgress);
    case "section-6-2":
      return getSectionScore(section62, questionProgress);
    case "section-6-3":
      return getSectionScore(section63, questionProgress);
    case "section-6-4":
      return Math.max(getSectionScore(section64, questionProgress), progress.timeline.bestScore);
    case "terms-mix":
      return Math.max(getSectionScore(termsSection, questionProgress), progress.terms.bestScore);
    case "boss-level":
      return progress.boss.bestScore;
    default:
      return 0;
  }
}

export function getEarnedQuestBadges(
  progress: ProgressState,
  questionProgress: QuestionProgress,
): readonly BadgeDefinition[] {
  return questBadges.filter(
    (badge) => getBadgeProgressPercent(badge, progress, questionProgress) >= MASTERY_PERCENTAGE,
  );
}

export function getEarnedQuestBadgeNames(
  progress: ProgressState,
  questionProgress: QuestionProgress,
): readonly string[] {
  return getEarnedQuestBadges(progress, questionProgress).map((badge) => badge.title);
}

export function getVisibleQuestBadgeNames(earnedBadges: readonly string[]): readonly string[] {
  const earned = new Set(earnedBadges);

  return questBadges.filter((badge) => earned.has(badge.title)).map((badge) => badge.title);
}

export function getBadgeForLevel(level: LevelDefinition): BadgeDefinition | undefined {
  return questBadges.find((badge) => badge.levelId === level.id);
}
