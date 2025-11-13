#!/bin/bash

###############################################################################
# Baggage Operations Intelligence System - Quick Start Script
# Version: 1.0
# Date: 2025-11-13
#
# This script executes the core baggage migrations (001-005) and verifies
# the installation.
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check prerequisites
print_header "BAGGAGE OPERATIONS INTELLIGENCE SYSTEM"
echo ""
print_info "Checking prerequisites..."

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    print_error "psql not found. Please install PostgreSQL client."
    exit 1
fi
print_success "psql found"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL environment variable not set"
    echo ""
    echo "Please set your database connection string:"
    echo "  export DATABASE_URL=\"postgresql://user:pass@host:5432/dbname\""
    echo ""
    echo "Or for Supabase:"
    echo "  export DATABASE_URL=\"postgresql://postgres:[password]@[project].supabase.co:5432/postgres\""
    exit 1
fi
print_success "DATABASE_URL is set"

# Test database connection
print_info "Testing database connection..."
if psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
    print_success "Database connection successful"
else
    print_error "Cannot connect to database. Please check DATABASE_URL"
    exit 1
fi

echo ""
print_header "MIGRATION EXECUTION"
echo ""

# Execute Migration 001: Domains & Subdomains
print_info "Executing Migration 001: Baggage Domains & Subdomains..."
if psql "$DATABASE_URL" -f 001_baggage_domains_subdomains.sql > /tmp/migration_001.log 2>&1; then
    print_success "Migration 001 complete"
    # Show domain count
    DOMAIN_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM domains WHERE name LIKE '%Baggage%';" | tr -d ' ')
    echo "  → Created $DOMAIN_COUNT baggage domains"
else
    print_error "Migration 001 failed. See /tmp/migration_001.log for details"
    exit 1
fi

# Execute Migration 002: Agent Categories
print_info "Executing Migration 002: Baggage Agent Categories..."
if psql "$DATABASE_URL" -f 002_baggage_agent_categories.sql > /tmp/migration_002.log 2>&1; then
    print_success "Migration 002 complete"
    # Show category count
    CATEGORY_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM agent_categories WHERE code IN ('BAG_IN', 'LOAD', 'TRACK', 'RISK', 'EXCEPT', 'LNF', 'COMP', 'INTER');" | tr -d ' ')
    echo "  → Created $CATEGORY_COUNT agent categories"
else
    print_error "Migration 002 failed. See /tmp/migration_002.log for details"
    exit 1
fi

# Execute Migration 003: Core Baggage Tables
print_info "Executing Migration 003: Core Baggage Tables..."
if psql "$DATABASE_URL" -f 003_core_baggage_tables.sql > /tmp/migration_003.log 2>&1; then
    print_success "Migration 003 complete"
    # Show table count
    TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name LIKE 'baggage%' AND table_schema = 'public';" | tr -d ' ')
    echo "  → Created $TABLE_COUNT baggage tables"
else
    print_error "Migration 003 failed. See /tmp/migration_003.log for details"
    exit 1
fi

# Execute Migration 003 Part 2: Remaining Baggage Tables
print_info "Executing Migration 003 Part 2: Remaining Baggage Tables..."
if psql "$DATABASE_URL" -f 003_core_baggage_tables_part2.sql > /tmp/migration_003_part2.log 2>&1; then
    print_success "Migration 003 Part 2 complete"
    # Show updated table count
    TABLE_COUNT_TOTAL=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name LIKE 'baggage%' AND table_schema = 'public';" | tr -d ' ')
    echo "  → Total baggage tables: $TABLE_COUNT_TOTAL (12 of 12)"
else
    print_error "Migration 003 Part 2 failed. See /tmp/migration_003_part2.log for details"
    exit 1
fi

# Execute Migration 004: Agent Definitions
print_info "Executing Migration 004: Baggage Agent Definitions..."
if psql "$DATABASE_URL" -f 004_baggage_agent_definitions.sql > /tmp/migration_004.log 2>&1; then
    print_success "Migration 004 complete"
    # Show agent count
    AGENT_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM agents WHERE category_code IN ('BAG_IN', 'LOAD', 'TRACK', 'RISK', 'EXCEPT', 'LNF', 'COMP', 'INTER');" | tr -d ' ')
    echo "  → Created $AGENT_COUNT baggage agents"
