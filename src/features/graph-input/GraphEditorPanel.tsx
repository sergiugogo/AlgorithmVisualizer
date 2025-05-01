import React, { useState } from 'react';
import {
  Graph,
  generateGraphFromAdjacencyMatrix,
} from '../../utils/graphUtils';

interface GraphEditorPanelProps {
  onGraphUpdate: (graph: Graph) => void;
}

export default function GraphEditorPanel({ onGraphUpdate }: GraphEditorPanelProps) {
  const [edgeList, setEdgeList] = useState('0 1 4\n1 2 3\n2 3 2\n0 3 1');
  const [heuristicsInput, setHeuristicsInput] = useState('0 10\n1 6\n2 3\n3 0');
  const [nodeCount, setNodeCount] = useState(4);
  const [isDirected, setIsDirected] = useState(false);
  const [isWeighted, setIsWeighted] = useState(true);
  const [zeroIndexed, setZeroIndexed] = useState(true);

  const parseEdges = () => {
    const matrix = Array(nodeCount).fill(0).map(() => Array(nodeCount).fill(0));
    const lines = edgeList.trim().split('\n');

    lines.forEach((line) => {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 2) return;

      let a = parseInt(parts[0]);
      let b = parseInt(parts[1]);
      let weight = isWeighted ? parseInt(parts[2]) || 1 : 1;

      if (!zeroIndexed) {
        a -= 1;
        b -= 1;
      }

      if (!isNaN(a) && !isNaN(b) && a >= 0 && b >= 0 && a < nodeCount && b < nodeCount) {
        matrix[a][b] = weight;
        if (!isDirected) matrix[b][a] = weight;
      }
    });

    const graph = generateGraphFromAdjacencyMatrix(matrix, isDirected);

    // Parse heuristics
    const heuristicsMap: Record<string, number> = {};
    heuristicsInput.trim().split('\n').forEach(line => {
      const [id, value] = line.trim().split(/\s+/);
      if (id && value && !isNaN(Number(value))) {
        heuristicsMap[`n${id}`] = Number(value);
      }
    });

    // Assign heuristics to nodes
    graph.nodes = graph.nodes.map(node => ({
      ...node,
      heuristic: heuristicsMap[node.id] ?? undefined
    }));

    onGraphUpdate(graph);
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="font-semibold">Node Count:</label>
      <input
        type="number"
        value={nodeCount}
        onChange={(e) => setNodeCount(parseInt(e.target.value))}
        className="border px-2 py-1"
      />

      <label className="font-semibold">Edge List ({isWeighted ? `"from to weight"` : `"from to"`}):</label>
      <textarea
        rows={8}
        value={edgeList}
        onChange={(e) => setEdgeList(e.target.value)}
        className="w-full border p-2 font-mono"
      />

      <label className="font-semibold">Heuristics (node cost-to-goal):</label>
      <textarea
        rows={4}
        value={heuristicsInput}
        onChange={(e) => setHeuristicsInput(e.target.value)}
        className="w-full border p-2 font-mono"
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setIsDirected((d) => !d)}
          className={`px-3 py-1 rounded ${isDirected ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          {isDirected ? 'Directed' : 'Undirected'}
        </button>

        <button
          onClick={() => setIsWeighted((w) => !w)}
          className={`px-3 py-1 rounded ${isWeighted ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          {isWeighted ? 'Weighted' : 'Unweighted'}
        </button>

        <button
          onClick={() => setZeroIndexed((z) => !z)}
          className={`px-3 py-1 rounded ${zeroIndexed ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          {zeroIndexed ? '0-indexed' : '1-indexed'}
        </button>
      </div>

      <button
        onClick={parseEdges}
        className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Update Graph
      </button>
    </div>
  );
}
