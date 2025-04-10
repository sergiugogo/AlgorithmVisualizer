
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

import NavBar from '../components/NavBar';
import GraphCanvas from '../components/GraphCanvas';
import GraphControls from '../components/GraphControls';
import AlgorithmSelector from '../components/AlgorithmSelector';
import VisualizationControls from '../components/VisualizationControls';

import { 
  Graph, 
  Node, 
  Edge,
  createEmptyGraph,
  generateRandomGraph,
  resetGraphStatus,
  updateNodeStatus,
  updateEdgeStatus,
  addNode,
  removeNode,
  addEdge,
  removeEdge,
  getNodeById,
  getAdjacentNodes
} from '../utils/graphUtils';

import {
  Step,
  AlgorithmType,
  executeAlgorithm
} from '../utils/graphAlgorithms';

const Index = () => {
  // Graph state
  const [graph, setGraph] = useState<Graph>(generateRandomGraph(6));
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  
  // Algorithm state
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('bfs');
  const [startNodeId, setStartNodeId] = useState<string>(graph.nodes[0]?.id || '');
  const [endNodeId, setEndNodeId] = useState<string>('none');
  
  // Visualization state
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(5);
  
  // Refs for animation
  const animationRef = useRef<number | null>(null);
  const lastStepTimeRef = useRef<number>(0);
  
  // Calculate delay based on animation speed (1-10)
  const getAnimationDelay = () => {
    return 1100 - (animationSpeed * 100);
  };
  
  // Reset the graph to its original state
  const resetVisualization = useCallback(() => {
    setGraph(prevGraph => resetGraphStatus(prevGraph));
    setCurrentStep(0);
    setIsRunning(false);
    
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);
  
  // Handle node selection
  const handleNodeClick = (nodeId: string) => {
    if (isRunning) return;
    
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);
    
    if (!startNodeId) {
      setStartNodeId(nodeId);
      setGraph(prevGraph => {
        return {
          ...prevGraph,
          nodes: prevGraph.nodes.map(node => 
            node.id === nodeId 
              ? { ...node, status: 'start' }
              : node
          )
        };
      });
    }
  };
  
  // Handle edge selection
  const handleEdgeClick = (edgeId: string) => {
    if (isRunning) return;
    
    setSelectedEdgeId(edgeId);
    setSelectedNodeId(null);
  };
  
  // Handle canvas click (add new node)
  const handleCanvasClick = (x: number, y: number) => {
    if (isRunning) return;
    
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    
    setGraph(prevGraph => addNode(prevGraph, x, y));
  };
  
  // Start algorithm visualization
  const startVisualization = () => {
    if (!startNodeId || steps.length === 0) return;
    
    setIsRunning(true);
    lastStepTimeRef.current = performance.now();
    
    const animate = (timestamp: number) => {
      if (timestamp - lastStepTimeRef.current >= getAnimationDelay()) {
        stepForward();
        lastStepTimeRef.current = timestamp;
      }
      
      if (currentStep < steps.length - 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsRunning(false);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };
  
  // Pause animation
  const pauseVisualization = () => {
    setIsRunning(false);
    
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };
  
  // Step forward in visualization
  const stepForward = () => {
    if (currentStep >= steps.length - 1) return;
    
    const nextStep = steps[currentStep + 1];
    setCurrentStep(prevStep => prevStep + 1);
    
    applyStepToGraph(nextStep);
  };
  
  // Step backward in visualization
  const stepBackward = () => {
    if (currentStep <= 0) return;
    
    setCurrentStep(prevStep => prevStep - 1);
    
    setGraph(prevGraph => {
      let newGraph = resetGraphStatus(prevGraph);
      
      if (startNodeId) {
        newGraph = updateNodeStatus(newGraph, startNodeId, 'start');
      }
      
      if (endNodeId && endNodeId !== 'none') {
        newGraph = updateNodeStatus(newGraph, endNodeId, 'end');
      }
      
      for (let i = 0; i < currentStep - 1; i++) {
        newGraph = applyStepToGraphHelper(newGraph, steps[i]);
      }
      
      return newGraph;
    });
  };
  
  // Apply a step to the graph
  const applyStepToGraph = (step: Step) => {
    setGraph(prevGraph => applyStepToGraphHelper(prevGraph, step));
  };
  
  // Helper function to apply a step to the graph
  const applyStepToGraphHelper = (graph: Graph, step: Step): Graph => {
    let newGraph = { ...graph };
    
    switch (step.type) {
      case 'visit-node':
        if (step.nodeId) {
          const node = getNodeById(newGraph, step.nodeId);
          if (node && node.status !== 'start' && node.status !== 'end') {
            newGraph = updateNodeStatus(newGraph, step.nodeId, 'active');
          }
        }
        break;
      case 'explore-edge':
        if (step.edgeId) {
          newGraph = updateEdgeStatus(newGraph, step.edgeId, 'active');
        }
        break;
      case 'complete-node':
        if (step.nodeId) {
          const node = getNodeById(newGraph, step.nodeId);
          if (node && node.status !== 'start' && node.status !== 'end') {
            newGraph = updateNodeStatus(newGraph, step.nodeId, 'visited');
          }
        }
        break;
    }
    
    return newGraph;
  };
  
  // Generate algorithm steps
  const generateSteps = useCallback(() => {
    if (!startNodeId) return;
    
    const algorithmSteps = executeAlgorithm(
      graph, 
      selectedAlgorithm, 
      startNodeId,
      endNodeId && endNodeId !== 'none' ? endNodeId : undefined
    );
    
    setSteps(algorithmSteps);
    setCurrentStep(0);
  }, [graph, selectedAlgorithm, startNodeId, endNodeId]);
  
  // Handle algorithm change
  const handleAlgorithmChange = (algorithm: string) => {
    setSelectedAlgorithm(algorithm as AlgorithmType);
    resetVisualization();
  };
  
  // Handle start node change
  const handleStartNodeChange = (nodeId: string) => {
    // Reset previous start node
    setGraph(prevGraph => {
      let newGraph = { ...prevGraph };
      
      if (startNodeId) {
        newGraph = updateNodeStatus(newGraph, startNodeId, 'default');
      }
      
      return updateNodeStatus(newGraph, nodeId, 'start');
    });
    
    setStartNodeId(nodeId);
    resetVisualization();
  };
  
  // Handle end node change
  const handleEndNodeChange = (nodeId: string) => {
    // Reset previous end node
    setGraph(prevGraph => {
      let newGraph = { ...prevGraph };
      
      if (endNodeId && endNodeId !== 'none') {
        newGraph = updateNodeStatus(newGraph, endNodeId, 'default');
      }
      
      return nodeId && nodeId !== 'none'
        ? updateNodeStatus(newGraph, nodeId, 'end')
        : newGraph;
    });
    
    setEndNodeId(nodeId);
    resetVisualization();
  };
  
  // Generate random graph
  const handleGenerateRandom = (numNodes: number) => {
    const newGraph = generateRandomGraph(numNodes);
    setGraph(newGraph);
    setStartNodeId(newGraph.nodes[0]?.id || '');
    setEndNodeId('none');
    resetVisualization();
    
    toast.success(`Generated random graph with ${numNodes} nodes`);
  };
  
  // Clear graph
  const handleClearGraph = () => {
    setGraph(createEmptyGraph());
    setStartNodeId('');
    setEndNodeId('none');
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    resetVisualization();
    
    toast.info('Graph cleared');
  };
  
  // Save graph
  const handleSaveGraph = () => {
    const graphData = JSON.stringify(graph);
    const blob = new Blob([graphData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graph.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success('Graph saved as JSON');
  };
  
  // Update steps when algorithm or nodes change
  useEffect(() => {
    generateSteps();
  }, [selectedAlgorithm, startNodeId, endNodeId, generateSteps]);
  
  // Cancel animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Reset visualization when animation completes
  useEffect(() => {
    if (currentStep >= steps.length - 1 && isRunning) {
      setIsRunning(false);
    }
  }, [currentStep, steps.length, isRunning]);
  
  // Prepare node options for selects
  const nodeOptions = graph.nodes.map(node => ({
    id: node.id,
    label: node.label || node.id,
  }));
  
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar title="Graph Voyage Visualizer" />
      
      <main className="flex-1 container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar - Controls */}
          <div className="lg:col-span-3 space-y-6">
            <GraphControls
              onRun={startVisualization}
              onPause={pauseVisualization}
              onStepForward={stepForward}
              onStepBack={stepBackward}
              onReset={resetVisualization}
              onGenerateRandom={handleGenerateRandom}
              onClear={handleClearGraph}
              onSave={handleSaveGraph}
              onAlgorithmChange={handleAlgorithmChange}
              onStartNodeChange={handleStartNodeChange}
              onEndNodeChange={handleEndNodeChange}
              onSpeedChange={setAnimationSpeed}
              selectedAlgorithm={selectedAlgorithm}
              startNodeId={startNodeId}
              endNodeId={endNodeId}
              nodeOptions={nodeOptions}
              isRunning={isRunning}
              animationSpeed={animationSpeed}
              currentStep={currentStep}
              totalSteps={steps.length}
            />
          </div>
          
          {/* Main content - Graph */}
          <div className="lg:col-span-6 flex flex-col items-center space-y-4">
            <div className="relative">
              <GraphCanvas
                graph={graph}
                onNodeClick={handleNodeClick}
                onEdgeClick={handleEdgeClick}
                onCanvasClick={handleCanvasClick}
                width={600}
                height={500}
              />
              
              <div className="absolute top-4 left-4 bg-black/70 text-white text-xs rounded px-2 py-1">
                Click canvas to add nodes. Select nodes to connect them.
              </div>
            </div>
            
            <div className="w-full">
              <VisualizationControls
                isRunning={isRunning}
                currentStep={currentStep}
                steps={steps}
                onPlay={startVisualization}
                onPause={pauseVisualization}
                onStepForward={stepForward}
                onStepBack={stepBackward}
                onReset={resetVisualization}
              />
            </div>
          </div>
          
          {/* Right sidebar - Algorithm info */}
          <div className="lg:col-span-3">
            <AlgorithmSelector
              selectedAlgorithm={selectedAlgorithm}
              onAlgorithmChange={handleAlgorithmChange}
            />
            
            <div className="mt-6 bg-card rounded-lg p-4 border">
              <h3 className="font-medium mb-2">Instructions</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Click on the canvas to add new nodes</li>
                <li>• Select two nodes consecutively to create an edge</li>
                <li>• Select an algorithm, start node, and end node (optional)</li>
                <li>• Use the controls to run, pause, or step through the algorithm</li>
                <li>• Generate a random graph or clear the current graph</li>
              </ul>
              
              <h3 className="font-medium mt-4 mb-2">Node Colors</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-graph-node"></div>
                  <span>Default</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-graph-node-active"></div>
                  <span>Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-graph-node-visited"></div>
                  <span>Visited</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-graph-node-start"></div>
                  <span>Start</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-graph-node-end"></div>
                  <span>End</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Graph Voyage Visualizer - Interactive tool for visualizing graph traversal algorithms</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
