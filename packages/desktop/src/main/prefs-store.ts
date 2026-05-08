import { app } from 'electron';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import type { UserPreferences } from '../shared/types';

/**
 * Persistencia simple de preferencias en JSON local dentro de userData.
 * Sin BD, sin backend — solo un archivo plano.
 */

const DEFAULTS: UserPreferences = {
  studentName: '',
  primaryColor: '#7c3aed'
};

function filePath(): string {
  return join(app.getPath('userData'), 'preferences.json');
}

export async function loadPrefs(): Promise<UserPreferences> {
  try {
    const raw = await fs.readFile(filePath(), 'utf-8');
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function savePrefs(next: Partial<UserPreferences>): Promise<UserPreferences> {
  const current = await loadPrefs();
  const merged: UserPreferences = { ...current, ...next };
  await fs.writeFile(filePath(), JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}
