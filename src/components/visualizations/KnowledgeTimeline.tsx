import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '../../lib/supabase';
import { Download, Calendar, TrendingUp, Activity } from 'lucide-react';

interface TimelineEntry {
  month: string;
  entity_type: string;
  count: number;
  cumulative: number;
}

interface Summary {
  total_workflows: number;
  total_comments: number;
  total_attachments: number;
  total_stakeholders: number;
  first_date: string;
  last_date: string;
}

interface TimelineData {
  timeline: TimelineEntry[];
  summary: Summary;
}

interface ChartDataPoint {
  month: string;
  workflows: number;
  comments: number;
  attachments: number;
  stakeholders: number;
}

type ViewMode = 'cumulative' | 'monthly';
type Granularity = 'monthly';

export const KnowledgeTimeline: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TimelineData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cumulative');
  const [granularity] = useState<Granularity>('monthly');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.rpc('get_knowledge_timeline');

      if (error) throw error;

      if (result) {
        setData(result as TimelineData);
      }
    } catch (error) {
      console.error('Error loading knowledge timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = (): ChartDataPoint[] => {
    if (!data || !data.timeline) return [];

    const grouped = new Map<string, ChartDataPoint>();

    data.timeline.forEach((entry) => {
      const monthKey = new Date(entry.month).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });

      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, {
          month: monthKey,
          workflows: 0,
          comments: 0,
          attachments: 0,
          stakeholders: 0,
        });
      }

      const point = grouped.get(monthKey)!;
      const value = viewMode === 'cumulative' ? entry.cumulative : entry.count;

      if (entry.entity_type === 'workflow') point.workflows = value;
      else if (entry.entity_type === 'comment') point.comments = value;
      else if (entry.entity_type === 'attachment') point.attachments = value;
      else if (entry.entity_type === 'stakeholder') point.stakeholders = value;
    });

    return Array.from(grouped.values()).sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const calculateGrowthRate = () => {
    if (!data || !data.timeline) return 0;

    const workflowData = data.timeline
      .filter((e) => e.entity_type === 'workflow')
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    if (workflowData.length < 2) return 0;

    const recent = workflowData.slice(-3);
    const totalGrowth = recent.reduce((sum, entry) => sum + entry.count, 0);
    return Math.round(totalGrowth / recent.length);
  };

  const getMostActiveMonth = () => {
    if (!data || !data.timeline) return 'N/A';

    const monthTotals = new Map<string, number>();

    data.timeline.forEach((entry) => {
      const monthKey = new Date(entry.month).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
      monthTotals.set(monthKey, (monthTotals.get(monthKey) || 0) + entry.count);
    });

    let maxMonth = '';
    let maxCount = 0;

    monthTotals.forEach((count, month) => {
      if (count > maxCount) {
        maxCount = count;
        maxMonth = month;
      }
    });

    return maxMonth || 'N/A';
  };

  const getFastestGrowingType = () => {
    if (!data || !data.timeline) return 'N/A';

    const typeTotals = new Map<string, number>();

    data.timeline.forEach((entry) => {
      typeTotals.set(entry.entity_type, (typeTotals.get(entry.entity_type) || 0) + entry.count);
    });

    let maxType = '';
    let maxCount = 0;

    typeTotals.forEach((count, type) => {
      if (count > maxCount) {
        maxCount = count;
        maxType = type;
      }
    });

    return maxType.charAt(0).toUpperCase() + maxType.slice(1) + 's';
  };

  const exportData = () => {
    const chartData = formatChartData();
    const csv = [
      ['Month', 'Workflows', 'Comments', 'Attachments', 'Stakeholders'],
      ...chartData.map((d) => [d.month, d.workflows, d.comments, d.attachments, d.stakeholders]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'knowledge-timeline.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading knowledge timeline...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.timeline || data.timeline.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600 dark:text-gray-400">No timeline data available</p>
      </div>
    );
  }

  const chartData = formatChartData();
  const growthRate = calculateGrowthRate();
  const mostActiveMonth = getMostActiveMonth();
  const fastestGrowing = getFastestGrowingType();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('cumulative')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'cumulative'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Cumulative
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Monthly Additions
              </button>
            </div>
          </div>

          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-900 dark:text-white">Export CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Knowledge Base Growth Over Time
        </h3>

        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorWorkflows" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorAttachments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorStakeholders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis dataKey="month" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
            <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f3f4f6',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="workflows"
              name="Workflows"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorWorkflows)"
            />
            <Area
              type="monotone"
              dataKey="comments"
              name="Comments"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorComments)"
            />
            <Area
              type="monotone"
              dataKey="attachments"
              name="Attachments"
              stroke="#a855f7"
              fillOpacity={1}
              fill="url(#colorAttachments)"
            />
            <Area
              type="monotone"
              dataKey="stakeholders"
              name="Stakeholders"
              stroke="#f97316"
              fillOpacity={1}
              fill="url(#colorStakeholders)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Total Workflows</h4>
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{data.summary.total_workflows}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Growth Rate</h4>
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{growthRate}/mo</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Avg workflows per month</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Most Active Month</h4>
          </div>
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{mostActiveMonth}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Highest activity period</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Fastest Growing</h4>
          </div>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{fastestGrowing}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Most added entity type</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Comments</h4>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{data.summary.total_comments}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total discussions</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Attachments</h4>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{data.summary.total_attachments}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total files uploaded</p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Stakeholders</h4>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{data.summary.total_stakeholders}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total people involved</p>
        </div>
      </div>

      {data.summary.first_date && data.summary.last_date && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h4 className="font-semibold text-blue-900 dark:text-blue-300">Timeline Range</h4>
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>First Entry:</strong>{' '}
            {new Date(data.summary.first_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Latest Entry:</strong>{' '}
            {new Date(data.summary.last_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
            <strong>Duration:</strong>{' '}
            {Math.ceil(
              (new Date(data.summary.last_date).getTime() - new Date(data.summary.first_date).getTime()) /
                (1000 * 60 * 60 * 24 * 30)
            )}{' '}
            months
          </p>
        </div>
      )}
    </div>
  );
};
