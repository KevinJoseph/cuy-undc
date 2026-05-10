import { useEffect, useState } from 'react';
import type { UpdateStatus } from '../../shared/types';

/**
 * Suscribe el renderer al estado del updater del main process.
 * Devuelve estado + acciones para el botón de actualización.
 */
export function useUpdater(): {
  status: UpdateStatus;
  check: () => void;
  install: () => void;
} {
  const [status, setStatus] = useState<UpdateStatus>({ kind: 'idle' });

  useEffect(() => window.cuy.updater.onStatus(setStatus), []);

  return {
    status,
    check: () => void window.cuy.updater.check(),
    install: () => void window.cuy.updater.install()
  };
}
