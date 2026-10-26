import type { Anion, Cation, Pair } from './types';
import { ANIONS, CATIONS, valid } from './ions';

const FIXED = CATIONS.filter(c => !c.variable && !c.isH && !c.poly);
const VARI = CATIONS.filter(c => c.variable);
const NH4 = CATIONS.filter(c => c.sym === 'NH4');
const HC = CATIONS.filter(c => c.isH);
const AN = (ids: string[]): Anion[] => ids.map(id => ANIONS.find(a => a.id === id) as Anion);
const POLY_BASIC = ['OH', 'CN', 'NO3', 'NO2', 'SO4', 'SO3', 'CO3', 'PO4', 'CH3COO'];

export interface LevelDef {
  name: string;
  /** ejemplos para mostrar en el menú */
  desc: string;
  groups: [Cation[], Anion[]][];
}

export const LEVELS: Record<number, LevelDef> = {
  1: { name: 'Binarias simples', desc: 'NaCl, CaO, Al₂S₃, Mg₃N₂', groups: [[FIXED, AN(['F', 'Cl', 'Br', 'I', 'O', 'S', 'N', 'H'])]] },
  2: { name: 'Metales de carga variable', desc: 'FeCl₃, Cu₂O, PbS₂, SnO₂', groups: [[VARI, AN(['F', 'Cl', 'Br', 'I', 'O', 'S'])]] },
  3: { name: 'Iones poliatómicos', desc: 'Ca(OH)₂, (NH₄)₂SO₄, Al₂(CO₃)₃', groups: [[FIXED.concat(NH4), AN(POLY_BASIC)]] },
  4: {
    name: 'Oxoaniones y carga variable',
    desc: 'KClO₄, Fe₂(SO₄)₃, Na₂Cr₂O₇',
    groups: [
      [FIXED.concat(NH4, VARI), AN(['ClO', 'ClO2', 'ClO3', 'ClO4', 'MnO4', 'CrO4', 'Cr2O7'])],
      [VARI, AN(POLY_BASIC)]
    ]
  },
  5: {
    name: 'Ácidos y sales ácidas',
    desc: 'H₂SO₄, HClO₃, NaHCO₃, Ca(H₂PO₄)₂',
    groups: [
      [HC, AN(['F', 'Cl', 'Br', 'I', 'S', 'CN', 'NO3', 'NO2', 'SO4', 'SO3', 'CO3', 'PO4', 'ClO', 'ClO2', 'ClO3', 'ClO4', 'MnO4', 'CrO4', 'Cr2O7'])],
      [FIXED.filter(c => c.sym !== 'Ag').concat(NH4), AN(['HCO3', 'HSO4', 'H2PO4', 'HPO4'])]
    ]
  }
};

export const LEVEL_IDS = [1, 2, 3, 4, 5];
export const pairKey = (c: Cation, a: Anion): string => `${c.id}|${a.id}`;

export const ALL_PAIRS = new Map<string, Pair>();
const LEVEL_PAIRS: Record<number, Pair[]> = {};
for (const lv of LEVEL_IDS) {
  LEVEL_PAIRS[lv] = [];
  for (const [cs, as] of LEVELS[lv].groups) {
    for (const c of cs) {
      for (const a of as) {
        if (!valid(c, a)) continue;
        const key = pairKey(c, a);
        if (!ALL_PAIRS.has(key)) ALL_PAIRS.set(key, { c, a, level: lv, key });
        LEVEL_PAIRS[lv].push(ALL_PAIRS.get(key) as Pair);
      }
    }
  }
}

export function poolFor(level: 'all' | number): Pair[] {
  return level === 'all' ? [...ALL_PAIRS.values()] : LEVEL_PAIRS[level].slice();
}
