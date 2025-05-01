// Types for graph data structures
export interface Node {
  id: string;
  label?: string;
  x: number;
  y: number;
  status?: string;
  heuristic?: number; // ← Add this if missing
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  weight?: number;
  status?: 'default' | 'active' | 'visited';
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
}

// Create a new empty graph
export const createEmptyGraph = (): Graph => {
  return { nodes: [], edges: [] };
};

// Generate a random graph with n nodes
export const generateRandomGraph = (n: number, edgeProbability: number = 0.3): Graph => {
  const graph: Graph = { nodes: [], edges: [] };
  
  // Create nodes
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n;
    const radius = 200;
    
    graph.nodes.push({
      id: `n${i}`,
      x: 250 + radius * Math.cos(angle),
      y: 250 + radius * Math.sin(angle),
      label: `${i}`,
      status: 'default'
    });
  }
  
  // Create edges with some randomness
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.random() < edgeProbability) {
        graph.edges.push({
          id: `e${i}-${j}`,
          source: `n${i}`,
          target: `n${j}`,
          weight: Math.floor(Math.random() * 10) + 1,
          status: 'default'
        });
      }
    }
  }
  
  return graph;
};

// Generate a graph from an adjacency matrix
export const generateGraphFromAdjacencyMatrix = (matrix: number[][], directed: boolean = false): Graph => {
  const graph: Graph = { nodes: [], edges: [] };
  const size = matrix.length;
  
  // Calculate positions in a circle
  for (let i = 0; i < size; i++) {
    const angle = (2 * Math.PI * i) / size;
    const radius = 200;
    
    graph.nodes.push({
      id: `n${i}`,
      x: 300 + radius * Math.cos(angle),
      y: 250 + radius * Math.sin(angle),
      label: `${i}`,
      status: 'default'
    });
  }
  
  // Create edges based on the adjacency matrix
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (matrix[i][j] > 0) {
        // For undirected graphs, only add edges where i < j to avoid duplicates
        if (directed || (!directed && i <= j)) {
          graph.edges.push({
            id: `e${i}-${j}`,
            source: `n${i}`,
            target: `n${j}`,
            weight: matrix[i][j],
            status: 'default'
          });
        }
      }
    }
  }
  
  return graph;
};

// Convert a graph to an adjacency matrix
export const convertGraphToAdjacencyMatrix = (graph: Graph, directed: boolean = false): number[][] => {
  const size = graph.nodes.length;
  const matrix = Array(size).fill(0).map(() => Array(size).fill(0));
  
  graph.edges.forEach(edge => {
    const sourceId = edge.source;
    const targetId = edge.target;
    const sourceIndex = parseInt(sourceId.substring(1));
    const targetIndex = parseInt(targetId.substring(1));
    
    matrix[sourceIndex][targetIndex] = edge.weight || 1;
    
    // For undirected graphs, mirror the connection
    if (!directed && sourceIndex !== targetIndex) {
      matrix[targetIndex][sourceIndex] = edge.weight || 1;
    }
  });
  
  return matrix;
};

// Reset all node and edge statuses to default
export const resetGraphStatus = (graph: Graph): Graph => {
  return {
    nodes: graph.nodes.map(node => ({ ...node, status: 'default' })),
    edges: graph.edges.map(edge => ({ ...edge, status: 'default' }))
  };
};

// Helper function to get adjacent nodes
export const getAdjacentNodes = (graph: Graph, nodeId: string): string[] => {
  return graph.edges
    .filter(edge => edge.source === nodeId || edge.target === nodeId)
    .map(edge => edge.source === nodeId ? edge.target : edge.source);
};

// Helper to check if two nodes are connected
export const areNodesConnected = (graph: Graph, nodeId1: string, nodeId2: string): boolean => {
  return graph.edges.some(
    edge => 
      (edge.source === nodeId1 && edge.target === nodeId2) || 
      (edge.source === nodeId2 && edge.target === nodeId1)
  );
};

// Add a node to the graph
export const addNode = (graph: Graph, x: number, y: number): Graph => {
  const newNodeId = `n${graph.nodes.length}`;
  const newNode: Node = {
    id: newNodeId,
    x,
    y,
    label: `${graph.nodes.length}`,
    status: 'default'
  };
  
  return {
    ...graph,
    nodes: [...graph.nodes, newNode]
  };
};

// Remove a node from the graph (and its connected edges)
export const removeNode = (graph: Graph, nodeId: string): Graph => {
  const filteredNodes = graph.nodes.filter(node => node.id !== nodeId);
  const filteredEdges = graph.edges.filter(
    edge => edge.source !== nodeId && edge.target !== nodeId
  );
  
  return {
    nodes: filteredNodes,
    edges: filteredEdges
  };
};

// Add an edge between two nodes
export const addEdge = (graph: Graph, sourceId: string, targetId: string, weight: number = 1): Graph => {
  if (sourceId === targetId || areNodesConnected(graph, sourceId, targetId)) {
    return graph;
  }
  
  const newEdge: Edge = {
    id: `e${sourceId}-${targetId}`,
    source: sourceId,
    target: targetId,
    weight,
    status: 'default'
  };
  
  return {
    ...graph,
    edges: [...graph.edges, newEdge]
  };
};

// Remove an edge from the graph
export const removeEdge = (graph: Graph, edgeId: string): Graph => {
  return {
    ...graph,
    edges: graph.edges.filter(edge => edge.id !== edgeId)
  };
};

// Get a node by ID
export const getNodeById = (graph: Graph, nodeId: string): Node | undefined => {
  return graph.nodes.find(node => node.id === nodeId);
};

// Get an edge by ID
export const getEdgeById = (graph: Graph, edgeId: string): Edge | undefined => {
  return graph.edges.find(edge => edge.id === edgeId);
};

// Update a node's status
export const updateNodeStatus = (graph: Graph, nodeId: string, status: Node['status']): Graph => {
  return {
    ...graph,
    nodes: graph.nodes.map(node => 
      node.id === nodeId ? { ...node, status } : node
    )
  };
};

// Update an edge's status
export const updateEdgeStatus = (graph: Graph, edgeId: string, status: Edge['status']): Graph => {
  return {
    ...graph,
    edges: graph.edges.map(edge => 
      edge.id === edgeId ? { ...edge, status } : edge
    )
  };
};
