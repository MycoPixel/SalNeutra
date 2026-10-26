import type { Tier } from '../lib';

/** Copa con el color del nivel (bronce, plata, oro, platino); gris si aún no se desbloquea */
export function Trophy({ tier, locked = false }: { tier: Tier; locked?: boolean }) {
  return (
    <span className={`trophy ${locked ? 'locked' : tier}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 4h10v5a5 5 0 0 1-10 0z" fill="currentColor" fillOpacity="0.25" />
        <path d="M7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5" />
        <path d="M12 14v3.5M9.5 17.5h5v3h-5z" />
      </svg>
    </span>
  );
}
