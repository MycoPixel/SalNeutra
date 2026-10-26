import type { Stats } from './stats';

export type Tier = 'bronze' | 'silver' | 'gold' | 'platinum';

export const TIER_LABEL: Record<Tier, string> = { bronze: 'Bronce', silver: 'Plata', gold: 'Oro', platinum: 'Platino' };
export const TIER_ORDER: Tier[] = ['platinum', 'gold', 'silver', 'bronze'];

export interface Ach {
  id: string;
  name: string;
  desc: string;
  tier: Tier;
  /** se muestra como «Logro secreto» hasta desbloquearlo */
  secret?: boolean;
  /** [avance actual, meta]; se desbloquea cuando el avance llega a la meta */
  goal: (s: Stats) => [number, number];
}

export const PLATINUM_ID = 'platino';

const g = (cur: number, target: number): [number, number] => [Math.min(cur, target), target];
const flag = (b: boolean): [number, number] => [b ? 1 : 0, 1];
const lowest = (o: Record<string, number>): number => Math.min(...Object.values(o));

export const ACHIEVEMENTS: Ach[] = [
  { id: 'primer_enlace', name: 'Primer enlace', desc: 'Responde bien tu primera pregunta.', tier: 'bronze', goal: s => g(s.correct, 1) },
  { id: 'primera_partida', name: 'Primera partida', desc: 'Termina una partida completa.', tier: 'bronze', goal: s => g(s.games, 1) },
  { id: 'lector_tablas', name: 'Lector de tablas', desc: 'Abre la tabla de iones.', tier: 'bronze', goal: s => flag(s.tableOpened) },
  { id: 'cargas_equilibrio', name: 'Cargas en equilibrio', desc: 'Acierta 5 preguntas de iones de la sal neutra.', tier: 'bronze', goal: s => g(s.byType.ions, 5) },
  { id: 'por_mis_medios', name: 'Por mis propios medios', desc: 'Acierta 10 preguntas sin usar pistas.', tier: 'bronze', goal: s => g(s.noHintCorrect, 10) },
  { id: 'copia_seguridad', name: 'Copia de seguridad', desc: 'Exporta tu progreso.', tier: 'bronze', goal: s => g(s.exported, 1) },
  { id: 'calentando', name: 'Calentando motores', desc: 'Logra una racha de 5 aciertos.', tier: 'bronze', goal: s => g(s.bestStreak, 5) },
  { id: 'corrigiendo', name: 'Corrigiendo el rumbo', desc: 'Acierta 5 preguntas en el repaso de errores.', tier: 'bronze', goal: s => g(s.reviewFixed, 5) },

  { id: 'racha10', name: 'Racha de 10', desc: 'Logra una racha de 10 aciertos.', tier: 'silver', goal: s => g(s.bestStreak, 10) },
  { id: 'centenario', name: 'Centenario', desc: 'Acumula 100 respuestas correctas.', tier: 'silver', goal: s => g(s.correct, 100) },
  { id: 'trilingue', name: 'Trilingüe', desc: 'Acierta 20 preguntas en cada nomenclatura: Stock, sistemática y tradicional.', tier: 'silver', goal: s => g(lowest(s.byNomen), 20) },
  { id: 'contador_iones', name: 'Contador de iones', desc: 'Acierta 30 preguntas de iones de la sal neutra.', tier: 'silver', goal: s => g(s.byType.ions, 30) },
  { id: 'relampago', name: 'Relámpago', desc: 'Acierta 10 preguntas en menos de 5 segundos cada una.', tier: 'silver', goal: s => g(s.fastCorrect, 10) },
  { id: 'doble_vida', name: 'Metales con doble vida', desc: 'Acierta 20 preguntas con metales de carga variable.', tier: 'silver', goal: s => g(s.variableCorrect, 20) },
  { id: 'impecable', name: 'Clásico impecable', desc: 'Termina una partida Clásica con 10 de 10.', tier: 'silver', goal: s => g(s.perfectGames, 1) },
  { id: 'contra_reloj', name: 'Contra el reloj', desc: 'Acierta 15 preguntas en una partida de Contrarreloj.', tier: 'silver', goal: s => g(s.bestTimeCorrect, 15) },
  { id: 'superviviente', name: 'Superviviente', desc: 'Acierta 15 preguntas en una sola partida de Supervivencia.', tier: 'silver', goal: s => g(s.bestSurvivalCorrect, 15) },
  { id: 'dos_mil', name: 'Dos mil puntos', desc: 'Suma 2000 puntos en una sola partida.', tier: 'silver', goal: s => g(s.bestScoreGame, 2000) },

  { id: 'racha20', name: 'Racha imparable', desc: 'Logra una racha de 20 aciertos.', tier: 'gold', goal: s => g(s.bestStreak, 20) },
  { id: 'medio_millar', name: 'Medio millar', desc: 'Acumula 500 respuestas correctas.', tier: 'gold', goal: s => g(s.correct, 500) },
  { id: 'todoterreno', name: 'Todoterreno', desc: 'Acierta 15 preguntas en cada uno de los 5 niveles.', tier: 'gold', goal: s => g(lowest(s.byLevel), 15) },
  { id: 'sin_pistas', name: 'Sin una sola pista', desc: 'Termina 3 partidas Clásicas perfectas sin usar pistas.', tier: 'gold', goal: s => g(s.perfectNoHintGames, 3) },
  { id: 'cinco_mil', name: 'Cinco mil puntos', desc: 'Suma 5000 puntos en una sola partida.', tier: 'gold', goal: s => g(s.bestScoreGame, 5000) },

  { id: 'sal_mesa', name: 'Sal de mesa', desc: 'Responde bien el cloruro de sodio en las tres nomenclaturas.', tier: 'silver', secret: true, goal: s => g(s.nacl.length, 3) },
  { id: 'noctambulo', name: 'Noctámbulo', desc: 'Estudia de madrugada, entre las 00:00 y las 05:00.', tier: 'bronze', secret: true, goal: s => flag(s.night) },
  { id: 'ensayo_error', name: 'Ensayo y error', desc: 'Comete 25 errores. Así también se aprende.', tier: 'bronze', secret: true, goal: s => g(s.wrong, 25) },

  { id: PLATINUM_ID, name: 'Químico platino', desc: 'Desbloquea todos los demás logros.', tier: 'platinum', goal: () => [0, 1] }
];

