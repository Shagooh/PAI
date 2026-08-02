# AGENTS.md

## Project
React 18 + Vite SPA ("crud-frontend") for managing users (usuarios) and decision tables (habilitaciones). UI text is Spanish; code identifiers mix English and Spanish. No backend in this repo — the API lives at `https://pai-be.vercel.app`. Bootstrap 5 is imported globally via `src/main.jsx`; styling is Bootstrap classes + inline `style` props.

## Commands
- `npm run dev` — Vite dev server on port 5173
- `npm run build` — production build (also the only sanity check; there are NO lint, typecheck, or test scripts)
- `npm run preview` — serve the built app
- Verify changes with `npm run build`.

## Backend / API
- Dev proxy in `vite.config.js`: `/api` → `https://pai-be.vercel.app` (so `/api/...` works in dev).
- In code, the base URL is `import.meta.env.VITE_API_URL || 'https://pai-be.vercel.app'` (see `src/App.jsx:6`).
- Endpoints used: `GET/POST /api/usuarios`, `GET /api/habilitaciones`, `PUT /api/usuarios/:rut`, and `GET /api/usuarios/preview?ids=&meta=&dimension=&objetivo=` (opened in a new tab).

## Gotchas
- Data is cached in `localStorage` under key `crud-app-cache-v1` with a 5-minute TTL (`src/App.jsx:10`). Users/edits you make may be masked by stale cache — force re-fetch with the "Refrescar" buttons, or clear localStorage. If you add a new cache consumer, reuse the same helpers (`readCache`/`writeCache`) and bump `CACHE_KEY`.
- RUTs are validated/formatted as `xx.xxx.xxx-x` (`^\d{1,2}\.\d{3}\.\d{3}-[\dKk]$`) in `UsuarioForm.jsx`; keep this format everywhere RUTs are inputs.
- `src/components/ItemForm.jsx` and `ItemList.jsx` are dead code from an old products CRUD — not imported anywhere. Don't wire them up or treat them as the pattern to follow; the live components are `UsuarioForm.jsx` and `UsuariosList.jsx`.
- `PCI/` is a standalone HTML prototype, unrelated to the React app. `dist/` is gitignored build output — don't edit it.
- `index.html` is the Vite entry (Spanish `lang`); root renders `<App/>` from `src/main.jsx` inside `React.StrictMode` (effects double-fire in dev).
