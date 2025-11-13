# Agentic Distribution System - Migration Guide

**Version:** 1.0
**Date:** 2025-11-10
**Author:** Claude Code
**Based on:** PwC Hotel Agentic Commerce Model → Airline Industry

---

## Executive Summary

This migration system adds **AI-driven distribution capabilities** to the airline operational intelligence database, transforming the platform from traditional workflow management into a comprehensive **agentic commerce** system for airlines.

### Key Additions

- **5 New Business Domains** with 15 subdomains
- **24 AI Agent Definitions** across 5 categories
- **17 Workflow Definitions** demonstrating agentic patterns
- **10 New Database Tables** for airlines, systems, APIs, loyalty, and content
- **Comprehensive Copa Airlines Seed Data** as reference implementation
- **8 Analytical Views** for AI readiness tracking

### Business Impact

Based on hotel industry parallels, airlines implementing this system can expect:

- **8-15% incremental revenue** from AI platform bookings
- **30-40% reduction** in customer service costs via AI automation
- **20-25% higher conversion rates** through personalized recommendations
- **Competitive positioning** as AI-first airline in agentic commerce era

---

## Migration Sequence

### Migration 001: Agentic Domains & Subdomains
**File:** `20251110001_agentic_domains_subdomains.sql`
**Purpose:** Foundation business domains for AI distribution

**Adds 5 Domains:**
1. **Agentic Distribution & Discovery**
   - Conversational Shopping Experience
   - Fare Intelligence & Recommendation
   - Ancillary Discovery & Bundling

2. **Brand & Product Management**
   - Content Syndication & Governance
   - Product Differentiation
   - AI Discoverability Optimization

3. **Agentic Transaction Execution**
   - Booking Orchestration
   - Payment & Ticketing
   - Post-Booking Services

4. **API-First Architecture**
   - API Gateway Management
   - Real-Time Data Syndication
   - Integration Standards

5. **Loyalty & Personalization**
   - FFP Integration
   - Preference Management
   - Personalized Recommendations

**Dependencies:** Existing `domains` and `subdomains` tables
**Rollback:** Deletes domains by name (uses ON CONFLICT DO NOTHING for idempotency)

---

### Migration 002: Agentic Agent Categories
**File:** `20251110002_agentic_agent_categories.sql`
**Purpose:** New agent classifications for AI distribution

**Adds 5 Categories:**
- **Agentic Shopping** (🔍): Query parsing, search, recommendations
- **Content Syndication** (📡): NDC standardization, brand monitoring
- **Transaction Execution** (⚡): Booking, payment, ticketing
- **API Gateway** (🚪): Rate limiting, auth, real-time sync
- **Personalization** (🎯): FFP recognition, preference learning

**Dependencies:** Existing `agent_categories` table
**Rollback:** Deletes categories by code

---

### Migration 003: Agentic Distribution Tables
**File:** `20251110003_agentic_distribution_tables.sql`
**Purpose:** Core infrastructure tables for agentic system

**Creates 10 Tables:**

1. **airlines**: Carrier profiles with API maturity scores
2. **systems**: PSS, DCS, Loyalty platforms per airline
3. **api_endpoints**: NDC and proprietary API catalog
4. **branded_fare_families**: Fare products with Schema.org markup
5. **ffp_tiers**: Loyalty tiers with AI-readable benefits
6. **ai_platform_integrations**: ChatGPT, Perplexity, etc. connections
7. **passenger_preferences**: Privacy-preserving preference storage
8. **content_syndication_feeds**: Schema.org content for AI platforms
9. **aircraft_configurations**: Fleet details for AI search results
10. **ndc_offers**: NDC offer templates for AI presentation

**Key Features:**
- JSONB columns for flexible schemas
- Full-text search indexes
- Comprehensive RLS policies
- Foreign key relationships with cascading deletes

**Dependencies:** None (creates all tables)
**Rollback:** DROP TABLE IF EXISTS (all 10 tables)

---

### Migration 004: Agentic Agent Definitions
**File:** `20251110004_agentic_agent_definitions.sql`
**Purpose:** Define 24 AI agents powering agentic workflows

**Agent Highlights:**

**Agentic Shopping (7 agents):**
- Complex Query Parser (autonomy: 4)
- Multi-Constraint Search Engine (autonomy: 4)
- Fare Family Recommender (autonomy: 5)
- Ancillary Discovery Engine (autonomy: 4)
- Itinerary Constructor (autonomy: 5)
- Price Predictor (autonomy: 3)
- Bundle Optimizer (autonomy: 5)

