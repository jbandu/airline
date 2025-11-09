import React, { useEffect, useState } from 'react';
import { HardDrive, Server, Cloud, Database, BarChart, ChevronDown, ChevronRight, Workflow, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LayerStats {
  layerId: number;
  layerName: string;
  entityCount: number;
  workflowCount: number;
  agentCount: number;
  totalVolume: number;
}

interface DataEntity {
  id: number;
  code: string;
  name: string;
  icon: string;
  volume_per_day: number;
  workflow_count: number;
  agent_count: number;
}

export const DataArchitectureLayers: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [expandedLayer, setExpandedLayer] = useState<number | null>(null);
  const [layerStats, setLayerStats] = useState<LayerStats[]>([]);
  const [layerEntities, setLayerEntities] = useState<Record<number, DataEntity[]>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get layer statistics
      const { data: statsData } = await supabase
        .from('v_architecture_layer_stats')
        .select('*')
        .order('layer_order');

      setLayerStats(statsData || []);

      // Get entities grouped by layer
      const { data: entitiesData } = await supabase
        .from('v_data_entities_with_usage')
        .select('*')
        .order('volume_per_day', { ascending: false });

      // Group entities by layer
      const grouped: Record<number, DataEntity[]> = {};
      if (entitiesData) {
        entitiesData.forEach((entity: any) => {
          const layerId = entity.layer_id || 2; // Default to ODS layer
          if (!grouped[layerId]) {
            grouped[layerId] = [];
          }
          grouped[layerId].push(entity);
        });
      }

      setLayerEntities(grouped);
    } catch (error) {
      console.error('Error loading architecture data:', error);
    } finally {
      setLoading(false);
    }
  };

  const layers = [
    {
      id: 4,
      name: 'Analytics & ML Layer',
      description: 'AI Agents, Analytics, Machine Learning Models',
      icon: BarChart,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-900/30 to-purple-800/30',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400',
      technologies: ['Amazon Redshift', 'SageMaker', 'Athena', 'QuickSight', 'Lambda'],
      description_detail: 'Where AI agents consume data for decision-making, analytics dashboards aggregate insights, and ML models train on historical data.'
    },
    {
      id: 3,
      name: 'Data Lake',
      description: 'Centralized Data Repository & Processing',
      icon: Database,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-900/30 to-blue-800/30',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      technologies: ['Amazon S3', 'AWS Glue', 'EMR', 'Lake Formation', 'Kinesis'],
      description_detail: 'Workflows produce curated data here. Raw zone, staging zone, and Parquet-optimized analytics zone for historical analysis.'
    },
    {
      id: 2,
      name: 'Operational Data Store (ODS)',
      description: 'Real-time Operational Data Entities',
      icon: Cloud,
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-900/30 to-orange-800/30',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400',
      technologies: ['DynamoDB', 'Kinesis Streams', 'EventBridge', 'Lambda', 'Aurora'],
      description_detail: 'Your 8 core data entities (PNR, FLIFO, BAGGAGE, etc.) live here. Real-time data with < 1 second latency for operational workflows.'
    },
    {
      id: 1,
      name: 'Source Systems',
      description: 'Legacy Airline Systems & Feeds',
      icon: Server,
      color: 'from-red-500 to-pink-500',
      bgColor: 'from-red-900/30 to-red-800/30',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400',
      technologies: ['Amadeus PSS', 'Sabre', 'DCS', 'BRS', 'Revenue Management', 'Loyalty Systems'],
      description_detail: 'External airline systems that generate raw operational data. Your 22 domains map to these legacy systems.'
    },
  ];

  const toggleLayer = (layerId: number) => {
    setExpandedLayer(expandedLayer === layerId ? null : layerId);
  };

  const getLayerStats = (layerId: number): LayerStats | undefined => {
    return layerStats.find(s => s.layerId === layerId);
  };

  const getLayerEntities = (layerId: number): DataEntity[] => {
    return layerEntities[layerId] || [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/30">
            <HardDrive className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Data Architecture Layers
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              4-tier data platform architecture - click each layer to explore
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-semibold text-white">Architecture Layers</span>
              </div>
              <p className="text-3xl font-bold text-white">4</p>
              <p className="text-xs text-gray-400 mt-1">Source → ODS → Lake → Analytics</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-semibold text-white">Data Entities</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {layerStats.reduce((sum, l) => sum + l.entityCount, 0)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Across all layers</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Workflow className="w-5 h-5 text-green-400" />
                <span className="text-sm font-semibold text-white">Workflows</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {layerStats.reduce((sum, l) => sum + l.workflowCount, 0)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Producing/consuming data</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-orange-400" />
                <span className="text-sm font-semibold text-white">AI Agents</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {layerStats.reduce((sum, l) => sum + l.agentCount, 0)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Consuming data</p>
            </div>
          </div>

          {/* Architecture Layers */}
          <div className="space-y-4">
            {layers.map((layer, index) => {
              const Icon = layer.icon;
              const stats = getLayerStats(layer.id);
              const entities = getLayerEntities(layer.id);
              const isExpanded = expandedLayer === layer.id;

              return (
                <div key={layer.id}>
                  {/* Layer Card */}
                  <div
                    className={`bg-gradient-to-r ${layer.bgColor} border ${layer.borderColor} rounded-2xl overflow-hidden transition-all cursor-pointer hover:scale-[1.01]`}
                    onClick={() => toggleLayer(layer.id)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-3 bg-gradient-to-br ${layer.color} rounded-xl`}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-2xl font-bold text-white">{layer.name}</h3>
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <p className="text-gray-300 text-sm mb-4">{layer.description_detail}</p>

                            {/* Stats Row */}
                            <div className="flex flex-wrap gap-4">
                              {layer.id === 2 && (
                                <div className="flex items-center gap-2">
                                  <Database className={`w-4 h-4 ${layer.textColor}`} />
                                  <span className="text-white font-semibold">{stats?.entityCount || 0}</span>
                                  <span className="text-gray-400 text-sm">data entities</span>
                                </div>
                              )}
                              {stats && stats.workflowCount > 0 && (
                                <div className="flex items-center gap-2">
                                  <Workflow className={`w-4 h-4 ${layer.textColor}`} />
                                  <span className="text-white font-semibold">{stats.workflowCount}</span>
                                  <span className="text-gray-400 text-sm">workflows</span>
                                </div>
                              )}
                              {stats && stats.agentCount > 0 && (
                                <div className="flex items-center gap-2">
                                  <Zap className={`w-4 h-4 ${layer.textColor}`} />
                                  <span className="text-white font-semibold">{stats.agentCount}</span>
                                  <span className="text-gray-400 text-sm">agents</span>
                                </div>
                              )}
                              {stats && stats.totalVolume > 0 && (
                                <div className="flex items-center gap-2">
                                  <BarChart className={`w-4 h-4 ${layer.textColor}`} />
                                  <span className="text-white font-semibold">{stats.totalVolume.toLocaleString()}</span>
                                  <span className="text-gray-400 text-sm">daily volume</span>
                                </div>
                              )}
                            </div>

                            {/* Technologies */}
                            <div className="mt-4 flex flex-wrap gap-2">
                              {layer.technologies.map((tech, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300 border border-white/20"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content - Data Entities */}
                      {isExpanded && entities.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-white/10">
                          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Database className="w-5 h-5 text-cyan-400" />
                            Data Entities in this Layer
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {entities.map((entity) => (
                              <div
                                key={entity.id}
                                className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-2xl">{entity.icon}</span>
                                  <div className="flex-1">
                                    <h5 className="text-sm font-semibold text-white">{entity.code}</h5>
                                    <p className="text-xs text-gray-400">{entity.name}</p>
                                  </div>
                                </div>
                                <div className="flex gap-3 mt-3 text-xs">
                                  <div>
                                    <span className="text-gray-400">Workflows: </span>
                                    <span className="text-white font-semibold">{entity.workflow_count}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Agents: </span>
                                    <span className="text-white font-semibold">{entity.agent_count}</span>
                                  </div>
                                </div>
                                {entity.volume_per_day > 0 && (
                                  <div className="mt-2 text-xs">
                                    <span className="text-gray-400">Volume: </span>
                                    <span className="text-cyan-400 font-semibold">
                                      {entity.volume_per_day.toLocaleString()}/day
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Hint for Layer 2 */}
                      {!isExpanded && layer.id === 2 && entities.length > 0 && (
                        <div className="mt-4 text-center text-sm text-gray-400">
                          Click to see {entities.length} data entities in this layer
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Data Flow Arrow (between layers) */}
                  {index < layers.length - 1 && (
                    <div className="flex justify-center py-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-1 h-12 bg-gradient-to-b ${layers[index + 1].color}`}></div>
                        <div className={`w-3 h-3 rotate-45 bg-gradient-to-br ${layers[index + 1].color}`}></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Architecture Insights */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                <BarChart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Real-time Processing</h3>
              <p className="text-gray-400 text-sm">
                Data flows from source systems through ODS with &lt; 1 second latency for operational workflows
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Historical Analytics</h3>
              <p className="text-gray-400 text-sm">
                Data Lake stores petabytes of historical data in Parquet format for ML training and analytics
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Decisions</h3>
              <p className="text-gray-400 text-sm">
                21 AI agents consume data from all layers to make intelligent operational decisions
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
