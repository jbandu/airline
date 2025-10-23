import React from 'react';

interface CategoryStat {
  count: number;
  color: string;
  icon: string;
}

interface Props {
  categoryStats: Record<string, CategoryStat>;
}

export const AgentCategoryLegend: React.FC<Props> = ({ categoryStats }) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Agent Categories</h3>
      <div className="space-y-3">
        {Object.entries(categoryStats).map(([category, stats]) => (
          <div key={category} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                style={{ backgroundColor: stats.color + '20' }}
              >
                {stats.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{category}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">{stats.count} agents</p>
              </div>
            </div>
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: stats.color }}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Category Descriptions
        </h4>
        <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
          <p><strong>Observer:</strong> Monitor and detect patterns</p>
          <p><strong>Recommender:</strong> Suggest optimal actions</p>
          <p><strong>Executor:</strong> Perform automated tasks</p>
          <p><strong>Optimizer:</strong> Continuously improve processes</p>
          <p><strong>Coordinator:</strong> Orchestrate multi-agent workflows</p>
        </div>
      </div>
    </div>
  );
};
