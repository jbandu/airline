# AirFlow Codebase Overview

## 1. Tooling and entry point
- **Vite + React 18**: `src/main.tsx` renders `<App />` in strict mode and loads the global Tailwind styles declared in `src/index.css`.
- **Project scripts**: `package.json` exposes `dev`, `build`, `preview`, `lint`, and `typecheck` commands so the same toolchain runs locally and in CI.
- **Styling system**: Tailwind operates in class-based dark-mode with minimal extensions via `tailwind.config.js`, while `index.css` applies smooth scrolling and theme-aware body colors.

## 2. Application shell and routing
- `src/App.tsx` wraps the tree in `ThemeProvider` and `AuthProvider`, then mounts a `BrowserRouter` that protects every route except `/login`.
- Authenticated routes render inside `<Layout>` so each feature view inherits the sidebar, header, and footer. Paths include dashboard, domains, workflow CRUD, analytics, stakeholders, settings, plus a wildcard redirect.

## 3. Context providers and Supabase glue
- **Authentication**: `contexts/AuthContext.tsx` calls `auth.getSession()` on mount, subscribes to `auth.onAuthStateChange`, and surfaces `user`, `loading`, and `signIn`/`signUp`/`signOut` helpers.
- **Theme**: `contexts/ThemeContext.tsx` persists a `'light' | 'dark'` flag in `localStorage` and synchronizes it to the `<html>` class list; consumers call `toggleTheme()` to swap palettes.
- **Supabase client**: `lib/supabase.ts` verifies the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables, creates the Supabase client, and re-exports a typed `auth` helper around sign-up/sign-in/sign-out/session APIs.

## 4. Layout system
- **Layout wrapper**: `components/layout/Layout.tsx` stores the collapsed sidebar state, offsets the main content area accordingly, and anchors the header/footer.
- **Sidebar**: `components/layout/Sidebar.tsx` lists Lucide-backed navigation links, shows authenticated user initials/email when expanded, and offers a collapse toggle.
- **Header**: `components/layout/Header.tsx` derives breadcrumbs from the current pathname, exposes an inline search box placeholder, notification icon, theme toggle, and sign-out action.
- **Footer**: `components/layout/Footer.tsx` sticks help/privacy/terms links and a version label to the viewport bottom.

## 5. Shared UI building blocks
- **Route guard**: `components/ProtectedRoute.tsx` blocks rendering until the auth state finishes resolving, shows a full-screen loader, and redirects unauthenticated visitors to `/login`.
- **Dashboard cards**: `components/dashboard/MetricCard.tsx` renders stat tiles with optional badges and trend indicators for reuse across analytics views.
- **Confirmation modal**: `components/workflow/ConfirmDialog.tsx` centralizes the destructive-action dialog with confirm/cancel buttons and custom styling props.

## 6. Feature directories
- **Pages**: Each screen under `src/pages` manages its own data fetching from Supabase, local state (filters, tab selections, etc.), and rich Tailwind UI. The routing tree maps directly to these files.
- **Types**: `types/database.types.ts` records the Supabase row shapes (domains, subdomains, workflows, stakeholders, attachments, comments) plus the `WorkflowWithRelations` helper used by joins.

## 7. Data shape and schema alignment
- The client currently reads and writes the `workflows`, `domains`, and `subdomains` tables, including array fields such as `ai_enablers` and `systems_involved`.
- The supplied SQL snapshot extends that model with agent catalogs, workflow version governance, ROI metrics, attachments, comments, and integration mappings that can be surfaced later using the existing layout and analytics primitives documented above.
