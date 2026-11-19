import { useEffect, useState } from 'react';
import { Icon } from './components/Icon';
import { TxSheet } from './components/TxSheet';
import type { Tx, TxType } from './lib/db';
import { currentMonth } from './lib/format';
import { GoalScreen } from './screens/GoalScreen';
import { Home } from './screens/Home';
import { Settings } from './screens/Settings';
import { Transactions } from './screens/Transactions';

type Tab = 'home' | 'tx' | 'goal' | 'settings';
const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'home', label: 'Início', icon: 'home' },
  { key: 'tx', label: 'Lançamentos', icon: 'list' },
  { key: 'goal', label: 'Meta', icon: 'flag' },
  { key: 'settings', label: 'Ajustes', icon: 'gear' }
];

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [month, setMonth] = useState(currentMonth());
  const [sheet, setSheet] = useState<{ tx: Tx | null; type: TxType } | null>(null);

  useEffect(() => { navigator.storage?.persist?.(); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [tab]);

  const edit = (tx: Tx) => setSheet({ tx, type: tx.type });
  const add = (type: TxType = 'expense') => setSheet({ tx: null, type });

  return (
    <div className="app">
      <main>
        {tab === 'home' && <Home month={month} setMonth={setMonth} onEdit={edit} goTo={setTab} />}
        {tab === 'tx' && <Transactions month={month} setMonth={setMonth} onEdit={edit} />}
        {tab === 'goal' && <GoalScreen onEdit={edit} onAdd={() => add('goal')} onSettings={() => setTab('settings')} />}
        {tab === 'settings' && <Settings />}
      </main>

      {tab !== 'settings' && (
        <button className="fab" aria-label="Novo lançamento" onClick={() => add(tab === 'goal' ? 'goal' : 'expense')}>
          <Icon name="plus" size={28} />
        </button>
      )}

      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? 'on' : ''} onClick={() => setTab(t.key)}>
            <Icon name={t.icon} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {sheet && <TxSheet tx={sheet.tx} defaultType={sheet.type} onClose={() => setSheet(null)} />}
    </div>
  );
}
