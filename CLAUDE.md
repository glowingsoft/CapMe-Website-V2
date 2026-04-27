# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev          # Start dev server on port 3030
yarn build        # Production build
yarn lint         # ESLint check
yarn lint:fix     # ESLint auto-fix
yarn fm:check     # Prettier check
yarn fm:fix       # Prettier auto-fix
yarn dev:host     # Dev server exposed on LAN
```

To scaffold a new RTK Query API module:
```bash
node generate-rtk.mjs <moduleName>   # e.g. node generate-rtk.mjs products
```

## Architecture

### Path Alias
`src/` is aliased to `src/` — always import as `src/foo/bar`, never with relative `../../` paths.

### Routing
Routes are split by area in `src/routes/sections/`:
- `index.jsx` — root router, composes all sub-routers; `/` redirects to JWT sign-in by default
- `auth.jsx`, `dashboard.jsx`, `admin-dashboard.jsx`, `main.jsx`, `components.jsx` — area-specific route trees
- All path constants live in `src/routes/paths.js` under `paths.*`

### Auth
Auth method is set in `src/config-global.js` → `CONFIG.auth.method`. Supported values: `jwt | amplify | firebase | supabase | auth0`. The `App` component dynamically picks the matching `AuthProvider` from `src/auth/context/<method>/`. Guards (`AuthGuard`, `GuestGuard`, `RoleBasedGuard`) live in `src/auth/guard/`.

### State Management
Redux store (`src/store/store.js`) uses RTK Query for server state and a single `userSlice` for client auth state:
- `src/store/slices/userSlice.js` — `setUser` / `logout` actions; user is persisted via `redux-persist`
- `src/store/Reducer/` — RTK Query API definitions (`authApi`, `walletsApi`, `categoriesApi`)
- `src/store/baseQuery.js` — shared `fetchBaseQuery` wrapper that attaches JWT Bearer token and auto-dispatches `logout()` + redirects to `/` on 401
- `src/store/apiRoutes.js` — all API endpoint strings in one place

### Layouts
`src/layouts/` contains shell layouts composed via `src/layouts/core/layout-section.jsx`:
- `dashboard/` — main dashboard shell with side nav
- `auth-split/`, `auth-centered/` — auth page layouts
- `capme/` — custom layout under active development (distinct dark theme, rail navigation)
- `main/`, `simple/` — public-facing and minimal shells

### Sections (Pages)
`src/sections/` holds page-level view components, one directory per feature area (user, product, invoice, etc.). Active in-progress work lives in `src/sections/_active/`.

### Theme
MUI v5 theme lives in `src/theme/`. Custom overrides in `overrides-theme.js`; settings (color scheme, direction, contrast) managed via `src/components/settings/`.

### Environment Variables
Required in `.env`:
```
VITE_BASE_URL        # Backend API base URL (used by RTK Query baseQuery)
VITE_SERVER_URL
VITE_BASE_PATH
VITE_MAPBOX_API_KEY
# Plus provider-specific keys for Firebase / Auth0 / Amplify / Supabase if used
```
