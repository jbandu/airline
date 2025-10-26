/**
 * Runtime Data Validation
 *
 * Provides runtime validation for database queries and responses
 * to catch schema mismatches and data integrity issues.
 */

import { logValidationError } from './errorLogger';
import type { Workflow, Domain, Subdomain, WorkflowWithRelations } from '../types/database.types';

/**
 * Validate workflow data structure
 */
export function validateWorkflow(data: any, context?: string): data is Workflow {
  if (!data || typeof data !== 'object') {
    logValidationError(
      `Invalid workflow data: expected object, got ${typeof data}`,
      { data },
      { field: context }
    );
    return false;
  }

  const requiredFields = ['id', 'name'];
  const missingFields = requiredFields.filter(field => !(field in data));

  if (missingFields.length > 0) {
    logValidationError(
      `Missing required fields in workflow: ${missingFields.join(', ')}`,
      { data, missingFields },
      { field: context }
    );
    return false;
  }

  // Validate number ranges
  if (data.complexity !== null && data.complexity !== undefined) {
    if (typeof data.complexity !== 'number' || data.complexity < 1 || data.complexity > 5) {
      logValidationError(
        'Invalid complexity value: must be a number between 1 and 5',
        { complexity: data.complexity },
        { field: 'complexity' }
      );
      return false;
    }
  }

  if (data.agentic_potential !== null && data.agentic_potential !== undefined) {
    if (typeof data.agentic_potential !== 'number' || data.agentic_potential < 1 || data.agentic_potential > 5) {
      logValidationError(
        'Invalid agentic_potential value: must be a number between 1 and 5',
        { agentic_potential: data.agentic_potential },
        { field: 'agentic_potential' }
      );
      return false;
    }
  }

  if (data.implementation_wave !== null && data.implementation_wave !== undefined) {
    if (typeof data.implementation_wave !== 'number' || data.implementation_wave < 1 || data.implementation_wave > 3) {
      logValidationError(
        'Invalid implementation_wave value: must be a number between 1 and 3',
        { implementation_wave: data.implementation_wave },
        { field: 'implementation_wave' }
      );
      return false;
    }
  }

  return true;
}

/**
 * Validate domain data structure
 */
export function validateDomain(data: any, context?: string): data is Domain {
  if (!data || typeof data !== 'object') {
    logValidationError(
      `Invalid domain data: expected object, got ${typeof data}`,
      { data },
      { field: context }
    );
    return false;
  }

  const requiredFields = ['id', 'name', 'description'];
  const missingFields = requiredFields.filter(field => !(field in data));

  if (missingFields.length > 0) {
    logValidationError(
      `Missing required fields in domain: ${missingFields.join(', ')}`,
      { data, missingFields },
      { field: context }
    );
    return false;
  }

  return true;
}

/**
 * Validate subdomain data structure
 */
export function validateSubdomain(data: any, context?: string): data is Subdomain {
  if (!data || typeof data !== 'object') {
    logValidationError(
      `Invalid subdomain data: expected object, got ${typeof data}`,
      { data },
      { field: context }
    );
    return false;
  }

  const requiredFields = ['id', 'name', 'domain_id'];
  const missingFields = requiredFields.filter(field => !(field in data));

  if (missingFields.length > 0) {
    logValidationError(
      `Missing required fields in subdomain: ${missingFields.join(', ')}`,
      { data, missingFields },
      { field: context }
    );
    return false;
  }

  return true;
}

/**
 * Validate workflow with relations
 */
