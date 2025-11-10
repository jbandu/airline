import React, { useEffect, useState } from 'react';
import { Cable, Database, Workflow, Zap, Server, GitBranch, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DataLineageGraph, LineageNode, LineageLink } from '../components/visualizations/DataLineageGraph';

interface DataEntity {
  id: number;
  code: string;
  name: string;
  icon: string;
}

interface LineageStats {
  upstreamSources: number;
  downstreamWorkflows: number;
  downstreamAgents: number;
  totalConsumers: number;
}

export const DataLineage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [entities, setEntities] = useState<DataEntity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<DataEntity | null>(null);
  const [lineageNodes, setLineageNodes] = useState<LineageNode[]>([]);
  const [lineageLinks, setLineageLinks] = useState<LineageLink[]>([]);
  const [stats, setStats] = useState<LineageStats>({
    upstreamSources: 0,
    downstreamWorkflows: 0,
    downstreamAgents: 0,
    totalConsumers: 0
  });

  useEffect(() => {
    loadEntities();
  }, []);

  useEffect(() => {
    if (selectedEntity) {
      loadLineage(selectedEntity);
    }
  }, [selectedEntity]);

  const loadEntities = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('data_entities')
        .select('id, code, name, icon')
        .order('name');

      setEntities(data || []);

      // Auto-select first entity
      if (data && data.length > 0) {
        setSelectedEntity(data[0]);
      }
    } catch (error) {
      console.error('Error loading entities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLineage = async (entity: DataEntity) => {
    try {
      // Get workflows that consume this entity
      const { data: workflowMappings } = await supabase
        .from('workflow_data_mappings')
        .select(`
          workflow_id,
          workflows:workflow_id(id, name)
        `)
        .eq('data_entity_id', entity.id);

      // Get agents that consume this entity
      const { data: agentMappings } = await supabase
        .from('agent_data_mappings')
        .select(`
          agent_id,
          agents:agent_id(id, name)
        `)
        .eq('data_entity_id', entity.id);

      // Build graph nodes
      const nodes: LineageNode[] = [];
      const links: LineageLink[] = [];

      // Add source system node (simplified)
      const sourceNode: LineageNode = {
        id: 'source-1',
        name: getSourceSystemName(entity.code),
        type: 'source',
        icon: '🏢'
      };
      nodes.push(sourceNode);

      // Add the selected data entity node
      const entityNode: LineageNode = {
        id: `entity-${entity.id}`,
        name: entity.name,
        type: 'entity',
        icon: entity.icon,
        metadata: {
          code: entity.code
        }
      };
      nodes.push(entityNode);

      // Link source to entity
      links.push({
        source: sourceNode.id,
        target: entityNode.id
      });

      // Add workflow nodes
      let workflowCount = 0;
      if (workflowMappings) {
        workflowMappings.forEach((mapping: any, index: number) => {
          if (mapping.workflows) {
            const workflowNode: LineageNode = {
              id: `workflow-${mapping.workflow_id}`,
              name: mapping.workflows.name,
              type: 'workflow',
              icon: '⚙️'
            };
            nodes.push(workflowNode);
            links.push({
              source: entityNode.id,
              target: workflowNode.id
            });
            workflowCount++;
          }
        });
      }

      // Add agent nodes
      let agentCount = 0;
      if (agentMappings) {
        agentMappings.forEach((mapping: any, index: number) => {
          if (mapping.agents) {
            const agentNode: LineageNode = {
              id: `agent-${mapping.agent_id}`,
              name: mapping.agents.name,
              type: 'agent',
              icon: '🤖'
            };
            nodes.push(agentNode);
            links.push({
              source: entityNode.id,
              target: agentNode.id
            });
            agentCount++;
          }
        });
      }

      setLineageNodes(nodes);
      setLineageLinks(links);

      setStats({
        upstreamSources: 1,
        downstreamWorkflows: workflowCount,
        downstreamAgents: agentCount,
        totalConsumers: workflowCount + agentCount
      });

    } catch (error) {
      console.error('Error loading lineage:', error);
    }
  };

  const getSourceSystemName = (entityCode: string): string => {
    const sourceMap: Record<string, string> = {
      'PNR': 'Amadeus PSS',
      'E_TKT': 'Ticketing System',
      'FLIFO': 'Flight Ops System',
      'INVENTORY': 'Revenue Management',
      'BAGGAGE': 'Baggage Reconciliation',
      'LOYALTY': 'Loyalty Platform',
      'SSM': 'Schedule Planning',
      'MCT': 'Connection System'
    };
    return sourceMap[entityCode] || 'Source System';
  };

  const getImpactLevel = (consumers: number): { level: string; color: string; description: string } => {
    if (consumers >= 20) {
      return {
        level: 'CRITICAL',
        color: 'text-red-400',
        description: 'Very high impact - many downstream dependencies'
      };
    } else if (consumers >= 10) {
      return {
        level: 'HIGH',
        color: 'text-orange-400',
        description: 'High impact - significant downstream usage'
      };
    } else if (consumers >= 5) {
      return {
        level: 'MEDIUM',
        color: 'text-yellow-400',
        description: 'Medium impact - moderate dependencies'
      };
    } else {
      return {
        level: 'LOW',
        color: 'text-green-400',
        description: 'Low impact - few dependencies'
      };
    }
  };

  const impact = getImpactLevel(stats.totalConsumers);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/30">
            <Cable className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Data Lineage
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Trace data from source to consumption - understand dependencies and impact
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {/* Entity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              Select Data Entity to Trace
            </label>
            <select
              value={selectedEntity?.id || ''}
              onChange={(e) => {
                const entity = entities.find(en => en.id === parseInt(e.target.value));
                setSelectedEntity(entity || null);
              }}
              className="w-full md:w-96 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            >
              {entities.map((entity) => (
                <option key={entity.id} value={entity.id} className="bg-slate-900">
                  {entity.icon} {entity.name} ({entity.code})
                </option>
              ))}
            </select>
          </div>

          {selectedEntity && (
            <>
              {/* Stats Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="w-5 h-5 text-red-400" />
                    <span className="text-sm font-semibold text-white">Upstream Sources</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.upstreamSources}</p>
                  <p className="text-xs text-gray-400 mt-1">Source systems</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Workflow className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-semibold text-white">Workflows</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.downstreamWorkflows}</p>
                  <p className="text-xs text-gray-400 mt-1">Consuming workflows</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-semibold text-white">AI Agents</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.downstreamAgents}</p>
                  <p className="text-xs text-gray-400 mt-1">Consuming agents</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-orange-400" />
                    <span className="text-sm font-semibold text-white">Impact Level</span>
                  </div>
                  <p className={`text-2xl font-bold ${impact.color}`}>{impact.level}</p>
                  <p className="text-xs text-gray-400 mt-1">{stats.totalConsumers} total consumers</p>
                </div>
              </div>

              {/* Lineage Graph */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <GitBranch className="w-6 h-6 text-cyan-400" />
                    Data Flow Network
                  </h3>
                  <div className="text-sm text-gray-400">
                    Drag nodes to rearrange • Scroll to zoom
                  </div>
                </div>

                {lineageNodes.length > 0 ? (
                  <div className="bg-slate-900/50 rounded-xl border border-white/10">
                    <DataLineageGraph
                      nodes={lineageNodes}
                      links={lineageLinks}
                      height={600}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    No lineage data available for this entity
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-red-500"></div>
                    <span className="text-sm font-semibold text-white">Source Systems</span>
                  </div>
                  <p className="text-xs text-gray-400">Legacy airline systems producing data</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-semibold text-white">Data Entities</span>
                  </div>
                  <p className="text-xs text-gray-400">Operational data in ODS/Lake</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500"></div>
                    <span className="text-sm font-semibold text-white">Workflows</span>
                  </div>
                  <p className="text-xs text-gray-400">Business processes consuming data</p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-green-500"></div>
                    <span className="text-sm font-semibold text-white">AI Agents</span>
                  </div>
                  <p className="text-xs text-gray-400">Intelligent agents using data</p>
                </div>
              </div>

              {/* Impact Analysis */}
              <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                  Impact Analysis
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className={`w-5 h-5 ${impact.color} mt-0.5`} />
                    <div>
                      <p className="text-white font-semibold mb-1">
                        Impact Level: <span className={impact.color}>{impact.level}</span>
                      </p>
                      <p className="text-gray-300 text-sm">{impact.description}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <GitBranch className="w-5 h-5 text-cyan-400 mt-0.5" />
                    <div>
                      <p className="text-white font-semibold mb-1">Dependency Chain</p>
                      <p className="text-gray-300 text-sm">
                        {getSourceSystemName(selectedEntity.code)} → {selectedEntity.name} → {stats.totalConsumers} downstream consumer{stats.totalConsumers !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {stats.totalConsumers > 0 && (
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-white font-semibold mb-1">Change Considerations</p>
                        <p className="text-gray-300 text-sm">
                          Changes to {selectedEntity.name} will affect {stats.downstreamWorkflows} workflow{stats.downstreamWorkflows !== 1 ? 's' : ''}
                          {stats.downstreamAgents > 0 && ` and ${stats.downstreamAgents} agent${stats.downstreamAgents !== 1 ? 's' : ''}`}.
                          Coordinate with downstream consumers before making schema or availability changes.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
