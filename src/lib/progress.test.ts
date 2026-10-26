import { describe, expect, it } from 'vitest';
import {
  ACHIEVEMENTS, ALL_PAIRS, PLATINUM_ID, buildSnapshot, counts, emptyStats, formulasOf, genQuestion, mergeData, mergeStats, namesOf,
  newlyUnlocked, parseSnapshot, progressOf, recordAnswer, recordGame, sanitizeAch, sanitizeStats
} from './index';
import type { LocalData, Question, Stats } from './index';

function question(key: string, type: 'f2n' | 'n2f' | 'ions' = 'f2n', nomen: 'stock' | 'sys' | 'trad' | null = 'stock'): Question {
  const p = ALL_PAIRS.get(key);
  if (!p) throw new Error(key);
  const { L, nc, na } = counts(p.c, p.a);
  return { type, nomen: type === 'ions' ? null : nomen, c: p.c, a: p.a, nc, na, L, level: p.level, key, names: namesOf(p.c, p.a, nc, na), formulas: formulasOf(p.c, p.a, nc, na) };
}
const ans = (q: Question, o: Partial<Parameters<typeof recordAnswer>[1]> = {}) => ({ q, full: true, elapsed: 10, hints: 0, review: false, streak: 1, hour: 12, ...o });

describe('estadísticas', () => {
  it('un acierto suma en cada contador que corresponde', () => {
    const q = question('Fe3|O', 'f2n', 'trad');
    const s = recordAnswer(emptyStats(), ans(q, { elapsed: 3, streak: 4, review: true }));
    expect(s).toMatchObject({ answered: 1, correct: 1, wrong: 0, bestStreak: 4, noHintCorrect: 1, fastCorrect: 1, variableCorrect: 1, reviewFixed: 1 });
    expect(s.byNomen.trad).toBe(1);
    expect(s.byType.f2n).toBe(1);
    expect(s.byLevel['2']).toBe(1);
  });
  it('un error solo suma errores y la racha máxima no baja', () => {
    const q = question('Na1|Cl');
    let s = recordAnswer(emptyStats(), ans(q, { streak: 6 }));
    s = recordAnswer(s, ans(q, { full: false, streak: 0 }));
    expect(s).toMatchObject({ answered: 2, correct: 1, wrong: 1, bestStreak: 6 });
  });
  it('cuenta la madrugada y no usa la pista como acierto limpio', () => {
    const q = question('Na1|Cl');
    expect(recordAnswer(emptyStats(), ans(q, { hour: 2 })).night).toBe(true);
    expect(recordAnswer(emptyStats(), ans(q, { hour: 5 })).night).toBe(false);
    expect(recordAnswer(emptyStats(), ans(q, { hints: 1 })).noHintCorrect).toBe(0);
  });
  it('partidas: perfecta, con y sin pistas, y los repasos no suman récords', () => {
    const base = { mode: 'classic' as const, review: false, correct: 10, answered: 10, total: 10, score: 2100, hints: 0 };
    let s = recordGame(emptyStats(), base);
    s = recordGame(s, { ...base, hints: 2 });
    expect(s).toMatchObject({ games: 2, perfectGames: 2, perfectNoHintGames: 1, bestScoreGame: 2100 });
    const r = recordGame(emptyStats(), { ...base, review: true });
    expect(r).toMatchObject({ games: 1, perfectGames: 0, bestScoreGame: 0 });
    expect(recordGame(emptyStats(), { ...base, mode: 'time', correct: 17, answered: 20 }).bestTimeCorrect).toBe(17);
    expect(recordGame(emptyStats(), { ...base, mode: 'survival', correct: 16, answered: 19 }).bestSurvivalCorrect).toBe(16);
  });
  it('mergeStats conserva el mayor valor y no suma dos veces', () => {
    const a = { ...emptyStats(), correct: 40, bestStreak: 3, nacl: ['stock' as const] };
    const b = { ...emptyStats(), correct: 25, bestStreak: 9, nacl: ['sys' as const], night: true };
    expect(mergeStats(a, b)).toMatchObject({ correct: 40, bestStreak: 9, nacl: ['stock', 'sys'], night: true });
  });
  it('sanitizeStats descarta basura', () => {
    const s = sanitizeStats({ correct: -4, wrong: 'x', games: 3.9, byNomen: { stock: 5, zzz: 1 }, nacl: ['stock', 'otra'], tableOpened: 'sí' });
    expect(s).toMatchObject({ correct: 0, wrong: 0, games: 3, tableOpened: false });
    expect(s.byNomen).toEqual({ stock: 5, sys: 0, trad: 0 });
    expect(s.nacl).toEqual(['stock']);
    expect(sanitizeStats(null)).toEqual(emptyStats());
  });
});

