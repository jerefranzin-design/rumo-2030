import { useState } from 'react';
import { CATEGORIES, db, type Tx, type TxType } from '../lib/db';
import { centsToInput, parseMoney, todayISO } from '../lib/format';
import { Icon } from './Icon';

const TYPE_LABEL: Record<TxType, string> = { expense: 'Despesa', income: 'Receita', goal: 'Meta' };

export function TxSheet({ tx, defaultType = 'expense', onClose }: { tx: Tx | null; defaultType?: TxType; onClose: () => void }) {
  const [type, setType] = useState<TxType>(tx?.type ?? defaultType);
  const [amount, setAmount] = useState(tx ? centsToInput(Math.abs(tx.amount)) : '');
  const [category, setCategory] = useState(tx?.category ?? CATEGORIES[defaultType][0]);
  const [description, setDescription] = useState(tx?.description ?? '');
  const [date, setDate] = useState(tx?.date ?? todayISO());
  const [error, setError] = useState('');

  function changeType(t: TxType) {
    setType(t);
    if (!CATEGORIES[t].includes(category)) setCategory(CATEGORIES[t][0]);
  }

  async function save() {
    const cents = parseMoney(amount);
    if (!cents || cents <= 0) return setError('Informe um valor maior que zero');
    const signed = type === 'goal' && category === 'Retirada' ? -cents : cents;
    const data: Tx = { type, amount: signed, category, description: description.trim(), date, createdAt: tx?.createdAt ?? Date.now() };
    if (tx?.id) await db.tx.update(tx.id, data);
    else await db.tx.add(data);
    onClose();
  }

  async function remove() {
    if (tx?.id && confirm('Excluir este lançamento?')) {
      await db.tx.delete(tx.id);
      onClose();
    }
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet claro" role="dialog" aria-label="Lançamento" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2><em>{tx ? 'Editar' : 'Novo'}</em> lançamento</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar"><Icon name="x" /></button>
        </div>

        <div className="segmented">
          {(Object.keys(TYPE_LABEL) as TxType[]).map((t) => (
            <button key={t} className={t === type ? 'on' : ''} onClick={() => changeType(t)}>{TYPE_LABEL[t]}</button>
          ))}
        </div>

        <label className="amount-field">
          <span>R$</span>
          <input autoFocus inputMode="decimal" placeholder="0,00" value={amount} onChange={(e) => { setAmount(e.target.value); setError(''); }} />
        </label>
        {error && <p className="error">{error}</p>}

        <div className="field">
          <span className="field-label">Categoria</span>
          <div className="chips">
            {CATEGORIES[type].map((c) => (
              <button key={c} className={`chip ${c === category ? 'on' : ''}`} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
        </div>

        <label className="field">
          <span className="field-label">Descrição</span>
          <input placeholder="Opcional" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        <label className="field">
          <span className="field-label">Data</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value || todayISO())} />
        </label>

        <button className="btn primary" onClick={save}>Salvar</button>
        {tx && <button className="btn ghost danger" onClick={remove}>Excluir</button>}
      </div>
    </div>
  );
}
