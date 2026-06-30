interface ProgressMeterProps {
  value: number;
  label: string;
}

export function ProgressMeter({ value, label }: ProgressMeterProps) {
  return (
    <div className="progress-meter">
      <div className="progress-label">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
