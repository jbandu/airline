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
  description: string;
  domain_id: string | null;
  subdomain_id: string | null;
  complexity: number;
  agentic_potential: number;
  autonomy_level: number;
  implementation_wave: number;
  status: string;
  airline_type: string[];
  agentic_function_type: string;
  ai_enablers: string[];
  systems_involved: string[];
  business_context: string;
  expected_roi: string;
  dependencies: string[];
  success_metrics: SuccessMetric[];
  version: number;
  created_by: string | null;
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
  domain?: Domain;
  subdomain?: Subdomain;
}
