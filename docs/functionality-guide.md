# AirFlow Functionality Guide

This guide catalogs the concrete behavior implemented across the React + Supabase codebase and relates it to the richer airline workflow schema supplied alongside the project.

## 1. Authentication and session flow
- `lib/supabase.ts` instantiates the Supabase client with environment validation and wraps sign-up, password auth, sign-out, and session helpers.
- `contexts/AuthContext.tsx` loads the current session on mount, subscribes to `onAuthStateChange`, and exposes `user`, `loading`, and mutation helpers through `useAuth`.
- `pages/Login.tsx` presents a combined sign-in/sign-up card: it toggles between modes, posts credentials via the context helpers, surfaces Supabase errors inline, and routes successful logins to `/`.
- `components/ProtectedRoute.tsx` waits for the auth context to finish loading, shows a branded full-screen loader meanwhile, and redirects unauthenticated visitors to `/login`.

## 2. Theming and layout shell
- `contexts/ThemeContext.tsx` persists a `light`/`dark` flag to `localStorage` and toggles the `<html>` class so Tailwind dark-mode styles apply globally.
- `components/layout/Layout.tsx` holds the sidebar collapsed state and renders the persistent chrome (`Sidebar`, `Header`, `Footer`) around page content.
- `components/layout/Sidebar.tsx` renders navigation links, displays the authenticated user’s initials/email when expanded, and provides the collapse toggle.
- `components/layout/Header.tsx` derives breadcrumbs from the current pathname, exposes an inline (presentational) search box, a notification icon, the theme toggle, and a logout button wired to `signOut`.
- `components/layout/Footer.tsx` anchors help/privacy/terms links plus a static version string to the viewport bottom.

## 3. Route-by-route functionality
### 3.1 Dashboard (`/`)
- `pages/Dashboard.tsx` fetches non-archived workflows with joined domain data, derives total workflows, quick wins (complexity ≤ 2 and potential ≥ 4), average potential, and completion percentage.
- Presents four `MetricCard` tiles for the derived metrics, quick navigation buttons (create workflow, view roadmap/list, analytics, export), a placeholder recent-activity panel, a Recharts bar chart for domain distribution, a pie chart for implementation waves, and a “Coming soon” complexity trend card.

### 3.2 Domains (`/domains`)
- `pages/Domains.tsx` loads all domains and subdomains, manages expanded-domain IDs with a `Set`, and filters domains by name/description search.
- Selecting a domain or subdomain populates the detail panel with descriptions and created/updated timestamps; the tree view displays subdomain counts and icons reflecting expansion state.

### 3.3 Workflows list (`/workflows`)
- Fetches non-archived workflows with embedded domain/subdomain records.
- Maintains filter state for search, implementation wave, a set of statuses, and min/max complexity sliders; derived results update in `useEffect`.
- Supports card and table view modes. Cards highlight status, domain, wave, complexity, and potential with CTA buttons to view or edit; the table offers similar data with inline action icons.

### 3.4 Workflow detail (`/workflows/:id`)
- Loads a single workflow with domain/subdomain joins (ignoring archived entries) and renders action buttons: Edit, Clone, and Delete.
- Clone duplicates the workflow’s editable fields, appends “(Copy)” to the name, inserts the new record, and redirects to the created workflow while showing loading state during the mutation.
- Delete triggers `ConfirmDialog` and archives the workflow by setting `archived_at` before returning to the list.
- Tabbed content includes:
  - **Overview**: description, complexity badge, agentic potential, autonomy level, business context, and expected ROI copy.
  - **Technical**: agentic function type pill plus AI enabler and systems tag lists with empty-state messaging.
  - **Implementation**: wave summary (with quick-win/priority labels), dependency list, and a table of success metrics.
  - **Collaboration**: placeholder cards for comments, attachments, and activity logs with “coming soon” messaging.

### 3.5 Workflow creation wizard (`/workflows/new`)
- Implements a four-step process (Basic Info, Technical, Governance, Implementation) using `react-hook-form` with sensible defaults for status, scoring fields, and arrays.
- Loads domain options on mount; when a domain is selected the subdomain dropdown refreshes accordingly.
- Stores step-by-step drafts in `localStorage` under `workflow_draft_{userId}` so users can resume. `handleNext` saves progress, `handleCancel` clears the draft after confirmation, and successful submission inserts the workflow before clearing storage and routing back to the list.

### 3.6 Workflow editing (`/workflows/:id/edit`)
- Prefills the same form schema by fetching the workflow, populating `react-hook-form` values, and loading domains/subdomains.
- Array fields such as AI enablers and systems are represented as comma-separated inputs whose `onChange` handlers split values back into arrays before saving. Updates stamp `updated_at` and navigate back to the workflow detail.

### 3.7 Analytics (`/analytics`)
- Reuses the workflow query to prepare scatter data (complexity vs potential grouped by wave), counts per domain, wave pie-chart data, and a top-10 leaderboard sorted by agentic potential.
- Renders Recharts scatter, bar, and pie charts with Tailwind-consistent tooltip theming plus summary stat cards and placeholder export buttons.

### 3.8 Stakeholders and settings placeholders
- `pages/Stakeholders.tsx` and `pages/Settings.tsx` surface informative placeholder cards to communicate upcoming stakeholder management and preference features while keeping navigation complete.

## 4. Reusable components
- `components/dashboard/MetricCard.tsx` standardizes stat cards with icon slots, optional badge, and trend labeling to keep dashboards visually consistent.
- `components/workflow/ConfirmDialog.tsx` handles destructive-action confirmation with configurable text, styling, and automatic close on confirm.

## 5. Data modeling and schema coverage
- `types/database.types.ts` defines the client-side representation of domains, subdomains, workflows (including array fields and nested success metrics), stakeholders, workflow stakeholders, comments, attachments, and the `WorkflowWithRelations` helper used when joining domain/subdomain data.
- Current pages only operate on base tables (`domains`, `subdomains`, `workflows`) plus inline arrays for AI enablers, systems, airline applicability, dependencies, and success metrics. This matches the simplified Supabase columns referenced in the forms and detail views.
- The provided SQL schema extends the domain with agent catalogs (`agent_categories`, `agent_types`, `agent_instances`), collaboration telemetry (`agent_collaborations`, `agent_executions`), governance artifacts (`reviews`, `comments`, `attachments`, `workflow_roi_metrics`), and workflow-version join tables (airline types, regulatory bodies, stakeholders, systems, tags). Those structures align with placeholders in the UI (comments, attachments, stakeholder tabs) and can be surfaced by extending Supabase queries and updating the shared types.
- Additional reference tables (`autonomy_levels`, `ai_enabler_types`, `agentic_function_types`, `regulatory_bodies`, `tags`, `systems`, `stakeholders`, `airline_types`) are poised to drive richer pickers and analytics once their data is exposed via the API.

## 6. Extensibility considerations
- The layout shell and route guard pattern make it straightforward to add new authenticated screens for schema areas like ROI metrics or agent execution telemetry.
- Existing placeholders (collaboration tab, analytics export buttons, stakeholder/settings pages) indicate clear insertion points for integrating tables such as `workflow_version_stakeholders`, `workflow_roi_metrics`, and `agent_collaborations` without disrupting the current navigation.
- Extending `types/database.types.ts` in tandem with Supabase view updates will keep the client strongly typed as more of the schema is adopted.