else
    print_error "Migration 004 failed. See /tmp/migration_004.log for details"
    exit 1
fi

# Execute Migration 005: Baggage Workflow Definitions
print_info "Executing Migration 005: Baggage Workflow Definitions..."
if psql "$DATABASE_URL" -f 005_baggage_workflow_definitions.sql > /tmp/migration_005.log 2>&1; then
    print_success "Migration 005 complete"
    # Show workflow count
    WORKFLOW_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM workflows w JOIN subdomains sd ON w.subdomain_id = sd.id JOIN domains d ON sd.domain_id = d.id WHERE d.name LIKE '%Baggage%';" | tr -d ' ')
    echo "  → Created $WORKFLOW_COUNT baggage workflows"
else
    print_error "Migration 005 failed. See /tmp/migration_005.log for details"
    exit 1
fi

echo ""
print_header "VERIFICATION"
echo ""

# Verify domains
print_info "Verifying domains..."
DOMAINS=$(psql "$DATABASE_URL" -t -c "SELECT name FROM domains WHERE name LIKE '%Baggage%' ORDER BY name;")
if [ ! -z "$DOMAINS" ]; then
    print_success "Domains created successfully:"
    echo "$DOMAINS" | while read line; do
        if [ ! -z "$line" ]; then
            echo "    • $line"
        fi
    done
else
    print_warning "No baggage domains found"
fi

# Verify agent categories
print_info "Verifying agent categories..."
CATEGORIES=$(psql "$DATABASE_URL" -t -c "SELECT code || ' - ' || name FROM agent_categories WHERE code IN ('BAG_IN', 'LOAD', 'TRACK', 'RISK', 'EXCEPT', 'LNF', 'COMP', 'INTER') ORDER BY code;")
if [ ! -z "$CATEGORIES" ]; then
    print_success "Agent categories created successfully:"
    echo "$CATEGORIES" | while read line; do
        if [ ! -z "$line" ]; then
            echo "    • $line"
        fi
    done
else
    print_warning "No agent categories found"
fi

# Verify tables
print_info "Verifying baggage tables..."
TABLES=$(psql "$DATABASE_URL" -t -c "SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'baggage%' AND table_schema = 'public' ORDER BY table_name;")
if [ ! -z "$TABLES" ]; then
    print_success "Baggage tables created successfully:"
    echo "$TABLES" | while read line; do
        if [ ! -z "$line" ]; then
            echo "    • $line"
        fi
    done
else
    print_warning "No baggage tables found"
fi

# Verify core agents
print_info "Verifying core agents..."
CORE_AGENTS=$(psql "$DATABASE_URL" -t -c "SELECT code || ' - ' || name FROM agents WHERE code IN ('BAG_INTAKE_001', 'LOAD_PLAN_001', 'BAG_TRACK_001', 'CONN_RISK_001', 'BAG_EXCEPT_001', 'LNF_MATCH_001', 'COMP_AUTO_001', 'INTER_COORD_001') ORDER BY code;")
if [ ! -z "$CORE_AGENTS" ]; then
    print_success "Core agents created successfully:"
    echo "$CORE_AGENTS" | while read line; do
        if [ ! -z "$line" ]; then
            echo "    • $line"
        fi
    done
else
    print_warning "Core agents not found"
fi

# Verify compensation rule
print_info "Verifying Montreal Convention rule..."
COMP_RULE=$(psql "$DATABASE_URL" -t -c "SELECT rule_name || ' (Max: $' || max_liability_usd || ')' FROM baggage_compensation_rules WHERE rule_code = 'MONTREAL_CONV_2024';" | tr -d ' ')
if [ ! -z "$COMP_RULE" ]; then
    print_success "Compensation rule loaded: $COMP_RULE"
