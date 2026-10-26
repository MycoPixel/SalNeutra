import { LETTERS } from '../constants';
import type { Question } from '../lib';
import { Formula } from './Formula';

interface Props {
  q: Question;
  locked: boolean;
  selected?: number;
  onPick: (i: number) => void;
}

export function AnswerChoices({ q, locked, selected, onPick }: Props) {
  return (
    <div className="mc" role="group" aria-label="Opciones">
      {(q.options ?? []).map((o, i) => {
        let cls = q.type === 'f2n' ? ' name' : '';
        if (locked) {
          if (o.ok) cls += ' right';
          else if (selected === i) cls += ' wrong';
        }
        return (
          <button key={o.key} type="button" className={`choice${cls}`} disabled={locked} onClick={() => onPick(i)}>
            <span className="n">{LETTERS[i]}</span>
            <span className="t">{q.type === 'f2n' ? o.key : <Formula text={o.key} />}</span>
          </button>
        );
      })}
    </div>
  );
}
