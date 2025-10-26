import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ArrowRight, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { logDatabaseError } from '../lib/errorLogger';
import { validateWorkflow } from '../lib/dataValidator';

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

const STEPS = ['Basic Info', 'Technical', 'Governance', 'Implementation'];

export const WorkflowCreate: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [domains, setDomains] = useState<any[]>([]);
  const [subdomains, setSubdomains] = useState<any[]>([]);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<WorkflowFormData>({
    defaultValues: {
      status: 'draft',
      complexity: 3,
      agentic_potential: 3,
      autonomy_level: 3,
      implementation_wave: 1,
      airline_type: [],
      ai_enablers: [],
      systems_involved: [],
      dependencies: [],
    }
  });

  const selectedDomainId = watch('domain_id');

  useEffect(() => {
    loadDomains();
    loadDraft();
  }, []);

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

  const loadDraft = async () => {
    const draftKey = `workflow_draft_${user?.id}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      Object.keys(draft.data).forEach(key => {
        setValue(key as any, draft.data[key]);
      });
      setDraftId(draft.id);
    }
  };

  const saveDraft = async (data: WorkflowFormData) => {
    const draftKey = `workflow_draft_${user?.id}`;
    const draft = {
      id: draftId || crypto.randomUUID(),
      data,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(draftKey, JSON.stringify(draft));
    if (!draftId) setDraftId(draft.id);
  };

  const clearDraft = () => {
    const draftKey = `workflow_draft_${user?.id}`;
    localStorage.removeItem(draftKey);
    setDraftId(null);
  };

  const onSubmit = async (data: WorkflowFormData) => {
    setIsSaving(true);
    try {
      const { data: workflowData, error: workflowError } = await supabase
        .from('workflows')
        .insert({
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
          created_by: user?.id,
        })
        .select()
        .single();

      if (workflowError) {
        logDatabaseError('Failed to create workflow', workflowError, {
          table: 'workflows',
          operation: 'insert',
          query: 'onSubmit',
        });
        throw workflowError;
      }

      if (workflowData && validateWorkflow(workflowData, 'onSubmit')) {
        clearDraft();
        navigate('/workflows');
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
      alert('Failed to create workflow. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    const data = watch();
    await saveDraft(data);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
      clearDraft();
      navigate('/workflows');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workflows
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create New Workflow
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Complete the form below to add a new workflow to the system
        </p>

        <div className="flex items-center justify-between mb-8">
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    index <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                  {step}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    index < currentStep
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Workflow Name *
                </label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter workflow name"
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
                  placeholder="Describe the workflow purpose and functionality"
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
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
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
                  placeholder="e.g., Optimization & Decision Support"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  AI Enablers (comma-separated)
                </label>
                <input
                  {...register('ai_enablers')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Machine Learning, NLP, Computer Vision"
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
                  placeholder="CRM System, Booking System, ERP"
                  onChange={(e) => {
                    const value = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setValue('systems_involved', value);
                  }}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Context
                </label>
                <textarea
                  {...register('business_context')}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Explain the business rationale and benefits"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expected ROI
                </label>
                <input
                  {...register('expected_roi')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., 20% cost reduction, 30% efficiency improvement"
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
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
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
                  placeholder="Other workflows or systems this depends on"
                  onChange={(e) => {
                    const value = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setValue('dependencies', value);
                  }}
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  Ready to Create Workflow
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  Click the Create Workflow button below to save your workflow to the system.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>

            <div className="flex items-center gap-3">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
              )}

              {currentStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Creating...' : 'Create Workflow'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