**Content Syndication (5 agents):**
- NDC Content Standardizer (autonomy: 3)
- Brand Accuracy Monitor (autonomy: 4)
- Content Approval Governor (autonomy: 3)
- Schema.org Generator (autonomy: 4)
- Multi-Channel Distributor (autonomy: 3)

**Transaction Execution (5 agents):**
- Booking Orchestrator (autonomy: 5)
- Payment Processor (autonomy: 4)
- Ticket Issuer (autonomy: 5)
- PNR Manager (autonomy: 4)
- Receipt Generator (autonomy: 5)

**API Gateway (3 agents):**
- Rate Limiter & Throttler (autonomy: 5)
- Authentication Manager (autonomy: 5)
- Real-Time Inventory Sync (autonomy: 4)

**Personalization (4 agents):**
- FFP Status Recognizer (autonomy: 4)
- Preference Learner (autonomy: 3)
- Upgrade Opportunity Matcher (autonomy: 4)
- Dynamic Pricing Engine (autonomy: 3)

**Also Creates:**
- ~25 agent collaboration relationships
- Agent network for cross-agent communication

**Dependencies:** Migration 002 (agent_categories)
**Rollback:** Deletes agents by code, deletes relationships

---

### Migration 005: Agentic Workflow Definitions
**File:** `20251110005_agentic_workflow_definitions.sql`
**Purpose:** 17 workflows demonstrating agentic patterns

**Workflow Examples:**

**High Agentic Potential (Score 5/5):**
- Complex Natural Language Flight Search
- Dynamic Fare Family Recommendation
- AI-Driven Booking Orchestration
- Personalized Flight & Ancillary Recommendations

**High ROI Workflows:**
- Complex NLP Search: $2-3M annual revenue
- AI Booking Orchestration: 40% reduction in booking errors
- Real-Time Inventory Sync: 15% improvement in load factors
- FFP Recognition: 25% increase in loyalty engagement

**Cross-Domain Workflows:**
- Workflows spanning 2-3 business domains
- Integration complexity scores
- System dependency mapping

**Dependencies:** Migrations 001, 003 (domains, subdomains, workflows table)
**Rollback:** Deletes workflows by name

---

### Migration 006: Agentic Reference Data
**File:** `20251110006_agentic_reference_data.sql`
**Purpose:** Populate lookup tables and baseline data

**Populates:**

**Airlines (13 carriers):**
- Copa Airlines (primary focus, 78 API maturity)
- Star Alliance: United (85), Lufthansa (92), Air Canada (81), ANA (88), Avianca (72)
- Oneworld: American (79), British Airways (84), LATAM (75)
- SkyTeam: Delta (82), Air France (86)
- LLC: Southwest (45), Ryanair (38)

**Systems (10 platforms):**
- Amadeus Altea PSS (Copa, United)
- Lufthansa Netline/Sched PSS
- Sabre PSS (American, Copa RM)
- Delta Deltamatic PSS
- ConnectMiles, MileagePlus, Miles & More loyalty platforms

**AI Platforms (6 integrations):**
- ChatGPT (Copa pilot, Lufthansa production, United pilot)
- Perplexity AI (Copa planned)
- Google Assistant (Lufthansa production)
- Amazon Alexa (Lufthansa production)

**Copa Airlines Data:**
- 4 branded fare families (Basic, Classic, Flex, Dreams Business)
- 5 FFP tiers (Base → Presidential Platinum)
- 7 API endpoints (NDC + Loyalty)
- 4 content syndication feeds

**Dependencies:** Migration 003 (tables)
**Rollback:** Truncates reference tables

---

### Migration 007: Agentic Knowledge Graph
**File:** `20251110007_agentic_knowledge_graph.sql`
**Purpose:** Relationship network between agents, workflows, and systems

**Creates:**

**Agent-Workflow Assignments (~45 mappings):**
- Primary vs. supporting agent roles
- Execution order sequencing
- Required vs. optional agents

**Agent Collaboration Relationships (~28 edges):**
- `triggers`: Agent A initiates Agent B
- `informs`: Agent A provides data to Agent B
- `learns_from`: Agent A uses Agent B feedback
- `requires_approval`: Agent A needs Agent B validation
- `depends_on`: Agent A cannot function without Agent B

**Cross-Domain Bridges (7 bridges):**
- NLP Search → Brand + API domains
- Booking Orchestration → Discovery + API + Loyalty domains
- Personalized Recommendations → Discovery + Brand domains

