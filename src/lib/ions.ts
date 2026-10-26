import type { Anion, Cation } from './types';
import { lcm } from './math';

export const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

/** Catión de carga fija */
const fx = (sym: string, q: number, el: string, poly = false): Cation => ({ id: sym + q, sym, q, el, stock: el, trad: el, variable: false, poly });
/** Catión de carga variable: Stock con número romano y tradicional con -oso / -ico */
const vr = (sym: string, q: number, el: string, trad: string): Cation => ({ id: sym + q, sym, q, el, stock: `${el}(${ROMAN[q]})`, trad, variable: true, poly: false });

export const CATIONS: Cation[] = [
  fx('Na', 1, 'sodio'), fx('K', 1, 'potasio'), fx('Li', 1, 'litio'), fx('Ag', 1, 'plata'),
  fx('Mg', 2, 'magnesio'), fx('Ca', 2, 'calcio'), fx('Ba', 2, 'bario'), fx('Zn', 2, 'zinc'),
  fx('Al', 3, 'aluminio'), fx('NH4', 1, 'amonio', true),
  vr('Fe', 2, 'hierro', 'ferroso'), vr('Fe', 3, 'hierro', 'férrico'),
  vr('Cu', 1, 'cobre', 'cuproso'), vr('Cu', 2, 'cobre', 'cúprico'),
  vr('Pb', 2, 'plomo', 'plumboso'), vr('Pb', 4, 'plomo', 'plúmbico'),
  vr('Sn', 2, 'estaño', 'estanoso'), vr('Sn', 4, 'estaño', 'estánico'),
  vr('Hg', 2, 'mercurio', 'mercúrico'),
  vr('Co', 2, 'cobalto', 'cobaltoso'), vr('Co', 3, 'cobalto', 'cobáltico'),
  vr('Cr', 2, 'cromo', 'cromoso'), vr('Cr', 3, 'cromo', 'crómico'),
  vr('Au', 1, 'oro', 'auroso'), vr('Au', 3, 'oro', 'áurico'),
  { id: 'H1', sym: 'H', q: 1, el: 'hidrógeno', stock: 'hidrógeno', trad: 'hidrógeno', variable: false, poly: false, isH: true }
];

const mono = (id: string, q: number, name: string, acid?: string): Anion => ({ id, sym: id, q, name, kind: 'simple', poly: false, trad: name, tradAlt: [], acid, altSyms: [] });
const spoly = (id: string, q: number, name: string, acid?: string): Anion => ({ id, sym: id, q, name, kind: 'simple', poly: true, trad: name, tradAlt: [], acid, altSyms: [] });
const poly = (id: string, q: number, name: string, acid?: string, trad?: string, tradAlt: string[] = [], altSyms: string[] = []): Anion =>
  ({ id, sym: id, q, name, kind: 'poly', poly: true, trad: trad ?? name, tradAlt, acid, altSyms });

export const ANIONS: Anion[] = [
  mono('F', -1, 'fluoruro', 'fluorhídrico'), mono('Cl', -1, 'cloruro', 'clorhídrico'),
  mono('Br', -1, 'bromuro', 'bromhídrico'), mono('I', -1, 'yoduro', 'yodhídrico'),
  mono('O', -2, 'óxido'), mono('S', -2, 'sulfuro', 'sulfhídrico'), mono('N', -3, 'nitruro'), mono('H', -1, 'hidruro'),
  spoly('OH', -1, 'hidróxido'), spoly('CN', -1, 'cianuro', 'cianhídrico'),
  poly('NO3', -1, 'nitrato', 'nítrico'), poly('NO2', -1, 'nitrito', 'nitroso'),
  poly('SO4', -2, 'sulfato', 'sulfúrico'), poly('SO3', -2, 'sulfito', 'sulfuroso'),
  poly('CO3', -2, 'carbonato', 'carbónico'), poly('PO4', -3, 'fosfato', 'fosfórico'),
  poly('CH3COO', -1, 'acetato', undefined, undefined, [], ['C2H3O2']),
  poly('ClO', -1, 'hipoclorito', 'hipocloroso'), poly('ClO2', -1, 'clorito', 'cloroso'),
  poly('ClO3', -1, 'clorato', 'clórico'), poly('ClO4', -1, 'perclorato', 'perclórico'),
  poly('MnO4', -1, 'permanganato', 'permangánico'),
  poly('CrO4', -2, 'cromato', 'crómico'), poly('Cr2O7', -2, 'dicromato', 'dicrómico'),
  poly('HCO3', -1, 'hidrogenocarbonato', undefined, 'bicarbonato', ['carbonato ácido']),
  poly('HSO4', -1, 'hidrogenosulfato', undefined, 'bisulfato', ['sulfato ácido']),
  poly('H2PO4', -1, 'dihidrogenofosfato', undefined, 'fosfato diácido'),
  poly('HPO4', -2, 'hidrogenofosfato', undefined, 'fosfato ácido', ['fosfato monoácido'])
];

/** Combinaciones que no se usan (no existen, son agua o resultan confusas) */
export function valid(c: Cation, a: Anion): boolean {
  if (c.isH) return !!a.acid;
  if (a.id === 'H') return ['Na', 'K', 'Li', 'Ca', 'Mg', 'Ba', 'Al'].includes(c.sym);
  if (a.id === 'N') return !c.variable && !['Ag', 'NH4'].includes(c.sym);
  if (c.sym === 'Ag' && a.id === 'OH') return false;
  if (c.sym === 'NH4' && ['O', 'N', 'H'].includes(a.id)) return false;
  return true;
}

/** Cantidad de cationes y aniones que anulan la carga total */
export function counts(c: Cation, a: Anion): { L: number; nc: number; na: number } {
  const L = lcm(c.q, Math.abs(a.q));
  return { L, nc: L / c.q, na: L / Math.abs(a.q) };
}
