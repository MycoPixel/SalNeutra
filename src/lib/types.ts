export type Nomen = 'stock' | 'sys' | 'trad';
export type QType = 'f2n' | 'n2f' | 'ions';
export type Mode = 'classic' | 'time' | 'survival';

export interface Cation {
  id: string;
  sym: string;
  q: number;
  /** nombre del elemento o ion (hierro, amonio) */
  el: string;
  stock: string;
  trad: string;
  variable: boolean;
  poly: boolean;
  isH?: boolean;
}

export interface Anion {
  id: string;
  sym: string;
  /** carga negativa, ej. -2 */
  q: number;
  name: string;
  /** simple: di-, tri-; poly: bis-, tris- */
  kind: 'simple' | 'poly';
  poly: boolean;
  trad: string;
  tradAlt: string[];
  /** nombre tradicional del ácido (sulfúrico); sin valor si no forma ácido */
  acid?: string;
  altSyms: string[];
}

export interface Pair {
  c: Cation;
  a: Anion;
  level: number;
  key: string;
}

export type Names = Record<Nomen, string[]>;

export interface Option {
  key: string;
  ok: boolean;
}

export interface Question {
  type: QType;
  nomen: Nomen | null;
  c: Cation;
  a: Anion;
  nc: number;
  na: number;
  /** mínimo común múltiplo de las cargas */
  L: number;
  level: number;
  key: string;
  names: Names;
  formulas: string[];
  options?: Option[];
}

export interface Config {
  level: 'all' | number;
  mode: Mode;
  nomens: Nomen[];
  types: QType[];
  mc: boolean;
}

export interface ScoreBreakdown {
  base: number;
  speed: number;
  streakB: number;
  mult: number;
  total: number;
}
