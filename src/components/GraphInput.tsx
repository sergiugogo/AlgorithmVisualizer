
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Graph, generateGraphFromAdjacencyMatrix } from '../utils/graphUtils';
import { toast } from 'sonner';

interface GraphInputProps {
  onGraphChange: (graph: Graph) => void;
  currentGraph: Graph;
}

const GraphInput: React.FC<GraphInputProps> = ({ onGraphChange, currentGraph }) => {
  const [nodeCount, setNodeCount] = useState(6);
  const [matrix, setMatrix] = useState<number[][]>([]);
  const [directed, setDirected] = useState(false);
  
  // Initialize matrix based on node count
  useEffect(() => {
    initializeMatrix(nodeCount);
  }, [nodeCount]);
  
  // Initialize the adjacency matrix with zeros
  const initializeMatrix = (count: number) => {
    const newMatrix = Array(count).fill(0).map(() => Array(count).fill(0));
    setMatrix(newMatrix);
  };
  
  // Convert current graph to adjacency matrix
  useEffect(() => {
    if (currentGraph.nodes.length > 0) {
      const size = currentGraph.nodes.length;
      const newMatrix = Array(size).fill(0).map(() => Array(size).fill(0));
      
      currentGraph.edges.forEach(edge => {
        const sourceIndex = parseInt(edge.source.substring(1));
        const targetIndex = parseInt(edge.target.substring(1));
        
        // For directed graphs, only set the source->target connection
        // For undirected, set both directions
        newMatrix[sourceIndex][targetIndex] = edge.weight || 1;
        if (!directed) {
          newMatrix[targetIndex][sourceIndex] = edge.weight || 1;
        }
      });
      
      setMatrix(newMatrix);
      setNodeCount(size);
    }
  }, [currentGraph, directed]);
  
  // Update a single matrix cell value
  const handleMatrixChange = (rowIndex: number, colIndex: number, value: string) => {
    const numValue = parseInt(value) || 0;
    
    // Create a deep copy of the matrix
    const newMatrix = [...matrix.map(row => [...row])];
    newMatrix[rowIndex][colIndex] = numValue;
    
    // For undirected graphs, mirror the change
    if (!directed && rowIndex !== colIndex) {
      newMatrix[colIndex][rowIndex] = numValue;
    }
    
    setMatrix(newMatrix);
  };
  
  // Generate a graph from the current matrix
  const generateGraph = () => {
    try {
      const graph = generateGraphFromAdjacencyMatrix(matrix, directed);
      onGraphChange(graph);
      toast.success(`Generated graph with ${nodeCount} nodes`);
    } catch (error) {
      toast.error("Failed to generate graph");
      console.error(error);
    }
  };
  
  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Graph Data</h3>
          <p className="text-sm text-muted-foreground">
            Define your graph using an adjacency matrix
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={directed ? "outline" : "default"} 
            size="sm"
            onClick={() => setDirected(false)}
          >
            Undirected
          </Button>
          <Button 
            variant={directed ? "default" : "outline"} 
            size="sm"
            onClick={() => setDirected(true)}
          >
            Directed
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Node Count:</label>
          <Input
            type="number"
            min={2}
            max={10}
            value={nodeCount}
            onChange={(e) => setNodeCount(parseInt(e.target.value) || 2)}
            className="w-20"
          />
        </div>
      </div>
      
      <div className="overflow-auto max-h-[400px] border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">i/j</TableHead>
              {Array.from({ length: nodeCount }).map((_, index) => (
                <TableHead key={index} className="w-10 text-center">{index}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: nodeCount }).map((_, rowIndex) => (
              <TableRow key={rowIndex} className={rowIndex % 2 === 0 ? "bg-muted/50" : ""}>
                <TableCell className="font-medium">{rowIndex}</TableCell>
                {Array.from({ length: nodeCount }).map((_, colIndex) => (
                  <TableCell key={colIndex} className="p-1">
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      value={matrix[rowIndex]?.[colIndex] || 0}
                      onChange={(e) => handleMatrixChange(rowIndex, colIndex, e.target.value)}
                      className="w-10 h-8 text-center p-0"
                      disabled={!directed && rowIndex > colIndex} // For undirected, only allow upper triangle
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <Button onClick={generateGraph} className="w-full">
        Generate Graph
      </Button>
    </div>
  );
};

export default GraphInput;
