
import React, { useEffect, useRef, useState } from 'react';
import { Graph, Node, Edge } from '../utils/graphUtils';

interface GraphCanvasProps {
  graph: Graph;
  onNodeClick?: (nodeId: string) => void;
  onEdgeClick?: (edgeId: string) => void;
  onCanvasClick?: (x: number, y: number) => void;
  width?: number;
  height?: number;
}

const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graph,
  onNodeClick,
  onEdgeClick,
  onCanvasClick,
  width = 500,
  height = 500,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Node rendering constants
  const NODE_RADIUS = 20;
  const NODE_OUTLINE_WIDTH = 2;
  const FONT_SIZE = 14;
  const EDGE_WIDTH = 2;
  const EDGE_SELECTED_WIDTH = 4;

  // Get node color based on status
  const getNodeColor = (status?: Node['status']) => {
    switch (status) {
      case 'active':
        return '#8b5cf6'; // Purple
      case 'visited':
        return '#10b981'; // Green
      case 'start':
        return '#f97316'; // Orange
      case 'end':
        return '#ef4444'; // Red
      default:
        return '#3b82f6'; // Blue
    }
  };

  // Get edge color based on status
  const getEdgeColor = (status?: Edge['status']) => {
    switch (status) {
      case 'active':
        return '#8b5cf6'; // Purple
      case 'visited':
        return '#10b981'; // Green
      default:
        return '#64748b'; // Slate
    }
  };

  // Draw the graph on the canvas
  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges first (so they appear behind nodes)
    graph.edges.forEach((edge) => {
      const sourceNode = graph.nodes.find((node) => node.id === edge.source);
      const targetNode = graph.nodes.find((node) => node.id === edge.target);
      
      if (!sourceNode || !targetNode) return;

      ctx.beginPath();
      ctx.moveTo(sourceNode.x, sourceNode.y);
      ctx.lineTo(targetNode.x, targetNode.y);
      
      const isHovered = edge.id === hoveredEdgeId;
      ctx.strokeStyle = getEdgeColor(edge.status);
      ctx.lineWidth = isHovered ? EDGE_SELECTED_WIDTH : EDGE_WIDTH;
      ctx.stroke();

      // Draw edge weight if it exists
      if (edge.weight) {
        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(midX, midY, 12, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#334155';
        ctx.font = `${FONT_SIZE}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(edge.weight.toString(), midX, midY);
      }
    });

    // Draw nodes
    graph.nodes.forEach((node) => {
      const isHovered = node.id === hoveredNodeId;
      
      // Draw node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = getNodeColor(node.status);
      ctx.fill();
      
      // Draw node outline
      ctx.lineWidth = NODE_OUTLINE_WIDTH;
      ctx.strokeStyle = isHovered ? '#ffffff' : '#0f172a';
      ctx.stroke();
      
      // Draw node label
      if (node.label) {
        ctx.fillStyle = 'white';
        ctx.font = `bold ${FONT_SIZE}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, node.y);
      }
    });
  };

  // Check if a point is inside a node
  const isPointInNode = (x: number, y: number, node: Node): boolean => {
    return Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2) <= NODE_RADIUS;
  };

  // Check if a point is close to an edge
  const isPointNearEdge = (x: number, y: number, edge: Edge): boolean => {
    const sourceNode = graph.nodes.find((node) => node.id === edge.source);
    const targetNode = graph.nodes.find((node) => node.id === edge.target);
    
    if (!sourceNode || !targetNode) return false;
    
    // Calculate distances
    const A = { x: sourceNode.x, y: sourceNode.y };
    const B = { x: targetNode.x, y: targetNode.y };
    const P = { x, y };
    
    const AB = Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2);
    const AP = Math.sqrt((P.x - A.x) ** 2 + (P.y - A.y) ** 2);
    const PB = Math.sqrt((B.x - P.x) ** 2 + (B.y - P.y) ** 2);
    
    // If point is not within the line segment bounds, return false
    if (AP > AB || PB > AB) return false;
    
    // Calculate distance from point to line
    const distance = Math.abs(
      (B.y - A.y) * P.x - (B.x - A.x) * P.y + B.x * A.y - B.y * A.x
    ) / AB;
    
    return distance <= 5; // 5px tolerance
  };

  // Handle mouse move on canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging && draggedNodeId) {
      // We're dragging a node
      const draggedNode = graph.nodes.find((node) => node.id === draggedNodeId);
      if (draggedNode && typeof onNodeClick === 'function') {
        const updatedNode = {
          ...draggedNode,
          x: x - dragOffset.x,
          y: y - dragOffset.y,
        };
        
        // Update the node through the parent component
        const updatedGraph = {
          ...graph,
          nodes: graph.nodes.map((node) =>
            node.id === draggedNodeId ? updatedNode : node
          ),
        };
        
        // This is a bit of a hack - we're calling onNodeClick to inform the parent component
        // Ideally, we would have a separate onNodeDrag callback
        onNodeClick(draggedNodeId);
      }
      return;
    }

    // Check for node hover
    let foundNode = false;
    for (const node of graph.nodes) {
      if (isPointInNode(x, y, node)) {
        setHoveredNodeId(node.id);
        setHoveredEdgeId(null);
        foundNode = true;
        break;
      }
    }

    if (!foundNode) {
      setHoveredNodeId(null);
      
      // Check for edge hover only if not hovering over a node
      let foundEdge = false;
      for (const edge of graph.edges) {
        if (isPointNearEdge(x, y, edge)) {
          setHoveredEdgeId(edge.id);
          foundEdge = true;
          break;
        }
      }
      
      if (!foundEdge) {
        setHoveredEdgeId(null);
      }
    }
  };

  // Handle mouse down on canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if we're clicking on a node
    for (const node of graph.nodes) {
      if (isPointInNode(x, y, node)) {
        setIsDragging(true);
        setDraggedNodeId(node.id);
        setDragOffset({ x: x - node.x, y: y - node.y });
        return;
      }
    }

    // Check if we're clicking on an edge
    for (const edge of graph.edges) {
      if (isPointNearEdge(x, y, edge) && onEdgeClick) {
        onEdgeClick(edge.id);
        return;
      }
    }

    // If we click on empty space
    if (onCanvasClick) {
      onCanvasClick(x, y);
    }
  };

  // Handle mouse up on canvas
  const handleMouseUp = () => {
    if (isDragging && draggedNodeId && onNodeClick) {
      onNodeClick(draggedNodeId);
    }
    
    setIsDragging(false);
    setDraggedNodeId(null);
  };

  // Handle click on canvas
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) return; // Ignore clicks during drag

    if (hoveredNodeId && onNodeClick) {
      onNodeClick(hoveredNodeId);
    } else if (hoveredEdgeId && onEdgeClick) {
      onEdgeClick(hoveredEdgeId);
    }
  };

  // Set up canvas and redraw when the graph changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    drawGraph();
  }, [graph, hoveredNodeId, hoveredEdgeId, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="border border-gray-300 rounded-md bg-slate-900"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      width={width}
      height={height}
    />
  );
};

export default GraphCanvas;
