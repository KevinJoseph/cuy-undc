import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cliRoot = resolve(__dirname, '..');
const desktopDist = resolve(cliRoot, '..', 'desktop', 'dist');
const bundledDesktopDist = resolve(cliRoot, 'dist', 'desktop');
const cliPackageJsonPath = resolve(cliRoot, 'package.json');

if (!existsSync(desktopDist)) {
  console.error(
    'Desktop build not found at packages/desktop/dist. Run the desktop build before bundling.'
  );
  process.exit(1);
}

rmSync(bundledDesktopDist, { recursive: true, force: true });
cpSync(desktopDist, bundledDesktopDist, { recursive: true });

const cliPkg = JSON.parse(readFileSync(cliPackageJsonPath, 'utf8'));
writeFileSync(
  resolve(bundledDesktopDist, 'version.json'),
  `${JSON.stringify({ version: cliPkg.version }, null, 2)}\n`
);

console.log(`Bundled desktop build into ${bundledDesktopDist}`);
