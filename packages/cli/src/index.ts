#!/usr/bin/env node
import { Command } from 'commander';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';

/**
 * CLI principal de Cuy UNDC.
 *
 * Comando: `cuy-undc` (también vía `npx cuy-undc`).
 * Lanza el proceso Electron del paquete @cuy-undc/desktop.
 */

const program = new Command();

program
  .name('cuy-undc')
  .description('🐹 Mascota de escritorio para estudiantes de Sistemas UNDC')
  .version('0.1.0');

program
  .command('start', { isDefault: true })
  .description('Despierta a Cuy UNDC en el escritorio')
  .action(() => {
    console.log('🐹 Cuy UNDC está despertando...');
    launchElectron();
  });

program.parse(process.argv);

/**
 * Encuentra el binario de Electron y el entry point del paquete desktop,
 * y arranca la app como proceso hijo.
 */
function launchElectron(): void {
  const electronBin = resolveElectronBinary();
  const desktopEntry = resolveDesktopEntry();

  if (!electronBin) {
    console.error('❌ No se encontró Electron. Ejecuta `npm install` en la raíz del proyecto.');
    process.exit(1);
  }
  if (!desktopEntry) {
    console.error('❌ No se encontró el build de @cuy-undc/desktop. Ejecuta `npm run build` primero.');
    process.exit(1);
  }

  const electronArgs = [desktopEntry, ...resolveElectronArgs()];

  const child = spawn(electronBin, electronArgs, {
    stdio: 'inherit',
    detached: false
  });

  child.on('exit', (code) => process.exit(code ?? 0));
  child.on('error', (err) => {
    console.error('❌ Error al lanzar Electron:', err.message);
    process.exit(1);
  });
}

function resolveElectronArgs(): string[] {
  // `npx` instala el paquete en un directorio temporal dentro de ~/.npm.
  // En Linux, el helper chrome-sandbox de Electron no conserva ahí el bit SUID,
  // así que el arranque falla salvo que desactivemos ese sandbox explícitamente.
  if (process.platform === 'linux') {
    return ['--no-sandbox'];
  }

  return [];
}

/** Localiza el ejecutable de Electron buscando hacia arriba desde este archivo. */
function resolveElectronBinary(): string | null {
  try {
    // Resuelve el package "electron" cuyo `main` apunta al binario.
    const electronModule = require.resolve('electron');
    // electron exporta la ruta del binario por defecto.
    const electron = require('electron') as unknown as string;
    if (typeof electron === 'string' && existsSync(electron)) return electron;
    return electronModule;
  } catch {
    return null;
  }
}

/**
 * Busca el entry compilado del paquete desktop:
 * 1) como dependencia instalada (@cuy-undc/desktop)
 * 2) como hermano dentro del monorepo (../desktop/dist/main/index.js)
 */
function resolveDesktopEntry(): string | null {
  const bundled = resolve(__dirname, 'desktop', 'main', 'index.js');
  if (existsSync(bundled)) return bundled;

  try {
    return require.resolve('@cuy-undc/desktop');
  } catch {
    // Fallback: monorepo local.
    const local = resolve(dirname(__dirname), '..', 'desktop', 'dist', 'main', 'index.js');
    if (existsSync(local)) return local;

    const sibling = resolve(__dirname, '..', '..', 'desktop', 'dist', 'main', 'index.js');
    if (existsSync(sibling)) return sibling;

    const cwd = join(process.cwd(), 'packages', 'desktop', 'dist', 'main', 'index.js');
    if (existsSync(cwd)) return cwd;

    return null;
  }
}
