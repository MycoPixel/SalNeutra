import { useEffect, useState } from 'react';
import { applyTheme, readTheme, saveTheme } from '../lib';
import type { ThemeId } from '../lib';

/** Tema elegido por la persona; se guarda aparte de la configuración del juego */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeId>(readTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Con «Sistema», seguir los cambios de claro/oscuro mientras la app está abierta.
  useEffect(() => {
    if (theme !== 'auto' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('auto');
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, [theme]);

  const setTheme = (id: ThemeId) => {
    setThemeState(id);
    saveTheme(id);
  };

  return { theme, setTheme };
}
