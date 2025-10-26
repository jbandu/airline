# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AirFlow** is an airline workflow management application for cataloging, analyzing, and prioritizing agentic AI transformation opportunities across airline operations. Built with React 18 + TypeScript, Vite, and Supabase backend.

## Development Commands

### Core Development
```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build to dist/
npm run preview      # Preview production build (http://localhost:4173)
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint validation
```

### Documentation (VitePress)
```bash
npm run docs:dev     # Start VitePress dev server
npm run docs:build   # Build documentation
npm run docs:preview # Preview built docs
```

### Testing Individual Features
- **Run dev server and navigate to specific routes:**
  - `/login` - Authentication
  - `/dashboard` - Main dashboard
  - `/workflows` - Workflow list with filters
  - `/workflows/create` - Multi-step workflow wizard
  - `/workflows/:id` - Workflow detail view
  - `/domains` - Domain/subdomain catalog
  - `/analytics` - Analytics visualizations
  - `/agents` - Agent network analysis

## Architecture

### Application Structure

```
src/
├── App.tsx              # Root component with routing + providers
├── main.tsx             # Entry point
├── contexts/            # React contexts
│   ├── AuthContext.tsx  # Supabase auth + session management
│   └── ThemeContext.tsx # Light/dark theme with localStorage
├── components/
│   ├── layout/          # Sidebar, Header, Footer, Layout wrapper
│   ├── dashboard/       # Dashboard-specific components (MetricCard)
│   ├── workflow/        # Workflow components (ConfirmDialog)
│   ├── visualizations/  # Recharts, D3, ReactFlow visualizations
│   └── agents/          # Agent network visualization components
├── pages/               # Route components (see Routing below)
├── lib/
│   └── supabase.ts      # Supabase client + auth helpers
└── types/
    └── database.types.ts # TypeScript interfaces for Supabase tables
```

### Routing

All routes are defined in `src/App.tsx` within a `BrowserRouter`. Authenticated routes are wrapped with `ProtectedRoute` which checks Supabase auth state and redirects to `/login` if unauthenticated.

**Key Routes:**
- `/login` - Sign in/sign up (bypasses protection)
- `/dashboard` - Aggregate metrics, charts, quick actions
- `/workflows` - List with search, filters (wave/status/complexity), card/table toggle
- `/workflows/create` - 4-step wizard with auto-save to localStorage
- `/workflows/:id` - Tabbed detail (overview, technical, implementation, collaboration)
- `/workflows/:id/edit` - Edit form mirroring creation wizard
- `/domains` - Collapsible domain/subdomain tree with detail panel
- `/subdomains` - Subdomain management with CRUD operations
- `/analytics` - Charts, leaderboard, export placeholders
- `/agents` - Agent network and cross-domain bridges
- `/stakeholders`, `/settings` - Placeholder pages

### Data Flow & State Management

1. **Authentication:** `AuthProvider` subscribes to `supabase.auth.onAuthStateChange`, exposes `user`, `loading`, and auth methods (`signIn`, `signUp`, `signOut`) via context.

2. **Theme:** `ThemeProvider` manages `'light' | 'dark'` mode, persists to localStorage, toggles root element class for Tailwind.

3. **Data Fetching:** Pages use `useEffect` to fetch data from Supabase directly (no global state library). Example pattern:
   ```typescript
   const [workflows, setWorkflows] = useState<Workflow[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     const fetchData = async () => {
       const { data } = await supabase.from('workflows').select('*');
       setWorkflows(data || []);
       setLoading(false);
     };
     fetchData();
   }, []);
   ```

4. **Form Handling:** Uses `react-hook-form` for multi-step wizards (WorkflowCreate, WorkflowEdit). Draft state is persisted to `localStorage` keyed by user ID.

5. **Soft Deletes:** Workflows have `archived_at` timestamp for soft deletion (archiving).

### Supabase Integration

**Client Setup:** `src/lib/supabase.ts` creates client from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables. Throws if missing.

**Environment Variables:** Defined in `.env.local` (gitignored). Required:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Database Schema:**
- Primary tables: `workflows`, `workflow_versions`, `domains`, `subdomains`
- Relationships: workflows → subdomains → domains
- Versioning: workflows reference `current_version_id` in `workflow_versions`
- Extended schema includes: `stakeholders`, `workflow_version_stakeholders`, `comments`, `attachments`, `tags` (not fully implemented in UI)

**Common Queries:**
```typescript
// Fetch with relations
const { data } = await supabase
  .from('workflows')
  .select(`
    *,
    subdomain:subdomains(*, domain:domains(*))
  `);

// Insert
await supabase.from('workflows').insert({ name, subdomain_id, ... });

// Update
await supabase.from('workflows').update({ ... }).eq('id', workflowId);

// Soft delete
await supabase.from('workflows').update({ archived_at: new Date().toISOString() }).eq('id', workflowId);
```