/** Avance de un logro; el platino cuenta cuántos de los demás están desbloqueados */
export function progressOf(a: Ach, stats: Stats, unlocked: Record<string, string>): [number, number] {
  if (a.id !== PLATINUM_ID) return a.goal(stats);
  const others = ACHIEVEMENTS.filter(x => x.id !== PLATINUM_ID);
  return [others.filter(x => unlocked[x.id]).length, others.length];
}

/** Logros que se cumplen con estas estadísticas y todavía no estaban desbloqueados */
export function newlyUnlocked(stats: Stats, unlocked: Record<string, string>): string[] {
  const out: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (a.id === PLATINUM_ID || unlocked[a.id]) continue;
    const [cur, goal] = a.goal(stats);
    if (cur >= goal) out.push(a.id);
  }
  const has = (id: string) => !!unlocked[id] || out.includes(id);
  if (!has(PLATINUM_ID) && ACHIEVEMENTS.every(a => a.id === PLATINUM_ID || has(a.id))) out.push(PLATINUM_ID);
  return out;
}

/** Deja solo logros conocidos con fecha válida */
export function sanitizeAch(raw: unknown): Record<string, string> {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const a of ACHIEVEMENTS) {
    const v = o[a.id];
    if (typeof v === 'string' && !Number.isNaN(Date.parse(v))) out[a.id] = v;
  }
  return out;
}
