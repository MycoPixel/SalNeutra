import { describe, expect, it } from 'vitest';
import {
  ALL_PAIRS, LEVEL_IDS, poolFor, counts, namesOf, formulasOf, checkName, checkFormula, scoreOf, genQuestion, normName
} from './index';
import type { Nomen } from './types';

const NOMENS: Nomen[] = ['stock', 'sys', 'trad'];
const pairs = [...ALL_PAIRS.values()];

function parts(key: string) {
  const p = ALL_PAIRS.get(key);
  if (!p) throw new Error('sin par ' + key);
  const k = counts(p.c, p.a);
  return { p, ...k, names: namesOf(p.c, p.a, k.nc, k.na), forms: formulasOf(p.c, p.a, k.nc, k.na) };
}

describe('combinaciones de iones', () => {
  it('todas las sales quedan con carga total cero', () => {
    for (const { c, a } of pairs) {
      const { nc, na } = counts(c, a);
      expect(c.q * nc + a.q * na, `${c.sym}${a.sym}`).toBe(0);
    }
  });
  it('cada nivel tiene preguntas', () => {
    for (const lv of LEVEL_IDS) expect(poolFor(lv).length).toBeGreaterThan(20);
  });
  it('los nombres y las fórmulas canónicas se aceptan a sí mismos', () => {
    for (const { p, names, forms } of pairs.map(x => parts(x.key))) {
      for (const k of NOMENS) {
        expect(checkName(names[k][0], names, k), `${k} ${p.key}`).toBe('ok');
        expect(names[k].join(' ')).not.toMatch(/undefined|NaN/);
      }
      expect(checkFormula(forms[0], forms), p.key).toBe('ok');
    }
  });
});

describe('nombres de referencia', () => {
  it('Al₂(SO₄)₃', () => {
    const { names, forms } = parts('Al3|SO4');
    expect(forms[0]).toBe('Al2(SO4)3');
    expect(names.stock[0]).toBe('sulfato de aluminio');
    expect(names.sys[0]).toBe('tris(sulfato) de dialuminio');
    expect(names.trad[0]).toBe('sulfato de aluminio');
  });
  it('Fe₂O₃', () => {
    const { names } = parts('Fe3|O');
    expect(names.stock[0]).toBe('óxido de hierro(III)');
    expect(names.sys[0]).toBe('trióxido de dihierro');
    expect(names.trad[0]).toBe('óxido férrico');
  });
  it('ácidos y sales ácidas', () => {
    expect(parts('H1|SO4').names.trad[0]).toBe('ácido sulfúrico');
    expect(parts('H1|Cl').names.trad[0]).toBe('ácido clorhídrico');
    expect(parts('Na1|HCO3').names.trad).toContain('bicarbonato de sodio');
  });
});

describe('revisión de respuestas', () => {
  const { names, forms } = parts('Fe3|O');
  it('acepta variantes de escritura del número romano y tildes', () => {
    for (const s of ['Oxido de hierro III', 'óxido de hierro (iii)', 'OXIDO DE HIERRO(III)', '  óxido  de  hierro(III) ']) {
      expect(checkName(s, names, 'stock'), s).toBe('ok');
    }
  });
  it('avisa cuando el nombre es de otra nomenclatura', () => {
    expect(checkName('óxido férrico', names, 'stock')).toBe('other:trad');
  });
  it('acepta sistemática con o sin paréntesis en bis/tris', () => {
    const al = parts('Al3|SO4').names;
    expect(checkName('tris(sulfato) de dialuminio', al, 'sys')).toBe('ok');
    expect(checkName('trisulfato de dialuminio', al, 'sys')).toBe('ok');
  });
  it('fórmulas: subíndices Unicode, mayúsculas y errores', () => {
    const f = parts('Al3|SO4').forms;
    expect(checkFormula('Al₂(SO₄)₃', f)).toBe('ok');
    expect(checkFormula('al2(so4)3', f)).toBe('case');
    expect(checkFormula('Al2SO43', f)).toBe('bad');
    expect(forms[0]).toBe('Fe2O3');
  });
  it('normName ignora tildes y mayúsculas', () => {
    expect(normName('Óxido De Cobre (II)')).toBe('oxido de cobre(ii)');
  });
});

describe('puntaje', () => {
  it('suma base, rapidez y racha, y aplica el multiplicador del nivel', () => {
    expect(scoreOf({ level: 3, elapsed: 4, streak: 2, hints: 0, frac: 1 })).toEqual({ base: 100, speed: 38, streakB: 20, mult: 1.5, total: 237 });
  });
  it('las pistas restan y el puntaje parcial se divide', () => {
    expect(scoreOf({ level: 1, elapsed: 100, streak: 0, hints: 1, frac: 1 }).total).toBe(70);
    expect(scoreOf({ level: 1, elapsed: 100, streak: 0, hints: 0, frac: 0.5 }).total).toBe(50);
  });
});

describe('generador de preguntas', () => {
  it('las opciones tienen una sola correcta y cuatro distintas', () => {
    for (const p of pairs) {
      for (const type of ['f2n', 'n2f'] as const) {
        for (const nomen of NOMENS) {
          const q = genQuestion({ pool: [p, ...pairs.slice(0, 20)], types: [type], nomens: [nomen], mc: true }, []);
          const opts = q.options ?? [];
          expect(opts.length, `${q.key} ${type} ${nomen}`).toBe(4);
          expect(new Set(opts.map(o => o.key)).size).toBe(4);
          expect(opts.filter(o => o.ok).length).toBe(1);
          for (const o of opts.filter(x => !x.ok)) {
            if (type === 'f2n') expect(checkName(o.key, q.names, nomen)).not.toBe('ok');
            else expect(q.formulas).not.toContain(o.key);
          }
        }
      }
    }
  });
});
