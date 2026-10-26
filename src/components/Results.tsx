import { MODES } from '../constants';
import type { Run } from '../hooks/useGame';
import { Formula } from './Formula';

interface Props {
  run: Run;
  onAgain: () => void;
  onMenu: () => void;
}

export function Results({ run, onAgain, onMenu }: Props) {
  const acc = run.answered ? Math.round((run.correct / run.answered) * 100) : 0;
  const avg = run.answered ? (run.sumTime / run.answered).toFixed(1) : '0.0';
  return (
    <div className="results">
      <section className="panel">
        <p className="ask">{run.review ? 'Repaso de errores' : MODES[run.mode].name}</p>
        <div className="bigscore">{run.score}</div>
        {run.newRecord && <span className="newrec">Nuevo récord</span>}
        <div className="grid4">
          <div className="stat"><small>Aciertos</small><b>{run.correct}/{run.answered}</b></div>
          <div className="stat"><small>Precisión</small><b>{acc}%</b></div>
          <div className="stat"><small>Mejor racha</small><b>×{run.bestStreak}</b></div>
          <div className="stat"><small>Tiempo medio</small><b>{avg} s</b></div>
        </div>
      </section>
      {run.misses.length ? (
        <section className="panel miss">
          <h2>Para repasar</h2>
          <ul>
            {run.misses.map(q => (
              <li key={q.key}>
                <span className="f"><Formula text={q.formulas[0]} /></span>
                <span className="n">{q.names.stock[0]} · {q.names.sys[0]} · {q.names.trad[0]}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="panel"><h2>Sin errores en esta partida</h2></section>
      )}
      <div className="actions">
        <button className="btn primary big" type="button" onClick={onAgain}>Jugar de nuevo</button>
        <button className="btn big" type="button" onClick={onMenu}>Volver al inicio</button>
      </div>
    </div>
  );
}
