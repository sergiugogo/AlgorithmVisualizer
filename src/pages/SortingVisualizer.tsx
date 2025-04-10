import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, RefreshCw, BarChart2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sorting algorithm types
type SortingAlgorithm = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick';

// Array element interface for visualization
interface ArrayElement {
  value: number;
  isComparing: boolean;
  isSorted: boolean;
  isSwapping: boolean;
}

// Animation step interface
interface AnimationStep {
  array: ArrayElement[];
  description: string;
}

const SortingVisualizer: React.FC = () => {
  const [array, setArray] = useState<ArrayElement[]>([]);
  const [arraySize, setArraySize] = useState<number>(20);
  const [animationSpeed, setAnimationSpeed] = useState<number>(50);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<SortingAlgorithm>('bubble');
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animationSteps, setAnimationSteps] = useState<AnimationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const animationRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Algorithm descriptions
  const algorithmDescriptions: Record<SortingAlgorithm, string> = {
    bubble: "Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they're in the wrong order.",
    selection: "Selection Sort finds the minimum element in the unsorted part and places it at the beginning.",
    insertion: "Insertion Sort builds the final sorted array one item at a time by comparing each with the items before it.",
    merge: "Merge Sort divides the array into halves, sorts them recursively, then merges the sorted halves.",
    quick: "Quick Sort selects a 'pivot' element and partitions the array so elements less than the pivot come before it."
  };

  // Generate random array
  const generateRandomArray = () => {
    if (isAnimating) {
      stopAnimation();
    }
    
    const newArray: ArrayElement[] = [];
    for (let i = 0; i < arraySize; i++) {
      newArray.push({
        value: Math.floor(Math.random() * 100) + 5,
        isComparing: false,
        isSorted: false,
        isSwapping: false
      });
    }
    setArray(newArray);
    setAnimationSteps([]);
    setCurrentStepIndex(0);
  };

  // Initialize array on component mount and when array size changes
  useEffect(() => {
    generateRandomArray();
  }, [arraySize]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Update array display with current animation step
  useEffect(() => {
    if (animationSteps.length > 0 && currentStepIndex < animationSteps.length) {
      setArray(animationSteps[currentStepIndex].array);
    }
  }, [currentStepIndex, animationSteps]);

  // Generate steps for bubble sort
  const generateBubbleSortSteps = (inputArray: ArrayElement[]): AnimationStep[] => {
    const steps: AnimationStep[] = [];
    const arrayCopy = JSON.parse(JSON.stringify(inputArray));
    
    steps.push({
      array: JSON.parse(JSON.stringify(arrayCopy)),
      description: "Starting Bubble Sort"
    });

    for (let i = 0; i < arrayCopy.length; i++) {
      for (let j = 0; j < arrayCopy.length - i - 1; j++) {
        // Mark elements being compared
        arrayCopy[j].isComparing = true;
        arrayCopy[j + 1].isComparing = true;
        
        steps.push({
          array: JSON.parse(JSON.stringify(arrayCopy)),
          description: `Comparing ${arrayCopy[j].value} and ${arrayCopy[j + 1].value}`
        });
        
        // If elements need to be swapped
        if (arrayCopy[j].value > arrayCopy[j + 1].value) {
          arrayCopy[j].isSwapping = true;
          arrayCopy[j + 1].isSwapping = true;
          
          steps.push({
            array: JSON.parse(JSON.stringify(arrayCopy)),
            description: `Swapping ${arrayCopy[j].value} and ${arrayCopy[j + 1].value}`
          });
          
          // Swap the elements
          const temp = { ...arrayCopy[j] };
          arrayCopy[j] = { ...arrayCopy[j + 1] };
          arrayCopy[j + 1] = temp;
          
          // Keep the swapping status for visual effect
          arrayCopy[j].isSwapping = true;
          arrayCopy[j + 1].isSwapping = true;
          
          steps.push({
            array: JSON.parse(JSON.stringify(arrayCopy)),
            description: `Swapped ${arrayCopy[j].value} and ${arrayCopy[j + 1].value}`
          });
        }
        
        // Reset comparing and swapping flags
        arrayCopy[j].isComparing = false;
        arrayCopy[j + 1].isComparing = false;
        arrayCopy[j].isSwapping = false;
        arrayCopy[j + 1].isSwapping = false;
      }
      
      // Mark the last element in the current iteration as sorted
      arrayCopy[arrayCopy.length - i - 1].isSorted = true;
      
      steps.push({
        array: JSON.parse(JSON.stringify(arrayCopy)),
        description: `Element ${arrayCopy[arrayCopy.length - i - 1].value} is now in the correct position`
      });
    }
    
    // Mark all elements as sorted at the end
    for (let i = 0; i < arrayCopy.length; i++) {
      arrayCopy[i].isSorted = true;
    }
    
    steps.push({
      array: JSON.parse(JSON.stringify(arrayCopy)),
      description: "Array is sorted!"
    });
    
    return steps;
  };

  // Generate steps for selection sort
  const generateSelectionSortSteps = (inputArray: ArrayElement[]): AnimationStep[] => {
    const steps: AnimationStep[] = [];
    const arrayCopy = JSON.parse(JSON.stringify(inputArray));
    
    steps.push({
      array: JSON.parse(JSON.stringify(arrayCopy)),
      description: "Starting Selection Sort"
    });

    for (let i = 0; i < arrayCopy.length - 1; i++) {
      let minIndex = i;
      
      // Mark current position
      arrayCopy[i].isComparing = true;
      
      steps.push({
        array: JSON.parse(JSON.stringify(arrayCopy)),
        description: `Finding minimum element to place at position ${i}`
      });
      
      for (let j = i + 1; j < arrayCopy.length; j++) {
        // Mark element being compared
        arrayCopy[j].isComparing = true;
        
        steps.push({
          array: JSON.parse(JSON.stringify(arrayCopy)),
          description: `Comparing ${arrayCopy[minIndex].value} with ${arrayCopy[j].value}`
        });
        
        if (arrayCopy[j].value < arrayCopy[minIndex].value) {
          // Reset previous minimum
          if (minIndex !== i) {
            arrayCopy[minIndex].isComparing = false;
          }
          
          minIndex = j;
          steps.push({
            array: JSON.parse(JSON.stringify(arrayCopy)),
            description: `Found new minimum: ${arrayCopy[j].value}`
          });
        } else {
          // Reset comparison highlight for this element
          arrayCopy[j].isComparing = false;
        }
      }
      
      // Swap elements if needed
      if (minIndex !== i) {
        arrayCopy[i].isSwapping = true;
        arrayCopy[minIndex].isSwapping = true;
        
        steps.push({
          array: JSON.parse(JSON.stringify(arrayCopy)),
          description: `Swapping ${arrayCopy[i].value} and ${arrayCopy[minIndex].value}`
        });
        
        // Perform swap
        const temp = { ...arrayCopy[i] };
        arrayCopy[i] = { ...arrayCopy[minIndex] };
        arrayCopy[minIndex] = temp;
        
        // Keep the swapping flag for visualization
        arrayCopy[i].isSwapping = true;
        arrayCopy[minIndex].isSwapping = true;
        
        steps.push({
          array: JSON.parse(JSON.stringify(arrayCopy)),
          description: `Swapped ${arrayCopy[i].value} and ${arrayCopy[minIndex].value}`
        });
        
        // Reset swapping flags
        arrayCopy[minIndex].isSwapping = false;
      }
      
      // Reset comparing flags
      for (let j = i; j < arrayCopy.length; j++) {
        arrayCopy[j].isComparing = false;
      }
      
      // Mark current position as sorted
      arrayCopy[i].isSorted = true;
      arrayCopy[i].isSwapping = false;
      
      steps.push({
        array: JSON.parse(JSON.stringify(arrayCopy)),
        description: `Element ${arrayCopy[i].value} is now in the correct position`
      });
    }
    
    // Mark the last element as sorted
    arrayCopy[arrayCopy.length - 1].isSorted = true;
    
    steps.push({
      array: JSON.parse(JSON.stringify(arrayCopy)),
      description: "Array is sorted!"
    });
    
    return steps;
  };

  // Generate steps for insertion sort
  const generateInsertionSortSteps = (inputArray: ArrayElement[]): AnimationStep[] => {
    const steps: AnimationStep[] = [];
    const arrayCopy = JSON.parse(JSON.stringify(inputArray));
    
    steps.push({
      array: JSON.parse(JSON.stringify(arrayCopy)),
      description: "Starting Insertion Sort"
    });
    
    // Mark first element as sorted
    arrayCopy[0].isSorted = true;
    
    steps.push({
      array: JSON.parse(JSON.stringify(arrayCopy)),
      description: "First element is already in sorted position"
    });
    
    for (let i = 1; i < arrayCopy.length; i++) {
      // Current element to be inserted
      const current = { ...arrayCopy[i] };
      arrayCopy[i].isComparing = true;
      
      steps.push({
        array: JSON.parse(JSON.stringify(arrayCopy)),
        description: `Inserting element ${current.value} into the sorted portion`
      });
      
      let j = i - 1;
      
      // Find position to insert current element
      while (j >= 0 && arrayCopy[j].value > current.value) {
        arrayCopy[j].isComparing = true;
        
        steps.push({
          array: JSON.parse(JSON.stringify(arrayCopy)),
          description: `Comparing ${current.value} with ${arrayCopy[j].value}`
        });
        
        // Move element one position ahead
        arrayCopy[j + 1] = { ...arrayCopy[j], isSwapping: true };
        arrayCopy[j].isSwapping = true;
        
        steps.push({
          array: JSON.parse(JSON.stringify(arrayCopy)),
          description: `Moving ${arrayCopy[j].value} one position ahead`
        });
        
        arrayCopy[j].isComparing = false;
        j--;
      }
      
      // Insert the current element
      arrayCopy[j + 1] = { ...current, isSorted: true, isComparing: false, isSwapping: false };
      
      // Mark all elements in the sorted portion
      for (let k = 0; k <= i; k++) {
        arrayCopy[k].isSorted = true;
        arrayCopy[k].isSwapping = false;
      }
      
      steps.push({
        array: JSON.parse(JSON.stringify(arrayCopy)),
        description: `Inserted ${current.value} into the correct position`
      });
    }
    
    steps.push({
      array: JSON.parse(JSON.stringify(arrayCopy)),
      description: "Array is sorted!"
    });
    
    return steps;
  };

  // Start animation for the selected algorithm
  const startAnimation = () => {
    if (isAnimating) return;
    
    let steps: AnimationStep[] = [];
    
    // Generate steps based on selected algorithm
    switch (selectedAlgorithm) {
      case 'bubble':
        steps = generateBubbleSortSteps(array);
        break;
      case 'selection':
        steps = generateSelectionSortSteps(array);
        break;
      case 'insertion':
        steps = generateInsertionSortSteps(array);
        break;
      case 'merge':
        toast({
          title: "Coming Soon",
          description: "Merge Sort visualization is coming soon!",
        });
        return;
      case 'quick':
        toast({
          title: "Coming Soon",
          description: "Quick Sort visualization is coming soon!",
        });
        return;
    }
    
    setAnimationSteps(steps);
    setCurrentStepIndex(0);
    setIsAnimating(true);
    
    // Start animation loop
    animateSteps();
  };

  // Animate steps with proper timing
  const animateSteps = () => {
    let stepIndex = currentStepIndex;
    
    const animate = () => {
      if (stepIndex < animationSteps.length - 1) {
        stepIndex++;
        setCurrentStepIndex(stepIndex);
        
        // Calculate delay based on animation speed (inverse relationship)
        const delay = 1000 - (animationSpeed * 9);
        animationRef.current = window.setTimeout(() => {
          animationRef.current = requestAnimationFrame(animate);
        }, delay);
      } else {
        setIsAnimating(false);
        toast({
          title: "Sorting Complete",
          description: `${selectedAlgorithm.charAt(0).toUpperCase() + selectedAlgorithm.slice(1)} Sort completed successfully!`,
        });
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // Stop ongoing animation
  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Sorting Algorithm Visualizer</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Visualization</CardTitle>
              <CardDescription>
                Watch how the {selectedAlgorithm.charAt(0).toUpperCase() + selectedAlgorithm.slice(1)} Sort algorithm works
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-center space-x-1">
                {array.map((item, index) => (
                  <div
                    key={index}
                    className={`w-full ${
                      item.isComparing ? 'bg-yellow-500' : 
                      item.isSwapping ? 'bg-red-500' : 
                      item.isSorted ? 'bg-green-500' : 
                      'bg-blue-500'
                    } transition-all duration-200`}
                    style={{ 
                      height: `${(item.value / 100) * 100}%`,
                      maxWidth: `${900 / arraySize}px`
                    }}
                  ></div>
                ))}
              </div>
              
              {animationSteps.length > 0 && currentStepIndex < animationSteps.length && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-center">
                    {animationSteps[currentStepIndex].description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="algorithm">Algorithm</Label>
                <Select
                  value={selectedAlgorithm}
                  onValueChange={(value: string) => setSelectedAlgorithm(value as SortingAlgorithm)}
                  disabled={isAnimating}
                >
                  <SelectTrigger id="algorithm">
                    <SelectValue placeholder="Select Algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bubble">Bubble Sort</SelectItem>
                    <SelectItem value="selection">Selection Sort</SelectItem>
                    <SelectItem value="insertion">Insertion Sort</SelectItem>
                    <SelectItem value="merge">Merge Sort (Coming Soon)</SelectItem>
                    <SelectItem value="quick">Quick Sort (Coming Soon)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="array-size">Array Size: {arraySize}</Label>
                </div>
                <Slider
                  id="array-size"
                  min={5}
                  max={100}
                  step={1}
                  value={[arraySize]}
                  onValueChange={(value) => setArraySize(value[0])}
                  disabled={isAnimating}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="animation-speed">Animation Speed</Label>
                </div>
                <Slider
                  id="animation-speed"
                  min={1}
                  max={100}
                  step={1}
                  value={[animationSpeed]}
                  onValueChange={(value) => setAnimationSpeed(value[0])}
                />
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={generateRandomArray}
                  variant="outline"
                  disabled={isAnimating}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate New Array
                </Button>
                
                {!isAnimating ? (
                  <Button onClick={startAnimation}>
                    <Play className="mr-2 h-4 w-4" />
                    Start Sorting
                  </Button>
                ) : (
                  <Button onClick={stopAnimation} variant="destructive">
                    <Pause className="mr-2 h-4 w-4" />
                    Stop Animation
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Algorithm Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="font-medium">
                  {selectedAlgorithm.charAt(0).toUpperCase() + selectedAlgorithm.slice(1)} Sort
                </h3>
                <p className="text-sm text-muted-foreground">
                  {algorithmDescriptions[selectedAlgorithm]}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SortingVisualizer;
