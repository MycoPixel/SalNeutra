import { useEffect, useRef, useState } from 'react';
import { NOMENS, RULES, TYPES } from '../constants';
import { isLastQuestion } from '../hooks/useGame';
import type { Run } from '../hooks/useGame';
import type { Nomen } from '../lib';
import { speedBonus } from '../lib';
import { AnswerChoices } from './AnswerChoices';
import { AnswerCounts } from './AnswerCounts';
import { AnswerText } from './AnswerText';
import { Feedback } from './Feedback';
import { Formula, Ion } from './Formula';
import { Actions, Hint } from './Hint';
import { Hud } from './Hud';

function SpeedTag({ qStart }: { qStart: number }) {
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force(x => x + 1), 250);
    return () => clearInterval(id);
  }, []);
  return <span className="tag speed">rapidez +{speedBonus((performance.now() - qStart) / 1000)}</span>;
}

interface Props {
  run: Run;
  onSubmit: (a: { sel?: number; val?: string }) => void;
  onNext: () => void;
  onHint: () => void;
  onStep: (w: 'c' | 'a', delta: number) => void;
  onTick: (dt: number) => void;
  onQuit: () => void;
}

export function Game({ run, onSubmit, onNext, onHint, onStep, onTick, onQuit }: Props) {
  const { q } = run;
  const ask = run.phase === 'ask';
  const nextRef = useRef<HTMLButtonElement>(null);
  const [desktop] = useState(() => window.matchMedia('(min-width: 960px)').matches);

  // Cuenta atrás (Contrarreloj) mientras se espera una respuesta
  useEffect(() => {
    if (!ask) return;
    let last = performance.now();
    const id = setInterval(() => {
      const t = performance.now();
      onTick((t - last) / 1000);
      last = t;
    }, 250);
    return () => clearInterval(id);
  }, [ask, run.qn, onTick]);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [run.qn]);
  useEffect(() => { if (!ask) nextRef.current?.focus({ preventScroll: true }); }, [ask]);

  // Atajos: Enter avanza tras responder; 1-4 eligen opción
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const t = e.target as HTMLElement | null;
      const onButton = !!t?.closest('button');
      if (e.key === 'Enter' && !ask && !onButton) {
        e.preventDefault();
        onNext();
      } else if (ask && q.options && t?.id !== 'ans' && /^[1-4]$/.test(e.key)) {
        onSubmit({ sel: Number(e.key) - 1 });
      } else if (e.key === 'Enter' && ask && q.type === 'ions' && !onButton) {
        e.preventDefault();
        onSubmit({});
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [ask, q, onNext, onSubmit]);

  const last = run.last;
  const rules = RULES[q.type === 'ions' ? 'ions' : (q.nomen as Nomen)];
  return (
    <div className="game">
      <Hud run={run} />
      <section className="card">
        <div className="tags">
          <span className="tag">{TYPES[q.type]}</span>
          {q.nomen && <span className="tag nom">{NOMENS[q.nomen]}</span>}
          <span className="tag">Nivel {q.level}</span>
          {ask && <SpeedTag qStart={run.qStart} />}
        </div>

        {q.type === 'ions' && (
          <>
            <p className="ask">¿Cuántos iones se necesitan para formar la sal neutra?</p>
            <div className="pair"><Ion ion={q.c} tone="c" /><Ion ion={q.a} tone="a" /></div>
          </>
        )}
        {q.type === 'f2n' && (
          <>
            <p className="ask">Escribe el nombre de este compuesto:</p>
            <div className="formula"><Formula text={q.formulas[0]} /></div>
          </>
        )}
        {q.type === 'n2f' && (
          <>
            <p className="ask">Escribe la fórmula de este compuesto:</p>
            <div className="namebig">{q.names[q.nomen as Nomen][0]}</div>
          </>
        )}

        {q.type === 'ions' && (
          <>
            <AnswerCounts q={q} cnt={run.cnt} locked={!ask} okC={last?.d.okC} okA={last?.d.okA} onStep={onStep} />
            {ask && (<>{run.hintOpen && <Hint q={q} />}<Actions hintOpen={run.hintOpen} onHint={onHint} check={{ onCheck: () => onSubmit({}) }} /></>)}
          </>
        )}
        {q.type !== 'ions' && q.options && (
          <>
            <AnswerChoices q={q} locked={!ask} selected={last?.d.sel} onPick={i => onSubmit({ sel: i })} />
            {ask && (<>{run.hintOpen && <Hint q={q} />}<Actions hintOpen={run.hintOpen} onHint={onHint} /></>)}
          </>
        )}
        {q.type !== 'ions' && !q.options && (
          <AnswerText
            key={`${run.qn}-${ask ? 'ask' : 'fb'}`}
            q={q} locked={!ask} initial={last?.d.val ?? ''} hintOpen={run.hintOpen} onHint={onHint} onSubmit={val => onSubmit({ val })}
          />
        )}

        {!ask && last && <Feedback q={q} last={last} isLast={isLastQuestion(run)} nextRef={nextRef} onNext={onNext} />}
      </section>

      <aside className="side">
        <details className="panel" open={desktop}>
          <summary>Reglas rápidas · {q.type === 'ions' ? 'Iones' : NOMENS[q.nomen as Nomen]}</summary>
          <ul>{rules.map(r => <li key={r}>{r}</li>)}</ul>
        </details>
        <details className="panel" open={desktop}>
          <summary>Cómo se puntúa</summary>
          <ul>
            <li>Acierto: 100 puntos.</li>
            <li>Rapidez: hasta +50, baja con los segundos.</li>
            <li>Racha: +10 por cada acierto seguido (máx. +100).</li>
            <li>Pista: −30. Nivel: ×1 a ×2.</li>
            <li>Iones: 50 % por cada valor correcto.</li>
          </ul>
        </details>
        <button type="button" className="btn ghost" onClick={onQuit}>Salir al inicio</button>
      </aside>
    </div>
  );
}
