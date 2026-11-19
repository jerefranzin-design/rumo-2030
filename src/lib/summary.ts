import type { Tx } from './db';

export function summarize(txs: Tx[]) {
  let income = 0, expense = 0, saved = 0;
  const byCat = new Map<string, number>();
  for (const t of txs) {
    if (t.type === 'income') income += t.amount;
    else if (t.type === 'expense') {
      expense += t.amount;
      byCat.set(t.category, (byCat.get(t.category) ?? 0) + t.amount);
    } else if (t.category !== 'Rendimento') saved += t.amount; // rendimento não sai do seu bolso
  }
  const categories = [...byCat.entries()].sort((a, b) => b[1] - a[1]);
  return { income, expense, saved, free: income - expense - saved, categories };
}

export function sortTx(txs: Tx[]) {
  return [...txs].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
}
