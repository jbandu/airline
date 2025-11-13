# Agentic Distribution Architecture

**Document Version:** 1.0
**Date:** 2025-11-10
**System:** AeroGraph Airline Operational Intelligence Platform
**Enhancement:** AI-Driven Agentic Distribution Capabilities

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Hotel→Airline Industry Parallels](#hotel-airline-industry-parallels)
3. [System Architecture](#system-architecture)
4. [Domain Model](#domain-model)
5. [Agent Network](#agent-network)
6. [Workflow Patterns](#workflow-patterns)
7. [Data Model](#data-model)
8. [API Architecture](#api-architecture)
9. [Security & Privacy](#security--privacy)
10. [Deployment Strategy](#deployment-strategy)

---

## Executive Summary

### Business Context

The airline industry is undergoing a fundamental distribution shift driven by **conversational AI platforms** (ChatGPT, Claude, Perplexity) that are replacing traditional OTAs and metasearch engines for flight discovery. This architectural enhancement transforms AeroGraph from a traditional workflow management platform into a comprehensive **agentic commerce system** that enables airlines to distribute products via AI agents.

### Key Architectural Principles

1. **API-First**: All airline capabilities exposed via NDC-compliant and proprietary APIs
2. **Agent-Centric**: Autonomous AI agents orchestrate complex workflows end-to-end
3. **Real-Time**: Inventory, pricing, and availability synchronized within milliseconds
4. **Privacy-Preserving**: Passenger preferences stored with differential privacy and encryption
5. **Interoperable**: Standards-based integration (NDC, Schema.org, OAuth2)

### Strategic Value

Based on PwC's hotel industry agentic commerce model, airlines can expect:

- **Revenue Growth**: 8-15% incremental revenue from AI platform bookings
- **Cost Reduction**: 30-40% lower customer service costs via automation
- **Conversion Improvement**: 20-25% higher conversion through personalization
- **Market Positioning**: First-mover advantage as AI-first airline

---

## Hotel→Airline Industry Parallels

### PwC Hotel Agentic Commerce Model

The hotel industry pioneered agentic commerce with platforms like ChatGPT enabling:

1. **Room Discovery**: Natural language queries ("find a pet-friendly hotel in Paris with breakfast")
2. **Personalization**: Learned preferences applied to recommendations
3. **Dynamic Bundling**: Room + amenities optimized by AI
4. **Autonomous Booking**: End-to-end transactions without human intervention
5. **Loyalty Integration**: Status recognition and benefit application

### Airline Industry Adaptation

| Hotel Capability | Airline Equivalent | AeroGraph Implementation |
|---|---|---|
| Room search | Flight search | Complex NLP Flight Search workflow |
| Property recommendations | Airline/route recommendations | Fare Family Recommender agent |
| Amenity bundles | Ancillary bundles (bags, WiFi, meals) | Ancillary Discovery & Bundling agent |
| Loyalty tier recognition | FFP status recognition | FFP Status Recognizer agent |
| Dynamic room pricing | Dynamic fare management | Dynamic Pricing Engine agent |
| Booking automation | PNR creation & ticketing | Booking Orchestrator + Ticket Issuer agents |
| Content syndication | NDC content distribution | Content Syndication domain |
| OTA distribution | AI platform distribution | API-First Architecture domain |

### Key Differences: Hotels vs. Airlines

| Aspect | Hotels | Airlines | Architectural Implication |
|---|---|---|---|
| Inventory | Static (rooms) | Dynamic (seats on flights) | Real-time inventory sync required |
| Pricing | Semi-dynamic | Hyper-dynamic (yield mgmt) | Sub-second pricing API response times |
| Regulation | Minimal | Highly regulated (IATA, BSP/ARC) | Compliance workflows for ticketing/payments |
| Loyalty | Simple (nights/points) | Complex (miles, status, partners) | Multi-tier FFP integration with alliance recognition |
| Interlining | Rare | Common | Support for multi-airline itineraries |
| Refundability | Common | Rare (except premium fares) | Fare family differentiation critical |

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AI PLATFORMS LAYER                                  │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │ ChatGPT  │  │  Claude  │  │ Perplexity │  │   Google   │  │  Amazon  │ │
│  │  (OpenAI)│  │(Anthropic)│ │     AI     │  │  Assistant │  │   Alexa  │ │
│  └────┬─────┘  └────┬─────┘  └──────┬─────┘  └──────┬─────┘  └────┬─────┘ │
└───────┼─────────────┼───────────────┼────────────────┼─────────────┼───────┘
        │             │               │                │             │
        └─────────────┴───────────────┴────────────────┴─────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY DOMAIN                                     │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  Rate Limiter & Throttler Agent (Autonomy: 5)                      │    │
│  │  • Per-consumer quotas (100-500 req/min)                            │    │
│  │  • Burst allowance, token bucket algorithm                          │    │
│  │  • AI platform whitelisting                                         │    │
│  ├────────────────────────────────────────────────────────────────────┤    │
│  │  Authentication Manager Agent (Autonomy: 5)                         │    │
│  │  • OAuth2, API keys, mTLS, Bearer tokens                            │    │
│  │  • AI platform identity verification                                │    │
│  │  • Session management                                               │    │
│  ├────────────────────────────────────────────────────────────────────┤    │
│  │  Real-Time Inventory Sync Agent (Autonomy: 4)                       │    │
│  │  • PSS inventory push/pull (WebSocket, Server-Sent Events)          │    │
│  │  • Cache invalidation on availability changes                       │    │
│  │  • Sub-100ms sync latency                                           │    │
│  └────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────────┐
│  DISTRIBUTION    │      │      BRAND       │      │    TRANSACTION       │
│  & DISCOVERY     │      │   MANAGEMENT     │      │     EXECUTION        │
│                  │      │                  │      │                      │
│  ┌────────────┐  │      │  ┌────────────┐  │      │  ┌────────────────┐  │
│  │Query Parser│  │      │  │    NDC     │  │      │  │   Booking      │  │
│  │  Agent     │  │◄─────┤  │Standardizer│  │      │  │ Orchestrator   │  │
│  │(Autonomy:4)│  │      │  │  Agent     │  │      │  │  Agent (5)     │  │
│  └──────┬─────┘  │      │  │(Autonomy:3)│  │      │  └────────┬───────┘  │
│         │        │      │  └────────────┘  │      │           │          │
│  ┌──────▼─────┐  │      │  ┌────────────┐  │      │  ┌────────▼───────┐  │
│  │Multi-Const │  │      │  │   Brand    │  │      │  │    Payment     │  │
│  │  Search    │  │      │  │  Monitor   │  │      │  │   Processor    │  │
│  │  Engine    │  │      │  │   Agent    │  │      │  │   Agent (4)    │  │
│  │(Autonomy:4)│  │      │  │(Autonomy:4)│  │      │  └────────┬───────┘  │
│  └──────┬─────┘  │      │  └────────────┘  │      │           │          │
│         │        │      │  ┌────────────┐  │      │  ┌────────▼───────┐  │
│  ┌──────▼─────┐  │      │  │  Content   │  │      │  │     Ticket     │  │
│  │    Fare    │  │      │  │  Approval  │  │      │  │     Issuer     │  │
│  │Recommender │  │      │  │  Governor  │  │      │  │   Agent (5)    │  │
│  │  Agent (5) │  │      │  │(Autonomy:3)│  │      │  └────────────────┘  │
│  └──────┬─────┘  │      │  └────────────┘  │      │                      │
│         │        │      │                  │      └──────────────────────┘
│  ┌──────▼─────┐  │      └──────────────────┘
│  │ Ancillary  │  │
│  │ Discovery  │  │
│  │  Agent (4) │  │                    ┌──────────────────────┐
│  └────────────┘  │                    │   LOYALTY &          │
└──────────────────┘                    │   PERSONALIZATION    │
                                        │                      │
                                        │  ┌────────────────┐  │
                                        │  │ FFP Status     │  │
                                        │  │ Recognizer     │  │
                                        │  │ Agent (4)      │  │
                                        │  └────────┬───────┘  │
                                        │           │          │
                                        │  ┌────────▼───────┐  │
                                        │  │  Preference    │  │
                                        │  │   Learner      │  │
                                        │  │  Agent (3)     │  │
                                        │  └────────┬───────┘  │
                                        │           │          │
                                        │  ┌────────▼───────┐  │
                                        │  │   Upgrade      │  │
                                        │  │  Opportunity   │  │
                                        │  │   Matcher (4)  │  │
                                        │  └────────────────┘  │
                                        └──────────────────────┘
                                                  │
                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AIRLINE CORE SYSTEMS                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │   PSS    │  │   DCS    │  │ Loyalty  │  │ Revenue  │  │  Inventory   │ │
│  │ (Amadeus)│  │  (SITA)  │  │ Platform │  │   Mgmt   │  │              │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Layers

**Layer 1: AI Platforms**
- External conversational AI platforms
- OAuth2-authenticated API consumers
- Rate-limited per platform agreement

**Layer 2: API Gateway**
- Security perimeter (authentication, authorization)
- Traffic management (rate limiting, throttling)
- Real-time synchronization orchestration

**Layer 3: Business Domains (5 domains)**
- **Agentic Distribution & Discovery**: Search, recommendations, bundling
- **Brand & Product Management**: Content governance, NDC standardization
- **Agentic Transaction Execution**: Booking, payment, ticketing
- **API-First Architecture**: Gateway, real-time sync, standards
- **Loyalty & Personalization**: FFP integration, preference learning

**Layer 4: Airline Core Systems**
- PSS (Passenger Service System): Amadeus, Sabre, Lufthansa Netline
- DCS (Departure Control System): Check-in, boarding
- Loyalty Platform: FFP management
- Revenue Management: Pricing, yield optimization
- Inventory: Seat availability

---

## Domain Model

### 5 Business Domains + 15 Subdomains

#### Domain 1: Agentic Distribution & Discovery

**Purpose**: AI-powered flight shopping, fare intelligence, and ancillary discovery

**Subdomains:**

1. **Conversational Shopping Experience**
   - Multi-constraint query parsing
   - Natural language to flight search translation
   - Complex itinerary construction via AI agents
   - Example: "Find me a direct flight to Paris next Tuesday that allows 2 checked bags and has WiFi"

2. **Fare Intelligence & Recommendation**
   - Dynamic fare family matching
   - Price prediction and alerts
   - Upsell opportunity identification
   - AI analyzes passenger preferences and willingness to pay

3. **Ancillary Discovery & Bundling**
   - Seat preference matching
   - Meal/baggage/service recommendations
   - Bundle optimization
   - Learns from passenger behavior

**Key Workflows:**
- Complex Natural Language Flight Search
- Dynamic Fare Family Recommendation
- Intelligent Ancillary Bundling

---

#### Domain 2: Brand & Product Management

**Purpose**: Content governance, product differentiation, AI discoverability optimization

**Subdomains:**

1. **Content Syndication & Governance**
   - Single source of truth for airline product content
   - Multi-channel distribution orchestration
   - Version control with approval workflows
   - Ensures consistency across GDS, OTAs, metasearch, AI platforms

2. **Product Differentiation**
   - Branded fare accuracy
   - Competitive positioning visualization
   - Alliance partnership benefit visibility
   - Helps airlines articulate unique value propositions to AI agents

3. **AI Discoverability Optimization**
   - Schema.org markup generation
   - NDC content enhancement
   - LLM-friendly product descriptions
   - Optimizes content for retrieval by conversational AI

**Key Workflows:**
- NDC Content Syndication
- Brand Accuracy Monitoring
- Schema.org Markup Generation

---

#### Domain 3: Agentic Transaction Execution

**Purpose**: End-to-end booking, payment, and ticketing orchestration by AI agents

**Subdomains:**

1. **Booking Orchestration**
   - PNR creation via API
   - Multi-segment booking coordination
   - Inventory hold management
   - Handles complex itineraries with multiple airlines

2. **Payment & Ticketing**
   - Payment method orchestration (multiple forms of payment)
   - E-ticket issuance via BSP/ARC
   - Receipt generation
   - Supports split payments, corporate accounts, loyalty point redemption

3. **Post-Booking Services**
   - Automated seat assignment based on preferences
   - Ancillary addition post-purchase
   - Itinerary modification handling
   - Supports exchanges, refunds, schedule change accommodation

**Key Workflows:**
- AI-Driven Booking Orchestration
- Autonomous Payment & Ticketing
- Post-Booking Service Automation
- Self-Service Disruption Management

---

#### Domain 4: API-First Architecture

**Purpose**: Modern API infrastructure for real-time distribution

**Subdomains:**

1. **API Gateway Management**
   - Rate limiting & throttling per consumer
   - Authentication & authorization (OAuth2, API keys, mTLS)
   - Request/response transformation
   - Ensures fair resource allocation and prevents abuse

2. **Real-Time Data Syndication**
   - Inventory synchronization
   - Dynamic pricing updates
   - Schedule change propagation
   - Pushes updates to subscribed AI platforms within milliseconds

3. **Integration Standards**
   - NDC (IATA New Distribution Capability) compliance
   - IATA standards alignment for interoperability
   - OpenTravel alliance schema adoption
   - Ensures consistent data exchange formats

**Key Workflows:**
- API Gateway for AI Platforms
- Real-Time Inventory Synchronization
- NDC Standard Compliance Verification

---

#### Domain 5: Loyalty & Personalization

**Purpose**: FFP integration, privacy-preserving preference management, personalized recommendations

**Subdomains:**

1. **FFP Integration**
   - Status recognition across all platforms (own and partner airlines)
   - Benefits eligibility calculation in real-time
   - Partner airline coordination for accrual and redemption
   - Supports Star Alliance, Oneworld, SkyTeam

2. **Preference Management**
   - Learns from booking behavior and service usage patterns
   - Privacy-preserving storage with encryption
   - Explicit consent management per GDPR/CCPA
   - Passenger controls data sharing granularly

3. **Personalized Recommendations**
   - Route suggestions based on travel history
   - Service bundling aligned with preferences
   - Upgrade opportunity identification
   - Uses collaborative filtering and contextual signals

**Key Workflows:**
- FFP Status Recognition & Benefits Application
- Personalized Flight & Ancillary Recommendations
- Privacy-Preserving Preference Learning
- Preference-Based Seat Assignment
- Dynamic Upgrade Opportunity Matching

---

## Agent Network

### 24 AI Agents Across 5 Categories

#### Category 1: Agentic Shopping (7 agents)

| Agent | Code | Autonomy | Role |
|---|---|:---:|---|
| Complex Query Parser | `complex_query_parser` | 4 | Parses natural language queries with multiple constraints |
| Multi-Constraint Search Engine | `multi_constraint_search` | 4 | Searches inventory across all constraints simultaneously |
| Fare Family Recommender | `fare_family_recommender` | 5 | Matches passengers to optimal fare products |
| Ancillary Discovery Engine | `ancillary_discovery` | 4 | Identifies relevant ancillaries based on context |
| Itinerary Constructor | `itinerary_constructor` | 5 | Builds complex multi-segment itineraries |
| Price Predictor & Alert | `price_predictor` | 3 | Forecasts fare changes, triggers alerts |
| Bundle Optimizer | `bundle_optimizer` | 5 | Creates optimal fare + ancillary bundles |

**Collaboration Pattern:**
```
Query Parser → Search Engine → Fare Recommender → Ancillary Discovery → Bundle Optimizer
      ↓                                    ↓                      ↓
  Itinerary Constructor              Price Predictor       Preference Learner
```

---

#### Category 2: Content Syndication (5 agents)

| Agent | Code | Autonomy | Role |
|---|---|:---:|---|
| NDC Content Standardizer | `ndc_content_standardizer` | 3 | Converts proprietary content to NDC format |
| Brand Accuracy Monitor | `brand_accuracy_monitor` | 4 | Detects brand misrepresentations across platforms |
| Content Approval Governor | `content_approval_governor` | 3 | Enforces approval workflows for content changes |
| Schema.org Markup Generator | `schema_org_generator` | 4 | Creates semantic markup for AI platforms |
| Multi-Channel Distributor | `multi_channel_distributor` | 3 | Syndicates content to GDS, OTAs, AI platforms |

**Collaboration Pattern:**
```
NDC Standardizer → Content Governor → Schema.org Generator → Multi-Channel Distributor
        ↑                                                              ↓
Brand Monitor ←───────────────────────────────────────────────────────┘
(feedback loop)
```

---

#### Category 3: Transaction Execution (5 agents)

| Agent | Code | Autonomy | Role |
|---|---|:---:|---|
| Booking Orchestrator | `booking_orchestrator` | 5 | Manages end-to-end booking workflow |
| Payment Processor | `payment_processor` | 4 | Handles payment authorization and capture |
| Ticket Issuer | `ticket_issuer` | 5 | Issues e-tickets via BSP/ARC |
| PNR Manager | `pnr_manager` | 4 | Creates and modifies PNRs in PSS |
| Receipt Generator | `receipt_generator` | 5 | Generates invoices and receipts |

**Collaboration Pattern:**
```
Booking Orchestrator
        ↓
    PNR Manager → Payment Processor → Ticket Issuer → Receipt Generator
        ↑                                     ↓
        └─────── (confirmation feedback) ─────┘
```

---

#### Category 4: API Gateway (3 agents)

| Agent | Code | Autonomy | Role |
|---|---|:---:|---|
| Rate Limiter & Throttler | `rate_limiter` | 5 | Enforces per-consumer quotas, prevents abuse |
| Authentication Manager | `auth_manager` | 5 | Validates API credentials (OAuth2, API keys) |
| Real-Time Inventory Sync | `realtime_inventory_sync` | 4 | Pushes inventory changes to AI platforms |

**Collaboration Pattern:**
```
Authentication Manager → Rate Limiter → [Business Logic Agents]
                                ↓
                    Real-Time Inventory Sync
                          (broadcasts updates)
```

---

#### Category 5: Personalization (4 agents)

| Agent | Code | Autonomy | Role |
|---|---|:---:|---|
| FFP Status Recognizer | `ffp_status_recognizer` | 4 | Identifies loyalty tier and benefits eligibility |
| Preference Learner | `preference_learner` | 3 | Builds passenger preference models |
| Upgrade Opportunity Matcher | `upgrade_opportunity_matcher` | 4 | Identifies and offers upgrade opportunities |
| Dynamic Pricing Engine | `dynamic_pricing_engine` | 3 | Personalizes pricing based on willingness to pay |

**Collaboration Pattern:**
```
FFP Status Recognizer ←──────┐
        ↓                    │
Preference Learner → Upgrade Matcher → Dynamic Pricing
        ↓                                   ↓
    (learns from)                    (applies to)
Fare Recommender                 Ancillary Discovery
```

---

### Autonomy Levels (1-5 Scale)

- **Level 5 (Fully Autonomous)**: Makes decisions without human approval (e.g., Ticket Issuer, Booking Orchestrator)
- **Level 4 (High Autonomy)**: Operates independently with periodic audit (e.g., FFP Recognizer, Search Engine)
- **Level 3 (Moderate Autonomy)**: Requires human approval for critical decisions (e.g., Content Governor, Preference Learner)
- **Level 2 (Assisted)**: Provides recommendations, human makes final decision
- **Level 1 (Manual)**: Human-operated with agent support

---

## Workflow Patterns

### 17 Agentic Workflows

#### High Agentic Potential (Score 80-100)

**1. Complex Natural Language Flight Search**
- **Agentic Potential**: 5/5
- **Autonomy Level**: 4/5
- **Complexity**: 5/5
- **Opportunity Score**: 80
- **ROI**: $2-3M annual revenue
- **Agents Involved**: Query Parser, Multi-Constraint Search, Fare Recommender, Ancillary Discovery
- **Cross-Domain**: Discovery ↔ Brand ↔ API

**2. AI-Driven Booking Orchestration**
- **Agentic Potential**: 5/5
- **Autonomy Level**: 5/5
- **Complexity**: 5/5
- **Opportunity Score**: 100
- **ROI**: 40% reduction in booking errors
- **Agents Involved**: Booking Orchestrator, PNR Manager, Payment Processor, Ticket Issuer
- **Cross-Domain**: Transaction ↔ API ↔ Loyalty

**3. Personalized Flight & Ancillary Recommendations**
- **Agentic Potential**: 5/5
- **Autonomy Level**: 4/5
- **Complexity**: 4/5
- **Opportunity Score**: 80
- **ROI**: 25% higher conversion rate
- **Agents Involved**: Preference Learner, Fare Recommender, Ancillary Discovery, FFP Recognizer
- **Cross-Domain**: Loyalty ↔ Discovery ↔ Brand

---

#### Medium Agentic Potential (Score 50-79)

**4. Real-Time Inventory Synchronization**
- **Agentic Potential**: 4/5
- **Autonomy Level**: 4/5
- **Complexity**: 5/5
- **Opportunity Score**: 64
- **ROI**: 15% improvement in load factors

**5. NDC Content Syndication**
- **Agentic Potential**: 4/5
- **Autonomy Level**: 3/5
- **Complexity**: 4/5
- **Opportunity Score**: 48

---

### Workflow Execution Example: End-to-End Booking

**Scenario**: User asks ChatGPT "Book me a flight from Panama City to Miami tomorrow morning with WiFi"

**Step-by-Step Agent Orchestration:**

1. **API Gateway Receives Request**
   - `auth_manager`: Validates ChatGPT OAuth2 token ✓
   - `rate_limiter`: Checks quota (42 of 100 req/min used) ✓
   - Routes to Query Parser

2. **Query Understanding (Agentic Shopping)**
   - `complex_query_parser`: Extracts constraints
     - Origin: PTY
     - Destination: MIA
     - Date: Tomorrow
     - Time preference: Morning (6am-12pm)
     - Amenity: WiFi required
   - Triggers `multi_constraint_search`

3. **Inventory Search (Agentic Shopping)**
   - `multi_constraint_search`: Queries PSS inventory
     - Finds 3 flights: CM123 (7am), CM456 (9am), CM789 (11am)
     - All 737 MAX 9 with WiFi
   - Passes results to `fare_family_recommender`

4. **Fare Recommendation (Agentic Shopping + Personalization)**
   - `ffp_status_recognizer`: Identifies user as ConnectMiles Gold member
   - `preference_learner`: Retrieves past bookings (prefers window seats, usually books Eco Flex)
   - `fare_family_recommender`: Recommends CM456 9am flight with Eco Flex fare
     - Reasoning: Includes 2 checked bags, WiFi, priority boarding (Gold benefit), preferred seat
   - Sends offer to ChatGPT

5. **User Confirms Booking**
   - ChatGPT presents offer: "I found CM456 departing 9:00am with WiFi, 2 free bags, and priority boarding for your Gold status. Economy Flex fare $585. Shall I book it?"
   - User: "Yes, book it"

6. **Booking Execution (Transaction Execution)**
   - `booking_orchestrator`: Initiates booking workflow
   - `pnr_manager`: Creates PNR in Amadeus PSS
     - Passenger details (from user profile)
     - Flight: CM456 PTY-MIA
     - Fare: ECON_FLEX
   - `payment_processor`: Charges stored payment method (Visa ending 4242)
     - Authorization: $585
     - Capture: Successful
   - `ticket_issuer`: Issues e-ticket via BSP
     - Ticket number: 2301234567890
   - `receipt_generator`: Creates invoice, emails to user

7. **Post-Booking Personalization (Loyalty & Personalization)**
   - `ffp_status_recognizer`: Accrues 1,253 ConnectMiles (Gold 25% bonus)
   - `preference_learner`: Updates profile
     - WiFi preference: Confirmed (3rd consecutive booking)
     - Morning flight preference: Confirmed
   - `upgrade_opportunity_matcher`: Checks business class upgrade availability
     - Available: 2 seats at +$450
     - Sends upgrade offer to ChatGPT for user consideration

8. **Confirmation to User**
   - ChatGPT: "Booked! CM456 on [tomorrow's date] at 9:00am. E-ticket sent to your email. Earned 1,253 miles. Business class upgrade available for $450 if interested."

**Total Execution Time**: 3.2 seconds
**Agents Invoked**: 11 agents across 4 domains
**Human Interventions**: 0 (fully autonomous)

---

## Data Model

### Core Entities

#### Airlines
```sql
CREATE TABLE airlines (
  id BIGSERIAL PRIMARY KEY,
  iata_code TEXT UNIQUE NOT NULL,      -- "CM", "UA", "LH"
  icao_code TEXT,                      -- "CMP", "UAL", "DLH"
  airline_name TEXT NOT NULL,
  country TEXT,
  region TEXT,                         -- "Latin America", "North America", "Europe"
  alliance TEXT,                       -- "Star Alliance", "Oneworld", "SkyTeam"
  is_llc BOOLEAN DEFAULT false,        -- Low-cost carrier
  ndc_capable BOOLEAN DEFAULT false,
  api_maturity_score INTEGER,          -- 0-100 score
  metadata JSONB                       -- Flexible data (founded, fleet_size, etc.)
);
```

**Example**: Copa Airlines
```json
{
  "iata_code": "CM",
  "airline_name": "Copa Airlines",
  "api_maturity_score": 78,
  "ndc_capable": true,
  "metadata": {
    "founded": 1947,
    "fleet_size": 106,
    "headquarters": "Panama City",
    "ffp_name": "ConnectMiles"
  }
}
```

---

#### Systems (PSS, DCS, Loyalty)
```sql
CREATE TABLE systems (
  id BIGSERIAL PRIMARY KEY,
  system_name TEXT NOT NULL,
  system_type TEXT,                    -- "PSS", "DCS", "Loyalty", "Revenue Management"
  vendor TEXT,                         -- "Amadeus", "Sabre", "Lufthansa Systems"
  airline_id BIGINT REFERENCES airlines(id),
  is_cloud_based BOOLEAN DEFAULT false,
  api_endpoints_count INTEGER DEFAULT 0,
  ndc_support JSONB                    -- NDC version, certification level
);
```

**Example**: Copa PSS
```json
{
  "system_name": "Amadeus Altea PSS",
  "vendor": "Amadeus",
  "airline_id": 1,  // Copa Airlines
  "ndc_support": {
    "ndc_version": "21.3",
    "certification_level": "L3"
  }
}
```

---

#### API Endpoints
```sql
CREATE TABLE api_endpoints (
  id BIGSERIAL PRIMARY KEY,
  system_id BIGINT REFERENCES systems(id),
  endpoint_name TEXT NOT NULL,
  endpoint_url TEXT NOT NULL,
  http_method TEXT,                    -- "GET", "POST", "PUT", "DELETE"
  auth_type TEXT,                      -- "oauth2", "api_key", "bearer", "mtls"
  is_ai_accessible BOOLEAN DEFAULT false,
  ndc_compliant BOOLEAN DEFAULT false,
  rate_limit JSONB,                    -- {requests_per_minute: 100, requests_per_day: 50000}
  documentation_url TEXT,
  metadata JSONB                       -- response_time_p95_ms, supported_features, etc.
);
```

**Example**: Copa NDC AirShopping Endpoint
```json
{
  "endpoint_name": "NDC AirShopping",
  "endpoint_url": "https://api.copaair.com/ndc/v21.3/airshopping",
  "http_method": "POST",
  "auth_type": "oauth2",
  "is_ai_accessible": true,
  "ndc_compliant": true,
  "rate_limit": {"requests_per_minute": 100, "requests_per_day": 50000},
  "metadata": {
    "ndc_version": "21.3",
    "response_time_p95_ms": 450,
    "ai_platform_whitelist": ["openai", "anthropic", "perplexity"]
  }
}
```

---

#### Branded Fare Families
```sql
CREATE TABLE branded_fare_families (
  id BIGSERIAL PRIMARY KEY,
  airline_id BIGINT REFERENCES airlines(id),
  fare_family_code TEXT NOT NULL,
  fare_family_name TEXT NOT NULL,
  cabin_class TEXT,                    -- "economy", "premium_economy", "business", "first"
  included_amenities JSONB NOT NULL,   -- {checked_bags: 2, wifi: "complimentary", ...}
  upsell_priority INTEGER DEFAULT 1,
  schema_org_markup JSONB,             -- Schema.org Flight offer markup
  ai_description_optimized TEXT        -- LLM-friendly description
);
```

**Example**: Copa Economy Flex
```json
{
  "fare_family_code": "ECON_FLEX",
  "fare_family_name": "Economy Flex",
  "included_amenities": {
    "checked_bags": 2,
    "wifi": "purchase_required",
    "seat_selection": "preferred_complimentary",
    "changes": "complimentary",
    "refundable": true,
    "priority_boarding": true
  },
  "ai_description_optimized": "Copa Economy Flex: Premium economy experience with maximum flexibility. Includes two free checked bags, preferred seat selection, priority boarding, complimentary changes, full refundability, and same-day standby. Perfect for business travelers needing flexibility."
}
```

---

#### FFP Tiers
```sql
CREATE TABLE ffp_tiers (
  id BIGSERIAL PRIMARY KEY,
  airline_id BIGINT REFERENCES airlines(id),
  tier_code TEXT NOT NULL,
  tier_name TEXT NOT NULL,
  tier_level INTEGER,                  -- 0=Base, 1=Silver, 2=Gold, 3=Platinum, 4=Top
  qualification_criteria JSONB,        -- {miles_required: 75000, segments_required: 75}
  benefits JSONB,                      -- {earn_rate_multiplier: 2.0, lounge_access: true, ...}
  partner_recognition JSONB            -- Star Alliance tier mapping
);
```

**Example**: Copa Platinum
```json
{
  "tier_code": "CM_PLATINUM",
  "tier_level": 3,
  "qualification_criteria": {
    "miles_required": 75000,
    "segments_required": 75,
    "qualification_period": "12_months"
  },
  "benefits": {
    "earn_rate_multiplier": 2.0,
    "lounge_access": true,
    "lounge_guest_passes": 5,
    "free_checked_bags": 3,
    "complimentary_upgrades": "confirmed_domestic"
  },
  "partner_recognition": {
    "star_alliance_tier": "Gold"
  }
}
```

---

### Relationship Model

```
airlines (1) ──────► (N) systems
systems (1) ──────► (N) api_endpoints
airlines (1) ──────► (N) branded_fare_families
airlines (1) ──────► (N) ffp_tiers
airlines (1) ──────► (N) ai_platform_integrations

workflows (N) ──────► (N) agents (via workflow_agents junction table)
agents (N) ──────► (N) agents (via agent_relationships for collaboration)
workflows (N) ──────► (N) systems (via workflow_system_dependencies)
workflows (N) ──────► (N) domains (via workflow_cross_domain_bridges)
```

---

## API Architecture

### NDC vs. Proprietary APIs

| Aspect | NDC APIs | Proprietary APIs |
|---|---|---|
| **Standard** | IATA NDC 21.3+ | Airline-specific |
| **Data Format** | XML (SOAP-style) | JSON (REST) |
| **Discoverability** | Limited (schema complexity) | High (OpenAPI/Swagger) |
| **Interoperability** | High across airlines | Low (airline-specific) |
| **Performance** | Moderate (XML overhead) | High (JSON efficiency) |
| **AI Platform Preference** | Low (verbose, hard to parse) | High (simple, fast) |

**AeroGraph Strategy**: Expose **both** NDC and proprietary JSON APIs

- **NDC APIs**: For GDS, OTAs, and compliance
- **Proprietary JSON APIs**: For AI platforms (ChatGPT, Claude, Perplexity)
- **Schema.org Markup**: For semantic understanding by LLMs

---

### API Endpoint Categories

#### 1. Shopping & Search APIs
- `POST /ndc/v21.3/airshopping`: NDC flight search
- `POST /api/v2/flights/search`: Proprietary JSON search (faster)
- `POST /api/v2/fares/recommend`: Fare family recommendations
- `GET /api/v2/ancillaries/catalog`: Ancillary services

**Performance Targets**:
- Search latency P95: <500ms
- Rate limit: 100 req/min per AI platform
- Cache TTL: 60 seconds for availability

---

#### 2. Booking & Ticketing APIs
- `POST /ndc/v21.3/ordercreate`: NDC booking creation
- `POST /api/v2/bookings`: Proprietary booking
- `POST /api/v2/payments/process`: Payment processing
- `POST /api/v2/tickets/issue`: E-ticket issuance

**Performance Targets**:
- Booking latency P95: <2000ms
- Payment authorization: <500ms
- Ticket issuance: <1000ms

---

#### 3. Loyalty & Personalization APIs
- `GET /api/v2/loyalty/accounts/{member_id}`: FFP account lookup
- `POST /api/v2/loyalty/benefits/eligibility`: Benefit eligibility check
- `GET /api/v2/preferences/{user_id}`: Passenger preferences
- `POST /api/v2/recommendations/personalized`: Personalized offers

**Performance Targets**:
- Loyalty lookup P95: <200ms
- Preference retrieval: <100ms
- Privacy: Differential privacy, K-anonymity (k≥10)

---

#### 4. Operational APIs
- `GET /api/v2/flights/{flight_number}/status`: Real-time flight status
- `POST /api/v2/checkin/start`: Online check-in
- `POST /api/v2/disruptions/rebooking`: IROPS rebooking
- `GET /api/v2/schedules/search`: Schedule lookup

---

### Authentication & Authorization

**OAuth2 Flow for AI Platforms**:

1. **Registration**: AI platform registers as OAuth2 client
   - Client ID: `chatgpt-openai-prod`
   - Client Secret: (secure credential)
   - Redirect URI: `https://chatgpt.com/oauth/callback`

2. **Token Request**:
   ```http
   POST /oauth2/token
   Content-Type: application/x-www-form-urlencoded

   grant_type=client_credentials
   &client_id=chatgpt-openai-prod
   &client_secret={secret}
   &scope=flight_search booking loyalty
   ```

3. **Token Response**:
   ```json
   {
     "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
     "token_type": "Bearer",
     "expires_in": 3600,
     "scope": "flight_search booking loyalty"
   }
   ```

4. **API Request with Token**:
   ```http
   POST /api/v2/flights/search
   Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
   Content-Type: application/json

   {
     "origin": "PTY",
     "destination": "MIA",
     "departure_date": "2025-11-15",
     "passengers": 1
   }
   ```

---

### Rate Limiting Strategy

**Per-AI-Platform Quotas**:

| AI Platform | Tier | Req/Min | Req/Day | Burst |
|---|---|---:|---:|---:|
| ChatGPT (OpenAI) | Premium | 500 | 250,000 | 100 |
| Claude (Anthropic) | Premium | 500 | 250,000 | 100 |
| Perplexity AI | Standard | 200 | 100,000 | 50 |
| Google Assistant | Standard | 200 | 100,000 | 50 |
| Amazon Alexa | Standard | 200 | 100,000 | 50 |
| Generic API Key | Basic | 100 | 50,000 | 20 |

**Rate Limit Headers**:
```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 500
X-RateLimit-Remaining: 487
X-RateLimit-Reset: 1699920000
Retry-After: 60
```

**Rate Limit Exceeded Response**:
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
Content-Type: application/json

{
  "error": "rate_limit_exceeded",
  "message": "API rate limit exceeded. Quota: 500 req/min. Retry after 60 seconds.",
  "limit": 500,
  "remaining": 0,
  "reset_at": "2025-11-10T15:30:00Z"
}
```

---

## Security & Privacy

### Passenger Privacy

**GDPR/CCPA Compliance**:

1. **Explicit Consent**: Passengers opt-in to preference learning
2. **Data Minimization**: Only collect necessary data
3. **Purpose Limitation**: Data used only for stated purposes
4. **Storage Limitation**: Preferences deleted after 24 months of inactivity
5. **Right to Access**: Passengers can view stored preferences via API
6. **Right to Erasure**: "Delete my data" removes all preferences
7. **Data Portability**: Export preferences in JSON format

**Privacy-Preserving Techniques**:

- **Differential Privacy**: Add statistical noise to aggregate queries
  - Example: "How many passengers prefer window seats?" → Answer: ~5,234 (±127 with ε=0.1)

- **K-Anonymity**: Ensure at least k=10 passengers share same attributes before revealing insights
  - Example: Don't reveal preferences for "Platinum members who fly PTY-MIA on Tuesdays" if only 3 exist

- **Federated Learning**: Train preference models locally on user devices, only aggregate model updates
  - AI platforms never see raw preference data

- **Encryption at Rest**: AES-256 encryption for all preference data
- **Encryption in Transit**: TLS 1.3 for all API communications

---

### API Security

**Authentication Methods**:

- **OAuth2**: AI platforms (ChatGPT, Claude, Perplexity)
- **API Keys**: Lower-tier integrations
- **mTLS**: High-security enterprise integrations (GDS, OTAs)
- **JWT**: Internal microservice authentication

**Authorization Scopes**:

| Scope | Permissions |
|---|---|
| `flight_search` | Search flights, view fares |
| `booking_read` | View existing bookings |
| `booking_write` | Create, modify, cancel bookings |
| `payment` | Process payments (requires PCI DSS compliance) |
| `loyalty` | Access FFP accounts, accrue/redeem miles |
| `preferences_read` | View passenger preferences |
| `preferences_write` | Update passenger preferences |

---

### PCI DSS Compliance (Payment APIs)

**Requirements**:

1. **Never Store CVV**: Only tokenize cards, never store CVV/CVC
2. **Tokenization**: Use payment gateway tokens (Stripe, Adyen)
3. **Network Segmentation**: Payment APIs on isolated network
4. **Logging**: All payment transactions logged immutably
5. **Quarterly Scans**: Vulnerability scanning by approved vendors

---

## Deployment Strategy

### 4-Wave Implementation

#### Wave 1 (Months 1-6): Foundation

**Scope**:
- Migrations 001-003 (domains, agent categories, tables)
- Migration 006 (reference data for 1 airline)
- Migration 009 (analytical views)
- API Gateway domain (Rate Limiter, Auth Manager)
- 1 AI platform integration (ChatGPT pilot)

**Workflows**:
- Complex Natural Language Flight Search
- API Gateway for AI Platforms

**Success Metrics**:
- 5,000 monthly AI queries
- 3% conversion rate
- 99.5% API uptime
- <500ms search latency P95

**Expected Revenue**: $500K-1M (annualized)

---

#### Wave 2 (Months 7-12): Personalization

**Scope**:
- Migration 004 (all 24 agents)
- Migration 005 (17 workflows)
- Loyalty & Personalization domain
- 2 additional AI platforms (Claude, Perplexity)

**Workflows**:
- Dynamic Fare Family Recommendation
- FFP Status Recognition & Benefits Application
- Personalized Flight & Ancillary Recommendations

**Success Metrics**:
- 20% higher conversion vs. non-personalized
- 60% personalization coverage
- +$20 ancillary revenue per booking

**Expected Revenue**: +$2-3M (incremental)

---

#### Wave 3 (Months 13-18): Automation

**Scope**:
- Migration 007 (knowledge graph)
- Transaction Execution domain (all agents active)
- Autonomous booking, payment, ticketing
- Self-service disruption management

**Workflows**:
- AI-Driven Booking Orchestration
- Autonomous Payment & Ticketing
- Self-Service Disruption Management

**Success Metrics**:
- 99% booking success rate
- 40% reduction in call center volume
- <5min IROPS rebooking time

**Expected Cost Savings**: $3-5M/year (reduced customer service)

---

#### Wave 4 (Months 19-24): Intelligence

**Scope**:
- Migration 008 (complete Copa seed data)
- Real-time inventory sync (<100ms latency)
- Advanced bundling and upsell optimization
- Dynamic upgrade matching

**Workflows**:
- Real-Time Inventory Synchronization
- Intelligent Ancillary Bundling
- Dynamic Upgrade Opportunity Matching

**Success Metrics**:
- 15% improvement in load factors
- 25% bundle acceptance rate
- 15% upgrade conversion

**Expected Revenue**: +$3-5M/year (optimized upsells)

---

### Infrastructure Requirements

**Cloud Architecture** (AWS/GCP/Azure):

- **API Gateway**: AWS API Gateway or Kong
- **Compute**: Kubernetes (EKS/GKE/AKS) for agent microservices
- **Database**: PostgreSQL 15+ (Supabase hosted or self-hosted)
- **Caching**: Redis for inventory/fare caching (60s TTL)
- **Message Queue**: Kafka for real-time inventory sync
- **Monitoring**: Datadog or New Relic for APM

**Scalability Targets**:

- **Concurrent Requests**: 10,000 req/s during peak
- **Database Connections**: 500 connection pool
- **Cache Hit Rate**: >90% for inventory queries
- **Agent Response Time**: <100ms per agent invocation

---

## Conclusion

This agentic distribution architecture positions airlines at the forefront of AI-driven commerce, enabling seamless integration with conversational AI platforms while maintaining control over brand, pricing, and customer relationships. By adopting this system, airlines can capture the growing market of AI-native travelers and reduce dependence on traditional OTAs.

**Next Steps**:

1. Execute migrations 001-009 in production
2. Populate airline-specific data (branded fares, FFP tiers, API endpoints)
3. Integrate first AI platform (ChatGPT recommended)
4. Monitor AI Readiness Scorecard weekly
5. Iterate on agentic workflows based on conversion data

---

**Document Control**:
- **Version**: 1.0
- **Last Updated**: 2025-11-10
- **Owner**: AeroGraph Platform Team
- **Approval**: Pending airline CTO/CIO sign-off
