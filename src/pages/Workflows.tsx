import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, LayoutGrid, List, Eye, Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { WorkflowWithRelations } from '../types/database.types';

type ViewMode = 'cards' | 'table';

export const Workflows: React.FC = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<WorkflowWithRelations[]>([]);
  const [filteredWorkflows, setFilteredWorkflows] = useState<WorkflowWithRelations[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    wave: 'all',
    status: [] as string[],
    complexityMin: 1,
    complexityMax: 5,
  });

  useEffect(() => {
    loadWorkflows();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [workflows, searchTerm, filters]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
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
          ),
          current_version:workflow_versions!fk_workflows_current_version(
            *
          )
        `)
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading workflows:', error);
        return;
      }

      if (data) {
        setWorkflows(data as any);
      }
    } catch (err) {
      console.error('Unexpected error loading workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...workflows];

    if (searchTerm) {
      filtered = filtered.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.summary && w.summary.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filters.wave !== 'all') {
      filtered = filtered.filter(w => w.current_version?.implementation_wave === parseInt(filters.wave));
    }

    if (filters.status.length > 0) {
      filtered = filtered.filter(w => w.current_version && filters.status.includes(w.current_version.status));
    }

    filtered = filtered.filter(
      w => {
        const complexity = w.current_version?.complexity || 3;
        return complexity >= filters.complexityMin && complexity <= filters.complexityMax;
      }
    );

    setFilteredWorkflows(filtered);
  };

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

  const toggleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status],
    }));
  };

  const stats = {
    total: workflows.length,
    highPotential: workflows.filter(w => (w.current_version?.agentic_potential || 0) >= 4).length,
    complex: workflows.filter(w => (w.current_version?.complexity || 0) >= 4).length,
    active: workflows.filter(w => w.current_version?.status === 'in-progress' || w.current_version?.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workflow Portfolio</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {workflows.length} workflows across your organization
          </p>
        </div>
        <button
          onClick={() => navigate('/workflows/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Workflow</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Workflows</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">High AI Potential</div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.highPotential}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stats.total > 0 ? Math.round((stats.highPotential / stats.total) * 100) : 0}%
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Complex Workflows</div>
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.complex}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stats.total > 0 ? Math.round((stats.complex / stats.total) * 100) : 0}%
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.active}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
              showFilters
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600 dark:border-blue-600 text-blue-600 dark:text-blue-400'
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
          <div className="flex gap-1 border border-gray-200 dark:border-gray-800 rounded-lg p-1 bg-white dark:bg-gray-900">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'cards'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Implementation Wave
              </label>
              <select
                value={filters.wave}
                onChange={(e) => setFilters({ ...filters, wave: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Waves</option>
                <option value="1">Wave 1</option>
                <option value="2">Wave 2</option>
                <option value="3">Wave 3</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Status
              </label>
              <div className="space-y-2">
                {['draft', 'planned', 'in-progress', 'completed'].map((status) => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status)}
                      onChange={() => toggleStatusFilter(status)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {status}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Complexity Range: {filters.complexityMin} - {filters.complexityMax}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={filters.complexityMin}
                  onChange={(e) => setFilters({ ...filters, complexityMin: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={filters.complexityMax}
                  onChange={(e) => setFilters({ ...filters, complexityMax: parseInt(e.target.value) })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading workflows...</p>
          </div>
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No workflows found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || filters.wave !== 'all' || filters.status.length > 0
                ? 'Try adjusting your filters or search term'
                : 'Get started by creating your first workflow'}
            </p>
            {workflows.length === 0 && (
              <button
                onClick={() => navigate('/workflows/new')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Workflow</span>
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow) => {
            const complexity = workflow.current_version?.complexity || 0;
            const potential = workflow.current_version?.agentic_potential || 0;

            return (
              <div
                key={workflow.id}
                className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/workflows/${workflow.id}`)}
              >
                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-600" />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 pr-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {workflow.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(workflow.current_version?.status || 'draft')}`}>
                      {workflow.current_version?.status || 'draft'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3 text-sm">
                    {workflow.subdomain?.domain && (
                      <span className="text-gray-600 dark:text-gray-400">
                        {workflow.subdomain.domain.name}
                      </span>
                    )}
                    {workflow.subdomain?.name && (
                      <>
                        <span className="text-gray-400">›</span>
                        <span className="text-gray-500 dark:text-gray-500">
                          {workflow.subdomain.name}
                        </span>
                      </>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">
                    {workflow.summary || workflow.current_version?.workflow_description || 'No description'}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Complexity</span>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">{complexity}/5</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${(complexity / 5) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">AI Potential</span>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">{potential}/5</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${(potential / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {workflow.current_version?.implementation_wave && (
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
                        Wave {workflow.current_version.implementation_wave}
                      </span>
                    )}
                    {workflow.current_version?.autonomy_level && (
                      <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">
                        L{workflow.current_version.autonomy_level}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/workflows/${workflow.id}`);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/workflows/${workflow.id}/edit`);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Wave
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Complexity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Potential
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredWorkflows.map((workflow) => (
                <tr
                  key={workflow.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => navigate(`/workflows/${workflow.id}`)}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {workflow.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {workflow.subdomain?.domain?.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    Wave {workflow.current_version?.implementation_wave || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getComplexityColor(workflow.current_version?.complexity || 3)}`}>
                      {workflow.current_version?.complexity || '-'}/5
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {workflow.current_version?.agentic_potential || '-'}/5
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(workflow.current_version?.status || 'draft')}`}>
                      {workflow.current_version?.status || 'draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/workflows/${workflow.id}`);
                        }}
                        className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/workflows/${workflow.id}/edit`);
                        }}
                        className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
          <div className="text-gray-400">
            <p className="text-lg mb-2">Loading workflows...</p>
          </div>
        </div>
      )}

      {!loading && filteredWorkflows.length === 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
          <div className="text-gray-400">
            <p className="text-lg mb-2">No workflows found</p>
            <p className="text-sm">Try adjusting your filters or create a new workflow</p>
          </div>
        </div>
      )}
    </div>
  );
};
