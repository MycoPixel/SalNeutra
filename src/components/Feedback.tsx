import { NOMENS } from '../constants';
import type { Last } from '../hooks/useGame';
import { CATIONS, ROMAN } from '../lib';
import type { Nomen, Question } from '../lib';
import { Formula, Ion } from './Formula';

/** Explicación paso a paso del balance de cargas y los tres nombres */
export function Explain({ q }: { q: Question }) {
  const { c, a, nc, na, L } = q;
  const ac = Math.abs(a.q);
  const sib = CATIONS.filter(x => x.sym === c.sym);
  const hi = Math.max(...sib.map(x => x.q));
  return (
    <div className="why">
      <p>Iones: <Ion ion={c} /> y <Ion ion={a} /></p>
      <p>
        {c.q === ac
          ? `Las cargas son iguales (${c.q} y ${ac}), alcanza con 1 de cada ion.`
          : `mcm(${c.q}, ${ac}) = ${L}. Cationes: ${L} ÷ ${c.q} = ${nc}. Aniones: ${L} ÷ ${ac} = ${na}.`}
      </p>
      <p>Carga total: (+{c.q}) × {nc} + (−{ac}) × {na} = 0</p>
      <p>Fórmula: <b><Formula text={q.formulas[0]} /></b></p>
      <p>
        Stock: <b>{q.names.stock[0]}</b> · Sistemática: <b>{q.names.sys[0]}</b> · Tradicional: <b>{q.names.trad[0]}</b>
      </p>
      {c.variable && sib.length > 1 && (
        <p>
          {c.el[0].toUpperCase() + c.el.slice(1)} con carga +{c.q}: número romano ({ROMAN[c.q]}), y en tradicional terminación -{c.q === hi ? 'ico (mayor carga)' : 'oso (menor carga)'}.
        </p>
      )}
    </div>
  );
}

interface Props {
  q: Question;
  last: Last;
  isLast: boolean;
  nextRef: React.RefObject<HTMLButtonElement | null>;
  onNext: () => void;
}

export function Feedback({ q, last, isLast, nextRef, onNext }: Props) {
  const { pts, d } = last;
  let title = 'Incorrecto';
  let note: string | null = null;
  if (last.full) title = 'Correcto';
  else if (q.type === 'ions' && last.frac > 0) title = 'A medias: un valor está bien';
  else if (d.res === 'case') title = 'Casi: revisa mayúsculas y minúsculas';
  else if (typeof d.res === 'string' && d.res.startsWith('other:')) {
    title = 'Incorrecto para esta nomenclatura';
    note = `Ese nombre corresponde a la nomenclatura ${NOMENS[d.res.slice(6) as Nomen]}.`;
  }
  return (
    <>
      <div className={`fb ${last.full ? 'ok' : 'bad'}`} role="status">
        <h3>{title}</h3>
        {note && <p>{note}</p>}
        <div className="pts">
          <b>+{pts.total}</b>
          {last.frac > 0 && (
            <>
              <span>base {pts.base}</span>
              <span>rapidez +{pts.speed}</span>
              {pts.streakB > 0 && <span>racha +{pts.streakB}</span>}
              <span>nivel ×{pts.mult}</span>
              {last.frac < 1 && <span>×0.5</span>}
            </>
          )}
        </div>
        {!last.full && q.type !== 'ions' && (
          <>
            {d.val ? <p>Tu respuesta: <b>{d.val}</b></p> : null}
            <p className="right-ans">Respuesta correcta: {q.type === 'f2n' ? q.names[q.nomen as Nomen][0] : <Formula text={q.formulas[0]} />}</p>
          </>
        )}
        {!last.full && q.type === 'ions' && (
          <p className="right-ans">Respuesta correcta: {q.nc} × <Ion ion={q.c} /> y {q.na} × <Ion ion={q.a} /></p>
        )}
        <Explain q={q} />
      </div>
      <button type="button" className="btn primary big" ref={nextRef} onClick={onNext}>
        {isLast ? 'Ver resultados' : 'Siguiente'}
      </button>
    </>
  );
}
