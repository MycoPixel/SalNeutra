import { useRef, useState } from 'react';
import type { ImportReport } from '../lib';

type ImportResult = { ok: true; report: ImportReport } | { ok: false; error: string };

interface Props {
  /** Devuelve el respaldo como texto JSON (con sangría o compacto) */
  onExport: (pretty: boolean) => string;
  onImport: (text: string) => ImportResult;
  onBack: () => void;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function Backup({ onExport, onImport, onBack }: Props) {
  const [msg, setMsg] = useState<{ kind: 'ok' | 'bad'; text: string } | null>(null);
  const [pasted, setPasted] = useState('');
  const [manual, setManual] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const download = () => {
    const json = onExport(true);
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `sal-neutra-progreso-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setManual('');
    setMsg({ kind: 'ok', text: 'Archivo descargado. Llévalo al otro dispositivo y elige «Importar archivo».' });
  };

  const copy = async () => {
    const json = onExport(false);
    try {
      await navigator.clipboard.writeText(json);
      setManual('');
      setMsg({ kind: 'ok', text: 'Código copiado. Pégalo en el otro dispositivo, en «Importar código».' });
    } catch {
      setManual(json);
      setMsg({ kind: 'ok', text: 'No se pudo copiar solo. Toca el código de abajo, selecciónalo todo y cópialo.' });
    }
  };

  const run = (text: string) => {
    const res = onImport(text);
    if (res.ok) {
      const r = res.report;
      setPasted('');
      setMsg({
        kind: 'ok',
        text: `Importado. Récords mejorados: ${r.records}. Errores agregados al repaso: ${r.errors}. ${plural(r.achievements, 'logro nuevo', 'logros nuevos')}.`
      });
    } else {
      setMsg({ kind: 'bad', text: res.error });
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      run(await f.text());
    } catch {
      setMsg({ kind: 'bad', text: 'No se pudo leer el archivo.' });
    }
  };

  return (
    <div className="iontable backup">
      <header className="tablehead">
        <button type="button" className="btn ghost" onClick={onBack}>← Volver</button>
        <h1>Copia de progreso</h1>
      </header>
      <p className="lead">Lleva tus récords, errores por repasar, estadísticas y logros a otro dispositivo. La configuración del juego no se incluye.</p>

      <section className="panel">
        <h2>Exportar</h2>
        <p className="hint">Elige el archivo si puedes pasarlo entre dispositivos, o el código si prefieres pegarlo (por ejemplo, en un mensaje a ti mismo).</p>
        <div className="btnrow">
          <button type="button" className="btn primary" onClick={download}>Descargar archivo</button>
          <button type="button" className="btn" onClick={copy}>Copiar código</button>
        </div>
        {manual && (
          <>
            <label className="sr" htmlFor="manualcode">Código de progreso</label>
            <textarea id="manualcode" className="code" readOnly rows={5} value={manual} onFocus={e => e.currentTarget.select()} />
          </>
        )}
      </section>

      <section className="panel">
        <h2>Importar</h2>
        <p className="hint">Se combina con lo que ya tengas aquí: se conserva el mejor valor de cada récord y no se borra nada.</p>
        <div className="btnrow">
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>Importar archivo…</button>
          <input ref={fileRef} id="importfile" className="sr" type="file" accept="application/json,.json" tabIndex={-1} onChange={onFile} />
        </div>
        <label className="sr" htmlFor="importcode">Pega aquí el código de progreso</label>
        <textarea
          id="importcode" className="code" rows={4} placeholder="O pega aquí el código copiado en otro dispositivo" spellCheck={false}
          autoCapitalize="off" autoComplete="off" value={pasted} onChange={e => setPasted(e.target.value)}
        />
        <div className="btnrow">
          <button type="button" className="btn primary" disabled={!pasted.trim()} onClick={() => run(pasted)}>Importar código</button>
        </div>
      </section>

      <div aria-live="polite">{msg && <p className={`note ${msg.kind}`}>{msg.text}</p>}</div>
    </div>
  );
}
