import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Zap, Target, TrendingUp, Plus, Map, BarChart3, Download } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MetricCard } from '../components/dashboard/MetricCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalWorkflows: 0,
    quickWins: 0,
    avgPotential: 0,
    implementationProgress: 0,
  });
  const [domainData, setDomainData] = useState<any[]>([]);
  const [waveData, setWaveData] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const { data: workflows } = await supabase
      .from('workflows')
      .select('*, domain:domains(name)');

    if (workflows) {
      const total = workflows.length;
      const quickWins = workflows.filter(w => w.complexity <= 2 && w.agentic_potential >= 4).length;
      const avgPot = workflows.reduce((acc, w) => acc + (w.agentic_potential || 0), 0) / total || 0;
      const completed = workflows.filter(w => w.status === 'completed').length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      setMetrics({
        totalWorkflows: total,
        quickWins,
        avgPotential: Number(avgPot.toFixed(1)),
        implementationProgress: progress,
      });

      const domainCounts: Record<string, number> = {};
      workflows.forEach(w => {
        const domainName = w.domain?.name || 'Uncategorized';
        domainCounts[domainName] = (domainCounts[domainName] || 0) + 1;
      });
      const domainChartData = Object.entries(domainCounts)
        .slice(0, 6)
        .map(([name, count]) => ({ name, count }));
      setDomainData(domainChartData);

      const waveCounts = [
        { name: 'Wave 1', value: workflows.filter(w => w.implementation_wave === 1).length },
        { name: 'Wave 2', value: workflows.filter(w => w.implementation_wave === 2).length },
        { name: 'Wave 3', value: workflows.filter(w => w.implementation_wave === 3).length },
      ];
      setWaveData(waveCounts);
    }
  };

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#0EA5E9', '#8B5CF6'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.email?.split('@')[0] || 'User'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's your workflow overview for today
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Workflows"
          value={metrics.totalWorkflows}
          icon={FileText}
          iconBgColor="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
          trend={{ value: '12% from last month', isPositive: true }}
        />
        <MetricCard
          title="Quick Wins Available"
          value={metrics.quickWins}
          icon={Zap}
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
          badge={{ text: 'High Priority', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' }}
        />
        <MetricCard
          title="Avg Agentic Potential"
          value={`${metrics.avgPotential}/5`}
          icon={Target}
          iconBgColor="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <MetricCard
          title="Implementation Progress"
          value={`${metrics.implementationProgress}%`}
          icon={TrendingUp}
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
          trend={{ value: '8% from last week', isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/workflows/new')}
          className="flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Create New Workflow</span>
        </button>
        <button
          onClick={() => navigate('/workflows')}
          className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-600 dark:hover:border-blue-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          <Map className="w-5 h-5" />
          <span className="font-medium">View Roadmap</span>
        </button>
        <button
          onClick={() => navigate('/analytics')}
          className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-600 dark:hover:border-blue-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          <BarChart3 className="w-5 h-5" />
          <span className="font-medium">Analytics</span>
        </button>
        <button className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-600 dark:hover:border-blue-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
          <Download className="w-5 h-5" />
          <span className="font-medium">Export Data</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          <FileText className="w-12 h-12 mb-3 opacity-30" />
          <p>No recent activity to display</p>
          <p className="text-sm mt-1">Create a workflow to get started</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Domain Distribution</h3>
          {domainData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={domainData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(17, 24, 39)',
                    border: '1px solid rgb(55, 65, 81)',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Implementation Waves</h3>
          {waveData.some(w => w.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={waveData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
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
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Complexity Trend</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Coming soon
          </div>
        </div>
      </div>
    </div>
  );
};
