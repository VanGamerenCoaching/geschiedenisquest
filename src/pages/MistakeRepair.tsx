import { useMemo, useState } from "react";
import { ChoiceButton } from "../components/ChoiceButton";
import { PageShell } from "../components/PageShell";
import { ProgressMeter } from "../components/ProgressMeter";
import type { ActivityKey, ScreenKey } from "../types/game";
import type { QuestionProgress, RepairProgress } from "../types/question";
import type { Question } from "../types/question";
import { getRepairQuestionCount, getWeightedRepairQuestions } from "../utils/repairProgress";
import { calculatePercent } from "../utils/scoring";

interface MistakeRepairProps {
  repairProgress: RepairProgress;
  onComplete: (activity: ActivityKey, score: number, results?: QuestionProgress) => void;
  onNavigate: (screen: ScreenKey) => void;
}

function buildQuestionProgress(
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

export function MistakeRepair({ repairProgress, onComplete, onNavigate }: MistakeRepairProps) {
  const questionsToRepairCount = getRepairQuestionCount(repairProgress);
  const questions = useMemo(
    () => getWeightedRepairQuestions(repairProgress, 6),
    [repairProgress],
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);

  const correctCount = useMemo(
    () => questions.filter((question) => answers[question.id] === question.answer).length,
    [answers, questions],
  );
  const answeredCount = Object.keys(answers).length;
  const score = calculatePercent(correctCount, questions.length);
  const isComplete = questions.length > 0 && answeredCount === questions.length;

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
    onComplete("repair", score, buildQuestionProgress(questions, answers));
  }

  if (questionsToRepairCount === 0) {
    return (
      <PageShell
        kicker="Foutjes Repareren"
        title="Mooi! Je hebt nog geen foutjes om te repareren."
        onBack={() => onNavigate("map")}
      >
        <div className="repair-empty-state">
          <h2>Alles rustig hier</h2>
          <p>Nieuwe foutjes verschijnen automatisch nadat je vragen in andere modi hebt geoefend.</p>
          <button className="primary-button" type="button" onClick={() => onNavigate("map")}>
            Terug naar Levelkaart
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      kicker="Foutjes Repareren"
      title="Oefen de vragen die eerder fout gingen"
      onBack={() => onNavigate("map")}
      aside={
        <>
          <h2>Reparatie-score</h2>
          <ProgressMeter value={score} label="Deze ronde" />
          <div className="stat-list">
            <div>
              <span>Te repareren</span>
              <strong>{questionsToRepairCount}</strong>
            </div>
            <div>
              <span>In deze ronde</span>
              <strong>
                {answeredCount}/{questions.length}
              </strong>
            </div>
            <div>
              <span>Goed</span>
              <strong>{correctCount}</strong>
            </div>
          </div>
          <button className="primary-button full" type="button" disabled={!isComplete} onClick={submit}>
            Sla reparatie op
          </button>
          {submittedScore !== null && (
            <p className="result-note">Reparatie-score opgeslagen: {submittedScore}%</p>
          )}
        </>
      }
    >
      <div className="repair-banner">
        Je hebt nog {questionsToRepairCount} vragen om te repareren.
      </div>

      <div className="question-list">
        {questions.map((question, index) => {
          const selected = answers[question.id];
          const isRevealed = selected !== undefined;
          const isCorrect = selected === question.answer;
          const stats = repairProgress.questions[question.id];

          return (
            <article className="question-card" key={question.id}>
              <span className="question-number">
                Foutje {index + 1} · eerder fout: {stats?.wrongCount ?? 0}x · goed sinds fout:{" "}
                {stats?.correctCount ?? 0}/2
              </span>
              <h2>{question.question}</h2>
              <div className="choice-grid">
                {question.options.map((choice) => (
                  <ChoiceButton
                    key={choice}
                    selected={selected === choice}
                    isCorrect={question.answer === choice}
                    isRevealed={isRevealed}
                    onClick={() => answerQuestion(question, choice)}
                  >
                    {choice}
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
    </PageShell>
  );
}
