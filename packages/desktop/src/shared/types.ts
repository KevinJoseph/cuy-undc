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

export interface CuyAPI {
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
