import { Logo } from '../components/Logo';
import { useEffect, useRef, useState } from 'react';
import { exportData, getGoal, importData, resetAll, saveGoal, type Goal } from '../lib/db';
import { centsToInput, parseMoney, todayISO } from '../lib/format';

export function Settings() {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState({ name: '', target: '', initialSaved: '' });
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getGoal().then((g) => {
      setGoal(g);
      setForm({
        name: g.name, target: centsToInput(g.target), initialSaved: centsToInput(g.initialSaved)
      });
    });
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  async function save() {
    if (!goal) return;
    // prazo, rendimento e alta do preço não aparecem mais na tela; mantém o que já estava salvo
    const next: Goal = {
      ...goal,
      name: form.name.trim() || 'Minha meta',
      target: parseMoney(form.target),
      initialSaved: parseMoney(form.initialSaved || '0')
    };
    if (!(next.target > 0)) return setMsg('Preço inválido');
    if (!Number.isFinite(next.initialSaved)) return setMsg('Confira os números');
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
      <header className="top"><Logo /></header>
      <div className="titulo-tela"><h1><em>Ajustes</em></h1></div>

      <section className="card form">
        <h3><em>Meta</em></h3>
        <label className="field"><span className="field-label">Nome</span><input value={form.name} onChange={set('name')} /></label>
        <label className="field"><span className="field-label">Preço hoje (R$)</span><input inputMode="decimal" value={form.target} onChange={set('target')} /></label>
        <label className="field"><span className="field-label">Já tenho guardado (R$)</span><input inputMode="decimal" value={form.initialSaved} onChange={set('initialSaved')} /></label>
        <button className="btn primary" onClick={save}>Salvar meta</button>
        {msg && <p className="muted small center">{msg}</p>}
      </section>

      <section className="card form">
        <h3><em>Dados</em></h3>
        <p className="muted small">Tudo fica salvo só neste aparelho. Faça backup de vez em quando.</p>
        <button className="btn" onClick={doExport}>Exportar backup</button>
        <button className="btn" onClick={() => fileRef.current?.click()}>Importar backup</button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])} />
        <button className="btn ghost danger" onClick={async () => { if (confirm('Apagar TODOS os dados? Não dá pra desfazer.')) { await resetAll(); location.reload(); } }}>
          Apagar tudo
        </button>
      </section>

      <p className="assinatura">feito por<br /><span className="logo"><em>Studio</em>Jeremias<sup>©</sup></span></p>
    </div>
  );
}
