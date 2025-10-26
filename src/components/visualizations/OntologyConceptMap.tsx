import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Database, Users, Workflow, Cpu, Scale, Building2, Download, Layout, Eye, EyeOff } from 'lucide-react';

interface EntityNode {
  id: string;
  label: string;
  count: number;
  attributes: string[];
  type: 'core' | 'entity' | 'technology' | 'compliance';
}

interface Relationship {
  source: string;
  target: string;
  label: string;
  cardinality: '1:1' | '1:N' | 'N:M' | 'N:1';
}

const ontologySchema = {
  entities: [
    {
      id: 'domain',
      label: 'Domain',
      count: 20,
      attributes: ['name', 'description', 'color'],
      type: 'core' as const,
    },
    {
      id: 'subdomain',
      label: 'Subdomain',
      count: 113,
      attributes: ['name', 'description', 'domain_id'],
      type: 'core' as const,
    },
    {
      id: 'workflow',
      label: 'Workflow',
      count: 74,
      attributes: ['name', 'description', 'status', 'complexity', 'agentic_potential'],
      type: 'core' as const,
    },
    {
      id: 'stakeholder',
      label: 'Stakeholder',
      count: 30,
      attributes: ['name', 'role_type', 'department', 'contact'],
      type: 'entity' as const,
    },
    {
      id: 'system',
      label: 'System',
      count: 30,
      attributes: ['name', 'system_category', 'vendor', 'criticality'],
      type: 'entity' as const,
    },
    {
      id: 'ai_enabler',
      label: 'AI Enabler',
      count: 17,
      attributes: ['name', 'category', 'maturity_level'],
      type: 'technology' as const,
    },
    {
      id: 'regulation',
      label: 'Regulation',
      count: 18,
      attributes: ['name', 'regulatory_body', 'compliance_level'],
      type: 'compliance' as const,
    },
  ],
  relationships: [
    { source: 'domain', target: 'subdomain', label: 'has', cardinality: '1:N' as const },
    { source: 'subdomain', target: 'workflow', label: 'contains', cardinality: '1:N' as const },
    { source: 'workflow', target: 'stakeholder', label: 'involves', cardinality: 'N:M' as const },
    { source: 'workflow', target: 'system', label: 'uses', cardinality: 'N:M' as const },
    { source: 'workflow', target: 'ai_enabler', label: 'implements', cardinality: 'N:M' as const },
    { source: 'workflow', target: 'regulation', label: 'complies_with', cardinality: 'N:M' as const },
    { source: 'workflow', target: 'workflow', label: 'depends_on', cardinality: 'N:M' as const },
  ],
};

