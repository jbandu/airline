import React from 'react';
import { HardDrive, Layers, Construction, Server, Database, BarChart, Cloud } from 'lucide-react';

export const DataArchitectureLayers: React.FC = () => {
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
              4-tier data platform architecture
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon Card */}
      <div className="max-w-5xl mx-auto mt-12">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Construction className="w-12 h-12 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">Coming Soon</h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Interactive visualization of your 4-tier data platform architecture showing how data flows from source systems to AI/ML models.
          </p>

          {/* Architecture Preview */}
          <div className="space-y-4">
            {/* Layer 4 - Analytics */}
            <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-3">
                <BarChart className="w-8 h-8 text-purple-400" />
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white">4. Analytics & ML Layer</h3>
                  <p className="text-gray-400 text-sm">Redshift • Sagemaker • Athena • Quicksight</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm text-left">
                ← Your 21 AI Agents live here
              </p>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500"></div>
            </div>

            {/* Layer 3 - Data Lake */}
            <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-3">
                <Database className="w-8 h-8 text-blue-400" />
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white">3. Data Lake</h3>
                  <p className="text-gray-400 text-sm">S3 (Raw, Stage, Parquet) • Glue • EMR</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm text-left">
                ← Your 163 Workflows produce data here
              </p>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-orange-500"></div>
            </div>

            {/* Layer 2 - ODS */}
            <div className="bg-gradient-to-r from-orange-900/30 to-orange-800/30 border border-orange-500/30 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-3">
                <Cloud className="w-8 h-8 text-orange-400" />
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white">2. Operational Data Store</h3>
                  <p className="text-gray-400 text-sm">DynamoDB • Kinesis • Lambda • EventBridge</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm text-left">
                Real-time operational data
              </p>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-red-500"></div>
            </div>

            {/* Layer 1 - Source Systems */}
            <div className="bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-500/30 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-3">
                <Server className="w-8 h-8 text-red-400" />
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white">1. Source Systems</h3>
                  <p className="text-gray-400 text-sm">PSS • DCS • BRS • Revenue Management • Loyalty</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm text-left">
                ← Your 22 Domains map here
              </p>
            </div>
          </div>

          {/* Interactive Features Coming */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <Layers className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Click to Explore</h3>
              <p className="text-gray-400 text-sm">Click each layer to see data entities and workflows</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <Database className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Technology Stack</h3>
              <p className="text-gray-400 text-sm">View AWS services and tools in each layer</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <BarChart className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Data Volumes</h3>
              <p className="text-gray-400 text-sm">See data volumes and latency metrics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
