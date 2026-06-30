import type { ProgressState, ScreenKey } from "../types/game";
import { getTotalScore } from "../utils/scoring";

interface AppHeaderProps {
  currentScreen: ScreenKey;
  progress: ProgressState;
  totalXp: number;
  earnedBadgeCount: number;
  onNavigate: (screen: ScreenKey) => void;
}

const navItems: Array<{ screen: ScreenKey; label: string }> = [
  { screen: "start", label: "Start" },
  { screen: "map", label: "Levelkaart" },
  { screen: "progress", label: "Voortgang" },
];

export function AppHeader({
  currentScreen,
  progress,
  totalXp,
  earnedBadgeCount,
  onNavigate,
}: AppHeaderProps) {
  const totalScore = getTotalScore(progress);

  return (
    <header className="app-header">
      <button className="brand-button" type="button" onClick={() => onNavigate("start")}>
        <span className="brand-mark">GQ</span>
        <span>
          <span className="brand-name">GeschiedenisQuest</span>
          <span className="brand-subtitle">vmbo bk leerjaar 1</span>
        </span>
      </button>

      <nav className="top-nav" aria-label="Hoofdnavigatie">
        {navItems.map((item) => (
          <button
            className={currentScreen === item.screen ? "nav-button active" : "nav-button"}
            type="button"
            key={item.screen}
            onClick={() => onNavigate(item.screen)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="header-score" aria-label="Beloningen">
        <div>
          <span>XP</span>
          <strong>{totalXp}</strong>
        </div>
        <div>
          <span>Badges</span>
          <strong>{earnedBadgeCount}/6</strong>
        </div>
        <small>{totalScore}% score</small>
      </div>
    </header>
  );
}