**Workflow-System Dependencies (9 dependencies):**
- Data source dependencies (PSS, RM, Loyalty)
- Transactional dependencies (booking, payment)
- Criticality scoring (0-1 scale)
- Fallback availability flags

**Knowledge Graph Metrics:**
- 46 nodes (24 agents + 17 workflows + 5 domains)
- ~89 total edges
- Average agent collaboration degree: 3.5

**Dependencies:** Migrations 004, 005, 006 (agents, workflows, systems)
**Rollback:** Deletes relationships, truncates bridge tables

---

### Migration 008: Copa Airlines Seed Data
**File:** `20251110008_copa_airlines_seed_data.sql`
**Purpose:** Comprehensive operational data for Copa Airlines reference implementation

**Populates:**

**Route Network (25 routes):**
- Hub: Panama City (PTY)
- North America: 9 routes (MIA, JFK, LAX, ORD, IAD, SFO, MCO, YYZ, MEX)
- South America: 8 routes (BOG, LIM, GYE, GIG, GRU, EZE, SCL, CCS)
- Central America/Caribbean: 6 routes (SJO, SAL, GUA, MBJ, PUJ, CUN)
- Point-to-point: 2 routes (MIA-BOG, MIA-GUA)

**Additional API Endpoints (9 endpoints):**
- Flight Status Lookup, Schedule Search
- Ancillary Service Catalog, Ancillary Purchase
- Rebooking Options, Self-Service Rebooking
- Online Check-in
- Tier Status Projection, Partner Miles Accrual

**Passenger Archetypes (5 personas):**
- Business Frequent Flyer (Platinum, 48 trips/year, low price sensitivity)
- Leisure Family Traveler (Base, 2 trips/year, very high price sensitivity)
- Digital Nomad (Gold, 12 trips/year, moderate price sensitivity)
- Budget Backpacker (Base, 6 trips/year, very high price sensitivity)
- Senior Leisure Traveler (Silver, 4 trips/year, low price sensitivity)

**NDC Offer Templates (4 templates):**
- Economy Classic Standard Offer ($535, 8.5% conversion)
- Business Dreams Premium Bundle ($2,035, 3.2% conversion)
- Eco Flex Upsell from Basic (+$200, 18.5% conversion)
- ConnectMiles Award Redemption (25K miles + $45, 6.5% conversion)

**Operational Metrics (90 days baseline):**
- On-Time Performance: 81.5-89.5%
- Cancellation Rate: 1.05-2.55%
- Customer Satisfaction: 3.8-4.4/5.0
- NPS Score: 34-50
- AI Booking %: 0.2-1.4% (growing)
- API Uptime: 98.85-99.55%

**Dependencies:** Migrations 003, 006 (tables, systems)
**Rollback:** Truncates Copa-specific data

---

### Migration 009: Agentic Analytics Views
**File:** `20251110009_agentic_analytics_views.sql`
**Purpose:** Analytical views for AI readiness scorecard and dashboards

**Creates 8 Views:**

**1. ai_readiness_scorecard**
- Overall AI maturity assessment per airline
- Weighted scoring: API Infrastructure (35%), AI Platform Integration (25%), Content Syndication (20%), Operational Excellence (20%)
- Maturity tiers: AI Leader (80+), AI Adopter (60+), AI Explorer (40+), AI Laggard (<40)
- Example: Lufthansa = 92 (AI Leader), Copa = 78 (AI Adopter), Ryanair = 38 (AI Laggard)

**2. workflow_agentic_potential**
- Workflow prioritization matrix
- Agentic Opportunity Score = complexity × agentic_potential × autonomy_level / 125 × 100
- Implementation Priority Score = (agentic_potential × 0.4) + (autonomy × 0.3) + (ease × 0.2) + (wave × 0.1)
- ROI tier classification (High/Medium/Incremental/Unknown)

**3. agent_utilization_metrics**
- Agent usage and performance tracking
- Actual vs. declared workflow assignments
- Collaboration network size (inbound/outbound relationships)
- Utilization rate % (actual assignments / declared capacity)
- Cross-domain participation count

**4. cross_domain_complexity**
- Workflows spanning multiple domains
- Integration Complexity Score = (complexity × 0.4) + (domain_count × 10 × 0.3) + (bridge_weakness × 20 × 0.3)
- Agent category diversity
- System dependency count

