import { cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cliRoot = resolve(__dirname, '..');
const desktopDist = resolve(cliRoot, '..', 'desktop', 'dist');
const bundledDesktopDist = resolve(cliRoot, 'dist', 'desktop');

if (!existsSync(desktopDist)) {
  console.error(
    'Desktop build not found at packages/desktop/dist. Run the desktop build before bundling.'
  );
  process.exit(1);
}

rmSync(bundledDesktopDist, { recursive: true, force: true });
cpSync(desktopDist, bundledDesktopDist, { recursive: true });

console.log(`Bundled desktop build into ${bundledDesktopDist}`);