describe('logros', () => {
  it('sin jugar no hay logros, y los ids no se repiten', () => {
    expect(newlyUnlocked(emptyStats(), {})).toEqual([]);
    expect(new Set(ACHIEVEMENTS.map(a => a.id)).size).toBe(ACHIEVEMENTS.length);
  });
  it('el primer acierto desbloquea «Primer enlace» y no se repite', () => {
    const s = recordAnswer(emptyStats(), ans(question('Na1|Cl')));
    expect(newlyUnlocked(s, {})).toEqual(['primer_enlace']);
    expect(newlyUnlocked(s, { primer_enlace: '2026-10-26T00:00:00.000Z' })).toEqual([]);
  });
  it('todos los logros se pueden alcanzar y el platino llega al final', () => {
    const maxed: Stats = {
      ...emptyStats(), games: 99, answered: 9999, correct: 9999, wrong: 99, bestStreak: 99,
      byNomen: { stock: 999, sys: 999, trad: 999 }, byType: { f2n: 999, n2f: 999, ions: 999 }, byLevel: { '1': 99, '2': 99, '3': 99, '4': 99, '5': 99 },
      noHintCorrect: 999, fastCorrect: 999, variableCorrect: 999, reviewFixed: 99, perfectGames: 9, perfectNoHintGames: 9,
      bestScoreGame: 99999, bestTimeCorrect: 99, bestSurvivalCorrect: 99, tableOpened: true, exported: 1, nacl: ['stock', 'sys', 'trad'], night: true
    };
    const ids = newlyUnlocked(maxed, {});
    expect(ids.sort()).toEqual(ACHIEVEMENTS.map(a => a.id).sort());
    expect(ids).toContain(PLATINUM_ID);
    const almost = Object.fromEntries(ids.filter(i => i !== PLATINUM_ID && i !== 'racha20').map(i => [i, '2026-10-26T00:00:00.000Z']));
    expect(newlyUnlocked({ ...maxed, bestStreak: 5 }, almost)).not.toContain(PLATINUM_ID);
  });
  it('el progreso se acota a la meta y el platino cuenta los demás', () => {
    const s = { ...emptyStats(), correct: 1000 };
    const centenario = ACHIEVEMENTS.find(a => a.id === 'centenario')!;
    expect(progressOf(centenario, s, {})).toEqual([100, 100]);
    const plat = ACHIEVEMENTS.find(a => a.id === PLATINUM_ID)!;
    expect(progressOf(plat, s, { centenario: '2026-10-26T00:00:00.000Z' })).toEqual([1, ACHIEVEMENTS.length - 1]);
  });
  it('sanitizeAch ignora ids desconocidos y fechas inválidas', () => {
    expect(sanitizeAch({ primer_enlace: '2026-10-26T00:00:00.000Z', inventado: '2026-10-26T00:00:00.000Z', centenario: 'ayer' })).toEqual({ primer_enlace: '2026-10-26T00:00:00.000Z' });
  });
});

describe('respaldo de progreso', () => {
  const local: LocalData = {
    best: { classic: 1200, time: 300 }, errs: ['Na1|Cl', 'Fe3|O'],
    stats: { ...emptyStats(), correct: 50, bestStreak: 7 }, ach: { primer_enlace: '2026-10-20T10:00:00.000Z' }, achOn: false
  };
  it('exportar y volver a leer da lo mismo', () => {
    const text = JSON.stringify(buildSnapshot(local, new Date('2026-10-26T12:00:00Z')));
    const res = parseSnapshot(text);
    expect(res.ok).toBe(true);
    if (res.ok) {
      const { app, v, exportedAt, ...data } = res.snap;
      expect(app).toBe('sal-neutra');
      expect(v).toBe(1);
      expect(exportedAt).toBe('2026-10-26T12:00:00.000Z');
      expect(data).toEqual(local);
    }
  });
  it('rechaza texto roto, otros archivos y versiones futuras', () => {
    expect(parseSnapshot('esto no es json').ok).toBe(false);
    expect(parseSnapshot('{"app":"otra-app","v":1}')).toMatchObject({ ok: false, error: expect.stringContaining('no es un respaldo') });
    expect(parseSnapshot('{"app":"sal-neutra","v":99}')).toMatchObject({ ok: false, error: expect.stringContaining('versión más nueva') });
    expect(parseSnapshot('null').ok).toBe(false);
  });
  it('filtra valores inválidos dentro de un respaldo válido', () => {
    const res = parseSnapshot(JSON.stringify({ app: 'sal-neutra', v: 1, best: { classic: -5, time: 80, otro: 9 }, errs: ['Na1|Cl', 'XX|YY', 7, 'Na1|Cl'], stats: { correct: 'mucho' }, ach: { inventado: 'x' } }));
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.snap.best).toEqual({ time: 80 });
      expect(res.snap.errs).toEqual(['Na1|Cl']);
      expect(res.snap.stats.correct).toBe(0);
      expect(res.snap.ach).toEqual({});
    }
  });
  it('combinar conserva los mejores valores, une errores y toma la fecha más antigua', () => {
    const inc: LocalData = {
      best: { classic: 900, time: 500, survival: 40 }, errs: ['Fe3|O', 'Ca2|OH'],
      stats: { ...emptyStats(), correct: 80, bestStreak: 3 },
      ach: { primer_enlace: '2026-10-10T08:00:00.000Z', centenario: '2026-10-22T09:00:00.000Z' }, achOn: true
    };
    const { data, report } = mergeData(local, inc);
    expect(data.best).toEqual({ classic: 1200, time: 500, survival: 40 });
    expect(data.errs).toEqual(['Na1|Cl', 'Fe3|O', 'Ca2|OH']);
    expect(data.stats).toMatchObject({ correct: 80, bestStreak: 7 });
    expect(data.ach).toEqual({ primer_enlace: '2026-10-10T08:00:00.000Z', centenario: '2026-10-22T09:00:00.000Z' });
    expect(data.achOn).toBe(true);
    expect(report).toEqual({ records: 2, errors: 1, achievements: 1 });
  });
  it('cabe en un código corto (menos de 2 KB con progreso típico)', () => {
    expect(JSON.stringify(buildSnapshot(local)).length).toBeLessThan(2048);
    expect(genQuestion).toBeTypeOf('function');
  });
});
