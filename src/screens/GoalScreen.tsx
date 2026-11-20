import { Contraste, Logo } from '../components/Logo';
import { ProgressRing } from '../components/ProgressRing';
import { TxRow } from '../components/TxRow';
import type { Tx } from '../lib/db';
import { brl, pct } from '../lib/format';
import { useGoal } from '../lib/hooks';
import { sortTx } from '../lib/summary';

export function GoalScreen({ onEdit, onAdd, onSettings }: { onEdit: (t: Tx) => void; onAdd: () => void; onSettings: () => void }) {
  const g = useGoal();
  if (!g) return <div className="screen" />;
  const { goal, stats, entries } = g;
  const remaining = Math.max(0, goal.target - stats.saved);
  const progress = goal.target > 0 ? Math.min(1, Math.max(0, stats.saved / goal.target)) : 0;

  return (
    <div className="screen">
      <header className="top"><Logo /><button className="link" onClick={onSettings}>Editar meta</button></header>
      <div className="capa">
        <img src={`${import.meta.env.BASE_URL}img/m3-externa.webp`} alt="" width={736} height={981} />
        <div className="capa-texto">
          <span className="rotulo">Meta · {brl(goal.target)}</span>
          <h1><Contraste text={goal.name} /></h1>
        </div>
      </div>

      <section className="card center">
        <span className="rotulo">Falta</span>
        <strong className="big">{brl(remaining)}</strong>
        <ProgressRing value={progress}>
          <strong>{pct(progress, 1)}</strong>
          <small>{brl(stats.saved)}</small>
        </ProgressRing>
        <p className="muted small">guardados de {brl(goal.target)}</p>
        <button className="btn primary" onClick={onAdd}>Registrar aporte</button>
      </section>

      <section className="card">
        <h3><em>Histórico</em> da meta</h3>
        {entries.length === 0 ? <p className="empty">Nenhum aporte ainda.</p> : sortTx(entries).slice(0, 30).map((t) => <TxRow key={t.id} tx={t} onClick={() => onEdit(t)} />)}
      </section>
    </div>
  );
}
