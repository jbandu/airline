import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink, Filter, TrendingUp, GitBranch, Sparkles } from 'lucide-react';

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
  const [threshold, setThreshold] = useState(50); // Start at 50% for meaningful relationships
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');
  const [topN, setTopN] = useState(50); // Show top 50 by default

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

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 80) return 'from-red-500 to-rose-600';
    if (similarity >= 70) return 'from-orange-500 to-red-500';
    if (similarity >= 60) return 'from-yellow-500 to-orange-500';
    if (similarity >= 50) return 'from-cyan-500 to-blue-500';
    return 'from-blue-400 to-cyan-400';
  };

  const getSimilarityBadgeColor = (similarity: number) => {
    if (similarity >= 80) return 'bg-red-500';
    if (similarity >= 70) return 'bg-orange-500';
    if (similarity >= 60) return 'bg-yellow-500';
    if (similarity >= 50) return 'bg-cyan-500';
    return 'bg-blue-400';
  };

  const getTopSimilarities = () => {
    if (!data) return [];

    const workflowIds = new Set(
      data.workflows
        .filter(w => selectedDomains.includes(w.domain))
        .map(w => w.id)
    );

    return data.matrix
      .filter(cell =>
        workflowIds.has(cell.workflow1_id) &&
        workflowIds.has(cell.workflow2_id) &&
        cell.similarity >= threshold
      )
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topN);
  };

  const toggleDomain = (domain: string) => {
    setSelectedDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  };

  const allDomains = data ? Array.from(new Set(data.workflows.map((w) => w.domain).filter(Boolean))) : [];
  const topSimilarities = getTopSimilarities();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500 mx-auto"></div>
          <p className="text-cyan-400 mt-6 text-lg">Loading semantic relationships...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.workflows || data.workflows.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
        <div className="glass rounded-2xl p-8">
          <p className="text-gray-400">No workflow data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 p-8 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/50">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-gradient-cyan">Workflow Similarities</h1>
              <p className="text-cyan-300 text-lg mt-1">Discover relationships across your airline operations</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Top Matches Found</h3>
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-4xl font-bold text-white">{topSimilarities.length}</p>
            <p className="text-xs text-gray-500 mt-1">Above {threshold}% similarity</p>
          </div>

          <div className="glass rounded-2xl p-6 animate-fade-in animation-delay-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Avg Similarity</h3>
              <GitBranch className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-4xl font-bold text-white">
              {topSimilarities.length > 0
                ? Math.round(topSimilarities.reduce((acc, m) => acc + m.similarity, 0) / topSimilarities.length)
                : 0}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Of displayed pairs</p>
          </div>

          <div className="glass rounded-2xl p-6 animate-fade-in animation-delay-400">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">Workflows Analyzed</h3>
              <Filter className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-4xl font-bold text-white">{data.workflows.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total in system</p>
          </div>
        </div>

        {/* Controls */}
        <div className="glass rounded-2xl p-6 mb-8 animate-fade-in animation-delay-600">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                showFilters
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-lg shadow-cyan-500/50'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Domains</span>
            </button>

            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
              <label className="text-sm text-gray-300">Min Similarity:</label>
              <input
                type="range"
                min="20"
                max="90"
                step="10"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-sm font-bold text-cyan-400 min-w-[50px]">{threshold}%</span>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
              <label className="text-sm text-gray-300">Show Top:</label>
              <select
                value={topN}
                onChange={(e) => setTopN(Number(e.target.value))}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-semibold text-white mb-3">Filter by Domain</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {allDomains.map((domain) => (
                  <label key={domain} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedDomains.includes(domain)}
                      onChange={() => toggleDomain(domain)}
                      className="w-4 h-4 text-cyan-600 rounded"
                    />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{domain}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Similarity List */}
        <div className="space-y-4">
          {topSimilarities.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-gray-400 text-lg">No workflows match the current filters</p>
              <p className="text-gray-500 text-sm mt-2">Try lowering the similarity threshold or adjusting domain filters</p>
            </div>
          ) : (
            topSimilarities.map((cell, index) => (
              <div
                key={`${cell.workflow1_id}-${cell.workflow2_id}`}
                className="glass rounded-2xl overflow-hidden card-hover cursor-pointer animate-fade-in"
                style={{ animationDelay: `${Math.min(index * 50, 1000)}ms` }}
                onClick={() => loadComparisonData(cell)}
              >
                <div className="flex items-center gap-6 p-6">
                  {/* Rank */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">#{index + 1}</span>
                    </div>
                  </div>

                  {/* Workflow 1 */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-cyan-400 mb-1">{cell.domain1}</div>
                    <div className="text-white font-semibold truncate">{cell.workflow1}</div>
                  </div>

                  {/* Similarity Score */}
                  <div className="flex-shrink-0">
                    <div className={`px-6 py-3 rounded-xl bg-gradient-to-r ${getSimilarityColor(cell.similarity)} shadow-lg`}>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">{cell.similarity}%</div>
                        <div className="text-xs text-white/80 mt-1">Similar</div>
                      </div>
                    </div>
                  </div>

                  {/* Workflow 2 */}
                  <div className="flex-1 min-w-0 text-right">
                    <div className="text-sm text-cyan-400 mb-1">{cell.domain2}</div>
                    <div className="text-white font-semibold truncate">{cell.workflow2}</div>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                      <ExternalLink className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {cell.commonCount > 0 && (
                  <div className="px-6 pb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg">
                      <span className="text-xs text-gray-400">
                        {cell.commonCount} shared attribute{cell.commonCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Comparison Panel */}
      {comparisonData && (
        <div className="fixed inset-y-0 right-0 w-[500px] bg-slate-950/95 backdrop-blur-xl border-l border-cyan-500/20 shadow-2xl overflow-y-auto z-50 animate-slide-in">
          <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-blue-600 p-6 flex items-center justify-between shadow-lg">
            <div>
              <h3 className="font-bold text-white text-xl">Workflow Comparison</h3>
              <p className="text-cyan-100 text-sm mt-1">Detailed similarity analysis</p>
            </div>
            <button
              onClick={() => setComparisonData(null)}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Similarity Score */}
            <div className="glass rounded-2xl p-6 text-center">
              <div className="text-sm text-gray-400 mb-3">Similarity Score</div>
              <div className={`inline-block px-8 py-4 rounded-2xl bg-gradient-to-r ${getSimilarityColor(comparisonData.similarity)} shadow-lg`}>
                <div className="text-5xl font-bold text-white">{comparisonData.similarity}%</div>
              </div>
            </div>

            {/* Workflow 1 */}
            <div>
              <h4 className="font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-600 flex items-center justify-center text-white text-xs font-bold">1</div>
                First Workflow
              </h4>
              <div className="glass rounded-xl p-4">
                <div className="font-semibold text-white mb-2">{comparisonData.workflow1.name}</div>
                <div className="text-sm text-cyan-400 mb-3">{comparisonData.workflow1.domain}</div>
                <button
                  onClick={() => navigate(`/workflows/${comparisonData.workflow1.id}`)}
                  className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Full Details
                </button>
              </div>
            </div>

            {/* Workflow 2 */}
            <div>
              <h4 className="font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">2</div>
                Second Workflow
              </h4>
              <div className="glass rounded-xl p-4">
                <div className="font-semibold text-white mb-2">{comparisonData.workflow2.name}</div>
                <div className="text-sm text-cyan-400 mb-3">{comparisonData.workflow2.domain}</div>
                <button
                  onClick={() => navigate(`/workflows/${comparisonData.workflow2.id}`)}
                  className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Full Details
                </button>
              </div>
            </div>

            {/* Shared Stakeholders */}
            <div>
              <h4 className="font-semibold text-white mb-3">
                Shared Stakeholders ({comparisonData.sharedStakeholders.length})
              </h4>
              {comparisonData.sharedStakeholders.length > 0 ? (
                <div className="space-y-3">
                  {comparisonData.sharedStakeholders.map((s: any, idx: number) => (
                    <div key={idx} className="glass rounded-xl p-4">
                      <div className="font-semibold text-white mb-1">{s.name}</div>
                      <div className="text-sm text-cyan-400">{s.role}</div>
                      {s.department && (
                        <div className="text-xs text-gray-500 mt-1">{s.department}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass rounded-xl p-6 text-center">
                  <p className="text-sm text-gray-400">No shared stakeholders found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
