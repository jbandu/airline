# Database Schema Documentation

**Last Updated:** 2025-10-26
**Schema Version:** Based on migrations up to 20251026021849

This document provides comprehensive documentation for all database tables in the AirFlow application.

---

## Table of Contents

1. [Overview](#overview)
2. [Tables](#tables)
   - [domains](#domains)
   - [subdomains](#subdomains)
   - [workflows](#workflows)
   - [stakeholders](#stakeholders)
   - [workflow_stakeholders](#workflow_stakeholders)
   - [workflow_comments](#workflow_comments)
   - [workflow_attachments](#workflow_attachments)
3. [Relationships](#relationships)
4. [Indexes](#indexes)
5. [Security (RLS Policies)](#security-rls-policies)
6. [Common Query Patterns](#common-query-patterns)

---

## Overview

The AirFlow database schema is designed to track airline workflow automation opportunities, implementation planning, and stakeholder collaboration. The schema uses PostgreSQL with Supabase and implements Row Level Security (RLS) for data protection.

**Key Design Principles:**
- UUID primary keys for distributed system compatibility
- Timestamp with timezone (timestamptz) for all temporal data
- Soft deletes via `archived_at` timestamps
- JSONB for flexible data structures
- Array types for multi-value fields
- Cascading deletes for referential integrity

---

## Tables

### domains

High-level business domains representing major operational areas.

**Purpose:** Categorize workflows into broad business domains such as "Flight Operations", "Revenue Management", "Customer Service", etc.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique domain identifier |
| `name` | text | NO | - | Domain name (e.g., "Flight Operations") |
| `description` | text | NO | '' | Detailed description of the domain |
| `icon_url` | text | YES | NULL | URL to custom domain icon/image |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |

**Example Data:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Flight Operations",
  "description": "All aspects of flight planning, execution, and monitoring",
  "icon_url": "https://storage.example.com/icons/flight-ops.png",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

---

### subdomains

Specific areas within a domain, providing granular categorization.

**Purpose:** Break down domains into specific functional areas for more precise workflow classification.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique subdomain identifier |
| `domain_id` | uuid | NO | - | Parent domain reference (FK to domains.id) |
| `name` | text | NO | - | Subdomain name |
| `description` | text | NO | '' | Subdomain description |
| `created_by` | uuid | YES | NULL | User who created the subdomain (FK to auth.users.id) |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |

**Constraints:**
- `domain_id` references `domains(id)` ON DELETE CASCADE

**Example Data:**
```json
{
  "id": "234e5678-e89b-12d3-a456-426614174001",
  "domain_id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Flight Dispatch",
  "description": "Flight planning and dispatch operations",
  "created_by": "345e6789-e89b-12d3-a456-426614174002",
  "created_at": "2025-01-15T11:00:00Z",
  "updated_at": "2025-01-15T11:00:00Z"
}
```

---

### workflows

Main table for tracking workflow automation opportunities and their details.

**Purpose:** Store all information about workflows, including classification, business context, technical details, and implementation planning.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique workflow identifier |
| `name` | text | NO | - | Workflow name |
| `description` | text | NO | '' | Detailed workflow description |
| `domain_id` | uuid | YES | NULL | Associated domain (FK to domains.id) |
| `subdomain_id` | uuid | YES | NULL | Associated subdomain (FK to subdomains.id) |
| **Scoring & Classification** | | | | |
| `complexity` | int | NO | 3 | Complexity score (1-5) |
| `agentic_potential` | int | NO | 3 | Automation potential score (1-5) |
| `autonomy_level` | int | NO | 3 | Autonomy level (1-5) |
| `implementation_wave` | int | NO | 1 | Wave 1, 2, or 3 |
| `status` | text | NO | 'draft' | Current status (draft, planned, in-progress, completed, archived) |
| **Categorization** | | | | |
| `airline_type` | text[] | NO | '{}' | Applicable airline types (e.g., ["Full Service", "Low Cost"]) |
| `agentic_function_type` | text | NO | '' | Type of AI function |
| `ai_enablers` | text[] | NO | '{}' | AI technologies used (e.g., ["NLP", "Computer Vision"]) |
| `systems_involved` | text[] | NO | '{}' | Systems integration list |
| **Business Context** | | | | |
| `business_context` | text | NO | '' | Business justification and context |
| `expected_roi` | text | NO | '' | Return on investment estimate |
| `dependencies` | text[] | NO | '{}' | Workflow dependencies |
| `success_metrics` | jsonb | NO | '[]'::jsonb | Success metrics data (flexible structure) |
| **Versioning & Metadata** | | | | |
| `version` | int | NO | 1 | Version number |
| `created_by` | uuid | YES | NULL | Creator user ID (FK to auth.users.id) |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Last update timestamp |
| **Soft Delete** | | | | |
| `archived_at` | timestamptz | YES | NULL | Soft delete timestamp |
| `parent_workflow_id` | uuid | YES | NULL | For cloned workflows (FK to workflows.id) |

**Constraints:**
- `complexity` CHECK (complexity >= 1 AND complexity <= 5)
- `agentic_potential` CHECK (agentic_potential >= 1 AND agentic_potential <= 5)
- `autonomy_level` CHECK (autonomy_level >= 1 AND autonomy_level <= 5)
- `implementation_wave` CHECK (implementation_wave >= 1 AND implementation_wave <= 3)
- `domain_id` references `domains(id)` ON DELETE SET NULL
- `subdomain_id` references `subdomains(id)` ON DELETE SET NULL
- `parent_workflow_id` references `workflows(id)` ON DELETE SET NULL

**Example Data:**
```json
{
  "id": "456e7890-e89b-12d3-a456-426614174003",
  "name": "Automated Flight Plan Optimization",
  "description": "AI-powered system to optimize flight plans for fuel efficiency",
  "domain_id": "123e4567-e89b-12d3-a456-426614174000",
  "subdomain_id": "234e5678-e89b-12d3-a456-426614174001",
  "complexity": 4,
  "agentic_potential": 5,
  "autonomy_level": 3,
  "implementation_wave": 1,
  "status": "planned",
  "airline_type": ["Full Service", "Charter"],
  "agentic_function_type": "Optimization Agent",
  "ai_enablers": ["Machine Learning", "Optimization Algorithms"],
  "systems_involved": ["Flight Planning System", "Weather API", "Fuel Management"],
  "business_context": "Reduce fuel costs and environmental impact",
  "expected_roi": "15% reduction in fuel costs, estimated $2M annual savings",
  "dependencies": ["Weather Data Integration", "Real-time Aircraft Position"],
  "success_metrics": [
    {
      "name": "Fuel Cost Reduction",
      "target": "15%",
      "baseline": "Current average fuel cost per flight",
      "timeframe": "12 months"
    }
  ],
  "version": 1,
  "created_by": "345e6789-e89b-12d3-a456-426614174002",
  "created_at": "2025-01-16T09:00:00Z",
  "updated_at": "2025-01-16T09:00:00Z",
  "archived_at": null,
  "parent_workflow_id": null
}
```

---

### stakeholders

People involved in workflows across the organization.

**Purpose:** Track individuals who have roles in various workflows.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique stakeholder identifier |
| `name` | text | NO | - | Stakeholder name |
| `role` | text | NO | '' | Stakeholder role/title |
| `email` | text | NO | '' | Contact email |
| `department` | text | NO | '' | Department name |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |

**Example Data:**
```json
{
  "id": "567e8901-e89b-12d3-a456-426614174004",
  "name": "Jane Smith",
  "role": "VP of Operations",
  "email": "jane.smith@airline.com",
  "department": "Flight Operations",
  "created_at": "2025-01-10T08:00:00Z"
}
```

---

### workflow_stakeholders

Junction table linking stakeholders to workflows.

**Purpose:** Many-to-many relationship between workflows and stakeholders, with role specification.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Junction table identifier |
| `workflow_id` | uuid | NO | - | Workflow reference (FK to workflows.id) |
| `stakeholder_id` | uuid | NO | - | Stakeholder reference (FK to stakeholders.id) |
| `role_in_workflow` | text | NO | '' | Specific role in this workflow (e.g., "Sponsor", "Implementer") |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |

**Constraints:**
- `workflow_id` references `workflows(id)` ON DELETE CASCADE
- `stakeholder_id` references `stakeholders(id)` ON DELETE CASCADE
- UNIQUE constraint on (workflow_id, stakeholder_id)

**Example Data:**
```json
{
  "id": "678e9012-e89b-12d3-a456-426614174005",
  "workflow_id": "456e7890-e89b-12d3-a456-426614174003",
  "stakeholder_id": "567e8901-e89b-12d3-a456-426614174004",
  "role_in_workflow": "Executive Sponsor",
  "created_at": "2025-01-16T09:30:00Z"
}
```

---

### workflow_comments

Comments and discussions on workflows.

**Purpose:** Enable collaboration and discussion on workflow implementations.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique comment identifier |
| `workflow_id` | uuid | NO | - | Associated workflow (FK to workflows.id) |
| `user_id` | uuid | YES | NULL | Comment author (FK to auth.users.id) |
| `content` | text | NO | - | Comment text |
| `created_at` | timestamptz | NO | now() | Comment timestamp |

**Constraints:**
- `workflow_id` references `workflows(id)` ON DELETE CASCADE

**Example Data:**
```json
{
  "id": "789e0123-e89b-12d3-a456-426614174006",
  "workflow_id": "456e7890-e89b-12d3-a456-426614174003",
  "user_id": "345e6789-e89b-12d3-a456-426614174002",
  "content": "We should consider integrating with the new weather prediction API for better accuracy",
  "created_at": "2025-01-17T14:22:00Z"
}
```

---

### workflow_attachments

Files attached to workflows.

**Purpose:** Store references to documents, diagrams, and other files related to workflows.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Unique attachment identifier |
| `workflow_id` | uuid | NO | - | Associated workflow (FK to workflows.id) |
| `filename` | text | NO | - | Original filename |
| `file_url` | text | NO | - | Storage URL (typically Supabase Storage) |
| `file_type` | text | NO | '' | MIME type |
| `uploaded_by` | uuid | YES | NULL | Uploader user ID (FK to auth.users.id) |
| `created_at` | timestamptz | NO | now() | Upload timestamp |

**Constraints:**
- `workflow_id` references `workflows(id)` ON DELETE CASCADE

**Example Data:**
```json
{
  "id": "890e1234-e89b-12d3-a456-426614174007",
  "workflow_id": "456e7890-e89b-12d3-a456-426614174003",
  "filename": "flight-optimization-architecture.pdf",
  "file_url": "https://storage.example.com/attachments/890e1234.pdf",
  "file_type": "application/pdf",
  "uploaded_by": "345e6789-e89b-12d3-a456-426614174002",
  "created_at": "2025-01-17T15:30:00Z"
}
```

---

## Relationships

```
domains (1) ──────< (N) subdomains
   │                      │
   │                      │
   └───< (N) workflows <──┘
           │
           ├───< (N) workflow_stakeholders >───< (N) stakeholders
           │
           ├───< (N) workflow_comments
           │
           └───< (N) workflow_attachments
```

**Relationship Details:**

1. **Domain → Subdomains** (One-to-Many)
   - One domain can have many subdomains
   - ON DELETE CASCADE: Deleting a domain deletes all its subdomains

2. **Subdomain → Workflows** (One-to-Many)
   - One subdomain can have many workflows
   - ON DELETE SET NULL: Deleting a subdomain doesn't delete workflows, just nulls the reference

3. **Domain → Workflows** (One-to-Many, optional)
   - Direct domain assignment without subdomain
   - ON DELETE SET NULL

4. **Workflow → Stakeholders** (Many-to-Many via workflow_stakeholders)
   - ON DELETE CASCADE: Deleting workflow or stakeholder removes the association

5. **Workflow → Comments** (One-to-Many)
   - ON DELETE CASCADE: Deleting workflow deletes all comments

6. **Workflow → Attachments** (One-to-Many)
   - ON DELETE CASCADE: Deleting workflow deletes all attachment records

7. **Workflow → Workflow** (Parent/Clone relationship)
   - Self-referential for tracking cloned workflows
   - ON DELETE SET NULL

---

## Indexes

Performance-optimized indexes for common query patterns:

### domains
- Primary key index on `id`

### subdomains
- Primary key index on `id`
- `idx_subdomains_domain_id` on `domain_id`
- `idx_subdomains_created_by` on `created_by`

### workflows
- Primary key index on `id`
- `idx_workflows_domain_id` on `domain_id`
- `idx_workflows_subdomain_id` on `subdomain_id`
- `idx_workflows_status` on `status`
- `idx_workflows_wave` on `implementation_wave`
- `idx_workflows_archived` on `archived_at`
- `idx_workflows_parent` on `parent_workflow_id`

### workflow_stakeholders
- Primary key index on `id`
- `idx_workflow_stakeholders_workflow` on `workflow_id`
- `idx_workflow_stakeholders_stakeholder` on `stakeholder_id`
- Unique index on `(workflow_id, stakeholder_id)`

### workflow_comments
- Primary key index on `id`
- `idx_workflow_comments_workflow` on `workflow_id`

### workflow_attachments
- Primary key index on `id`
- `idx_workflow_attachments_workflow` on `workflow_id`

---

## Security (RLS Policies)

All tables have Row Level Security (RLS) enabled with the following policies:

### Policy Pattern (Applied to all tables)

**SELECT Policy:** Authenticated users can view all records
```sql
CREATE POLICY "Authenticated users can view {table}"
  ON {table} FOR SELECT
  TO authenticated
  USING (true);
```

**INSERT Policy:** Authenticated users can insert records
```sql
CREATE POLICY "Authenticated users can insert {table}"
  ON {table} FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

**UPDATE Policy:** Authenticated users can update records
```sql
CREATE POLICY "Authenticated users can update {table}"
  ON {table} FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

**DELETE Policy:** Authenticated users can delete records
```sql
CREATE POLICY "Authenticated users can delete {table}"
  ON {table} FOR DELETE
  TO authenticated
  USING (true);
```

**Note:** Current implementation allows all authenticated users full CRUD access. Consider implementing more granular policies based on user roles and ownership in production.

---

## Common Query Patterns

### Get workflows with full hierarchy

```sql
SELECT
  w.*,
  s.name as subdomain_name,
  s.description as subdomain_description,
  d.name as domain_name,
  d.description as domain_description
FROM workflows w
LEFT JOIN subdomains s ON w.subdomain_id = s.id
LEFT JOIN domains d ON s.domain_id = d.id
WHERE w.archived_at IS NULL
ORDER BY w.created_at DESC;
```

### Get active workflows by implementation wave

```sql
SELECT *
FROM workflows
WHERE archived_at IS NULL
  AND implementation_wave = 1
  AND status IN ('planned', 'in-progress')
ORDER BY agentic_potential DESC, complexity ASC;
```

### Get workflow with stakeholders

```sql
SELECT
  w.*,
  json_agg(
    json_build_object(
      'id', sh.id,
      'name', sh.name,
      'role', sh.role,
      'role_in_workflow', ws.role_in_workflow
    )
  ) as stakeholders
FROM workflows w
LEFT JOIN workflow_stakeholders ws ON w.id = ws.workflow_id
LEFT JOIN stakeholders sh ON ws.stakeholder_id = sh.id
WHERE w.id = $1
GROUP BY w.id;
```

### Count workflows by domain

```sql
SELECT
  d.name,
  COUNT(w.id) as workflow_count,
  AVG(w.agentic_potential) as avg_potential,
  AVG(w.complexity) as avg_complexity
FROM domains d
LEFT JOIN subdomains s ON d.id = s.domain_id
LEFT JOIN workflows w ON s.id = w.subdomain_id AND w.archived_at IS NULL
GROUP BY d.id, d.name
ORDER BY workflow_count DESC;
```

### Soft delete (archive) workflow

```sql
UPDATE workflows
SET archived_at = NOW()
WHERE id = $1;
```

### Clone workflow

```sql
INSERT INTO workflows (
  name, description, domain_id, subdomain_id,
  complexity, agentic_potential, autonomy_level,
  implementation_wave, status, airline_type,
  agentic_function_type, ai_enablers, systems_involved,
  business_context, expected_roi, dependencies,
  created_by, parent_workflow_id
)
SELECT
  name || ' (Copy)',
  description,
  domain_id,
  subdomain_id,
  complexity,
  agentic_potential,
  autonomy_level,
  implementation_wave,
  'draft' as status,
  airline_type,
  agentic_function_type,
  ai_enablers,
  systems_involved,
  business_context,
  expected_roi,
  dependencies,
  $2 as created_by,
  id as parent_workflow_id
FROM workflows
WHERE id = $1
RETURNING *;
```

---

## Migration History

- **20251019231658** - Create initial schema (domains, subdomains, workflows, stakeholders, comments, attachments)
- **20251019235023** - Add soft delete (`archived_at`) and parent workflow tracking (`parent_workflow_id`)
- **20251022120752** - Add RLS policies for workflow_versions (Note: workflow_versions table was never created, this migration is defunct)
- **20251022124616** - Add `icon_url` to domains table
- **20251026021849** - Add `created_by` to subdomains table

---

## Best Practices

1. **Always filter archived workflows** unless specifically querying historical data:
   ```sql
   WHERE archived_at IS NULL
   ```

2. **Use transactions** for operations that modify multiple related records

3. **Validate constraint ranges** before insert/update:
   - complexity: 1-5
   - agentic_potential: 1-5
   - autonomy_level: 1-5
   - implementation_wave: 1-3

4. **Use array operations** for multi-value fields:
   ```sql
   WHERE 'NLP' = ANY(ai_enablers)
   ```

5. **Leverage JSONB** for flexible success metrics while maintaining queryability

6. **Set `updated_at`** on every update operation (consider using triggers)

---

## TypeScript Type Definitions

For TypeScript integration, see:
- `src/types/database.types.ts` - Complete type definitions matching this schema
- Types include: `Domain`, `Subdomain`, `Workflow`, `Stakeholder`, etc.
- Helper types: `WorkflowWithRelations`, `DomainInsert`, `WorkflowUpdate`, etc.

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- Migration files: `supabase/migrations/`
- TypeScript types: `src/types/database.types.ts`
- Validation utilities: `src/lib/dataValidator.ts`
