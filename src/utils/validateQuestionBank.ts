import { h6QuestionBank } from "../data/geschiedenisquest_h6_vraagbank_90";
import { EXPECTED_QUESTION_COUNT } from "./questions";

export interface QuestionBankValidationReport {
  totalQuestions: number;
  sectionCounts: Record<string, number>;
  errors: string[];
}

const demoMarkers = ["demo", "placeholder", "sample", "mock", "dummy", "lorem ipsum", "testvraag"];

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function hasDemoMarker(values: readonly unknown[]): boolean {
  return values.some((value) => {
    if (typeof value !== "string") {
      return false;
    }

    const normalizedValue = value.toLocaleLowerCase("nl-NL");

    return demoMarkers.some((marker) => normalizedValue.includes(marker));
  });
}

function logQuestionBankReport(report: QuestionBankValidationReport): void {
  console.groupCollapsed("GeschiedenisQuest vraagbankcontrole");
  console.info(`Totaal aantal vragen: ${report.totalQuestions}`);
  console.table(report.sectionCounts);

  if (report.totalQuestions !== EXPECTED_QUESTION_COUNT) {
    console.warn(
      `Vraagbank waarschuwing: verwacht ${EXPECTED_QUESTION_COUNT} vragen, maar vond ${report.totalQuestions}.`,
    );
  }

  if (report.errors.length > 0) {
    console.warn("Fouten in de vraagbank:", report.errors);
  } else {
    console.info("Geen fouten in de vraagbank gevonden.");
  }

  console.groupEnd();
}

export function validateQuestionBank({ log = false } = {}): QuestionBankValidationReport {
  const ids = new Set<string>();
  const duplicateIds = new Set<string>();
  const errors: string[] = [];
  const sectionCounts: Record<string, number> = {};

  if (h6QuestionBank.length !== EXPECTED_QUESTION_COUNT) {
    errors.push(
      `Aantal vragen klopt niet: verwacht ${EXPECTED_QUESTION_COUNT}, gevonden ${h6QuestionBank.length}.`,
    );
  }

  h6QuestionBank.forEach((question, index) => {
    const label = question.id || `vraag op positie ${index + 1}`;

    if (isBlank(question.id)) {
      errors.push(`${label}: mist een id.`);
    } else if (ids.has(question.id)) {
      duplicateIds.add(question.id);
    } else {
      ids.add(question.id);
    }

    if (isBlank(question.question)) {
      errors.push(`${label}: mist een question.`);
    }

    if (isBlank(question.answer)) {
      errors.push(`${label}: mist een answer.`);
    }

    if (isBlank(question.explanation)) {
      errors.push(`${label}: mist een explanation.`);
    }

    if (isBlank(question.section)) {
      errors.push(`${label}: mist een section.`);
    } else {
      sectionCounts[question.section] = (sectionCounts[question.section] ?? 0) + 1;
    }

    if (isBlank(question.learningGoal)) {
      errors.push(`${label}: mist een learningGoal.`);
    }

    if (question.type === "multiple_choice" && question.options.length < 4) {
      errors.push(`${label}: multiple_choice heeft minder dan 4 opties.`);
    }

    if (
      hasDemoMarker([
        question.id,
        question.chapter,
        question.section,
        question.learningGoal,
        question.type,
        question.question,
        question.answer,
        question.explanation,
        ...question.options,
        ...question.tags,
      ])
    ) {
      errors.push(`${label}: bevat een demo- of placeholdermarkering.`);
    }
  });

  duplicateIds.forEach((id) => errors.push(`Dubbel id gevonden: ${id}.`));

  const report = {
    totalQuestions: h6QuestionBank.length,
    sectionCounts,
    errors,
  };

  if (log) {
    logQuestionBankReport(report);
  }

  return report;
}
