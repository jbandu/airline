import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { supabase } from '../../lib/supabase';
import { Download, Search, Filter, GitMerge, Network, TrendingUp } from 'lucide-react';

interface BridgeWorkflow {
  id: string;
  name: string;
  primary_domain: string;
  subdomain: string;
  stakeholder_count: number;
  system_count: number;
  dependency_count: number;
  integration_complexity: 'low' | 'medium' | 'high';
  is_bridge: boolean;
}

interface DomainPair {
  domain1: string;
  domain2: string;
  connection_count: number;
}

interface DomainSummary {
  domain_name: string;
  workflow_count: number;
  total_stakeholders: number;
}

interface BridgeData {
  workflows: BridgeWorkflow[];
  domain_pairs: DomainPair[];
  domain_summary: DomainSummary[];
}

type LayoutMode = 'compact' | 'expanded';
type ComplexityFilter = 'all' | 'low' | 'medium' | 'high';

const getComplexityColor = (complexity: string) => {
  switch (complexity) {
    case 'high':
      return { bg: 'bg-red-500', border: 'border-red-600', text: 'text-red-600' };
    case 'medium':
      return { bg: 'bg-amber-500', border: 'border-amber-600', text: 'text-amber-600' };
    default:
      return { bg: 'bg-green-500', border: 'border-green-600', text: 'text-green-600' };
  }
};

const DomainNode: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-32 h-32 flex items-center justify-center shadow-xl border-4 border-blue-700">
      <div className="text-center">
        <div className="text-white font-bold text-sm mb-1">{data.label}</div>
        <div className="bg-white/20 rounded-full px-2 py-1">
          <div className="text-white text-xs font-semibold">{data.count} workflows</div>
        </div>
      </div>
    </div>
  );
};

