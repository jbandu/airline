# AirFlow - Airline Operations Intelligence Platform

## Quick Context Summary

### What is AirFlow?
Enterprise platform for understanding, analyzing, and optimizing airline operations with AI-powered insights. Think of it as a "digital twin" of an airline's entire operational structure and knowledge network.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Visualizations**: D3.js, Recharts, ReactFlow
- **Deployment**: Vercel (auto-deploys from GitHub)
- **Database**: PostgreSQL on Supabase

---

## Data Model (Core Entities)

### 1. Domains (22 total)
Major airline business areas with emoji icons:
- ✈️ Network Planning & Strategy
- 💰 Commercial & Distribution
- 📊 Revenue Management
- 🎧 Customer Experience & Servicing
- 🛫 Flight Operations
- 👥 Crew Management
- 🔧 MRO / Engineering
- 🚛 Ground Operations
- 🏢 Airport & Station Management
- ...and 13 more

**Table**: `domains` (id, name, description, icon_url, created_at)

### 2. Subdomains (~400)
Specific functional areas within each domain
- Example: Flight Operations → Flight Planning, Dispatch, Flight Monitoring, Load Control, etc.

**Table**: `subdomains` (id, name, description, domain_id, created_at)

### 3. Workflows (~150)
Business processes within subdomains
- Example: "Automated Rebooking for Disruptions", "Dynamic Pricing Engine", "Crew Scheduling"
- Fields: complexity (1-5), agentic_potential (1-5), status (draft/in_progress/approved), wave (1-3)

**Table**: `workflows` (id, name, description, subdomain_id, complexity, agentic_potential, autonomy_level, implementation_wave, status, current_version_id, created_by, created_at, archived_at)

### 4. AI Agents (12)
Intelligent agents automating workflows across 6 categories:

**Categories**:
- 🎯 Decisioning & Optimization (Dynamic Pricing Agent, Schedule Optimizer, Route Optimizer)
- 🔮 Predictive & Forecasting (Demand Forecaster, Predictive Maintenance)
- 💬 Conversational AI (Customer Support Bot)
- ⚡ Process Automation (Check-in Automation, Crew Scheduler, Fuel Optimizer)
- 👁️ Monitoring & Alerts (Baggage Tracker, Fraud Detector)
- 📊 Data Processing (Sentiment Analyzer)

**Tables**:
- `agent_categories` (id, code, name, description, icon, color)
- `agents` (id, code, name, category_code, description, autonomy_level, workflow_count, active_instances, metadata, active)
- `agent_collaborations` (id, source_agent_id, target_agent_id, collaboration_type, strength, bidirectional)

**Total**: 15 agent collaborations mapping how agents work together

### 5. Cross-Domain Linkages (449 total)
Connections showing how workflows span multiple domains

**Types**:
- `data_sharing`: One domain provides data to another
- `process_handoff`: Process flows from one domain to another
- `coordination`: Domains must coordinate activities
- `decision_dependency`: Decisions in one domain affect another
- `resource_sharing`: Shared resources/infrastructure

**Strength**: 1-5 scale (5 = critical dependency)

**Table**: `cross_domain_linkages` (id, workflow_id, linked_domain_id, linkage_type, linkage_strength, description)

**Example**: "Automated Rebooking for Disruptions" workflow has 5 cross-domain linkages:
- Commercial & Distribution → Flight Operations (process_handoff, strength: 5)
- Commercial & Distribution → Customer Service (process_handoff, strength: 5)
- Commercial & Distribution → Revenue Management (process_handoff, strength: 5)
- Commercial & Distribution → Crew Management (coordination, strength: 5)
- Commercial & Distribution → Ground Operations (coordination, strength: 5)

---

## Key Database Views

### Knowledge & Analysis Views
1. **v_agent_network**: All active agents with their categories and metrics (12 agents)
2. **v_agent_collaboration_edges**: Agent-to-agent relationships (15 collaborations)
3. **v_cross_domain_bridges**: Workflows connecting multiple domains (63 workflows with 449 linkages)
4. **v_ontology_tree**: Hierarchical structure of all business concepts (413 nodes)
5. **knowledge_graph_edges**: Network relationships between entities (629 edges)

### Bridge Statistics by Domain
- Data, Analytics & Innovation: 105 bridges
- IT & Digital Platforms: 100 bridges
- Network Planning & Strategy: 66 bridges
- Loyalty & Personalization: 50 bridges
- MRO / Engineering: 44 bridges

---

## Application Structure

### Navigation (Redesigned)

```
📊 Dashboard - Overview with key metrics

AIRLINE STRUCTURE
├─ 📁 Domains (22) - Business domain catalog with emoji icons
├─ 📋 Workflows (~150) - Process catalog with filters
└─ 🤖 Agents (12) - AI agent network with collaboration graph

KNOWLEDGE VIEWS
├─ 🌐 Knowledge Graph - Network visualization (629 relationships)
├─ 🌳 Ontology Tree - Hierarchical taxonomy (413 nodes)
├─ 🌉 Cross-Domain Bridges - Sankey diagram (63 workflows, 449 linkages)
└─ 📐 Semantic Matrix - Workflow similarity analysis

👥 Stakeholders (Placeholder)
⚙️  Settings (Placeholder)
```

### Page Descriptions

#### Dashboard
- Key metrics: Total workflows, quick wins, avg agentic potential, implementation progress
- Charts: Domain distribution, wave distribution, status breakdown, potential trends
- Recent activity feed

