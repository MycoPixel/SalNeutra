import type { Config, Option, Pair, Question, QType } from './types';
import { counts } from './ions';
import { ALL_PAIRS } from './levels';
import { formulasOf, namesOf } from './naming';
import { normName } from './check';
import { pick, shuffle } from './math';

/** Opciones de selección múltiple (una correcta y tres distractores plausibles) */
export function makeOptions(q: Question, pool: Pair[]): Option[] {
  const { c, a, nc, na } = q;
  const same = (p: Pair) => p.c === c && p.a === a;
  const share = pool.filter(p => !same(p) && (p.c === c || p.a === a));
  const others = pool.filter(p => !same(p));
  const ordered = shuffle(share).concat(shuffle(others));
  const cands: string[] = [];
  let correct: string;
  let isBad: (s: string) => boolean;

  if (q.type === 'f2n') {
    const nomen = q.nomen as NonNullable<Question['nomen']>;
    const bad = new Set(Object.values(q.names).flat().map(normName));
    if (nomen === 'sys' && nc !== na) cands.push(namesOf(c, a, na, nc).sys[0]);
    for (const p of ordered) {
      const k = counts(p.c, p.a);
      cands.push(namesOf(p.c, p.a, k.nc, k.na)[nomen][0]);
    }
    correct = q.names[nomen][0];
    isBad = s => bad.has(normName(s));
  } else {
    const bad = new Set(q.formulas);
    cands.push(nc !== na ? formulasOf(c, a, na, nc)[0] : formulasOf(c, a, nc * 2, na * 2)[0]);
    for (const p of ordered) {
      const k = counts(p.c, p.a);
      cands.push(formulasOf(p.c, p.a, k.nc, k.na)[0]);
    }
    correct = q.formulas[0];
    isBad = s => bad.has(s);
  }

  const seen = new Set<string>();
  const picked: string[] = [];
  for (const s of cands) {
    const k = q.type === 'f2n' ? normName(s) : s;
    if (isBad(s) || seen.has(k)) continue;
    seen.add(k);
    picked.push(s);
    if (picked.length === 3) break;
  }
  return shuffle([{ key: correct, ok: true }, ...picked.map(key => ({ key, ok: false }))]);
}

type QuestionConfig = Pick<Config, 'nomens' | 'types' | 'mc'> & { pool: Pair[] };

export function genQuestion({ pool, types, nomens, mc }: QuestionConfig, recent: string[]): Question {
  let p = pick(pool);
  for (let i = 0; i < 25 && recent.includes(p.key); i++) p = pick(pool);
  const { c, a } = p;
  const { L, nc, na } = counts(c, a);
  const type: QType = pick(types);
  const nomen = type === 'ions' ? null : pick(nomens);
  const q: Question = { type, nomen, c, a, nc, na, L, level: p.level, key: p.key, names: namesOf(c, a, nc, na), formulas: formulasOf(c, a, nc, na) };
  if (mc && type !== 'ions') q.options = makeOptions(q, pool.length > 6 ? pool : [...ALL_PAIRS.values()]);
  return q;
}
