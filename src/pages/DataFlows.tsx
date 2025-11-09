import React from 'react';
import { Workflow, ArrowRight, Construction } from 'lucide-react';

export const DataFlows: React.FC = () => {
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

      {/* Coming Soon Card */}
      <div className="max-w-4xl mx-auto mt-20">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Construction className="w-12 h-12 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">Coming Soon</h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Data Flows visualization will show Sankey diagrams of how data moves from source systems through the data lake to analytics and AI agents.
          </p>

          {/* Preview Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <ArrowRight className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Flow Visualization</h3>
              <p className="text-gray-400 text-sm">Sankey diagrams showing data movement</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <Workflow className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Transformation Tracking</h3>
              <p className="text-gray-400 text-sm">See how data transforms at each stage</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <Construction className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold mb-1">Performance Metrics</h3>
              <p className="text-gray-400 text-sm">Monitor flow latency and throughput</p>
            </div>
          </div>

          {/* Example Flow */}
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Example Flow: Baggage Misconnect Recovery</h3>
            <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
              <span className="px-3 py-2 bg-red-900/30 text-red-300 rounded-lg">BRS System</span>
              <ArrowRight className="w-4 h-4 text-gray-500" />
              <span className="px-3 py-2 bg-orange-900/30 text-orange-300 rounded-lg">Kinesis Stream</span>
              <ArrowRight className="w-4 h-4 text-gray-500" />
              <span className="px-3 py-2 bg-blue-900/30 text-blue-300 rounded-lg">DynamoDB</span>
              <ArrowRight className="w-4 h-4 text-gray-500" />
              <span className="px-3 py-2 bg-purple-900/30 text-purple-300 rounded-lg">Bag Tracking Agent</span>
              <ArrowRight className="w-4 h-4 text-gray-500" />
              <span className="px-3 py-2 bg-green-900/30 text-green-300 rounded-lg">Recovery Action</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
