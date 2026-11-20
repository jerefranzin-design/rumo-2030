export function ProgressRing({ value, size = 180, stroke = 4, children }: { value: number; size?: number; stroke?: number; children?: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--line)" strokeWidth={1} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="var(--acc)" strokeWidth={stroke} fill="none" strokeDasharray={c} strokeDashoffset={c * (1 - value)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset .8s ease' }}
        />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  );
}
