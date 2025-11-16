# Component Dependency Map

Visual guide to component relationships and dependencies in AeroGraph.

---

## Application Tree Structure

```
App.tsx
│
├── ThemeProvider (contexts/ThemeContext.tsx)
│   │
│   └── AuthProvider (contexts/AuthContext.tsx)
│       │
│       └── UIThemeProvider (contexts/UIThemeContext.tsx)
│           │
│           └── BrowserRouter (react-router-dom)
│               │
│               └── Routes
│                   │
│                   ├── /login → Login
│                   │
│                   └── Protected Routes
│                       │
│                       ├── ProtectedRoute (checks auth)
│                       │   │
│                       │   └── Layout
│                       │       │
│                       │       ├── Sidebar
│                       │       ├── Header
│                       │       ├── Main Content (Page Component)
│                       │       └── Footer
│                       │
│                       └── [Page Components - see below]
```

---

## Page Component Dependencies

### Dashboard (`pages/Dashboard.tsx`)
```
Dashboard
├── MetricCard × 4 (dashboard/MetricCard.tsx)
├── Recharts (BarChart, PieChart)
├── lucide-react (icons)
└── supabase client
    ├── domains query
    ├── workflows query
    └── agents query
```

### Domains (`pages/Domains.tsx`)
```
Domains
├── lucide-react (Plus, FolderOpen, ChevronRight)
├── Link (react-router-dom)
└── supabase client
    ├── domains query
    ├── subdomains query (count)
    └── workflows query (count)
```

### Workflows (`pages/Workflows.tsx`)
```
Workflows
├── lucide-react (Search, Filter, Grid, List, Edit, Archive)
├── Link (react-router-dom)
├── ConfirmDialog (workflow/ConfirmDialog.tsx)
└── supabase client
    ├── workflows query (with subdomain, domain relations)
    └── workflows.update (archive)
```

### WorkflowCreate (`pages/WorkflowCreate.tsx`)
```
WorkflowCreate
├── react-hook-form (useForm)
├── lucide-react (ChevronLeft, ChevronRight, Save)
├── useNavigate (react-router-dom)
├── useAuth (contexts/AuthContext.tsx)
└── supabase client
    ├── domains query
    ├── subdomains query
    └── workflows.insert
```

### WorkflowDetail (`pages/WorkflowDetail.tsx`)
```
WorkflowDetail
├── useParams (react-router-dom)
├── lucide-react (Edit, Archive, Copy, Check, X, Calendar, Users)
├── ConfirmDialog (workflow/ConfirmDialog.tsx)
├── Link (react-router-dom)
└── supabase client
    ├── workflows query (single, with relations)
    ├── workflow_stakeholders query
    ├── workflow_comments query
    └── workflow_attachments query
```

### AgentNetwork (`pages/AgentNetwork.tsx`)
```
AgentNetwork
├── AgentCollaborationGraph (agents/AgentCollaborationGraph.tsx)
│   └── ReactFlow (reactflow)
│       ├── Controls
│       ├── Background
│       └── MiniMap
│
├── AgentCategoryLegend (agents/AgentCategoryLegend.tsx)
├── AgentMetrics (agents/AgentMetrics.tsx)
├── AgentList (agents/AgentList.tsx)
├── lucide-react (Bot, Users, Zap, Activity, Network)
└── supabase client
    ├── v_agent_network query (view)
    └── v_agent_collaboration_edges query (view)
```

### KnowledgeGraphPage (`pages/KnowledgeGraphPage.tsx`)
```
KnowledgeGraphPage
├── KnowledgeGraph (visualizations/KnowledgeGraph.tsx)
│   └── d3 (force simulation, drag, zoom)
│
├── lucide-react (Network, ZoomIn, ZoomOut)
└── supabase client
    └── knowledge_graph function
```

### OntologyTree (`pages/OntologyTree.tsx`)
```
OntologyTree
├── OntologyTree (visualizations/OntologyTree.tsx)
│   └── react-d3-tree
│       ├── Tree component
│       └── Node customization
│
├── lucide-react (GitBranch, Search, Download)
└── supabase client
    └── ontology_tree function
```

### CrossDomainBridges (`pages/CrossDomainBridges.tsx`)
```
CrossDomainBridges
├── CrossDomainSankey (visualizations/CrossDomainSankey.tsx)
│   └── d3-sankey
│       ├── sankey()
│       ├── sankeyLinkHorizontal()
│       └── svg rendering
│
├── CrossDomainBridgeMap (visualizations/CrossDomainBridgeMap.tsx)
│   └── Recharts (Treemap)
│
├── lucide-react (GitMerge, ArrowRight)
└── supabase client
    └── cross_domain_bridges function
```

### SemanticMatrixPage (`pages/SemanticMatrixPage.tsx`)
```
SemanticMatrixPage
├── SemanticMatrix (visualizations/SemanticMatrix.tsx)
│   └── Recharts (ScatterChart, Cell customization)
│
├── lucide-react (Grid, Download)
└── supabase client
    └── semantic_similarity_matrix function
```

