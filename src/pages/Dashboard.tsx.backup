import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Zap, Target, TrendingUp, Plus, Map, BarChart3, Download, CheckCircle, Clock, FileEdit, AlertCircle, Activity, Bot, Network, ArrowRight } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MetricCard } from '../components/dashboard/MetricCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { logDatabaseError } from '../lib/errorLogger';
import { validateWorkflowsWithRelations } from '../lib/dataValidator';

interface WorkflowActivity {
  id: number;
  name: string;
  status: string;
  domain: string;
  updated_at: string;
  action: string;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalWorkflows: 0,
    quickWins: 0,
    avgPotential: 0,
    implementationProgress: 0,
    approvedWorkflows: 0,
    inProgressWorkflows: 0,
    draftWorkflows: 0,
  });
  const [domainData, setDomainData] = useState<any[]>([]);
  const [waveData, setWaveData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [potentialTrend, setPotentialTrend] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<WorkflowActivity[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: workflows, error } = await supabase
        .from('workflows')
        .select(`
          *,
          subdomain:subdomains(
            id,
            name,
            domain:domains(
              id,
              name
            )
          )
        `)
        .is('archived_at', null);

      if (error) {
        logDatabaseError('Failed to load dashboard data', error, {
          table: 'workflows',
          operation: 'select',
          query: 'loadDashboardData',
        });
        return;
      }

      if (!workflows || !validateWorkflowsWithRelations(workflows, 'loadDashboardData')) {
        return;
      }

      if (workflows) {
      const total = workflows.length;
      const quickWins = workflows.filter(w => w.complexity <= 2 && w.agentic_potential >= 4).length;
      const avgPot = workflows.reduce((acc, w) => acc + (w.agentic_potential || 0), 0) / total || 0;
      const approved = workflows.filter(w => w.status === 'approved').length;
      const inProgress = workflows.filter(w => w.status === 'in_progress').length;
      const draft = workflows.filter(w => w.status === 'draft').length;
      const progress = total > 0 ? Math.round((approved / total) * 100) : 0;

      setMetrics({
        totalWorkflows: total,
        quickWins,
        avgPotential: Number(avgPot.toFixed(1)),
        implementationProgress: progress,
        approvedWorkflows: approved,
        inProgressWorkflows: inProgress,
        draftWorkflows: draft,
      });

      const domainCounts: Record<string, number> = {};
      workflows.forEach(w => {
        const domainName = w.subdomain?.domain?.name || 'Uncategorized';
        domainCounts[domainName] = (domainCounts[domainName] || 0) + 1;
      });
      const domainChartData = Object.entries(domainCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({ name: name.length > 20 ? name.substring(0, 20) + '...' : name, count }));
      setDomainData(domainChartData);

      const waveCounts = [
        { name: 'Wave 1', value: workflows.filter(w => w.implementation_wave === 1).length, color: '#3B82F6' },
        { name: 'Wave 2', value: workflows.filter(w => w.implementation_wave === 2).length, color: '#10B981' },
        { name: 'Wave 3', value: workflows.filter(w => w.implementation_wave === 3).length, color: '#F59E0B' },
      ];
      setWaveData(waveCounts);

      const statusCounts = [
        { name: 'Approved', value: approved, color: '#10B981' },
        { name: 'In Progress', value: inProgress, color: '#3B82F6' },
        { name: 'Draft', value: draft, color: '#6B7280' },
      ];
      setStatusData(statusCounts);

      const potentialByWave = [
        {
          wave: 'Wave 1',
          avgPotential: workflows.filter(w => w.implementation_wave === 1)
            .reduce((sum, w) => sum + (w.agentic_potential || 0), 0) /
            workflows.filter(w => w.implementation_wave === 1).length || 0,
          avgComplexity: workflows.filter(w => w.implementation_wave === 1)
            .reduce((sum, w) => sum + (w.complexity || 0), 0) /
            workflows.filter(w => w.implementation_wave === 1).length || 0,
        },
        {
          wave: 'Wave 2',
          avgPotential: workflows.filter(w => w.implementation_wave === 2)
            .reduce((sum, w) => sum + (w.agentic_potential || 0), 0) /
            workflows.filter(w => w.implementation_wave === 2).length || 0,
          avgComplexity: workflows.filter(w => w.implementation_wave === 2)
            .reduce((sum, w) => sum + (w.complexity || 0), 0) /
            workflows.filter(w => w.implementation_wave === 2).length || 0,
        },
        {
          wave: 'Wave 3',
          avgPotential: workflows.filter(w => w.implementation_wave === 3)
            .reduce((sum, w) => sum + (w.agentic_potential || 0), 0) /
            workflows.filter(w => w.implementation_wave === 3).length || 0,
          avgComplexity: workflows.filter(w => w.implementation_wave === 3)
            .reduce((sum, w) => sum + (w.complexity || 0), 0) /
            workflows.filter(w => w.implementation_wave === 3).length || 0,
        },
      ];
      setPotentialTrend(potentialByWave);

      const activities: WorkflowActivity[] = workflows
        .slice(0, 10)
        .map(w => ({
          id: w.id,
          name: w.name,
          status: w.status || 'draft',
          domain: w.subdomain?.domain?.name || 'Uncategorized',
          updated_at: w.updated_at || w.created_at,
          action: 'Updated'
        }))
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

      setRecentActivity(activities);
    }
    } catch (error) {
      logDatabaseError('Unexpected error loading dashboard data', error, {
        table: 'workflows',
        operation: 'select',
      });
    }
  };

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#0EA5E9', '#8B5CF6'];

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'draft':
        return <FileEdit className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'in_progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'draft':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

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
          subtitle={`${metrics.approvedWorkflows} approved, ${metrics.inProgressWorkflows} in progress`}
        />
        <MetricCard
          title="Quick Wins Available"
          value={metrics.quickWins}
          icon={Zap}
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
          badge={{ text: 'High Priority', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' }}
          subtitle="Low complexity, high potential"
        />
        <MetricCard
          title="Avg Agentic Potential"
          value={`${metrics.avgPotential}/5`}
          icon={Target}
          iconBgColor="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600 dark:text-amber-400"
          subtitle="Across all workflows"
        />
        <MetricCard
          title="Implementation Progress"
          value={`${metrics.implementationProgress}%`}
          icon={TrendingUp}
          iconBgColor="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
          subtitle={`${metrics.approvedWorkflows} of ${metrics.totalWorkflows} approved`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => navigate('/workflows/new')}
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Create New Workflow</span>
        </button>
        <button
          onClick={() => navigate('/ontology')}
          className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-purple-600 dark:hover:border-purple-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          <Network className="w-5 h-5" />
          <span className="font-medium">Ontology Tree</span>
        </button>
        <button
          onClick={() => navigate('/performance')}
          className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-green-600 dark:hover:border-green-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          <Activity className="w-5 h-5" />
          <span className="font-medium">Agent Performance</span>
        </button>
        <button
          onClick={() => navigate('/analytics')}
          className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-600 dark:hover:border-blue-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
        >
          <BarChart3 className="w-5 h-5" />
          <span className="font-medium">Analytics</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <button
                  key={activity.id}
                  onClick={() => navigate(`/workflows/${activity.id}`)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {activity.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {activity.domain}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      {getTimeAgo(activity.updated_at)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mb-3 opacity-30" />
              <p>No recent activity to display</p>
              <p className="text-sm mt-1">Create a workflow to get started</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Workflow Status</h3>
          {statusData.some(s => s.value > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {statusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Domain Distribution</h3>
          {domainData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={domainData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={11} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Implementation Waves</h3>
          {waveData.some(w => w.value > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={waveData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {waveData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {waveData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.value} ({metrics.totalWorkflows > 0 ? Math.round((item.value / metrics.totalWorkflows) * 100) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Potential vs Complexity</h3>
          {potentialTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={potentialTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="wave" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 5]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgPotential"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Avg Potential"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="avgComplexity"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Avg Complexity"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Bot className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Ready to Supercharge Your Workflows?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You have <strong>{metrics.quickWins} high-potential, low-complexity workflows</strong> ready for immediate AI implementation.
              These quick wins can deliver significant value with minimal effort.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/workflows')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                View Quick Wins
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
              >
                See Full Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
