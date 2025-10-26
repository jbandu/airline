/**
 * Database Type Definitions
 *
 * These types match the actual Supabase schema as defined in migrations.
 * Generated from schema migrations to ensure type safety.
 *
 * Last updated: 2025-10-26
 * Schema version: Based on migrations up to 20251026021849
 */

export interface User {
  id: string;
  email?: string;
  raw_user_meta_data?: {
    full_name?: string;
    name?: string;
  };
}

/**
 * Domains Table
 * Represents high-level business domains (e.g., "Flight Operations", "Revenue Management")
 */
export interface Domain {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Subdomains Table
 * Represents specific areas within a domain
 */
export interface Subdomain {
  id: string;
  domain_id: string;
  name: string;
  description: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Workflows Table
 * Main workflow/opportunity tracking table with all workflow data
 */
export interface Workflow {
  id: string;
  name: string;
  description: string;
  domain_id: string | null;
  subdomain_id: string | null;

  // Scoring and Classification
  complexity: number; // 1-5
  agentic_potential: number; // 1-5
  autonomy_level: number; // 1-5
  implementation_wave: number; // 1, 2, or 3
  status: string; // draft, planned, in-progress, completed, archived

  // Categorization
  airline_type: string[]; // e.g., ["Full Service", "Low Cost"]
  agentic_function_type: string;
  ai_enablers: string[]; // e.g., ["NLP", "Computer Vision"]
  systems_involved: string[];

  // Business Context
  business_context: string;
  expected_roi: string;
  dependencies: string[];
  success_metrics: any; // JSONB - flexible structure

  // Versioning and Metadata
  version: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;

  // Soft Delete
  archived_at: string | null;
  parent_workflow_id: string | null; // For cloned workflows
}

/**
 * Stakeholders Table
 * People involved in workflows
 */
export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  created_at: string;
}

/**
 * Workflow Stakeholders Junction Table
 * Links stakeholders to workflows
 */
export interface WorkflowStakeholder {
  id: string;
  workflow_id: string;
  stakeholder_id: string;
  role_in_workflow: string;
  created_at: string;
}

/**
 * Workflow Comments Table
 * Comments on workflows
 */
export interface WorkflowComment {
  id: string;
  workflow_id: string;
  user_id: string | null;
  content: string;
  created_at: string;
}

/**
 * Workflow Attachments Table
 * Files attached to workflows
 */
export interface WorkflowAttachment {
  id: string;
  workflow_id: string;
  filename: string;
  file_url: string;
  file_type: string;
  uploaded_by: string | null;
  created_at: string;
}

/**
 * Extended Workflow with Relations
 * Used for queries that include related data
 */
export interface WorkflowWithRelations extends Workflow {
  subdomain?: Subdomain & {
    domain?: Domain;
  };
  domain?: Domain;
  stakeholders?: (WorkflowStakeholder & {
    stakeholder: Stakeholder;
  })[];
  comments?: WorkflowComment[];
  attachments?: WorkflowAttachment[];
}

/**
 * Domain with Statistics
 * Used in domain listing pages
 */
export interface DomainWithStats extends Domain {
  subdomainCount: number;
  workflowCount: number;
}

/**
 * Subdomain with Statistics
 * Used in subdomain listing pages
 */
export interface SubdomainWithStats extends Subdomain {
  workflowCount: number;
  domain?: Domain;
}

/**
 * Success Metric
 * Structure for success metrics within workflows
 */
export interface SuccessMetric {
  name: string;
  target: string;
  current?: string;
  baseline?: string;
  timeframe?: string;
}

/**
 * Database Insert Types
 * Omit auto-generated fields for insert operations
 */
export type DomainInsert = Omit<Domain, 'id' | 'created_at' | 'updated_at'>;
export type SubdomainInsert = Omit<Subdomain, 'id' | 'created_at' | 'updated_at'>;
export type WorkflowInsert = Omit<Workflow, 'id' | 'created_at' | 'updated_at' | 'version'>;
export type StakeholderInsert = Omit<Stakeholder, 'id' | 'created_at'>;
export type WorkflowCommentInsert = Omit<WorkflowComment, 'id' | 'created_at'>;
export type WorkflowAttachmentInsert = Omit<WorkflowAttachment, 'id' | 'created_at'>;

/**
 * Database Update Types
 * All fields optional for updates except ID
 */
export type DomainUpdate = Partial<Omit<Domain, 'id' | 'created_at'>>;
export type SubdomainUpdate = Partial<Omit<Subdomain, 'id' | 'created_at'>>;
export type WorkflowUpdate = Partial<Omit<Workflow, 'id' | 'created_at'>>;
export type StakeholderUpdate = Partial<Omit<Stakeholder, 'id' | 'created_at'>>;

/**
 * Filter Types
 * Common filter structures for queries
 */
export interface WorkflowFilters {
  status?: string[];
  implementation_wave?: number[];
  complexity_min?: number;
  complexity_max?: number;
  agentic_potential_min?: number;
  agentic_potential_max?: number;
  domain_id?: string;
  subdomain_id?: string;
  search?: string;
}

/**
 * Query Result Types
 * Standardized query result structures
 */
export interface QueryResult<T> {
  data: T | null;
  error: Error | null;
  count?: number;
}

export interface PaginatedResult<T> extends QueryResult<T[]> {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
