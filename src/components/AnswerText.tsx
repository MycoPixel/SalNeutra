import { useEffect, useRef, useState } from 'react';
import type { Question } from '../lib';
import { normFormula } from '../lib';
import { Formula } from './Formula';
import { Hint, Actions } from './Hint';

interface Key {
  insert: string;
  label?: string;
  fn?: boolean;
}

/** Teclas de apoyo según la pregunta (paréntesis y números en fórmulas; prefijos y "de" en nombres) */
function keysFor(q: Question): Key[] {
  const t = (insert: string): Key => ({ insert, fn: true });
  if (q.type === 'n2f') return ['(', ')', '2', '3', '4', '5', '6', '7'].map(insert => ({ insert }));
  if (q.nomen === 'stock') return [{ insert: ' de ', label: 'de', fn: true }, { insert: '(I)' }, { insert: '(II)' }, { insert: '(III)' }, { insert: '(IV)' }];
  if (q.nomen === 'sys') {
    return [{ insert: ' de ', label: 'de', fn: true }, t('mono'), t('di'), t('tri'), t('tetra'), t('penta'), t('bis'), t('tris'), { insert: '(' }, { insert: ')' }];
  }
  return [{ insert: ' de ', label: 'de', fn: true }, t('ácido '), t('hipo'), t('per')];
}

interface Props {
  q: Question;
  locked?: boolean;
  initial?: string;
  hintOpen: boolean;
  onHint: () => void;
  onSubmit: (value: string) => void;
}

export function AnswerText({ q, locked = false, initial = '', hintOpen, onHint, onSubmit }: Props) {
  const [value, setValue] = useState(initial);
  const ref = useRef<HTMLInputElement>(null);
  const label = q.type === 'f2n' ? 'Escribe el nombre' : 'Escribe la fórmula, ej. Ca(OH)2';

  useEffect(() => {
    if (!locked) ref.current?.focus({ preventScroll: true });
  }, [locked]);

  const edit = (from: number, to: number, text: string) => {
    const next = value.slice(0, from) + text + value.slice(to);
    setValue(next);
    requestAnimationFrame(() => {
      ref.current?.focus();
      ref.current?.setSelectionRange(from + text.length, from + text.length);
    });
  };
  const sel = () => {
    const el = ref.current;
    const s = el?.selectionStart ?? value.length;
    return [s, el?.selectionEnd ?? s] as const;
  };
  const insert = (text: string) => {
    const [s, e] = sel();
    edit(s, e, text);
  };
  const back = () => {
    const [s, e] = sel();
    if (s !== e) edit(s, e, '');
    else if (s > 0) edit(s - 1, s, '');
  };

  return (
    <form
      className="field"
      onSubmit={ev => {
        ev.preventDefault();
        if (!locked && value.trim()) onSubmit(value);
      }}
    >
      <label className="sr" htmlFor="ans">{label}</label>
      <input
        id="ans" ref={ref} type="text" inputMode="text" autoCapitalize="off" autoComplete="off" autoCorrect="off"
        spellCheck={false} placeholder={label} value={value} readOnly={locked} onChange={e => setValue(e.target.value)}
      />
      {q.type === 'n2f' && (
        <div className="preview" aria-hidden="true">
          <Formula text={normFormula(value)} />
        </div>
      )}
      {!locked && (
        <>
          <div className="keys">
            {keysFor(q).map(k => (
              <button key={k.insert} type="button" className={`key${k.fn ? ' fn' : ''}`} aria-label={`Insertar ${k.label ?? k.insert.trim()}`} onClick={() => insert(k.insert)}>
                {k.label ?? k.insert}
              </button>
            ))}
            <button type="button" className="key fn" aria-label="Borrar" onClick={back}>⌫</button>
          </div>
          {hintOpen && <Hint q={q} />}
          <Actions hintOpen={hintOpen} onHint={onHint} check="submit" />
        </>
      )}
    </form>
  );
}