export function validateWorkflowWithRelations(
  data: any,
  context?: string
): data is WorkflowWithRelations {
  if (!validateWorkflow(data, context)) {
    return false;
  }

  // Validate subdomain if present
  if (data.subdomain !== undefined && data.subdomain !== null) {
    if (!validateSubdomain(data.subdomain, `${context}.subdomain`)) {
      return false;
    }

    // Validate domain within subdomain if present
    if (data.subdomain.domain !== undefined && data.subdomain.domain !== null) {
      if (!validateDomain(data.subdomain.domain, `${context}.subdomain.domain`)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Validate array of workflows
 */
export function validateWorkflows(data: any, context?: string): data is Workflow[] {
  if (!Array.isArray(data)) {
    logValidationError(
      `Invalid workflows data: expected array, got ${typeof data}`,
      { data },
      { field: context }
    );
    return false;
  }

  return data.every((item, index) => validateWorkflow(item, `${context}[${index}]`));
}

/**
 * Validate array of workflows with relations
 */
export function validateWorkflowsWithRelations(
  data: any,
  context?: string
): data is WorkflowWithRelations[] {
  if (!Array.isArray(data)) {
    logValidationError(
      `Invalid workflows data: expected array, got ${typeof data}`,
      { data },
      { field: context }
    );
    return false;
  }

  return data.every((item, index) =>
    validateWorkflowWithRelations(item, `${context}[${index}]`)
  );
}

/**
 * Sanitize workflow data to ensure valid structure
 */
export function sanitizeWorkflow(data: any): Workflow {
  return {
    id: data.id || '',
    name: data.name || 'Untitled Workflow',
    description: data.description || '',
    domain_id: data.domain_id || null,
    subdomain_id: data.subdomain_id || null,
    complexity: Math.max(1, Math.min(5, data.complexity || 3)),
    agentic_potential: Math.max(1, Math.min(5, data.agentic_potential || 3)),
    autonomy_level: Math.max(1, Math.min(5, data.autonomy_level || 3)),
    implementation_wave: Math.max(1, Math.min(3, data.implementation_wave || 1)),
    status: data.status || 'draft',
    airline_type: Array.isArray(data.airline_type) ? data.airline_type : [],
    agentic_function_type: data.agentic_function_type || '',
    ai_enablers: Array.isArray(data.ai_enablers) ? data.ai_enablers : [],
    systems_involved: Array.isArray(data.systems_involved) ? data.systems_involved : [],
    business_context: data.business_context || '',
    expected_roi: data.expected_roi || '',
    dependencies: Array.isArray(data.dependencies) ? data.dependencies : [],
    success_metrics: data.success_metrics || [],
    version: data.version || 1,
    created_by: data.created_by || null,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
    archived_at: data.archived_at || null,
    parent_workflow_id: data.parent_workflow_id || null,
  };
}

/**
 * Check if data has expected schema fields
 */
export function checkSchemaMatch(
  data: any,
  expectedFields: string[],
  tableName?: string
): { isMatch: boolean; missingFields: string[]; extraFields: string[] } {
  if (!data || typeof data !== 'object') {
    return {
      isMatch: false,
      missingFields: expectedFields,
      extraFields: [],
    };
  }

  const dataFields = Object.keys(data);
  const missingFields = expectedFields.filter(field => !dataFields.includes(field));
  const extraFields = dataFields.filter(field => !expectedFields.includes(field));

  const isMatch = missingFields.length === 0;

  if (!isMatch && tableName) {
    logValidationError(
      `Schema mismatch for ${tableName}`,
      {
        missingFields,
        extraFields,
        expectedFields,
        actualFields: dataFields,
      },
      { field: tableName }
    );
  }

  return { isMatch, missingFields, extraFields };
}

/**
 * Expected schema fields for validation
 */
export const SCHEMA_FIELDS = {
  workflow: [
    'id',
    'name',
    'description',
    'domain_id',
    'subdomain_id',
    'complexity',
    'agentic_potential',
    'autonomy_level',
    'implementation_wave',
    'status',
    'airline_type',
    'agentic_function_type',
    'ai_enablers',
    'systems_involved',
    'business_context',
    'expected_roi',
    'dependencies',
    'success_metrics',
    'version',
    'created_by',
    'created_at',
    'updated_at',
    'archived_at',
    'parent_workflow_id',
  ],
  domain: ['id', 'name', 'description', 'icon_url', 'created_at', 'updated_at'],
  subdomain: [
    'id',
    'domain_id',
    'name',
    'description',
    'created_by',
    'created_at',
    'updated_at',
  ],
};
