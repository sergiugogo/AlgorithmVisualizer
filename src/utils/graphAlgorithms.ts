
import { Graph, getAdjacentNodes } from './graphUtils';

export interface Step {
  nodeId?: string;
  edgeId?: string;
  type: 'visit-node' | 'explore-edge' | 'complete-node';
  description: string;
}

// Breadth-First Search
export const bfs = (graph: Graph, startNodeId: string, endNodeId?: string): Step[] => {
  const steps: Step[] = [];
  const visited = new Set<string>();
  const queue: string[] = [startNodeId];
  
  visited.add(startNodeId);
  steps.push({ 
    nodeId: startNodeId,
    type: 'visit-node',
    description: `Start BFS from node ${startNodeId}`
  });
  
  while (queue.length > 0) {
    const currentNodeId = queue.shift()!;
    
    if (currentNodeId === endNodeId) {
      steps.push({ 
        nodeId: currentNodeId,
        type: 'complete-node',
        description: `Target node ${currentNodeId} found! BFS complete.`
      });
      break;
    }
    
    const neighbors = getAdjacentNodes(graph, currentNodeId);
    
    for (const neighborId of neighbors) {
      const edgeId = `e${Math.min(parseInt(currentNodeId.substring(1)), parseInt(neighborId.substring(1)))}-${Math.max(parseInt(currentNodeId.substring(1)), parseInt(neighborId.substring(1)))}`;
      
      steps.push({ 
        edgeId,
        type: 'explore-edge',
        description: `Exploring edge from ${currentNodeId} to ${neighborId}`
      });
      
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push(neighborId);
        steps.push({ 
          nodeId: neighborId,
          type: 'visit-node',
          description: `Visit node ${neighborId} from ${currentNodeId}`
        });
      }
    }
    
    steps.push({ 
      nodeId: currentNodeId,
      type: 'complete-node',
      description: `Completed processing node ${currentNodeId}`
    });
  }
  
  return steps;
};

// Depth-First Search
export const dfs = (graph: Graph, startNodeId: string, endNodeId?: string): Step[] => {
  const steps: Step[] = [];
  const visited = new Set<string>();
  
  const dfsRecursive = (nodeId: string): boolean => {
    visited.add(nodeId);
    steps.push({ 
      nodeId,
      type: 'visit-node',
      description: `Visit node ${nodeId} (DFS)`
    });
    
    if (nodeId === endNodeId) {
      steps.push({ 
        nodeId,
        type: 'complete-node',
        description: `Target node ${nodeId} found! DFS complete.`
      });
      return true; // Found the target
    }
    
    const neighbors = getAdjacentNodes(graph, nodeId);
    
    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        const edgeId = `e${Math.min(parseInt(nodeId.substring(1)), parseInt(neighborId.substring(1)))}-${Math.max(parseInt(nodeId.substring(1)), parseInt(neighborId.substring(1)))}`;
        
        steps.push({ 
          edgeId,
          type: 'explore-edge',
          description: `Exploring edge from ${nodeId} to ${neighborId}`
        });
        
        const found = dfsRecursive(neighborId);
        if (found && endNodeId) return true;
      }
    }
    
    steps.push({ 
      nodeId,
      type: 'complete-node',
      description: `Backtracking from node ${nodeId}`
    });
    
    return false;
  };
  
  dfsRecursive(startNodeId);
  return steps;
};

//Dijkstra's Algorithm
export const dijkstra = (graph: Graph, startNodeId: string, endNodeId?: string): Step[] => {
  const steps: Step[] = [];
  const distances: Record<string, number> = {};
  const visited = new Set<string>();
  const pq: { nodeId: string; dist: number }[] = [];

  graph.nodes.forEach((node) => {
    distances[node.id] = Infinity;
  });

  distances[startNodeId] = 0;
  pq.push({ nodeId: startNodeId, dist: 0 });

  steps.push({
    nodeId: startNodeId,
    type: 'visit-node',
    description: `Start Dijkstra from ${startNodeId}`,
  });

  while (pq.length > 0) {
    // Sort by distance
    pq.sort((a, b) => a.dist - b.dist);
    const { nodeId } = pq.shift()!;
    if (visited.has(nodeId)) continue;

    visited.add(nodeId);
    steps.push({
      nodeId,
      type: 'complete-node',
      description: `Processed node ${nodeId} with distance ${distances[nodeId]}`,
    });

    const neighbors = getAdjacentNodes(graph, nodeId);
    for (const neighbor of neighbors) {
      const edge = graph.edges.find(
        (e) =>
          (e.source === nodeId && e.target === neighbor) ||
          (e.source === neighbor && e.target === nodeId)
      );
      if (!edge) continue;

      const weight = edge.weight ?? 1;
      const newDist = distances[nodeId] + weight;

      steps.push({
        edgeId: edge.id,
        type: 'explore-edge',
        description: `Check edge ${edge.id} from ${nodeId} to ${neighbor}`,
      });

      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        pq.push({ nodeId: neighbor, dist: newDist });
        steps.push({
          nodeId: neighbor,
          type: 'visit-node',
          description: `Update distance to ${neighbor} = ${newDist}`,
        });
      }
    }

    if (nodeId === endNodeId) {
      break;
    }
  }

  return steps;
};

