import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

interface MiniCuyProps {
  /** Color principal — se usa como halo del botón. */
  primary: string;
  /** Click → expandir a la tarjeta completa. */
  onExpand: () => void;
}

/** Umbral en píxeles antes de considerar que el usuario está arrastrando. */
const DRAG_THRESHOLD = 4;

/**
 * Modo compacto: botón circular con la mascota.
 * Soporta dos gestos:
 *   - Click puro (sin desplazamiento) → `onExpand`.
 *   - Arrastrar → mueve la ventana de Electron vía IPC `window.move(dx, dy)`.
 *
 * Implementamos drag manual (no `-webkit-app-region: drag`) para poder
 * distinguir de forma fiable click vs drag en el mismo elemento.
 */
export function MiniCuy({ primary, onExpand }: MiniCuyProps): JSX.Element {
  const [broken, setBroken] = useState(false);

  /** Estado de la sesión de drag activa (null = no hay puntero abajo). */
  const drag = useRef<{
    lastX: number;
    lastY: number;
    moved: boolean;
  } | null>(null);

  const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>): void => {
    drag.current = { lastX: e.screenX, lastY: e.screenY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>): void => {
    const d = drag.current;
    if (!d) return;
    const dx = e.screenX - d.lastX;
    const dy = e.screenY - d.lastY;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    d.moved = true;
    d.lastX = e.screenX;
    d.lastY = e.screenY;
    window.cuy.window.move(dx, dy);
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLButtonElement>): void => {
    const wasDrag = drag.current?.moved ?? false;
    drag.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (!wasDrag) onExpand();
  };

  const handlePointerCancel = (): void => {
    drag.current = null;
  };

  return (
    <button
      type="button"
      className="cuy-mini no-drag"
      style={{ ['--cuy-primary' as string]: primary }}
      title="Click: expandir · Arrastrar: mover"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {broken ? (
        <span className="cuy-mini-emoji">🐹</span>
      ) : (
        <img
          src="./mascot.png"
          alt="Cuy UNDC"
          className="cuy-mini-img"
          onError={() => setBroken(true)}
          draggable={false}
        />
      )}
    </button>
  );
}
