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

  // En dev no hay binario instalado — no podemos auto-actualizar.
  if (!app.isPackaged) {
    ipcMain.handle('updater:check', async () => {
      broadcast({
        kind: 'unsupported',
        message: 'Auto-actualización solo disponible en la app instalada.'
      });
    });
    ipcMain.handle('updater:install', async () => {});
    return;
  }

  // Carga perezosa: el módulo solo existe en producción dentro de app/node_modules.
  let autoUpdater: typeof import('electron-updater').autoUpdater;
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
