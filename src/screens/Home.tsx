import { MonthPicker } from '../components/MonthPicker';
import { TxRow } from '../components/TxRow';
import type { Tx } from '../lib/db';
import { brl, durationLabel, pct } from '../lib/format';
import { useGoal, useMonthTx } from '../lib/hooks';
import { sortTx, summarize } from '../lib/summary';

interface Props { month: string; setMonth: (m: string) => void; onEdit: (t: Tx) => void; goTo: (tab: 'goal' | 'tx') => void }

export function Home({ month, setMonth, onEdit, goTo }: Props) {
  const txs = useMonthTx(month) ?? [];
  const g = useGoal();
  const s = summarize(txs);
  const recent = sortTx(txs).slice(0, 5);
  const maxCat = s.categories[0]?.[1] ?? 1;

  return (
    <div className="screen">
      <header className="top">
        <MonthPicker month={month} setMonth={setMonth} />
      </header>

      <section className="hero card">
        <span className="label">Sobrou no mês</span>
        <strong className={`big ${s.free < 0 ? 'neg' : ''}`}>{brl(s.free)}</strong>
        <div className="kpis">
          <div><span className="label">Receitas</span><b className="pos">{brl(s.income)}</b></div>
          <div><span className="label">Despesas</span><b className="neg">{brl(s.expense)}</b></div>
          <div><span className="label">Guardado</span><b className="acc">{brl(s.saved)}</b></div>
        </div>
      </section>

      {g && (
        <button className="card goal-mini" onClick={() => goTo('goal')}>
          <div className="goal-mini-head">
            <span className="label">Meta · {g.goal.name}</span>
            <b>{pct(g.stats.progress, 1)}</b>
          </div>
          <div className="bar"><i style={{ width: `${g.stats.progress * 100}%` }} /></div>
          <div className="goal-mini-foot">
            <span>{brl(g.stats.saved)} guardados</span>
            <span>
              {g.stats.months > 0
                ? <>guarde <b>{brl(g.stats.neededMonthly)}</b>/mês</>
                : 'prazo chegou'}
            </span>
          </div>
          {g.stats.months > 0 && <small className="muted">Faltam {durationLabel(g.stats.months)}</small>}
        </button>
      )}

      {s.categories.length > 0 && (
        <section className="card">
          <h3>Para onde foi o dinheiro</h3>
          <ul className="cat-bars">
            {s.categories.map(([cat, v]) => (
              <li key={cat}>
                <div className="cat-line"><span>{cat}</span><span>{brl(v)} <small className="muted">{pct(v / s.expense)}</small></span></div>
                <div className="bar thin"><i style={{ width: `${(v / maxCat) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        <div className="card-head">
          <h3>Últimos lançamentos</h3>
          {txs.length > 5 && <button className="link" onClick={() => goTo('tx')}>Ver todos</button>}
        </div>
        {recent.length === 0 ? (
          <p className="empty">Nenhum lançamento neste mês. Toque em <b>+</b> para começar.</p>
        ) : (
          recent.map((t) => <TxRow key={t.id} tx={t} onClick={() => onEdit(t)} />)
        )}
      </section>
    </div>
  );
}
