import { lsGet, lsSet } from './storage';

/** Temas visuales. Los colores deben coincidir con los de styles.css. */
export type ThemeId = 'auto' | 'light' | 'dark' | 'ocean' | 'forest' | 'sunset' | 'lavender' | 'sand';

export interface ThemeColors {
  /** Fondo de la página */
  bg: string;
  /** Fondo de paneles y tarjetas */
  surface: string;
  /** Bordes */
  line: string;
  /** Texto principal */
  ink: string;
  /** Color de cationes (y acentos cálidos) */
  cation: string;
  /** Color de aniones (y acentos fríos) */
  anion: string;
}

export interface ThemeOption {
  id: ThemeId;
  name: string;
  /** Texto de ayuda para el selector */
  hint: string;
  colors: ThemeColors;
}

export const THEME_KEY = 'sn:theme';

const LIGHT: ThemeColors = { bg: '#ecf2f3', surface: '#ffffff', line: '#c6d4d8', ink: '#10282f', cation: '#c2410c', anion: '#1d5fc4' };
const DARK: ThemeColors = { bg: '#0c1a1f', surface: '#14272d', line: '#2b434a', ink: '#e6f0f2', cation: '#ff9363', anion: '#74a9ff' };

export const THEMES: ThemeOption[] = [
  { id: 'auto', name: 'Sistema', hint: 'Claro u oscuro según el dispositivo', colors: LIGHT },
  { id: 'light', name: 'Claro', hint: 'Etiqueta de laboratorio', colors: LIGHT },
  { id: 'dark', name: 'Oscuro', hint: 'Etiqueta de laboratorio de noche', colors: DARK },
  { id: 'ocean', name: 'Océano', hint: 'Azules profundos y cian', colors: { bg: '#071820', surface: '#0f2530', line: '#244a59', ink: '#e7f6fb', cation: '#ff9b73', anion: '#5ed7ff' } },
  { id: 'forest', name: 'Bosque', hint: 'Verdes de invernadero', colors: { bg: '#0a1710', surface: '#12261a', line: '#2a4a34', ink: '#e8f3ea', cation: '#f0b96a', anion: '#6de3a6' } },
  { id: 'sunset', name: 'Atardecer', hint: 'Malva cálido y durazno', colors: { bg: '#1a0e18', surface: '#291728', line: '#4d2f48', ink: '#fbeef4', cation: '#ff9d6e', anion: '#9fb4ff' } },
  { id: 'lavender', name: 'Lavanda', hint: 'Lila claro y violeta', colors: { bg: '#f3effb', surface: '#fdfbff', line: '#d5c9e8', ink: '#241338', cation: '#b0246f', anion: '#4f3fc9' } },
  { id: 'sand', name: 'Arena', hint: 'Papel cálido y terracota', colors: { bg: '#f7f1e4', surface: '#fffdf7', line: '#ddcfb4', ink: '#332513', cation: '#b4451f', anion: '#0f6570' } }
];

const IDS = new Set<string>(THEMES.map(t => t.id));

export const isThemeId = (v: unknown): v is ThemeId => typeof v === 'string' && IDS.has(v);

/** Acepta cualquier valor guardado y cae en «Sistema» si no corresponde */
export function normalizeTheme(v: unknown): ThemeId {
  return isThemeId(v) ? v : 'auto';
}

export function themeOption(id: ThemeId): ThemeOption {
  return THEMES.find(t => t.id === id) ?? THEMES[0];
}

/** Tema oscuro efectivo (para «Sistema» consulta al dispositivo) */
export function isDarkTheme(id: ThemeId): boolean {
  if (id === 'auto') {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      && (window.matchMedia('(prefers-color-scheme: dark)').matches ?? false);
  }
  return id === 'dark' || id === 'ocean' || id === 'forest' || id === 'sunset';
}

/** Color de la barra del navegador para el tema */
export function themeColor(id: ThemeId): string {
  if (id === 'auto') return isDarkTheme('auto') ? themeOption('dark').colors.bg : themeOption('light').colors.bg;
  return themeOption(id).colors.bg;
}

export const readTheme = (): ThemeId => normalizeTheme(lsGet(THEME_KEY, 'auto'));

export const saveTheme = (id: ThemeId): void => lsSet(THEME_KEY, id);

/** Aplica el tema al documento. «Sistema» quita el atributo y deja actuar a prefers-color-scheme. */
export function applyTheme(id: ThemeId): void {
  const root = document.documentElement;
  if (id === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', id);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', themeColor(id));
}
