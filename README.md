# AirFlow - Airline Workflow Management Platform

A sophisticated airline workflow management and agentic AI transformation opportunity tracking platform. AirFlow enables organizations to catalog, analyze, prioritize, and implement workflow automation opportunities across airline operations using AI agents.

## Overview

**AirFlow** empowers airline operations teams to systematically identify and implement AI-driven workflow transformations. The platform provides comprehensive tools for:

- **Cataloging AI Opportunities** - Document and organize workflow automation opportunities across the organization
- **Assessing Transformation Potential** - Score workflows on complexity, agentic potential, autonomy level, and implementation difficulty
- **Prioritizing Implementation** - Organize opportunities into implementation waves (Quick Wins, Medium Priority, Long Term)
- **Tracking Progress** - Monitor workflow status from draft to completion
- **Collaboration** - Enable stakeholder involvement in workflow planning
- **Analytics & Visualization** - Rich dashboards showing portfolio metrics, domain distributions, and cross-domain opportunities

## Key Features

### Core Functionality

#### Workflow Management
- **CRUD Operations** - Create, read, update, and delete workflows with soft-delete archiving
- **Multi-Step Wizard** - 4-step workflow creation process with auto-save drafts
- **Rich Metadata** - Track complexity, agentic potential, autonomy level, implementation wave
- **Status Tracking** - Draft, planned, in-progress, completed, archived states
- **Cloning** - Duplicate workflows to accelerate similar opportunity creation
- **Search & Filter** - Full-text search with filtering by wave, status, complexity, domain
- **Multiple Views** - Card view (visual metrics) and table view (spreadsheet format)

#### Domain & Subdomain Organization
- **Hierarchical Taxonomy** - Organize workflows by domains (Flight Ops, Revenue Mgmt, etc.) and subdomains
- **Domain Catalog** - Browse all domains with workflow counts and subdomain trees
- **Subdomain Management** - Multiple view modes (grid, list, table, timeline)
- **Cross-Domain Analysis** - Identify workflows spanning multiple operational areas

#### Analytics & Insights
- **Portfolio Dashboard** - Total workflows, quick wins, average potential, implementation progress
- **Visualizations** - Scatter plots, bar charts, pie charts, heatmaps, Sankey diagrams
- **Domain Distribution** - See workflow concentration across business areas
- **Implementation Waves** - Track Wave 1 (Quick Wins), Wave 2 (Medium), Wave 3 (Long Term)
- **Complexity vs Potential** - Identify high-value, low-complexity opportunities
- **Top Workflows Leaderboard** - Rank workflows by agentic potential

#### Agent Network & Performance
- **Agent Catalog** - View all AI agents with categories, capabilities, autonomy levels
- **Collaboration Graph** - Visualize agent-to-agent collaboration networks
- **Performance Monitoring** - Track execution metrics, success rates, durations
- **Execution History** - Monitor agent activity with real-time auto-refresh

#### Knowledge Structures
- **Ontology Tree** - Hierarchical visualization of domains → subdomains → workflows
- **Knowledge Graph** - Network visualization showing workflow relationships
- **Semantic Matrix** - Similarity heatmap based on shared AI enablers and systems
- **Timeline View** - Chronological workflow creation and modification history
- **Cross-Domain Bridges** - Flow diagrams showing workflows connecting multiple domains

### Technical Features

#### Authentication & Security
- **Supabase Authentication** - Email/password authentication with session management
- **Protected Routes** - All pages require authentication except login
- **Row Level Security** - Database-level access control via Supabase RLS
- **Session Persistence** - Automatic login state restoration

#### User Experience
- **Dark/Light Mode** - Theme toggle with localStorage persistence
- **Responsive Design** - Collapsible sidebar (256px ↔ 80px) with smooth transitions
- **Breadcrumb Navigation** - Auto-generated from current route
- **Loading States** - Branded full-screen loaders and component-level spinners
- **Confirmation Dialogs** - Prevent accidental destructive actions

#### Data Management
- **Soft Deletes** - Non-destructive archiving with `archived_at` timestamp
- **Auto-Save Drafts** - Workflow creation drafts saved to localStorage per user
- **Relational Queries** - Efficient joins for domain/subdomain/workflow relationships
- **Array Fields** - Support for AI enablers, systems involved, dependencies, airline types
- **Success Metrics** - Flexible JSONB field for custom KPIs with targets and timeframes

## Tech Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript 5.5** - Type-safe development
- **Vite 5.4** - Build tool and dev server
- **React Router v7** - Client-side routing with protected routes
- **Tailwind CSS 3.4** - Utility-first styling with dark mode
- **React Hook Form 7.65** - Form state management
- **Lucide React** - Icon library (344+ icons)

