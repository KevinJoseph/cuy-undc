# 🐹 Cuy UNDC

Mascota de escritorio para estudiantes de **Sistemas — Universidad Nacional de Cañete (UNDC)**.

Una ventanita flotante, transparente y siempre visible que te acompaña mientras programas, te tira frases random y te muestra tu insignia del día.

> MVP. Todo local. Sin backend. Sin base de datos. Solo un cuy en tu pantalla.

Web oficial: https://www.cuy-undc.net.pe

---

## ✨ Features V1

- Ventana flotante, sin bordes, transparente, **always-on-top**.
- Mascota inicial con emoji 🐹 (placeholder para sprite/imagen futura).
- Saludo personalizado: *"Hola {tu_nombre}, soy Cuy UNDC 🐹"*.
- Frases aleatorias para estudiantes de Sistemas (clic en la frase o el cuy = nueva frase).
- Botones para **ocultar** y **cerrar** la ventana.
- Personalización local:
  - Nombre del estudiante.
  - Color principal (acento de la tarjeta).
- Insignia del día (rotativa, determinista por fecha).
- Persistencia en JSON local dentro del directorio `userData` de Electron.

---

## 📦 Estructura del proyecto

```
cuy-undc/
├── package.json          # workspaces + scripts root
├── tsconfig.base.json
├── packages/
│   ├── cli/              # Comando `cuy-undc` (commander.js)
│   │   ├── src/index.ts
│   │   └── package.json
│   └── desktop/          # App Electron + React + TS
│       ├── src/
│       │   ├── main/         # Proceso main (ventana, IPC, prefs JSON)
│       │   ├── preload/      # contextBridge → window.cuy
│       │   ├── renderer/     # React UI
│       │   │   ├── components/   # App, Mascot, TopBar, Settings
│       │   │   ├── hooks/        # usePrefs
│       │   │   ├── main.tsx
│       │   │   └── styles.css
│       │   └── shared/       # types, frases, badges
│       ├── vite.config.ts
│       └── package.json
└── README.md
```

Separación de responsabilidades:
- `shared/` → tipos y datos puros (sin Electron, sin React).
- `main/` → ciclo de vida de la app, IPC, IO de archivos.
- `preload/` → único punto de cruce main↔renderer (`window.cuy`).
- `renderer/` → solo UI; lógica de datos en `hooks/` y `shared/`.

---

## 🚀 Instalación

Requiere **Node.js ≥ 18** y **npm ≥ 9** (workspaces).

```bash
git clone <repo> cuy-undc
cd cuy-undc
npm install
```

## ▶️ Ejecución

### Modo desarrollo (hot-reload del renderer)

```bash
npm run dev
```

Vite levanta el renderer en `http://localhost:5173` y Electron lo carga apenas el server responde.

### Build de producción

```bash
npm run build
```

Compila el renderer (Vite), el main/preload (tsc) y el CLI.

### Generar instalador `.exe` para Windows

La app de escritorio usa `electron-builder` para empaquetarse.

Desde la raíz del repo:

```bash
npm run dist:win
```

O desde `packages/desktop`:

```bash
npm run dist:win
```

Los archivos de salida quedan en:

```bash
packages/desktop/release/
```

Ahí se generará un instalador NSIS (`.exe`) y una variante portable (`.exe`).

Nota: para builds de Windows, lo más simple y estable es correr ese comando en
Windows. La documentación oficial de `electron-builder` también indica que
puedes generar binarios de Windows desde Linux usando Wine o el contenedor
`electronuserland/builder:wine`.

### Lanzar vía CLI (después del build)

```bash
npm run cli
# o, dentro de packages/cli después de `npm link`:
cuy-undc
# o en el futuro publicado en npm:
npx cuy-undc
```

### Instalar desde npm

Cuando publiques `cuy-undc` en npm, el paquete ya incluirá el build de Electron.

```bash
npm install -g cuy-undc
cuy-undc
```

También funcionará sin instalación global:

```bash
npx cuy-undc
```

En Linux, el CLI arranca Electron con `--no-sandbox` para evitar el error de
`chrome-sandbox` cuando se ejecuta desde el directorio temporal que usa `npx`.

Para verificar localmente el paquete antes de publicarlo:

```bash
npm pack --workspace=packages/cli
```

Salida esperada en consola:

```
🐹 Cuy UNDC está despertando...
```

…y la ventanita aparece en la esquina inferior derecha de tu pantalla.

---

## 🎛️ Personalización

Clic en el botón **"Personalizar"** dentro de la mascota:
- Cambia tu nombre (se refleja en el saludo).
- Cambia el color principal (afecta el borde y la insignia).

Las preferencias se guardan en:

- **Linux**: `~/.config/Cuy UNDC/preferences.json`
- **macOS**: `~/Library/Application Support/Cuy UNDC/preferences.json`
- **Windows**: `%APPDATA%\Cuy UNDC\preferences.json`

---

## 🛠️ Scripts útiles

| Script | Descripción |
|---|---|
| `npm run dev` | Renderer Vite + Electron en modo dev |
| `npm run build` | Build completo (desktop + CLI) |
| `npm run start` | Lanza el CLI (requiere build previo) |
| `npm run cli` | Alias de `start` |
| `npm run clean` | Borra `dist/` y `node_modules` |

---

## 🧭 Próximos pasos sugeridos

- 🎨 Reemplazar emoji por sprite animado (Lottie / PNG / SVG).
- 📝 Sistema de notas locales con tags y fecha (JSON).
- ⏰ Recordatorios y notificaciones nativas.
- 🎯 Pomodoro integrado en la mascota.
- 🌐 Modo offline-first con sincronización opcional.
- 📦 Empaquetado con `electron-builder` (.AppImage, .dmg, .exe).
- 🧪 Tests unitarios en `shared/` con Vitest.
- 🌙 Modo oscuro automático.
- 🎓 Insignias por logros (commits, tareas, días seguidos).

---

## 📄 Licencia

MIT — hecho con 🐹 para los estudiantes de Sistemas de la UNDC.
