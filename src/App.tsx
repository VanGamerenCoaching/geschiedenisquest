import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { BossLevel } from "./pages/BossLevel";
import { LevelMap } from "./pages/LevelMap";
import { MistakeRepair } from "./pages/MistakeRepair";
import { ProgressOverview } from "./pages/ProgressOverview";
import { QuizQuest } from "./pages/QuizQuest";
import { StartScreen } from "./pages/StartScreen";
import { TermsBattle } from "./pages/TermsBattle";
import { TimelineChallenge } from "./pages/TimelineChallenge";
import type { ActivityKey, ScreenKey } from "./types/game";
import type { QuestionProgress, RepairProgress } from "./types/question";
import type { LevelDefinition } from "./data/levels";
import { getEarnedQuestBadgeNames, getVisibleQuestBadgeNames } from "./utils/badges";
import { createInitialProgress, updateProgress } from "./utils/scoring";
import {
  awardEarnedBadges,
  clearRepairProgress,
  createEmptyRepairProgress,
  loadRepairProgress,
  saveRepairProgress,
  updateRepairProgress,
} from "./utils/repairProgress";

function App() {
  const [screen, setScreen] = useState<ScreenKey>("start");
  const [progress, setProgress] = useState(createInitialProgress);
  const [questionProgress, setQuestionProgress] = useState<QuestionProgress>({});
  const [repairProgress, setRepairProgress] = useState<RepairProgress>(loadRepairProgress);
  const [selectedSection, setSelectedSection] = useState<string | undefined>();
  const earnedQuestBadgeNames = useMemo(
    () => getEarnedQuestBadgeNames(progress, questionProgress),
    [progress, questionProgress],
  );
  const earnedQuestBadgeKey = earnedQuestBadgeNames.join("|");
  const visibleQuestBadgeNames = useMemo(
    () => getVisibleQuestBadgeNames([...repairProgress.earnedBadges, ...earnedQuestBadgeNames]),
    [repairProgress.earnedBadges, earnedQuestBadgeNames],
  );

  useEffect(() => {
    if (earnedQuestBadgeNames.length === 0) {
      return;
    }

    setRepairProgress((current) => {
      if (earnedQuestBadgeNames.every((badgeName) => current.earnedBadges.includes(badgeName))) {
        return current;
      }

      const next = awardEarnedBadges(current, earnedQuestBadgeNames);

      saveRepairProgress(next);
      return next;
    });
  }, [earnedQuestBadgeKey]);

  function navigate(screenKey: ScreenKey) {
    setSelectedSection(undefined);
    setScreen(screenKey);
  }

  function openLevel(level: LevelDefinition) {
    setSelectedSection(level.section);
    setScreen(level.screen);
  }

  function chooseQuizSection(section: string) {
    setSelectedSection(section);
    setScreen("quiz");
  }

  function completeActivity(activity: ActivityKey, score: number, results?: QuestionProgress) {
    setProgress((current) => updateProgress(current, activity, score));

    if (results) {
      setQuestionProgress((current) => ({ ...current, ...results }));
      setRepairProgress((current) => {
        const next = updateRepairProgress(current, results);

        saveRepairProgress(next);
        return next;
      });
    }
  }

  function resetProgress() {
    setProgress(createInitialProgress());
    setQuestionProgress({});
    setRepairProgress(createEmptyRepairProgress());
    clearRepairProgress();
    setSelectedSection(undefined);
  }

  return (
    <div className="app">
      <AppHeader
        currentScreen={screen}
        progress={progress}
        totalXp={repairProgress.totalXp}
        earnedBadgeCount={visibleQuestBadgeNames.length}
        onNavigate={navigate}
      />
      {screen === "start" && (
        <StartScreen
          progress={progress}
          repairProgress={repairProgress}
          earnedBadgeNames={visibleQuestBadgeNames}
          onNavigate={navigate}
        />
      )}
      {screen === "map" && (
        <LevelMap
          progress={progress}
          questionProgress={questionProgress}
          earnedBadgeNames={visibleQuestBadgeNames}
          onNavigate={navigate}
          onOpenLevel={openLevel}
        />
      )}
      {screen === "quiz" && (
        <QuizQuest
          key={selectedSection ?? "choose-level"}
          selectedSection={selectedSection}
          onChooseSection={chooseQuizSection}
          onComplete={completeActivity}
          onNavigate={navigate}
        />
      )}
      {screen === "terms" && (
        <TermsBattle
          selectedSection={selectedSection}
          onComplete={completeActivity}
          onNavigate={navigate}
        />
      )}
      {screen === "timeline" && (
        <TimelineChallenge
          selectedSection={selectedSection}
          onComplete={completeActivity}
          onNavigate={navigate}
        />
      )}
      {screen === "repair" && (
        <MistakeRepair
          repairProgress={repairProgress}
          onComplete={completeActivity}
          onNavigate={navigate}
        />
      )}
      {screen === "boss" && <BossLevel onComplete={completeActivity} onNavigate={navigate} />}
      {screen === "progress" && (
        <ProgressOverview
          progress={progress}
          repairProgress={repairProgress}
          earnedBadgeNames={visibleQuestBadgeNames}
          onNavigate={navigate}
          onReset={resetProgress}
        />
      )}
    </div>
  );
}

export default App;
