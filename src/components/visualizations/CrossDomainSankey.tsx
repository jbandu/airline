import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal, SankeyNode, SankeyLink } from 'd3-sankey';

interface DomainFlow {
  source: string;
  target: string;
  value: number;
  workflows: string[];
}

interface Props {
  flows: DomainFlow[];
}

interface SankeyNodeData extends SankeyNode<{}, {}> {
  name: string;
  color?: string;
}

interface SankeyLinkData extends SankeyLink<SankeyNodeData, {}> {
  workflows: string[];
}

export const CrossDomainSankey: React.FC<Props> = ({ flows }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || flows.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = 600;
    const margin = { top: 20, right: 180, bottom: 20, left: 180 };

    // Create color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Get unique nodes
    const nodeSet = new Set<string>();
    flows.forEach(flow => {
      nodeSet.add(flow.source);
      nodeSet.add(flow.target);
    });

    const nodes: SankeyNodeData[] = Array.from(nodeSet).map((name, i) => ({
      name,
      color: colorScale(i.toString())
    }));

    const nodeMap = new Map(nodes.map((n, i) => [n.name, i]));

    const links: SankeyLinkData[] = flows.map(flow => ({
      source: nodeMap.get(flow.source)!,
      target: nodeMap.get(flow.target)!,
      value: flow.value,
      workflows: flow.workflows
    }));

    // Create sankey generator
    const sankeyGenerator = sankey<SankeyNodeData, SankeyLinkData>()
      .nodeWidth(20)
      .nodePadding(20)
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
        .attr('id', `gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', (link.source as SankeyNodeData).x1 || 0)
        .attr('x2', (link.target as SankeyNodeData).x0 || 0);

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', (link.source as SankeyNodeData).color || '#999')
        .attr('stop-opacity', 0.5);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', (link.target as SankeyNodeData).color || '#999')
        .attr('stop-opacity', 0.5);
    });

    // Draw links
    const link = g.append('g')
      .selectAll('path')
      .data(graph.links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', (d, i) => `url(#gradient-${i})`)
      .attr('stroke-width', (d) => Math.max(1, d.width || 0))
      .attr('fill', 'none')
      .attr('opacity', 0.5)
      .style('cursor', 'pointer');

    // Add link hover effects
    link.append('title')
      .text((d) => {
        const source = (d.source as SankeyNodeData).name;
        const target = (d.target as SankeyNodeData).name;
        const workflows = d.workflows.join(', ');
        return `${source} → ${target}\n${d.value} connections\nWorkflows: ${workflows}`;
      });

    link.on('mouseover', function() {
      d3.select(this)
        .attr('opacity', 0.8)
        .attr('stroke-width', (d: any) => Math.max(1, (d.width || 0) * 1.2));
    });

    link.on('mouseout', function() {
      d3.select(this)
        .attr('opacity', 0.5)
        .attr('stroke-width', (d: any) => Math.max(1, d.width || 0));
    });

    // Draw nodes
    const node = g.append('g')
      .selectAll('rect')
      .data(graph.nodes)
      .join('rect')
      .attr('x', (d) => d.x0 || 0)
      .attr('y', (d) => d.y0 || 0)
      .attr('height', (d) => (d.y1 || 0) - (d.y0 || 0))
      .attr('width', (d) => (d.x1 || 0) - (d.x0 || 0))
      .attr('fill', (d) => d.color || '#999')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // Add node hover effects
    node.append('title')
      .text((d) => `${d.name}\n${d.value} connections`);

    node.on('mouseover', function(event, d) {
      d3.select(this)
        .attr('opacity', 0.8);

      // Highlight connected links
      link.attr('opacity', (l: any) => {
        return (l.source === d || l.target === d) ? 0.8 : 0.2;
      });
    });

    node.on('mouseout', function() {
      d3.select(this)
        .attr('opacity', 1);

      link.attr('opacity', 0.5);
    });

    // Add labels
    const label = g.append('g')
      .selectAll('text')
      .data(graph.nodes)
      .join('text')
      .attr('x', (d) => {
        const x0 = d.x0 || 0;
        const x1 = d.x1 || 0;
        return x0 < width / 2 ? x0 - 6 : x1 + 6;
      })
      .attr('y', (d) => ((d.y1 || 0) + (d.y0 || 0)) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d) => {
        const x0 = d.x0 || 0;
        return x0 < width / 2 ? 'end' : 'start';
      })
      .text((d) => d.name)
      .attr('font-size', 12)
      .attr('font-weight', 600)
      .attr('fill', 'currentColor')
      .attr('class', 'dark:fill-white fill-gray-900');

    // Add value labels
    g.append('g')
      .selectAll('text')
      .data(graph.nodes)
      .join('text')
      .attr('x', (d) => {
        const x0 = d.x0 || 0;
        const x1 = d.x1 || 0;
        return x0 < width / 2 ? x0 - 6 : x1 + 6;
      })
      .attr('y', (d) => ((d.y1 || 0) + (d.y0 || 0)) / 2 + 16)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d) => {
        const x0 = d.x0 || 0;
        return x0 < width / 2 ? 'end' : 'start';
      })
      .text((d) => `${d.value} flows`)
      .attr('font-size', 10)
      .attr('fill', 'currentColor')
      .attr('class', 'dark:fill-gray-400 fill-gray-600');

  }, [flows]);

  if (flows.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <p className="text-gray-600 dark:text-gray-400">No cross-domain flows to display</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        className="w-full"
        style={{ height: '600px' }}
      />
      <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur rounded-lg p-3 text-xs text-gray-600 dark:text-gray-400">
        <p>💡 Hover over nodes and links to see details</p>
        <p>🔗 Link width represents connection strength</p>
      </div>
    </div>
  );
};
