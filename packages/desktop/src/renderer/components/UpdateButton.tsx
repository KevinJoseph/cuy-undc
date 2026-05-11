import { useState } from 'react';
import { useUpdater } from '../hooks/useUpdater';
import { Toast } from './Toast';
import type { UpdateStatus } from '../../shared/types';

/**
 * Indicador minimalista de actualización en la esquina abajo-derecha.
 * Click = buscar / instalar / explicar según el estado actual.
 */
export function UpdateButton(): JSX.Element | null {
  const { status, check, install } = useUpdater();
  const [showInfo, setShowInfo] = useState(false);

  const view = describe(status, check, install, () => setShowInfo(true));
  if (!view) return null;

  return (
    <>
      <button
        type="button"
        className={`cuy-update-pill no-drag cuy-update-${status.kind}`}
        onClick={view.action}
        disabled={view.disabled}
        title={view.title}
        aria-label={view.title}
      >
        <span className="cuy-update-led" />
        <span className="cuy-update-label">{view.label}</span>
      </button>
      {showInfo && status.kind === 'unsupported' && (
        <Toast
          message={status.message}
          durationMs={0}
          onClose={() => setShowInfo(false)}
        />
      )}
    </>
  );
}

interface View {
  label: string;
  title: string;
  action: () => void;
  disabled: boolean;
}

function describe(
  status: UpdateStatus,
  check: () => void,
  install: () => void,
  showInfo: () => void
): View | null {
  switch (status.kind) {
    case 'idle':
      return { label: 'Actualizar', title: 'Buscar actualización', action: check, disabled: false };
    case 'checking':
      return { label: 'Buscando...', title: 'Buscando actualización', action: () => {}, disabled: true };
    case 'not-available':
      return {
        label: 'Actualizado',
        title: `Estás en la última versión (${status.currentVersion})`,
        action: check,
        disabled: false
      };
    case 'available':
      return {
        label: 'Descargando',
        title: `Descargando ${status.version}...`,
        action: () => {},
        disabled: true
      };
    case 'downloading':
      return {
        label: `Descargando ${status.percent}%`,
        title: `Descargando ${status.percent}%`,
        action: () => {},
        disabled: true
      };
    case 'downloaded':
      return {
        label: 'Reiniciar',
        title: `Versión ${status.version} lista. Click para reiniciar e instalar.`,
        action: install,
        disabled: false
      };
    case 'error':
      return { label: 'Reintentar', title: `Error: ${status.message}`, action: check, disabled: false };
    case 'unsupported':
      return {
        label: 'Actualizar',
        title: 'Cómo actualizar',
        action: showInfo,
        disabled: false
      };
  }
}
