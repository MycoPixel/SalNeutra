import { THEMES } from '../lib';
import type { ThemeId } from '../lib';

interface Props {
  theme: ThemeId;
  onTheme: (id: ThemeId) => void;
}

/** Selector de tema con una muestra de colores por opción */
export function ThemePicker({ theme, onTheme }: Props) {
  return (
    <section className="panel">
      <h2>Tema</h2>
      <p className="hint">Elige los colores de la app. «Sistema» sigue el modo del dispositivo.</p>
      <div className="themes" role="group" aria-label="Tema de colores">
        {THEMES.map(t => (
          <button key={t.id} type="button" className="themeopt" aria-pressed={theme === t.id} title={t.hint} onClick={() => onTheme(t.id)}>
            <span className="swatch" style={{ background: t.colors.bg, borderColor: t.colors.line }} aria-hidden="true">
              <i style={{ background: t.colors.cation }} />
              <i style={{ background: t.colors.anion }} />
              <i style={{ background: t.colors.ink }} />
            </span>
            <span className="tname">{t.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
