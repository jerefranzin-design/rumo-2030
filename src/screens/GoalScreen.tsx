import { ProgressRing } from '../components/ProgressRing';
import { ProjectionChart } from '../components/ProjectionChart';
import { TxRow } from '../components/TxRow';
import type { Tx } from '../lib/db';
import { brl, durationLabel, monthLabel, pct } from '../lib/format';
import { useGoal } from '../lib/hooks';
import { sortTx } from '../lib/summary';

export function GoalScreen({ onEdit, onAdd, onSettings }: { onEdit: (t: Tx) => void; onAdd: () => void; onSettings: () => void }) {
  const g = useGoal();
  if (!g) return <div className="screen" />;
  const { goal, stats, entries } = g;
  const remaining = Math.max(0, stats.targetAtDeadline - stats.saved);
  const thisMonthPct = stats.neededMonthly > 0 ? Math.min(1, stats.savedThisMonth / stats.neededMonthly) : 1;

  return (
    <div className="screen">
      <header className="top goal-top">
        <div>
          <span className="label">Meta até {monthLabel(goal.deadline)}</span>
          <h1>{goal.name}</h1>
        </div>
        <button className="link" onClick={onSettings}>Editar</button>
      </header>

      <section className="card center">
        <ProgressRing value={stats.progress}>
          <strong>{pct(stats.progress, 1)}</strong>
          <small>{brl(stats.saved)}</small>
        </ProgressRing>
        <p className="muted small">
          Preço estimado em {monthLabel(goal.deadline)}: <b>{brl(stats.targetAtDeadline)}</b>
          <br />(hoje {brl(goal.target)} + {pct(goal.annualPriceIncrease, 1)} a.a.)
        </p>
      </section>

      <section className="grid2">
        <div className="card stat">
          <span className="label">Guardar por mês</span>
          <b className="acc">{brl(stats.neededMonthly)}</b>
          <small className="muted">por {durationLabel(stats.months)}</small>
        </div>
        <div className="card stat">
          <span className="label">Falta</span>
          <b>{brl(remaining)}</b>
          <small className="muted">rendendo {pct(goal.annualReturn, 1)} a.a.</small>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h3>Este mês</h3>
          <span className="muted">{brl(stats.savedThisMonth)} de {brl(stats.neededMonthly)}</span>
        </div>
        <div className="bar"><i style={{ width: `${thisMonthPct * 100}%` }} /></div>
        <button className="btn primary" onClick={onAdd}>Registrar aporte</button>
      </section>

      <section className={`card status ${stats.onTrack ? 'ok' : 'warn'}`}>
        <h3>{stats.onTrack ? 'No caminho certo' : stats.pace > 0 ? 'Precisa acelerar' : 'Comece a guardar'}</h3>
        <p>
          {stats.pace > 0 ? <>Seu ritmo (média dos últimos 3 meses): <b>{brl(stats.pace)}/mês</b>. </> : 'Ainda não há aportes recentes. '}
          {stats.etaYM
            ? <>Nesse ritmo você chega lá em <b>{monthLabel(stats.etaYM)}</b>{stats.onTrack ? ', dentro do prazo.' : `, ${durationLabel(stats.etaMonths! - stats.months)} depois do prazo.`}</>
            : stats.pace > 0 ? 'Nesse ritmo o rendimento não alcança a valorização do carro.' : ''}
        </p>
      </section>

      <section className="card">
        <h3>Projeção</h3>
        <ProjectionChart series={stats.series} deadline={goal.deadline} />
      </section>

      <section className="card">
        <h3>Histórico da meta</h3>
        {entries.length === 0 ? <p className="empty">Nenhum aporte ainda.</p> : sortTx(entries).slice(0, 30).map((t) => <TxRow key={t.id} tx={t} onClick={() => onEdit(t)} />)}
      </section>
    </div>
  );
}
