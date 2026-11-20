import { brlCompact, monthShort } from '../lib/format';

interface Point { ym: string; saved: number; price: number }

export function ProjectionChart({ series, deadline }: { series: Point[]; deadline: string }) {
  if (series.length < 2) return null;
  const W = 340, H = 180, pl = 8, pr = 8, pt = 12, pb = 22;
  const max = Math.max(...series.map((p) => Math.max(p.saved, p.price))) * 1.05 || 1;
  const x = (i: number) => pl + (i / (series.length - 1)) * (W - pl - pr);
  const y = (v: number) => pt + (1 - v / max) * (H - pt - pb);
  const line = (k: 'saved' | 'price') => series.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p[k]).toFixed(1)}`).join('');
  const area = `${line('saved')}L${x(series.length - 1)},${y(0)}L${x(0)},${y(0)}Z`;
  const di = series.findIndex((p) => p.ym === deadline);
  const ticks = [0, Math.floor((series.length - 1) / 2), series.length - 1];

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Projeção do valor guardado versus preço do carro">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ouro)" stopOpacity=".35" />
            <stop offset="100%" stopColor="var(--ouro)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={pl} x2={W - pr} y1={pt + f * (H - pt - pb)} y2={pt + f * (H - pt - pb)} stroke="var(--line)" />
        ))}
        {di > 0 && (
          <g>
            <line x1={x(di)} x2={x(di)} y1={pt} y2={H - pb} stroke="var(--line)" strokeDasharray="3 4" />
            <text x={x(di) - 4} y={pt + 10} textAnchor="end" className="chart-label">prazo</text>
          </g>
        )}
        <path d={area} fill="url(#areaGrad)" />
        <path d={line('price')} fill="none" stroke="var(--papel)" strokeOpacity={0.7} strokeWidth={2} strokeDasharray="5 4" />
        <path d={line('saved')} fill="none" stroke="var(--ouro)" strokeWidth={2} />
        {ticks.map((i) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? 'start' : i === series.length - 1 ? 'end' : 'middle'} className="chart-label">
            {monthShort(series[i].ym)}
          </text>
        ))}
      </svg>
      <div className="legend">
        <span><i style={{ background: 'var(--ouro)' }} /> Guardado no seu ritmo</span>
        <span><i className="dashed" /> Preço do carro ({brlCompact(series[series.length - 1].price)})</span>
      </div>
    </div>
  );
}