### Styling & Theming

- **Tailwind CSS:** Utility-first styling configured in `tailwind.config.js`
- **Dark Mode:** Toggled via root element class (`dark`), theme state in `ThemeContext`
- **Global Styles:** `src/index.css` defines base layer (backgrounds, scrolling)
- **Responsive:** Layout adapts with collapsible sidebar (64px collapsed, 256px expanded)

### Build Configuration

**Vite Config (`vite.config.ts`):**
- **Base Path:** `/` (was `/airline/` for GitHub Pages)
- **Code Splitting:** Separate chunks for `react-vendor`, `d3-vendor`, `ui-vendor`
- **Dev Server:** Port 5173
- **Preview Server:** Port 4173
- **Sourcemaps:** Disabled in production

**Deployment:**
- GitHub Actions workflow (`.github/workflows/deploy.yml`) auto-deploys to GitHub Pages on push to `main`/`master`
- Build artifacts in `dist/`, includes `.nojekyll` file
- See `DEPLOYMENT.md` for detailed deployment guide

## Key Components & Patterns

### Layout System
- **Layout.tsx:** Wrapper with sidebar, header, main content area, footer
- **Sidebar.tsx:** Navigation with collapsible state, active route highlighting
- **Header.tsx:** Breadcrumbs (auto-generated from route), search, notifications, theme toggle, sign-out
- **Footer.tsx:** Version info, help/privacy/terms links, adjusts for sidebar width

### Protected Routes
- `ProtectedRoute` component checks `AuthContext.user`
- Shows loading spinner while auth state resolves
- Redirects to `/login` if unauthenticated

### Multi-Step Forms
- `WorkflowCreate`: 4 steps (basic info, technical, governance, implementation)
- Uses `react-hook-form` with step-based validation
- Auto-saves drafts to `localStorage` per user (`workflow-draft-${user.id}`)
- Clears draft on successful submit

### Visualizations
- **Recharts:** Bar charts, pie charts, scatter plots (Dashboard, Analytics)
- **D3 + d3-sankey:** Sankey diagrams for cross-domain bridges
- **ReactFlow:** Agent network node graphs
- Located in `src/components/visualizations/`

### Data Tables
- `Workflows` page supports card view (default) and table view toggle
- Includes search, filter dropdowns (wave, status, complexity), sort
- Card view shows key metrics with navigation to detail/edit

## Important Notes

### Authentication Flow
1. User visits protected route → redirected to `/login`
2. Sign in with Supabase email/password
3. `AuthProvider` subscribes to auth state change
4. User object populated in context
5. Protected routes now accessible

### Environment Setup
- Copy `.env.local` template with Supabase credentials
- Never commit `.env.local` (in `.gitignore`)
- All environment variables must be prefixed with `VITE_` to be accessible in client code

### TypeScript
- Strict mode enabled via `tsconfig.app.json`
- Type definitions for database models in `src/types/database.types.ts`
- Supabase queries should be typed with interfaces from `database.types.ts`

### GitHub Pages Deployment
- Base path is configurable in `vite.config.ts` (currently `/`)
- `BrowserRouter` basename must match base path for routing to work
- `.nojekyll` file prevents Jekyll processing
- Automatic deployment via GitHub Actions on push

### Future Extension Points
- Collaboration tabs (comments, attachments, activity) - UI placeholders exist
- Stakeholder management - placeholder page, schema ready
- Settings page - placeholder
- Tags, versioning UI - schema ready, UI not implemented
- Export functionality - placeholders on Analytics page

### Common Patterns

**Fetching List with Relations:**
```typescript
const { data, error } = await supabase
  .from('workflows')
  .select(`
    *,
    subdomain:subdomains!workflows_subdomain_id_fkey(
      *,
      domain:domains!subdomains_domain_id_fkey(*)
    )
  `)
  .is('archived_at', null);
```

**Creating with User Context:**
```typescript
const { user } = useAuth();
await supabase.from('workflows').insert({
  name,
  created_by: user?.id,
  created_at: new Date().toISOString()
});
```

**Filtering & Search:**
```typescript
let query = supabase.from('workflows').select('*');
if (searchTerm) {
  query = query.ilike('name', `%${searchTerm}%`);
}
if (statusFilter) {
  query = query.eq('status', statusFilter);
}
const { data } = await query;
```

## Documentation

Project documentation is built with VitePress and located in `/docs`. Includes:
- **codebase-overview.md:** Detailed architecture reference
- Public docs site: https://jbandu.github.io/airline/

---

**Tech Stack Summary:**
React 18, TypeScript, Vite, React Router v7, Supabase (PostgreSQL + Auth), Tailwind CSS, React Hook Form, Recharts, D3, ReactFlow, Lucide Icons