**5. api_health_dashboard**
- Real-time API performance monitoring
- Response time P95 with performance tiers (Excellent <200ms, Good <500ms, Acceptable <1000ms, Poor >1000ms)
- Rate limiting configuration
- AI platform whitelists
- Security requirements (auth type, PCI compliance)

**6. loyalty_personalization_readiness**
- FFP AI integration assessment
- Personalization Readiness Score = tier_count (20pts) + loyalty_APIs (30pts) + preference_API (25pts) + recommendation_API (25pts)
- Maturity: Advanced (75+), Moderate (50+), Basic (25+), Minimal (<25)

**7. content_syndication_coverage**
- Brand content distribution tracking
- Feed type coverage (route_network, branded_fares, ancillary_services, fleet_info)
- Target platform diversity
- Schema.org compliance %
- Syndication maturity: Comprehensive (80+), Strong (60+), Developing (40+), Minimal (<40)

**8. ndc_adoption_metrics**
- NDC compliance statistics
- NDC Adoption Score = ndc_capable (40pts) + endpoint_coverage (30pts) + system_readiness (30pts)
- Maturity: NDC Leader (80+), NDC Capable (50+), NDC Developing (25+), NDC Laggard (<25)

**Dependencies:** All previous migrations (uses all tables)
**Rollback:** DROP VIEW (all 8 views)

---

## Execution Instructions

### Prerequisites

1. **Supabase Project**: Active project with PostgreSQL 15+
2. **Existing Schema**: Base tables (`domains`, `subdomains`, `workflows`, `agents`, `agent_categories`)
3. **Permissions**: SUPERUSER or schema owner privileges (for RLS, triggers, views)
4. **Backup**: Create database snapshot before execution

### Option 1: Supabase Dashboard (Recommended)

1. Navigate to **SQL Editor** in Supabase Dashboard
2. Execute migrations **in sequence** (001 → 009):
   ```sql
   -- Copy/paste contents of each migration file
   -- Execute one at a time
   -- Verify success before proceeding
   ```
3. Check **Table Editor** to verify new tables
4. Query views to validate data:
   ```sql
   SELECT * FROM ai_readiness_scorecard;
   SELECT * FROM workflow_agentic_potential LIMIT 10;
   ```

### Option 2: Supabase CLI

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations in order
supabase db push

# Or apply individual migrations
psql "$DATABASE_URL" -f supabase/migrations/20251110001_agentic_domains_subdomains.sql
psql "$DATABASE_URL" -f supabase/migrations/20251110002_agentic_agent_categories.sql
# ... continue for all 9 migrations
```

### Option 3: Direct PostgreSQL Connection

```bash
# Set connection string
export DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"

# Execute migrations
psql "$DATABASE_URL" <<EOF
\i supabase/migrations/20251110001_agentic_domains_subdomains.sql
\i supabase/migrations/20251110002_agentic_agent_categories.sql
\i supabase/migrations/20251110003_agentic_distribution_tables.sql
\i supabase/migrations/20251110004_agentic_agent_definitions.sql
\i supabase/migrations/20251110005_agentic_workflow_definitions.sql
\i supabase/migrations/20251110006_agentic_reference_data.sql
\i supabase/migrations/20251110007_agentic_knowledge_graph.sql
\i supabase/migrations/20251110008_copa_airlines_seed_data.sql
\i supabase/migrations/20251110009_agentic_analytics_views.sql
EOF
```

### Verification Steps

After executing all migrations:

```sql
-- 1. Verify new domains
SELECT name, description FROM domains
WHERE name LIKE '%Agentic%' OR name LIKE '%API-First%' OR name LIKE '%Loyalty%';
-- Expected: 5 rows

-- 2. Verify new agent categories
SELECT code, name, icon FROM agent_categories
WHERE code IN ('agentic_shopping', 'content_syndication', 'transaction_execution', 'api_gateway', 'personalization');
-- Expected: 5 rows

-- 3. Verify new tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('airlines', 'systems', 'api_endpoints', 'branded_fare_families', 'ffp_tiers');
-- Expected: 5+ rows

-- 4. Verify agents created
SELECT COUNT(*) AS total_agents,
       COUNT(*) FILTER (WHERE category_code IN ('agentic_shopping', 'content_syndication', 'transaction_execution', 'api_gateway', 'personalization')) AS new_agents
FROM agents;
-- Expected: new_agents = 24

