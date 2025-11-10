import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Folder, FileText, Bot, Network, TrendingUp, Zap, Target, Activity, ArrowRight, GitBranch, TreeDeciduous } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Stats {
  domains: number;
  workflows: number;
  agents: number;
  bridges: number;
}

interface QuickMetric {
  value: number;
  label: string;
  change?: string;
  trend?: 'up' | 'down';
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ domains: 0, workflows: 0, agents: 0, bridges: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [domainsRes, workflowsRes, agentsRes, bridgesRes] = await Promise.all([
        supabase.from('domains').select('id', { count: 'exact', head: true }),
        supabase.from('workflows').select('id', { count: 'exact', head: true }).is('archived_at', null),
        supabase.from('agents').select('id', { count: 'exact', head: true }).eq('active', true),
        supabase.from('v_cross_domain_bridges').select('workflow_id', { count: 'exact', head: true }),
      ]);

      setStats({
        domains: domainsRes.count || 0,
        workflows: workflowsRes.count || 0,
        agents: agentsRes.count || 0,
        bridges: bridgesRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Folder,
      title: 'Domains',
      value: stats.domains,
      description: 'Business areas mapped',
      color: 'from-blue-500 to-cyan-500',
      link: '/domains'
    },
    {
      icon: FileText,
      title: 'Workflows',
      value: stats.workflows,
      description: 'Processes documented',
      color: 'from-purple-500 to-pink-500',
      link: '/workflows'
    },
    {
      icon: Bot,
      title: 'AI Agents',
      value: stats.agents,
      description: 'Intelligent automations',
      color: 'from-green-500 to-emerald-500',
      link: '/agents'
    },
    {
      icon: GitBranch,
      title: 'Cross-Domain Bridges',
      value: stats.bridges,
      description: 'Integration points',
      color: 'from-orange-500 to-red-500',
      link: '/bridges'
    },
  ];

  const knowledgeViews = [
    {
      icon: Network,
      title: 'Knowledge Graph',
      description: '600+ relationships visualized',
      color: 'from-cyan-500 to-blue-600',
      link: '/knowledge-graph'
    },
    {
      icon: TreeDeciduous,
      title: 'Ontology Tree',
      description: '413 concepts hierarchically organized',
      color: 'from-green-500 to-teal-600',
      link: '/ontology'
    },
    {
      icon: GitBranch,
      title: 'Cross-Domain Bridges',
      description: '449 cross-domain connections',
      color: 'from-orange-500 to-pink-600',
      link: '/bridges'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500 mx-auto"></div>
          <p className="text-cyan-400 mt-6 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 p-8 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/50 animate-pulse-glow">
              <Plane className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-gradient-cyan">
                Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
              </h1>
              <p className="text-cyan-300 text-lg mt-1">Airline Operations Intelligence Platform</p>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                onClick={() => navigate(feature.link)}
                className={`glass rounded-2xl p-6 cursor-pointer card-hover animate-fade-in animation-delay-${index * 200}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                </div>
                <div className="text-5xl font-bold text-white mb-2">{feature.value}</div>
                <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Airline Structure */}
          <div className="glass rounded-2xl p-8 animate-fade-in animation-delay-400">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Airline Structure</h2>
            </div>
            <p className="text-gray-300 mb-6">
              Explore the complete organizational structure of your airline operations
            </p>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/domains')}
                className="glass-light rounded-xl p-4 hover:bg-white/10 transition-smooth group"
              >
                <Folder className="w-8 h-8 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-semibold text-white">Domains</div>
                <div className="text-xs text-gray-400">{stats.domains} areas</div>
              </button>
              <button
                onClick={() => navigate('/workflows')}
                className="glass-light rounded-xl p-4 hover:bg-white/10 transition-smooth group"
              >
                <FileText className="w-8 h-8 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-semibold text-white">Workflows</div>
                <div className="text-xs text-gray-400">{stats.workflows} processes</div>
              </button>
              <button
                onClick={() => navigate('/agents')}
                className="glass-light rounded-xl p-4 hover:bg-white/10 transition-smooth group"
              >
                <Bot className="w-8 h-8 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-semibold text-white">Agents</div>
                <div className="text-xs text-gray-400">{stats.agents} active</div>
              </button>
            </div>
          </div>

          {/* Knowledge Views */}
          <div className="glass rounded-2xl p-8 animate-fade-in animation-delay-600">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-8 h-8 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">Knowledge Views</h2>
            </div>
            <p className="text-gray-300 mb-6">
              Visualize relationships and connections across your operations
            </p>
            <div className="space-y-3">
              {knowledgeViews.map((view, index) => {
                const Icon = view.icon;
                return (
                  <button
                    key={view.title}
                    onClick={() => navigate(view.link)}
                    className="w-full glass-light rounded-xl p-4 hover:bg-white/10 transition-smooth flex items-center gap-4 group"
                  >
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${view.color} flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold text-white">{view.title}</div>
                      <div className="text-xs text-gray-400">{view.description}</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Platform Insights */}
        <div className="glass rounded-2xl p-8 animate-fade-in animation-delay-800">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-8 h-8 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">Platform Insights</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
                <Zap className="w-8 h-8 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stats.workflows}</div>
              <div className="text-sm text-gray-400">Total Workflows</div>
              <div className="text-xs text-cyan-400 mt-1">Documented processes</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4">
                <Network className="w-8 h-8 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">600+</div>
              <div className="text-sm text-gray-400">Knowledge Graph Edges</div>
              <div className="text-xs text-cyan-400 mt-1">Relationships mapped</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/20 mb-4">
                <GitBranch className="w-8 h-8 text-orange-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">449</div>
              <div className="text-sm text-gray-400">Cross-Domain Linkages</div>
              <div className="text-xs text-cyan-400 mt-1">Integration points</div>
            </div>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="mt-12 text-center animate-fade-in animation-delay-800">
          <p className="text-gray-400 text-lg italic">
            "Understanding your airline's operations is the first step to transformation"
          </p>
        </div>
      </div>
    </div>
  );
};
