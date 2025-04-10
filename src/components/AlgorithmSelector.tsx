
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AlgorithmSelectorProps {
  selectedAlgorithm: string;
  onAlgorithmChange: (algorithm: string) => void;
}

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  selectedAlgorithm,
  onAlgorithmChange,
}) => {
  return (
    <Tabs defaultValue={selectedAlgorithm} onValueChange={onAlgorithmChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="bfs">Breadth-First Search</TabsTrigger>
        <TabsTrigger value="dfs">Depth-First Search</TabsTrigger>
      </TabsList>
      
      <TabsContent value="bfs">
        <Card>
          <CardHeader>
            <CardTitle>Breadth-First Search (BFS)</CardTitle>
            <CardDescription>
              A traversal algorithm that explores all neighbors at the current depth before moving to nodes at the next depth level.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h4 className="font-medium">Key Characteristics:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Uses a queue data structure (First In, First Out)</li>
                <li>Explores nodes level by level</li>
                <li>Finds the shortest path in unweighted graphs</li>
                <li>Time Complexity: O(V + E)</li>
                <li>Space Complexity: O(V)</li>
              </ul>
              
              <h4 className="font-medium mt-4">Applications:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Finding shortest path in unweighted graphs</li>
                <li>Web crawling</li>
                <li>Finding all nodes within a connected component</li>
                <li>Testing if a graph is bipartite</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="dfs">
        <Card>
          <CardHeader>
            <CardTitle>Depth-First Search (DFS)</CardTitle>
            <CardDescription>
              A traversal algorithm that explores as far as possible along a branch before backtracking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h4 className="font-medium">Key Characteristics:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Uses a stack data structure (Last In, First Out)</li>
                <li>Explores a path to its deepest point before backtracking</li>
                <li>Can be implemented recursively or iteratively</li>
                <li>Time Complexity: O(V + E)</li>
                <li>Space Complexity: O(V)</li>
              </ul>
              
              <h4 className="font-medium mt-4">Applications:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Topological sorting</li>
                <li>Finding connected components</li>
                <li>Maze generation and solving</li>
                <li>Detecting cycles in a graph</li>
                <li>Finding strongly connected components</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AlgorithmSelector;
