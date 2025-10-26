import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle, Zap, PlayCircle } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AgentMetrics {
  agent_type_id: number;
  code: string;
  name: string;
  category_code: string;
  total_instances: number;
  active_instances: number;
  total_executions: number;
  avg_success_rate: number;
  avg_duration_ms: number;
  last_execution_at: string;
}

interface ExecutionHistory {
  id: number;
  execution_id: string;
  agent_name: string;
  workflow_name: string;
  status: string;
  started_at: string;
  completed_at: string;
  duration_ms: number;
  fallback_triggered: boolean;
  human_intervention_required: boolean;
}

interface PerformanceTrend {
  time: string;
  success_rate: number;
  avg_duration: number;
  executions: number;
}

export const AgentPerformance: React.FC = () => {
  const [metrics, setMetrics] = useState<AgentMetrics[]>([]);
  const [executions, setExecutions] = useState<ExecutionHistory[]>([]);
  const [trends, setTrends] = useState<PerformanceTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      if (autoRefresh) {
        loadData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadData = async () => {
    try {
      const { data: performanceData, error: perfError } = await supabase
        .from('v_agent_performance')
        .select('*');

      if (perfError) {
        console.warn('Agent performance view not available:', perfError);
        // View doesn't exist yet - set empty data
        setMetrics([]);
        setExecutions([]);
        setTrends([]);
      } else {
        // If view exists, use real data
        setMetrics(performanceData || []);

        // Try to load execution history if available
        const { data: execData } = await supabase
          .from('agent_executions')
          .select('*')
          .order('started_at', { ascending: false })
          .limit(15);

        setExecutions(execData || []);

        // Try to load performance trends
        const { data: trendData } = await supabase
          .from('v_agent_performance_trends')
          .select('*')
          .order('time', { ascending: true });

        setTrends(trendData || []);
      }
    } catch (error) {
      console.error('Error loading agent performance data:', error);
      setMetrics([]);
      setExecutions([]);
      setTrends([]);
    } finally {
      setLoading(false);
    }
  };

  const totalExecutions = metrics.reduce((sum, m) => sum + m.total_executions, 0);
  const totalActive = metrics.reduce((sum, m) => sum + m.active_instances, 0);
  const totalInstances = metrics.reduce((sum, m) => sum + m.total_instances, 0);
  const avgSuccessRate = metrics.length > 0
    ? (metrics.reduce((sum, m) => sum + m.avg_success_rate, 0) / metrics.length).toFixed(1)
    : 0;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'running':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      case 'running':
        return <PlayCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getTimeAgo = (dateString: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading agent performance...</p>
        </div>
      </div>
    );
  }

  const hasData = metrics.length > 0 || executions.length > 0 || trends.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Activity className="w-8 h-8 text-green-600" />
                Agent Performance Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Real-time monitoring and performance metrics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded text-green-600 focus:ring-green-500"
                />
                Auto-refresh (5s)
              </label>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {!hasData ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center max-w-md">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No Performance Data Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Agent performance metrics will appear here once agents are deployed and start executing workflows.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                The required database views (v_agent_performance, agent_executions, v_agent_performance_trends) are not yet configured.
              </p>
            </div>
          </div>
        ) : (
          <>
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Executions</h3>
              <Zap className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalExecutions.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Last 24 hours</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{avgSuccessRate}%</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">↑ 2.3% from yesterday</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Agents</h3>
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalActive}/{totalInstances}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {((totalActive / totalInstances) * 100).toFixed(0)}% utilization
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Duration</h3>
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatDuration(metrics.reduce((sum, m) => sum + m.avg_duration_ms, 0) / metrics.length)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Per execution</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Success Rate Trend</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Last 24 hours</p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} domain={[90, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="success_rate"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSuccess)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Execution Volume</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Hourly distribution</p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                  <Bar dataKey="executions" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Agent Status</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Real-time health metrics</p>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {metrics.map((agent) => (
                <div key={agent.agent_type_id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{agent.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                        Last executed {getTimeAgo(agent.last_execution_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {agent.avg_success_rate.toFixed(1)}%
                      </span>
                      <div className={`w-2 h-2 rounded-full ${agent.active_instances > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{agent.active_instances}/{agent.total_instances} active</span>
                    <span>{agent.total_executions.toLocaleString()} executions</span>
                    <span>{formatDuration(agent.avg_duration_ms)} avg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Executions</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Latest agent activity</p>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-800 max-h-[500px] overflow-y-auto">
              {executions.map((execution) => (
                <div key={execution.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {execution.agent_name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 truncate">
                        {execution.workflow_name}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(execution.status)}`}>
                      {getStatusIcon(execution.status)}
                      {execution.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(execution.duration_ms)}
                    </span>
                    <span>{getTimeAgo(execution.started_at)}</span>
                    {execution.fallback_triggered && (
                      <span className="flex items-center gap-1 text-orange-600">
                        <AlertTriangle className="w-3 h-3" />
                        Fallback
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
};
