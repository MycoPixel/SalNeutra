import { useCallback, useRef, useState } from 'react';
import {
  ALL_PAIRS, checkFormula, checkName, genQuestion, lsDel, lsGet, lsSet, poolFor, scoreOf
} from '../lib';
import type { AnswerEvent, Config, FormulaResult, GameEvent, Mode, NameResult, Nomen, Pair, QType, Question, ScoreBreakdown } from '../lib';

export interface Last {
  frac: number;
  full: boolean;
  pts: ScoreBreakdown;
  elapsed: number;
  d: { okC?: boolean; okA?: boolean; sel?: number; val?: string; res?: NameResult | FormulaResult };
}

export interface Run {
  mode: Mode;
  review: boolean;
  pool: Pair[];
  types: QType[];
  nomens: Nomen[];
  mc: boolean;
  score: number;
  streak: number;
  bestStreak: number;
  answered: number;
  correct: number;
  lives: number;
  timeLeft: number;
  total: number;
  qn: number;
  recent: string[];
  misses: Question[];
  sumTime: number;
  q: Question;
  phase: 'ask' | 'fb';
  qStart: number;
  hints: number;
  /** pistas usadas en toda la partida */
  totalHints: number;
  hintOpen: boolean;
  cnt: { c: number; a: number };
  last: Last | null;
  done: boolean;
  newRecord: boolean;
}

export interface Answer {
  sel?: number;
  val?: string;
}

const TIME_LIMIT = 60;
const isLast = (r: Run) => (r.mode === 'classic' && r.qn >= r.total) || (r.mode === 'survival' && r.lives <= 0);
export const isLastQuestion = isLast;
const isOver = (r: Run) => isLast(r) || (r.mode === 'time' && r.timeLeft <= 0);

/** Pasa a una pregunta nueva */
function withQuestion(r: Run): Run {
  const q = genQuestion({ pool: r.pool, types: r.types, nomens: r.nomens, mc: r.mc }, r.recent);
  const keep = Math.max(0, Math.min(4, r.pool.length - 1));
  const recent = keep ? [...r.recent, q.key].slice(-keep) : [];
  return { ...r, q, recent, qn: r.qn + 1, phase: 'ask', hints: 0, hintOpen: false, cnt: { c: 1, a: 1 }, last: null, qStart: performance.now() };
}

export interface GameCallbacks {
  onAnswer?: (e: AnswerEvent) => void;
  onFinish?: (e: GameEvent) => void;
}