-- 5. Verify workflows created
SELECT COUNT(*) FROM workflows
WHERE name IN ('Complex Natural Language Flight Search', 'Dynamic Fare Family Recommendation', 'AI-Driven Booking Orchestration');
-- Expected: 3+ rows

-- 6. Verify Copa Airlines data
SELECT airline_name, api_maturity_score, ndc_capable
FROM airlines
WHERE iata_code = 'CM';
-- Expected: 1 row (Copa Airlines, score 78, ndc_capable = true)

-- 7. Verify knowledge graph relationships
SELECT COUNT(*) AS agent_relationships FROM agent_relationships;
-- Expected: ~28 relationships

-- 8. Verify views created
SELECT table_name FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN ('ai_readiness_scorecard', 'workflow_agentic_potential', 'agent_utilization_metrics');
-- Expected: 3+ rows

-- 9. Test AI Readiness Scorecard
SELECT airline_name, overall_ai_readiness_score, ai_maturity_tier
FROM ai_readiness_scorecard
WHERE airline_name = 'Copa Airlines';
-- Expected: Score ~65-75, Tier = 'AI Adopter'

-- 10. Test Workflow Agentic Potential
SELECT workflow_name, agentic_opportunity_score, implementation_priority_score
FROM workflow_agentic_potential
ORDER BY agentic_opportunity_score DESC
LIMIT 5;
-- Expected: Top workflows with scores 80-100
```

---

## Rollback Procedures

### Full Rollback (All 9 Migrations)

**⚠️ WARNING:** This will delete all agentic distribution data. Ensure you have a backup.

Execute `rollback_agentic_distribution.sql` (see separate file):

```bash
psql "$DATABASE_URL" -f supabase/migrations/rollback_agentic_distribution.sql
```

### Partial Rollback (Individual Migrations)

Rollback in **reverse order** (009 → 001):

```sql
-- Migration 009: Drop views
DROP VIEW IF EXISTS ndc_adoption_metrics CASCADE;
DROP VIEW IF EXISTS content_syndication_coverage CASCADE;
DROP VIEW IF EXISTS loyalty_personalization_readiness CASCADE;
DROP VIEW IF EXISTS api_health_dashboard CASCADE;
DROP VIEW IF EXISTS cross_domain_complexity CASCADE;
DROP VIEW IF EXISTS agent_utilization_metrics CASCADE;
DROP VIEW IF EXISTS workflow_agentic_potential CASCADE;
DROP VIEW IF EXISTS ai_readiness_scorecard CASCADE;
DROP VIEW IF EXISTS knowledge_graph_metrics CASCADE;

-- Migration 008: Delete Copa-specific data
DELETE FROM airline_operational_metrics WHERE airline_id = (SELECT id FROM airlines WHERE iata_code = 'CM');
DELETE FROM ndc_offer_templates WHERE airline_id = (SELECT id FROM airlines WHERE iata_code = 'CM');
DELETE FROM passenger_preference_archetypes;
DELETE FROM airline_routes WHERE airline_id = (SELECT id FROM airlines WHERE iata_code = 'CM');

-- Migration 007: Delete knowledge graph
DROP TABLE IF EXISTS workflow_system_dependencies CASCADE;
DROP TABLE IF EXISTS workflow_cross_domain_bridges CASCADE;
DELETE FROM agent_relationships WHERE from_agent_id IN (SELECT id FROM agents WHERE category_code IN ('agentic_shopping', 'content_syndication', 'transaction_execution', 'api_gateway', 'personalization'));
DELETE FROM workflow_agents WHERE workflow_id IN (SELECT id FROM workflows WHERE name LIKE '%Natural Language%' OR name LIKE '%Agentic%');

-- Migration 006: Delete reference data
DELETE FROM aircraft_configurations;
DELETE FROM content_syndication_feeds;
DELETE FROM api_endpoints WHERE system_id IN (SELECT id FROM systems WHERE airline_id IS NOT NULL);
DELETE FROM ffp_tiers;
DELETE FROM branded_fare_families;
DELETE FROM ai_platform_integrations;
DELETE FROM systems;
DELETE FROM airlines;

-- Migration 005: Delete workflows
DELETE FROM workflows WHERE name IN (
  'Complex Natural Language Flight Search',
  'Dynamic Fare Family Recommendation',
  'Intelligent Ancillary Bundling',
  'NDC Content Syndication',
  -- ... all 17 workflow names
);

