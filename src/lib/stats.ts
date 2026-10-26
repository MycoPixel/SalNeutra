import type { Mode, Nomen, QType, Question } from './types';

/** Contadores de todo lo jugado; de aquí salen los logros */
export interface Stats {
  games: number;
  answered: number;
  correct: number;
  wrong: number;
  bestStreak: number;
  byNomen: Record<Nomen, number>;
  byType: Record<QType, number>;
  byLevel: Record<string, number>;
  noHintCorrect: number;
  fastCorrect: number;
  variableCorrect: number;
  reviewFixed: number;
  perfectGames: number;
  perfectNoHintGames: number;
  bestScoreGame: number;
  bestTimeCorrect: number;
  bestSurvivalCorrect: number;
  tableOpened: boolean;
  exported: number;
  /** nomenclaturas en que se acertó el cloruro de sodio */
  nacl: Nomen[];
  night: boolean;
}

const NOMEN_KEYS: Nomen[] = ['stock', 'sys', 'trad'];
const TYPE_KEYS: QType[] = ['f2n', 'n2f', 'ions'];
const LEVEL_KEYS = ['1', '2', '3', '4', '5'];

export function emptyStats(): Stats {
  return {
    games: 0, answered: 0, correct: 0, wrong: 0, bestStreak: 0,
    byNomen: { stock: 0, sys: 0, trad: 0 }, byType: { f2n: 0, n2f: 0, ions: 0 }, byLevel: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
    noHintCorrect: 0, fastCorrect: 0, variableCorrect: 0, reviewFixed: 0, perfectGames: 0, perfectNoHintGames: 0,
    bestScoreGame: 0, bestTimeCorrect: 0, bestSurvivalCorrect: 0, tableOpened: false, exported: 0, nacl: [], night: false
  };
}

const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.min(Math.floor(v), 1e9) : 0);

function rec<K extends string>(raw: unknown, keys: readonly K[]): Record<K, number> {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return Object.fromEntries(keys.map(k => [k, num(o[k])])) as Record<K, number>;
}

/** Acepta cualquier valor (localStorage, archivo importado) y devuelve estadísticas válidas */
export function sanitizeStats(raw: unknown): Stats {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const nacl = Array.isArray(r.nacl) ? (r.nacl as unknown[]) : [];
  return {
    games: num(r.games), answered: num(r.answered), correct: num(r.correct), wrong: num(r.wrong), bestStreak: num(r.bestStreak),
    byNomen: rec(r.byNomen, NOMEN_KEYS), byType: rec(r.byType, TYPE_KEYS), byLevel: rec(r.byLevel, LEVEL_KEYS),
    noHintCorrect: num(r.noHintCorrect), fastCorrect: num(r.fastCorrect), variableCorrect: num(r.variableCorrect),
    reviewFixed: num(r.reviewFixed), perfectGames: num(r.perfectGames), perfectNoHintGames: num(r.perfectNoHintGames),
    bestScoreGame: num(r.bestScoreGame), bestTimeCorrect: num(r.bestTimeCorrect), bestSurvivalCorrect: num(r.bestSurvivalCorrect),
    tableOpened: r.tableOpened === true, exported: num(r.exported), nacl: NOMEN_KEYS.filter(n => nacl.includes(n)), night: r.night === true
  };
}

export interface AnswerEvent {
  q: Question;
  full: boolean;
  elapsed: number;
  /** pistas usadas en esta pregunta */
  hints: number;
  review: boolean;
  /** racha de aciertos después de responder */
  streak: number;
  /** hora local, 0 a 23 */
  hour: number;
}

export function recordAnswer(s: Stats, e: AnswerEvent): Stats {
  const { q } = e;
  const n: Stats = { ...s, byNomen: { ...s.byNomen }, byType: { ...s.byType }, byLevel: { ...s.byLevel }, nacl: [...s.nacl] };
  n.answered++;
  n.bestStreak = Math.max(n.bestStreak, e.streak);
  if (e.hour >= 0 && e.hour < 5) n.night = true;
  if (!e.full) {
    n.wrong++;
    return n;
  }
  n.correct++;
  n.byType[q.type]++;
  n.byLevel[String(q.level)]++;
  if (e.hints === 0) n.noHintCorrect++;
  if (e.elapsed < 5) n.fastCorrect++;
  if (q.c.variable) n.variableCorrect++;
  if (e.review) n.reviewFixed++;
  if (q.nomen) {
    n.byNomen[q.nomen]++;
    if (q.key === 'Na1|Cl' && !n.nacl.includes(q.nomen)) n.nacl.push(q.nomen);
  }
  return n;
}

export interface GameEvent {
  mode: Mode;
  review: boolean;
  correct: number;
  answered: number;
  total: number;
  score: number;
  /** pistas usadas en toda la partida */
  hints: number;
}

export function recordGame(s: Stats, e: GameEvent): Stats {
  const n: Stats = { ...s, games: s.games + 1 };
  if (e.review) return n;
  n.bestScoreGame = Math.max(n.bestScoreGame, e.score);
  if (e.mode === 'time') n.bestTimeCorrect = Math.max(n.bestTimeCorrect, e.correct);
  if (e.mode === 'survival') n.bestSurvivalCorrect = Math.max(n.bestSurvivalCorrect, e.correct);
  if (e.mode === 'classic' && e.answered === e.total && e.correct === e.total) {
    n.perfectGames++;
    if (e.hints === 0) n.perfectNoHintGames++;
  }
  return n;
}

export const recordExport = (s: Stats): Stats => ({ ...s, exported: s.exported + 1 });
export const recordTable = (s: Stats): Stats => (s.tableOpened ? s : { ...s, tableOpened: true });

const mx = Math.max;
function mergeRec<K extends string>(a: Record<K, number>, b: Record<K, number>): Record<K, number> {
  return Object.fromEntries((Object.keys(a) as K[]).map(k => [k, mx(a[k], b[k] ?? 0)])) as Record<K, number>;
}

/** Une dos historiales conservando el mayor valor de cada contador (evita contar dos veces lo mismo) */
export function mergeStats(a: Stats, b: Stats): Stats {
  return {
    games: mx(a.games, b.games), answered: mx(a.answered, b.answered), correct: mx(a.correct, b.correct), wrong: mx(a.wrong, b.wrong),
    bestStreak: mx(a.bestStreak, b.bestStreak),
    byNomen: mergeRec(a.byNomen, b.byNomen), byType: mergeRec(a.byType, b.byType), byLevel: mergeRec(a.byLevel, b.byLevel),
    noHintCorrect: mx(a.noHintCorrect, b.noHintCorrect), fastCorrect: mx(a.fastCorrect, b.fastCorrect),
    variableCorrect: mx(a.variableCorrect, b.variableCorrect), reviewFixed: mx(a.reviewFixed, b.reviewFixed),
    perfectGames: mx(a.perfectGames, b.perfectGames), perfectNoHintGames: mx(a.perfectNoHintGames, b.perfectNoHintGames),
    bestScoreGame: mx(a.bestScoreGame, b.bestScoreGame), bestTimeCorrect: mx(a.bestTimeCorrect, b.bestTimeCorrect),
    bestSurvivalCorrect: mx(a.bestSurvivalCorrect, b.bestSurvivalCorrect),
    tableOpened: a.tableOpened || b.tableOpened, exported: mx(a.exported, b.exported),
    nacl: NOMEN_KEYS.filter(n => a.nacl.includes(n) || b.nacl.includes(n)), night: a.night || b.night
  };
}
