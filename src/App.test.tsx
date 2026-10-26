// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import { ALL_PAIRS, counts, formulasOf, namesOf } from './lib';

const setCfg = (c: object) => localStorage.setItem('sn:cfg', JSON.stringify(c));
const text = () => document.body.textContent ?? '';

beforeEach(() => {
  localStorage.clear();
  window.matchMedia = window.matchMedia ?? (((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia);
  window.scrollTo = (() => {}) as typeof window.scrollTo;
});
afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute('data-theme');
  document.querySelector('meta[name="theme-color"]')?.remove();
});

describe('interfaz', () => {
  it('tema: cambia el atributo del documento, la barra del navegador y se recuerda', () => {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Océano' }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('ocean');
    expect(localStorage.getItem('sn:theme')).toBe('"ocean"');
    expect(meta.getAttribute('content')).toBe('#071820');
    fireEvent.click(screen.getByRole('button', { name: 'Sistema' }));
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(localStorage.getItem('sn:theme')).toBe('"auto"');
  });

  it('tema: recuerda la elección al volver a abrir la app', () => {
    localStorage.setItem('sn:theme', '"lavender"');
    render(<App />);
    expect(document.documentElement.getAttribute('data-theme')).toBe('lavender');
    expect(screen.getByRole('button', { name: 'Lavanda' }).getAttribute('aria-pressed')).toBe('true');
  });
  it('muestra el inicio y completa una partida clásica de 10 preguntas', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Sal Neutra' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Jugar' }));
    for (let i = 1; i <= 10; i++) {
      expect(text()).toContain(`${i}/10`);
      const input = document.getElementById('ans') as HTMLInputElement | null;
      if (input) {
        fireEvent.change(input, { target: { value: 'respuesta incorrecta' } });
        fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }));
      } else {
        fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }));
      }
      expect(text()).toMatch(/Incorrecto|A medias|Correcto/);
      fireEvent.click(screen.getByRole('button', { name: i === 10 ? 'Ver resultados' : 'Siguiente' }));
    }
    expect(text()).toContain('Para repasar');
    expect(screen.getByRole('button', { name: 'Jugar de nuevo' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Volver al inicio' }));
    expect(screen.getByRole('button', { name: /Repasar errores/ })).toBeTruthy();
  });

  it('suma puntos al escribir la fórmula correcta', () => {
    setCfg({ level: 1, mode: 'classic', types: ['n2f'], nomens: ['stock'], mc: false });
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Jugar' }));
    const shown = document.querySelector('.namebig')?.textContent ?? '';
    const p = [...ALL_PAIRS.values()].find(x => {
      const k = counts(x.c, x.a);
      return namesOf(x.c, x.a, k.nc, k.na).stock[0] === shown;
    });
    expect(p, shown).toBeTruthy();
    const k = counts(p!.c, p!.a);
    fireEvent.change(document.getElementById('ans') as HTMLInputElement, { target: { value: formulasOf(p!.c, p!.a, k.nc, k.na)[0] } });
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }));
    expect(text()).toContain('Correcto');
    expect(text()).toMatch(/Racha×1/);
  });

  it('modo opciones: cuatro alternativas y respuesta con un clic', () => {
    setCfg({ level: 3, mode: 'survival', types: ['f2n'], nomens: ['trad'], mc: true });
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Jugar' }));
    const opts = document.querySelectorAll('.mc .choice');
    expect(opts.length).toBe(4);
    fireEvent.click(opts[0]);
    expect(text()).toMatch(/Correcto|Incorrecto/);
  });

  it('iones: los contadores suben y el resultado se evalúa', () => {
    setCfg({ level: 1, mode: 'time', types: ['ions'], nomens: ['stock'], mc: false });
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Jugar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Más Cationes' }));
    expect(document.querySelector('.step.c output')?.textContent).toBe('2');
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }));
    expect(text()).toMatch(/Correcto|Incorrecto|A medias/);
  });

  it('tabla de iones: columnas por carga, buscador y vuelta al inicio', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Tabla de iones' }));
    expect(screen.getByRole('heading', { name: 'Tabla de iones' })).toBeTruthy();
    const heads = [...document.querySelectorAll('.colhead')].map(h => (h.textContent ?? '').match(/^[+−]\d/)?.[0]);
    expect(heads).toEqual(['+1', '+2', '+3', '+4', '−1', '−2', '−3']);
    expect(text()).toContain('hierro(III)');
    expect(text()).toContain('férrico');
    expect(text()).toContain('bicarbonato');
    fireEvent.change(document.getElementById('ionsearch') as HTMLInputElement, { target: { value: 'sulf' } });
    expect(text()).toContain('sulfato');
    expect(text()).not.toContain('nitrato');
    fireEvent.click(screen.getByRole('button', { name: '← Volver' }));
    expect(screen.getByRole('button', { name: 'Jugar' })).toBeTruthy();
  });

  it('tabla de iones: la carga va como superíndice y los átomos como subíndice (PO₄³⁻)', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Tabla de iones' }));
    const item = [...document.querySelectorAll('.ionitem')].find(li => li.textContent?.includes('fosfato') && li.querySelector('.ion')?.textContent?.startsWith('PO4'));
    expect(item).toBeTruthy();
    expect(item!.querySelector('.ion sub')?.textContent).toBe('4');
    expect(item!.querySelector('.ion sup')?.textContent).toBe('3−');
  });

  it('logros: el interruptor los activa y se recuerda', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Logros' }));
    const sw = screen.getByRole('switch', { name: /Activar logros/ });
    expect(sw.getAttribute('aria-checked')).toBe('false');
    expect(text()).toContain('desactivados');
    fireEvent.click(sw);
    expect(sw.getAttribute('aria-checked')).toBe('true');
    expect(localStorage.getItem('sn:achOn')).toBe('true');
    expect(text()).toContain('Logro secreto');
    expect(text()).toContain('Químico platino');
    fireEvent.click(screen.getByRole('button', { name: '← Volver' }));
    expect(screen.getByRole('button', { name: /Logros 0\/\d+/ })).toBeTruthy();
  });

  it('logros activados: un acierto muestra el aviso «Primer enlace»', () => {
    localStorage.setItem('sn:achOn', 'true');
    setCfg({ level: 1, mode: 'classic', types: ['n2f'], nomens: ['stock'], mc: false });
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Jugar' }));
    const shown = document.querySelector('.namebig')?.textContent ?? '';
    const p = [...ALL_PAIRS.values()].find(x => {
      const k = counts(x.c, x.a);
      return namesOf(x.c, x.a, k.nc, k.na).stock[0] === shown;
    })!;
    const k = counts(p.c, p.a);
    fireEvent.change(document.getElementById('ans') as HTMLInputElement, { target: { value: formulasOf(p.c, p.a, k.nc, k.na)[0] } });
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }));
    expect(document.querySelector('.toasts')?.textContent).toContain('Primer enlace');
    expect(JSON.parse(localStorage.getItem('sn:ach') ?? '{}').primer_enlace).toBeTruthy();
  });

  it('logros desactivados: se registran estadísticas pero no hay avisos', () => {
    setCfg({ level: 1, mode: 'classic', types: ['ions'], nomens: ['stock'], mc: false });
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Jugar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }));
    expect(document.querySelector('.toasts')?.textContent).toBe('');
    expect(JSON.parse(localStorage.getItem('sn:stats') ?? '{}').answered).toBe(1);
    expect(localStorage.getItem('sn:ach')).toBeNull();
  });

  it('copia de progreso: importar un código combina récords y errores', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Copia de progreso' }));
    const code = JSON.stringify({ app: 'sal-neutra', v: 1, best: { classic: 999 }, errs: ['Na1|Cl'], stats: { correct: 3 }, ach: {}, achOn: false });
    fireEvent.change(document.getElementById('importcode') as HTMLTextAreaElement, { target: { value: code } });
    fireEvent.click(screen.getByRole('button', { name: 'Importar código' }));
    expect(text()).toContain('Importado');
    expect(text()).toContain('Errores agregados al repaso: 1');
    fireEvent.click(screen.getByRole('button', { name: '← Volver' }));
    expect(text()).toContain('999');
    expect(screen.getByRole('button', { name: /Repasar errores \(1\)/ })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('sn:best') ?? '{}').classic).toBe(999);
  });

  it('copia de progreso: un código inválido muestra el error y no cambia nada', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Copia de progreso' }));
    fireEvent.change(document.getElementById('importcode') as HTMLTextAreaElement, { target: { value: '{"app":"otra"}' } });
    fireEvent.click(screen.getByRole('button', { name: 'Importar código' }));
    expect(text()).toContain('no es un respaldo de Sal Neutra');
    expect(localStorage.getItem('sn:best')).toBeNull();
  });

  it('copia de progreso: exportar sin portapapeles muestra el código y se puede volver a importar', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('denegado')) }, configurable: true });
    localStorage.setItem('sn:best', JSON.stringify({ time: 321 }));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Copia de progreso' }));
    fireEvent.click(screen.getByRole('button', { name: 'Copiar código' }));
    const box = (await screen.findByLabelText('Código de progreso')) as HTMLTextAreaElement;
    const snap = JSON.parse(box.value);
    expect(snap).toMatchObject({ app: 'sal-neutra', v: 1, best: { time: 321 } });
    expect(snap.stats.exported).toBe(1);
    cleanup();
    localStorage.clear();
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Copia de progreso' }));
    fireEvent.change(document.getElementById('importcode') as HTMLTextAreaElement, { target: { value: box.value } });
    fireEvent.click(screen.getByRole('button', { name: 'Importar código' }));
    expect(JSON.parse(localStorage.getItem('sn:best') ?? '{}').time).toBe(321);
  });
});
