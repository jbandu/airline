import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Copy, Archive, Share2, MessageSquare, Paperclip, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { WorkflowWithRelations } from '../types/database.types';

type TabType = 'overview' | 'technical' | 'implementation' | 'collaboration';

export const WorkflowDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState<WorkflowWithRelations | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    if (id) loadWorkflow(id);
  }, [id]);

  const loadWorkflow = async (workflowId: string) => {
    const { data } = await supabase
      .from('workflows')
      .select('*, domain:domains(*), subdomain:subdomains(*)')
      .eq('id', workflowId)
      .maybeSingle();
    if (data) setWorkflow(data);
  };

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const getComplexityColor = (complexity: number) => {
    if (complexity <= 2) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    if (complexity === 3) return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800',
      planned: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
      'in-progress': 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
      completed: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
      archived: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800',
    };
    return colors[status] || colors.draft;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/workflows')}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{workflow.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(workflow.status)}`}>
              {workflow.status}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Version {workflow.version}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Copy className="w-4 h-4" />
            <span>Clone</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Archive className="w-4 h-4" />
            <span>Archive</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex gap-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'technical', label: 'Technical' },
            { id: 'implementation', label: 'Implementation' },
            { id: 'collaboration', label: 'Collaboration' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {workflow.description || 'No description provided'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Complexity</div>
              <div className={`text-3xl font-bold mb-2 ${getComplexityColor(workflow.complexity)}`}>
                {workflow.complexity}/5
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {workflow.complexity <= 2 ? 'Low' : workflow.complexity === 3 ? 'Medium' : 'High'} complexity
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Agentic Potential</div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {workflow.agentic_potential}/5
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Automation opportunity</div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Autonomy Level</div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {workflow.autonomy_level}/5
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Independence score</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Business Context</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {workflow.business_context || 'No business context provided'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Expected ROI</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {workflow.expected_roi || 'No ROI estimate provided'}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'technical' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Agentic Function Type</h2>
            <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg font-medium">
              {workflow.agentic_function_type || 'Not specified'}
            </span>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">AI Enablers</h2>
            <div className="flex flex-wrap gap-2">
              {workflow.ai_enablers && workflow.ai_enablers.length > 0 ? (
                workflow.ai_enablers.map((enabler, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm"
                  >
                    {enabler}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No AI enablers specified</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Systems Involved</h2>
            <div className="flex flex-wrap gap-2">
              {workflow.systems_involved && workflow.systems_involved.length > 0 ? (
                workflow.systems_involved.map((system, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                  >
                    {system}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No systems specified</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'implementation' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Wave Assignment</h2>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                Wave {workflow.implementation_wave}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {workflow.implementation_wave === 1 && '(Quick Wins)'}
                {workflow.implementation_wave === 2 && '(Medium Priority)'}
                {workflow.implementation_wave === 3 && '(Long Term)'}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Dependencies</h2>
            {workflow.dependencies && workflow.dependencies.length > 0 ? (
              <ul className="space-y-2">
                {workflow.dependencies.map((dep, index) => (
                  <li key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">{dep}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No dependencies</p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Success Metrics</h2>
            {workflow.success_metrics && Array.isArray(workflow.success_metrics) && workflow.success_metrics.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                        Metric
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                        Target
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                        Current
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {workflow.success_metrics.map((metric: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{metric.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{metric.target}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {metric.current || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No success metrics defined</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'collaboration' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Comments</h2>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                Add Comment
              </button>
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
              <p>No comments yet</p>
              <p className="text-sm mt-1">Start the conversation</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Attachments</h2>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                Upload File
              </button>
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Paperclip className="w-12 h-12 mb-3 opacity-30" />
              <p>No attachments</p>
              <p className="text-sm mt-1">Upload files to share with your team</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Activity Log</h2>
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Activity className="w-12 h-12 mb-3 opacity-30" />
              <p>No activity recorded</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
