import { app, ipcMain, BrowserWindow } from 'electron';
import type { UpdateStatus } from '../shared/types';

/**
 * Auto-actualización vía electron-updater (GitHub Releases).
 * El usuario dispara la búsqueda con un botón en la UI.
 *
 * Limitación: solo funciona con instalador NSIS, no con la versión portable.
 * En desarrollo o cuando la app no está empaquetada, el updater se desactiva.
 */

let lastStatus: UpdateStatus = { kind: 'idle' };

function broadcast(status: UpdateStatus): void {
  lastStatus = status;
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send('updater:status', status);
  }
}

export function registerUpdater(): void {
  ipcMain.handle('updater:get-status', () => lastStatus);

  // En dev / npx no hay binario instalado — distinguimos el motivo para mensajes claros.
  if (!app.isPackaged) {
    const isDev = process.env.NODE_ENV === 'development';
    lastStatus = isDev
      ? {
          kind: 'unsupported',
          reason: 'dev',
          message: 'Modo desarrollo: la auto-actualización solo funciona en la app instalada de Windows.'
        }
      : {
          kind: 'unsupported',
          reason: 'npx',
          message: 'Estás usando npx. Para actualizar ejecuta:\nnpx cuy-undc@latest'
        };
    ipcMain.handle('updater:check', async () => {});
    ipcMain.handle('updater:install', async () => {});
    return;
  }

  // Carga perezosa: el módulo solo existe en producción dentro de app/node_modules.
  // La interfaz evita requerir electron-updater en tiempo de compilación de tsc.
  interface AutoUpdater {
    autoDownload: boolean;
    autoInstallOnAppQuit: boolean;
    on(event: 'checking-for-update', listener: () => void): this;
    on(event: 'update-available', listener: (info: { version: string }) => void): this;
    on(event: 'update-not-available', listener: () => void): this;
    on(event: 'download-progress', listener: (progress: { percent: number }) => void): this;
    on(event: 'update-downloaded', listener: (info: { version: string }) => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    checkForUpdates(): Promise<unknown>;
    quitAndInstall(): void;
  }
  let autoUpdater: AutoUpdater;
  try {
    ({ autoUpdater } = require('electron-updater'));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    ipcMain.handle('updater:check', async () => {
      broadcast({ kind: 'error', message: `electron-updater no disponible: ${message}` });
    });
    ipcMain.handle('updater:install', async () => {});
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => broadcast({ kind: 'checking' }));
  autoUpdater.on('update-available', (info) =>
    broadcast({ kind: 'available', version: info.version })
  );
  autoUpdater.on('update-not-available', () =>
    broadcast({ kind: 'not-available', currentVersion: app.getVersion() })
  );
  autoUpdater.on('download-progress', (progress) =>
    broadcast({ kind: 'downloading', percent: Math.round(progress.percent) })
  );
  autoUpdater.on('update-downloaded', (info) =>
    broadcast({ kind: 'downloaded', version: info.version })
  );
  autoUpdater.on('error', (err) =>
    broadcast({ kind: 'error', message: err?.message ?? 'Error desconocido' })
  );

  ipcMain.handle('updater:check', async () => {
    try {
      await autoUpdater.checkForUpdates();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      broadcast({ kind: 'error', message });
    }
  });

  ipcMain.handle('updater:install', async () => {
    autoUpdater.quitAndInstall();
  });
}
