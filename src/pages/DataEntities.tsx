import React, { useEffect, useState } from 'react';
import { Database, Search, TrendingUp, Shield, HardDrive, Activity, ArrowRight, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { DataEntityWithUsage } from '../types/data-entities.types';

export const DataEntities: React.FC = () => {
  const navigate = useNavigate();
  const [entities, setEntities] = useState<DataEntityWithUsage[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<DataEntityWithUsage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sensitivityFilter, setSensitivityFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    try {
      setLoading(true);

      // Fetch data entities with usage counts
      const { data: entitiesData, error } = await supabase
        .from('v_data_entities_with_usage')
        .select('*')
        .order('name');

      if (error) throw error;

      setEntities(entitiesData || []);
    } catch (error) {
      console.error('Error loading data entities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntities = entities.filter((entity) => {
    const matchesSearch =
      entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSensitivity =
      sensitivityFilter === 'all' || entity.sensitivity === sensitivityFilter;

    return matchesSearch && matchesSensitivity;
  });

  const stats = {
    totalEntities: entities.length,
    totalVolumePerDay: entities.reduce((sum, e) => sum + (e.volume_per_day || 0), 0),
    avgQualityScore: entities.length > 0
      ? Math.round((entities.reduce((sum, e) => sum + (e.data_quality_score || 0), 0) / entities.length))
      : 0,
    piiEntities: entities.filter(e => e.sensitivity === 'PII').length,
  };

  const getSensitivityColor = (sensitivity: string) => {
    switch (sensitivity) {
      case 'PII': return 'from-red-500 to-rose-600';
      case 'Confidential': return 'from-amber-500 to-orange-600';
      case 'Internal': return 'from-blue-500 to-cyan-600';
      case 'Public': return 'from-green-500 to-emerald-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getSensitivityBadgeColor = (sensitivity: string) => {
    switch (sensitivity) {
      case 'PII': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'Confidential': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'Internal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Public': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/30">
            <Database className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Data Entities
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Core airline operational data powering your workflows and agents
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Entities</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalEntities}</p>
              </div>
              <Database className="w-8 h-8 text-cyan-400 opacity-50" />
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Daily Volume</p>
                <p className="text-2xl font-bold text-white mt-1">{formatVolume(stats.totalVolumePerDay)}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Quality Score</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.avgQualityScore}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">PII Entities</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.piiEntities}</p>
              </div>
              <Shield className="w-8 h-8 text-red-400 opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search data entities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        {/* Sensitivity Filter */}
        <select
          value={sensitivityFilter}
          onChange={(e) => setSensitivityFilter(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="all">All Sensitivity Levels</option>
          <option value="PII">PII</option>
          <option value="Confidential">Confidential</option>
          <option value="Internal">Internal</option>
          <option value="Public">Public</option>
        </select>
      </div>

      {/* Data Entity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEntities.map((entity, index) => (
          <div
            key={entity.id}
            className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedEntity(entity)}
          >
            {/* Icon and Title */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getSensitivityColor(entity.sensitivity)} flex items-center justify-center text-3xl shadow-lg`}>
                  {entity.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {entity.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">{entity.code}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getSensitivityBadgeColor(entity.sensitivity)}`}>
                {entity.sensitivity}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-300 mb-4 line-clamp-2">
              {entity.description}
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-black/20 rounded-lg p-2">
                <p className="text-xs text-gray-400">Daily Volume</p>
                <p className="text-sm font-bold text-white">{formatVolume(entity.volume_per_day)}</p>
              </div>
              <div className="bg-black/20 rounded-lg p-2">
                <p className="text-xs text-gray-400">Quality</p>
                <p className="text-sm font-bold text-white">{entity.data_quality_score}%</p>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1">
                <Server className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">{entity.workflow_count || 0} workflows</span>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">{entity.agent_count || 0} agents</span>
              </div>
            </div>

            {/* Source Systems */}
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-1">Source Systems:</p>
              <div className="flex flex-wrap gap-1">
                {entity.source_systems?.slice(0, 2).map((system, idx) => (
                  <span key={idx} className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded">
                    {system}
                  </span>
                ))}
                {entity.source_systems?.length > 2 && (
                  <span className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded">
                    +{entity.source_systems.length - 2}
                  </span>
                )}
              </div>
            </div>

            {/* Retention */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Retention: {entity.retention_years} years</span>
              <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {filteredEntities.length === 0 && (
        <div className="text-center py-12">
          <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No data entities found</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedEntity && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEntity(null)}
        >
          <div
            className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getSensitivityColor(selectedEntity.sensitivity)} flex items-center justify-center text-4xl shadow-lg`}>
                  {selectedEntity.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedEntity.name}</h2>
                  <p className="text-gray-400 font-mono">{selectedEntity.code}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowRight className="w-6 h-6 text-gray-400 rotate-45" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Description</h3>
                <p className="text-white">{selectedEntity.description}</p>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-400">Daily Volume</p>
                  <p className="text-xl font-bold text-white mt-1">{formatVolume(selectedEntity.volume_per_day)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-400">Quality Score</p>
                  <p className="text-xl font-bold text-white mt-1">{selectedEntity.data_quality_score}%</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-400">Retention</p>
                  <p className="text-xl font-bold text-white mt-1">{selectedEntity.retention_years} yrs</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-400">Sensitivity</p>
                  <p className="text-xl font-bold text-white mt-1">{selectedEntity.sensitivity}</p>
                </div>
              </div>

              {/* Source Systems */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Source Systems</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedEntity.source_systems?.map((system, idx) => (
                    <span key={idx} className="bg-blue-900/30 text-blue-300 px-3 py-1 rounded-lg text-sm">
                      {system}
                    </span>
                  ))}
                </div>
              </div>

              {/* Storage Location */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Storage Architecture</h3>
                <div className="bg-white/5 rounded-xl p-4">
                  <HardDrive className="w-5 h-5 text-cyan-400 mb-2" />
                  <p className="text-white text-sm">{selectedEntity.storage_location}</p>
                </div>
              </div>

              {/* Usage Stats */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Usage</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Server className="w-5 h-5 text-purple-400" />
                      <span className="text-purple-300 font-semibold">{selectedEntity.workflow_count || 0}</span>
                    </div>
                    <p className="text-sm text-gray-400">Workflows consuming</p>
                  </div>
                  <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-5 h-5 text-green-400" />
                      <span className="text-green-300 font-semibold">{selectedEntity.agent_count || 0}</span>
                    </div>
                    <p className="text-sm text-gray-400">AI Agents using</p>
                  </div>
                </div>
              </div>

              {/* Schema Fields */}
              {selectedEntity.schema_definition?.fields && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Schema Fields</h3>
                  <div className="bg-white/5 rounded-xl p-4 space-y-2 max-h-64 overflow-y-auto">
                    {selectedEntity.schema_definition.fields.map((field, idx) => (
                      <div key={idx} className="flex items-start gap-3 pb-2 border-b border-white/5 last:border-0">
                        <span className="text-cyan-400 font-mono text-sm">{field.name}</span>
                        <span className="text-gray-500 text-xs">:</span>
                        <span className="text-purple-400 text-sm">{field.type}</span>
                        {field.required && (
                          <span className="text-red-400 text-xs">*</span>
                        )}
                        {field.description && (
                          <span className="text-gray-400 text-xs flex-1">{field.description}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
