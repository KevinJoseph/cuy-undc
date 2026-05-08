interface TopBarProps {
  /** Encoge la ventana al modo mini. */
  onCollapse: () => void;
}

/**
 * Barra superior: botón de colapsar (modo mini) + cerrar.
 * No usamos minimize/hide nativo: en GNOME una ventana frameless
 * ocultada queda inalcanzable. El modo mini la deja siempre visible.
 */
export function TopBar({ onCollapse }: TopBarProps): JSX.Element {
  const { window: w } = window.cuy;

  return (
    <div className="cuy-topbar">
      <button
        type="button"
        className="cuy-iconbtn"
        title="Modo mini"
        onClick={onCollapse}
      >
        −
      </button>
      <button
        type="button"
        className="cuy-iconbtn close"
        title="Cerrar"
        onClick={() => w.close()}
      >
        ×
      </button>
    </div>
  );
}
