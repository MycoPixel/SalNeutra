import type { Config, Mode, Nomen, QType } from './lib';

export const MODES: Record<Mode, { name: string; desc: string }> = {
  classic: { name: 'Clásico', desc: '10 preguntas, sin presión de tiempo' },
  time: { name: 'Contrarreloj', desc: '60 segundos, todas las que puedas' },
  survival: { name: 'Supervivencia', desc: '3 vidas, sigue hasta fallar la tercera' }
};
export const MODE_IDS = Object.keys(MODES) as Mode[];

export const TYPES: Record<QType, string> = { f2n: 'Fórmula → nombre', n2f: 'Nombre → fórmula', ions: 'Iones de la sal neutra' };
export const TYPE_DESC: Record<QType, string> = {
  f2n: 'Lees la fórmula y escribes el nombre',
  n2f: 'Lees el nombre y escribes la fórmula',
  ions: 'Cuántos cationes y aniones hacen falta'
};
export const TYPE_IDS = Object.keys(TYPES) as QType[];

export const NOMENS: Record<Nomen, string> = { stock: 'Stock', sys: 'Sistemática', trad: 'Tradicional' };
export const NOMEN_DESC: Record<Nomen, string> = { stock: 'hierro(III)', sys: 'trióxido de dihierro', trad: 'férrico' };
export const NOMEN_IDS = Object.keys(NOMENS) as Nomen[];

export const RULES: Record<Nomen | 'ions', string[]> = {
  stock: ['La carga del metal va en números romanos: hierro(III).', 'Si el metal tiene una sola carga, no se escribe.', 'Primero el anión: sulfato de aluminio.'],
  sys: ['Prefijos: mono-, di-, tri-, tetra-, penta-…', 'Con oxoaniones se usa bis-, tris-, tetrakis-.', 'El mono- del catión se omite.'],
  trad: ['Metal con dos cargas: -oso (menor) y -ico (mayor).', 'Oxoaniones: hipo-…-ito, -ito, -ato, per-…-ato.', 'Ácidos: -uro → -hídrico, -ito → -oso, -ato → -ico.'],
  ions: ['La suma de las cargas debe dar cero.', 'Busca el mínimo común múltiplo de las cargas.', 'Cationes = mcm ÷ carga del catión. Aniones = mcm ÷ carga del anión.']
};

export const DEFAULT_CONFIG: Config = { level: 'all', mode: 'classic', nomens: ['stock', 'sys', 'trad'], types: ['f2n', 'n2f', 'ions'], mc: false };
export const LETTERS = ['A', 'B', 'C', 'D'];
