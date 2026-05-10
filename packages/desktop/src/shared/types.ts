/**
 * Tipos compartidos entre proceso main, preload y renderer.
 * Mantener este archivo libre de imports de Electron / React.
 */

export interface UserPreferences {
  /** Nombre del estudiante. */
  studentName: string;
  /** Color principal en formato CSS hex (#rrggbb). */
  primaryColor: string;
}

export const DEFAULT_PRIMARY_COLOR = '#f59e0b';
export const LEGACY_PRIMARY_COLOR = '#7c3aed';

export interface DailyBadge {
  /** Fecha ISO (YYYY-MM-DD) a la que aplica la insignia. */
  date: string;
  /** Emoji o ícono corto. */
  icon: string;
  /** Etiqueta corta de la insignia. */
  label: string;
}

/**
 * API expuesta desde el preload al renderer vía contextBridge.
 * Toda comunicación con el sistema (ventana, archivos) pasa por aquí.
 */
export type WindowMode = 'compact' | 'expanded' | 'mini';

export type UpdateStatus =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'not-available'; currentVersion: string }
  | { kind: 'available'; version: string }
  | { kind: 'downloading'; percent: number }
  | { kind: 'downloaded'; version: string }
  | { kind: 'error'; message: string }
  | { kind: 'unsupported'; message: string };

export interface CuyAPI {
  app: {
    /** Devuelve la versión visible para el usuario final. */
    getVersion: () => Promise<string>;
  };
  updater: {
    /** Inicia búsqueda de nueva versión publicada. */
    check: () => Promise<void>;
    /** Reinicia la app e instala la versión descargada. */
    install: () => Promise<void>;
    /** Suscribe a cambios de estado del updater. Devuelve función para desuscribir. */
    onStatus: (cb: (status: UpdateStatus) => void) => () => void;
  };
  window: {
    close: () => void;
    /** Encoge la ventana a un botón flotante con la mascota. */
    collapse: () => void;
    /** Restaura el tamaño completo de la ventana. */
    expand: () => void;
    /** Cambia entre tamaños predefinidos según el contenido visible. */
    setMode: (mode: WindowMode) => void;
    /** Mueve la ventana en pantalla por un delta (px). */
    move: (dx: number, dy: number) => void;
  };
  prefs: {
    get: () => Promise<UserPreferences>;
    set: (next: Partial<UserPreferences>) => Promise<UserPreferences>;
  };
}

declare global {
  interface Window {
    cuy: CuyAPI;
  }
}
