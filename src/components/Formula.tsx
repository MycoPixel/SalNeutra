import type { ReactNode } from 'react';
import type { Anion, Cation } from '../lib';

/** Escribe una fórmula con subíndices: Al2(SO4)3 → Al₂(SO₄)₃ */
export function Formula({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const re = /([A-Za-z)])(\d+)/g;
  let last = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    parts.push(text.slice(last, m.index) + m[1]);
    parts.push(<sub key={k++}>{m[2]}</sub>);
    last = m.index + m[0].length;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
}

/** Ion con su carga: tone 'c' (catión, cálido), 'a' (anión, frío) o 'plain' (sin fondo) */
export function Ion({ ion, tone = 'plain' }: { ion: Cation | Anion; tone?: 'c' | 'a' | 'plain' }) {
  const n = Math.abs(ion.q);
  return (
    <span className={`ion ${tone}`}>
      <Formula text={ion.sym} />
      <sup>
        {n > 1 ? n : ''}
        {ion.q > 0 ? '+' : '−'}
      </sup>
    </span>
  );
}
