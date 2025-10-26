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
## 1. Technology Stack and Tooling
- **Framework**: React 18 with TypeScript, bundled by Vite. Entry point is `src/main.tsx`, which mounts `<App />` within a `StrictMode` wrapper and imports Tailwind-driven global styles.【F:src/main.tsx†L1-L10】
- **Build Scripts**: `package.json` exposes scripts for local dev (`vite`), production builds, previews, linting, and type-checking. Dependencies include Supabase, React Router v7, React Hook Form, Recharts, Tailwind CSS, and Lucide icons.【F:package.json†L1-L35】
- **Styling**: Tailwind CSS powers utility-first styling with base layer definitions in `src/index.css` that enforce light/dark theme backgrounds and smooth scrolling.【F:src/index.css†L1-L12】

## 2. Application Shell and Routing
- **HTML Scaffold**: `index.html` creates the root container and loads the Vite entry script.【F:index.html†L1-L13】
- **Router Hierarchy**: `src/App.tsx` wraps the app in `ThemeProvider` and `AuthProvider`, then establishes routes within `BrowserRouter`. Each authenticated route is gated by `ProtectedRoute` and rendered inside a shared `Layout`. Routes cover dashboard, domains, workflow CRUD, analytics, stakeholders, settings, and a catch-all redirect.【F:src/App.tsx†L1-L88】
- **Protected Access**: `ProtectedRoute` reads the Supabase-authenticated user from `AuthContext`, showing a fullscreen loading indicator until the auth state resolves and redirecting unauthenticated visitors to `/login`.【F:src/components/ProtectedRoute.tsx†L1-L24】

## 3. Context Providers
- **AuthContext**: `AuthProvider` tracks the Supabase session, exposes `user`, `loading`, and convenience methods (`signIn`, `signUp`, `signOut`). It subscribes to auth state changes on mount and tears down the listener on cleanup.【F:src/contexts/AuthContext.tsx†L1-L44】
- **ThemeContext**: `ThemeProvider` manages a `'light' | 'dark'` theme, persists the preference to `localStorage`, and toggles the root element class so Tailwind can theme components. Consumers access `theme` and `toggleTheme` via `useTheme`.【F:src/contexts/ThemeContext.tsx†L1-L47】

## 4. Supabase Integration
- `src/lib/supabase.ts` constructs a Supabase client from environment variables (throwing if missing) and re-exports an `auth` helper with sign-in/out utilities plus session and state-change helpers that wrap Supabase Auth v2 APIs.【F:src/lib/supabase.ts†L1-L34】

## 5. Layout System
- **Layout Wrapper**: `src/components/layout/Layout.tsx` pins the sidebar and header, manages the collapsed state, and offsets the main content and footer to accommodate sidebar width changes.【F:src/components/layout/Layout.tsx†L1-L24】
- **Sidebar**: Provides navigation links, user badge, and collapse control. Active routes receive highlighted styles, and the component adapts its width between 64px and 256px via Tailwind classes.【F:src/components/layout/Sidebar.tsx†L1-L87】
- **Header**: Displays breadcrumbs inferred from the current location, a search field, notification, theme toggle, and sign-out button.【F:src/components/layout/Header.tsx†L1-L77】
- **Footer**: Sticky footer that adjusts its left boundary based on sidebar width and surfaces help/privacy/terms links with version metadata.【F:src/components/layout/Footer.tsx†L1-L33】

## 6. Shared UI Components
- **MetricCard**: Styled summary card with icon slot, optional badge, and trend indicator used on the dashboard.【F:src/components/dashboard/MetricCard.tsx†L1-L43】
- **ConfirmDialog**: Modal confirmation dialog reused for destructive actions like workflow deletion. Provides customizable confirm button styling and auto-closes on confirm.【F:src/components/workflow/ConfirmDialog.tsx†L1-L49】

