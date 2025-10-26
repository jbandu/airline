import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { logDatabaseError } from '../lib/errorLogger';
import { validateWorkflowWithRelations } from '../lib/dataValidator';

interface WorkflowFormData {
  name: string;
  description: string;
  domain_id: string;
  subdomain_id: string;
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
}

export const WorkflowEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [domains, setDomains] = useState<any[]>([]);
  const [subdomains, setSubdomains] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<WorkflowFormData>();

  const selectedDomainId = watch('domain_id');

  useEffect(() => {
    loadDomains();
    if (id) loadWorkflow(id);
  }, [id]);

  useEffect(() => {
    if (selectedDomainId) {
      loadSubdomains(selectedDomainId);
    } else {
      setSubdomains([]);
    }
  }, [selectedDomainId]);

  const loadDomains = async () => {
    const { data } = await supabase.from('domains').select('*').order('name');
    if (data) setDomains(data);
  };

  const loadSubdomains = async (domainId: string) => {
    const { data } = await supabase
      .from('subdomains')
      .select('*')
      .eq('domain_id', domainId)
      .order('name');
    if (data) setSubdomains(data);
  };

  const loadWorkflow = async (workflowId: string) => {
    try {
      const { data: workflow, error } = await supabase
        .from('workflows')
        .select(`
          *,
          subdomain:subdomains(
            id,
            name,
            domain:domains(
              id,
              name
            )
          )
        `)
        .eq('id', workflowId)
        .maybeSingle();

      if (error) {
        logDatabaseError('Failed to load workflow for editing', error, {
          table: 'workflows',
          operation: 'select',
          query: 'loadWorkflow',
        });
        setIsLoading(false);
        return;
      }

      if (workflow && validateWorkflowWithRelations(workflow, 'loadWorkflow')) {
        setValue('name', workflow.name);
        setValue('description', workflow.description || '');
        setValue('subdomain_id', workflow.subdomain_id);
        setValue('domain_id', workflow.subdomain?.domain?.id || '');
        setValue('complexity', workflow.complexity || 3);
        setValue('agentic_potential', workflow.agentic_potential || 3);
        setValue('autonomy_level', workflow.autonomy_level || 3);
        setValue('implementation_wave', workflow.implementation_wave || 1);
        setValue('status', workflow.status || 'draft');
        setValue('agentic_function_type', workflow.agentic_function_type || '');
        setValue('business_context', workflow.business_context || '');
        setValue('expected_roi', workflow.expected_roi || '');
        setValue('ai_enablers', workflow.ai_enablers || []);
        setValue('systems_involved', workflow.systems_involved || []);
        setValue('dependencies', workflow.dependencies || []);
        setValue('airline_type', workflow.airline_type || []);
      }
    } catch (error) {
      logDatabaseError('Unexpected error loading workflow for editing', error, {
        table: 'workflows',
        operation: 'select',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: WorkflowFormData) => {
    if (!id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('workflows')
        .update({
          name: data.name,
          description: data.description,
          domain_id: data.domain_id,
          subdomain_id: data.subdomain_id,
          complexity: data.complexity,
          agentic_potential: data.agentic_potential,
          autonomy_level: data.autonomy_level,
          implementation_wave: data.implementation_wave,
          status: data.status,
          airline_type: data.airline_type,
          agentic_function_type: data.agentic_function_type,
          ai_enablers: data.ai_enablers,
          systems_involved: data.systems_involved,
          business_context: data.business_context,
          expected_roi: data.expected_roi,
          dependencies: data.dependencies,
        })
        .eq('id', id);

      if (error) {
        logDatabaseError('Failed to update workflow', error, {
          table: 'workflows',
          operation: 'update',
          query: 'onSubmit',
        });
        throw error;
      }

      navigate(`/workflows/${id}`);
    } catch (error) {
      console.error('Error updating workflow:', error);
      alert('Failed to update workflow. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading workflow...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/workflows/${id}`)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workflow
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Edit Workflow
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Update the workflow details below
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Workflow Name *
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Domain *
                </label>
                <select
                  {...register('domain_id', { required: 'Domain is required' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select domain</option>
                  {domains.map(domain => (
                    <option key={domain.id} value={domain.id}>
                      {domain.name}
                    </option>
                  ))}
                </select>
                {errors.domain_id && (
                  <p className="text-red-600 text-sm mt-1">{errors.domain_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subdomain
                </label>
                <select
                  {...register('subdomain_id')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  disabled={!selectedDomainId}
                >
                  <option value="">Select subdomain</option>
                  {subdomains.map(subdomain => (
                    <option key={subdomain.id} value={subdomain.id}>
                      {subdomain.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="draft">Draft</option>
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Technical Details</h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Complexity (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  {...register('complexity', { min: 1, max: 5 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Agentic Potential (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  {...register('agentic_potential', { min: 1, max: 5 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Autonomy Level (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  {...register('autonomy_level', { min: 1, max: 5 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Agentic Function Type
              </label>
              <input
                {...register('agentic_function_type')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                AI Enablers (comma-separated)
              </label>
              <input
                {...register('ai_enablers')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                defaultValue={watch('ai_enablers')?.join(', ')}
                onChange={(e) => {
                  const value = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                  setValue('ai_enablers', value);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Systems Involved (comma-separated)
              </label>
              <input
                {...register('systems_involved')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                defaultValue={watch('systems_involved')?.join(', ')}
                onChange={(e) => {
                  const value = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                  setValue('systems_involved', value);
                }}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Governance</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Context
              </label>
              <textarea
                {...register('business_context')}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expected ROI
              </label>
              <input
                {...register('expected_roi')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Airline Types (select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['Full Service', 'Low Cost', 'Regional', 'Cargo'].map(type => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={type}
                      {...register('airline_type')}
                      className="rounded border-gray-300 dark:border-gray-700"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Implementation</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Implementation Wave
              </label>
              <select
                {...register('implementation_wave')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="1">Wave 1 - Quick Wins</option>
                <option value="2">Wave 2 - Medium Priority</option>
                <option value="3">Wave 3 - Long Term</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dependencies (comma-separated)
              </label>
              <input
                {...register('dependencies')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                defaultValue={watch('dependencies')?.join(', ')}
                onChange={(e) => {
                  const value = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                  setValue('dependencies', value);
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate(`/workflows/${id}`)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