### Visualization
- **Recharts 3.3** - Bar, pie, scatter, line, area charts
- **D3 7.9** - Advanced data visualizations
- **d3-sankey** - Flow diagrams
- **ReactFlow 11.11** - Node-based graph visualization
- **react-d3-tree** - Hierarchical tree rendering

### Backend
- **Supabase 2.57** - PostgreSQL database with built-in authentication
- **PostgreSQL** - Relational database with RLS
- **Supabase Storage** - File attachments (configured)

### Build & Deployment
- **PostCSS 8.4** - CSS processing
- **ESLint 9.9** - Code quality
- **GitHub Actions** - CI/CD automation
- **GitHub Pages** - Static hosting

## Database Schema

Core tables include:
- **domains** - High-level business areas (Flight Operations, Revenue Management, etc.)
- **subdomains** - Functional areas within domains (Flight Dispatch, Crew Management, etc.)
- **workflows** - Complete workflow metadata with scoring, categorization, and governance
- **stakeholders** - People involved in workflows
- **workflow_stakeholders** - Many-to-many junction for role assignments
- **workflow_comments** - Collaboration discussions (schema ready, UI pending)
- **workflow_attachments** - Document storage references (schema ready, UI pending)

Database views for analytics:
- `v_agent_network` - Agent catalog with metrics
- `v_agent_collaboration_edges` - Agent relationships
- `v_agent_performance` - Agent execution metrics
- `v_workflow_agent_assignments` - Workflow-to-agent mappings

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jbandu/airline.git
cd airline
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create `.env.local` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Available Scripts

- `npm run dev` - Start dev server (port 5173)
- `npm run build` - Production build to dist/
- `npm run preview` - Preview production build (port 4173)
- `npm run typecheck` - TypeScript validation
- `npm run lint` - ESLint code quality check
- `npm run docs:dev` - Start VitePress documentation server
- `npm run docs:build` - Build documentation site

## Documentation

Comprehensive documentation is available:
- **Public Site**: https://jbandu.github.io/airline/
- **Source**: `/docs` directory

Documentation includes:
- [Codebase Overview](docs/codebase-overview.md) - Architecture and technical details
- [Functionality Guide](docs/functionality-guide.md) - Feature-by-feature walkthrough
- [Database Schema](docs/database-schema.md) - Complete database structure

## Project Structure

```
airline/
├── src/
│   ├── App.tsx              # Root component with routing
│   ├── main.tsx             # Application entry point
│   ├── contexts/            # React contexts (Auth, Theme)
│   ├── components/
│   │   ├── layout/          # Sidebar, Header, Footer, Layout
│   │   ├── dashboard/       # Dashboard components
│   │   ├── workflow/        # Workflow-specific components
│   │   ├── visualizations/  # Charts and graphs
│   │   └── agents/          # Agent network components
│   ├── pages/               # Route components
│   ├── lib/                 # Utilities and Supabase client
│   └── types/               # TypeScript type definitions
├── docs/                    # VitePress documentation
├── supabase/                # Database migrations and schema
├── public/                  # Static assets
└── dist/                    # Production build output
```

## Key Routes

- `/` - Dashboard with portfolio overview
- `/workflows` - Workflow list with filtering
- `/workflows/new` - Create workflow wizard
- `/workflows/:id` - Workflow detail view
- `/workflows/:id/edit` - Edit workflow
- `/domains` - Domain catalog
- `/subdomains` - Subdomain management
- `/analytics` - Analytics dashboard
- `/agents` - Agent network visualization
- `/performance` - Agent performance monitoring
- `/ontology` - Ontology tree
- `/bridges` - Cross-domain bridges

## Features in Development

- **Collaboration** - Comments and attachments (schema complete, UI in progress)
- **Stakeholder Management** - Role assignments and team collaboration
- **Export Functionality** - PDF/Excel export for analytics
- **Real-time Updates** - Live data synchronization via Supabase subscriptions
- **Advanced Permissions** - Role-based access control (Admin, Manager, Analyst, Viewer)

## Deployment

The application is automatically deployed to GitHub Pages via GitHub Actions on every push to `main`.

Manual deployment:
```bash
npm run build
# Artifacts in dist/ can be deployed to any static host
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Contributing

This is a private project. For questions or issues, please contact the repository owner.

## License

Proprietary - All rights reserved

## Support

For help and documentation:
- Documentation: https://jbandu.github.io/airline/
- Issues: https://github.com/jbandu/airline/issues
