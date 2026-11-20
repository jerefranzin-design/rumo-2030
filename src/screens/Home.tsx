import { Contraste, Logo } from '../components/Logo';
import { MonthPicker } from '../components/MonthPicker';
import { TxRow } from '../components/TxRow';
import type { Tx } from '../lib/db';
import { brl, pct } from '../lib/format';
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
      <header className="top"><Logo /><MonthPicker month={month} setMonth={setMonth} /></header>

      <section className="hero card">
        <div className="hero-top">
          <span className="rotulo">Sobrou no mês</span>
          <strong className={`big ${s.free < 0 ? 'neg' : ''}`}>{brl(s.free)}</strong>
        </div>
        <div className="kpis">
          <div><span className="rotulo">Receitas</span><b className="pos">{brl(s.income)}</b></div>
          <div><span className="rotulo">Despesas</span><b className="neg">{brl(s.expense)}</b></div>
          <div><span className="rotulo">Guardado</span><b className="acc">{brl(s.saved)}</b></div>
        </div>
      </section>

      {g && (
        <button className="card goal-mini" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}img/m3-interna.webp)` }} onClick={() => goTo('goal')}>
          <div className="goal-mini-head">
            <h3><Contraste text={g.goal.name} /></h3>
            <b>{pct(Math.min(1, g.stats.saved / g.goal.target), 1)}</b>
          </div>
          <div className="bar"><i style={{ width: `${Math.min(1, g.stats.saved / g.goal.target) * 100}%` }} /></div>
          <div className="goal-mini-foot">
            <span>{brl(g.stats.saved)} guardados</span>
            <span>faltam <b>{brl(Math.max(0, g.goal.target - g.stats.saved))}</b></span>
          </div>
        </button>
      )}

      {s.categories.length > 0 && (
        <section className="card">
          <h3><em>Para onde</em> foi o dinheiro</h3>
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
          <h3><em>Últimos</em> lançamentos</h3>
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
