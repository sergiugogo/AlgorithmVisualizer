
import React from 'react';
import Node from './Node';
import Edge from './Edge';
import { Graph } from '../../utils/graphUtils';

interface GraphBoardProps {
  graph: Graph;
  activeEdge?: string | null;
}

export default function GraphBoard({ graph, activeEdge }: GraphBoardProps) {
  const getNodeById = (id: string) => graph.nodes.find((n) => n.id === id)!;

  return (
    <div className="relative w-full h-[600px] bg-slate-100 border rounded-md overflow-hidden">
      {/* Edges */}
      {graph.edges.map((edge) => (
        <Edge
          key={edge.id}
          from={getNodeById(edge.source)}
          to={getNodeById(edge.target)}
          active={edge.id === activeEdge}
        />
      ))}

      {/* Nodes */}
      {graph.nodes.map((node) => (
        <Node key={node.id} {...node} />
      ))}
    </div>
  );
}