const getEntityColor = (type: string) => {
  switch (type) {
    case 'core':
      return { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-blue-600' };
    case 'entity':
      return { bg: 'bg-green-500', border: 'border-green-600', text: 'text-green-600' };
    case 'technology':
      return { bg: 'bg-purple-500', border: 'border-purple-600', text: 'text-purple-600' };
    case 'compliance':
      return { bg: 'bg-red-500', border: 'border-red-600', text: 'text-red-600' };
    default:
      return { bg: 'bg-gray-500', border: 'border-gray-600', text: 'text-gray-600' };
  }
};

const getEntityIcon = (id: string) => {
  switch (id) {
    case 'domain':
    case 'subdomain':
      return Database;
    case 'workflow':
      return Workflow;
    case 'stakeholder':
      return Users;
    case 'system':
      return Building2;
    case 'ai_enabler':
      return Cpu;
    case 'regulation':
      return Scale;
    default:
      return Database;
  }
};

const CustomNode: React.FC<{ data: any }> = ({ data }) => {
  const colors = getEntityColor(data.entity.type);
  const Icon = getEntityIcon(data.entity.id);

  return (
    <div className={`bg-white dark:bg-gray-900 border-2 ${colors.border} rounded-lg p-4 min-w-[200px] shadow-lg`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${colors.text}`} />
          <div className="font-bold text-gray-900 dark:text-white">{data.entity.label}</div>
        </div>
        <div className={`${colors.bg} text-white text-xs font-bold px-2 py-1 rounded-full`}>
          {data.entity.count}
        </div>
      </div>

      {data.showAttributes && (
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mt-2">
          {data.entity.attributes.map((attr: string) => (
            <div key={attr} className="flex items-center gap-1">
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>{attr}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

type LayoutType = 'hierarchical' | 'circular' | 'force';

export const OntologyConceptMap: React.FC = () => {
  const [showAttributes, setShowAttributes] = useState(true);
  const [showCardinality, setShowCardinality] = useState(true);
  const [layout, setLayout] = useState<LayoutType>('hierarchical');
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  const getNodePosition = (entity: EntityNode, index: number, total: number, layoutType: LayoutType) => {
    if (layoutType === 'hierarchical') {
      if (entity.type === 'core') {
        const coreOrder = ['domain', 'subdomain', 'workflow'];
        const coreIndex = coreOrder.indexOf(entity.id);
        return { x: 400, y: coreIndex * 200 + 100 };
      } else if (entity.type === 'entity') {
        const entityIndex = ontologySchema.entities
          .filter((e) => e.type === 'entity')
          .findIndex((e) => e.id === entity.id);
        return { x: 100, y: 400 + entityIndex * 150 };
      } else if (entity.type === 'technology') {
        return { x: 700, y: 400 };
      } else {
        return { x: 700, y: 550 };
      }
    } else if (layoutType === 'circular') {
      const angle = (index / total) * 2 * Math.PI;
      const radius = 300;
      return {
        x: 400 + radius * Math.cos(angle),
        y: 400 + radius * Math.sin(angle),
      };
    } else {
      const cols = 3;
      const row = Math.floor(index / cols);
      const col = index % cols;
      return { x: col * 300 + 100, y: row * 250 + 100 };
    }
  };

  const createNodes = (): Node[] => {
    return ontologySchema.entities.map((entity, index) => {
      const position = getNodePosition(entity, index, ontologySchema.entities.length, layout);
      const colors = getEntityColor(entity.type);

      return {
        id: entity.id,
        type: 'custom',
        position,
        data: {
          entity,
          showAttributes,
        },
        style: {
          opacity: selectedEntity && selectedEntity !== entity.id ? 0.3 : 1,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });
  };

  const createEdges = (): Edge[] => {
    return ontologySchema.relationships.map((rel, index) => {
      const getMarkerEnd = () => {
        if (rel.cardinality === 'N:M') {
          return { type: MarkerType.ArrowClosed, color: '#64748b' };
        } else if (rel.cardinality === '1:N' || rel.cardinality === 'N:1') {
          return { type: MarkerType.ArrowClosed, color: '#64748b' };
        }
        return undefined;
      };

      const isSelfLoop = rel.source === rel.target;

      return {
        id: `${rel.source}-${rel.target}-${index}`,
        source: rel.source,
        target: rel.target,
        label: showCardinality ? `${rel.label}\n(${rel.cardinality})` : rel.label,
        type: isSelfLoop ? 'smoothstep' : 'default',
        animated: rel.cardinality === 'N:M',
        markerEnd: getMarkerEnd(),
        style: {
          stroke: '#64748b',
          strokeWidth: rel.cardinality === 'N:M' ? 2 : 1,
          opacity: selectedEntity && selectedEntity !== rel.source && selectedEntity !== rel.target ? 0.2 : 1,
        },
        labelStyle: {
          fontSize: 11,
          fill: '#64748b',
        },
      };
    });
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(createNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(createEdges());

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedEntity((prev) => (prev === node.id ? null : node.id));
  }, []);

  const handleLayoutChange = (newLayout: LayoutType) => {
    setLayout(newLayout);
    setNodes(createNodes());
  };

  React.useEffect(() => {
    setNodes(createNodes());
    setEdges(createEdges());
  }, [showAttributes, showCardinality, selectedEntity, layout]);

  const exportSchema = () => {
    const dataStr = JSON.stringify(ontologySchema, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'ontology-schema.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <select
              value={layout}
              onChange={(e) => handleLayoutChange(e.target.value as LayoutType)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
            >
              <option value="hierarchical">Hierarchical Layout</option>
              <option value="circular">Circular Layout</option>
              <option value="force">Grid Layout</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAttributes(!showAttributes)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                showAttributes
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {showAttributes ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="text-sm">Attributes</span>
            </button>

            <button
              onClick={() => setShowCardinality(!showCardinality)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                showCardinality
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {showCardinality ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="text-sm">Cardinality</span>
            </button>

            <button
              onClick={exportSchema}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-900 dark:text-white">Export Schema</span>
            </button>
          </div>
        </div>

        {selectedEntity && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-blue-900 dark:text-blue-300">
                  Selected: <strong>{ontologySchema.entities.find((e) => e.id === selectedEntity)?.label}</strong>
                </span>
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div style={{ height: '600px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.5}
            maxZoom={1.5}
          >
            <Background />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                const entity = ontologySchema.entities.find((e) => e.id === node.id);
                const colors = getEntityColor(entity?.type || 'core');
                return colors.bg.replace('bg-', '#');
              }}
              maskColor="rgba(0, 0, 0, 0.2)"
            />
          </ReactFlow>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Legend</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Entity Types</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Core Entities</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Entity References</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Technology</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Compliance</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cardinality</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">1:1</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">One-to-One</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">1:N</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">One-to-Many</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">N:M</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Many-to-Many (animated)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Total Entities</h4>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{ontologySchema.entities.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Relationships</h4>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {ontologySchema.relationships.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Total Records</h4>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {ontologySchema.entities.reduce((sum, e) => sum + e.count, 0)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Many-to-Many</h4>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
            {ontologySchema.relationships.filter((r) => r.cardinality === 'N:M').length}
          </p>
        </div>
      </div>
    </div>
  );
};