const WorkflowNode: React.FC<{ data: any }> = ({ data }) => {
  const colors = getComplexityColor(data.complexity);

  return (
    <div className={`bg-white dark:bg-gray-900 border-2 ${colors.border} rounded-lg p-3 min-w-[180px] shadow-lg`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">{data.label}</div>
        <div className={`${colors.bg} text-white text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap`}>
          {data.complexity.toUpperCase()}
        </div>
      </div>
      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center justify-between">
          <span>Stakeholders:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{data.stakeholderCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Systems:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{data.systemCount}</span>
        </div>
        {data.dependencyCount > 0 && (
          <div className="flex items-center justify-between">
            <span>Dependencies:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{data.dependencyCount}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const nodeTypes = {
  domain: DomainNode,
  workflow: WorkflowNode,
};

export const CrossDomainBridgeMap: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BridgeData | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('expanded');
  const [complexityFilter, setComplexityFilter] = useState<ComplexityFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.rpc('get_cross_domain_bridges');

      if (error) throw error;

      if (result) {
        setData(result as BridgeData);
      }
    } catch (error) {
      console.error('Error loading cross-domain bridges:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNodes = (): Node[] => {
    if (!data || !data.workflows || !data.domain_summary) return [];

    const nodes: Node[] = [];
    const spacing = layoutMode === 'compact' ? 200 : 300;
    const domainSpacing = layoutMode === 'compact' ? 150 : 200;

    const filteredWorkflows = data.workflows.filter((w) => {
      const matchesComplexity = complexityFilter === 'all' || w.integration_complexity === complexityFilter;
      const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesComplexity && matchesSearch;
    });

    data.domain_summary.forEach((domain, index) => {
      nodes.push({
        id: `domain-${domain.domain_name}`,
        type: 'domain',
        position: { x: 100, y: index * domainSpacing + 100 },
        data: {
          label: domain.domain_name,
          count: domain.workflow_count,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });
    });

    filteredWorkflows.forEach((workflow, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;

      nodes.push({
        id: `workflow-${workflow.id}`,
        type: 'workflow',
        position: {
          x: 400 + col * spacing,
          y: row * (layoutMode === 'compact' ? 180 : 220) + 100,
        },
        data: {
          label: workflow.name,
          complexity: workflow.integration_complexity,
          stakeholderCount: workflow.stakeholder_count,
          systemCount: workflow.system_count,
          dependencyCount: workflow.dependency_count,
          domain: workflow.primary_domain,
        },
        style: {
          opacity: selectedNode && selectedNode !== `workflow-${workflow.id}` ? 0.3 : 1,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });
    });

    return nodes;
  };

  const createEdges = (): Edge[] => {
    if (!data || !data.workflows) return [];

    const edges: Edge[] = [];
    const filteredWorkflows = data.workflows.filter((w) => {
      const matchesComplexity = complexityFilter === 'all' || w.integration_complexity === complexityFilter;
      const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesComplexity && matchesSearch;
    });

    filteredWorkflows.forEach((workflow) => {
      const domainNodeId = `domain-${workflow.primary_domain}`;
      const workflowNodeId = `workflow-${workflow.id}`;

      const getEdgeColor = () => {
        switch (workflow.integration_complexity) {
          case 'high':
            return '#ef4444';
          case 'medium':
            return '#f59e0b';
          default:
            return '#10b981';
        }
      };

      edges.push({
        id: `edge-${domainNodeId}-${workflowNodeId}`,
        source: domainNodeId,
        target: workflowNodeId,
        type: 'smoothstep',
        animated: workflow.integration_complexity === 'high',
        style: {
          stroke: getEdgeColor(),
          strokeWidth: workflow.is_bridge ? 3 : 2,
          opacity: selectedNode && selectedNode !== workflowNodeId && selectedNode !== domainNodeId ? 0.2 : 1,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: getEdgeColor(),
        },
      });
    });

    return edges;
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(createNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(createEdges());

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode((prev) => (prev === node.id ? null : node.id));
  }, []);

  React.useEffect(() => {
    setNodes(createNodes());
    setEdges(createEdges());
  }, [data, layoutMode, complexityFilter, searchTerm, selectedNode]);

  const exportData = () => {
    if (!data) return;

    const csv = [
      ['Workflow', 'Domain', 'Subdomain', 'Stakeholders', 'Systems', 'Dependencies', 'Complexity', 'Is Bridge'],
      ...data.workflows.map((w) => [
        w.name,
        w.primary_domain,
        w.subdomain,
        w.stakeholder_count,
        w.system_count,
        w.dependency_count,
        w.integration_complexity,
        w.is_bridge ? 'Yes' : 'No',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cross-domain-bridges.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading cross-domain bridges...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.workflows || data.workflows.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Network className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No cross-domain bridge workflows found</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Bridge workflows have 2+ stakeholders or systems
          </p>
        </div>
      </div>
    );
  }

  const bridgeWorkflows = data.workflows.filter((w) => w.is_bridge);
  const mostConnectedWorkflow = data.workflows.reduce((prev, current) =>
    prev.stakeholder_count + prev.system_count > current.stakeholder_count + current.system_count ? prev : current
  );
  const strongestPair = data.domain_pairs?.[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <GitMerge className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Bridge Workflows</h4>
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{bridgeWorkflows.length}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Connecting multiple domains</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Network className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Domain Pairs</h4>
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{data.domain_pairs?.length || 0}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">With shared connections</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Most Connected</h4>
          </div>
          <p className="text-sm font-bold text-purple-600 dark:text-purple-400 line-clamp-2">
            {mostConnectedWorkflow.name}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {mostConnectedWorkflow.stakeholder_count + mostConnectedWorkflow.system_count} connections
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Network className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Strongest Pair</h4>
          </div>
          {strongestPair ? (
            <>
              <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                {strongestPair.domain1} ↔ {strongestPair.domain2}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {strongestPair.connection_count} shared stakeholders
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No pairs found</p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <select
              value={complexityFilter}
              onChange={(e) => setComplexityFilter(e.target.value as ComplexityFilter)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
            >
              <option value="all">All Complexity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <select
              value={layoutMode}
              onChange={(e) => setLayoutMode(e.target.value as LayoutMode)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
            >
              <option value="compact">Compact</option>
              <option value="expanded">Expanded</option>
            </select>

            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-900 dark:text-white">Export</span>
            </button>
          </div>
        </div>

        {selectedNode && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-900 dark:text-blue-300">
                Click again to deselect, or click another node to focus
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div style={{ height: '600px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.3}
            maxZoom={1.5}
          >
            <Background />
            <Controls />
            <MiniMap nodeColor="#3b82f6" maskColor="rgba(0, 0, 0, 0.2)" />
          </ReactFlow>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Legend</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Complexity Levels</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Low (1-2 systems)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-500 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Medium (2-3 systems)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">High (3+ systems)</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Node Types</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Domain (circular)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Workflow (rectangular)</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Edge Properties</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-gray-400"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Normal connection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-gray-600"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Bridge workflow (3+ connections)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
