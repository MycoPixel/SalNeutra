import { useState } from 'react';
import { ACHIEVEMENTS, PLATINUM_ID, TIER_LABEL, TIER_ORDER, progressOf } from '../lib';
import type { Ach, Stats, Tier } from '../lib';
import { Switch } from './Switch';
import { Trophy } from './Trophy';

type Filter = 'all' | 'done' | 'todo';
const FILTERS: [Filter, string][] = [['all', 'Todos'], ['done', 'Desbloqueados'], ['todo', 'Pendientes']];

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });

function Card({ a, stats, unlocked }: { a: Ach; stats: Stats; unlocked: Record<string, string> }) {
  const at = unlocked[a.id];
  const hidden = !!a.secret && !at;
  const [cur, goal] = progressOf(a, stats, unlocked);
  return (
    <li className={`ach ${at ? 'done' : 'todo'}${a.id === PLATINUM_ID ? ' plat' : ''}`}>
      <Trophy tier={a.tier} locked={!at} />
      <div className="abody">
        <span className={`tierlbl ${a.tier}`}>{TIER_LABEL[a.tier]}{a.secret ? ' · secreto' : ''}</span>
        <h3>{hidden ? 'Logro secreto' : a.name}</h3>
        <p>{hidden ? 'Sigue jugando para descubrirlo.' : a.desc}</p>
        {at && <small className="adate">Desbloqueado el {fmtDate(at)}</small>}
        {!at && !hidden && (
          <>
            <div className="abar" role="progressbar" aria-label={`Progreso de ${a.name}`} aria-valuemin={0} aria-valuemax={goal} aria-valuenow={cur}>
              <i style={{ width: `${(cur / goal) * 100}%` }} />
            </div>
            <small className="acount">{cur} / {goal}</small>
          </>
        )}
      </div>
    </li>
  );
}

interface Props {
  enabled: boolean;
  onToggle: (on: boolean) => void;
  unlocked: Record<string, string>;
  stats: Stats;
  onBack: () => void;
}

export function Achievements({ enabled, onToggle, unlocked, stats, onBack }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const total = ACHIEVEMENTS.length;
  const done = ACHIEVEMENTS.filter(a => unlocked[a.id]).length;
  const tier = (t: Tier) => ({ n: ACHIEVEMENTS.filter(a => a.tier === t && unlocked[a.id]).length, of: ACHIEVEMENTS.filter(a => a.tier === t).length });
  const list = [...ACHIEVEMENTS]
    .sort((a, b) => Number(a.id !== PLATINUM_ID) - Number(b.id !== PLATINUM_ID))
    .filter(a => (filter === 'all' ? true : filter === 'done' ? !!unlocked[a.id] : !unlocked[a.id]));
  return (
    <div className="iontable">
      <header className="tablehead">
        <button type="button" className="btn ghost" onClick={onBack}>← Volver</button>
        <h1>Logros</h1>
      </header>

      <section className="panel">
        <Switch checked={enabled} onChange={onToggle} label="Activar logros" hint="Avisos al desbloquear trofeos mientras juegas." />
        {!enabled && <p className="note">Los logros están desactivados. Lo que juegues antes de activarlos también cuenta.</p>}
        <div className="achsum">
          <div className="big" aria-label={`${done} de ${total} logros desbloqueados`}>{done}<span>/{total}</span></div>
          <div className="abar" role="progressbar" aria-label="Logros desbloqueados" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
            <i style={{ width: `${(done / total) * 100}%` }} />
          </div>
          <ul className="tiers">
            {TIER_ORDER.map(t => (
              <li key={t} className={`tierlbl ${t}`}>{TIER_LABEL[t]} {tier(t).n}/{tier(t).of}</li>
            ))}
          </ul>
        </div>
      </section>

      <div className="seg" role="group" aria-label="Filtrar logros">
        {FILTERS.map(([f, label]) => (
          <button key={f} type="button" className="choice" aria-pressed={filter === f} onClick={() => setFilter(f)}>
            <span className="t">{label}</span>
          </button>
        ))}
      </div>

      <ul className="achgrid">
        {list.map(a => <Card key={a.id} a={a} stats={stats} unlocked={unlocked} />)}
        {!list.length && <li className="ionempty">No hay logros en esta lista.</li>}
      </ul>
    </div>
  );
}
