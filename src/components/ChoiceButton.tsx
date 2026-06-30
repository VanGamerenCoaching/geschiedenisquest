interface ChoiceButtonProps {
  children: string;
  selected: boolean;
  isCorrect?: boolean;
  isRevealed?: boolean;
  onClick: () => void;
}

export function ChoiceButton({
  children,
  selected,
  isCorrect = false,
  isRevealed = false,
  onClick,
}: ChoiceButtonProps) {
  const stateClass = isRevealed
    ? isCorrect
      ? "correct"
      : selected
        ? "wrong"
        : ""
    : selected
      ? "selected"
      : "";

  return (
    <button className={`choice-button ${stateClass}`} type="button" onClick={onClick}>
      {children}
    </button>
  );
}
