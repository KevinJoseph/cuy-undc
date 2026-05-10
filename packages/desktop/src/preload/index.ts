import { contextBridge, ipcRenderer } from 'electron';
import type { CuyAPI, UpdateStatus, UserPreferences, WindowMode } from '../shared/types';

/**
 * Puente seguro entre renderer y main.
 * El renderer NO tiene acceso directo a Node — solo a este API.
 */
const api: CuyAPI = {
  app: {
    getVersion: () => ipcRenderer.invoke('app:get-version') as Promise<string>
  },
  window: {
    close: () => ipcRenderer.send('window:close'),
    collapse: () => ipcRenderer.send('window:collapse'),
    expand: () => ipcRenderer.send('window:expand'),
    setMode: (mode: WindowMode) => ipcRenderer.send('window:set-mode', mode),
    move: (dx: number, dy: number) => ipcRenderer.send('window:move', dx, dy)
  },
  prefs: {
    get: () => ipcRenderer.invoke('prefs:get') as Promise<UserPreferences>,
    set: (next: Partial<UserPreferences>) =>
      ipcRenderer.invoke('prefs:set', next) as Promise<UserPreferences>
  },
  updater: {
    check: () => ipcRenderer.invoke('updater:check') as Promise<void>,
    install: () => ipcRenderer.invoke('updater:install') as Promise<void>,
    onStatus: (cb: (status: UpdateStatus) => void) => {
      const listener = (_evt: unknown, status: UpdateStatus): void => cb(status);
      ipcRenderer.on('updater:status', listener);
      void (ipcRenderer.invoke('updater:get-status') as Promise<UpdateStatus>).then(cb);
      return () => {
        ipcRenderer.removeListener('updater:status', listener);
      };
    }
  }
};

contextBridge.exposeInMainWorld('cuy', api);
