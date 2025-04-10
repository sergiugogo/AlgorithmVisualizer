
import React from 'react';
import { Button } from '@/components/ui/button';
import { Step } from '../utils/graphAlgorithms';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, SkipForward, SkipBack, RefreshCw } from 'lucide-react';

interface VisualizationControlsProps {
  isRunning: boolean;
  currentStep: number;
  steps: Step[];
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onReset: () => void;
}

const VisualizationControls: React.FC<VisualizationControlsProps> = ({
  isRunning,
  currentStep,
  steps,
  onPlay,
  onPause,
  onStepForward,
  onStepBack,
  onReset,
}) => {
  const currentStepData = steps[currentStep];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Algorithm Progress</h3>
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
        
        <div className="flex space-x-2">
          {!isRunning ? (
            <Button 
              size="sm" 
              onClick={onPlay}
              disabled={currentStep >= steps.length - 1}
            >
              <Play className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              size="sm" 
              onClick={onPause}
            >
              <Pause className="h-4 w-4" />
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onStepBack}
            disabled={currentStep <= 0}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onStepForward}
            disabled={currentStep >= steps.length - 1}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReset}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="relative w-full bg-secondary rounded-full h-2.5">
        <div 
          className="bg-primary h-2.5 rounded-full transition-all" 
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          {currentStepData ? (
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-sm font-medium">{currentStepData.description}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {currentStepData.type === 'visit-node' && (
                  <span>Visiting node {currentStepData.nodeId}</span>
                )}
                {currentStepData.type === 'explore-edge' && (
                  <span>Exploring edge {currentStepData.edgeId}</span>
                )}
                {currentStepData.type === 'complete-node' && (
                  <span>Completed processing node {currentStepData.nodeId}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Select an algorithm and start node to begin visualization
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VisualizationControls;
