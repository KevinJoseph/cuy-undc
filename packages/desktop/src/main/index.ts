import { app, BrowserWindow, ipcMain, screen, shell } from 'electron';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadPrefs, savePrefs } from './prefs-store';
import { registerUpdater } from './updater';
import type { UserPreferences, WindowMode } from '../shared/types';

/**
 * Proceso principal de Electron.
 * - Crea ventana flotante, sin bordes, transparente y always-on-top.
 * - "Mini mode": la ventana se encoge a un botón con la mascota
 *   (en lugar de minimizar/ocultar, para evitar que GNOME la pierda).
 */

const isDev = process.env.NODE_ENV === 'development';

/** Tamaños por modo. La ventana se ajusta al contenido visible. */
const SIZES: Record<WindowMode, { width: number; height: number }> = {
  compact: { width: 300, height: 346 },
  expanded: { width: 300, height: 436 },
  mini: { width: 88, height: 88 }
};
const FULL_SIZE = SIZES.compact;
const MINI_SIZE = SIZES.mini;

let mainWindow: BrowserWindow | null = null;

async function resolveDisplayedVersion(): Promise<string> {
  const candidates = [
    join(__dirname, '../version.json'),
    join(__dirname, '../../../package.json'),
    join(__dirname, '../../../cli/package.json')
  ];

  for (const candidate of candidates) {
    try {
      const raw = await readFile(candidate, 'utf8');
      const parsed = JSON.parse(raw) as { version?: string };

      if (typeof parsed.version === 'string' && parsed.version.trim()) {
        return parsed.version.trim();
      }
    } catch {
      // Sigue con el siguiente candidato.
    }
  }

  return app.getVersion();
}

function createWindow(): void {
  const { workArea } = screen.getPrimaryDisplay();

  mainWindow = new BrowserWindow({
    width: FULL_SIZE.width,
    height: FULL_SIZE.height,
    x: workArea.x + workArea.width - FULL_SIZE.width - 24,
    y: workArea.y + workArea.height - FULL_SIZE.height - 24,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: false,
    hasShadow: false,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  if (isDev) {
    void mainWindow.loadURL('http://localhost:5173/');
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => mainWindow?.show());
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Recoloca la ventana a la esquina inferior derecha respetando el nuevo tamaño.
 * Evita que el botón mini quede fuera de pantalla al cambiar de tamaño.
 */
function repositionToCorner(width: number, height: number): void {
  if (!mainWindow) return;
  const { workArea } = screen.getPrimaryDisplay();
  mainWindow.setBounds({
    x: workArea.x + workArea.width - width - 24,
    y: workArea.y + workArea.height - height - 24,
    width,
    height
  });
}

function collapse(): void {
  if (!mainWindow) return;
  mainWindow.setResizable(true);
  repositionToCorner(MINI_SIZE.width, MINI_SIZE.height);
  mainWindow.setResizable(false);
}

function expand(): void {
  if (!mainWindow) return;
  mainWindow.setResizable(true);
  repositionToCorner(FULL_SIZE.width, FULL_SIZE.height);
  mainWindow.setResizable(false);
  mainWindow.focus();
}

function setMode(mode: WindowMode): void {
  if (!mainWindow) return;
  const size = SIZES[mode];
  mainWindow.setResizable(true);
  repositionToCorner(size.width, size.height);
  mainWindow.setResizable(false);
}

function registerIpc(): void {
  ipcMain.on('window:close', () => mainWindow?.close());
  ipcMain.on('window:collapse', () => collapse());
  ipcMain.on('window:expand', () => expand());
  ipcMain.on('window:set-mode', (_evt, mode: WindowMode) => setMode(mode));
  ipcMain.on('window:move', (_evt, dx: number, dy: number) => {
    if (!mainWindow) return;
    const pos = mainWindow.getPosition();
    const x = pos[0] ?? 0;
    const y = pos[1] ?? 0;
    mainWindow.setPosition(Math.round(x + dx), Math.round(y + dy));
  });

  ipcMain.handle('prefs:get', async () => loadPrefs());
  ipcMain.handle('prefs:set', async (_evt, patch: Partial<UserPreferences>) =>
    savePrefs(patch)
  );
  ipcMain.handle('app:get-version', async () => resolveDisplayedVersion());
  ipcMain.handle('app:open-external', (_evt, url: string) => shell.openExternal(url));
}

app.whenReady().then(() => {
  registerIpc();
  registerUpdater();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
