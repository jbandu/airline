import React from 'react';
import { Cable, GitBranch, Construction, Share2, Activity } from 'lucide-react';

export const DataLineage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/30">
            <Cable className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Data Lineage
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Trace data from source to consumption
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon Card */}
      <div className="max-w-4xl mx-auto mt-20">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Construction className="w-12 h-12 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">Coming Soon</h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Data Lineage visualization will show network graphs tracing how data flows from source systems through domains, workflows, and agents.
          </p>

          {/* Preview Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <Share2 className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Source Tracking</h3>
              <p className="text-gray-400 text-sm">See where each data point originates</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <GitBranch className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Transformation Path</h3>
              <p className="text-gray-400 text-sm">Follow transformations at each step</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Impact Analysis</h3>
              <p className="text-gray-400 text-sm">Understand downstream dependencies</p>
            </div>
          </div>

          {/* Example Lineage */}
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Example Lineage: PNR Data</h3>
            <div className="space-y-4">
              {/* Source */}
              <div className="flex items-center justify-center gap-4">
                <div className="flex-1 text-right">
                  <span className="px-4 py-2 bg-red-900/30 text-red-300 rounded-lg inline-block">Amadeus PSS</span>
                  <p className="text-xs text-gray-500 mt-1">Source System</p>
                </div>
              </div>

              {/* Arrow Down */}
              <div className="flex justify-center">
                <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-blue-500"></div>
              </div>

              {/* Data Entity */}
              <div className="flex items-center justify-center gap-4">
                <div className="flex-1 text-center">
                  <span className="px-4 py-2 bg-blue-900/30 text-blue-300 rounded-lg inline-block">📋 PNR Entity</span>
                  <p className="text-xs text-gray-500 mt-1">Data Lake</p>
                </div>
              </div>

              {/* Splits to multiple consumers */}
              <div className="flex justify-center">
                <div className="flex gap-8">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500"></div>
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-green-500"></div>
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-orange-500"></div>
                </div>
              </div>

              {/* Consumers */}
              <div className="flex items-start justify-center gap-4">
                <div className="flex-1">
                  <span className="px-3 py-2 bg-purple-900/30 text-purple-300 rounded-lg inline-block text-sm">Check-in Workflow</span>
                  <p className="text-xs text-gray-500 mt-1">Consumes</p>
                </div>
                <div className="flex-1">
                  <span className="px-3 py-2 bg-green-900/30 text-green-300 rounded-lg inline-block text-sm">Rebooking Agent</span>
                  <p className="text-xs text-gray-500 mt-1">Consumes</p>
                </div>
                <div className="flex-1">
                  <span className="px-3 py-2 bg-orange-900/30 text-orange-300 rounded-lg inline-block text-sm">Customer Service</span>
                  <p className="text-xs text-gray-500 mt-1">Consumes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
