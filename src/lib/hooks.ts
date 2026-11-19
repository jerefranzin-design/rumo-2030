import { useLiveQuery } from 'dexie-react-hooks';
import { db, getGoal } from './db';
import { computeGoal } from './finance';

export function useGoal() {
  const goal = useLiveQuery(getGoal);
  const entries = useLiveQuery(() => db.tx.where('type').equals('goal').toArray());
  if (!goal || !entries) return null;
  return { goal, entries, stats: computeGoal(goal, entries) };
}

export function useMonthTx(month: string) {
  return useLiveQuery(() => db.tx.where('date').startsWith(month).toArray(), [month]);
}
