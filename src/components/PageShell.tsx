import type { ReactNode } from "react";
import type { ScreenKey } from "../types/game";

interface PageShellProps {
  kicker: string;
  title: string;
  children: ReactNode;
  aside?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  nextScreen?: ScreenKey;
  onNavigate?: (screen: ScreenKey) => void;
}

export function PageShell({
  kicker,
  title,
  children,
  aside,
  onBack,
  backLabel = "Terug",
  nextScreen,
  onNavigate,
}: PageShellProps) {
  return (
    <main className="page-shell">
      <section className="page-heading">
        <div>
          <p className="kicker">{kicker}</p>
          <h1>{title}</h1>
        </div>
        <div className="heading-actions">
          {onBack && (
            <button className="secondary-button" type="button" onClick={onBack}>
              {backLabel}
            </button>
          )}
          {nextScreen && onNavigate && (
            <button className="primary-button" type="button" onClick={() => onNavigate(nextScreen)}>
              Volgende
            </button>
          )}
        </div>
      </section>

      <div className={aside ? "page-grid" : "page-stack"}>
        <section className="content-panel">{children}</section>
        {aside && <aside className="side-panel">{aside}</aside>}
      </div>
    </main>
  );
}
