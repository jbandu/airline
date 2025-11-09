import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export interface LineageNode {
  id: string;
  name: string;
  type: 'source' | 'entity' | 'workflow' | 'agent';
  icon?: string;
  metadata?: Record<string, any>;
}

export interface LineageLink {
  source: string;
  target: string;
  type?: string;
}

interface Props {
  nodes: LineageNode[];
  links: LineageLink[];
  height?: number;
}

export const DataLineageGraph: React.FC<Props> = ({ nodes, links, height = 600 }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    // Node colors by type
    const nodeColors: Record<string, string> = {
      source: '#ef4444',    // red
      entity: '#3b82f6',    // blue
      workflow: '#8b5cf6',  // purple
      agent: '#10b981',     // green
    };

    // Create force simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links)
        .id((d: any) => d.id)
        .distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));

    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // Create arrow marker for directed edges
    svg.append('defs').selectAll('marker')
      .data(['end'])
      .join('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 30)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#6b7280');

    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#6b7280')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrow)');

    // Draw node groups
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    // Add circles for nodes
    node.append('circle')
      .attr('r', 25)
      .attr('fill', d => nodeColors[d.type] || '#6b7280')
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 30)
          .attr('stroke-width', 4);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 25)
          .attr('stroke-width', 3);
      });

    // Add icons or text to nodes
    node.append('text')
      .text(d => d.icon || d.type.charAt(0).toUpperCase())
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-size', '16px')
      .attr('fill', '#fff')
      .attr('pointer-events', 'none');

    // Add labels below nodes
    node.append('text')
      .text(d => d.name.length > 20 ? d.name.substring(0, 20) + '...' : d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '45px')
      .attr('font-size', '12px')
      .attr('fill', '#e5e7eb')
      .attr('font-weight', '500')
      .attr('pointer-events', 'none');

    // Add type label
    node.append('text')
      .text(d => d.type.toUpperCase())
      .attr('text-anchor', 'middle')
      .attr('dy', '58px')
      .attr('font-size', '9px')
      .attr('fill', '#9ca3af')
      .attr('pointer-events', 'none');

    // Add tooltips
    node.append('title')
      .text(d => {
        let text = `${d.name}\nType: ${d.type}`;
        if (d.metadata) {
          Object.entries(d.metadata).forEach(([key, value]) => {
            text += `\n${key}: ${value}`;
          });
        }
        return text;
      });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, links, height]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height={height}
      style={{ background: 'transparent' }}
    />
  );
};
