import type { Question } from '../lib';
import { Ion } from './Formula';

export function Hint({ q }: { q: Question }) {
  if (q.type === 'ions') return <div className="hintbox">Las cargas deben anularse: mcm({q.c.q}, {Math.abs(q.a.q)}) = {q.L}</div>;
  return (
    <div className="hintbox">
      Cargas: <Ion ion={q.c} /> y <Ion ion={q.a} />
    </div>
  );
}

interface ActionsProps {
  hintOpen: boolean;
  onHint: () => void;
  /** 'submit' dentro de un formulario, 'button' con onCheck, o ninguno */
  check?: 'submit' | { onCheck: () => void };
}

export function Actions({ hintOpen, onHint, check }: ActionsProps) {
  return (
    <div className="row-actions">
      <button type="button" className="btn ghost" onClick={onHint} disabled={hintOpen}>
        {hintOpen ? 'Pista usada (−30)' : 'Pista (−30)'}
      </button>
      {check === 'submit' && (
        <button type="submit" className="btn primary">
          Comprobar
        </button>
      )}
      {check && check !== 'submit' && (
        <button type="button" className="btn primary" onClick={check.onCheck}>
          Comprobar
        </button>
      )}
    </div>
  );
}
