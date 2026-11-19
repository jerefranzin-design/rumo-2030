import { useEffect, useRef, useState } from 'react';
import { exportData, getGoal, importData, resetAll, saveGoal, type Goal } from '../lib/db';
import { centsToInput, parseMoney, todayISO } from '../lib/format';

const toPct = (x: number) => (x * 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
const fromPct = (s: string) => Number(s.replace(',', '.')) / 100;

export function Settings() {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState({ name: '', target: '', deadline: '', initialSaved: '', annualReturn: '', annualPriceIncrease: '' });
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getGoal().then((g) => {
      setGoal(g);
      setForm({
        name: g.name, target: centsToInput(g.target), deadline: g.deadline, initialSaved: centsToInput(g.initialSaved),
        annualReturn: toPct(g.annualReturn), annualPriceIncrease: toPct(g.annualPriceIncrease)
      });
    });
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  async function save() {
    const next: Goal = {
      name: form.name.trim() || 'Minha meta',
      target: parseMoney(form.target),
      deadline: form.deadline,
      initialSaved: parseMoney(form.initialSaved || '0'),
      annualReturn: fromPct(form.annualReturn || '0'),
      annualPriceIncrease: fromPct(form.annualPriceIncrease || '0')
    };
    if (!(next.target > 0)) return setMsg('Preço inválido');
    if (!/^\d{4}-\d{2}$/.test(next.deadline)) return setMsg('Prazo inválido');
    if ([next.initialSaved, next.annualReturn, next.annualPriceIncrease].some((v) => !Number.isFinite(v))) return setMsg('Confira os números');
    await saveGoal(next);
    setGoal(next);
    setMsg('Meta salva ✓');
  }

  async function doExport() {
    const blob = new Blob([JSON.stringify(await exportData(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `rumo2030-backup-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function doImport(file: File) {
    if (!confirm('Importar substitui todos os dados atuais. Continuar?')) return;
    try {
      await importData(JSON.parse(await file.text()));
      setMsg('Backup importado ✓');
      location.reload();
    } catch (e) {
      setMsg((e as Error).message);
    }
  }

  if (!goal) return <div className="screen" />;

  return (
    <div className="screen">
      <header className="top"><h1>Ajustes</h1></header>

      <section className="card form">
        <h3>Meta</h3>
        <label className="field"><span className="field-label">Nome</span><input value={form.name} onChange={set('name')} /></label>
        <label className="field"><span className="field-label">Preço hoje (R$)</span><input inputMode="decimal" value={form.target} onChange={set('target')} /></label>
        <label className="field"><span className="field-label">Prazo</span><input type="month" value={form.deadline} onChange={set('deadline')} /></label>
        <label className="field"><span className="field-label">Já tenho guardado (R$)</span><input inputMode="decimal" value={form.initialSaved} onChange={set('initialSaved')} /></label>
        <div className="grid2 tight">
          <label className="field"><span className="field-label">Rendimento % a.a.</span><input inputMode="decimal" value={form.annualReturn} onChange={set('annualReturn')} /></label>
          <label className="field"><span className="field-label">Alta do preço % a.a.</span><input inputMode="decimal" value={form.annualPriceIncrease} onChange={set('annualPriceIncrease')} /></label>
        </div>
        <p className="muted small">O rendimento é quanto teu dinheiro guardado rende (ex.: CDB/Tesouro). A alta do preço estima quanto o carro encarece por ano.</p>
        <button className="btn primary" onClick={save}>Salvar meta</button>
        {msg && <p className="muted small center">{msg}</p>}
      </section>

      <section className="card form">
        <h3>Dados</h3>
        <p className="muted small">Tudo fica salvo só neste aparelho. Faça backup de vez em quando.</p>
        <button className="btn" onClick={doExport}>Exportar backup</button>
        <button className="btn" onClick={() => fileRef.current?.click()}>Importar backup</button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])} />
        <button className="btn ghost danger" onClick={async () => { if (confirm('Apagar TODOS os dados? Não dá pra desfazer.')) { await resetAll(); location.reload(); } }}>
          Apagar tudo
        </button>
      </section>
    </div>
  );
}
