import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Bot, Users, Zap, Activity, Network as NetworkIcon, ArrowRight } from 'lucide-react';
import { AgentCollaborationGraph } from '../components/agents/AgentCollaborationGraph';
import { AgentCategoryLegend } from '../components/agents/AgentCategoryLegend';
import { AgentMetrics } from '../components/agents/AgentMetrics';
import { AgentList } from '../components/agents/AgentList';

interface AgentData {
  id: number;
  code: string;
  name: string;
  category_code: string;
  category_name: string;
  icon: string;
  color: string;
  autonomy_level: number;
  workflow_count: number;
  active_instances: number;
  metadata: {
    capabilities: string[];
  };
}

interface AgentCollaboration {
  source_id: number;
  target_id: number;
  collaboration_type: string;
  strength: number;
  bidirectional: boolean;
}

export const AgentNetwork: React.FC = () => {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [collaborations, setCollaborations] = useState<AgentCollaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null);
  const [view, setView] = useState<'collaboration' | 'categories'>('collaboration');

  useEffect(() => {
    loadAgentData();
  }, []);

  const loadAgentData = async () => {
    setLoading(true);
    try {
      const { data: agentData, error: agentError } = await supabase
        .from('v_agent_network')
        .select('*');

      if (agentError) {
        console.warn('Agent network view not available:', agentError);
        setAgents([]);
        setCollaborations([]);
        setLoading(false);
        return;
      }

      const { data: collabData, error: collabError } = await supabase
        .from('v_agent_collaboration_edges')
        .select('*');

      if (collabError && collabError.code !== 'PGRST116') {
        console.warn('Collaborations view may not exist yet:', collabError);
      }

      setAgents(agentData || []);
      setCollaborations(collabData || []);
    } catch (error) {
      console.error('Error loading agent data:', error);
      setAgents([]);
      setCollaborations([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading agent network...</p>
        </div>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Agents Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The agent network views are not yet available in the database.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            This feature requires database views <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">v_agent_network</code> and <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">v_agent_collaboration_edges</code> to be created.
          </p>
        </div>
      </div>
    );
  }

  const categoryStats = agents.reduce((acc, agent) => {
    const category = agent.category_name;
    if (!acc[category]) {
      acc[category] = { count: 0, color: agent.color, icon: agent.icon };
    }
    acc[category].count++;
    return acc;
  }, {} as Record<string, { count: number; color: string; icon: string }>);

  const totalWorkflows = agents.reduce((sum, agent) => sum + agent.workflow_count, 0);
  const totalInstances = agents.reduce((sum, agent) => sum + agent.active_instances, 0);
  const avgAutonomy = agents.length > 0
    ? (agents.reduce((sum, agent) => sum + agent.autonomy_level, 0) / agents.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <NetworkIcon className="w-8 h-8 text-pink-600" />
                Agent Network
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Visualize AI agent ecosystem and collaborations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('collaboration')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  view === 'collaboration'
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                Collaboration View
              </button>
              <button
                onClick={() => setView('categories')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  view === 'categories'
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                Category View
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Agents</h3>
              <Bot className="w-5 h-5 text-pink-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{agents.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {Object.keys(categoryStats).length} categories
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Workflows Assigned</h3>
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalWorkflows}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Across all agent types
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Instances</h3>
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalInstances}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Currently running
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Autonomy</h3>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{avgAutonomy}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Out of 5 levels
            </p>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_400px] gap-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            {view === 'collaboration' ? (
              <AgentCollaborationGraph
                agents={agents}
                collaborations={collaborations}
                onAgentSelect={setSelectedAgent}
              />
            ) : (
              <div className="p-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Agents by Category
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  {Object.entries(categoryStats).map(([category, stats]) => (
                    <div
                      key={category}
                      className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      style={{ borderColor: stats.color + '40' }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                          style={{ backgroundColor: stats.color + '20' }}
                        >
                          {stats.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{category}</h4>
                          <p className="text-2xl font-bold" style={{ color: stats.color }}>
                            {stats.count}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {agents
                          .filter((a) => a.category_name === category)
                          .map((agent) => (
                            <div
                              key={agent.id}
                              className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2"
                            >
                              <ArrowRight className="w-3 h-3" />
                              {agent.name}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <AgentCategoryLegend categoryStats={categoryStats} />

            {selectedAgent ? (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Agent Details
                  </h3>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ×
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: selectedAgent.color + '20' }}
                  >
                    {selectedAgent.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {selectedAgent.name}
                    </h4>
                    <p className="text-sm" style={{ color: selectedAgent.color }}>
                      {selectedAgent.category_name}
                    </p>
                  </div>
                </div>

                <AgentMetrics agent={selectedAgent} />
              </div>
            ) : (
              <AgentList agents={agents} onAgentSelect={setSelectedAgent} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
