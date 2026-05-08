import { useCallback, useEffect, useState } from 'react';
import type { UserPreferences } from '../../shared/types';

/**
 * Hook que carga preferencias desde el main process y permite actualizarlas.
 * Mantiene la lógica IPC fuera de los componentes.
 */
export function usePrefs(): {
  prefs: UserPreferences | null;
  update: (patch: Partial<UserPreferences>) => Promise<void>;
} {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);

  useEffect(() => {
    let alive = true;
    void window.cuy.prefs.get().then((p) => {
      if (alive) setPrefs(p);
    });
    return () => {
      alive = false;
    };
  }, []);

  const update = useCallback(async (patch: Partial<UserPreferences>) => {
    const next = await window.cuy.prefs.set(patch);
    setPrefs(next);
  }, []);

  return { prefs, update };
}
