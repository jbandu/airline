/**
 * TypeScript interfaces for Data Entities and Data Architecture
 */

// =====================================================
// Core Data Entity Types
// =====================================================

export interface DataEntity {
  id: number;
  code: string;
  name: string;
  icon: string;
  description: string;
  schema_definition: SchemaDefinition;
  volume_per_day: number;
  retention_years: number;
  sensitivity: DataSensitivity;
  storage_location: string;
  source_systems: string[];
  data_quality_score: number;
  created_at: string;
  updated_at: string;
}

export interface DataEntityWithUsage extends DataEntity {
  workflow_count: number;
  agent_count: number;
  total_usage_count: number;
  domains?: DomainInfo[];
  workflows?: WorkflowInfo[];
  agents?: AgentInfo[];
}

export interface SchemaDefinition {
  fields: SchemaField[];
}

export interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  values?: string[]; // For enum types
}

export type DataSensitivity = 'PII' | 'Confidential' | 'Public' | 'Internal';

// =====================================================
// Mapping Types
// =====================================================

export interface WorkflowDataMapping {
  id: number;
  workflow_id: number;
  data_entity_id: number;
  access_type: AccessType;
  is_primary_data: boolean;
  volume_estimate: VolumeEstimate;
  latency_requirement: LatencyRequirement;
  created_at: string;
  // Joined fields
  workflow?: WorkflowInfo;
  data_entity?: DataEntity;
}

export interface AgentDataMapping {
  id: number;
  agent_id: number;
  data_entity_id: number;
  access_pattern: AccessPattern;
  latency_requirement: LatencyRequirement;
  query_frequency: QueryFrequency;
  is_critical: boolean;
  created_at: string;
  // Joined fields
  agent?: AgentInfo;
  data_entity?: DataEntity;
}

export type AccessType = 'read' | 'write' | 'read_write';
export type VolumeEstimate = 'low' | 'medium' | 'high' | 'very_high';
export type AccessPattern = 'batch' | 'stream' | 'on_demand' | 'scheduled';
export type LatencyRequirement = 'real-time' | 'near-real-time' | 'batch';
export type QueryFrequency = 'continuous' | 'per_minute' | 'per_hour' | 'per_day';

// =====================================================
// Data Architecture Layer Types
// =====================================================

export interface DataLayer {
  id: number;
  name: string;
  layer_order: number;
  description: string;
  technologies: string[];
  icon: string;
  color: string;
  created_at: string;
}

export interface DataEntityLayer {
  id: number;
  data_entity_id: number;
  data_layer_id: number;
  is_primary_layer: boolean;
  storage_format: string;
  created_at: string;
  // Joined fields
  data_entity?: DataEntity;
  data_layer?: DataLayer;
}

// =====================================================
// Data Flow Types
// =====================================================

export interface DataFlow {
  id: number;
  name: string;
  description: string;
  source_system: string;
  source_data_entity_id: number;
  destination_data_entity_id: number;
  flow_type: FlowType;
  frequency: string;
  transformation_logic: string;
  technologies: string[];
  created_at: string;
  // Joined fields
  source_entity?: DataEntity;
  destination_entity?: DataEntity;
}

export type FlowType = 'batch' | 'stream' | 'real-time' | 'scheduled';

// =====================================================
// Supporting Info Types
// =====================================================

export interface DomainInfo {
  id: number;
  name: string;
  icon?: string;
}

export interface WorkflowInfo {
  id: number;
  name: string;
  subdomain_id?: number;
  status?: string;
}

export interface AgentInfo {
  id: number;
  name: string;
  type?: string;
  active?: boolean;
}

// =====================================================
// Data Lineage Types
// =====================================================

export interface DataLineageNode {
  id: string;
  type: 'source' | 'entity' | 'domain' | 'workflow' | 'agent';
  name: string;
  icon?: string;
  metadata?: Record<string, any>;
}

export interface DataLineageEdge {
  source: string;
  target: string;
  type: 'produces' | 'consumes' | 'transforms';
  label?: string;
}

export interface DataLineageGraph {
  nodes: DataLineageNode[];
  edges: DataLineageEdge[];
}

// =====================================================
// Data-Workflow Matrix Types
// =====================================================

export interface DataWorkflowMatrixRow {
  workflow_id: number;
  workflow_name: string;
  subdomain_name?: string;
  domain_name?: string;
  data_access: Record<string, AccessType | null>; // data_entity_code -> access_type
}

export interface DataWorkflowMatrixColumn {
  entity_code: string;
  entity_name: string;
  entity_icon: string;
}

// =====================================================
// Statistics and Metrics
// =====================================================

export interface DataEntityStats {
  total_entities: number;
  total_volume_per_day: number;
  by_sensitivity: Record<DataSensitivity, number>;
  by_layer: Record<number, number>;
  top_consumers: Array<{
    type: 'workflow' | 'agent';
    id: number;
    name: string;
    entity_count: number;
  }>;
}

// =====================================================
// Filter and Search Types
// =====================================================

export interface DataEntityFilters {
  search?: string;
  sensitivity?: DataSensitivity[];
  min_volume?: number;
  max_volume?: number;
  source_systems?: string[];
  used_by_domain?: number;
  used_by_workflow?: number;
  used_by_agent?: number;
}

// =====================================================
// View/Display Types
// =====================================================

export interface DataEntityCard {
  entity: DataEntity;
  usage: {
    workflow_count: number;
    agent_count: number;
    domain_count: number;
  };
  layer_info: {
    primary_layer: string;
    storage_format: string;
  };
}

// =====================================================
// API Response Types
// =====================================================

export interface DataEntitiesResponse {
  data: DataEntityWithUsage[];
  count: number;
  page?: number;
  per_page?: number;
}

export interface DataLayersResponse {
  data: DataLayer[];
  count: number;
}

export interface DataFlowsResponse {
  data: DataFlow[];
  count: number;
}
