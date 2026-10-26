import type { ReactNode } from 'react';
import { MODES, MODE_IDS, NOMENS, NOMEN_DESC, NOMEN_IDS, TYPES, TYPE_DESC, TYPE_IDS } from '../constants';
import { ALL_PAIRS, LEVELS, LEVEL_IDS, counts, formulasOf } from '../lib';
import type { Config, Nomen, QType, ThemeId } from '../lib';
import { Formula, Ion } from './Formula';
import { ThemePicker } from './ThemePicker';

interface ChoiceProps {
  selected: boolean;
  radio?: boolean;
  n?: ReactNode;
  title: string;
  desc?: string;
  onClick: () => void;
}

function Choice({ selected, radio, n, title, desc, onClick }: ChoiceProps) {
  const aria = radio ? { role: 'radio', 'aria-checked': selected } : { 'aria-pressed': selected };
  return (
    <button type="button" className="choice" onClick={onClick} {...aria}>
      {n != null && <span className="n">{n}</span>}
      <span className="t">{title}</span>
      {desc && <span className="d">{desc}</span>}
    </button>
  );
}

/** Ejemplo fijo del menú: Al₂(SO₄)₃ con su balance de cargas */
function ExampleCard() {
  const p = ALL_PAIRS.get('Al3|SO4');
  if (!p) return null;
  const { nc, na } = counts(p.c, p.a);
  return (
    <section className="example" aria-label="Ejemplo de sal neutra">
      <div className="row">
        <span>{nc}</span><Ion ion={p.c} tone="c" /><span className="op">+</span><span>{na}</span><Ion ion={p.a} tone="a" />
      </div>
      <div className="balance" aria-hidden="true">
        <div className="pos">+{p.c.q * nc}<i /></div>
        <div className="neg">−{Math.abs(p.a.q) * na}<i /></div>
      </div>
      <div className="res"><Formula text={formulasOf(p.c, p.a, nc, na)[0]} /></div>
      <small>sulfato de aluminio · tris(sulfato) de dialuminio<br />Carga total: (+3)×2 + (−2)×3 = 0</small>
    </section>
  );
}

const toggle = <T,>(list: T[], v: T): T[] => (list.includes(v) ? (list.length > 1 ? list.filter(x => x !== v) : list) : [...list, v]);

interface Props {
  cfg: Config;
  onCfg: (c: Config) => void;
  best: Record<string, number>;
  errCount: number;
  onStart: () => void;
  onReview: () => void;
  onNav: (view: 'table' | 'ach' | 'backup') => void;
  /** texto corto junto a «Logros», ej. «3/27»; vacío si están desactivados */
  achLabel: string;
  theme: ThemeId;
  onTheme: (id: ThemeId) => void;
}

export function Home({ cfg, onCfg, best, errCount, onStart, onReview, onNav, achLabel, theme, onTheme }: Props) {
  const rec = (m: string) => <b>{best[m] ?? '—'}</b>;
  return (
    <div className="home">
      <div className="hero">
        <p className="eyebrow">Nomenclatura inorgánica · Stock, sistemática y tradicional</p>
        <h1>Sal Neutra</h1>
        <p className="lead">Nombra, formula y balancea cargas hasta que la nomenclatura inorgánica salga sola.</p>
        <ExampleCard />
        <p className="records">Récords · Clásico {rec('classic')} · Contrarreloj {rec('time')} · Supervivencia {rec('survival')}</p>
        <div className="actions">
          <button className="btn primary big" type="button" onClick={onStart}>Jugar</button>
          {errCount > 0 && <button className="btn big" type="button" onClick={onReview}>Repasar errores ({errCount})</button>}
        </div>
        <div className="links">
          <button className="btn ghost" type="button" onClick={() => onNav('table')}>Tabla de iones</button>
          <button className="btn ghost" type="button" onClick={() => onNav('ach')}>Logros{achLabel ? ` ${achLabel}` : ''}</button>
          <button className="btn ghost" type="button" onClick={() => onNav('backup')}>Copia de progreso</button>
        </div>
      </div>
      <div className="opts">
        <section className="panel">
          <h2>Nivel</h2>
          <div className="choices" role="radiogroup" aria-label="Nivel">
            <Choice radio n="1–5" title="Todos los niveles" desc="Mezcla las cinco categorías" selected={cfg.level === 'all'} onClick={() => onCfg({ ...cfg, level: 'all' })} />
            {LEVEL_IDS.map(n => (
              <Choice key={n} radio n={n} title={LEVELS[n].name} desc={LEVELS[n].desc} selected={cfg.level === n} onClick={() => onCfg({ ...cfg, level: n })} />
            ))}
          </div>
        </section>
        <section className="panel">
          <h2>Modo</h2>
          <div className="choices" role="radiogroup" aria-label="Modo">
            {MODE_IDS.map(m => <Choice key={m} radio title={MODES[m].name} desc={MODES[m].desc} selected={cfg.mode === m} onClick={() => onCfg({ ...cfg, mode: m })} />)}
          </div>
        </section>
        <section className="panel">
          <h2>Tipos de pregunta</h2>
          <p className="hint">Deja al menos uno activo.</p>
          <div className="choices">
            {TYPE_IDS.map((t: QType) => <Choice key={t} title={TYPES[t]} desc={TYPE_DESC[t]} selected={cfg.types.includes(t)} onClick={() => onCfg({ ...cfg, types: toggle(cfg.types, t) })} />)}
          </div>
        </section>
        <section className="panel">
          <h2>Nomenclaturas</h2>
          <p className="hint">Se pregunta con las que dejes activas.</p>
          <div className="choices">
            {NOMEN_IDS.map((n: Nomen) => <Choice key={n} title={NOMENS[n]} desc={NOMEN_DESC[n]} selected={cfg.nomens.includes(n)} onClick={() => onCfg({ ...cfg, nomens: toggle(cfg.nomens, n) })} />)}
          </div>
        </section>
        <section className="panel">
          <h2>Respuesta</h2>
          <div className="seg" role="radiogroup" aria-label="Forma de responder">
            <Choice radio title="Escribir" selected={!cfg.mc} onClick={() => onCfg({ ...cfg, mc: false })} />
            <Choice radio title="Opciones" selected={cfg.mc} onClick={() => onCfg({ ...cfg, mc: true })} />
          </div>
        </section>
        <ThemePicker theme={theme} onTheme={onTheme} />
      </div>
    </div>
  );
}
