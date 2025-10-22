export interface Domain {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Subdomain {
  id: string;
  domain_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Workflow {
  id: string;
  name: string;
  subdomain_id: string | null;
  summary: string | null;
  created_by: string | null;
  created_at: string;
  archived_at: string | null;
  current_version_id: string | null;
}

export interface WorkflowVersion {
  id: string;
  workflow_id: string;
  version_major: number;
  version_minor: number;
  version_patch: number;
  status: string;
  domain: string;
  subdomain: string;
  workflow_name: string;
  workflow_description: string;
  agentic_function_type: string | null;
  transformation_theme: string | null;
  modernization_target: string | null;
  ai_enabler_type: string | null;
  agent_collaboration_pattern: string | null;
  autonomy_level: number | null;
  autonomy_definition_detail: string | null;
  human_oversight_role: string | null;
  regulatory_risk_category: string | null;
  constraints_regulations: string | null;
  current_automation_level: string | null;
  agentic_potential: number | null;
  complexity: number | null;
  impact_area: string | null;
  expected_roi_levers: string | null;
  operational_metrics_targeted: string | null;
  success_metrics: string | null;
  airline_type_applicability: string | null;
  integration_path: string | null;
  governance_oversight_needed: string | null;
  governing_bodies: string | null;
  data_sensitivity: string | null;
  owner_partner: string | null;
  cross_domain_linkages: string | null;
  notes_references: string | null;
  operational_context: string | null;
  implementation_wave: number | null;
  baseline_metric: string | null;
  target_metric: string | null;
  measurement_timeframe: string | null;
  dependency_workflow: string | null;
  failure_mode_fallback: string | null;
  agent_collaboration_model: string | null;
  priority_score: number | null;
  ai_enablers: string[] | null;
  systems_involved: string[] | null;
  dependencies: string[] | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SuccessMetric {
  name: string;
  target: string;
  current?: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  created_at: string;
}

export interface WorkflowStakeholder {
  id: string;
  workflow_id: string;
  stakeholder_id: string;
  role_in_workflow: string;
  created_at: string;
}

export interface WorkflowComment {
  id: string;
  workflow_id: string;
  user_id: string | null;
  content: string;
  created_at: string;
}

export interface WorkflowAttachment {
  id: string;
  workflow_id: string;
  filename: string;
  file_url: string;
  file_type: string;
  uploaded_by: string | null;
  created_at: string;
}

export interface WorkflowWithRelations extends Workflow {
  subdomain?: Subdomain & {
    domain?: Domain;
  };
  current_version?: WorkflowVersion;
}
