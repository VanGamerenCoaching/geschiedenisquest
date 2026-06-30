import { useEffect, useMemo, useState } from "react";
import { ChoiceButton } from "../components/ChoiceButton";
import { PageShell } from "../components/PageShell";
import { ProgressMeter } from "../components/ProgressMeter";
import { levels } from "../data/levels";
import type { ActivityKey, ScreenKey } from "../types/game";
import type { Question, QuestionProgress } from "../types/question";
import {
  createQuestionProgress,
  formatQuestionType,
  getLevelQuestions,
  getQuizRoundQuestions,
  getQuestionsByType,
  getVisibleOptions,
} from "../utils/questions";
import { calculatePercent } from "../utils/scoring";

interface QuizQuestProps {
  selectedSection?: string;
  onChooseSection: (section: string) => void;
  onComplete: (activity: ActivityKey, score: number, results?: QuestionProgress) => void;
  onNavigate: (screen: ScreenKey) => void;
}

const roundSize = 10;

export function QuizQuest({
  selectedSection,
  onChooseSection,
  onComplete,
  onNavigate,
}: QuizQuestProps) {
  const sectionLevels = useMemo(() => levels.filter((level) => level.section), []);
  const questions = useMemo(
    () =>
      selectedSection
        ? getQuizRoundQuestions(selectedSection, roundSize)
        : [
            ...getQuestionsByType("multiple_choice").slice(0, 8),
            ...getQuestionsByType("true_false").slice(0, 4),
          ],
    [selectedSection],
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);

  const correctCount = useMemo(
    () => questions.filter((question) => answers[question.id] === question.answer).length,
    [answers, questions],
  );
  const answeredCount = Object.keys(answers).length;
  const score = calculatePercent(correctCount, questions.length);
  const isComplete = answeredCount === questions.length;
  const wrongQuestions = questions.filter((question) => answers[question.id] !== question.answer);

  useEffect(() => {
    if (!isComplete || submittedScore !== null) {
      return;
    }

    setSubmittedScore(score);
    onComplete("quiz", score, createQuestionProgress(questions, answers));
  }, [answers, isComplete, onComplete, questions, score, submittedScore]);

  function answerQuestion(question: Question, answer: string) {
    setAnswers((current) => {
      if (current[question.id]) {
        return current;
      }

      return { ...current, [question.id]: answer };
    });
  }

  if (!selectedSection) {
    return (
      <PageShell
        kicker="Quiz Quest"
        title="Kies een level voor je quizronde"
        onBack={() => onNavigate("map")}
        aside={
          <>
            <h2>Ronde</h2>
            <div className="stat-list">
              <div>
                <span>Vragen per ronde</span>
                <strong>maximaal {roundSize}</strong>
              </div>
              <div>
                <span>Bron</span>
                <strong>vaste vraagbank</strong>
              </div>
            </div>
          </>
        }
      >
        <div className="level-grid">
          {sectionLevels.map((level, index) => {
            const levelQuestions = getLevelQuestions(level);

            return (
              <article className={`level-card accent-${level.accent}`} key={level.id}>
                <div className="level-card-topline">
                  <span>Level {index + 1}</span>
                  <strong>{levelQuestions.length} vragen</strong>
                </div>
                <h2>{level.title}</h2>
                <p>{level.description}</p>
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => level.section && onChooseSection(level.section)}
                >
                  Start Quiz Quest
                </button>
              </article>
            );
          })}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      kicker="Quiz Quest"
      title={`Oefen: ${selectedSection}`}
      onBack={() => onNavigate("map")}
      aside={
        <>
          <h2>Score</h2>
          <ProgressMeter value={score} label="Huidige score" />
          <div className="stat-list">
            <div>
              <span>Beantwoord</span>
              <strong>{answeredCount}/{questions.length}</strong>
            </div>
            <div>
              <span>Goed</span>
              <strong>{correctCount}</strong>
            </div>
          </div>
          {isComplete && (
            <>
              <button className="primary-button full" type="button" onClick={() => onNavigate("repair")}>
                Naar Foutjes Repareren
              </button>
              <button className="secondary-button full" type="button" onClick={() => onNavigate("map")}>
                Terug naar Levelkaart
              </button>
            </>
          )}
        </>
      }
    >
      <div className="question-list">
        {questions.map((question, questionIndex) => {
          const selected = answers[question.id];
          const isRevealed = selected !== undefined;
          const isCorrect = selected === question.answer;
          const visibleOptions = getVisibleOptions(question);

          return (
            <article className="question-card" key={question.id}>
              <span className="question-number">
                Vraag {questionIndex + 1} · {formatQuestionType(question.type)} · niveau{" "}
                {question.difficulty}
              </span>
              <h2>{question.question}</h2>
              <div className="choice-grid">
                {visibleOptions.map((option) => (
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

      {isComplete && (
        <section className="quiz-summary" aria-label="Quiz Quest resultaat">
          <div className="quiz-summary-heading">
            <div>
              <p className="kicker">Einde ronde</p>
              <h2>Score: {correctCount}/{questions.length}</h2>
            </div>
            <strong>{score}%</strong>
          </div>
          <ProgressMeter value={score} label="Percentage goed" />
          <div className="wrong-question-list">
            <h3>Fout beantwoorde vragen</h3>
            {wrongQuestions.length === 0 ? (
              <p>Geen fouten in deze ronde.</p>
            ) : (
              wrongQuestions.map((question) => (
                <article key={question.id}>
                  <strong>{question.question}</strong>
                  <span>Jouw antwoord: {answers[question.id]}</span>
                  <span>Juiste antwoord: {question.answer}</span>
                </article>
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