export const aStar = (graph: Graph, startNodeId: string, endNodeId: string): Step[] => {
  const steps: Step[] = [];
  const openSet = new Set<string>([startNodeId]);
  const cameFrom: Record<string, string | null> = {};

  const gScore: Record<string, number> = {};
  const fScore: Record<string, number> = {};

  const getNode = (id: string) => graph.nodes.find(n => n.id === id)!;

  for (const node of graph.nodes) {
    gScore[node.id] = Infinity;
    fScore[node.id] = Infinity;
    cameFrom[node.id] = null;
  }

  gScore[startNodeId] = 0;
  fScore[startNodeId] = getNode(startNodeId).heuristic ?? 0;

  while (openSet.size > 0) {
    const current = Array.from(openSet).reduce((a, b) =>
      fScore[a] < fScore[b] ? a : b
    );

    steps.push({
      nodeId: current,
      type: 'visit-node',
      description: `Visit ${current}`
    });

    if (current === endNodeId) {
      steps.push({
        nodeId: current,
        type: 'complete-node',
        description: 'Reached goal!'
      });
      break;
    }

    openSet.delete(current);

    const neighbors = getAdjacentNodes(graph, current);
    for (const neighbor of neighbors) {
      const edge = graph.edges.find(
        e =>
          (e.source === current && e.target === neighbor) ||
          (e.source === neighbor && e.target === current)
      );
      if (!edge) continue;

      const weight = edge.weight ?? 1;
      const tentativeG = gScore[current] + weight;

      steps.push({
        edgeId: edge.id,
        type: 'explore-edge',
        description: `Check edge ${edge.id} from ${current} to ${neighbor}`
      });

      if (tentativeG < gScore[neighbor]) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentativeG;
        fScore[neighbor] = tentativeG + (getNode(neighbor).heuristic ?? 0);
        openSet.add(neighbor);

        steps.push({
          nodeId: neighbor,
          type: 'visit-node',
          description: `Update ${neighbor} with f = ${fScore[neighbor].toFixed(2)}`
        });
      }
    }

    steps.push({
      nodeId: current,
      type: 'complete-node',
      description: `Done with ${current}`
    });
  }

  return steps;
};

//Bellman-Ford Algorithm
export const bellmanFord = (graph: Graph, startNodeId: string): Step[] => {
  const steps: Step[] = [];
  const distances: Record<string, number> = {};
  const predecessor: Record<string, string | null> = {};

  // Initialize distances
  for (const node of graph.nodes) {
    distances[node.id] = Infinity;
    predecessor[node.id] = null;
  }

  distances[startNodeId] = 0;

  steps.push({
    nodeId: startNodeId,
    type: 'visit-node',
    description: `Start Bellman-Ford from ${startNodeId}`,
  });

  const V = graph.nodes.length;

  // Relax all edges V-1 times
  for (let i = 0; i < V - 1; i++) {
    for (const edge of graph.edges) {
      const { source, target, weight = 1 } = edge;
      if (distances[source] + weight < distances[target]) {
        distances[target] = distances[source] + weight;
        predecessor[target] = source;

        steps.push({
          edgeId: edge.id,
          type: 'explore-edge',
          description: `Update distance to ${target} via ${source} to ${distances[target]}`,
        });

        steps.push({
          nodeId: target,
          type: 'visit-node',
          description: `Updated ${target} to ${distances[target]}`,
        });
      }
    }
  }

  // Check for negative-weight cycles
  for (const edge of graph.edges) {
    const { source, target, weight = 1 } = edge;
    if (distances[source] + weight < distances[target]) {
      steps.push({
        edgeId: edge.id,
        type: 'explore-edge',
        description: 'Negative weight cycle detected!',
      });
      break; // Stop on first detection
    }
  }

  return steps;
};


//Floyd-Warshall Algorithm
export const floydWarshall = (graph: Graph): Step[] => {
  const steps: Step[] = [];
  const nodes = graph.nodes.map(n => n.id);
  const dist: Record<string, Record<string, number>> = {};
  const nodeIndex = (id: string) => nodes.indexOf(id);

  // Initialize distance matrix
  for (const u of nodes) {
    dist[u] = {};
    for (const v of nodes) {
      if (u === v) {
        dist[u][v] = 0;
      } else {
        const edge = graph.edges.find(
          e => (e.source === u && e.target === v)
        );
        dist[u][v] = edge ? edge.weight ?? 1 : Infinity;
      }
    }
  }

  // Main triple loop: k = intermediate node
  for (const k of nodes) {
    for (const i of nodes) {
      for (const j of nodes) {
        const throughK = dist[i][k] + dist[k][j];
        if (throughK < dist[i][j]) {
          dist[i][j] = throughK;

          // Find edge to animate (optional — virtual step)
          const edge = graph.edges.find(
            e => (e.source === i && e.target === j)
          );

          steps.push({
            edgeId: edge?.id,
            type: 'explore-edge',
            description: `Update shortest path ${i} → ${j} via ${k}: ${throughK}`
          });

          steps.push({
            nodeId: j,
            type: 'visit-node',
            description: `Distance to ${j} now ${throughK}`
          });
        }
      }
    }
  }

  return steps;
};


export type AlgorithmType = 'bfs' | 'dfs' | 'dijkstra' | 'a-star' | 'bellman-ford' | 'floyd-warshall';

export const executeAlgorithm = (
  graph: Graph,
  algorithm: AlgorithmType,
  startNodeId: string,
  endNodeId?: string
): Step[] => {
  switch (algorithm) {
    case 'bfs':
      return bfs(graph, startNodeId, endNodeId);
    case 'dfs':
      return dfs(graph, startNodeId, endNodeId);
    case 'dijkstra':
      return dijkstra(graph, startNodeId, endNodeId);
    case 'a-star':
      return aStar(graph, startNodeId, endNodeId!);
    case 'bellman-ford':
      return bellmanFord(graph, startNodeId); 
    case 'floyd-warshall':
      return floydWarshall(graph); 
     
    
    default:
      return [];
  }
};

