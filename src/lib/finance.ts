import type { Goal, Tx } from './db';
import { addMonths, currentMonth, monthsBetween } from './format';

export const monthlyRate = (annual: number) => Math.pow(1 + annual, 1 / 12) - 1;

/** Aporte mensal necessário para sair de `saved` e chegar em `target` em `n` meses com juros mensais `r`. */
export function requiredMonthly(saved: number, target: number, n: number, r: number) {
  if (n <= 0) return Math.max(0, target - saved);
  const g = Math.pow(1 + r, n);
  const pmt = r === 0 ? (target - saved) / n : ((target - saved * g) * r) / (g - 1);
  return Math.max(0, pmt);
}

export interface GoalStats {
  saved: number;
  months: number;
  targetAtDeadline: number;
  progress: number;
  neededMonthly: number;
  pace: number;
  etaMonths: number | null;
  etaYM: string | null;
  onTrack: boolean;
  savedThisMonth: number;
  series: { ym: string; saved: number; price: number }[];
}

const MAX_MONTHS = 600;

export function computeGoal(goal: Goal, entries: Tx[]): GoalStats {
  const now = currentMonth();
  const saved = goal.initialSaved + entries.reduce((s, t) => s + t.amount, 0);
  const months = Math.max(0, monthsBetween(now, goal.deadline));
  const r = monthlyRate(goal.annualReturn);
  const i = monthlyRate(goal.annualPriceIncrease);
  const priceAt = (n: number) => goal.target * Math.pow(1 + i, n);
  const targetAtDeadline = priceAt(months);
  const neededMonthly = requiredMonthly(saved, targetAtDeadline, months, r);

  // ritmo = média de aportes dos últimos 3 meses (incluindo o atual)
  const window = new Set([0, -1, -2].map((k) => addMonths(now, k)));
  const aportes = entries.filter((t) => t.category === 'Aporte' && window.has(t.date.slice(0, 7)));
  const pace = aportes.reduce((s, t) => s + t.amount, 0) / 3;
  const savedThisMonth = entries.filter((t) => t.date.startsWith(now)).reduce((s, t) => s + t.amount, 0);

  // quando chega no ritmo atual
  let etaMonths: number | null = null;
  let bal = saved;
  for (let n = 0; n <= MAX_MONTHS; n++) {
    if (bal >= priceAt(n)) { etaMonths = n; break; }
    bal = bal * (1 + r) + pace;
  }

  const horizon = Math.min(MAX_MONTHS, Math.max(months, etaMonths ?? months, 12));
  const series: GoalStats['series'] = [];
  bal = saved;
  for (let n = 0; n <= horizon; n++) {
    series.push({ ym: addMonths(now, n), saved: bal, price: priceAt(n) });
    bal = bal * (1 + r) + pace;
  }

  return {
    saved,
    months,
    targetAtDeadline,
    progress: targetAtDeadline > 0 ? Math.min(1, Math.max(0, saved / targetAtDeadline)) : 0,
    neededMonthly,
    pace,
    etaMonths,
    etaYM: etaMonths === null ? null : addMonths(now, etaMonths),
    onTrack: etaMonths !== null && etaMonths <= months,
    savedThisMonth,
    series
  };
}
