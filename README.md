# Friends

A social media web app prototype rebuilt with Next.js, React, Tailwind CSS, local assets, hash-based app navigation, and a small platform adapter for future desktop wrappers.

## Run

```bash
node server.mjs
```

Then open `http://127.0.0.1:4173`.

If `npm` is available on your PATH, `npm run dev` starts the same Next dev server. If `4173` is occupied, pass another port with `PORT=4174 node server.mjs`.

## Verify

```bash
npm run build
```

This project uses WASM fallbacks for Next SWC and Tailwind Oxide in local scripts because native `.node` binaries can be rejected by macOS code signing in sandboxed environments.

Without `npm` on PATH, the equivalent build command is:

```bash
NAPI_RS_FORCE_WASI=1 NEXT_TEST_WASM_DIR=node_modules/@next/swc-wasm-nodejs node node_modules/next/dist/bin/next build --webpack
```

## Structure

- `app/page.js` owns the interactive app shell, views, and UI state.
- `app/layout.js` defines metadata, PWA links, and the root layout.
- `app/globals.css` loads Tailwind CSS and global base styles.
- `src/data.js` contains prototype content for posts, stories, reels, DMs, explore, shopping, and safety tools.
- `src/platform.js` isolates browser services such as storage and sharing so Electron, Tauri, or another desktop wrapper can replace them later.
- `src/icons.js` keeps the local React SVG icon system in one place.
- `public/assets/` stores local media, so the app does not depend on remote image hosts.

## Desktop App Prep

The web app uses hash routes, local media, and a platform adapter layer. A future desktop app can keep the same UI modules and swap `src/platform.js` for native window, storage, notification, file, and share integrations.
