import React, { useState } from 'react';
import GraphEditorPanel from '../features/graph-input/GraphEditorPanel';
import GraphBoard from '../features/graph-animation/GraphBoard';
import BFSAnimator from '../features/graph-animation/BFSAnimator';
import DFSAnimator from '../features/graph-animation/DFSAnimator';
import DijkstraAnimator from '../features/graph-animation/DijkstraAnimator';
import AStarAnimator from '../features/graph-animation/AStarAnimator';
import BellmanFordAnimator from '../features/graph-animation/BellmanFordAnimator';
import FloydWarshallAnimator from '../features/graph-animation/FloydWarshallAnimator';
import { Graph } from '../utils/graphUtils';

export default function CustomVisualizer() {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [startNode, setStartNode] = useState<string>('n0');
  const [endNode, setEndNode] = useState<string>('n0');
  const [selectedAlgo, setSelectedAlgo] = useState<
    'bfs' | 'dfs' | 'dijkstra' | 'a-star' | 'bellman-ford' | 'floyd-warshall'
  >('bfs');
  const [runAlgo, setRunAlgo] = useState(false);

  const handleGraphUpdate = (newGraph: Graph) => {
    setGraph(newGraph);
    setStartNode(newGraph.nodes[0]?.id || 'n0');
    setEndNode(newGraph.nodes[newGraph.nodes.length - 1]?.id || 'n0');
    setRunAlgo(false);
  };

  return (
    <div className="flex p-4 gap-6">
      {/* Left Panel: Graph Input + Controls */}
      <div className="w-1/3">
        <h2 className="text-xl font-bold mb-4">Graph Input</h2>
        <GraphEditorPanel onGraphUpdate={handleGraphUpdate} />

        {graph && (
          <div className="mt-6 space-y-4">
            {/* Start Node Selector */}
            {selectedAlgo !== 'floyd-warshall' && (
              <div>
                <label className="block font-semibold mb-1">Start Node:</label>
                <select
                  value={startNode}
                  onChange={(e) => setStartNode(e.target.value)}
                  className="border p-1 w-full"
                >
                  {graph.nodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.label ?? node.id}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* End Node Selector for A* */}
            {selectedAlgo === 'a-star' && (
              <div>
                <label className="block font-semibold mb-1">End Node:</label>
                <select
                  value={endNode}
                  onChange={(e) => setEndNode(e.target.value)}
                  className="border p-1 w-full"
                >
                  {graph.nodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.label ?? node.id}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Algorithm Selector */}
            <div>
              <label className="block font-semibold mb-1">Algorithm:</label>
              <select
                value={selectedAlgo}
                onChange={(e) =>
                  setSelectedAlgo(
                    e.target.value as
                      | 'bfs'
                      | 'dfs'
                      | 'dijkstra'
                      | 'a-star'
                      | 'bellman-ford'
                      | 'floyd-warshall'
                  )
                }
                className="border p-1 w-full"
              >
                <option value="bfs">Breadth-First Search (BFS)</option>
                <option value="dfs">Depth-First Search (DFS)</option>
                <option value="dijkstra">Dijkstra's Algorithm</option>
                <option value="a-star">A* Search</option>
                <option value="bellman-ford">Bellman-Ford</option>
                <option value="floyd-warshall">Floyd-Warshall</option>
              </select>
            </div>

            <button
              onClick={() => setRunAlgo(true)}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Run {selectedAlgo.toUpperCase()}
            </button>
          </div>
        )}
      </div>

      {/* Right Panel: Graph Output */}
      <div className="flex-1">
        <h2 className="text-xl font-bold mb-4">Graph Visualization</h2>
        {graph ? (
          runAlgo ? (
            selectedAlgo === 'bfs' ? (
              <BFSAnimator graph={graph} startNodeId={startNode} />
            ) : selectedAlgo === 'dfs' ? (
              <DFSAnimator graph={graph} startNodeId={startNode} />
            ) : selectedAlgo === 'dijkstra' ? (
              <DijkstraAnimator graph={graph} startNodeId={startNode} />
            ) : selectedAlgo === 'a-star' ? (
              <AStarAnimator graph={graph} startNodeId={startNode} endNodeId={endNode} />
            ) : selectedAlgo === 'bellman-ford' ? (
              <BellmanFordAnimator graph={graph} startNodeId={startNode} />
            ) : (
              <FloydWarshallAnimator graph={graph} />
            )
          ) : (
            <GraphBoard graph={graph} />
          )
        ) : (
          <p className="text-gray-600 italic">Enter a graph to begin visualization.</p>
        )}
      </div>
    </div>
  );
}
