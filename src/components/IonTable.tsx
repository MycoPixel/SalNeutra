import { useState } from 'react';
import { ANIONS, CATIONS, normName } from '../lib';
import type { Anion, Cation } from '../lib';
import { Ion } from './Formula';

type AnyIon = Cation | Anion;
const isCation = (i: AnyIon): i is Cation => 'el' in i;

interface Label {
  main: string;
  notes: string[];
}

function labelOf(i: AnyIon): Label {
  if (isCation(i)) return { main: i.stock, notes: i.variable ? [`Tradicional: ${i.trad}`] : [] };
  const notes: string[] = [];
  const trad = [i.trad, ...i.tradAlt];
  if (i.trad !== i.name) notes.push(`Tradicional: ${trad.join(' / ')}`);
  if (i.acid) notes.push(`Ácido ${i.acid}`);
  return { main: i.name, notes };
}

const haystack = (i: AnyIon): string[] => {
  const l = labelOf(i);
  return [i.sym, ...(isCation(i) ? [] : i.altSyms), l.main, ...l.notes];
};

/** Monoatómicos primero y luego poliatómicos; dentro de cada grupo, por nombre */
const byKind = (a: AnyIon, b: AnyIon) => Number(a.poly) - Number(b.poly) || labelOf(a).main.localeCompare(labelOf(b).main, 'es');

interface SectionProps {
  title: string;
  ions: AnyIon[];
  charges: number[];
  tone: 'c' | 'a';
  term: string;
}

function Section({ title, ions, charges, tone, term }: SectionProps) {
  const t = normName(term);
  const match = (i: AnyIon) => !t || haystack(i).some(s => normName(s).includes(t));
  return (
    <section className="panel" aria-label={title}>
      <h2>{title}</h2>
      <div className="ioncols">
        {charges.map(q => {
          const list = ions.filter(i => Math.abs(i.q) === q).sort(byKind);
          const shown = list.filter(match);
          return (
            <div className="ioncol" key={q}>
              <h3 className={`colhead ${tone}`}>
                {tone === 'c' ? '+' : '−'}{q}
                <small>{shown.length} {shown.length === 1 ? 'ion' : 'iones'}</small>
              </h3>
              <ul>
                {shown.map(i => {
                  const l = labelOf(i);
                  return (
                    <li className="ionitem" key={i.id}>
                      <Ion ion={i} tone={tone} />
                      <span className="nm">{l.main}</span>
                      {l.notes.map(n => <small key={n}>{n}</small>)}
                    </li>
                  );
                })}
                {!shown.length && <li className="ionempty">Sin coincidencias</li>}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function IonTable({ onBack }: { onBack: () => void }) {
  const [term, setTerm] = useState('');
  return (
    <div className="iontable">
      <header className="tablehead">
        <button type="button" className="btn ghost" onClick={onBack}>← Volver</button>
        <h1>Tabla de iones</h1>
      </header>
      <p className="lead">Los iones del juego ordenados por carga. En los metales de carga variable, el número romano (Stock) y la terminación -oso / -ico (tradicional).</p>
      <label className="sr" htmlFor="ionsearch">Buscar ion por fórmula o nombre</label>
      <input
        id="ionsearch" className="search" type="search" placeholder="Buscar por fórmula o nombre, ej. sulfato" autoComplete="off" autoCapitalize="off"
        spellCheck={false} value={term} onChange={e => setTerm(e.target.value)}
      />
      <Section title="Cationes" ions={CATIONS} charges={[1, 2, 3, 4]} tone="c" term={term} />
      <Section title="Aniones" ions={ANIONS} charges={[1, 2, 3]} tone="a" term={term} />
    </div>
  );
}
