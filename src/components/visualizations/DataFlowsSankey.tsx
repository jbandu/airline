import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal, SankeyNode, SankeyLink } from 'd3-sankey';

interface DataFlow {
  source: string;
  target: string;
  value: number;
  label?: string;
}

interface Props {
  flows: DataFlow[];
  height?: number;
}

interface SankeyNodeData extends SankeyNode<{}, {}> {
  name: string;
  layer?: number;
  color?: string;
}

interface SankeyLinkData extends SankeyLink<SankeyNodeData, {}> {
  label?: string;
}

export const DataFlowsSankey: React.FC<Props> = ({ flows, height = 600 }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || flows.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const margin = { top: 20, right: 200, bottom: 20, left: 200 };

    // Layer colors (Source Systems, ODS, Data Lake, Analytics)
    const layerColors: Record<string, string> = {
      // Source Systems
      'Amadeus PSS': '#ef4444',
      'BRS': '#ef4444',
      'DCS': '#ef4444',
      'Revenue System': '#ef4444',

      // Data Entities (ODS/Lake)
      'PNR': '#3b82f6',
      'FLIFO': '#3b82f6',
      'BAGGAGE': '#3b82f6',
      'INVENTORY': '#3b82f6',
      'E-TKT': '#3b82f6',
      'LOYALTY': '#3b82f6',
      'SSM': '#3b82f6',

      // Processing/Analytics
      'Data Lake': '#8b5cf6',
      'Analytics': '#8b5cf6',

      // Workflows/Agents
      'Rebooking Workflow': '#10b981',
      'Delay Detection Agent': '#10b981',
      'Bag Tracking Agent': '#10b981',
      'Customer Context Agent': '#10b981',
      'Pricing Agent': '#10b981'
    };

    // Get unique nodes
    const nodeSet = new Set<string>();
    flows.forEach(flow => {
      nodeSet.add(flow.source);
      nodeSet.add(flow.target);
    });

    const nodes: SankeyNodeData[] = Array.from(nodeSet).map((name) => ({
      name,
      color: layerColors[name] || '#6b7280'
    }));

    const nodeMap = new Map(nodes.map((n, i) => [n.name, i]));

    const links: SankeyLinkData[] = flows.map(flow => ({
      source: nodeMap.get(flow.source)!,
      target: nodeMap.get(flow.target)!,
      value: flow.value,
      label: flow.label
    }));

    // Create sankey generator
    const sankeyGenerator = sankey<SankeyNodeData, SankeyLinkData>()
      .nodeWidth(30)
      .nodePadding(15)
      .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]]);

    const graph = sankeyGenerator({
      nodes: nodes.map(d => ({ ...d })),
      links: links.map(d => ({ ...d }))
    });

    const g = svg.append('g');

    // Create gradient definitions
    const defs = svg.append('defs');

    graph.links.forEach((link, i) => {
      const gradient = defs.append('linearGradient')
        .attr('id', `data-flow-gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', (link.source as SankeyNodeData).x1 || 0)
        .attr('x2', (link.target as SankeyNodeData).x0 || 0);

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', (link.source as SankeyNodeData).color || '#999')
        .attr('stop-opacity', 0.4);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', (link.target as SankeyNodeData).color || '#999')
        .attr('stop-opacity', 0.4);
    });

    // Draw links
    g.append('g')
      .selectAll('path')
      .data(graph.links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', (d, i) => `url(#data-flow-gradient-${i})`)
      .attr('stroke-width', d => Math.max(1, d.width || 0))
      .attr('fill', 'none')
      .attr('opacity', 0.6)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke-width', (d.width || 0) + 2);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 0.6)
          .attr('stroke-width', d => Math.max(1, d.width || 0));
      })
      .append('title')
      .text(d => {
        const source = (d.source as SankeyNodeData).name;
        const target = (d.target as SankeyNodeData).name;
        const label = (d as SankeyLinkData).label || '';
        return `${source} → ${target}\n${label}`;
      });

    // Draw nodes
    g.append('g')
      .selectAll('rect')
      .data(graph.nodes)
      .join('rect')
      .attr('x', d => d.x0 || 0)
      .attr('y', d => d.y0 || 0)
      .attr('height', d => (d.y1 || 0) - (d.y0 || 0))
      .attr('width', d => (d.x1 || 0) - (d.x0 || 0))
      .attr('fill', d => d.color || '#999')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', 0.8);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 1);
      })
      .append('title')
      .text(d => d.name);

    // Draw node labels
    g.append('g')
      .selectAll('text')
      .data(graph.nodes)
      .join('text')
      .attr('x', d => {
        const x0 = d.x0 || 0;
        const x1 = d.x1 || 0;
        return x0 < width / 2 ? x1 + 6 : x0 - 6;
      })
      .attr('y', d => ((d.y1 || 0) + (d.y0 || 0)) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => (d.x0 || 0) < width / 2 ? 'start' : 'end')
      .text(d => d.name)
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('fill', '#e5e7eb')
      .style('pointer-events', 'none');

  }, [flows, height]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height={height}
      style={{ overflow: 'visible' }}
    />
  );
};