## 7. Feature Pages
### Authentication
- **Login**: Allows switching between sign-in and sign-up flows, displays Supabase errors, and navigates authenticated users to the dashboard. Uses Lucide icons for field adornments and persists form state locally.【F:src/pages/Login.tsx†L1-L92】

### Portfolio Management
- **Dashboard**: Aggregates Supabase `workflows` data to compute totals, quick wins, average agentic potential, and implementation progress. Visualizations include domain bar charts and implementation wave pie charts powered by Recharts, plus quick-action buttons for navigation.【F:src/pages/Dashboard.tsx†L1-L196】
- **Workflows List**: Fetches workflows with related domain/subdomain names, supports text search, filtering by wave/status/complexity, and toggling between card and table presentations. Card view surfaces key metrics and offers inline navigation to detail/edit screens.【F:src/pages/Workflows.tsx†L1-L212】
- **Workflow Detail**: Shows tabbed views (overview, technical, implementation, collaboration), with cloning (creating a new draft), soft deletion (archiving via `archived_at`), and metrics summaries. Collaboration tab reserves space for comments, attachments, and activity logs pending implementation.【F:src/pages/WorkflowDetail.tsx†L1-L208】
- **Workflow Creation Wizard**: Multi-step form built with React Hook Form. Loads domain/subdomain options from Supabase, auto-saves drafts to `localStorage` per user, and persists new workflows via Supabase inserts. Steps cover basic info, technical metadata, governance context, and implementation logistics.【F:src/pages/WorkflowCreate.tsx†L1-L210】
- **Workflow Editing**: Single-page form mirroring the create wizard fields, pre-populating values from Supabase and updating records (with timestamp) on submit.【F:src/pages/WorkflowEdit.tsx†L1-L199】

### Domain Catalog
- **Domains**: Fetches domains and subdomains, supports filtering, and renders a collapsible tree with detail panel showing metadata and counts for the selected domain or subdomain.【F:src/pages/Domains.tsx†L1-L199】

### Analytics & Insights
- **Analytics**: Reuses workflow data to build scatter, bar, and pie charts plus a leaderboard table ranking workflows by agentic potential. Includes export button placeholders.【F:src/pages/Analytics.tsx†L1-L196】

### Placeholder Sections
- **Stakeholders**: Currently a placeholder card announcing upcoming stakeholder management tooling.【F:src/pages/Stakeholders.tsx†L1-L21】
- **Settings**: Placeholder for future configuration controls.【F:src/pages/Settings.tsx†L1-L19】

## 8. Domain Models and Types
- Type definitions for domains, subdomains, workflows, stakeholders, and associated relationships live in `src/types/database.types.ts`. These interfaces align with Supabase tables (including arrays for AI enablers, systems, and dependencies) and support typed Supabase interactions across pages.【F:src/types/database.types.ts†L1-L55】

## 9. Data Schema Context
- The provided SQL schema models airline workflow metadata, including lookup tables (domains, subdomains, airline types, AI enablers), workflow versioning, attachments, comments, and governance relationships. Front-end pages primarily interact with the simplified `workflows`, `domains`, and `subdomains` tables but are structured to accommodate the richer relational context when backend endpoints mature.

## 10. Theming and Accessibility Considerations
- Dark mode is implemented via Tailwind's `dark` variant toggled at the root level. Layout adjusts for collapsed navigation to maintain accessible focusable controls. Icon buttons include tooltips or descriptive labels where applicable (e.g., collapse toggles, sign-out).【F:src/contexts/ThemeContext.tsx†L19-L41】【F:src/components/layout/Sidebar.tsx†L19-L87】

## 11. Future Extension Points
- Placeholder sections (Stakeholders, Settings, collaboration tabs) and TODO comments in the UI indicate room for integrating tables such as `workflow_version_stakeholders`, `workflow_version_tags`, and `comments` from the provided schema. The modular context and layout structure allow additional routes and dashboards without significant refactoring.
