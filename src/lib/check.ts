import type { Names, Nomen } from './types';

const ROM = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];

/** Ignora mayúsculas, tildes, espacios sobrantes y paréntesis (salvo los del número romano) */
export function normName(s: string): string {
  let t = String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[−–—]/g, '-');
  t = t.replace(/\s*\(\s*([ivx]+)\s*\)/g, '§$1¶');
  t = t.replace(/(\S)\s+([ivx]+)\s*$/, (m, x: string, r: string) => (ROM.includes(r) ? `${x}§${r}¶` : m));
  t = t.replace(/[()[\]]/g, '').replace(/§/g, '(').replace(/¶/g, ')');
  return t.replace(/\s+/g, ' ').trim();
}

export type NameResult = 'ok' | 'bad' | `other:${Nomen}`;

export function checkName(input: string, names: Names, nomen: Nomen): NameResult {
  const n = normName(input);
  const has = (k: Nomen) => names[k].some(v => normName(v) === n);
  if (has(nomen)) return 'ok';
  for (const k of ['stock', 'sys', 'trad'] as const) if (k !== nomen && has(k)) return `other:${k}`;
  return 'bad';
}

/** Convierte subíndices Unicode a dígitos y quita espacios */
export function normFormula(s: string): string {
  return String(s)
    .replace(/[₀-₉]/g, ch => String(ch.charCodeAt(0) - 0x2080))
    .replace(/\s+/g, '')
    .replace(/[[{]/g, '(')
    .replace(/[\]}]/g, ')');
}

export type FormulaResult = 'ok' | 'case' | 'bad';

export function checkFormula(input: string, variants: string[]): FormulaResult {
  const n = normFormula(input);
  if (variants.includes(n)) return 'ok';
  const lc = n.toLowerCase();
  return variants.some(v => v.toLowerCase() === lc) ? 'case' : 'bad';
}
