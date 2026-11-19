import { useState } from 'react';
import { MonthPicker } from '../components/MonthPicker';
import { TxRow } from '../components/TxRow';
import type { Tx, TxType } from '../lib/db';
import { brl, dayLabel } from '../lib/format';
import { useMonthTx } from '../lib/hooks';
import { sortTx } from '../lib/summary';

const FILTERS: { key: TxType | 'all'; label: string }[] = [
  { key: 'all', label: 'Tudo' }, { key: 'expense', label: 'Despesas' }, { key: 'income', label: 'Receitas' }, { key: 'goal', label: 'Meta' }
];

export function Transactions({ month, setMonth, onEdit }: { month: string; setMonth: (m: string) => void; onEdit: (t: Tx) => void }) {
  const [filter, setFilter] = useState<TxType | 'all'>('all');
  const [q, setQ] = useState('');
  const all = useMonthTx(month) ?? [];
  const needle = q.trim().toLowerCase();
  const list = sortTx(all).filter((t) =>
    (filter === 'all' || t.type === filter) &&
    (!needle || `${t.description} ${t.category}`.toLowerCase().includes(needle))
  );

  const groups = new Map<string, Tx[]>();
  for (const t of list) groups.set(t.date, [...(groups.get(t.date) ?? []), t]);

  return (
    <div className="screen">
      <header className="top"><MonthPicker month={month} setMonth={setMonth} /></header>
      <div className="chips scroll">
        {FILTERS.map((f) => (
          <button key={f.key} className={`chip ${filter === f.key ? 'on' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>
        ))}
      </div>
      <input className="search" placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} />

      {list.length === 0 && <p className="empty">Nada por aqui.</p>}
      {[...groups.entries()].map(([date, items]) => {
        const net = items.reduce((s, t) => s + (t.type === 'income' ? t.amount : -Math.abs(t.amount)), 0);
        return (
          <section key={date} className="card day">
            <div className="day-head"><span>{dayLabel(date)}</span><small className="muted">{brl(net)}</small></div>
            {items.map((t) => <TxRow key={t.id} tx={t} onClick={() => onEdit(t)} />)}
          </section>
        );
      })}
    </div>
  );
}
