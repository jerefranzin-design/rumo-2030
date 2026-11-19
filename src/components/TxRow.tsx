import type { Tx } from '../lib/db';
import { brl } from '../lib/format';

export function TxRow({ tx, onClick }: { tx: Tx; onClick: () => void }) {
  const sign = tx.type === 'income' ? '+' : tx.type === 'expense' ? '−' : tx.amount < 0 ? '−' : '→';
  return (
    <button className="tx-row" onClick={onClick}>
      <span className={`tx-dot t-${tx.type}`}>{tx.category.slice(0, 1)}</span>
      <span className="tx-main">
        <strong>{tx.description || tx.category}</strong>
        <small>{tx.description ? tx.category : tx.type === 'goal' ? 'Meta' : ''}</small>
      </span>
      <span className={`tx-amount t-${tx.type}`}>{sign} {brl(Math.abs(tx.amount))}</span>
    </button>
  );
}
