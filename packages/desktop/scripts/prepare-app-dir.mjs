import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const desktopRoot = resolve(__dirname, '..');
const repoRoot = resolve(desktopRoot, '..', '..');
const distDir = resolve(desktopRoot, 'dist');
const appDir = resolve(desktopRoot, 'app');
const packageJsonPath = resolve(desktopRoot, 'package.json');
const cliPackageJsonPath = resolve(repoRoot, 'packages', 'cli', 'package.json');

if (!existsSync(distDir)) {
  console.error('Desktop build not found at packages/desktop/dist. Run the build first.');
  process.exit(1);
}

const pkg = JSON.parse(await readFile(packageJsonPath, 'utf8'));
const cliPkg = existsSync(cliPackageJsonPath)
  ? JSON.parse(await readFile(cliPackageJsonPath, 'utf8'))
  : null;
const displayVersion = cliPkg?.version ?? pkg.version;

rmSync(appDir, { recursive: true, force: true });
mkdirSync(appDir, { recursive: true });
cpSync(distDir, resolve(appDir, 'dist'), { recursive: true });
writeFileSync(
  resolve(appDir, 'dist', 'version.json'),
  `${JSON.stringify({ version: displayVersion }, null, 2)}\n`
);

const appPackageJson = {
  name: pkg.name,
  version: pkg.version,
  description: pkg.description,
  main: 'dist/main/index.js',
  author: pkg.author,
  license: pkg.license
};

writeFileSync(resolve(appDir, 'package.json'), `${JSON.stringify(appPackageJson, null, 2)}\n`);

console.log(`Prepared standalone app directory at ${appDir}`);
