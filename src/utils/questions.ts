import { h6QuestionBank } from "../data/geschiedenisquest_h6_vraagbank_90";
import type { LevelDefinition } from "../data/levels";
import type { Question, QuestionProgress } from "../types/question";

export const EXPECTED_QUESTION_COUNT = 90;
export const MASTERY_PERCENTAGE = 80;
export const coreTerms = [
  "kolonie",
  "wereldhandel",
  "hervorming",
  "katholiek",
  "ketter",
  "protestant",
  "Beeldenstorm",
  "gewest",
  "landvoogd",
  "stadhouder",
  "Staten-Generaal",
  "watergeuzen",
] as const;

export interface QuestionSetProgress {
  totalQuestions: number;
  answeredQuestions: number;
  correctQuestions: number;
  progressPercent: number;
  mastered: boolean;
}

export interface TermBattleCard {
  term: string;
  definition: string;
  explanation: string;
  sourceQuestion: Question;
}

export interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  explanation: string;
  sourceQuestion: Question;
}

export const bossLevelSections = [
  "6.1 Ontdekkingsreizen en wereldhandel",
  "6.2 Nieuwe ideeën en de hervorming",
  "6.3 De Nederlanden komen in opstand",
  "6.4 Van opstand naar nieuw land",
  "Begrippenmix hoofdstuk 6",
] as const;

function assertQuestionBankComplete(questions: readonly Question[]): readonly Question[] {
  if (questions.length !== EXPECTED_QUESTION_COUNT) {
    throw new Error(
      `GeschiedenisQuest verwacht ${EXPECTED_QUESTION_COUNT} vragen, maar las ${questions.length} vragen in.`,
    );
  }

  return questions;
}

function normalize(value: string): string {
  return value.toLocaleLowerCase("nl-NL").trim();
}

function cleanDefinition(value: string): string {
  return value.replace(/[?.!]\s*$/, "").trim();
}

function findCoreTerm(value: string): string | undefined {
  const normalizedValue = normalize(value);

  return coreTerms.find((term) => normalizedValue.includes(normalize(term)));
}

function extractDefinitionFromQuestion(question: Question): string | undefined {
  const meaningMatch = question.question.match(/betekent:\s*(.*?)\??$/i);

  if (meaningMatch?.[1]) {
    return cleanDefinition(meaningMatch[1]);
  }

  return undefined;
}

function extractTermBattleCard(question: Question): TermBattleCard | undefined {
  const taggedTerm = question.tags.map(findCoreTerm).find(Boolean);
  const answerPair = question.answer.split(" - ");
  const pairTerm = answerPair.length >= 2 ? findCoreTerm(answerPair[0]) : undefined;
  const answerAsTerm = findCoreTerm(question.answer);
  const questionTerm = findCoreTerm(question.question);
  const term = taggedTerm ?? pairTerm ?? answerAsTerm ?? questionTerm;

  if (!term) {
    return undefined;
  }

  const definition =
    answerPair.length >= 2
      ? cleanDefinition(answerPair.slice(1).join(" - "))
      : answerAsTerm
        ? extractDefinitionFromQuestion(question)
        : cleanDefinition(question.answer);

  if (!definition) {
    return undefined;
  }

  return {
    term,
    definition,
    explanation: question.explanation,
    sourceQuestion: question,
  };
}

export function getAllQuestions(): readonly Question[] {
  return assertQuestionBankComplete(h6QuestionBank);
}

export function getQuestionsBySection(section: string): readonly Question[] {
  return getAllQuestions().filter((question) => question.section === section);
}

export function getRandomQuestions<T>(
  questions: readonly T[],
  count: number,
): readonly T[] {
  return [...questions].sort(() => Math.random() - 0.5).slice(0, Math.min(count, questions.length));
}

export function getQuizRoundQuestions(section: string, count = 10): readonly Question[] {
  return getRandomQuestions(getQuestionsBySection(section), count);
}

export function getVisibleOptions(question: Question): readonly string[] {
  if (question.type === "multiple_choice") {
    return question.options.slice(0, 4);
  }

  return question.options;
}

export function getQuestionsByType(type: string): readonly Question[] {
  return getAllQuestions().filter((question) => question.type === type);
}

export function getTimelineQuestions(): readonly Question[] {
  return getAllQuestions().filter((question) => {
    const timelineTags = question.tags.some((tag) => {
      const normalizedTag = normalize(tag);

      return (
        normalizedTag.includes("jaartal") ||
        normalizedTag.includes("tijdlijn") ||
        normalizedTag.includes("volgorde")
      );
    });

    return question.type === "timeline" || timelineTags;
  });
}

