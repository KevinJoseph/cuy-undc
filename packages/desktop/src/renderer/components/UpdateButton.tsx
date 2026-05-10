import { useUpdater } from '../hooks/useUpdater';
import type { UpdateStatus } from '../../shared/types';

/**
 * Botón "Buscar actualización" + estado del updater.
 * En la versión instalada (NSIS), descarga e instala desde GitHub Releases.
 */
export function UpdateButton(): JSX.Element {
  const { status, check, install } = useUpdater();
  const { label, action, hint, disabled } = describe(status, check, install);

  return (
    <div className="cuy-updater no-drag">
      <button
        type="button"
        className="cuy-update-btn"
        onClick={action}
        disabled={disabled}
      >
        {label}
      </button>
      {hint && <span className="cuy-update-hint">{hint}</span>}
    </div>
  );
}

function describe(
  status: UpdateStatus,
  check: () => void,
  install: () => void
): { label: string; action: () => void; hint?: string; disabled: boolean } {
  switch (status.kind) {
    case 'idle':
      return { label: 'Buscar actualización', action: check, disabled: false };
    case 'checking':
      return { label: 'Buscando...', action: () => {}, disabled: true };
    case 'not-available':
      return {
        label: 'Buscar actualización',
        action: check,
        hint: `Estás en la última versión (${status.currentVersion}).`,
        disabled: false
      };
    case 'available':
      return {
        label: 'Descargando...',
        action: () => {},
        hint: `Nueva versión ${status.version} disponible.`,
        disabled: true
      };
    case 'downloading':
      return {
        label: `Descargando ${status.percent}%`,
        action: () => {},
        disabled: true
      };
    case 'downloaded':
      return {
        label: 'Reiniciar e instalar',
        action: install,
        hint: `Versión ${status.version} lista.`,
        disabled: false
      };
    case 'error':
      return {
        label: 'Reintentar',
        action: check,
        hint: `Error: ${status.message}`,
        disabled: false
      };
    case 'unsupported':
      return {
        label: 'No disponible',
        action: () => {},
        hint: status.message,
        disabled: true
      };
  }
}
