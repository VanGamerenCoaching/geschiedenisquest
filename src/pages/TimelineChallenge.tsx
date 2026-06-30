import { useMemo, useState } from "react";
import { PageShell } from "../components/PageShell";
import { ProgressMeter } from "../components/ProgressMeter";
import type { ActivityKey, ScreenKey } from "../types/game";
import type { QuestionProgress } from "../types/question";
import {
  getShuffledTimelineEvents,
  getTimelineEvents,
  type TimelineEvent,
} from "../utils/questions";
import { calculatePercent } from "../utils/scoring";

interface TimelineChallengeProps {
  selectedSection?: string;
  onComplete: (activity: ActivityKey, score: number, results?: QuestionProgress) => void;
  onNavigate: (screen: ScreenKey) => void;
}

function buildTimelineProgress(
  events: readonly TimelineEvent[],
  correctEvents: readonly TimelineEvent[],
): QuestionProgress {
  const correctById = new Set(correctEvents.map((event) => event.id));

  return Object.fromEntries(
    events.map((event) => [
      event.sourceQuestion.id,
      {
        selectedAnswer: `${event.year} - ${event.title}`,
        isCorrect: correctById.has(event.id),
      },
    ]),
  );
}

export function TimelineChallenge({ selectedSection, onComplete, onNavigate }: TimelineChallengeProps) {
  const correctOrder = useMemo(() => getTimelineEvents(), []);
  const [events, setEvents] = useState<readonly TimelineEvent[]>(() => getShuffledTimelineEvents());
  const [checked, setChecked] = useState(false);
  const [wrongEvents, setWrongEvents] = useState<readonly TimelineEvent[]>([]);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);

  const correctEvents = events.filter((event, index) => event.id === correctOrder[index]?.id);
  const score = calculatePercent(correctEvents.length, correctOrder.length);
  const isPerfect = checked && wrongEvents.length === 0;

  function move(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= events.length || checked) {
      return;
    }

    setEvents((current) => {
      const next = [...current];
      const [movedEvent] = next.splice(index, 1);
      next.splice(targetIndex, 0, movedEvent);

      return next;
    });
  }

  function checkTimeline() {
    const wrongPlacedEvents = events.filter((event, index) => event.id !== correctOrder[index]?.id);
    const nextScore = calculatePercent(events.length - wrongPlacedEvents.length, correctOrder.length);

    setChecked(true);
    setWrongEvents(wrongPlacedEvents);
    setSubmittedScore(nextScore);
    onComplete("timeline", nextScore, buildTimelineProgress(events, correctEvents));
  }

  function resetTimeline() {
    setEvents(getShuffledTimelineEvents());
    setChecked(false);
    setWrongEvents([]);
    setSubmittedScore(null);
  }

  return (
    <PageShell
      kicker="Tijdlijn Challenge"
      title={
        selectedSection
          ? `Jaartallen oefenen: ${selectedSection}`
          : "Zet de gebeurtenissen in de juiste volgorde"
      }
      onBack={() => onNavigate("map")}
      aside={
        <>
          <h2>Tijdlijn-score</h2>
          <ProgressMeter value={score} label="Op juiste plek" />
          <div className="stat-list">
            <div>
              <span>Juiste posities</span>
              <strong>
                {correctEvents.length}/{correctOrder.length}
              </strong>
            </div>
            <div>
              <span>Fouten lokaal</span>
              <strong>{wrongEvents.length}</strong>
            </div>
          </div>
          <button className="primary-button full" type="button" disabled={checked} onClick={checkTimeline}>
            Controleer tijdlijn
          </button>
          <button className="secondary-button full" type="button" onClick={resetTimeline}>
            Opnieuw schudden
          </button>
          {submittedScore !== null && (
            <p className="result-note">Tijdlijn-score opgeslagen: {submittedScore}%</p>
          )}
        </>
      }
    >
      <div className="timeline-list">
        {events.map((event, index) => {
          const isCorrectPosition = checked && event.id === correctOrder[index]?.id;
          const isWrongPosition = checked && event.id !== correctOrder[index]?.id;

          return (
            <article
              className={`timeline-item ${isCorrectPosition ? "correct" : ""} ${
                isWrongPosition ? "wrong" : ""
              }`}
              key={event.id}
            >
              <div className="timeline-position">{index + 1}</div>
              <div className="timeline-copy">
                <strong>{event.title}</strong>
                <span>{event.year}</span>
                {checked && <p>{event.explanation}</p>}
              </div>
              <div className="move-actions">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0 || checked}>
                  Omhoog
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === events.length - 1 || checked}
                >
                  Omlaag
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {checked && (
        <section className={isPerfect ? "timeline-feedback correct" : "timeline-feedback wrong"}>
          <div>
            <h2>{isPerfect ? "Alles staat goed" : "Nog niet helemaal goed"}</h2>
            <p>
              Score: {correctEvents.length}/{correctOrder.length} goed ({score}%).
            </p>
          </div>
          {!isPerfect && (
            <div className="correct-order-list">
              <h3>Juiste volgorde</h3>
              {correctOrder.map((event, index) => (
                <article key={event.id}>
                  <span>{index + 1}</span>
                  <strong>{event.year}</strong>
                  <p>{event.title}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </PageShell>
  );
}