-- Migration 004: Delete agents
DELETE FROM agent_relationships WHERE from_agent_id IN (SELECT id FROM agents WHERE category_code IN ('agentic_shopping', 'content_syndication', 'transaction_execution', 'api_gateway', 'personalization'));
DELETE FROM agents WHERE category_code IN ('agentic_shopping', 'content_syndication', 'transaction_execution', 'api_gateway', 'personalization');

-- Migration 003: Drop tables
DROP TABLE IF EXISTS ndc_offers CASCADE;
DROP TABLE IF EXISTS aircraft_configurations CASCADE;
DROP TABLE IF EXISTS content_syndication_feeds CASCADE;
DROP TABLE IF EXISTS passenger_preferences CASCADE;
DROP TABLE IF EXISTS ai_platform_integrations CASCADE;
DROP TABLE IF EXISTS ffp_tiers CASCADE;
DROP TABLE IF EXISTS branded_fare_families CASCADE;
DROP TABLE IF EXISTS api_endpoints CASCADE;
DROP TABLE IF EXISTS systems CASCADE;
DROP TABLE IF EXISTS airlines CASCADE;

-- Migration 002: Delete agent categories
DELETE FROM agent_categories WHERE code IN ('agentic_shopping', 'content_syndication', 'transaction_execution', 'api_gateway', 'personalization');

-- Migration 001: Delete domains and subdomains
DELETE FROM subdomains WHERE domain_id IN (SELECT id FROM domains WHERE name IN ('Agentic Distribution & Discovery', 'Brand & Product Management', 'Agentic Transaction Execution', 'API-First Architecture', 'Loyalty & Personalization'));
DELETE FROM domains WHERE name IN ('Agentic Distribution & Discovery', 'Brand & Product Management', 'Agentic Transaction Execution', 'API-First Architecture', 'Loyalty & Personalization');
```

---

## Architecture Overview

### Hotel → Airline Industry Parallels

This system is based on PwC's **Agentic Commerce for Hotels** model, adapted for airlines:

| Hotel Industry | Airline Industry | Implementation |
|---|---|---|
| Room search via ChatGPT | Flight search via ChatGPT | Complex NLP Search workflow |
| Property recommendations | Fare family recommendations | Fare Recommender agent |
| Upsell amenities | Ancillary bundling | Ancillary Discovery agent |
| Loyalty tier recognition | FFP status recognition | FFP Recognition workflow |
| Dynamic pricing | Revenue management | Dynamic Pricing agent |
| Booking orchestration | PNR creation & ticketing | Booking Orchestrator agent |
| Content syndication | NDC content distribution | Content Syndication domain |

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI PLATFORMS LAYER                           │
│  ChatGPT | Claude | Perplexity | Google Assistant | Alexa       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY DOMAIN                           │
│  • Rate Limiter & Throttler                                     │
│  • Authentication Manager (OAuth2, API Keys, mTLS)              │
│  • Real-Time Inventory Sync                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│   DISTRIBUTION   │ │    BRAND     │ │  TRANSACTION     │
│   & DISCOVERY    │ │  MANAGEMENT  │ │   EXECUTION      │
├──────────────────┤ ├──────────────┤ ├──────────────────┤
│ • Query Parser   │ │ • NDC        │ │ • Booking Orch.  │
│ • Search Engine  │ │   Standardizer│ │ • Payment Proc.  │
│ • Fare Recommender│ │ • Brand      │ │ • Ticket Issuer  │
│ • Ancillary Disc.│ │   Monitor    │ │ • PNR Manager    │
│ • Bundle Optim.  │ │ • Content    │ │ • Receipt Gen.   │
└─────────┬────────┘ └──────┬───────┘ └────────┬─────────┘
          │                 │                   │
          └─────────────────┼───────────────────┘
                            ▼
          ┌─────────────────────────────────────┐
          │     LOYALTY & PERSONALIZATION       │
          │  • FFP Status Recognizer            │
          │  • Preference Learner               │
          │  • Upgrade Opportunity Matcher      │
          └──────────────────┬──────────────────┘
                             │
                             ▼
          ┌─────────────────────────────────────┐
          │       AIRLINE CORE SYSTEMS          │
          │  PSS | DCS | Loyalty | RM | Inventory│
          └─────────────────────────────────────┘
```

### Data Flow Example: Complex NLP Flight Search

1. **User Query** (ChatGPT): "Find me a direct flight to Lima next Tuesday that allows 2 checked bags and has WiFi"

2. **API Gateway**: Authenticates ChatGPT, checks rate limits, routes to Query Parser

