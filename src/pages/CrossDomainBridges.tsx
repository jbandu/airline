import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { GitBranch, TrendingUp, Network as NetworkIcon, ArrowRight } from 'lucide-react';
import { CrossDomainSankey } from '../components/visualizations/CrossDomainSankey';

interface DomainFlow {
  source: string;
  target: string;
  value: number;
  workflows: string[];
}

interface BridgeWorkflow {
  id: number;
  name: string;
  primary_domain: string;
  linked_domains: string[];
  linkage_count: number;
  avg_strength: number;
}

interface DomainStats {
  name: string;
  workflow_count: number;
  bridge_count: number;
}

export const CrossDomainBridges: React.FC = () => {
  const [flows, setFlows] = useState<DomainFlow[]>([]);
  const [bridgeWorkflows, setBridgeWorkflows] = useState<BridgeWorkflow[]>([]);
  const [domainStats, setDomainStats] = useState<DomainStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get workflows grouped by domains
      const { data: workflowData, error: workflowError } = await supabase
        .from('v_workflow_agent_assignments')
        .select('workflow_id, workflow_name, domain, subdomain');

      if (workflowError) throw workflowError;

      // Get cross-domain linkages if they exist
      const { data: linkageData } = await supabase
        .from('cross_domain_linkages')
        .select(`
          workflow_id,
          linked_domain_id,
          linkage_type,
          linkage_strength
        `);

      // Get domain information
      const { data: domains } = await supabase
        .from('domains')
        .select('id, name');

      // Process data to create flows
      const domainMap = new Map(domains?.map(d => [d.id, d.name]) || []);
      const flowMap = new Map<string, DomainFlow>();
      const workflowMap = new Map<number, string>();

      // Group workflows by domain
      const domainWorkflows = new Map<string, Set<number>>();
      workflowData?.forEach(w => {
        if (!domainWorkflows.has(w.domain)) {
          domainWorkflows.set(w.domain, new Set());
        }
        domainWorkflows.get(w.domain)?.add(w.workflow_id);
        workflowMap.set(w.workflow_id, w.workflow_name);
      });

      // Create flows between domains based on workflow relationships
      // For now, we'll create sample flows based on domain categories
      const sampleFlows: DomainFlow[] = [
        {
          source: 'Network Planning & Strategy',
          target: 'Flight Operations',
          value: 8,
          workflows: ['Automated Flight Plan Generation', 'Real-time Flight Delay Prediction']
        },
        {
          source: 'Network Planning & Strategy',
          target: 'Commercial & Distribution',
          value: 5,
          workflows: ['Dynamic Pricing Engine']
        },
        {
          source: 'Revenue Management',
          target: 'Commercial & Distribution',
          value: 6,
          workflows: ['Multi-Horizon Demand Forecasting']
        },
        {
          source: 'Flight Operations',
          target: 'Ground Operations',
          value: 7,
          workflows: ['Automated Gate Assignment', 'Intelligent Baggage Routing']
        },
        {
          source: 'Commercial & Distribution',
          target: 'Customer Experience & Servicing',
          value: 9,
          workflows: ['Conversational Customer Service Bot']
        },
        {
          source: 'Revenue Management',
          target: 'MRO / Engineering',
          value: 4,
          workflows: ['Predictive Maintenance Anomaly Detection']
        },
        {
          source: 'Crew Management',
          target: 'Commercial & Distribution',
          value: 3,
          workflows: ['Intelligent Crew Pairing Optimization']
        },
        {
          source: 'Ground Operations',
          target: 'Customer Experience & Servicing',
          value: 5,
          workflows: ['Intelligent Baggage Routing']
        },
        {
          source: 'Safety, Security & Compliance',
          target: 'Flight Operations',
          value: 4,
          workflows: ['Safety Incident Pattern Analysis']
        },
        {
          source: 'Cargo & Logistics',
          target: 'Ground Operations',
          value: 6,
          workflows: ['AI Cargo Load Planning', 'IoT-Enabled Cargo Tracking']
        }
      ];

      setFlows(sampleFlows);

      // Create bridge workflow list
      const bridges: BridgeWorkflow[] = [
        {
          id: 1,
          name: 'Automated Flight Plan Generation',
          primary_domain: 'Network Planning & Strategy',
          linked_domains: ['Flight Operations', 'Revenue Management'],
          linkage_count: 2,
          avg_strength: 4.5
        },
        {
          id: 5,
          name: 'Dynamic Pricing Engine',
          primary_domain: 'Customer Experience & Servicing',
          linked_domains: ['Revenue Management', 'Commercial & Distribution'],
          linkage_count: 2,
          avg_strength: 5.0
        },
        {
          id: 7,
          name: 'Automated Gate Assignment',
          primary_domain: 'Flight Operations',
          linked_domains: ['Ground Operations', 'Network Planning & Strategy'],
          linkage_count: 2,
          avg_strength: 4.0
        },
        {
          id: 3,
          name: 'Intelligent Crew Pairing Optimization',
          primary_domain: 'Commercial & Distribution',
          linked_domains: ['Crew Management', 'Flight Operations', 'Revenue Management'],
          linkage_count: 3,
          avg_strength: 4.8
        }
      ];

      setBridgeWorkflows(bridges);

      // Calculate domain stats
      const stats = new Map<string, DomainStats>();
      sampleFlows.forEach(flow => {
        if (!stats.has(flow.source)) {
          stats.set(flow.source, { name: flow.source, workflow_count: 0, bridge_count: 0 });
        }
        if (!stats.has(flow.target)) {
          stats.set(flow.target, { name: flow.target, workflow_count: 0, bridge_count: 0 });
        }
        stats.get(flow.source)!.bridge_count++;
        stats.get(flow.target)!.bridge_count++;
      });

      setDomainStats(Array.from(stats.values()).sort((a, b) => b.bridge_count - a.bridge_count));

    } catch (error) {
      console.error('Error loading cross-domain data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalBridges = flows.reduce((sum, flow) => sum + flow.value, 0);
  const uniqueDomains = new Set([...flows.map(f => f.source), ...flows.map(f => f.target)]).size;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading cross-domain bridges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <GitBranch className="w-8 h-8 text-orange-600" />
                Cross-Domain Bridges
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Workflows connecting multiple domains
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bridges</h3>
              <GitBranch className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalBridges}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Cross-domain connections
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Connected Domains</h3>
              <NetworkIcon className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{uniqueDomains}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Domains with bridges
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Bridge Workflows</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{bridgeWorkflows.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Multi-domain workflows
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Domain Flow Diagram</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Visual representation of workflow connections between domains
            </p>
          </div>
          <CrossDomainSankey flows={flows} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bridging Workflows</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Workflows that connect multiple domains
              </p>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {bridgeWorkflows.map((workflow) => (
                <div key={workflow.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {workflow.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Primary: {workflow.primary_domain}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium rounded-full">
                      {workflow.linkage_count} links
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {workflow.linked_domains.map((domain, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded"
                        >
                          {domain}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Strength: {workflow.avg_strength}/5
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Domain Connectivity</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Domains ranked by bridge connections
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {domainStats.map((stat, idx) => (
                  <div key={stat.name} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {stat.name}
                      </h4>
                      <div className="mt-1 bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full transition-all"
                          style={{ width: `${(stat.bridge_count / Math.max(...domainStats.map(s => s.bridge_count))) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {stat.bridge_count}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">bridges</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <NetworkIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                Impact Analysis
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                Cross-domain bridges represent workflows that span multiple business areas. Changes in these workflows
                can have cascading effects across domains.
              </p>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>High-value bridges:</strong> Workflows with linkage strength &gt;= 4 require careful change management
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Multi-domain workflows:</strong> Coordinate changes across all affected departments
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Integration points:</strong> Focus AI implementation on high-bridge domains for maximum impact
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
