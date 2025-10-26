import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface Agent {
  id: number;
  name: string;
  icon: string;
  color: string;
  category_name: string;
  autonomy_level: number;
  workflow_count: number;
}

interface Collaboration {
  source_id: number;
  target_id: number;
  collaboration_type: string;
  strength: number;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  icon: string;
  color: string;
  category: string;
  size: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  strength: number;
  type: string;
}

interface Props {
  agents: Agent[];
  collaborations: Collaboration[];
  onAgentSelect: (agent: Agent | null) => void;
}

export const AgentCollaborationGraph: React.FC<Props> = ({
  agents,
  collaborations,
  onAgentSelect,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);

  useEffect(() => {
    if (!svgRef.current || agents.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const nodes: GraphNode[] = agents.map((agent) => ({
      id: `agent_${agent.id}`,
      label: agent.name,
      icon: agent.icon,
      color: agent.color,
      category: agent.category_name,
      size: 20 + agent.workflow_count * 2,
    }));

    const links: GraphLink[] = collaborations.map((collab) => ({
      source: `agent_${collab.source_id}`,
      target: `agent_${collab.target_id}`,
      strength: collab.strength,
      type: collab.collaboration_type,
    }));

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(150)
      )
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.size + 10));

    simulationRef.current = simulation;

    const link = g
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d) => d.strength * 3);

    const node = g
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended) as any
      );

    node
      .append('circle')
      .attr('r', (d) => d.size)
      .attr('fill', (d) => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .style('cursor', 'pointer');

    node
      .append('text')
      .text((d) => d.icon)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', (d) => d.size * 0.8)
      .attr('pointer-events', 'none');

    const label = g
      .append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text((d) => d.label)
      .attr('font-size', 12)
      .attr('font-weight', 600)
      .attr('dx', 0)
      .attr('dy', (d) => d.size + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', 'currentColor')
      .attr('class', 'pointer-events-none select-none dark:fill-white fill-gray-900');

    node.on('click', (event, d) => {
      event.stopPropagation();
      const agent = agents.find((a) => `agent_${a.id}` === d.id);
      if (agent) {
        onAgentSelect(agent);
      }
    });

    node.on('mouseover', function () {
      d3.select(this).select('circle').attr('stroke-width', 5);
    });

    node.on('mouseout', function () {
      d3.select(this).select('circle').attr('stroke-width', 3);
    });

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
      label.attr('x', (d) => d.x!).attr('y', (d) => d.y!);
    });

    function dragstarted(event: any, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: GraphNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [agents, collaborations, onAgentSelect]);

  const handleZoomIn = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 0.7);
    }
  };

  const handleReset = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(d3.zoom<SVGSVGElement, unknown>().transform as any, d3.zoomIdentity);
    }
  };

  return (
    <div className="relative h-[600px]">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
          title="Reset View"
        >
          <Maximize2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {agents.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-600 dark:text-gray-400">No agents available</p>
        </div>
      ) : (
        <svg ref={svgRef} className="w-full h-full" style={{ cursor: 'grab' }} />
      )}

      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur rounded-lg p-3 text-xs text-gray-600 dark:text-gray-400">
        <p>💡 Drag nodes to reposition</p>
        <p>🖱️ Click nodes for details</p>
        <p>🔍 Use mouse wheel to zoom</p>
      </div>
    </div>
  );
};
