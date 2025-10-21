import React, { useState, useEffect, useCallback } from 'react';
import Tree from 'react-d3-tree';
import { Search, ZoomIn, ZoomOut, Maximize, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface TreeNode {
  name: string;
  id?: string;
  type?: string;
  workflow_count?: number;
  avg_complexity?: number;
  avg_potential?: number;
  complexity?: number;
  agentic_potential?: number;
  status?: string;
  implementation_wave?: number;
  children?: TreeNode[];
  attributes?: Record<string, any>;
}

export const OntologyTree: React.FC = () => {
  const navigate = useNavigate();
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.8);
  const [expandedAll, setExpandedAll] = useState(false);

  useEffect(() => {
    loadTreeData();
  }, []);

  useEffect(() => {
    const container = document.getElementById('tree-container');
    if (container) {
      setTranslate({
        x: container.offsetWidth / 6,
        y: container.offsetHeight / 2,
      });
    }
  }, []);

  const loadTreeData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_ontology_tree');

      if (error) throw error;

      if (data) {
        setTreeData(data as TreeNode);
      }
    } catch (error) {
      console.error('Error loading tree data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNodeColor = (node: any) => {
    if (node.type === 'domain') {
      return '#2563EB';
    } else if (node.type === 'subdomain') {
      return '#10B981';
    } else if (node.type === 'workflow') {
      if (node.status === 'deployed') return '#22C55E';
      if (node.status === 'in_progress') return '#F59E0B';
      if (node.status === 'approved') return '#3B82F6';
      return '#6B7280';
    }
    return '#8B5CF6';
  };

  const getNodeSize = (node: any) => {
    if (node.type === 'domain') return 20;
    if (node.type === 'subdomain') return 15;
    if (node.type === 'workflow') return 10;
    return 25;
  };

  const handleNodeClick = useCallback((nodeDatum: any) => {
    if (nodeDatum.type === 'workflow' && nodeDatum.id) {
      navigate(`/workflows/${nodeDatum.id}`);
    }
  }, [navigate]);

  const renderCustomNode = ({ nodeDatum, toggleNode }: any) => {
    const isCollapsed = nodeDatum.children && nodeDatum.children.length > 0;
    const size = getNodeSize(nodeDatum);
    const color = getNodeColor(nodeDatum);

    return (
      <g>
        <circle
          r={size}
          fill={color}
          stroke="#fff"
          strokeWidth={2}
          onClick={toggleNode}
          style={{ cursor: nodeDatum.type === 'workflow' ? 'pointer' : 'default' }}
        />
        {isCollapsed && (
          <text
            fill="#fff"
            strokeWidth="0"
            x={0}
            y={5}
            textAnchor="middle"
            style={{ fontSize: '12px', fontWeight: 'bold' }}
          >
            {nodeDatum.__rd3t?.collapsed ? '+' : '-'}
          </text>
        )}
        <text
          fill="currentColor"
          strokeWidth="0"
          x={size + 10}
          y={5}
          className="dark:fill-white fill-gray-900"
          style={{ fontSize: '14px', fontWeight: '500' }}
        >
          {nodeDatum.name}
        </text>
        {nodeDatum.workflow_count !== undefined && nodeDatum.workflow_count > 0 && (
          <text
            fill="currentColor"
            strokeWidth="0"
            x={size + 10}
            y={20}
            className="dark:fill-gray-400 fill-gray-600"
            style={{ fontSize: '11px' }}
          >
            {nodeDatum.workflow_count} workflows
          </text>
        )}
      </g>
    );
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.1));
  };

  const handleFitView = () => {
    setZoom(0.8);
    const container = document.getElementById('tree-container');
    if (container) {
      setTranslate({
        x: container.offsetWidth / 6,
        y: container.offsetHeight / 2,
      });
    }
  };

  const handleExport = () => {
    const svg = document.querySelector('#tree-container svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ontology-tree.svg';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading ontology tree...</p>
        </div>
      </div>
    );
  }

  if (!treeData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search domains, subdomains, or workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomIn}
            className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={handleFitView}
            className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Fit View"
          >
            <Maximize className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Export SVG"
          >
            <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="w-4 h-4 rounded-full bg-blue-600"></div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">Domains</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="w-4 h-4 rounded-full bg-green-600"></div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">Subdomains</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="w-4 h-4 rounded-full bg-gray-600"></div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">Draft Workflows</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">Deployed</span>
        </div>
      </div>

      <div
        id="tree-container"
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden"
        style={{ height: '700px' }}
      >
        <Tree
          data={treeData}
          orientation="horizontal"
          translate={translate}
          zoom={zoom}
          pathFunc="step"
          separation={{ siblings: 1.5, nonSiblings: 2 }}
          nodeSize={{ x: 200, y: 100 }}
          renderCustomNodeElement={renderCustomNode}
          onNodeClick={handleNodeClick}
          collapsible={true}
          initialDepth={1}
          enableLegacyTransitions
        />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">How to use:</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Click nodes to expand/collapse branches</li>
          <li>• Click workflow nodes (smallest circles) to view details</li>
          <li>• Use zoom controls to navigate large trees</li>
          <li>• Search to find specific items in the tree</li>
          <li>• Export as SVG for presentations or documentation</li>
        </ul>
      </div>
    </div>
  );
};
