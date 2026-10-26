import type { Toast } from '../hooks/useProgress';
import { Trophy } from './Trophy';

export function Toasts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map(t => (
        <button key={t.id} type="button" className="toast" onClick={() => onDismiss(t.id)} aria-label={`${t.title}. ${t.text}. Toca para cerrar.`}>
          <Trophy tier={t.tier ?? 'gold'} />
          <span className="ttext">
            <b>{t.title}</b>
            <small>{t.text}</small>
          </span>
        </button>
      ))}
    </div>
  );
}
