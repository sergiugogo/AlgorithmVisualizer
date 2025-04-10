
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

// Types of algorithms supported
export type AlgorithmType = 'bfs' | 'dfs';

// Execute an algorithm and get the steps
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
    default:
      return [];
  }
};