#### Domains
- Grid of 22 domains with emoji icons
- Each shows: Icon, name, description, subdomain count, workflow count
- Click to see subdomain details and linked workflows

#### Workflows
- Filterable list (by wave, status, complexity)
- Card/table view toggle
- Create new workflow wizard (4 steps)
- Detail view with tabs (Overview, Technical, Implementation, Collaboration)

#### Agents
- Interactive D3 force-directed graph showing 12 agents
- Agent collaboration network with 15 edges
- Agent categories legend
- Detailed agent metrics (workflows, instances, autonomy level)
- Toggle between collaboration view and category view

#### Knowledge Graph
- D3 network visualization of 629 relationships
- Filter by entity type (workflows, domains, stakeholders)
- Search and zoom functionality
- Click nodes for details

#### Ontology Tree
- Hierarchical tree of 413 business concepts
- Collapsible branches
- Domain → Subdomain → Workflow → Components hierarchy

#### Cross-Domain Bridges
- Sankey diagram showing top 30 domain flows
- List of top 20 bridging workflows
- Domain statistics (workflow count, bridge count)
- Shows workflow connections across domains

#### Semantic Matrix
- Heatmap showing workflow similarity
- Based on shared stakeholders, tags, or concepts
- Filter by domain and similarity threshold

---

## Current Visual Design

### Login Page ✅ (Palantir-inspired)
- Dark gradient background (slate-950 → blue-950)
- Animated gradient orbs (blob effects)
- Grid pattern overlay
- Glassmorphic login form with backdrop blur
- Feature showcase with 7 key capabilities
- Statistics display (22 domains, 600+ relationships, 12 AI agents)

### Main App (Standard - Needs Enhancement)
- Basic light/dark mode toggle
- Standard Tailwind components
- Not yet fully Palantir-themed

---

## File Structure

```
src/
├── pages/
│   ├── Login.tsx              # ✅ Palantir-themed
│   ├── Dashboard.tsx          # ⏳ Needs redesign
│   ├── Domains.tsx
│   ├── Workflows.tsx
│   ├── WorkflowCreate.tsx
│   ├── WorkflowEdit.tsx
│   ├── WorkflowDetail.tsx
│   ├── AgentNetwork.tsx
│   ├── KnowledgeGraphPage.tsx
│   ├── OntologyTree.tsx
│   ├── CrossDomainBridges.tsx
│   ├── SemanticMatrixPage.tsx
│   ├── Stakeholders.tsx
│   └── Settings.tsx
│
├── components/
│   ├── layout/
│   │   ├── Layout.tsx         # Main wrapper
│   │   ├── Sidebar.tsx        # Navigation with sections
│   │   ├── Header.tsx         # Breadcrumbs, search, theme toggle
│   │   └── Footer.tsx
│   ├── dashboard/
│   │   └── MetricCard.tsx
│   ├── agents/
│   │   ├── AgentCollaborationGraph.tsx  # D3 force graph
│   │   ├── AgentCategoryLegend.tsx
│   │   ├── AgentMetrics.tsx
│   │   └── AgentList.tsx
│   └── visualizations/
│       ├── KnowledgeGraph.tsx           # D3 network
│       ├── CrossDomainSankey.tsx        # D3 Sankey
│       ├── SemanticMatrix.tsx           # Heatmap
│       └── KnowledgeTimeline.tsx
│
├── contexts/
│   ├── AuthContext.tsx        # Supabase auth
│   └── ThemeContext.tsx       # Dark mode toggle
│
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── errorLogger.ts        # Error logging
│   └── dataValidator.ts      # Data validation
│
└── types/
    └── database.types.ts      # TypeScript interfaces
```

---

## Environment & Deployment

### Environment Variables
```
VITE_SUPABASE_URL=https://jhhihlkjnicktyvycmig.supabase.co
VITE_SUPABASE_ANON_KEY=[key]
```

### Database Connection
```
postgresql://postgres:Memphis123$1@1@@db.jhhihlkjnicktyvycmig.supabase.co:5432/postgres
```

### Deployment
- **GitHub**: https://github.com/jbandu/airline
- **Vercel**: https://airline-git-main-jayaprakash-bandus-projects.vercel.app
- **Auto-deploy**: Pushes to `main` branch trigger automatic deployment (~2-3 min)

---

## Key Statistics

- **22** Business Domains
- **~400** Subdomains
- **~150** Workflows
- **12** AI Agents (with 15 collaborations)
- **449** Cross-domain linkages
- **63** Workflows with cross-domain connections
- **629** Knowledge graph edges
- **413** Ontology tree nodes

---

## Recent Major Updates

1. ✅ Redesigned navigation with AIRLINE STRUCTURE and KNOWLEDGE VIEWS sections
2. ✅ Created stunning Palantir-inspired login page
3. ✅ Added emoji icons to all 22 domains
4. ✅ Built agent network with 12 AI agents and collaboration graph
5. ✅ Populated cross-domain bridges with 449 real linkages
6. ✅ Removed Analytics page in favor of specific knowledge views
7. ✅ Added global animations and Palantir theme utilities
8. ⏳ Dashboard redesign in progress

---

## Use This Context When Asking Claude

Example prompts:
- "Using the AirFlow context, how should I add a new workflow?"
- "Looking at the cross-domain linkages data model, can you help me..."
- "Based on the agent collaboration structure, I want to..."
- "Considering the Palantir theme we have on login, let's apply it to..."

---

*Last Updated: 2025-11-08*
