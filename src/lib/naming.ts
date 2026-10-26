import type { Anion, Cation, Names } from './types';

const PRE = ['', 'mono', 'di', 'tri', 'tetra', 'penta', 'hexa', 'hepta'];
const BIS = ['', '', 'bis', 'tris', 'tetrakis', 'pentakis', 'hexakis', 'heptakis'];
const OXIDO = ['', 'monóxido', 'dióxido', 'trióxido', 'tetraóxido', 'pentaóxido', 'hexaóxido', 'heptaóxido'];
const OXIDO_ALT = ['', 'monoxido', 'dioxido', 'trioxido', 'tetroxido', 'pentoxido', 'hexoxido', 'heptoxido'];

/** Parte del anión en la nomenclatura sistemática; el primer valor es el que se muestra */
function sysAnion(a: Anion, na: number): string[] {
  const out: string[] = [];
  if (a.kind === 'simple') {
    if (a.id === 'O') {
      out.push(OXIDO[na]);
      if (OXIDO_ALT[na] !== OXIDO[na]) out.push(OXIDO_ALT[na]);
      if (na === 1) out.push('óxido');
    } else {
      out.push(PRE[na] + a.name);
      if (na === 1) out.push(a.name);
    }
  } else if (na === 1) {
    out.push(a.name);
  } else {
    out.push(`${BIS[na]}(${a.name})`);
    out.push(PRE[na] + a.name);
  }
  return out;
}

/** Nombres aceptados en cada nomenclatura; el primero de cada lista es el que se muestra */
export function namesOf(c: Cation, a: Anion, nc: number, na: number): Names {
  const stock = c.isH ? [`${a.name} de hidrógeno`] : [`${a.name} de ${c.stock}`];
  const catSys = (nc > 1 ? PRE[nc] : '') + c.el;
  const sys = sysAnion(a, na).map(x => `${x} de ${catSys}`);
  const trad = c.isH
    ? [`ácido ${a.acid}`]
    : [a.trad, ...a.tradAlt].map(t => (c.variable ? `${t} ${c.trad}` : `${t} de ${c.trad}`));
  return { stock, sys, trad };
}

/** Fórmulas aceptadas; la primera es la canónica */
export function formulasOf(c: Cation, a: Anion, nc: number, na: number): string[] {
  const out = new Set<string>();
  for (const as of [a.sym, ...a.altSyms]) {
    const cat = c.poly && nc > 1 ? `(${c.sym})${nc}` : c.sym + (nc > 1 ? nc : '');
    const ani = a.poly && na > 1 ? `(${as})${na}` : as + (na > 1 ? na : '');
    out.add(cat + ani);
    if (a.poly && na === 1) out.add(`${cat}(${as})`);
    if (c.poly && nc === 1) out.add(`(${c.sym})${ani}`);
  }
  return [...out];
}
