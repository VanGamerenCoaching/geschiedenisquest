import { useMemo, useState } from "react";
import { ChoiceButton } from "../components/ChoiceButton";
import { PageShell } from "../components/PageShell";
import { ProgressMeter } from "../components/ProgressMeter";
import type { ActivityKey, ScreenKey } from "../types/game";
import type { QuestionProgress } from "../types/question";
import { calculatePercent } from "../utils/scoring";
import { coreTerms, getTermBattleCards, type TermBattleCard } from "../utils/questions";

interface TermsBattleProps {
  selectedSection?: string;
  onComplete: (activity: ActivityKey, score: number, results?: QuestionProgress) => void;
  onNavigate: (screen: ScreenKey) => void;
}

interface TermStats {
  correct: number;
  wrong: number;
  lastCorrect: boolean;
}

interface BattlePrompt {
  card: TermBattleCard;
  mode: "term-to-definition" | "definition-to-term";
  prompt: string;
  choices: readonly string[];
  correctAnswer: string;
}

const xpPerCorrectAnswer = 10;

function shuffle<T>(items: readonly T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function getTermKey(term: string): string {
  return term.toLocaleLowerCase("nl-NL");
}

function getUniqueValues(values: readonly string[]): string[] {
  return Array.from(new Set(values));
}

function getBattleChoices(correctAnswer: string, distractors: readonly string[]): readonly string[] {
  const wrongChoices = getUniqueValues(distractors.filter((value) => value !== correctAnswer));

  return shuffle([correctAnswer, ...shuffle(wrongChoices).slice(0, 3)]);
}

function createPrompt(card: TermBattleCard, cards: readonly TermBattleCard[]): BattlePrompt {
  const mode = Math.random() > 0.5 ? "term-to-definition" : "definition-to-term";

  if (mode === "term-to-definition") {
    return {
      card,
      mode,
      prompt: card.term,
      correctAnswer: card.definition,
      choices: getBattleChoices(
        card.definition,
        cards.map((item) => item.definition),
      ),
    };
  }

  return {
    card,
    mode,
    prompt: card.definition,
    correctAnswer: card.term,
    choices: getBattleChoices(
      card.term,
      cards.map((item) => item.term),
    ),
  };
}

function pickWeightedCard(
  cards: readonly TermBattleCard[],
  termStats: Record<string, TermStats>,
): TermBattleCard {
  const weightedCards = cards.flatMap((card) => {
    const stats = termStats[getTermKey(card.term)];
    const weight = stats?.lastCorrect ? 1 : Math.min(5, 1 + (stats?.wrong ?? 0) * 2);

    return Array.from({ length: weight }, () => card);
  });

  return weightedCards[Math.floor(Math.random() * weightedCards.length)] ?? cards[0];
}

export function TermsBattle({ selectedSection, onComplete, onNavigate }: TermsBattleProps) {
  const cards = useMemo(() => getTermBattleCards(), []);
  const [termStats, setTermStats] = useState<Record<string, TermStats>>({});
  const [questionResults, setQuestionResults] = useState<QuestionProgress>({});
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [savedScore, setSavedScore] = useState<number | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<BattlePrompt>(() =>
    createPrompt(pickWeightedCard(cards, {}), cards),
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const masteredTerms = coreTerms.filter((term) => termStats[getTermKey(term)]?.lastCorrect);
  const wrongTerms = coreTerms.filter((term) => (termStats[getTermKey(term)]?.wrong ?? 0) > 0);
  const score = calculatePercent(correctAnswers, answeredCount);
  const xp = correctAnswers * xpPerCorrectAnswer;
  const hasTenCorrectBadge = correctAnswers >= 10;
  const hasMasteryBadge = masteredTerms.length === coreTerms.length;
  const isCorrect = selectedAnswer === currentPrompt.correctAnswer;

  function answerCurrentPrompt(answer: string) {
    if (selectedAnswer) {
      return;
    }

    const answerIsCorrect = answer === currentPrompt.correctAnswer;
    const termKey = getTermKey(currentPrompt.card.term);

    setSelectedAnswer(answer);
    setAnsweredCount((current) => current + 1);
    setCorrectAnswers((current) => (answerIsCorrect ? current + 1 : current));
    setQuestionResults((current) => ({
      ...current,
      [currentPrompt.card.sourceQuestion.id]: {
        selectedAnswer: answer,
        isCorrect: answerIsCorrect,
      },
    }));
    setTermStats((current) => {
      const currentStats = current[termKey] ?? { correct: 0, wrong: 0, lastCorrect: false };

      return {
        ...current,
        [termKey]: {
          correct: currentStats.correct + (answerIsCorrect ? 1 : 0),
          wrong: currentStats.wrong + (answerIsCorrect ? 0 : 1),
          lastCorrect: answerIsCorrect,
        },
      };
    });
  }

  function nextPrompt() {
    setCurrentPrompt(createPrompt(pickWeightedCard(cards, termStats), cards));
    setSelectedAnswer(null);
  }

  function saveProgress() {
    const masteryScore = calculatePercent(masteredTerms.length, coreTerms.length);

    setSavedScore(masteryScore);
    onComplete("terms", masteryScore, questionResults);
  }

  if (cards.length === 0) {
    return (
      <PageShell
        kicker="Begrippen-Battle"
        title="Geen begrippen gevonden"
        onBack={() => onNavigate("map")}
      >
        <p className="feedback-line">De vaste vraagbank bevat geen bruikbare begrippenvragen.</p>
      </PageShell>
    );
  }

  return (
    <PageShell
      kicker="Begrippen-Battle"
      title={
        selectedSection
          ? `Kernbegrippen oefenen: ${selectedSection}`
          : "Kernbegrippen hoofdstuk 6"
      }
      onBack={() => onNavigate("map")}
      aside={
        <>
          <h2>Battle-status</h2>
          <ProgressMeter
            value={calculatePercent(masteredTerms.length, coreTerms.length)}
            label="Begrippen beheerst"
          />
          <div className="xp-panel">
            <span>XP</span>
            <strong>{xp}</strong>
          </div>
          <div className="stat-list">
            <div>
              <span>Goed</span>
              <strong>
                {correctAnswers}/{answeredCount}
              </strong>
            </div>
            <div>
              <span>Score</span>
              <strong>{score}%</strong>
            </div>
            <div>
              <span>Beheerst</span>
              <strong>
                {masteredTerms.length}/{coreTerms.length}
              </strong>
            </div>
            <div>
              <span>Fout gegaan</span>
              <strong>{wrongTerms.length}</strong>
            </div>
          </div>
          <div className="badge-list" aria-label="Badges">
            <span className={hasTenCorrectBadge ? "badge earned" : "badge"}>
              10 goede antwoorden
            </span>
            <span className={hasMasteryBadge ? "badge earned" : "badge"}>
              Alle begrippen beheerst
            </span>
          </div>
          <button className="secondary-button full" type="button" onClick={saveProgress}>
            Sla voortgang op
          </button>
          {savedScore !== null && (
            <p className="result-note">Begrippen-score opgeslagen: {savedScore}%</p>
          )}
        </>
      }
    >
      <section className="battle-arena" aria-label="Begrippen-Battle vraag">
        <div className="battle-prompt">
          <span>
            {currentPrompt.mode === "term-to-definition" ? "Kies de betekenis" : "Kies het begrip"}
          </span>
          <h2>{currentPrompt.prompt}</h2>
        </div>

        <div className="choice-grid">
          {currentPrompt.choices.map((choice) => (
            <ChoiceButton
              key={choice}
              selected={selectedAnswer === choice}
              isCorrect={currentPrompt.correctAnswer === choice}
              isRevealed={selectedAnswer !== null}
              onClick={() => answerCurrentPrompt(choice)}
            >
              {choice}
            </ChoiceButton>
          ))}
        </div>

        {selectedAnswer && (
          <div className={isCorrect ? "answer-feedback correct" : "answer-feedback wrong"}>
            <strong>{isCorrect ? "Goed" : "Fout"}</strong>
            <span>Juiste antwoord: {currentPrompt.correctAnswer}</span>
            <p>{currentPrompt.card.explanation}</p>
          </div>
        )}

        <button
          className="primary-button full"
          type="button"
          disabled={!selectedAnswer}
          onClick={nextPrompt}
        >
          Volgend begrip
        </button>
      </section>

      <section className="terms-progress" aria-label="Kernbegrippen voortgang">
        <h2>Kernbegrippen</h2>
        <div className="term-chip-grid">
          {coreTerms.map((term) => {
            const stats = termStats[getTermKey(term)];
            const stateClass = stats?.lastCorrect ? "mastered" : stats?.wrong ? "practice" : "";

            return (
              <span className={`term-chip ${stateClass}`} key={term}>
                {term}
              </span>
            );
          })}
        </div>
        <div className="wrong-term-list">
          <h3>Foute begrippen</h3>
          {wrongTerms.length === 0 ? (
            <p>Nog geen foute begrippen.</p>
          ) : (
            wrongTerms.map((term) => {
              const stats = termStats[getTermKey(term)];

              return (
                <span key={term}>
                  {term}: {stats?.wrong ?? 0} fout
                </span>
              );
            })
          )}
        </div>
      </section>
    </PageShell>
  );
}
