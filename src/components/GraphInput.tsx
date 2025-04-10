
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Trash2 } from 'lucide-react';

interface GraphInputProps {
  onGraphChange: (graph: Graph) => void;
  currentGraph: Graph;
}

const GraphInput: React.FC<GraphInputProps> = ({ onGraphChange, currentGraph }) => {
  const [nodeCount, setNodeCount] = useState(6);
  const [edges, setEdges] = useState<{from: number, to: number, weight: number}[]>([]);
  const [directed, setDirected] = useState(false);
  const [newEdge, setNewEdge] = useState({ from: 0, to: 1, weight: 1 });
  
  // Initialize edges from current graph
  useEffect(() => {
    if (currentGraph.nodes.length > 0) {
      const graphEdges = currentGraph.edges.map(edge => ({
        from: parseInt(edge.source.substring(1)),
        to: parseInt(edge.target.substring(1)),
        weight: edge.weight || 1
      }));
      
      setEdges(graphEdges);
      setNodeCount(currentGraph.nodes.length);
    }
  }, [currentGraph]);
  
  // Add a new edge
  const handleAddEdge = () => {
    // Check if edge already exists
    const edgeExists = edges.some(
      edge => edge.from === newEdge.from && edge.to === newEdge.to
    );
    
    if (edgeExists) {
      toast.error("Edge already exists");
      return;
    }
    
    // Check if nodes are valid
    if (newEdge.from < 0 || newEdge.from >= nodeCount || 
        newEdge.to < 0 || newEdge.to >= nodeCount) {
      toast.error("Invalid node indices");
      return;
    }
    
    // Add the edge
    setEdges([...edges, { ...newEdge }]);
    
    // If undirected, add the reverse edge as well
    if (!directed && newEdge.from !== newEdge.to) {
      setEdges(prev => [
        ...prev, 
        { from: newEdge.to, to: newEdge.from, weight: newEdge.weight }
      ]);
    }
    
    // Reset the new edge form
    setNewEdge({ from: 0, to: 1, weight: 1 });
    toast.success("Edge added");
  };
  
  // Remove an edge
  const handleRemoveEdge = (index: number) => {
    const edgeToRemove = edges[index];
    
    // Remove the edge
    const filteredEdges = edges.filter((_, i) => i !== index);
    
    // If undirected, also remove the reverse edge if it exists
    if (!directed) {
      const reverseIndex = filteredEdges.findIndex(
        edge => edge.from === edgeToRemove.to && edge.to === edgeToRemove.from
      );
      
      if (reverseIndex !== -1) {
        filteredEdges.splice(reverseIndex, 1);
      }
    }
    
    setEdges(filteredEdges);
    toast.success("Edge removed");
  };
  
  // Generate a graph from the current edges
  const generateGraph = () => {
    try {
      // Create an adjacency matrix from the edges
      const matrix = Array(nodeCount).fill(0).map(() => Array(nodeCount).fill(0));
      
      edges.forEach(edge => {
        matrix[edge.from][edge.to] = edge.weight;
      });
      
      const graph = generateGraphFromAdjacencyMatrix(matrix, directed);
      onGraphChange(graph);
      toast.success(`Generated graph with ${nodeCount} nodes and ${edges.length} edges`);
    } catch (error) {
      toast.error("Failed to generate graph");
      console.error(error);
    }
  };
  
  // Update node count and adjust edges if needed
  const handleNodeCountChange = (count: number) => {
    const newCount = Math.max(2, Math.min(10, count));
    setNodeCount(newCount);
    
    // Remove edges that reference nodes that no longer exist
    setEdges(edges.filter(edge => 
      edge.from < newCount && edge.to < newCount
    ));
  };
  
  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Graph Data</h3>
          <p className="text-sm text-muted-foreground">
            Define your graph by adding edges between nodes
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
          <Label htmlFor="nodeCount">Node Count:</Label>
          <Input
            id="nodeCount"
            type="number"
            min={2}
            max={10}
            value={nodeCount}
            onChange={(e) => handleNodeCountChange(parseInt(e.target.value) || 2)}
            className="w-20"
          />
        </div>
        <p className="text-sm text-muted-foreground mt-6">
          (Nodes are labeled from 0 to {nodeCount - 1})
        </p>
      </div>
      
      <div className="space-y-4 border rounded-md p-4">
        <h4 className="font-medium">Add New Edge</h4>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <Label htmlFor="fromNode">From Node:</Label>
            <Input
              id="fromNode"
              type="number"
              min={0}
              max={nodeCount - 1}
              value={newEdge.from}
              onChange={(e) => setNewEdge({ ...newEdge, from: parseInt(e.target.value) || 0 })}
              className="w-20"
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="toNode">To Node:</Label>
            <Input
              id="toNode"
              type="number"
              min={0}
              max={nodeCount - 1}
              value={newEdge.to}
              onChange={(e) => setNewEdge({ ...newEdge, to: parseInt(e.target.value) || 0 })}
              className="w-20"
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="weight">Weight:</Label>
            <Input
              id="weight"
              type="number"
              min={1}
              max={10}
              value={newEdge.weight}
              onChange={(e) => setNewEdge({ ...newEdge, weight: parseInt(e.target.value) || 1 })}
              className="w-20"
            />
          </div>
          
          <Button 
            onClick={handleAddEdge} 
            variant="outline"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Edge
          </Button>
        </div>
      </div>
      
      <div className="overflow-auto max-h-[300px] border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {edges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                  No edges defined. Add some edges above.
                </TableCell>
              </TableRow>
            ) : (
              edges.map((edge, index) => (
                <TableRow key={index} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                  <TableCell>{edge.from}</TableCell>
                  <TableCell>{edge.to}</TableCell>
                  <TableCell>{edge.weight}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveEdge(index)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
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