export function useGame(callbacks: GameCallbacks = {}) {
  const cbRef = useRef(callbacks);
  cbRef.current = callbacks;
  const runRef = useRef<Run | null>(null);
  const bestRef = useRef<Record<string, number>>(lsGet('sn:best', {}));
  const errsRef = useRef<string[]>(lsGet('sn:err', []));
  const [run, setRun] = useState<Run | null>(null);
  const [best, setBest] = useState(bestRef.current);
  const [errs, setErrs] = useState(errsRef.current);

  const update = (r: Run | null) => {
    runRef.current = r;
    setRun(r);
  };
  const saveErrs = (next: string[]) => {
    errsRef.current = next;
    setErrs(next);
    lsSet('sn:err', next);
  };

  const finishRun = (r: Run): Run => {
    let newRecord = false;
    if (!r.review && r.score > (bestRef.current[r.mode] ?? 0)) {
      bestRef.current = { ...bestRef.current, [r.mode]: r.score };
      setBest(bestRef.current);
      lsSet('sn:best', bestRef.current);
      newRecord = r.score > 0;
    }
    cbRef.current.onFinish?.({ mode: r.mode, review: r.review, correct: r.correct, answered: r.answered, total: r.total, score: r.score, hints: r.totalHints });
    return { ...r, done: true, newRecord };
  };

  const start = (cfg: Config, review: boolean) => {
    const pool = review ? errsRef.current.map(k => ALL_PAIRS.get(k)).filter((p): p is Pair => !!p) : poolFor(cfg.level);
    if (!pool.length) return;
    const first = genQuestion({ pool, types: cfg.types, nomens: cfg.nomens, mc: cfg.mc }, []);
    update({
      mode: review ? 'classic' : cfg.mode, review, pool, types: cfg.types.slice(), nomens: cfg.nomens.slice(), mc: cfg.mc,
      score: 0, streak: 0, bestStreak: 0, answered: 0, correct: 0, lives: 3, timeLeft: TIME_LIMIT,
      total: review ? Math.min(10, Math.max(5, pool.length)) : 10,
      qn: 1, recent: [first.key], misses: [], sumTime: 0, q: first, phase: 'ask', qStart: performance.now(),
      hints: 0, totalHints: 0, hintOpen: false, cnt: { c: 1, a: 1 }, last: null, done: false, newRecord: false
    });
  };

  const submit = (ans: Answer) => {
    const r = runRef.current;
    if (!r || r.phase !== 'ask') return;
    const q = r.q;
    const elapsed = (performance.now() - r.qStart) / 1000;
    const d: Last['d'] = {};
    let frac = 0;
    if (q.type === 'ions') {
      d.okC = r.cnt.c === q.nc;
      d.okA = r.cnt.a === q.na;
      frac = (d.okC ? 0.5 : 0) + (d.okA ? 0.5 : 0);
    } else if (q.options) {
      d.sel = ans.sel;
      frac = ans.sel !== undefined && q.options[ans.sel]?.ok ? 1 : 0;
    } else {
      d.val = ans.val ?? '';
      d.res = q.type === 'f2n' ? checkName(d.val, q.names, q.nomen as Nomen) : checkFormula(d.val, q.formulas);
      frac = d.res === 'ok' ? 1 : 0;
    }
    const full = frac === 1;
    const pts = scoreOf({ level: q.level, elapsed, streak: full ? r.streak : 0, hints: r.hints, frac });
    const streak = full ? r.streak + 1 : 0;
    const next: Run = {
      ...r, phase: 'fb', score: r.score + pts.total, answered: r.answered + 1, correct: r.correct + (full ? 1 : 0),
      streak, bestStreak: Math.max(r.bestStreak, streak), sumTime: r.sumTime + elapsed,
      lives: !full && r.mode === 'survival' ? r.lives - 1 : r.lives,
      misses: !full && !r.misses.some(m => m.key === q.key) ? [...r.misses, q] : r.misses,
      last: { frac, full, pts, elapsed, d }
    };
    if (!full && !errsRef.current.includes(q.key)) saveErrs([...errsRef.current, q.key].slice(-60));
    else if (full && r.review && errsRef.current.includes(q.key)) saveErrs(errsRef.current.filter(k => k !== q.key));
    cbRef.current.onAnswer?.({ q, full, elapsed, hints: r.hints, review: r.review, streak, hour: new Date().getHours() });
    update(next);
  };

  const next = () => {
    const r = runRef.current;
    if (!r) return;
    update(isOver(r) ? finishRun(r) : withQuestion(r));
  };

  const hint = () => {
    const r = runRef.current;
    if (r && r.phase === 'ask' && !r.hintOpen) update({ ...r, hintOpen: true, hints: r.hints + 1, totalHints: r.totalHints + 1 });
  };

  const setCount = (w: 'c' | 'a', delta: number) => {
    const r = runRef.current;
    if (!r || r.phase !== 'ask') return;
    update({ ...r, cnt: { ...r.cnt, [w]: Math.min(9, Math.max(1, r.cnt[w] + delta)) } });
  };

  /** Cuenta atrás de Contrarreloj; se detiene mientras se muestra la respuesta */
  const tick = useCallback((dt: number) => {
    const r = runRef.current;
    if (!r || r.done || r.phase !== 'ask' || r.mode !== 'time') return;
    const timeLeft = r.timeLeft - dt;
    update(timeLeft <= 0 ? finishRun({ ...r, timeLeft: 0 }) : { ...r, timeLeft });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const quit = () => update(null);

  /** Datos guardados en el dispositivo, para exportarlos */
  const data = () => ({ best: bestRef.current, errs: errsRef.current });
  /** Reemplaza récords y errores (se usa al importar un respaldo ya combinado) */
  const replaceData = (d: { best: Record<string, number>; errs: string[] }) => {
    bestRef.current = d.best;
    setBest(d.best);
    lsSet('sn:best', d.best);
    saveErrs(d.errs);
  };
  const again = (cfg: Config) => {
    const r = runRef.current;
    start(cfg, !!r?.review);
  };
  /** Borra récords y errores por repasar del dispositivo */
  const resetAll = () => {
    bestRef.current = {};
    errsRef.current = [];
    setBest({});
    setErrs([]);
    lsDel('sn:best');
    lsDel('sn:err');
  };

  return { run, best, errs, start, submit, next, hint, setCount, tick, quit, again, data, replaceData, resetAll };
}
