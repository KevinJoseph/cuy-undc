# cuy-undc

Mascota de escritorio para estudiantes de Sistemas de la UNDC.

Web oficial: https://www.cuy-undc.net.pe

## Instalar

Sin instalación global:

```bash
npx cuy-undc
```

Instalación global:

```bash
npm install -g cuy-undc
cuy-undc
```

## Qué hace

`cuy-undc` lanza la app de escritorio de Cuy UNDC usando Electron.

## Requisitos

- Node.js 18 o superior
- Linux, macOS o Windows

## Notas

En Linux, el CLI arranca Electron con `--no-sandbox` cuando se ejecuta desde
`npx`, para evitar el problema de permisos de `chrome-sandbox` en directorios
temporales.

## Licencia

MIT
