import React, { useEffect, useState } from 'react';
import { ScatterChart, Scatter, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ReferenceLine } from 'recharts';
import { Download, TrendingUp, Shield, Zap, Brain, Calendar, BarChart3, Network, GitBranch, Grid3x3, Database, Clock, GitMerge } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Workflow } from '../types/database.types';
import { useNavigate } from 'react-router-dom';
import { logDatabaseError } from '../lib/errorLogger';
import { validateWorkflowsWithRelations } from '../lib/dataValidator';
import { OntologyTree } from '../components/visualizations/OntologyTree';
import { KnowledgeGraph } from '../components/visualizations/KnowledgeGraph';
import { SemanticMatrix } from '../components/visualizations/SemanticMatrix';
import { OntologyConceptMap } from '../components/visualizations/OntologyConceptMap';
import { KnowledgeTimeline } from '../components/visualizations/KnowledgeTimeline';
import { CrossDomainBridgeMap } from '../components/visualizations/CrossDomainBridgeMap';

type TabType = 'overview' | 'ontology' | 'knowledge' | 'semantic' | 'schema' | 'timeline' | 'bridges';

export const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [scatterData, setScatterData] = useState<any[]>([]);
  const [domainData, setDomainData] = useState<any[]>([]);
  const [waveData, setWaveData] = useState<any[]>([]);
  const [topWorkflows, setTopWorkflows] = useState<any[]>([]);
  const [autonomyData, setAutonomyData] = useState<any[]>([]);
  const [aiEnablersData, setAiEnablersData] = useState<any[]>([]);
  const [timelineData, setTimelineData] = useState<any[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const { data, error } = await supabase
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
        logDatabaseError('Failed to load analytics data', error, {
          table: 'workflows',
          operation: 'select',
          query: 'loadAnalyticsData',
        });
        return;
      }

      if (!data || !validateWorkflowsWithRelations(data, 'loadAnalyticsData')) {
        return;
      }

      if (data) {
      setWorkflows(data);

      const scatter = data.map((w) => ({
        id: w.id,
        name: w.name,
        complexity: w.complexity || 3,
        potential: w.agentic_potential || 3,
        wave: w.implementation_wave || 1,
      }));
      setScatterData(scatter);

      const domainCounts: Record<string, number> = {};
      data.forEach((w) => {
        const domainName = w.subdomain?.domain?.name || 'Uncategorized';
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
        .sort((a, b) => (b.agentic_potential || 0) - (a.agentic_potential || 0))
        .slice(0, 10)
        .map((w) => ({
          name: w.name,
          potential: w.agentic_potential || 0,
          complexity: w.complexity || 0,
          wave: w.implementation_wave || 0,
        }));
      setTopWorkflows(top);

      const autonomyCounts = [
        { level: 'Level 1', count: data.filter((w) => w.autonomy_level === 1).length },
        { level: 'Level 2', count: data.filter((w) => w.autonomy_level === 2).length },
        { level: 'Level 3', count: data.filter((w) => w.autonomy_level === 3).length },
        { level: 'Level 4', count: data.filter((w) => w.autonomy_level === 4).length },
        { level: 'Level 5', count: data.filter((w) => w.autonomy_level === 5).length },
      ];
      setAutonomyData(autonomyCounts);

      const aiEnablersMap: Record<string, number> = {};
      data.forEach((w) => {
        if (w.ai_enablers && Array.isArray(w.ai_enablers)) {
          w.ai_enablers.forEach((enabler) => {
            aiEnablersMap[enabler] = (aiEnablersMap[enabler] || 0) + 1;
          });
        }
      });
      const aiEnablers = Object.entries(aiEnablersMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      setAiEnablersData(aiEnablers);

      const timeline = [
        { wave: 'Wave 1', workflows: data.filter((w) => w.implementation_wave === 1).length, avgComplexity: data.filter((w) => w.implementation_wave === 1).reduce((acc, w) => acc + (w.complexity || 0), 0) / (data.filter((w) => w.implementation_wave === 1).length || 1) },
        { wave: 'Wave 2', workflows: data.filter((w) => w.implementation_wave === 2).length, avgComplexity: data.filter((w) => w.implementation_wave === 2).reduce((acc, w) => acc + (w.complexity || 0), 0) / (data.filter((w) => w.implementation_wave === 2).length || 1) },
        { wave: 'Wave 3', workflows: data.filter((w) => w.implementation_wave === 3).length, avgComplexity: data.filter((w) => w.implementation_wave === 3).reduce((acc, w) => acc + (w.complexity || 0), 0) / (data.filter((w) => w.implementation_wave === 3).length || 1) },
      ];
      setTimelineData(timeline);
    }
    } catch (error) {
      logDatabaseError('Unexpected error loading analytics data', error, {
        table: 'workflows',
        operation: 'select',
      });
    }
  };

  const handleScatterClick = (data: any) => {
    if (data && data.id) {
      navigate(`/workflows/${data.id}`);
    }
  };

  const exportChart = (chartName: string) => {
    console.log(`Exporting ${chartName}...`);
  };

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#0EA5E9', '#8B5CF6'];

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

      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('ontology')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'ontology'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Network className="w-5 h-5" />
            <span className="font-medium">Ontology Tree</span>
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'knowledge'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <GitBranch className="w-5 h-5" />
            <span className="font-medium">Knowledge Graph</span>
          </button>
          <button
            onClick={() => setActiveTab('semantic')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'semantic'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Grid3x3 className="w-5 h-5" />
            <span className="font-medium">Semantic Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'schema'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Database className="w-5 h-5" />
            <span className="font-medium">Ontology Schema</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="font-medium">Knowledge Timeline</span>
          </button>
          <button
            onClick={() => setActiveTab('bridges')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'bridges'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <GitMerge className="w-5 h-5" />
            <span className="font-medium">Cross-Domain Bridges</span>
          </button>
        </nav>
      </div>

      {activeTab === 'ontology' && <OntologyTree />}
      {activeTab === 'knowledge' && <KnowledgeGraph />}
      {activeTab === 'semantic' && <SemanticMatrix />}
      {activeTab === 'schema' && <OntologyConceptMap />}
      {activeTab === 'timeline' && <KnowledgeTimeline />}
      {activeTab === 'bridges' && <CrossDomainBridgeMap />}

      {activeTab === 'overview' && (
        <div className="space-y-6">

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
              ? (workflows.reduce((acc, w) => acc + (w.agentic_potential || 0), 0) / workflows.length).toFixed(1)
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
              ? (workflows.reduce((acc, w) => acc + (w.complexity || 0), 0) / workflows.length).toFixed(1)
              : '0'}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Out of 5.0</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Complexity vs Agentic Potential Matrix
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Click any dot to view workflow details
            </p>
          </div>
          <button
            onClick={() => exportChart('complexity-matrix')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Export Chart
          </button>
        </div>
        {scatterData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <ReferenceLine x={3} stroke="#6B7280" strokeDasharray="3 3" />
              <ReferenceLine y={3} stroke="#6B7280" strokeDasharray="3 3" />
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
              <Scatter
                name="Wave 1"
                data={scatterData.filter((d) => d.wave === 1)}
                fill="#2563EB"
                onClick={handleScatterClick}
                cursor="pointer"
              />
              <Scatter
                name="Wave 2"
                data={scatterData.filter((d) => d.wave === 2)}
                fill="#10B981"
                onClick={handleScatterClick}
                cursor="pointer"
              />
              <Scatter
                name="Wave 3"
                data={scatterData.filter((d) => d.wave === 3)}
                fill="#F59E0B"
                onClick={handleScatterClick}
                cursor="pointer"
              />
            </ScatterChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-96 flex items-center justify-center text-gray-400">No data available</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Autonomy Level Distribution
              </h2>
            </div>
            <button
              onClick={() => exportChart('autonomy-distribution')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Export Chart
            </button>
          </div>
          {autonomyData.some((d) => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={autonomyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="level" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(17, 24, 39)',
                    border: '1px solid rgb(55, 65, 81)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400">No data available</div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Top AI Enablers
              </h2>
            </div>
            <button
              onClick={() => exportChart('ai-enablers')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Export Chart
            </button>
          </div>
          {aiEnablersData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={aiEnablersData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis type="number" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#9CA3AF', fontSize: 11 }} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(17, 24, 39)',
                    border: '1px solid rgb(55, 65, 81)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400">No data available</div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Implementation Timeline
            </h2>
          </div>
          <button
            onClick={() => exportChart('timeline')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Export Chart
          </button>
        </div>
        {timelineData.some((d) => d.workflows > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="wave" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(17, 24, 39)',
                  border: '1px solid rgb(55, 65, 81)',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="workflows"
                stroke="#2563EB"
                strokeWidth={3}
                dot={{ fill: '#2563EB', r: 6 }}
                name="Workflows"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgComplexity"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 6 }}
                name="Avg Complexity"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-400">No data available</div>
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
                  label={(props: any) => `${props.name}: ${(props.percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {waveData.map((_entry, index) => (
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
      )}
    </div>
  );
};
