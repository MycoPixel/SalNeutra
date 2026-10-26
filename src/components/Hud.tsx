import type { Run } from '../hooks/useGame';

export function Hud({ run }: { run: Run }) {
  const { mode } = run;
  const shown = run.qn - (run.phase === 'ask' ? 1 : 0);
  return (
    <div className="hud">
      <div className="stat"><small>Puntos</small><b>{run.score}</b></div>
      <div className="stat"><small>Racha</small><b>×{run.streak}</b></div>
      <div className="stat">
        {mode === 'classic' && (<><small>Pregunta</small><b>{run.qn}/{run.total}</b></>)}
        {mode === 'time' && (<><small>Tiempo</small><b>{Math.ceil(Math.max(0, run.timeLeft))} s</b></>)}
        {mode === 'survival' && (
          <>
            <small>Vidas</small>
            <b className="lives" aria-label={`${run.lives} vidas`}>{'●'.repeat(Math.max(0, run.lives))}{'○'.repeat(Math.max(0, 3 - run.lives))}</b>
          </>
        )}
      </div>
      <div className="stat s4"><small>Aciertos</small><b>{run.correct}/{run.answered}</b></div>
      {mode === 'classic' && <div className="bar"><i style={{ width: `${(shown / run.total) * 100}%` }} /></div>}
      {mode === 'time' && <div className={`bar${run.timeLeft <= 10 ? ' warn' : ''}`}><i style={{ width: `${(Math.max(0, run.timeLeft) / 60) * 100}%` }} /></div>}
    </div>
  );
}