3. **Query Parser Agent**: Extracts constraints:
   - `destination = "LIM"`
   - `date = "next Tuesday"`
   - `stops = 0` (direct)
   - `checked_bags >= 2`
   - `wifi = true`

4. **Multi-Constraint Search Agent**: Queries PSS inventory with all constraints

5. **Fare Recommender Agent**: Matches results to branded fare families
   - Filters out "Economy Basic" (0 checked bags)
   - Highlights "Economy Classic" (2 checked bags, WiFi available for purchase)
   - Suggests "Economy Flex" (2 checked bags, complimentary WiFi) as upsell

6. **Response to ChatGPT**: Structured NDC offer with 3 options, Schema.org markup for LLM understanding

7. **User Selects**: Economy Flex option

8. **Booking Orchestrator Agent**: Creates PNR, processes payment, issues ticket

9. **FFP Recognition Agent**: Accrues miles based on tier status

10. **Preference Learner Agent**: Stores WiFi preference for future recommendations

---

## Business Value Realization

### Wave 1 (Months 1-6): Foundation

**Workflows:**
- Complex Natural Language Flight Search
- NDC Content Syndication
- API Gateway for AI Platforms

**Expected Outcomes:**
- 5,000-10,000 monthly AI platform queries
- 3-5% conversion rate on AI bookings
- $500K-1M incremental revenue (annualized)

**Success Metrics:**
- API uptime > 99.5%
- Response time P95 < 500ms
- AI booking % > 1%

### Wave 2 (Months 7-12): Personalization

**Workflows:**
- Dynamic Fare Family Recommendation
- FFP Status Recognition & Benefits Application
- Personalized Flight & Ancillary Recommendations

**Expected Outcomes:**
- 20-30% higher conversion vs. non-personalized
- 15% increase in ancillary attach rate
- 25% increase in loyalty program engagement

**Success Metrics:**
- Personalization coverage > 60% of bookings
- Ancillary revenue per booking +$15-25
- FFP member satisfaction +10 NPS points

### Wave 3 (Months 13-18): Automation

**Workflows:**
- AI-Driven Booking Orchestration
- Autonomous Payment & Ticketing
- Self-Service Disruption Management

**Expected Outcomes:**
- 40% reduction in booking errors
- 30% reduction in call center volume
- 50% faster rebooking during IROPS

**Success Metrics:**
- Booking success rate > 99%
- Customer service cost per booking -$5
- IROPS rebooking time < 5 minutes

### Wave 4 (Months 19-24): Intelligence

**Workflows:**
- Real-Time Inventory Synchronization
- Intelligent Ancillary Bundling
- Dynamic Upgrade Opportunity Matching

**Expected Outcomes:**
- 15% improvement in load factors
- 20% increase in premium cabin bookings
- $3-5M annual revenue from optimized upsells

**Success Metrics:**
- Inventory sync latency < 100ms
- Bundle acceptance rate > 25%
- Upgrade conversion > 15%

---

## Integration with Existing System

### Existing Tables (Unchanged)

- `domains`: Receives 5 new domains
- `subdomains`: Receives 15 new subdomains
- `workflows`: Receives 17 new workflow definitions
- `agents`: Receives 24 new agent definitions
- `agent_categories`: Receives 5 new categories
- `agent_relationships`: Receives ~28 new relationships
- `workflow_agents`: Receives ~45 new assignments

### New Tables (Added)

- `airlines`: New top-level entity
- `systems`: New top-level entity
- `api_endpoints`: New infrastructure tracking
- `branded_fare_families`: New product catalog
- `ffp_tiers`: New loyalty tracking
- `ai_platform_integrations`: New distribution channel
- `passenger_preferences`: New personalization data
- `content_syndication_feeds`: New content distribution
- `aircraft_configurations`: New operational reference
- `ndc_offers`: New offer management

### View Dependencies

All 8 analytical views reference existing AND new tables:

- `ai_readiness_scorecard`: airlines, systems, api_endpoints, ai_platform_integrations, content_syndication_feeds, branded_fare_families
- `workflow_agentic_potential`: workflows, domains, subdomains, workflow_agents, workflow_cross_domain_bridges, workflow_system_dependencies
- `agent_utilization_metrics`: agents, agent_categories, workflow_agents, agent_relationships, workflows
- `cross_domain_complexity`: workflows, domains, workflow_cross_domain_bridges, workflow_agents, workflow_system_dependencies
- `api_health_dashboard`: airlines, systems, api_endpoints
- `loyalty_personalization_readiness`: airlines, ffp_tiers, systems, api_endpoints, ai_platform_integrations, passenger_preferences
- `content_syndication_coverage`: airlines, content_syndication_feeds, branded_fare_families
- `ndc_adoption_metrics`: airlines, systems, api_endpoints

