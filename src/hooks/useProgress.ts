import { useRef, useState } from 'react';
import {
  ACHIEVEMENTS, TIER_LABEL, emptyStats, lsDel, lsGet, lsSet, newlyUnlocked, recordAnswer, recordExport, recordGame, recordTable, sanitizeAch, sanitizeStats
} from '../lib';
import type { AnswerEvent, GameEvent, Stats, Tier } from '../lib';

export interface Toast {
  id: number;
  title: string;
  text: string;
  tier?: Tier;
}

let toastId = 0;
const TOAST_MS = 6000;

/** Estadísticas siempre; logros solo si el usuario los activó */
export function useProgress() {
  const [stats, setStats] = useState<Stats>(() => sanitizeStats(lsGet('sn:stats', {})));
  const [unlocked, setUnlocked] = useState<Record<string, string>>(() => sanitizeAch(lsGet('sn:ach', {})));
  const [enabled, setEnabledState] = useState<boolean>(() => lsGet<boolean>('sn:achOn', false) === true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const statsRef = useRef(stats);
  const unlockedRef = useRef(unlocked);
  const enabledRef = useRef(enabled);

  const push = (t: Omit<Toast, 'id'>) => {
    const id = ++toastId;
    setToasts(x => [...x.slice(-2), { ...t, id }]);
    setTimeout(() => setToasts(x => x.filter(y => y.id !== id)), TOAST_MS);
  };
  const dismissToast = (id: number) => setToasts(x => x.filter(y => y.id !== id));

  const commitUnlocked = (ids: string[]) => {
    const stamp = new Date().toISOString();
    const next = { ...unlockedRef.current, ...Object.fromEntries(ids.map(id => [id, stamp])) };
    unlockedRef.current = next;
    setUnlocked(next);
    lsSet('sn:ach', next);
  };

  /** Desbloquea lo que corresponda; con `quiet` avisa una sola vez en vez de uno por logro */
  const settle = (s: Stats, quiet = false) => {
    if (!enabledRef.current) return;
    const ids = newlyUnlocked(s, unlockedRef.current);
    if (!ids.length) return;
    commitUnlocked(ids);
    if (quiet) {
      const only = ids.length === 1 ? ACHIEVEMENTS.find(x => x.id === ids[0]) : undefined;
      push(only
        ? { title: only.name, text: `${TIER_LABEL[only.tier]} · con tu historial de juego`, tier: only.tier }
        : { title: `${ids.length} logros desbloqueados`, text: 'Con tu historial de juego.', tier: 'gold' });
      return;
    }
    for (const id of ids) {
      const a = ACHIEVEMENTS.find(x => x.id === id);
      if (a) push({ title: a.name, text: `${TIER_LABEL[a.tier]} · ${a.desc}`, tier: a.tier });
    }
  };

  const apply = (next: Stats, quiet = false) => {
    statsRef.current = next;
    setStats(next);
    lsSet('sn:stats', next);
    settle(next, quiet);
  };

  const setEnabled = (on: boolean) => {
    enabledRef.current = on;
    setEnabledState(on);
    lsSet('sn:achOn', on);
    if (!on) return;
    const before = Object.keys(unlockedRef.current).length;
    settle(statsRef.current, true);
    if (Object.keys(unlockedRef.current).length === before) push({ title: 'Logros activados', text: 'Se desbloquean mientras juegas.', tier: 'gold' });
  };

  const replaceAll = (d: { stats: Stats; ach: Record<string, string>; achOn: boolean }) => {
    unlockedRef.current = d.ach;
    setUnlocked(d.ach);
    lsSet('sn:ach', d.ach);
    enabledRef.current = d.achOn;
    setEnabledState(d.achOn);
    lsSet('sn:achOn', d.achOn);
    apply(d.stats, true);
  };

  /** Borra estadísticas y logros desbloqueados; conserva la preferencia de logros */
  const resetAll = () => {
    const fresh = emptyStats();
    statsRef.current = fresh;
    setStats(fresh);
    unlockedRef.current = {};
    setUnlocked({});
    setToasts([]);
    lsDel('sn:stats');
    lsDel('sn:ach');
  };

  return {
    stats, unlocked, enabled, toasts, dismissToast, setEnabled, replaceAll, resetAll,
    onAnswer: (e: AnswerEvent) => apply(recordAnswer(statsRef.current, e)),
    onFinish: (e: GameEvent) => apply(recordGame(statsRef.current, e)),
    markTable: () => apply(recordTable(statsRef.current)),
    markExport: () => apply(recordExport(statsRef.current)),
    /** Datos actuales, siempre al día aunque la pantalla aún no se haya redibujado */
    data: () => ({ stats: statsRef.current, ach: unlockedRef.current, achOn: enabledRef.current })
  };
}
