export interface Question {
  id: string;
  chapter: string;
  section: string;
  learningGoal: string;
  type: string;
  difficulty: number;
  question: string;
  options: readonly string[];
  answer: string;
  explanation: string;
  tags: readonly string[];
}

export interface QuestionResult {
  selectedAnswer: string;
  isCorrect: boolean;
}

export type QuestionProgress = Record<string, QuestionResult>;

export interface RepairQuestionStats {
  questionId: string;
  correctCount: number;
  wrongCount: number;
  lastAnsweredAt: string;
  mastered: boolean;
}

export interface LocalProgress {
  questions: Record<string, RepairQuestionStats>;
  earnedBadges: string[];
  totalXp: number;
}

export type RepairProgress = LocalProgress;
