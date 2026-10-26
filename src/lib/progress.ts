import { sanitizeAch } from './achievements';
import { ALL_PAIRS } from './levels';
import { mergeStats, sanitizeStats } from './stats';
import type { Stats } from './stats';

export const APP_ID = 'sal-neutra';
export const SNAPSHOT_VERSION = 1;
const MODE_IDS = ['classic', 'time', 'survival'];
const MAX_ERRS = 60;

/** Todo lo que se guarda en el dispositivo y se puede llevar a otro */
export interface LocalData {
  best: Record<string, number>;
  errs: string[];
  stats: Stats;
  ach: Record<string, string>;
  achOn: boolean;
}

export interface Snapshot extends LocalData {
  app: string;
  v: number;
  exportedAt: string;
}

export interface ImportReport {
  records: number;
  errors: number;
  achievements: number;
}

export type ParseResult = { ok: true; snap: Snapshot } | { ok: false; error: string };

export function cleanBest(raw: unknown): Record<string, number> {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const out: Record<string, number> = {};
  for (const m of MODE_IDS) {
    const v = o[m];
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) out[m] = Math.min(Math.floor(v), 1e9);
  }
  return out;
}

export function cleanErrs(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const ok = raw.filter((k): k is string => typeof k === 'string' && ALL_PAIRS.has(k));
  return [...new Set(ok)].slice(-MAX_ERRS);
}

export function buildSnapshot(d: LocalData, now: Date = new Date()): Snapshot {
  return { app: APP_ID, v: SNAPSHOT_VERSION, exportedAt: now.toISOString(), ...d };
}

/** Lee un respaldo (archivo o código pegado) y descarta todo lo que no sea válido */
export function parseSnapshot(text: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(String(text).trim());
  } catch {
    return { ok: false, error: 'El texto no es un código de progreso válido. Revisa que esté completo.' };
  }
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  if (r.app !== APP_ID) return { ok: false, error: 'Este archivo no es un respaldo de Sal Neutra.' };
  if (typeof r.v !== 'number' || r.v > SNAPSHOT_VERSION) {
    return { ok: false, error: 'El respaldo viene de una versión más nueva de la app. Actualiza la página e inténtalo de nuevo.' };
  }
  return {
    ok: true,
    snap: {
      app: APP_ID, v: r.v, exportedAt: typeof r.exportedAt === 'string' ? r.exportedAt : '',
      best: cleanBest(r.best), errs: cleanErrs(r.errs), stats: sanitizeStats(r.stats), ach: sanitizeAch(r.ach), achOn: r.achOn === true
    }
  };
}

/** Combina lo importado con lo que ya hay: conserva los mejores valores y no borra nada */
export function mergeData(local: LocalData, inc: LocalData): { data: LocalData; report: ImportReport } {
  const best: Record<string, number> = { ...local.best };
  let records = 0;
  for (const m of MODE_IDS) {
    const b = inc.best[m] ?? 0;
    if (b > (best[m] ?? 0)) {
      best[m] = b;
      records++;
    }
  }
  const errs = cleanErrs([...local.errs, ...inc.errs]);
  const errors = errs.filter(k => !local.errs.includes(k)).length;
  const ach: Record<string, string> = { ...local.ach };
  let achievements = 0;
  for (const [id, date] of Object.entries(inc.ach)) {
    if (!ach[id]) achievements++;
    if (!ach[id] || Date.parse(date) < Date.parse(ach[id])) ach[id] = date;
  }
  return {
    data: { best, errs, stats: mergeStats(local.stats, inc.stats), ach, achOn: local.achOn || inc.achOn },
    report: { records, errors, achievements }
  };
}