### DataEntities (`pages/DataEntities.tsx`)
```
DataEntities
├── lucide-react (Database, Search, Plus, Edit, Trash)
├── Link (react-router-dom)
└── supabase client
    ├── data_entities query
    ├── data_entity_attributes query
    └── data_entity_relationships query
```

### DataFlows (`pages/DataFlows.tsx`)
```
DataFlows
├── DataFlowsSankey (visualizations/DataFlowsSankey.tsx)
│   └── d3-sankey
│
├── lucide-react (Workflow, Filter)
└── supabase client
    ├── data_flows query
    └── data_systems query
```

### DataLineage (`pages/DataLineage.tsx`)
```
DataLineage
├── DataLineageGraph (visualizations/DataLineageGraph.tsx)
│   └── ReactFlow
│       ├── Controls
│       ├── Background
│       └── Custom node types
│
├── lucide-react (GitBranch, Search)
└── supabase client
    └── data_lineage query
```

---

## Layout Component Dependencies

### Layout (`components/layout/Layout.tsx`)
```
Layout
├── Sidebar (components/layout/Sidebar.tsx)
│   ├── lucide-react (30+ icons)
│   ├── Link (react-router-dom)
│   ├── useLocation (react-router-dom)
│   └── useState (collapsed state)
│
├── Header (components/layout/Header.tsx)
│   ├── lucide-react (Search, Bell, User, LogOut, Sun, Moon)
│   ├── useLocation (react-router-dom)
│   ├── useAuth (contexts/AuthContext.tsx)
│   ├── useTheme (contexts/ThemeContext.tsx)
│   └── Breadcrumbs (auto-generated from route)
│
├── Main Content (children prop)
│
└── Footer (components/layout/Footer.tsx)
    ├── lucide-react (Heart)
    └── External links
```

---

## Visualization Component Dependencies

### AgentCollaborationGraph
```
AgentCollaborationGraph
├── reactflow
│   ├── ReactFlow
│   ├── Controls
│   ├── Background
│   ├── MiniMap
│   └── useNodesState, useEdgesState
│
└── Props:
    ├── agents[] (from parent)
    └── collaborations[] (from parent)
```

### KnowledgeGraph
```
KnowledgeGraph
├── d3 (v7)
│   ├── d3.forceSimulation
│   ├── d3.forceLink
│   ├── d3.forceCenter
│   ├── d3.forceManyBody
│   ├── d3.forceCollide
│   ├── d3.drag
│   └── d3.zoom
│
├── useEffect (initialization, cleanup)
├── useRef (svg ref)
└── Props:
    ├── nodes[] (from parent)
    └── links[] (from parent)
```

### OntologyTree
```
OntologyTree
├── react-d3-tree
│   ├── Tree component
│   ├── Custom node rendering
│   └── Path functions
│
├── useState (orientation, zoom, translation)
└── Props:
    └── data (tree structure from parent)
```

### CrossDomainSankey
```
CrossDomainSankey
├── d3-sankey
│   ├── sankey()
│   ├── sankeyLinkHorizontal()
│   └── sankeyCenter
│
├── d3 (selections, scales)
├── useEffect (render on data change)
├── useRef (svg ref)
└── Props:
    ├── nodes[] (from parent)
    └── links[] (from parent)
```

### SemanticMatrix
```
SemanticMatrix
├── Recharts
│   ├── ScatterChart
│   ├── XAxis, YAxis
│   ├── Tooltip
│   ├── Cell
│   └── Legend
│
└── Props:
    └── data (matrix from parent)
```

### DataLineageGraph
```
DataLineageGraph
├── ReactFlow
│   ├── Custom node types
│   ├── Custom edge types
│   ├── Controls
│   └── Background
│
├── dagre (layout algorithm)
└── Props:
    └── lineageData (from parent)
```

---

## Context Dependencies

### AuthContext (`contexts/AuthContext.tsx`)
```
AuthContext
├── supabase auth
│   ├── auth.getSession()
│   ├── auth.onAuthStateChange()
│   ├── auth.signIn()
│   ├── auth.signUp()
│   └── auth.signOut()
│
├── useState (user, loading)
├── useEffect (session subscription)
└── Provides:
    ├── user: User | null
    ├── loading: boolean
    ├── signIn()
    ├── signUp()
    └── signOut()
```

### ThemeContext (`contexts/ThemeContext.tsx`)
```
ThemeContext
├── useState (theme)
├── useEffect (localStorage sync, DOM class update)
├── localStorage
│   ├── getItem('theme')
│   └── setItem('theme', value)
│
├── document.documentElement.classList
│   ├── add('dark')
│   └── remove('dark')
│
└── Provides:
    ├── theme: 'light' | 'dark'
    └── toggleTheme()
```

### UIThemeContext (`contexts/UIThemeContext.tsx`)
```
UIThemeContext
├── useState (UI preferences)
├── useEffect (localStorage sync)
└── Provides:
    ├── UI preferences
    └── Update methods
```

---

## Shared Utilities

### Supabase Client (`lib/supabase.ts`)
```
supabase.ts
├── @supabase/supabase-js
│   └── createClient()
│
├── Environment variables
│   ├── VITE_SUPABASE_URL
│   └── VITE_SUPABASE_ANON_KEY
│
├── errorLogger (lib/errorLogger.ts)
│
└── Exports:
    ├── supabase (client)
    └── auth (helper methods)
```