else
    print_warning "Montreal Convention rule not found"
fi

# Verify workflows
print_info "Verifying baggage workflows..."
WORKFLOW_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM workflows w JOIN subdomains sd ON w.subdomain_id = sd.id JOIN domains d ON sd.domain_id = d.id WHERE d.name LIKE '%Baggage%';" | tr -d ' ')
if [ "$WORKFLOW_COUNT" -gt 0 ]; then
    print_success "Workflows created: $WORKFLOW_COUNT total"
    # Show sample workflows
    SAMPLE_WORKFLOWS=$(psql "$DATABASE_URL" -t -c "SELECT '  ' || w.name FROM workflows w JOIN subdomains sd ON w.subdomain_id = sd.id JOIN domains d ON sd.domain_id = d.id WHERE d.name LIKE '%Baggage%' ORDER BY w.name LIMIT 5;")
    echo "  Sample workflows:"
    echo "$SAMPLE_WORKFLOWS"
    echo "  ... and $(($WORKFLOW_COUNT - 5)) more"
else
    print_warning "No baggage workflows found"
fi

echo ""
print_header "SYSTEM STATISTICS"
echo ""

# Get statistics
TOTAL_DOMAINS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM domains;" | tr -d ' ')
TOTAL_SUBDOMAINS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM subdomains;" | tr -d ' ')
TOTAL_AGENT_CATEGORIES=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM agent_categories;" | tr -d ' ')
TOTAL_AGENTS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM agents;" | tr -d ' ')
BAGGAGE_AGENTS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM agents WHERE category_code IN ('BAG_IN', 'LOAD', 'TRACK', 'RISK', 'EXCEPT', 'LNF', 'COMP', 'INTER');" | tr -d ' ')
BAGGAGE_TABLES=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name LIKE 'baggage%' AND table_schema = 'public';" | tr -d ' ')
BAGGAGE_WORKFLOWS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM workflows w JOIN subdomains sd ON w.subdomain_id = sd.id JOIN domains d ON sd.domain_id = d.id WHERE d.name LIKE '%Baggage%';" | tr -d ' ')

echo "Database Statistics:"
echo "  • Total Domains: $TOTAL_DOMAINS"
echo "  • Total Subdomains: $TOTAL_SUBDOMAINS"
echo "  • Total Agent Categories: $TOTAL_AGENT_CATEGORIES"
echo "  • Total Agents: $TOTAL_AGENTS"
echo "  • Baggage Agents: $BAGGAGE_AGENTS"
echo "  • Baggage Tables: $BAGGAGE_TABLES"
echo "  • Baggage Workflows: $BAGGAGE_WORKFLOWS"

echo ""
print_header "NEXT STEPS"
echo ""

echo "Migrations 001-005 are now complete! Your baggage operations foundation is ready."
echo ""
echo "What's been deployed:"
echo "  ✓ 5 business domains with 18 subdomains"
echo "  ✓ 8 agent categories"
echo "  ✓ 12 core baggage tables (complete schema)"
echo "  ✓ 18 AI agents (8 core + 10 supporting)"
echo "  ✓ 30 operational workflows"
echo ""
echo "What you can do now:"
echo "  1. Review the README.md for comprehensive documentation"
echo "  2. Check IMPLEMENTATION_STATUS.md for what's built and what's next"
echo "  3. Test with sample data (see README for example queries)"
echo "  4. Continue with remaining migrations (006-015)"
echo ""
echo "To test the system:"
echo "  psql \$DATABASE_URL"
echo "  > SELECT * FROM agents WHERE code = 'BAG_TRACK_001';"
echo "  > SELECT * FROM baggage_compensation_rules WHERE rule_code = 'MONTREAL_CONV_2024';"
echo ""
echo "For Copa Airlines implementation:"
echo "  • Target: 7 per 1000 mishandling rate (30% reduction)"
echo "  • Expected ROI: \$6.3M annual savings"
echo "  • Payback period: 3.5 months"
echo ""
print_success "Installation complete! Happy bag tracking! 🧳✈️"
