import { addMonths, monthLabel } from '../lib/format';
import { Icon } from './Icon';

export function MonthPicker({ month, setMonth }: { month: string; setMonth: (m: string) => void }) {
  return (
    <div className="month-picker">
      <button className="icon-btn" aria-label="Mês anterior" onClick={() => setMonth(addMonths(month, -1))}><Icon name="left" /></button>
      <span>{monthLabel(month)}</span>
      <button className="icon-btn" aria-label="Próximo mês" onClick={() => setMonth(addMonths(month, 1))}><Icon name="right" /></button>
    </div>
  );
}