### Error Logger (`lib/errorLogger.ts`)
```
errorLogger.ts
└── Exports:
    ├── logError()
    ├── logWarning()
    └── logInfo()
```

---

## External Library Dependencies

### Core Framework
- **react** (18.3.1)
- **react-dom** (18.3.1)
- **typescript** (5.5.3)

### Routing
- **react-router-dom** (7.9.4)

### Backend/Auth
- **@supabase/supabase-js** (2.57.4)

### Forms
- **react-hook-form** (7.65.0)

### Visualizations
- **d3** (7.9.0)
- **d3-sankey** (0.12.3)
- **react-d3-tree** (3.6.6)
- **reactflow** (11.11.4)
- **recharts** (3.3.0)

### UI/Icons
- **lucide-react** (0.344.0)
- **tailwindcss** (3.4.1)

### Build Tools
- **vite** (5.4.2)
- **@vitejs/plugin-react** (4.3.1)

---

## Data Flow Dependencies

### Create Workflow Flow
```
WorkflowCreate.tsx
    ↓ (form submission)
supabase.from('workflows').insert()
    ↓ (RLS check)
Database INSERT
    ↓ (success)
navigate('/workflows')
    ↓
Workflows.tsx
    ↓ (useEffect on mount)
supabase.from('workflows').select()
    ↓
Display new workflow
```

### Authentication Flow
```
Login.tsx
    ↓ (email/password)
auth.signIn()
    ↓
supabase.auth.signInWithPassword()
    ↓ (success)
AuthContext.setUser()
    ↓ (triggers re-render)
ProtectedRoute (now passes)
    ↓
Layout + Page rendered
```

### Theme Toggle Flow
```
Header.tsx (moon/sun icon click)
    ↓
toggleTheme()
    ↓
ThemeContext.setState()
    ↓
useEffect (localStorage + DOM update)
    ↓
document.documentElement.classList.toggle('dark')
    ↓
Tailwind applies all dark: variants
```

---

## Import Patterns

### Standard Page Import Pattern
```typescript
// React hooks
import { useState, useEffect } from 'react';

// Routing
import { useNavigate, useParams, Link } from 'react-router-dom';

// Icons
import { Icon1, Icon2 } from 'lucide-react';

// Contexts
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Components
import { ComponentName } from '../components/path/Component';

// Supabase
import { supabase } from '../lib/supabase';

// Types
import { TypeName } from '../types/database.types';
```

### Standard Component Import Pattern
```typescript
import React from 'react';
import { PropType } from '../types';
import { IconName } from 'lucide-react';

interface ComponentProps {
  // ...
}

export const Component: React.FC<ComponentProps> = ({ props }) => {
  // ...
};
```

---

## Circular Dependency Prevention

### No Circular Dependencies Present
The application follows a clear hierarchy:
```
App (root)
  ↓
Contexts (global state)
  ↓
Layout Components
  ↓
Page Components
  ↓
Feature Components
  ↓
Visualization Components
  ↓
Utilities (no dependencies)
```

### Import Rules
1. **Never import App.tsx** in any component
2. **Contexts** don't import pages or components
3. **Pages** don't import other pages
4. **Components** don't import pages
5. **Utils** don't import components

---

## Bundle Analysis

### Main Chunks (Vite Code Splitting)

**react-vendor.js** (~140KB gzipped)
- react
- react-dom
- react-router-dom

**d3-vendor.js** (~80KB gzipped)
- d3
- d3-sankey

**ui-vendor.js** (~60KB gzipped)
- lucide-react
- reactflow

**main.js** (~200KB gzipped)
- All application code
- Components
- Pages
- Contexts

**Total bundle size**: ~480KB gzipped

---

## Performance Optimizations

### Code Splitting by Route
```typescript
// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Workflows = lazy(() => import('./pages/Workflows'));

// Wrap in Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/" element={<Dashboard />} />
  </Routes>
</Suspense>
```

### Memoization Opportunities
```typescript
// Expensive calculations
const filteredWorkflows = useMemo(() => {
  return workflows.filter(applyFilters);
}, [workflows, filters]);

// Component memoization
const MemoizedCard = React.memo(WorkflowCard);
```

### Virtual Scrolling
```typescript
// For long lists (not currently implemented)
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={workflows.length}
  itemSize={100}
>
  {WorkflowRow}
</FixedSizeList>
```

---

## Testing Dependencies (Future)

### Recommended Test Stack
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0"
  }
}
```

### Test Structure
```
src/
├── __tests__/
│   ├── components/
│   │   ├── Layout.test.tsx
│   │   └── MetricCard.test.tsx
│   ├── pages/
│   │   ├── Dashboard.test.tsx
│   │   └── Workflows.test.tsx
│   └── contexts/
│       ├── AuthContext.test.tsx
│       └── ThemeContext.test.tsx
```

---

**Summary**: This application has a clean, hierarchical dependency structure with no circular dependencies. External dependencies are well-organized and code-split for optimal performance.
