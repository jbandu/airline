/*
  Migration 002: Agentic Distribution Agent Categories

  Purpose: Add new agent categories for AI-driven distribution and commerce
  Based on: Hotel agentic commerce model adapted for airline industry

  New Categories (5):
  1. Agentic Shopping (SHOP) - Discovery and search
  2. Content Syndication (SYNC) - Brand management and content distribution
  3. Transaction Execution (EXEC) - Booking and payment processing
  4. API Gateway (GATE) - Infrastructure and integration
  5. Personalization Engine (PERS) - Loyalty and customer preferences

  These complement existing categories:
  - decisioning, predictive, conversational, automation, monitoring, data_processing
*/

-- ============================================================================
-- INSERT NEW AGENT CATEGORIES
-- ============================================================================

INSERT INTO agent_categories (code, name, description, icon, color) VALUES
  (
    'agentic_shopping',
    'Agentic Shopping',
    'AI agents that handle complex shopping queries, multi-constraint search, and intelligent product discovery across conversational platforms. Translates natural language requests into flight search parameters.',
    '🔍',
    '#10b981'
  ),
  (
    'content_syndication',
    'Content Syndication',
    'Agents managing airline brand content distribution, NDC standardization, and multi-channel governance. Ensures accurate product representation across GDS, OTAs, metasearch, and AI platforms.',
    '📡',
    '#f59e0b'
  ),
  (
    'transaction_execution',
    'Transaction Execution',
    'End-to-end booking orchestration agents handling PNR creation, payment processing, ticketing, and post-booking services without human intervention.',
    '⚡',
    '#ef4444'
  ),
  (
    'api_gateway',
    'API Gateway',
    'Infrastructure agents managing API authentication, rate limiting, request routing, and real-time data synchronization for external platform integrations.',
    '🚪',
    '#8b5cf6'
  ),
  (
    'personalization',
    'Personalization Engine',
    'Privacy-preserving agents for FFP recognition, preference learning, and personalized recommendations. Adapts offers to passenger context while respecting consent and data protection regulations.',
    '🎯',
    '#ec4899'
  )
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to confirm all 11 categories now exist:
-- SELECT code, name, icon, color FROM agent_categories ORDER BY code;
--
-- Expected result:
-- agentic_shopping      | Agentic Shopping            | 🔍 | #10b981
-- api_gateway           | API Gateway                 | 🚪 | #8b5cf6
-- automation            | Process Automation          | ⚡ | #10b981
-- content_syndication   | Content Syndication         | 📡 | #f59e0b
-- conversational        | Conversational AI           | 💬 | #3b82f6
-- data_processing       | Data Processing             | 📊 | #06b6d4
-- decisioning           | Decisioning & Optimization  | 🎯 | #ec4899
-- monitoring            | Monitoring & Alerts         | 👁️ | #f59e0b
-- personalization       | Personalization Engine      | 🎯 | #ec4899
-- predictive            | Predictive & Forecasting    | 🔮 | #8b5cf6
-- transaction_execution | Transaction Execution       | ⚡ | #ef4444
--
-- Total: 11 categories (6 existing + 5 new)
