import { useMemo, useState } from "react";
import { ChoiceButton } from "../components/ChoiceButton";
import { PageShell } from "../components/PageShell";
import { ProgressMeter } from "../components/ProgressMeter";
import type { ActivityKey, ScreenKey } from "../types/game";
import type { Question, QuestionProgress } from "../types/question";
import {
  bossLevelSections,
  createQuestionProgress,
  formatQuestionType,
  getBossLevelQuestions,
  getVisibleOptions,
} from "../utils/questions";
import { calculatePercent } from "../utils/scoring";

interface BossLevelProps {
  onComplete: (activity: ActivityKey, score: number, results?: QuestionProgress) => void;
  onNavigate: (screen: ScreenKey) => void;
}

interface SectionSummary {
  section: string;
  total: number;
  correct: number;
  percent: number;
  advice: string;
}

function getBossAdvice(percent: number): string {
  if (percent < 60) {
    return "Oefen dit level opnieuw.";
  }

  if (percent < 80) {
    return "Bijna goed, repareer je foutjes.";
  }

  return "Beheerst.";
}

function buildSectionSummaries(
  questions: readonly Question[],
  answers: Record<string, string>,
): SectionSummary[] {
  return bossLevelSections.map((section) => {
    const sectionQuestions = questions.filter((question) => question.section === section);
    const correct = sectionQuestions.filter(
      (question) => answers[question.id] === question.answer,
    ).length;
    const percent = calculatePercent(correct, sectionQuestions.length);

    return {
      section,
      total: sectionQuestions.length,
      correct,
      percent,
      advice: getBossAdvice(percent),
    };
  });
}

export function BossLevel({ onComplete, onNavigate }: BossLevelProps) {
  const questions = useMemo(() => getBossLevelQuestions(), []);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);

  const correctCount = useMemo(
    () => questions.filter((question) => answers[question.id] === question.answer).length,
    [answers, questions],
  );
  const answeredCount = Object.keys(answers).length;
  const score = calculatePercent(correctCount, questions.length);
  const isComplete = answeredCount === questions.length;
  const sectionSummaries = useMemo(
    () => buildSectionSummaries(questions, answers),
    [answers, questions],
  );
  const weakSections = sectionSummaries.filter((summary) => summary.percent < 80);

  function answerQuestion(question: Question, answer: string) {
    setAnswers((current) => {
      if (current[question.id]) {
        return current;
      }

      return { ...current, [question.id]: answer };
    });
  }

  function submit() {
    if (!isComplete) {
      return;
    }

    setSubmittedScore(score);
    onComplete("boss", score, createQuestionProgress(questions, answers));
  }

  return (
    <PageShell
      kicker="Boss Level"
      title="Eindronde: alles door elkaar"
      onBack={() => onNavigate("map")}
      aside={
        <>
          <h2>Boss-score</h2>
          <ProgressMeter value={score} label="Eindronde" />
          <div className="stat-list">
            <div>
              <span>Beantwoord</span>
              <strong>
                {answeredCount}/{questions.length}
              </strong>
            </div>
            <div>
              <span>Goed</span>
              <strong>{correctCount}</strong>
            </div>
            <div>
              <span>Norm</span>
              <strong>80%</strong>
            </div>
          </div>
          <button className="primary-button full" type="button" disabled={!isComplete} onClick={submit}>
            Versla Boss Level
          </button>
          {submittedScore !== null && (
            <button className="secondary-button full" type="button" onClick={() => onNavigate("repair")}>
              Naar Foutjes Repareren
            </button>
          )}
        </>
      }
    >
      <div className="question-list">
        {questions.map((question, questionIndex) => {
          const selected = answers[question.id];
          const isRevealed = selected !== undefined;
          const isCorrect = selected === question.answer;

          return (
            <article className="question-card boss-card" key={question.id}>
              <span className="question-number">
                {questionIndex + 1} · {question.section} · {formatQuestionType(question.type)}
              </span>
              <h2>{question.question}</h2>
              <div className="choice-grid">
                {getVisibleOptions(question).map((option) => (
                  <ChoiceButton
                    key={option}
                    selected={selected === option}
                    isCorrect={question.answer === option}
                    isRevealed={isRevealed}
                    onClick={() => answerQuestion(question, option)}
                  >
                    {option}
                  </ChoiceButton>
                ))}
              </div>
              {isRevealed && (
                <div className={isCorrect ? "answer-feedback correct" : "answer-feedback wrong"}>
                  <strong>{isCorrect ? "Goed" : "Fout"}</strong>
                  <span>Juiste antwoord: {question.answer}</span>
                  <p>{question.explanation}</p>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {submittedScore !== null && (
        <section className="boss-summary" aria-label="Boss Level resultaat">
          <div className="boss-summary-heading">
            <div>
              <p className="kicker">Resultaat</p>
              <h2>Totale score: {correctCount}/{questions.length}</h2>
            </div>
            <strong>{submittedScore}%</strong>
          </div>
          <ProgressMeter value={submittedScore} label="Boss Level percentage" />

          <div className="section-score-list">
            {sectionSummaries.map((summary) => (
              <article key={summary.section}>
                <div>
                  <h3>{summary.section}</h3>
                  <span>
                    {summary.correct}/{summary.total} goed
                  </span>
                </div>
                <strong>{summary.percent}%</strong>
                <p>{summary.advice}</p>
              </article>
            ))}
          </div>

          <div className="boss-advice-panel">
            <h3>Opnieuw oefenen</h3>
            {weakSections.length === 0 ? (
              <p>Alle onderdelen zijn beheerst.</p>
            ) : (
              weakSections.map((summary) => (
                <span key={summary.section}>{summary.section}: {summary.advice}</span>
              ))
            )}
          </div>

          <div className="summary-actions">
            <button className="primary-button" type="button" onClick={() => onNavigate("repair")}>
              Naar Foutjes Repareren
            </button>
            <button className="secondary-button" type="button" onClick={() => onNavigate("map")}>
              Terug naar Levelkaart
            </button>
          </div>
        </section>
      )}
    </PageShell>
  );
}
