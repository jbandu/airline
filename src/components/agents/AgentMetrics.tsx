import React from 'react';
import { Target, Zap, Activity } from 'lucide-react';

interface Agent {
  id: number;
  name: string;
  autonomy_level: number;
  workflow_count: number;
  active_instances: number;
  metadata: {
    capabilities: string[];
  };
}

interface Props {
  agent: Agent;
}

export const AgentMetrics: React.FC<Props> = ({ agent }) => {
  const autonomyPercentage = (agent.autonomy_level / 5) * 100;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Autonomy Level
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {agent.autonomy_level}/5
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${autonomyPercentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Workflows</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {agent.workflow_count}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Instances</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {agent.active_instances}
          </p>
        </div>
      </div>

      {agent.metadata?.capabilities && agent.metadata.capabilities.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Capabilities
          </h4>
          <div className="flex flex-wrap gap-2">
            {agent.metadata.capabilities.map((capability, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md"
              >
                {capability.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
