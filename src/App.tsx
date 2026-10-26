import { useState } from 'react';
import { Achievements } from './components/Achievements';
import { Backup } from './components/Backup';
import { Game } from './components/Game';
import { Home } from './components/Home';
import { IonTable } from './components/IonTable';
import { Results } from './components/Results';
import { Toasts } from './components/Toasts';
import { DEFAULT_CONFIG } from './constants';
import { useGame } from './hooks/useGame';
import { useProgress } from './hooks/useProgress';
import { useTheme } from './hooks/useTheme';
import { ACHIEVEMENTS, buildSnapshot, lsGet, lsSet, mergeData, parseSnapshot } from './lib';
import type { Config, LocalData } from './lib';

type View = 'home' | 'table' | 'ach' | 'backup';

function loadConfig(): Config {
  const saved = lsGet<Partial<Config>>('sn:cfg', {});
  const cfg = { ...DEFAULT_CONFIG, ...saved };
  if (!Array.isArray(cfg.types) || !cfg.types.length) cfg.types = DEFAULT_CONFIG.types;
  if (!Array.isArray(cfg.nomens) || !cfg.nomens.length) cfg.nomens = DEFAULT_CONFIG.nomens;
  return cfg;
}

export default function App() {
  const [cfg, setCfgState] = useState<Config>(loadConfig);
  const [view, setView] = useState<View>('home');
  const progress = useProgress();
  const game = useGame({ onAnswer: progress.onAnswer, onFinish: progress.onFinish });
  const { theme, setTheme } = useTheme();
  const { run } = game;

  const setCfg = (next: Config) => {
    setCfgState(next);
    lsSet('sn:cfg', next);
  };
  const go = (v: View) => {
    if (v === 'table') progress.markTable();
    setView(v);
    window.scrollTo({ top: 0 });
  };

  const localData = (): LocalData => ({ ...game.data(), ...progress.data() });
  const exportJson = (pretty: boolean) => {
    progress.markExport();
    return JSON.stringify(buildSnapshot(localData()), null, pretty ? 2 : undefined);
  };
  const importText = (text: string) => {
    const parsed = parseSnapshot(text);
    if (!parsed.ok) return parsed;
    const { data, report } = mergeData(localData(), parsed.snap);
    game.replaceData({ best: data.best, errs: data.errs });
    progress.replaceAll({ stats: data.stats, ach: data.ach, achOn: data.achOn });
    return { ok: true as const, report };
  };

  const done = ACHIEVEMENTS.filter(a => progress.unlocked[a.id]).length;
  const back = () => go('home');
  return (
    <div className="app">
      {!run && view === 'table' && <IonTable onBack={back} />}
      {!run && view === 'ach' && (
        <Achievements enabled={progress.enabled} onToggle={progress.setEnabled} unlocked={progress.unlocked} stats={progress.stats} onBack={back} />
      )}
      {!run && view === 'backup' && <Backup onExport={exportJson} onImport={importText} onBack={back} />}
      {!run && view === 'home' && (
        <Home
          cfg={cfg} onCfg={setCfg} best={game.best} errCount={game.errs.length} achLabel={progress.enabled ? `${done}/${ACHIEVEMENTS.length}` : ''}
          theme={theme} onTheme={setTheme}
          onStart={() => game.start(cfg, false)} onReview={() => game.start(cfg, true)} onNav={go}
        />
      )}
      {run && run.done && <Results run={run} onAgain={() => game.again(cfg)} onMenu={game.quit} />}
      {run && !run.done && (
        <Game run={run} onSubmit={game.submit} onNext={game.next} onHint={game.hint} onStep={game.setCount} onTick={game.tick} onQuit={game.quit} />
      )}
      <Toasts toasts={progress.toasts} onDismiss={progress.dismissToast} />
    </div>
  );
}