export function getTimelineEvents(): readonly TimelineEvent[] {
  const timelineQuestions = getTimelineQuestions();
  const eventDefinitions = [
    {
      year: 1492,
      title: "Columbus bereikt Amerika",
      match: "Columbus",
    },
    {
      year: 1566,
      title: "Beeldenstorm",
      match: "Beeldenstorm",
    },
    {
      year: 1568,
      title: "Begin van de Opstand / Tachtigjarige Oorlog",
      match: "1568",
    },
    {
      year: 1581,
      title: "Filips II wordt afgezet door de noordelijke gewesten",
      match: "1581",
    },
    {
      year: 1584,
      title: "Willem van Oranje wordt vermoord",
      match: "1584",
    },
    {
      year: 1588,
      title: "Republiek der Zeven Verenigde Nederlanden ontstaat",
      match: "1588",
    },
    {
      year: 1648,
      title: "Spanje erkent de Republiek bij de vrede van Münster",
      match: "1648",
    },
  ];

  return eventDefinitions.map((eventDefinition) => {
    const sourceQuestion =
      timelineQuestions.find((question) => {
        const searchableText = [
          question.question,
          question.answer,
          question.explanation,
          ...question.options,
          ...question.tags,
        ].join(" ");

        return (
          searchableText.includes(String(eventDefinition.year)) &&
          searchableText.toLocaleLowerCase("nl-NL").includes(
            eventDefinition.match.toLocaleLowerCase("nl-NL"),
          )
        );
      }) ??
      timelineQuestions.find((question) =>
        [question.question, question.answer, question.explanation, ...question.options, ...question.tags]
          .join(" ")
          .includes(String(eventDefinition.year)),
      );

    if (!sourceQuestion) {
      throw new Error(`Geen tijdlijnvraag gevonden voor ${eventDefinition.year}.`);
    }

    return {
      id: `timeline-${eventDefinition.year}`,
      year: eventDefinition.year,
      title: eventDefinition.title,
      explanation: sourceQuestion.explanation,
      sourceQuestion,
    };
  });
}

export function getShuffledTimelineEvents(): readonly TimelineEvent[] {
  const events = getTimelineEvents();

  return getRandomQuestions(events, events.length);
}

export function getTermBattleQuestions(): readonly Question[] {
  return getAllQuestions().filter(
    (question) =>
      question.type === "term_match" ||
      (question.type === "multiple_choice" &&
        question.tags.some((tag) => normalize(tag).includes("begrip"))),
  );
}

export function getTermBattleCards(): readonly TermBattleCard[] {
  return getTermBattleQuestions()
    .map(extractTermBattleCard)
    .filter((card): card is TermBattleCard => Boolean(card));
}

export function getBossLevelQuestions(): readonly Question[] {
  const questions = bossLevelSections.flatMap((section) =>
    getRandomQuestions(getQuestionsBySection(section), 4),
  );

  return getRandomQuestions(questions, 20);
}

export function getWrongQuestions(progress: QuestionProgress | undefined): readonly Question[] {
  if (!progress) {
    return [];
  }

  return getAllQuestions().filter((question) => progress[question.id]?.isCorrect === false);
}

export function getQuestionCount(): number {
  return getAllQuestions().length;
}

export function getLevelQuestions(level: LevelDefinition): readonly Question[] {
  if (level.isBoss) {
    return getBossLevelQuestions();
  }

  if (!level.section) {
    return [];
  }

  return getQuestionsBySection(level.section);
}

export function getQuestionSetProgress(
  questions: readonly Question[],
  progress: QuestionProgress,
): QuestionSetProgress {
  const totalQuestions = questions.length;
  const answeredQuestions = questions.filter((question) => progress[question.id]).length;
  const correctQuestions = questions.filter((question) => progress[question.id]?.isCorrect).length;
  const progressPercent =
    totalQuestions === 0 ? 0 : Math.round((correctQuestions / totalQuestions) * 100);

  return {
    totalQuestions,
    answeredQuestions,
    correctQuestions,
    progressPercent,
    mastered: progressPercent >= MASTERY_PERCENTAGE,
  };
}

export function createQuestionProgress(
  questions: readonly Question[],
  answers: Record<string, string>,
): QuestionProgress {
  return Object.fromEntries(
    questions.map((question) => [
      question.id,
      {
        selectedAnswer: answers[question.id] ?? "",
        isCorrect: answers[question.id] === question.answer,
      },
    ]),
  );
}

export function formatQuestionType(type: string): string {
  switch (type) {
    case "multiple_choice":
      return "Meerkeuze";
    case "true_false":
      return "Waar/niet waar";
    case "cause_effect":
      return "Oorzaak-gevolg";
    case "timeline":
      return "Tijdlijn";
    case "term_match":
      return "Begrip";
    default:
      return type;
  }
}
