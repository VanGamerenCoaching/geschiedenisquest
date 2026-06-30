import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const expectedQuestionCount = 90;
const demoMarkers = ["demo", "placeholder", "sample", "mock", "dummy", "lorem ipsum", "testvraag"];
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const questionBankPath = resolve(projectRoot, "src/data/geschiedenisquest_h6_vraagbank_90.ts");
const source = readFileSync(questionBankPath, "utf8");
const questionBankMatch = source.match(
  /export const h6QuestionBank =\s*([\s\S]*?)\s*] as const satisfies readonly Question\[\];/,
);

if (!questionBankMatch) {
  console.error("Vraagbankvalidatie mislukt: kon h6QuestionBank niet vinden.");
  process.exit(1);
}

const questions = JSON.parse(`${questionBankMatch[1]}]`);
const ids = new Set();
const duplicateIds = new Set();
const errors = [];
const sectionCounts = {};

function isBlank(value) {
  return typeof value !== "string" || value.trim().length === 0;
}

function hasDemoMarker(values) {
  return values.some((value) => {
    if (typeof value !== "string") {
      return false;
    }

    const normalizedValue = value.toLocaleLowerCase("nl-NL");

    return demoMarkers.some((marker) => normalizedValue.includes(marker));
  });
}

if (questions.length !== expectedQuestionCount) {
  errors.push(`Aantal vragen klopt niet: verwacht ${expectedQuestionCount}, gevonden ${questions.length}.`);
}

questions.forEach((question, index) => {
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

console.log(`Totaal aantal vragen: ${questions.length}`);
console.table(sectionCounts);

if (errors.length > 0) {
  console.error("Fouten in de vraagbank:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Vraagbankvalidatie geslaagd: geen fouten gevonden.");
