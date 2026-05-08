import { contextBridge, ipcRenderer } from 'electron';
import type { CuyAPI, UserPreferences, WindowMode } from '../shared/types';

/**
 * Puente seguro entre renderer y main.
 * El renderer NO tiene acceso directo a Node — solo a este API.
 */
const api: CuyAPI = {
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
  }
};

contextBridge.exposeInMainWorld('cuy', api);
