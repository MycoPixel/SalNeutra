import type { Anion, Cation, Question } from '../lib';
import { Ion } from './Formula';

interface Props {
  q: Question;
  cnt: { c: number; a: number };
  locked: boolean;
  okC?: boolean;
  okA?: boolean;
  onStep: (w: 'c' | 'a', delta: number) => void;
}

interface RowProps {
  w: 'c' | 'a';
  ion: Cation | Anion;
  label: string;
  value: number;
  locked: boolean;
  ok?: boolean;
  onStep: Props['onStep'];
}

function Row({ w, ion, label, value, locked, ok, onStep }: RowProps) {
  const cls = locked ? (ok ? ' ok' : ' no') : '';
  return (
    <div className={`step ${w}${cls}`}>
      <div>
        <Ion ion={ion} />
        <small>{label} · carga {ion.q > 0 ? '+' : '−'}{Math.abs(ion.q)}</small>
      </div>
      <div className="ctr">
        <button type="button" aria-label={`Menos ${label}`} disabled={locked} onClick={() => onStep(w, -1)}>−</button>
        <output aria-live="polite">{value}</output>
        <button type="button" aria-label={`Más ${label}`} disabled={locked} onClick={() => onStep(w, 1)}>+</button>
      </div>
    </div>
  );
}

export function AnswerCounts({ q, cnt, locked, okC, okA, onStep }: Props) {
  return (
    <div className="steps">
      <Row w="c" ion={q.c} label="Cationes" value={cnt.c} locked={locked} ok={okC} onStep={onStep} />
      <Row w="a" ion={q.a} label="Aniones" value={cnt.a} locked={locked} ok={okA} onStep={onStep} />
    </div>
  );
}
