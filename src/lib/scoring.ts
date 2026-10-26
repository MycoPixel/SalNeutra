import type { ScoreBreakdown } from './types';

/** Ventana de la bonificación de rapidez (puntos máximos) */
export const SPEED_MAX = 50;

export const speedBonus = (elapsedSeconds: number): number => Math.max(0, SPEED_MAX - Math.floor(elapsedSeconds * 3));

interface ScoreInput {
  level: number;
  elapsed: number;
  /** aciertos seguidos antes de esta respuesta */
  streak: number;
  hints: number;
  /** fracción correcta de la pregunta (1 = completa) */
  frac: number;
}

export function scoreOf({ level, elapsed, streak, hints, frac }: ScoreInput): ScoreBreakdown {
  const base = Math.max(0, 100 - 30 * hints);
  const speed = speedBonus(elapsed);
  const streakB = Math.min(streak, 10) * 10;
  const mult = 1 + 0.25 * (level - 1);
  return { base, speed, streakB, mult, total: Math.round((base + speed + streakB) * mult * frac) };
}
