import { useEffect } from 'react';

interface ToastProps {
  message: string;
  /** Cierra el toast. */
  onClose: () => void;
  /** Auto-cierre en ms. 0 = sin auto-cierre. */
  durationMs?: number;
}

/**
 * Mensajito flotante dentro de la tarjeta del cuy.
 * Click fuera o en el botón cierra. Auto-dismiss opcional.
 */
export function Toast({ message, onClose, durationMs = 3500 }: ToastProps): JSX.Element {
  useEffect(() => {
    if (durationMs <= 0) return;
    const id = setTimeout(onClose, durationMs);
    return () => clearTimeout(id);
  }, [durationMs, onClose]);

  return (
    <div className="cuy-toast-backdrop no-drag" onClick={onClose}>
      <div className="cuy-toast" onClick={(e) => e.stopPropagation()}>
        <div className="cuy-toast-emoji">🚧</div>
        <div className="cuy-toast-msg">{message}</div>
        <button type="button" className="cuy-toast-close" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}
