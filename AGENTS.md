# AGENTS.md

## Project
React 18 + Vite SPA ("crud-frontend") for managing users (usuarios) and decision tables (habilitaciones). UI text is Spanish; code identifiers mix English and Spanish. No backend in this repo — the API lives at `https://pai-be.vercel.app`. Styling is Tailwind CSS utility classes plus a small component layer defined in `src/index.css`.

## Commands
- `npm run dev` — Vite dev server on port 5173
- `npm run build` — production build (also the only sanity check; there are NO lint, typecheck, or test scripts)
- `npm run preview` — serve the built app
- **Always verify changes with `npm run build` before finishing.**

## Architecture
All application state lives in `App` (`src/App.jsx`); child components are mostly presentational and receive data and callbacks as props. Two views toggled by `view` state:
- `'buscar'` — user search, multi-select, and inline edit (`EditarUsuarioCard`)
- `'tablas'` — decision table builder (dimensions/objectives from JSON assets, Word export)

**Component map:**
- `UsuarioFormFields` — shared field layout used by both `UsuarioForm` (create) and `EditarUsuarioCard` (edit)
- `UsuariosList` — read-only table; calls `onEdit` and `onRefresh` props
- `EditarUsuarioCard` — wraps `UsuarioFormFields` for editing; hidden when `editingUser` is null
- `Dropdown` — custom portal-style dropdown defined inline in `App.jsx` (not a separate file)

**Static data assets** (`src/assets/`):
- `lista-dimensiones-objetivos.json` — dimension groups and their objectives
- `decisiones-dimension.json` — decision rules keyed by dimension → objective; pre-computed into lookup maps at module load time in `App.jsx`

## Backend / API
- Dev proxy in `vite.config.js`: `/api` → `https://pai-be.vercel.app` (so `/api/...` works in dev).
- Base URL: `import.meta.env.VITE_API_URL || 'https://pai-be.vercel.app'` — built via `buildApiUrl()` in `App.jsx`.
- Endpoints used:
  - `GET /api/usuarios` — list all users
  - `POST /api/usuarios` — create user
  - `PUT /api/usuarios/:rut` — update user
  - `GET /api/habilitaciones` — list habilitaciones
  - `GET /api/usuarios/preview?ids=&meta=&dimension=&objetivo=` — opened in a new tab
  - `GET /api/usuarios/word` (or `VITE_WORD_EXPORT_PATH`) — Word document download (blob response)

## Key Utilities (`src/utils/userUtils.js`)
- `EMPTY_USER_FORM` / `RUT_REGEX` — canonical empty state and RUT pattern
- `formatDateForDisplay(value, { shortYear })` — ISO `yyyy-mm-dd` → `dd/mm/yyyy`
- `formatDateForInput(value)` — auto-formats digits as `dd/mm/yyyy` while typing
- `formatRut(value)` — formats raw digits to `xx.xxx.xxx-x`
- `sanitizePersonName(value)` — used on nombre/apellido fields in `UsuarioForm`
- `normalizeText(value)` (in `App.jsx`) — strips accents + lowercases for accent-insensitive search/matching

## Gotchas
- Data is cached in `localStorage` under key `crud-app-cache-v1` with a 5-minute TTL. Users/edits may be masked by stale cache — use "Refrescar" buttons or clear localStorage. New cache consumers must reuse `readCache`/`writeCache` and bump `CACHE_KEY`.
- RUTs are validated/formatted as `xx.xxx.xxx-x` (`^\d{1,2}\.\d{3}\.\d{3}-[\dKk]$`). Keep this format everywhere RUTs appear as inputs.
- Dates: the API returns ISO `yyyy-mm-dd`; the UI displays `dd/mm/yyyy` (via `formatDateForDisplay`); the edit form stores `dd/mm/yyyy` via `formatDateForInput`.
- `src/components/ItemForm.jsx` and `ItemList.jsx` are dead code from an old products CRUD — not imported anywhere. Do not use them as patterns.
- `PCI/` is a standalone HTML prototype, unrelated to the React app. `dist/` is gitignored build output — don't edit it.
- `index.html` is the Vite entry (Spanish `lang`); root renders `<App/>` from `src/main.jsx` inside `React.StrictMode` (effects double-fire in dev).
- The `Dropdown` component uses `position: fixed` with coordinates from `getBoundingClientRect()` to escape overflow-hidden containers — keep this when modifying it.
