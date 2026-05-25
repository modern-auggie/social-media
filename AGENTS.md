# AGENTS.md

Guidance for agents working on Friends.

## Project Overview

Friends is a Next.js and Tailwind CSS social media web app prototype. It uses the Next App Router, local assets, hash-based in-app navigation, and a small platform adapter for browser services.

The user also wants the website built with a future desktop app in mind. Preserve the platform boundary in `src/platform.js` so a later Electron, Tauri, or native wrapper can swap browser APIs for desktop APIs without rewriting the UI.

## Run

```bash
node server.mjs
```

Open `http://127.0.0.1:4173`.

If `npm` is available, `npm run dev` starts the same Next dev server. If local server binding is blocked by sandboxing, request escalation for the server command.

## Important Files

- `app/page.js`: app shell, views, hash routing, UI state, and event handlers.
- `app/layout.js`: root layout, metadata, manifest, and viewport configuration.
- `app/globals.css`: Tailwind CSS entrypoint and global base styles.
- `server.mjs`: compatibility wrapper that starts Next dev on the expected host and port.
- `src/data.js`: prototype content for feed, stories, reels, messages, explore, live, profile, creator tools, shopping, collaboration, and safety.
- `src/platform.js`: platform adapter for storage and sharing. Keep desktop-specific concerns behind this boundary.
- `src/icons.js`: local React SVG icon registry.
- `public/assets/`: local app media and icon assets.
- `artifacts/`: verification screenshots.

## Development Notes

- Dependencies are intentionally limited to Next.js, React, Tailwind CSS, and their required CSS tooling unless the user asks for more or the benefit is clear.
- Keep code simple and module-local. Avoid introducing framework-like abstractions for this prototype.
- Do not use remote CDNs for app-critical assets; local/offline assets are part of the desktop-readiness goal.
- Use hash routes for new top-level views unless there is a good reason to change routing.
- Keep the first screen as the usable app experience, not a marketing landing page.
- Preserve responsive behavior for desktop and mobile. The mobile feature nav is intentionally in the page flow, not fixed over content.

## Verification

Run checks:

```bash
npm run build
```

The npm scripts force WASM fallbacks for Next SWC and Tailwind Oxide because macOS sandboxed runtimes can reject native `.node` binaries by code signature.
If `npm` is unavailable, run `NAPI_RS_FORCE_WASI=1 NEXT_TEST_WASM_DIR=node_modules/@next/swc-wasm-nodejs node node_modules/next/dist/bin/next build --webpack`.

For UI changes, verify in the browser:

- All 11 views load: `feed`, `stories`, `reels`, `messages`, `explore`, `live`, `profile`, `creator`, `shop`, `collab`, `safety`.
- No broken images.
- No horizontal overflow on desktop or a 390px mobile viewport.
- No console warnings or errors.
- Core interactions still work: carousel next/previous, story selection, DM thread selection, hashtag/search flow, like/save toggles.

## Current Design Intent

The UI should feel like a real social app dashboard: dense enough for repeated use, polished enough to demo, and broad enough to cover the requested Instagram-like feature set. Use restrained cards, clear controls, local media, and readable responsive layouts.
