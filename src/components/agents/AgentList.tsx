import React from 'react';
import { ChevronRight } from 'lucide-react';

interface Agent {
  id: number;
  code: string;
  name: string;
  category_name: string;
  icon: string;
  color: string;
  autonomy_level: number;
  workflow_count: number;
}

interface Props {
  agents: Agent[];
  onAgentSelect: (agent: Agent) => void;
}

export const AgentList: React.FC<Props> = ({ agents, onAgentSelect }) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Agents</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Click to view details
        </p>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-800 max-h-[500px] overflow-y-auto">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => onAgentSelect(agent)}
            className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: agent.color + '20' }}
                >
                  {agent.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {agent.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {agent.category_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-500">Autonomy</p>
                  <p className="text-sm font-semibold" style={{ color: agent.color }}>
                    {agent.autonomy_level}/5
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
