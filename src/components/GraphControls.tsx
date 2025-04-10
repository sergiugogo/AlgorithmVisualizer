
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RefreshCw, 
  PlusCircle,
  Trash2,
  Save,
  Table
} from 'lucide-react';

interface GraphControlsProps {
  onRun: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onReset: () => void;
  onGenerateRandom: (numNodes: number) => void;
  onClear: () => void;
  onSave: () => void;
  onAlgorithmChange: (algorithm: string) => void;
  onStartNodeChange: (nodeId: string) => void;
  onEndNodeChange: (nodeId: string) => void;
  onSpeedChange: (speed: number) => void;
  onToggleMatrixInput: () => void;
  selectedAlgorithm: string;
  startNodeId: string;
  endNodeId: string;
  nodeOptions: { id: string; label: string }[];
  isRunning: boolean;
  animationSpeed: number;
  currentStep: number;
  totalSteps: number;
}

const GraphControls: React.FC<GraphControlsProps> = ({
  onRun,
  onPause,
  onStepForward,
  onStepBack,
  onReset,
  onGenerateRandom,
  onClear,
  onSave,
  onAlgorithmChange,
  onStartNodeChange,
  onEndNodeChange,
  onSpeedChange,
  onToggleMatrixInput,
  selectedAlgorithm,
  startNodeId,
  endNodeId,
  nodeOptions,
  isRunning,
  animationSpeed,
  currentStep,
  totalSteps,
}) => {
  const [numNodes, setNumNodes] = React.useState(6);

  return (
    <div className="bg-card p-4 rounded-lg shadow-md space-y-4">
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium">Algorithm Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="algorithm">Algorithm</Label>
            <Select onValueChange={onAlgorithmChange} value={selectedAlgorithm}>
              <SelectTrigger id="algorithm">
                <SelectValue placeholder="Select algorithm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bfs">Breadth-First Search (BFS)</SelectItem>
                <SelectItem value="dfs">Depth-First Search (DFS)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="speed">Animation Speed</Label>
            <Slider 
              id="speed"
              min={1} 
              max={10} 
              step={1} 
              value={[animationSpeed]} 
              onValueChange={(values) => onSpeedChange(values[0])}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-node">Start Node</Label>
            <Select onValueChange={onStartNodeChange} value={startNodeId} disabled={isRunning}>
              <SelectTrigger id="start-node">
                <SelectValue placeholder="Select start node" />
              </SelectTrigger>
              <SelectContent>
                {nodeOptions.map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    Node {node.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="end-node">End Node (Optional)</Label>
            <Select onValueChange={onEndNodeChange} value={endNodeId} disabled={isRunning}>
              <SelectTrigger id="end-node">
                <SelectValue placeholder="Select end node" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {nodeOptions
                  .filter((node) => node.id !== startNodeId)
                  .map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      Node {node.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium">Graph Controls</h3>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onToggleMatrixInput}
            disabled={isRunning}
          >
            <Table className="mr-2 h-4 w-4" />
            Matrix Input
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onGenerateRandom(numNodes)}
            disabled={isRunning}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Random
          </Button>
          
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              min={2}
              max={15}
              value={numNodes}
              onChange={(e) => setNumNodes(parseInt(e.target.value) || 6)}
              className="w-16"
              disabled={isRunning}
            />
            <span className="text-sm text-muted-foreground">nodes</span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClear}
            disabled={isRunning}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Graph
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSave}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Graph
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col space-y-2">
        <h3 className="text-lg font-medium">Visualization Controls</h3>
        
        <div className="flex flex-wrap gap-2">
          {!isRunning ? (
            <Button 
              variant="default" 
              size="sm" 
              onClick={onRun}
              disabled={!startNodeId}
            >
              <Play className="mr-2 h-4 w-4" />
              Run
            </Button>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              onClick={onPause}
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onStepBack}
            disabled={currentStep <= 0}
          >
            <SkipBack className="mr-2 h-4 w-4" />
            Step Back
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onStepForward}
            disabled={currentStep >= totalSteps - 1}
          >
            <SkipForward className="mr-2 h-4 w-4" />
            Step Forward
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReset}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {totalSteps > 0 ? totalSteps : 1}
        </div>
      </div>
    </div>
  );
};

export default GraphControls;
