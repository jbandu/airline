import React, { useEffect, useState } from 'react';
import { ScatterChart, Scatter, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Workflow } from '../types/database.types';

export const Analytics: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [scatterData, setScatterData] = useState<any[]>([]);
  const [domainData, setDomainData] = useState<any[]>([]);
  const [waveData, setWaveData] = useState<any[]>([]);
  const [topWorkflows, setTopWorkflows] = useState<any[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    const { data } = await supabase
      .from('workflows')
      .select('*, domain:domains(name)');

    if (data) {
      setWorkflows(data);

      const scatter = data.map((w) => ({
        name: w.name,
        complexity: w.complexity,
        potential: w.agentic_potential,
        wave: w.implementation_wave,
      }));
      setScatterData(scatter);

      const domainCounts: Record<string, number> = {};
      data.forEach((w) => {
        const domainName = w.domain?.name || 'Uncategorized';
        domainCounts[domainName] = (domainCounts[domainName] || 0) + 1;
      });
      const domainChartData = Object.entries(domainCounts).map(([name, count]) => ({
        name,
        count,
      }));
      setDomainData(domainChartData);

      const waveCounts = [
        { name: 'Wave 1', value: data.filter((w) => w.implementation_wave === 1).length },
        { name: 'Wave 2', value: data.filter((w) => w.implementation_wave === 2).length },
        { name: 'Wave 3', value: data.filter((w) => w.implementation_wave === 3).length },
      ];
      setWaveData(waveCounts);

      const top = data
        .sort((a, b) => b.agentic_potential - a.agentic_potential)
        .slice(0, 10)
        .map((w) => ({
          name: w.name,
          potential: w.agentic_potential,
          complexity: w.complexity,
          wave: w.implementation_wave,
        }));
      setTopWorkflows(top);
    }
  };

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#0EA5E9', '#8B5CF6'];

  const getWaveColor = (wave: number) => {
    const colors = ['#2563EB', '#10B981', '#F59E0B'];
    return colors[wave - 1] || colors[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive insights into your workflow portfolio
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-gray-900 dark:text-white">Total Workflows</h3>
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">{workflows.length}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Across all domains</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="font-bold text-gray-900 dark:text-white">Avg Potential</h3>
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">
            {workflows.length > 0
              ? (workflows.reduce((acc, w) => acc + w.agentic_potential, 0) / workflows.length).toFixed(1)
              : '0'}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Out of 5.0</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-bold text-gray-900 dark:text-white">Avg Complexity</h3>
          </div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white">
            {workflows.length > 0
              ? (workflows.reduce((acc, w) => acc + w.complexity, 0) / workflows.length).toFixed(1)
              : '0'}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Out of 5.0</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Complexity vs Agentic Potential
          </h2>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Export Chart
          </button>
        </div>
        {scatterData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis
                type="number"
                dataKey="complexity"
                name="Complexity"
                domain={[0, 6]}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                label={{ value: 'Complexity', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
              />
              <YAxis
                type="number"
                dataKey="potential"
                name="Potential"
                domain={[0, 6]}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                label={{ value: 'Agentic Potential', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: 'rgb(17, 24, 39)',
                  border: '1px solid rgb(55, 65, 81)',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
              />
              <Legend />
              <Scatter name="Wave 1" data={scatterData.filter((d) => d.wave === 1)} fill="#2563EB" />
              <Scatter name="Wave 2" data={scatterData.filter((d) => d.wave === 2)} fill="#10B981" />
              <Scatter name="Wave 3" data={scatterData.filter((d) => d.wave === 3)} fill="#F59E0B" />
            </ScatterChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-400">No data available</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Workflows by Domain
            </h2>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Export Chart
            </button>
          </div>
          {domainData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={domainData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} angle={-45} textAnchor="end" height={100} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(17, 24, 39)',
                    border: '1px solid rgb(55, 65, 81)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400">No data available</div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Implementation Waves
            </h2>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Export Chart
            </button>
          </div>
          {waveData.some((w) => w.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={waveData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {waveData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(17, 24, 39)',
                    border: '1px solid rgb(55, 65, 81)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400">No data available</div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Top Workflows by Agentic Potential
          </h2>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Export Table
          </button>
        </div>
        {topWorkflows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Workflow
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Potential
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Complexity
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                    Wave
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {topWorkflows.map((workflow, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      #{index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {workflow.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                        {workflow.potential}/5
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded ${
                          workflow.complexity <= 2
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : workflow.complexity === 3
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}
                      >
                        {workflow.complexity}/5
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      Wave {workflow.wave}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">No workflows available</div>
        )}
      </div>
    </div>
  );
};
