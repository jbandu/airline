# AeroGraph - Comprehensive System Documentation

**Version**: 1.0
**Last Updated**: 2025-11-16
**Purpose**: Complete reference for understanding and reimagining the entire application

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [Frontend Architecture](#frontend-architecture)
5. [Data Flow Patterns](#data-flow-patterns)
6. [Authentication & Authorization](#authentication--authorization)
7. [Component Inventory](#component-inventory)
8. [Routing System](#routing-system)
9. [State Management](#state-management)
10. [Styling & Theming](#styling--theming)
11. [Build & Deployment](#build--deployment)
12. [Key Features](#key-features)
13. [Extension Points](#extension-points)
14. [Technical Decisions](#technical-decisions)

---

## Executive Summary

### What is AeroGraph?

**AeroGraph** is an airline workflow management application for **cataloging, analyzing, and prioritizing agentic AI transformation opportunities** across airline operations. It helps airlines identify, track, and implement AI-powered workflow automation across all operational domains.

### Core Value Proposition

- **Catalog** automation opportunities across airline domains
- **Analyze** complexity, ROI, and implementation feasibility
- **Prioritize** workflows by implementation waves (1, 2, 3)
- **Visualize** agent networks, knowledge graphs, and cross-domain connections
- **Track** stakeholders, dependencies, and success metrics

### Target Users

- **Airline Operations Managers**: Identify automation opportunities
- **IT/Digital Transformation Teams**: Plan AI implementation roadmap
- **Business Analysts**: Track ROI and success metrics
- **Executives**: Dashboard view of transformation progress

### Current Implementation Focus

The application currently contains **baggage operations intelligence** as a comprehensive example:
- 5 baggage operational domains
- 18 subdomains
- 30 automated workflows
- 18 AI agents
- 8 agent categories
- Target: $6.3M annual ROI for Copa Airlines

---

## System Architecture

### Technology Stack

```
┌─────────────────────────────────────────────┐
│           Frontend (React SPA)              │
│  React 18 + TypeScript + Vite + TailwindCSS│
│                                             │
│  ┌─────────────┐  ┌──────────────┐         │
│  │ React Router│  │ React Context│         │
│  │   (v7.9.4)  │  │  (Auth/Theme)│         │
│  └─────────────┘  └──────────────┘         │
│                                             │
│  ┌─────────────┐  ┌──────────────┐         │
│  │   Recharts  │  │ D3.js + Flow │         │
│  │(Viz Library)│  │ (Graphs/Tree)│         │
│  └─────────────┘  └──────────────┘         │
└─────────────────────────────────────────────┘
              ↕️ Supabase Client
┌─────────────────────────────────────────────┐
│        Backend (Supabase/PostgreSQL)        │
│                                             │
│  ┌─────────────┐  ┌──────────────┐         │
│  │  PostgreSQL │  │  Supabase    │         │
│  │  Database   │  │  Auth        │         │
│  └─────────────┘  └──────────────┘         │
│                                             │
│  ┌─────────────┐  ┌──────────────┐         │
│  │     RLS     │  │   Storage    │         │
│  │  (Security) │  │  (Files)     │         │
│  └─────────────┘  └──────────────┘         │
└─────────────────────────────────────────────┘
```

### Layer Responsibilities

#### **Frontend (React)**
- **Purpose**: User interface, visualization, interaction
- **Tech**: React 18, TypeScript, Vite, TailwindCSS
- **Responsibilities**:
  - Render UI components
  - Handle user interactions
  - Manage client state (auth, theme, UI)
  - Fetch/display data from Supabase
  - Visualizations (charts, graphs, networks)

#### **Backend (Supabase)**
- **Purpose**: Database, authentication, storage, security
- **Tech**: PostgreSQL, Supabase Platform
- **Responsibilities**:
  - Store all application data
  - Authenticate users
  - Enforce Row-Level Security (RLS)
  - Execute database functions
  - Generate views for complex queries

### Architecture Patterns

#### **Single Page Application (SPA)**
- Client-side routing via React Router
- Dynamic page loading
- No page refreshes
- Fast navigation

#### **JAMstack Architecture**
- **JavaScript**: React for dynamic functionality
- **APIs**: Supabase REST/Realtime APIs
- **Markup**: Pre-built React components

#### **Direct Database Access**
- No traditional backend API layer
- Frontend directly queries Supabase
- Row-Level Security enforces permissions
- Supabase handles:
  - Authentication tokens
  - Query authorization
  - Data validation

---

## Database Schema

### Core Tables

#### **1. domains**
```sql
CREATE TABLE domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  icon_url text NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Purpose**: High-level business domains (e.g., "Baggage Operations", "Flight Operations")

**Fields**:
- `id`: UUID primary key
- `name`: Domain name (unique)
- `description`: Detailed description
- `icon_url`: Optional icon URL
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- One-to-Many with `subdomains`
- One-to-Many with `workflows` (optional direct link)

---

#### **2. subdomains**
```sql
CREATE TABLE subdomains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id uuid NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  created_by uuid NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(domain_id, name)
);
```

**Purpose**: Specific areas within a domain (e.g., "Check-In & Tagging" under "Baggage Operations")

**Fields**:
- `id`: UUID primary key
- `domain_id`: Foreign key to parent domain
- `name`: Subdomain name (unique within domain)
- `description`: Detailed description
- `created_by`: User who created (optional)

**Relationships**:
- Many-to-One with `domains`
- One-to-Many with `workflows`

---

#### **3. workflows**
```sql
CREATE TABLE workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  domain_id uuid REFERENCES domains(id) ON DELETE SET NULL,
  subdomain_id uuid REFERENCES subdomains(id) ON DELETE SET NULL,

  -- Scoring (1-5 scale)
  complexity int DEFAULT 3 CHECK (complexity >= 1 AND complexity <= 5),
  agentic_potential int DEFAULT 3 CHECK (agentic_potential >= 1 AND agentic_potential <= 5),
  autonomy_level int DEFAULT 3 CHECK (autonomy_level >= 1 AND autonomy_level <= 5),

  -- Implementation
  implementation_wave int DEFAULT 1 CHECK (implementation_wave >= 1 AND implementation_wave <= 3),
  status text DEFAULT 'draft', -- draft, planned, in-progress, completed, archived

  -- Categorization
  airline_type text[] DEFAULT '{}', -- ["Full Service", "Low Cost", etc.]
  agentic_function_type text DEFAULT '',
  ai_enablers text[] DEFAULT '{}', -- ["NLP", "Computer Vision", etc.]
  systems_involved text[] DEFAULT '{}',

  -- Business Context
  business_context text DEFAULT '',
  expected_roi text DEFAULT '',
  dependencies text[] DEFAULT '{}',
  success_metrics jsonb DEFAULT '[]'::jsonb,

  -- Versioning
  version int DEFAULT 1,
  created_by uuid NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Soft Delete
  archived_at timestamptz NULL,
  parent_workflow_id uuid REFERENCES workflows(id)
);
```

**Purpose**: Automation opportunities/workflows to be implemented

**Scoring Fields** (1-5):
- `complexity`: Technical implementation difficulty
  - 1-2: Low (simple automation)
  - 3: Medium (moderate integration)
  - 4-5: High (complex ML/multi-system)
- `agentic_potential`: How much can be automated
- `autonomy_level`: How autonomous the agent can be

**Implementation Fields**:
- `implementation_wave`: Priority (1=high, 2=medium, 3=low)
- `status`: Current stage in lifecycle

**JSONB Fields**:
- `success_metrics`: Array of metric objects
  ```json
  [
    {
      "name": "Processing Time",
      "target": "<60 seconds",
      "baseline": "120 seconds"
    }
  ]
  ```

---

#### **4. agent_categories**
```sql
CREATE TABLE agent_categories (
  code text PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text,
  color text
);
```

**Purpose**: Categorize AI agents by function

**Examples**:
- `BAG_IN`: Baggage Intake
- `TRACK`: Real-Time Tracking
- `RISK`: Risk Assessment
- `COMP`: Compensation

---

#### **5. agents**
```sql
CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  category_code text REFERENCES agent_categories(code),
  description text,
  autonomy_level int CHECK (autonomy_level >= 1 AND autonomy_level <= 5),
  workflow_count int DEFAULT 0,
  active_instances int DEFAULT 0,
  metadata jsonb,
  active boolean DEFAULT true
);
```

**Purpose**: AI agent definitions

**Metadata JSONB**:
```json
{
  "capabilities": ["scan_monitoring", "gap_detection"],
  "performance": {
    "events_per_day": 5000000,
    "accuracy": 0.97
  },
  "ml_model": {
    "name": "connection_risk_predictor",
    "version": "v2.1",
    "auc": 0.89
  }
}
```

---

#### **6. stakeholders**
```sql
CREATE TABLE stakeholders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text DEFAULT '',
  email text DEFAULT '',
  department text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
```

**Purpose**: Track people involved in workflows

---

#### **7. workflow_stakeholders**
```sql
CREATE TABLE workflow_stakeholders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES workflows(id) ON DELETE CASCADE,
  stakeholder_id uuid REFERENCES stakeholders(id) ON DELETE CASCADE,
  role_in_workflow text DEFAULT '',
  UNIQUE(workflow_id, stakeholder_id)
);
```

**Purpose**: Many-to-many junction table

---

#### **8. workflow_comments**
```sql
CREATE TABLE workflow_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES workflows(id) ON DELETE CASCADE,
  user_id uuid,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

**Purpose**: Collaboration/discussion on workflows

---

#### **9. workflow_attachments**
```sql
CREATE TABLE workflow_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES workflows(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_url text NOT NULL,
  file_type text DEFAULT '',
  uploaded_by uuid,
  created_at timestamptz DEFAULT now()
);
```

**Purpose**: Document attachments for workflows

---

### Database Views

#### **v_agent_network**
```sql
CREATE VIEW v_agent_network AS
SELECT
  a.id,
  a.code,
  a.name,
  a.category_code,
  ac.name AS category_name,
  ac.icon,
  ac.color,
  a.autonomy_level,
  a.metadata,
  a.workflow_count,
  a.active_instances
FROM agents a
LEFT JOIN agent_categories ac ON a.category_code = ac.code
WHERE a.active = true;
```

**Purpose**: Optimized view for agent network visualization

---

#### **v_agent_collaboration_edges**
```sql
CREATE VIEW v_agent_collaboration_edges AS
SELECT
  ac.id,
  ac.source_agent_id AS source_id,
  ac.target_agent_id AS target_id,
  ac.collaboration_type,
  ac.strength,
  ac.bidirectional
FROM agent_collaborations ac;
```

**Purpose**: Graph edges for agent collaboration visualization

---

### Schema Relationships

```
domains (1) ──→ (N) subdomains
   │                    │
   │                    │
   └──────→ (N) workflows ←──────┘
                 │
                 ├──→ (N) workflow_stakeholders ──→ (N) stakeholders
                 ├──→ (N) workflow_comments
                 └──→ (N) workflow_attachments

agent_categories (1) ──→ (N) agents

agents (N) ←──→ (N) agent_collaborations ──→ (N) agents
```

---

### Indexes

Performance-optimized indexes:

```sql
-- Foreign key indexes
CREATE INDEX idx_subdomains_domain_id ON subdomains(domain_id);
CREATE INDEX idx_workflows_domain_id ON workflows(domain_id);
CREATE INDEX idx_workflows_subdomain_id ON workflows(subdomain_id);

-- Filter indexes
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_workflows_wave ON workflows(implementation_wave);

-- Junction table indexes
CREATE INDEX idx_workflow_stakeholders_workflow ON workflow_stakeholders(workflow_id);
CREATE INDEX idx_workflow_stakeholders_stakeholder ON workflow_stakeholders(stakeholder_id);
CREATE INDEX idx_workflow_comments_workflow ON workflow_comments(workflow_id);
CREATE INDEX idx_workflow_attachments_workflow ON workflow_attachments(workflow_id);
```

---

### Row-Level Security (RLS)

All tables have RLS enabled with policies:

```sql
-- Example: workflows table policies
CREATE POLICY "Authenticated users can view workflows"
  ON workflows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert workflows"
  ON workflows FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update workflows"
  ON workflows FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete workflows"
  ON workflows FOR DELETE
  TO authenticated
  USING (true);
```

**Security Model**: All authenticated users can access all data (tenant isolation not implemented)

---

## Frontend Architecture

### Project Structure

```
src/
├── App.tsx                 # Root component with routing
├── main.tsx                # React entry point
│
├── components/
│   ├── layout/
│   │   ├── Layout.tsx      # Main layout wrapper
│   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   ├── Header.tsx      # Top header with breadcrumbs
│   │   └── Footer.tsx      # Footer component
│   │
│   ├── dashboard/
│   │   └── MetricCard.tsx  # Dashboard metric cards
│   │
│   ├── workflow/
│   │   └── ConfirmDialog.tsx  # Confirmation dialogs
│   │
│   ├── agents/
│   │   ├── AgentCollaborationGraph.tsx  # ReactFlow graph
│   │   ├── AgentCategoryLegend.tsx      # Category legend
│   │   ├── AgentMetrics.tsx             # Agent statistics
│   │   └── AgentList.tsx                # Agent grid view
│   │
│   ├── visualizations/
│   │   ├── KnowledgeGraph.tsx           # Force-directed graph
│   │   ├── OntologyTree.tsx             # Hierarchical tree
│   │   ├── CrossDomainSankey.tsx        # Sankey diagram
│   │   ├── SemanticMatrix.tsx           # Heatmap matrix
│   │   ├── DataLineageGraph.tsx         # Data lineage
│   │   └── DataFlowsSankey.tsx          # Flow visualization
│   │
│   └── ProtectedRoute.tsx   # Auth guard component
│
├── contexts/
│   ├── AuthContext.tsx      # Authentication state
│   ├── ThemeContext.tsx     # Dark/light theme
│   └── UIThemeContext.tsx   # UI customization
│
├── pages/
│   ├── Login.tsx            # Login/signup page
│   ├── Dashboard.tsx        # Main dashboard
│   ├── Domains.tsx          # Domain listing
│   ├── Subdomains.tsx       # Subdomain management
│   ├── Workflows.tsx        # Workflow listing
│   ├── WorkflowCreate.tsx   # Multi-step creation wizard
│   ├── WorkflowEdit.tsx     # Edit workflow
│   ├── WorkflowDetail.tsx   # Workflow details (tabbed)
│   ├── AgentNetwork.tsx     # Agent visualization
│   ├── KnowledgeGraphPage.tsx  # Knowledge graph
│   ├── OntologyTree.tsx     # Ontology visualization
│   ├── CrossDomainBridges.tsx  # Cross-domain analysis
│   ├── SemanticMatrixPage.tsx  # Semantic similarity
│   ├── DataEntities.tsx     # Data entity catalog
│   ├── DataFlows.tsx        # Data flow diagrams
│   ├── DataLineage.tsx      # Data lineage tracking
│   ├── Stakeholders.tsx     # Stakeholder management
│   ├── Settings.tsx         # User settings
│   └── DebugDashboard.tsx   # Debug information
│
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── errorLogger.ts       # Error logging utility
│
└── types/
    └── database.types.ts    # TypeScript type definitions
```

### Component Hierarchy

```
App
├── ThemeProvider
│   └── AuthProvider
│       └── UIThemeProvider
│           └── BrowserRouter
│               └── Routes
│                   ├── /login → Login (unprotected)
│                   │
│                   └── Protected Routes → ProtectedRoute → Layout
│                       ├── Sidebar (navigation)
│                       ├── Header (breadcrumbs, search, user menu)
│                       ├── Main Content (page component)
│                       └── Footer (version, links)
```

---

### Key Frontend Patterns

#### **1. Protected Routes**

```typescript
<Route
  path="/workflows"
  element={
    <ProtectedRoute>
      <Layout>
        <Workflows />
      </Layout>
    </ProtectedRoute>
  }
/>
```

**Flow**:
1. User navigates to `/workflows`
2. `ProtectedRoute` checks `AuthContext.user`
3. If null → redirect to `/login`
4. If user exists → render children

---

#### **2. Data Fetching Pattern**

**Standard useEffect Pattern**:
```typescript
const [data, setData] = useState<Type[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('table_name')
      .select('*');

    if (!error) setData(data || []);
    setLoading(false);
  };
  fetchData();
}, []);
```

**With Relations**:
```typescript
const { data, error } = await supabase
  .from('workflows')
  .select(`
    *,
    subdomain:subdomains(
      *,
      domain:domains(*)
    )
  `)
  .is('archived_at', null);
```

---

#### **3. Form Management**

**React Hook Form Pattern**:
```typescript
import { useForm } from 'react-hook-form';

const { register, handleSubmit, formState: { errors } } = useForm();

const onSubmit = async (data) => {
  const { error } = await supabase
    .from('workflows')
    .insert(data);
};

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <input {...register('name', { required: true })} />
    {errors.name && <span>Required</span>}
  </form>
);
```

---

#### **4. Multi-Step Wizard**

**WorkflowCreate.tsx Pattern**:
```typescript
const [step, setStep] = useState(1);
const [formData, setFormData] = useState({});

// Auto-save to localStorage
useEffect(() => {
  if (user) {
    localStorage.setItem(
      `workflow-draft-${user.id}`,
      JSON.stringify(formData)
    );
  }
}, [formData, user]);

// Navigate steps
const nextStep = () => setStep(step + 1);
const prevStep = () => setStep(step - 1);

// Final submit
const handleSubmit = async () => {
  await supabase.from('workflows').insert(formData);
  localStorage.removeItem(`workflow-draft-${user.id}`);
};
```

**Steps**:
1. Basic Info (name, description, subdomain)
2. Technical Details (complexity, AI enablers)
3. Governance (stakeholders, dependencies)
4. Implementation (wave, ROI, metrics)

---

## Data Flow Patterns

### Authentication Flow

```
1. App loads
   ↓
2. AuthProvider initializes
   ↓
3. auth.getSession() checks for existing session
   ↓
4a. Session exists → set user
4b. No session → user = null
   ↓
5. auth.onAuthStateChange() subscribes to changes
   ↓
6. User navigates to /workflows
   ↓
7. ProtectedRoute checks user
   ↓
8a. user exists → render page
8b. user = null → redirect to /login
```

### Data CRUD Flow

**Create Workflow**:
```
User fills form (WorkflowCreate)
   ↓
Draft saved to localStorage (auto-save)
   ↓
User clicks "Submit"
   ↓
handleSubmit() called
   ↓
supabase.from('workflows').insert(data)
   ↓
Supabase validates (RLS, constraints)
   ↓
Success → navigate to /workflows
Error → show error message
   ↓
Clear localStorage draft
```

**Read Workflows**:
```
Page component mounts (Workflows.tsx)
   ↓
useEffect hook runs
   ↓
fetchWorkflows() called
   ↓
supabase.from('workflows').select('*, subdomain:subdomains(*)')
   ↓
Response received
   ↓
setWorkflows(data)
   ↓
Component re-renders with data
   ↓
Display workflow cards/table
```

**Update Workflow**:
```
User navigates to /workflows/:id/edit
   ↓
WorkflowEdit.tsx loads
   ↓
Fetch existing workflow by ID
   ↓
Pre-populate form
   ↓
User makes changes
   ↓
handleUpdate() called
   ↓
supabase.from('workflows').update(data).eq('id', id)
   ↓
Success → navigate to /workflows/:id
```

**Delete (Soft)**:
```
User clicks "Archive"
   ↓
Confirm dialog appears
   ↓
User confirms
   ↓
supabase.from('workflows')
  .update({ archived_at: new Date() })
  .eq('id', id)
   ↓
Success → remove from UI or refresh
```

---

## Authentication & Authorization

### Supabase Auth Integration

**Setup** (`src/lib/supabase.ts`):
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Auth Methods**:
```typescript
export const auth = {
  // Sign up new user
  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  },

  // Sign in existing user
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  // Sign out
  signOut: async () => {
    return await supabase.auth.signOut();
  },

  // Get current session
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // Subscribe to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};
```

### Auth Context

**Provider** (`src/contexts/AuthContext.tsx`):
```typescript
export const AuthProvider: React.FC<{ children }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check existing session on mount
    auth.getSession().then((session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Hook**:
```typescript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
};
```

### Protected Routes

**Component** (`src/components/ProtectedRoute.tsx`):
```typescript
export const ProtectedRoute: React.FC<{ children }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

**Usage**:
```typescript
<Route
  path="/workflows"
  element={
    <ProtectedRoute>
      <Layout><Workflows /></Layout>
    </ProtectedRoute>
  }
/>
```

### Row-Level Security (RLS)

**Database Side**: All tables have RLS policies that check `auth.uid()`:

```sql
-- Only authenticated users can access
CREATE POLICY "auth_policy" ON workflows
  FOR ALL
  TO authenticated
  USING (true);
```

**Client Side**: Supabase client automatically includes auth token in requests:
```typescript
const { data } = await supabase.from('workflows').select('*');
// Token automatically included in Authorization header
// Supabase validates token and applies RLS policies
```

---

## Component Inventory

### Layout Components

#### **Layout** (`src/components/layout/Layout.tsx`)
- **Purpose**: Main application shell
- **Features**:
  - Responsive sidebar (collapsible)
  - Fixed header
  - Main content area
  - Footer
- **State**: `sidebarCollapsed` (local state)

#### **Sidebar** (`src/components/layout/Sidebar.tsx`)
- **Purpose**: Navigation menu
- **Features**:
  - Collapsible (80px collapsed, 256px expanded)
  - Active route highlighting
  - Icon + text labels
  - Grouped navigation items
- **Navigation Groups**:
  - Core: Dashboard, Domains, Workflows
  - Visualization: Agents, Knowledge Graph, Ontology
  - Analysis: Bridges, Semantic Matrix
  - Data: Entities, Flows, Lineage, Architecture
  - Collaboration: Stakeholders
  - System: Settings, Debug

#### **Header** (`src/components/layout/Header.tsx`)
- **Purpose**: Top navigation bar
- **Features**:
  - Auto-generated breadcrumbs from route
  - Search bar (placeholder)
  - Notification bell (placeholder)
  - Theme toggle (light/dark)
  - User menu with sign out

#### **Footer** (`src/components/layout/Footer.tsx`)
- **Purpose**: Bottom information bar
- **Features**:
  - Application version
  - Links (Help, Privacy, Terms)
  - Adjusts margin based on sidebar state

---

### Dashboard Components

#### **MetricCard** (`src/components/dashboard/MetricCard.tsx`)
- **Purpose**: Display key metrics
- **Props**: `title`, `value`, `icon`, `trend`, `color`
- **Features**:
  - Trend indicator (up/down arrow)
  - Color-coded borders
  - Icon display

---

### Workflow Components

#### **ConfirmDialog** (`src/components/workflow/ConfirmDialog.tsx`)
- **Purpose**: Confirmation modals for destructive actions
- **Props**: `isOpen`, `title`, `message`, `onConfirm`, `onCancel`
- **Use Cases**: Delete workflow, archive workflow

---

### Agent Components

#### **AgentCollaborationGraph** (`src/components/agents/AgentCollaborationGraph.tsx`)
- **Purpose**: Interactive agent network visualization
- **Library**: ReactFlow
- **Features**:
  - Force-directed layout
  - Color-coded nodes by category
  - Interactive dragging
  - Zoom/pan controls
  - Edge labels (collaboration type)

#### **AgentCategoryLegend** (`src/components/agents/AgentCategoryLegend.tsx`)
- **Purpose**: Color legend for agent categories
- **Features**: Category name, icon, color swatch, agent count

#### **AgentMetrics** (`src/components/agents/AgentMetrics.tsx`)
- **Purpose**: Agent statistics cards
- **Metrics**:
  - Total agents
  - Workflows covered
  - Active instances
  - Avg autonomy level

#### **AgentList** (`src/components/agents/AgentList.tsx`)
- **Purpose**: Grid view of all agents
- **Features**:
  - Category grouping
  - Workflow count
  - Active instances
  - Autonomy level badge
  - Click to view details

---

### Visualization Components

#### **KnowledgeGraph** (`src/components/visualizations/KnowledgeGraph.tsx`)
- **Purpose**: Force-directed knowledge graph
- **Library**: D3.js
- **Features**:
  - Nodes: Domains, subdomains, concepts
  - Edges: Relationships
  - Zoom/pan
  - Interactive tooltips

#### **OntologyTree** (`src/components/visualizations/OntologyTree.tsx`)
- **Purpose**: Hierarchical tree visualization
- **Library**: react-d3-tree
- **Features**:
  - Collapsible branches
  - Domain → Subdomain → Workflow hierarchy
  - Zoom/pan
  - Node click events

#### **CrossDomainSankey** (`src/components/visualizations/CrossDomainSankey.tsx`)
- **Purpose**: Cross-domain flow visualization
- **Library**: D3 Sankey
- **Features**:
  - Source → Target flows
  - Flow thickness = strength
  - Color-coded domains
  - Interactive hover

#### **SemanticMatrix** (`src/components/visualizations/SemanticMatrix.tsx`)
- **Purpose**: Semantic similarity heatmap
- **Library**: Recharts
- **Features**:
  - Domain x Domain matrix
  - Color intensity = similarity
  - Tooltip with score

#### **DataLineageGraph** (`src/components/visualizations/DataLineageGraph.tsx`)
- **Purpose**: Data flow lineage
- **Library**: ReactFlow
- **Features**:
  - Source → Transform → Target
  - Layered layout
  - Color-coded by type

#### **DataFlowsSankey** (`src/components/visualizations/DataFlowsSankey.tsx`)
- **Purpose**: Data flow volumes
- **Library**: D3 Sankey
- **Features**:
  - System integration flows
  - Volume-based thickness

---

### Page Components

#### **Dashboard** (`src/pages/Dashboard.tsx`)
- **Purpose**: Main dashboard landing page
- **Features**:
  - Metric cards (total domains, workflows, agents)
  - Wave distribution chart
  - Status breakdown pie chart
  - Recent workflows list
  - Quick action buttons

#### **Domains** (`src/pages/Domains.tsx`)
- **Purpose**: Domain listing with statistics
- **Features**:
  - Domain cards with counts
  - Color-coded borders
  - Subdomain count
  - Workflow count
  - Click to view subdomains

#### **Subdomains** (`src/pages/Subdomains.tsx`)
- **Purpose**: Subdomain CRUD interface
- **Features**:
  - Create new subdomain
  - Edit existing
  - Delete
  - Filter by domain
  - Workflow count per subdomain

#### **Workflows** (`src/pages/Workflows.tsx`)
- **Purpose**: Workflow listing with filters
- **Features**:
  - Card view / Table view toggle
  - Search by name
  - Filter by:
    - Status
    - Implementation wave
    - Complexity
    - Domain/subdomain
  - Sort by various fields
  - Archive/unarchive
  - Quick edit

#### **WorkflowCreate** (`src/pages/WorkflowCreate.tsx`)
- **Purpose**: Multi-step workflow creation wizard
- **Steps**:
  1. Basic Info: name, description, subdomain
  2. Technical: complexity, AI enablers, systems
  3. Governance: stakeholders, dependencies
  4. Implementation: wave, ROI, success metrics
- **Features**:
  - Auto-save to localStorage
  - Step validation
  - Progress indicator
  - Cancel with confirmation

#### **WorkflowEdit** (`src/pages/WorkflowEdit.tsx`)
- **Purpose**: Edit existing workflow
- **Features**: Same as WorkflowCreate but pre-populated

#### **WorkflowDetail** (`src/pages/WorkflowDetail.tsx`)
- **Purpose**: Comprehensive workflow view
- **Tabs**:
  - Overview: Basic info, scores, status
  - Technical: AI enablers, systems, complexity
  - Implementation: Wave, ROI, metrics
  - Collaboration: Stakeholders, comments, attachments
- **Actions**: Edit, Archive, Clone

#### **AgentNetwork** (`src/pages/AgentNetwork.tsx`)
- **Purpose**: Agent visualization and exploration
- **Views**:
  - Collaboration graph (ReactFlow)
  - Category breakdown
  - Agent metrics
  - Agent list
- **Features**:
  - Toggle between views
  - Filter by category
  - Search agents
  - Click agent for details

---

## Routing System

### Route Configuration

**All routes defined in** `src/App.tsx`:

```typescript
<BrowserRouter>
  <Routes>
    {/* Public Route */}
    <Route path="/login" element={<Login />} />

    {/* Protected Routes */}
    <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
    <Route path="/domains" element={<ProtectedRoute><Layout><Domains /></Layout></ProtectedRoute>} />
    <Route path="/subdomains" element={<ProtectedRoute><Layout><Subdomains /></Layout></ProtectedRoute>} />

    {/* Workflows */}
    <Route path="/workflows" element={<ProtectedRoute><Layout><Workflows /></Layout></ProtectedRoute>} />
    <Route path="/workflows/new" element={<ProtectedRoute><Layout><WorkflowCreate /></Layout></ProtectedRoute>} />
    <Route path="/workflows/:id" element={<ProtectedRoute><Layout><WorkflowDetail /></Layout></ProtectedRoute>} />
    <Route path="/workflows/:id/edit" element={<ProtectedRoute><Layout><WorkflowEdit /></Layout></ProtectedRoute>} />

    {/* Visualization */}
    <Route path="/agents" element={<ProtectedRoute><Layout><AgentNetwork /></Layout></ProtectedRoute>} />
    <Route path="/knowledge-graph" element={<ProtectedRoute><Layout><KnowledgeGraphPage /></Layout></ProtectedRoute>} />
    <Route path="/ontology" element={<ProtectedRoute><Layout><OntologyTree /></Layout></ProtectedRoute>} />
    <Route path="/bridges" element={<ProtectedRoute><Layout><CrossDomainBridges /></Layout></ProtectedRoute>} />
    <Route path="/semantic-matrix" element={<ProtectedRoute><Layout><SemanticMatrixPage /></Layout></ProtectedRoute>} />

    {/* Data */}
    <Route path="/data/entities" element={<ProtectedRoute><Layout><DataEntities /></Layout></ProtectedRoute>} />
    <Route path="/data/flows" element={<ProtectedRoute><Layout><DataFlows /></Layout></ProtectedRoute>} />
    <Route path="/data/lineage" element={<ProtectedRoute><Layout><DataLineage /></Layout></ProtectedRoute>} />
    <Route path="/data/architecture" element={<ProtectedRoute><Layout><DataArchitectureLayers /></Layout></ProtectedRoute>} />

    {/* System */}
    <Route path="/stakeholders" element={<ProtectedRoute><Layout><Stakeholders /></Layout></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
    <Route path="/debug" element={<ProtectedRoute><Layout><DebugDashboard /></Layout></ProtectedRoute>} />

    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
</BrowserRouter>
```

### Route Patterns

| Pattern | Example | Purpose |
|---------|---------|---------|
| `/resource` | `/workflows` | List view |
| `/resource/new` | `/workflows/new` | Create new |
| `/resource/:id` | `/workflows/abc-123` | Detail view |
| `/resource/:id/edit` | `/workflows/abc-123/edit` | Edit form |
| `/category/resource` | `/data/entities` | Grouped resources |

### Navigation

**Programmatic Navigation**:
```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Navigate to workflows
navigate('/workflows');

// Navigate with state
navigate('/workflows/new', { state: { preselectedDomain: 'xyz' } });

// Navigate back
navigate(-1);
```

**Link Components**:
```typescript
import { Link } from 'react-router-dom';

<Link to="/workflows/123">View Workflow</Link>
```

---

## State Management

### Global State (React Context)

#### **1. AuthContext**
- **Location**: `src/contexts/AuthContext.tsx`
- **State**:
  - `user: User | null` - Current authenticated user
  - `loading: boolean` - Auth initialization state
- **Actions**:
  - `signIn(email, password)` - Sign in user
  - `signUp(email, password)` - Sign up new user
  - `signOut()` - Sign out current user
- **Usage**: `const { user, loading, signIn } = useAuth();`

#### **2. ThemeContext**
- **Location**: `src/contexts/ThemeContext.tsx`
- **State**:
  - `theme: 'light' | 'dark'` - Current theme
- **Actions**:
  - `toggleTheme()` - Switch theme
- **Persistence**: localStorage (`theme` key)
- **Effect**: Toggles `dark` class on root element
- **Usage**: `const { theme, toggleTheme } = useTheme();`

#### **3. UIThemeContext**
- **Location**: `src/contexts/UIThemeContext.tsx`
- **State**: UI customization preferences
- **Scope**: Extended theme settings beyond light/dark

---

### Local Component State

**useState Pattern**:
```typescript
// Data loading
const [workflows, setWorkflows] = useState<Workflow[]>([]);
const [loading, setLoading] = useState(true);

// Filters
const [searchTerm, setSearchTerm] = useState('');
const [statusFilter, setStatusFilter] = useState<string[]>([]);

// UI state
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState<Item | null>(null);
```

---

### Form State (react-hook-form)

**Multi-Step Form**:
```typescript
const { register, handleSubmit, watch, setValue, formState } = useForm();

// Watch for changes
const currentStep = watch('step');

// Set values programmatically
setValue('name', 'New Workflow');

// Handle submission
const onSubmit = (data) => {
  // Process form data
};
```

---

### LocalStorage Patterns

**Auto-Save Draft**:
```typescript
useEffect(() => {
  if (user && formData) {
    localStorage.setItem(
      `workflow-draft-${user.id}`,
      JSON.stringify(formData)
    );
  }
}, [formData, user]);

// Load draft on mount
useEffect(() => {
  if (user) {
    const draft = localStorage.getItem(`workflow-draft-${user.id}`);
    if (draft) {
      setFormData(JSON.parse(draft));
    }
  }
}, [user]);

// Clear on submit
const handleSubmit = async () => {
  await saveWorkflow();
  localStorage.removeItem(`workflow-draft-${user.id}`);
};
```

**Theme Persistence**:
```typescript
// Save theme
localStorage.setItem('theme', theme);

// Load theme
const savedTheme = localStorage.getItem('theme') || 'light';
```

---

## Styling & Theming

### Tailwind CSS

**Configuration** (`tailwind.config.js`):
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Toggled via class on root element
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### Dark Mode Implementation

**Theme Toggle Flow**:
```
User clicks theme toggle
   ↓
toggleTheme() called
   ↓
Update theme state: 'light' → 'dark'
   ↓
Update localStorage: theme = 'dark'
   ↓
Effect runs: document.documentElement.classList.add('dark')
   ↓
Tailwind applies all dark: variants
```

**CSS Classes**:
```typescript
// Light mode
className="bg-white text-gray-900"

// Dark mode
className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
```

### Color Palette

**Primary Colors**:
- Pink: `#ec4899` (pink-600) - Primary brand color
- Blue: `#3b82f6` (blue-600) - Info/links
- Green: `#10b981` (green-600) - Success
- Red: `#ef4444` (red-600) - Error
- Amber: `#f59e0b` (amber-600) - Warning

**Grays**:
- Light mode: gray-50 to gray-900
- Dark mode: gray-950 to gray-50 (inverted)

**Usage Examples**:
```typescript
// Buttons
className="bg-pink-600 hover:bg-pink-700 text-white"

// Cards
className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"

// Text
className="text-gray-900 dark:text-white"

// Backgrounds
className="bg-gray-50 dark:bg-gray-950"
```

### Responsive Design

**Breakpoints** (Tailwind defaults):
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Responsive Patterns**:
```typescript
// Grid layout
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

// Hidden on mobile
className="hidden md:block"

// Flex direction change
className="flex flex-col md:flex-row"

// Sidebar width
className="w-64 lg:w-80"
```

### Component Styling Patterns

**Card Pattern**:
```typescript
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
  {/* Content */}
</div>
```

**Button Pattern**:
```typescript
// Primary
className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"

// Secondary
className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"

// Danger
className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
```

**Input Pattern**:
```typescript
<input className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
```

---

## Build & Deployment

### Build Configuration (Vite)

**vite.config.ts**:
```typescript
export default defineConfig({
  plugins: [react()],

  base: '/', // Deployment base path

  build: {
    outDir: 'dist',
    sourcemap: false,

    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'd3-vendor': ['d3'],
          'ui-vendor': ['lucide-react', 'reactflow'],
        },
      },
    },

    chunkSizeWarningLimit: 1000,
  },

  server: {
    port: 5173,
  },

  preview: {
    port: 4173,
  },
});
```

### Scripts

**package.json scripts**:
```json
{
  "dev": "vite",                    // Development server
  "build": "vite build",            // Production build
  "preview": "vite preview",        // Preview build locally
  "typecheck": "tsc --noEmit -p tsconfig.app.json",
  "lint": "eslint .",
  "docs:dev": "vitepress dev",
  "docs:build": "vitepress build"
}
```

### Environment Variables

**Required** (`.env.local`):
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Important**:
- All client-side env vars must be prefixed with `VITE_`
- Never commit `.env.local` (in `.gitignore`)
- Set in deployment platform (Vercel, Netlify, etc.)

### Deployment (GitHub Pages)

**GitHub Actions** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main, master]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**Build Output**:
- `dist/` directory contains static files
- `dist/index.html` - Entry point
- `dist/assets/` - JS/CSS bundles
- `.nojekyll` file prevents Jekyll processing

---

## Key Features

### 1. Domain Management

**Purpose**: Organize airline operations into high-level domains

**Features**:
- Create/edit/delete domains
- View subdomain count per domain
- View workflow count per domain
- Color-coded domain cards
- Domain statistics

**Example Domains**:
- Baggage Operations & Tracking
- Flight Operations
- Revenue Management
- Customer Service
- Network Planning

---

### 2. Workflow Cataloging

**Purpose**: Catalog automation opportunities with detailed metadata

**Features**:
- Multi-step creation wizard
- Rich metadata (complexity, ROI, dependencies)
- Implementation wave assignment (1, 2, 3)
- Status tracking (draft → planned → in-progress → completed)
- Search and filter
- Card/table view toggle
- Soft delete (archiving)

**Workflow Attributes**:
- Basic: name, description, subdomain
- Scoring: complexity (1-5), agentic_potential (1-5), autonomy_level (1-5)
- Implementation: wave, status, airline_type
- Technical: AI enablers, systems involved
- Business: ROI, success metrics, dependencies

---

### 3. Agent Network Visualization

**Purpose**: Visualize AI agent ecosystem and collaborations

**Features**:
- Interactive network graph (ReactFlow)
- Color-coded by category
- Node size by workflow count
- Edge thickness by collaboration strength
- Category legend
- Agent metrics dashboard
- Agent list view

**Agent Categories**:
- Baggage Intake
- Load Planning
- Real-Time Tracking
- Risk Assessment
- Exception Management
- Lost & Found
- Compensation
- Interline Coordination

---

### 4. Knowledge Graph

**Purpose**: Visualize semantic relationships between domains/concepts

**Features**:
- Force-directed graph layout
- Node types: domains, subdomains, concepts
- Edge types: related_to, depends_on, enables
- Interactive zoom/pan
- Node click for details
- Semantic similarity calculations

---

### 5. Ontology Tree

**Purpose**: Hierarchical view of domain structure

**Features**:
- Collapsible tree branches
- Domain → Subdomain → Workflow hierarchy
- Node counts at each level
- Search/filter
- Export to JSON

---

### 6. Cross-Domain Bridges

**Purpose**: Identify connections between domains

**Features**:
- Sankey diagram visualization
- Shared workflows
- Common stakeholders
- Data flow connections
- Strength metrics

---

### 7. Semantic Similarity Matrix

**Purpose**: Analyze domain similarity

**Features**:
- Heatmap visualization
- Domain x Domain matrix
- Similarity scores (0-1)
- Click cell for details
- Export to CSV

---

### 8. Data Entity Catalog

**Purpose**: Track data entities across systems

**Features**:
- Entity listing
- Attributes and relationships
- System mapping
- Lineage tracking

---

### 9. Data Flow Diagrams

**Purpose**: Visualize data movement between systems

**Features**:
- Sankey diagrams
- Source → Transform → Target
- Volume indicators
- System integration mapping

---

### 10. Data Lineage

**Purpose**: Track data transformation paths

**Features**:
- Graph-based lineage
- Impact analysis
- Dependency tracking
- Column-level lineage

---

## Extension Points

### Easy Extensibility Areas

#### 1. Add New Domain

**Steps**:
1. Insert into `domains` table:
   ```sql
   INSERT INTO domains (name, description)
   VALUES ('New Domain', 'Description...');
   ```
2. Add subdomains:
   ```sql
   INSERT INTO subdomains (domain_id, name, description)
   VALUES ('domain-id', 'Subdomain 1', 'Description...');
   ```
3. Create workflows linked to subdomains
4. Appears automatically in UI

---

#### 2. Add New Visualization

**Steps**:
1. Create component in `src/components/visualizations/`
2. Choose library (D3, Recharts, ReactFlow)
3. Create page in `src/pages/`
4. Add route in `App.tsx`
5. Add nav link in `Sidebar.tsx`

**Example**:
```typescript
// src/components/visualizations/CustomChart.tsx
export const CustomChart: React.FC = () => {
  return <div>Chart implementation</div>;
};

// src/pages/CustomChartPage.tsx
export const CustomChartPage: React.FC = () => {
  return <CustomChart />;
};

// App.tsx
<Route path="/custom-chart" element={
  <ProtectedRoute>
    <Layout><CustomChartPage /></Layout>
  </ProtectedRoute>
} />
```

---

#### 3. Add New Agent Category

**Steps**:
1. Insert into `agent_categories`:
   ```sql
   INSERT INTO agent_categories (code, name, description, icon, color)
   VALUES ('NEW_CAT', 'New Category', 'Description...', '🔧', '#6366f1');
   ```
2. Add agents with `category_code = 'NEW_CAT'`
3. Appears in agent network automatically

---

#### 4. Add Workflow Metadata Field

**Steps**:
1. Add column to `workflows` table:
   ```sql
   ALTER TABLE workflows ADD COLUMN new_field text;
   ```
2. Update TypeScript interface in `database.types.ts`:
   ```typescript
   export interface Workflow {
     // ...existing fields
     new_field: string;
   }
   ```
3. Add to create/edit forms
4. Display in detail view

---

#### 5. Add Collaboration Features

**Already scaffolded**:
- Comments (`workflow_comments` table exists)
- Attachments (`workflow_attachments` table exists)
- Stakeholders (`workflow_stakeholders` table exists)

**To implement**:
1. Build comment UI component
2. Add file upload to Supabase Storage
3. Wire up to WorkflowDetail tabs

---

### Medium Complexity Extensions

#### 1. Add Real-Time Collaboration

**Supabase Realtime**:
```typescript
const channel = supabase
  .channel('workflow-123')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'workflows',
    filter: 'id=eq.123'
  }, (payload) => {
    // Update UI when workflow changes
    setWorkflow(payload.new);
  })
  .subscribe();
```

---

#### 2. Add Export Functionality

**Export to CSV**:
```typescript
const exportToCSV = (data: Workflow[]) => {
  const csv = data.map(w => ({
    Name: w.name,
    Status: w.status,
    Wave: w.implementation_wave,
    Complexity: w.complexity
  }));

  // Use library like `papaparse`
  const csvString = Papa.unparse(csv);
  downloadFile(csvString, 'workflows.csv');
};
```

---

#### 3. Add Advanced Filtering

**Multi-select filters**:
```typescript
const [filters, setFilters] = useState({
  status: [],
  wave: [],
  complexity: [1, 5],
  domains: []
});

const filteredWorkflows = workflows.filter(w => {
  if (filters.status.length && !filters.status.includes(w.status)) return false;
  if (filters.wave.length && !filters.wave.includes(w.implementation_wave)) return false;
  if (w.complexity < filters.complexity[0] || w.complexity > filters.complexity[1]) return false;
  return true;
});
```

---

### Advanced Extensions

#### 1. Multi-Tenancy

**Add Organization Support**:
```sql
-- Add org_id to all tables
ALTER TABLE workflows ADD COLUMN org_id uuid REFERENCES organizations(id);

-- Update RLS policies
CREATE POLICY "Users see own org workflows"
  ON workflows FOR SELECT
  TO authenticated
  USING (org_id = (SELECT org_id FROM users WHERE id = auth.uid()));
```

---

#### 2. Version Control for Workflows

**Use existing `parent_workflow_id`**:
```typescript
// Clone workflow
const cloneWorkflow = async (originalId: string) => {
  const { data: original } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', originalId)
    .single();

  const { data: clone } = await supabase
    .from('workflows')
    .insert({
      ...original,
      id: undefined, // Auto-generate new ID
      parent_workflow_id: originalId,
      version: original.version + 1,
      name: `${original.name} (Copy)`
    });
};
```

---

#### 3. AI-Powered Features

**Similarity Search**:
```typescript
// Use Supabase Vector extension
const findSimilarWorkflows = async (workflowId: string) => {
  const { data } = await supabase.rpc('match_workflows', {
    query_workflow_id: workflowId,
    match_threshold: 0.7,
    match_count: 10
  });
  return data;
};
```

**Auto-Categorization**:
- Use OpenAI API to analyze workflow description
- Suggest domain/subdomain placement
- Recommend complexity/potential scores

---

## Technical Decisions

### Why This Stack?

#### **React + TypeScript**
- **Type Safety**: Catch errors at compile time
- **IDE Support**: Excellent autocomplete and refactoring
- **Component Model**: Reusable, composable UI
- **Ecosystem**: Massive library ecosystem

#### **Vite (vs Create React App)**
- **Speed**: 10-100x faster dev server
- **Modern**: ES modules, hot module replacement
- **Simple**: Zero-config for most use cases
- **Build**: Optimized production bundles

#### **Supabase (vs Custom Backend)**
- **Speed**: No backend code to write
- **Auth**: Built-in authentication
- **Real-time**: WebSocket support out-of-box
- **Security**: Row-Level Security at database level
- **Cost**: Generous free tier

#### **Tailwind CSS (vs Material-UI/Chakra)**
- **Customization**: Complete design freedom
- **Performance**: No runtime CSS-in-JS
- **Dark Mode**: Built-in support
- **File Size**: Purges unused styles
- **Learning Curve**: Utility classes faster than CSS

#### **React Router v7 (vs other routers)**
- **Standard**: Industry standard for React
- **Features**: Nested routes, code splitting
- **TypeScript**: Full type support
- **Data Loading**: Built-in data loading patterns

### Why Direct Database Access?

**Traditional Stack**:
```
React → REST API → Database
```

**This Stack**:
```
React → Supabase Client → Database (with RLS)
```

**Benefits**:
- ✅ Faster development (no API to build)
- ✅ Fewer bugs (less code)
- ✅ Auto-generated types
- ✅ Real-time out-of-box
- ✅ Security at database level

**Trade-offs**:
- ❌ Less control over business logic
- ❌ Harder to add complex validations
- ❌ Database schema exposed to client
- ❌ Limited middleware options

**When to add backend**:
- Complex business logic
- Third-party API integrations
- Heavy data processing
- Advanced security requirements

---

## Summary

This application is a **comprehensive airline workflow management system** built with modern web technologies. It demonstrates:

1. **Full-stack TypeScript** development
2. **Serverless architecture** via Supabase
3. **Advanced visualizations** (D3, ReactFlow)
4. **Real-world data modeling** (domains, workflows, agents)
5. **Production-ready patterns** (auth, theming, routing)

**Key Strengths**:
- Fast development cycle
- Type-safe end-to-end
- Rich visualizations
- Extensible architecture
- Well-documented codebase

**Ideal for**:
- Understanding modern React patterns
- Learning Supabase integration
- Building data-heavy dashboards
- Prototyping enterprise applications
- Teaching full-stack development

---

## For LLMs: Reimagination Guide

If you're an LLM tasked with reimagining this application, consider:

### Alternative Tech Stacks

**Backend-Heavy**:
- Replace Supabase → PostgreSQL + Node.js/Express + GraphQL
- Add Redis for caching
- Implement job queues (Bull, BullMQ)
- More control over business logic

**Modern Full-Stack**:
- Replace React → Next.js 14 (App Router)
- Replace Supabase → Prisma + tRPC
- Server-side rendering
- Edge functions

**Enterprise**:
- Replace React → Angular
- Add microservices architecture
- Implement event sourcing
- Add message queues (RabbitMQ/Kafka)

### Alternative Architectures

**Multi-Tenant SaaS**:
- Add organization/workspace concept
- Implement subscription tiers
- Add billing (Stripe)
- Add admin dashboard

**Offline-First**:
- Add service workers
- Implement IndexedDB caching
- Sync queues for offline edits
- Conflict resolution

**Real-Time Collaboration**:
- Add WebSocket server
- Implement CRDT for concurrent editing
- Presence indicators
- Live cursors

### Alternative Data Models

**Graph Database** (Neo4j):
- Workflows as nodes
- Relationships as edges
- Complex graph queries
- Better for deep relationships

**Event Sourcing**:
- Workflows as event streams
- Audit trail built-in
- Time travel debugging
- Replay capabilities

**Document Database** (MongoDB):
- Flexible schemas
- Embedded documents
- Faster reads
- Denormalized data

---

## Appendix: File Locations

### Core Configuration
- `package.json` - Dependencies
- `vite.config.ts` - Build config
- `tsconfig.json` - TypeScript config
- `tailwind.config.js` - Styling config
- `.github/workflows/deploy.yml` - CI/CD

### Database
- `supabase/migrations/*.sql` - Schema migrations
- `src/types/database.types.ts` - TypeScript types
- `src/lib/supabase.ts` - Supabase client

### Frontend
- `src/App.tsx` - Root component
- `src/main.tsx` - Entry point
- `src/contexts/` - Global state
- `src/components/` - Reusable components
- `src/pages/` - Page components

### Documentation
- `README.md` - Quick start
- `CLAUDE.md` - AI assistant guide
- `COMPREHENSIVE_SYSTEM_DOCUMENTATION.md` - This file
- `docs/` - VitePress documentation

---

**End of Documentation**