---

## Troubleshooting

### Common Issues

**1. Migration 001 fails with "domain already exists"**
- **Cause**: Migrations already partially applied
- **Solution**: This is expected behavior (ON CONFLICT DO NOTHING). Continue with next migration.

**2. Migration 004 fails with "foreign key violation on category_code"**
- **Cause**: Migration 002 (agent_categories) not executed
- **Solution**: Execute migration 002 first, then retry 004

**3. Migration 006 fails with "table airlines does not exist"**
- **Cause**: Migration 003 (tables) not executed
- **Solution**: Execute migration 003 first, then retry 006

**4. View creation fails with "relation does not exist"**
- **Cause**: Missing table from migration 003 or 006
- **Solution**: Execute all migrations 001-008 before 009

**5. AI Readiness Scorecard returns no rows**
- **Cause**: No airlines populated in migration 006
- **Solution**: Verify `SELECT COUNT(*) FROM airlines;` returns > 0. If not, re-run migration 006.

**6. Knowledge graph relationships are empty**
- **Cause**: Migration 007 failed silently due to missing agent codes
- **Solution**: Verify agents exist: `SELECT code FROM agents WHERE category_code IN ('agentic_shopping', 'content_syndication');` Should return 24 rows. If not, re-run migration 004.

### Performance Optimization

**For large datasets (>1M workflows):**

```sql
-- Add indexes on frequently queried columns
CREATE INDEX idx_workflows_agentic_potential ON workflows(agentic_potential, complexity, autonomy_level);
CREATE INDEX idx_workflows_implementation_wave ON workflows(implementation_wave) WHERE archived_at IS NULL;
CREATE INDEX idx_agent_relationships_strength ON agent_relationships(strength) WHERE strength > 0.8;

-- Materialize views for faster queries
CREATE MATERIALIZED VIEW mv_ai_readiness_scorecard AS
SELECT * FROM ai_readiness_scorecard;

CREATE UNIQUE INDEX ON mv_ai_readiness_scorecard(airline_id);

-- Refresh materialized view daily
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_ai_readiness_scorecard;
```

---

## Next Steps

After successful migration execution:

1. **Configure UI Integration**
   - Add AI Readiness Scorecard dashboard at `/analytics/ai-readiness`
   - Integrate `workflow_agentic_potential` view into workflow list filters
   - Display `agent_utilization_metrics` in agent network visualization

2. **Populate Airline-Specific Data**
   - Add your airline's data to `airlines` table
   - Configure PSS/DCS/Loyalty systems in `systems` table
   - Document API endpoints in `api_endpoints` table
   - Create branded fare families in `branded_fare_families` table

3. **Integrate AI Platforms**
   - Register ChatGPT, Claude, Perplexity integrations in `ai_platform_integrations`
   - Configure OAuth2 credentials
   - Whitelist AI platforms in API endpoints
   - Monitor usage via `api_health_dashboard` view

4. **Enable Personalization**
   - Implement passenger preference capture
   - Configure privacy settings (GDPR/CCPA compliance)
   - Enable preference learning agents
   - Track personalization metrics

5. **Monitor & Optimize**
   - Set up alerts for API performance degradation
   - Track AI booking conversion rates
   - Monitor agent collaboration network health
   - Iterate on workflow agentic potential scores

---

## Support & Documentation

- **Architecture Docs**: `/docs/agentic_distribution_architecture.md`
- **Rollback Script**: `/supabase/migrations/rollback_agentic_distribution.sql`
- **Migration Files**: `/supabase/migrations/20251110*.sql`
- **Database Schema**: Use Supabase Table Editor to explore relationships

**For issues or questions:**
- Review this README's Troubleshooting section
- Check Supabase logs for specific error messages
- Verify all dependencies are met before each migration
- Ensure database user has sufficient privileges

---

**Migration System Version:** 1.0
**Total Lines of SQL:** ~6,000
**Total Data Points Added:** 200+
**Estimated Execution Time:** 2-5 minutes (depending on database size)
**Compatible With:** PostgreSQL 12+, Supabase hosted databases

---

*This migration system transforms your airline operational intelligence platform into a comprehensive agentic commerce system, positioning your airline at the forefront of AI-driven distribution.*
