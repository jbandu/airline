import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink, Filter, Download, Sliders } from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  domain: string;
}

interface MatrixCell {
  workflow1_id: string;
  workflow1: string;
  domain1: string;
  workflow2_id: string;
  workflow2: string;
  domain2: string;
  similarity: number;
  commonCount: number;
}

interface MatrixData {
  workflows: Workflow[];
  matrix: MatrixCell[];
}

interface ComparisonData {
  workflow1: Workflow;
  workflow2: Workflow;
  similarity: number;
  commonCount: number;
  sharedStakeholders: any[];
}

export const SemanticMatrix: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MatrixData | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [threshold, setThreshold] = useState(0);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'alphabetical' | 'domain'>('alphabetical');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.rpc('get_semantic_similarity_matrix');

      if (error) throw error;

      if (result) {
        setData(result as MatrixData);
        const domains = Array.from(new Set(result.workflows?.map((w: Workflow) => w.domain).filter(Boolean))) as string[];
        setSelectedDomains(domains);
      }
    } catch (error) {
      console.error('Error loading semantic matrix:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComparisonData = async (cell: MatrixCell) => {
    try {
      const { data: stakeholders, error } = await supabase
        .from('workflow_stakeholders')
        .select('stakeholder_id, stakeholders(name, role, department)')
        .in('workflow_id', [cell.workflow1_id, cell.workflow2_id]);

      if (error) throw error;

      const stakeholderMap = new Map();
      stakeholders?.forEach((ws: any) => {
        const key = ws.stakeholder_id;
        if (!stakeholderMap.has(key)) {
          stakeholderMap.set(key, { ...ws.stakeholders, count: 0 });
        }
        stakeholderMap.get(key).count += 1;
      });

      const shared = Array.from(stakeholderMap.values()).filter((s: any) => s.count > 1);

      setComparisonData({
        workflow1: data!.workflows.find((w) => w.id === cell.workflow1_id)!,
        workflow2: data!.workflows.find((w) => w.id === cell.workflow2_id)!,
        similarity: cell.similarity,
        commonCount: cell.commonCount,
        sharedStakeholders: shared,
      });
    } catch (error) {
      console.error('Error loading comparison data:', error);
    }
  };

  const handleCellClick = (cell: MatrixCell) => {
    loadComparisonData(cell);
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 80) return 'bg-red-500';
    if (similarity >= 60) return 'bg-orange-500';
    if (similarity >= 40) return 'bg-yellow-500';
    if (similarity >= 20) return 'bg-blue-400';
    return 'bg-blue-200';
  };

  const getSimilarityTextColor = (similarity: number) => {
    if (similarity >= 40) return 'text-white';
    return 'text-gray-900';
  };

  const getFilteredWorkflows = () => {
    if (!data) return [];
    let workflows = data.workflows.filter((w) => selectedDomains.includes(w.domain));

    if (sortBy === 'alphabetical') {
      workflows = workflows.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'domain') {
      workflows = workflows.sort((a, b) => {
        if (a.domain === b.domain) return a.name.localeCompare(b.name);
        return a.domain.localeCompare(b.domain);
      });
    }

    return workflows;
  };

  const getFilteredMatrix = () => {
    if (!data) return [];
    const workflowIds = new Set(getFilteredWorkflows().map((w) => w.id));
    return data.matrix.filter(
      (cell) =>
        workflowIds.has(cell.workflow1_id) &&
        workflowIds.has(cell.workflow2_id) &&
        cell.similarity >= threshold
    );
  };

  const getCellValue = (w1: Workflow, w2: Workflow) => {
    if (w1.id === w2.id) return { similarity: 100, cell: null };

    const cell = getFilteredMatrix().find(
      (c) =>
        (c.workflow1_id === w1.id && c.workflow2_id === w2.id) ||
        (c.workflow1_id === w2.id && c.workflow2_id === w1.id)
    );

    return { similarity: cell?.similarity || 0, cell };
  };

  const toggleDomain = (domain: string) => {
    setSelectedDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  };

  const allDomains = data ? Array.from(new Set(data.workflows.map((w) => w.domain).filter(Boolean))) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading semantic relationships...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.workflows || data.workflows.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600 dark:text-gray-400">No workflow data available</p>
      </div>
    );
  }

  const filteredWorkflows = getFilteredWorkflows();
  const filteredMatrix = getFilteredMatrix();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg">
            <Sliders className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <label className="text-sm text-gray-600 dark:text-gray-400">Min Similarity:</label>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white">{threshold}%</span>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'alphabetical' | 'domain')}
            className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
          >
            <option value="alphabetical">Sort: Alphabetical</option>
            <option value="domain">Sort: Domain</option>
          </select>
        </div>

        <button
          onClick={() => {}}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-gray-900 dark:text-white">Export</span>
        </button>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Filter by Domain</h3>
            <button onClick={() => setShowFilters(false)}>
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {allDomains.map((domain) => (
              <label key={domain} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedDomains.includes(domain)}
                  onChange={() => toggleDomain(domain)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-900 dark:text-white">{domain}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400"></th>
                {filteredWorkflows.map((w) => (
                  <th
                    key={w.id}
                    className="p-2 text-left text-xs font-medium text-gray-900 dark:text-white min-w-[100px]"
                  >
                    <div className="transform -rotate-45 origin-left whitespace-nowrap">{w.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredWorkflows.map((w1) => (
                <tr key={w1.id}>
                  <td className="p-2 text-xs font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {w1.name}
                  </td>
                  {filteredWorkflows.map((w2) => {
                    const { similarity, cell } = getCellValue(w1, w2);
                    const isDiagonal = w1.id === w2.id;

                    return (
                      <td
                        key={w2.id}
                        className={`p-2 text-center cursor-pointer transition-opacity hover:opacity-80 ${
                          isDiagonal ? 'bg-gray-700' : getSimilarityColor(similarity)
                        } ${getSimilarityTextColor(similarity)}`}
                        onClick={() => cell && handleCellClick(cell)}
                        title={isDiagonal ? w1.name : `${w1.name} ↔ ${w2.name}: ${similarity}%`}
                      >
                        <div className="text-xs font-bold">{similarity > 0 || isDiagonal ? `${similarity}%` : '-'}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <div className="text-sm font-medium text-gray-900 dark:text-white">Similarity Scale:</div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-blue-200 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">0-20%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-blue-400 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">20-40%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-yellow-500 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">40-60%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-orange-500 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">60-80%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 bg-red-500 rounded"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">80-100%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Workflows Analyzed</h4>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{filteredWorkflows.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Relationships Found</h4>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{filteredMatrix.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Avg Similarity</h4>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
            {filteredMatrix.length > 0
              ? Math.round(filteredMatrix.reduce((acc, m) => acc + m.similarity, 0) / filteredMatrix.length)
              : 0}
            %
          </p>
        </div>
      </div>

      {comparisonData && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl overflow-y-auto z-50">
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Workflow Comparison</h3>
            <button
              onClick={() => {
                setComparisonData(null);
              }}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Similarity Score</div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {comparisonData.similarity}%
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Workflow 1</h4>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                <div className="font-medium text-gray-900 dark:text-white">{comparisonData.workflow1.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{comparisonData.workflow1.domain}</div>
                <button
                  onClick={() => navigate(`/workflows/${comparisonData.workflow1.id}`)}
                  className="mt-2 flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Workflow 2</h4>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                <div className="font-medium text-gray-900 dark:text-white">{comparisonData.workflow2.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{comparisonData.workflow2.domain}</div>
                <button
                  onClick={() => navigate(`/workflows/${comparisonData.workflow2.id}`)}
                  className="mt-2 flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Shared Stakeholders ({comparisonData.sharedStakeholders.length})
              </h4>
              {comparisonData.sharedStakeholders.length > 0 ? (
                <div className="space-y-2">
                  {comparisonData.sharedStakeholders.map((s: any, idx: number) => (
                    <div key={idx} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                      <div className="font-medium text-gray-900 dark:text-white">{s.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{s.role}</div>
                      {s.department && (
                        <div className="text-xs text-gray-500 dark:text-gray-500">{s.department}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">No shared stakeholders</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
