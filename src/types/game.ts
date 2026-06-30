export type ActivityKey = "quiz" | "terms" | "timeline" | "repair" | "boss";

export type ScreenKey =
  | "start"
  | "map"
  | "quiz"
  | "terms"
  | "timeline"
  | "repair"
  | "boss"
  | "progress";

export interface ActivityDefinition {
  key: ActivityKey;
  screen: ScreenKey;
  title: string;
  shortTitle: string;
  subtitle: string;
  focus: string;
  duration: string;
  accent: "blue" | "green" | "amber" | "red" | "purple";
}

export interface ActivityProgress {
  attempts: number;
  bestScore: number;
  completed: boolean;
}

export type ProgressState = Record<ActivityKey, ActivityProgress>;
