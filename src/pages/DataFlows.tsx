import React, { useEffect, useState } from 'react';
import { Workflow, Activity, Database, Zap, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DataFlowsSankey } from '../components/visualizations/DataFlowsSankey';

interface DataFlow {
  source: string;
  target: string;
  value: number;
  label?: string;
}

type FlowScenario = 'baggage' | 'rebooking' | 'revenue' | 'all';

export const DataFlows: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<FlowScenario>('baggage');
  const [entities, setEntities] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.from('data_entities').select('*');
      setEntities(data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Predefined flow scenarios
  const getFlowsForScenario = (scenario: FlowScenario): DataFlow[] => {
    switch (scenario) {
      case 'baggage':
        return [
          // Source → Data Entity
          { source: 'BRS', target: 'BAGGAGE', value: 400, label: '400K bags/day' },
          // Data Entity → Processing
          { source: 'BAGGAGE', target: 'Data Lake', value: 400, label: 'Kinesis Stream' },
          // Processing → Agents
          { source: 'Data Lake', target: 'Bag Tracking Agent', value: 200, label: 'Real-time stream' },
          { source: 'Data Lake', target: 'Misconnect Recovery Agent', value: 50, label: 'Alert triggers' },
          // Agents → Workflows
          { source: 'Bag Tracking Agent', target: 'Track Bag Workflow', value: 200, label: 'Location updates' },
          { source: 'Misconnect Recovery Agent', target: 'Recovery Workflow', value: 50, label: 'Recovery actions' }
        ];

      case 'rebooking':
        return [
          // Multiple sources
          { source: 'Amadeus PSS', target: 'PNR', value: 500, label: '500K records/day' },
          { source: 'Flight Ops', target: 'FLIFO', value: 2000, label: '2K flights' },
          { source: 'Revenue System', target: 'INVENTORY', value: 1000, label: 'Seat availability' },
          // To Data Lake
          { source: 'PNR', target: 'Data Lake', value: 500, label: 'DynamoDB' },
          { source: 'FLIFO', target: 'Data Lake', value: 2000, label: 'Real-time stream' },
          { source: 'INVENTORY', target: 'Data Lake', value: 1000, label: 'Real-time queries' },
          // To Agent (multi-source)
          { source: 'Data Lake', target: 'Rebooking Agent', value: 300, label: 'Disruption events' },
          // Agent to Workflows
          { source: 'Rebooking Agent', target: 'Proactive Rebooking', value: 300, label: 'Auto-rebook' }
        ];

      case 'revenue':
        return [
          // Source → Entity
          { source: 'Revenue System', target: 'INVENTORY', value: 100000, label: '100M queries/day' },
          { source: 'Amadeus PSS', target: 'PNR', value: 500, label: 'Booking data' },
          // Entity → Processing
          { source: 'INVENTORY', target: 'Data Lake', value: 100000, label: 'S3 Parquet' },
          { source: 'PNR', target: 'Data Lake', value: 500, label: 'Historical data' },
          // Processing → Analytics
          { source: 'Data Lake', target: 'Analytics', value: 50000, label: 'ML Models' },
          // Analytics → Agents
          { source: 'Analytics', target: 'Pricing Agent', value: 10000, label: 'Dynamic pricing' },
          { source: 'Analytics', target: 'Demand Forecasting', value: 5000, label: 'Predictions' },
          // Agents → Workflows
          { source: 'Pricing Agent', target: 'Revenue Management', value: 10000, label: 'Price updates' }
        ];

      case 'all':
        return [
          // Source Systems Layer
          { source: 'Amadeus PSS', target: 'PNR', value: 500, label: '500K/day' },
          { source: 'Flight Ops', target: 'FLIFO', value: 2000, label: '2K flights' },
          { source: 'BRS', target: 'BAGGAGE', value: 400, label: '400K bags' },
          { source: 'Revenue System', target: 'INVENTORY', value: 1000, label: 'Seat data' },

          // ODS/Lake Layer
          { source: 'PNR', target: 'Data Lake', value: 500 },
          { source: 'FLIFO', target: 'Data Lake', value: 2000 },
          { source: 'BAGGAGE', target: 'Data Lake', value: 400 },
          { source: 'INVENTORY', target: 'Data Lake', value: 1000 },

          // Analytics Layer
          { source: 'Data Lake', target: 'Analytics', value: 3900 },

          // Agents
          { source: 'Analytics', target: 'Delay Detection Agent', value: 500 },
          { source: 'Analytics', target: 'Rebooking Agent', value: 300 },
          { source: 'Analytics', target: 'Bag Tracking Agent', value: 200 },
          { source: 'Analytics', target: 'Pricing Agent', value: 100 }
        ];

      default:
        return [];
    }
  };

  const scenarios = [
    {
      id: 'baggage' as FlowScenario,
      name: 'Baggage Misconnect Recovery',
      description: 'BRS → BAGGAGE → Agents → Recovery Workflows',
      icon: '🧳',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'rebooking' as FlowScenario,
      name: 'Proactive Rebooking',
      description: 'PNR + FLIFO + INVENTORY → Rebooking Agent → Workflows',
      icon: '✈️',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'revenue' as FlowScenario,
      name: 'Revenue Management',
      description: 'INVENTORY → Analytics → Pricing Agent → Dynamic Pricing',
      icon: '💰',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'all' as FlowScenario,
      name: 'Complete Platform',
      description: 'All data flows across the 4-tier architecture',
      icon: '🌐',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const flows = getFlowsForScenario(selectedScenario);
  const selectedScenarioInfo = scenarios.find(s => s.id === selectedScenario);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/30">
            <Workflow className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Data Flows
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Visualize how data moves through your airline platform
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-semibold text-white">Select Flow Scenario</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setSelectedScenario(scenario.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedScenario === scenario.id
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${scenario.color} flex items-center justify-center text-2xl`}>
                  {scenario.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-sm">{scenario.name}</h3>
                </div>
              </div>
              <p className="text-xs text-gray-400">{scenario.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Flow Visualization */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        {selectedScenarioInfo && (
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedScenarioInfo.color} flex items-center justify-center text-xl`}>
                {selectedScenarioInfo.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedScenarioInfo.name}</h3>
                <p className="text-sm text-gray-400">{selectedScenarioInfo.description}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <DataFlowsSankey flows={flows} height={500} />
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm font-semibold text-white">Source Systems</span>
          </div>
          <p className="text-xs text-gray-400">PSS, BRS, DCS, Revenue Systems</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm font-semibold text-white">Data Entities</span>
          </div>
          <p className="text-xs text-gray-400">PNR, FLIFO, BAGGAGE, INVENTORY, etc.</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-sm font-semibold text-white">Processing/Analytics</span>
          </div>
          <p className="text-xs text-gray-400">Data Lake, ML Models, Analytics</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm font-semibold text-white">Agents & Workflows</span>
          </div>
          <p className="text-xs text-gray-400">AI Agents, Business Workflows</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Flow Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-bold text-white">{flows.length}</p>
            <p className="text-sm text-gray-400">Data Connections</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{new Set(flows.map(f => f.source)).size}</p>
            <p className="text-sm text-gray-400">Source Nodes</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{new Set(flows.map(f => f.target)).size}</p>
            <p className="text-sm text-gray-400">Target Nodes</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{flows.reduce((sum, f) => sum + f.value, 0).toLocaleString()}</p>
            <p className="text-sm text-gray-400">Total Flow Volume</p>
          </div>
        </div>
      </div>
    </div>
  );
};
