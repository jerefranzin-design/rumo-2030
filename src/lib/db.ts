import Dexie, { type Table } from 'dexie';

export type TxType = 'income' | 'expense' | 'goal';

export interface Tx {
  id?: number;
  type: TxType;
  /** centavos. Para 'goal': positivo = entra na meta, negativo = retirada */
  amount: number;
  category: string;
  description: string;
  /** YYYY-MM-DD */
  date: string;
  createdAt: number;
}

export interface Goal {
  name: string;
  /** preço de hoje, em centavos */
  target: number;
  /** YYYY-MM */
  deadline: string;
  /** quanto já tinha guardado antes de usar o app, em centavos */
  initialSaved: number;
  /** rendimento anual esperado do dinheiro guardado (0.12 = 12% a.a.) */
  annualReturn: number;
  /** quanto o preço do carro sobe por ano (0.05 = 5% a.a.) */
  annualPriceIncrease: number;
}

export const DEFAULT_GOAL: Goal = {
  name: 'M3 Competition',
  target: 1_000_000_00,
  deadline: '2030-12',
  initialSaved: 0,
  annualReturn: 0.12,
  annualPriceIncrease: 0.05
};

class AppDB extends Dexie {
  tx!: Table<Tx, number>;
  kv!: Table<{ key: string; value: unknown }, string>;
  constructor() {
    super('rumo2030');
    this.version(1).stores({ tx: '++id, date, type, category', kv: 'key' });
  }
}

export const db = new AppDB();

export const CATEGORIES: Record<TxType, string[]> = {
  expense: ['Moradia', 'Alimentação', 'Mercado', 'Transporte', 'Saúde', 'Lazer', 'Assinaturas', 'Compras', 'Educação', 'Outros'],
  income: ['Salário', 'Freelance', 'Vendas', 'Investimentos', 'Presente', 'Outros'],
  goal: ['Aporte', 'Rendimento', 'Retirada']
};

export async function getGoal(): Promise<Goal> {
  const row = await db.kv.get('goal');
  return { ...DEFAULT_GOAL, ...((row?.value as Partial<Goal>) ?? {}) };
}

export async function saveGoal(goal: Goal) {
  await db.kv.put({ key: 'goal', value: goal });
}

export async function exportData() {
  return { app: 'rumo-2030', version: 1, exportedAt: new Date().toISOString(), goal: await getGoal(), tx: await db.tx.toArray() };
}

export async function importData(data: unknown) {
  const d = data as { app?: string; goal?: Goal; tx?: Tx[] };
  if (d?.app !== 'rumo-2030' || !Array.isArray(d.tx)) throw new Error('Arquivo de backup inválido');
  await db.transaction('rw', db.tx, db.kv, async () => {
    await db.tx.clear();
    await db.tx.bulkAdd(d.tx!.map(({ id: _id, ...t }) => t));
    if (d.goal) await saveGoal({ ...DEFAULT_GOAL, ...d.goal });
  });
}

export async function resetAll() {
  await db.transaction('rw', db.tx, db.kv, async () => {
    await db.tx.clear();
    await db.kv.clear();
  });
}
