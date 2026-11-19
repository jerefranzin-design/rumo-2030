const brlFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const brlShort = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 });

export const brl = (cents: number) => brlFmt.format(cents / 100);
export const brlCompact = (cents: number) => brlShort.format(cents / 100);

/** aceita "1.234,56", "1234,56", "1234.56", "1234" → centavos */
export function parseMoney(s: string): number {
  const t = s.trim().replace(/[R$\s]/g, '');
  if (!t) return NaN;
  const norm = t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t;
  const n = Number(norm);
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}

export const centsToInput = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const currentMonth = () => todayISO().slice(0, 7);

export function addMonths(ym: string, n: number) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthsBetween(from: string, to: string) {
  const [y1, m1] = from.split('-').map(Number);
  const [y2, m2] = to.split('-').map(Number);
  return (y2 - y1) * 12 + (m2 - m1);
}

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function monthLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}
export function monthShort(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS_SHORT[m - 1]}/${String(y).slice(2)}`;
}

export function dayLabel(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = todayISO();
  if (iso === today) return 'Hoje';
  const yest = new Date(); yest.setDate(yest.getDate() - 1);
  if (date.toDateString() === yest.toDateString()) return 'Ontem';
  return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
}

export const pct = (x: number, digits = 0) => `${(x * 100).toLocaleString('pt-BR', { maximumFractionDigits: digits })}%`;

export function durationLabel(months: number) {
  const y = Math.floor(months / 12), m = months % 12;
  const parts = [];
  if (y) parts.push(`${y} ano${y > 1 ? 's' : ''}`);
  if (m) parts.push(`${m} ${m > 1 ? 'meses' : 'mês'}`);
  return parts.join(' e ') || 'este mês';
}
