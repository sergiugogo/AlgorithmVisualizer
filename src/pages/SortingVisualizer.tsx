import React, { useState, useEffect, useRef } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SortingAlgorithm = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick';

interface ArrayElement {
  value: number;
  isComparing: boolean;
  isSorted: boolean;
  isSwapping: boolean;
}

interface AnimationStep {
  array: ArrayElement[];
  description: string;
}

const SortingVisualizer: React.FC = () => {
  const [array, setArray] = useState<ArrayElement[]>([]);
  const [arraySize, setArraySize] = useState<number>(20);
  const [customInput, setCustomInput] = useState<string>('');
  const [initialArray, setInitialArray] = useState<ArrayElement[]>([]);
  const [animationSpeed, setAnimationSpeed] = useState<number>(50);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<SortingAlgorithm>('bubble');
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animationSteps, setAnimationSteps] = useState<AnimationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const animationRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Generate a random array
  const generateRandomArray = () => {
    if (isAnimating) stopAnimation();
    const newArray: ArrayElement[] = Array.from({ length: arraySize }, () => ({
      value: Math.floor(Math.random() * 100) + 5,
      isComparing: false,
      isSorted: false,
      isSwapping: false,
    }));
    setArray(newArray);
    setInitialArray(JSON.parse(JSON.stringify(newArray)));
    setAnimationSteps([]);
    setCurrentStepIndex(0);
  };

  useEffect(() => {
    generateRandomArray();
  }, [arraySize]);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    if (animationSteps.length > 0 && currentStepIndex < animationSteps.length) {
      setArray(animationSteps[currentStepIndex].array);
    }
  }, [currentStepIndex, animationSteps]);

  // 🧠 Sorting logic (bubble/selection/insertion only for brevity)
  const BubbleSortSteps = (input: ArrayElement[]): AnimationStep[] => {
    const steps: AnimationStep[] = [];
    const arrayCopy = JSON.parse(JSON.stringify(input));
    for (let i = 0; i < arrayCopy.length; i++) {
      for (let j = 0; j < arrayCopy.length - i - 1; j++) {
        arrayCopy[j].isComparing = true;
        arrayCopy[j + 1].isComparing = true;
        steps.push({ array: JSON.parse(JSON.stringify(arrayCopy)), description: `Comparing ${arrayCopy[j].value} and ${arrayCopy[j + 1].value}` });
        if (arrayCopy[j].value > arrayCopy[j + 1].value) {
          [arrayCopy[j], arrayCopy[j + 1]] = [arrayCopy[j + 1], arrayCopy[j]];
          steps.push({ array: JSON.parse(JSON.stringify(arrayCopy)), description: `Swapped` });
        }
        arrayCopy[j].isComparing = false;
        arrayCopy[j + 1].isComparing = false;
      }
      arrayCopy[arrayCopy.length - i - 1].isSorted = true;
    }
    arrayCopy.forEach(e => e.isSorted = true);
    steps.push({ array: JSON.parse(JSON.stringify(arrayCopy)), description: "Array is sorted!" });
    return steps;
  };
  // 🧠 Selection sort logic
  const selectionSortSteps = (input: ArrayElement[]): AnimationStep[] => {
    const steps: AnimationStep[] = [];
    const arr = JSON.parse(JSON.stringify(input));
  
    for (let i = 0; i < arr.length; i++) {
      let min = i;
      for (let j = i + 1; j < arr.length; j++) {
        arr[min].isComparing = true;
        arr[j].isComparing = true;
        steps.push({ array: JSON.parse(JSON.stringify(arr)), description: `Compare ${arr[min].value} and ${arr[j].value}` });
        if (arr[j].value < arr[min].value) min = j;
        arr[min].isComparing = false;
        arr[j].isComparing = false;
      }
      [arr[i], arr[min]] = [arr[min], arr[i]];
      arr[i].isSorted = true;
      steps.push({ array: JSON.parse(JSON.stringify(arr)), description: `Swapped ${arr[i].value} to correct position` });
    }
  
    arr.forEach(el => el.isSorted = true);
    steps.push({ array: JSON.parse(JSON.stringify(arr)), description: 'Array is sorted!' });
    return steps;
  };
  // 🧠 Insertion sort logic 
  const insertionSortSteps = (input: ArrayElement[]): AnimationStep[] => {
    const steps: AnimationStep[] = [];
    const arr = JSON.parse(JSON.stringify(input));
  
    for (let i = 1; i < arr.length; i++) {
      let j = i;
      while (j > 0 && arr[j - 1].value > arr[j].value) {
        arr[j].isComparing = arr[j - 1].isComparing = true;
        steps.push({ array: JSON.parse(JSON.stringify(arr)), description: `Compare ${arr[j].value} and ${arr[j - 1].value}` });
        [arr[j], arr[j - 1]] = [arr[j - 1], arr[j]];
        arr[j].isComparing = arr[j - 1].isComparing = false;
        arr[j].isSorted = true;
        steps.push({ array: JSON.parse(JSON.stringify(arr)), description: `Swapped ${arr[j].value}` });
        j--;
      }
    }
  
    arr.forEach(el => el.isSorted = true);
    steps.push({ array: JSON.parse(JSON.stringify(arr)), description: 'Array is sorted!' });
    return steps;
  };
  // 🧠 Merge sort and quick sort logic 
  const mergeSortSteps = (input: ArrayElement[]): AnimationStep[] => {
    const steps: AnimationStep[] = [];
    const arr = JSON.parse(JSON.stringify(input));
  
    const merge = (start: number, mid: number, end: number) => {
      const left = arr.slice(start, mid + 1);
      const right = arr.slice(mid + 1, end + 1);
      let i = 0, j = 0, k = start;
  
      while (i < left.length && j < right.length) {
        arr[k] = left[i].value <= right[j].value ? left[i++] : right[j++];
        arr[k].isComparing = true;
        steps.push({ array: JSON.parse(JSON.stringify(arr)), description: `Merging at index ${k}` });
        arr[k].isComparing = false;
        k++;
      }
  
      while (i < left.length) {
        arr[k++] = left[i++];
      }
  
      while (j < right.length) {
        arr[k++] = right[j++];
      }
  
      for (let t = start; t <= end; t++) arr[t].isSorted = true;
      steps.push({ array: JSON.parse(JSON.stringify(arr)), description: `Merged section sorted` });
    };
  
    const sort = (start: number, end: number) => {
      if (start >= end) return;
      const mid = Math.floor((start + end) / 2);
      sort(start, mid);
      sort(mid + 1, end);
      merge(start, mid, end);
    };
  
    sort(0, arr.length - 1);
    return steps;
  };
  
  // 🧠 Quick sort logic 
  const quickSortSteps = (input: ArrayElement[]): AnimationStep[] => {
    const steps: AnimationStep[] = [];
    const arr = JSON.parse(JSON.stringify(input));
  
    const quickSort = (low: number, high: number) => {
      if (low >= high) return;
  
      const pivot = arr[high];
      pivot.isComparing = true;
      let i = low;
  
      for (let j = low; j < high; j++) {
        arr[j].isComparing = true;
        steps.push({ array: JSON.parse(JSON.stringify(arr)), description: `Compare ${arr[j].value} with pivot ${pivot.value}` });
  
        if (arr[j].value < pivot.value) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          steps.push({ array: JSON.parse(JSON.stringify(arr)), description: `Swap ${arr[i].value} and ${arr[j].value}` });
          i++;
        }
  
        arr[j].isComparing = false;
      }
  
      [arr[i], arr[high]] = [arr[high], arr[i]];
      pivot.isComparing = false;
      arr[i].isSorted = true;
      steps.push({ array: JSON.parse(JSON.stringify(arr)), description: `Pivot ${arr[i].value} placed` });
  
      quickSort(low, i - 1);
      quickSort(i + 1, high);
    };
  
    quickSort(0, arr.length - 1);
    arr.forEach(el => el.isSorted = true);
    steps.push({ array: JSON.parse(JSON.stringify(arr)), description: 'Array is sorted!' });
    return steps;
  };
  
  const startAnimation = () => {
    if (isAnimating) return;
  
    let steps: AnimationStep[] = [];
  
    switch (selectedAlgorithm) {
      case 'bubble':
        steps = BubbleSortSteps(array);
        break;
      case 'selection':
        steps = selectionSortSteps(array);
        break;
      case 'insertion':
        steps = insertionSortSteps(array);
        break;
      case 'merge':
        steps = mergeSortSteps(array);
        break;
      case 'quick':
        steps = quickSortSteps(array);
        break;
    }
  
    if (steps.length === 0) {
      toast({ title: 'No animation steps generated' });
      return;
    }
  
    setAnimationSteps(steps);
    setCurrentStepIndex(0);
    setIsAnimating(true);
  
    animateSteps(steps);
  };
  

  const animateSteps = (steps: AnimationStep[]) => {
    let stepIndex = 0;
  
    const animate = () => {
      if (stepIndex >= steps.length) {
        setIsAnimating(false);
        toast({ title: "Sorting Complete" });
        return;
      }
  
      setCurrentStepIndex(stepIndex);
  
      const delay = 1000 - (animationSpeed * 9);
      stepIndex++;
  
      animationRef.current = window.setTimeout(() => {
        animationRef.current = requestAnimationFrame(animate);
      }, delay);
    };
  
    animate();
  };
  
  

  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
  };

  const resetToInitialArray = () => {
    if (initialArray.length > 0) {
      stopAnimation();
      const restored = initialArray.map(el => ({
        ...el,
        isComparing: false,
        isSorted: false,
        isSwapping: false,
      }));
      setArray(restored);
      setAnimationSteps([]);
      setCurrentStepIndex(0);
    }
  };
  
  const setCustomArray = () => {
    const parsed = customInput
      .split(',')
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n));

    if (parsed.length === 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a comma-separated list of numbers.",
        variant: "destructive"
      });
      return;
    }

    const newArray = parsed.map(value => ({
      value,
      isComparing: false,
      isSorted: false,
      isSwapping: false
    }));

    stopAnimation();
    setArray(newArray);
    setInitialArray(JSON.parse(JSON.stringify(newArray)));
    setAnimationSteps([]);
    setCurrentStepIndex(0);
    setArraySize(parsed.length);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Sorting Algorithm Visualizer</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Visualization</CardTitle>
              <CardDescription>
                Watch how the {selectedAlgorithm.toUpperCase()} Sort works.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-center space-x-1">
                {array.map((item, index) => (
                  <div
                    key={index}
                    className={`w-full ${item.isComparing ? 'bg-yellow-500' : item.isSwapping ? 'bg-red-500' : item.isSorted ? 'bg-green-500' : 'bg-blue-500'} transition-all duration-200`}
                    style={{
                      height: `${(item.value / 100) * 100}%`,
                      maxWidth: `${900 / arraySize}px`
                    }}
                  ></div>
                ))}
              </div>
              {animationSteps.length > 0 && currentStepIndex < animationSteps.length && (
                <div className="mt-4 p-3 bg-muted rounded-md text-center">
                  {animationSteps[currentStepIndex].description}
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
                <Label>Algorithm</Label>
                <Select
                  value={selectedAlgorithm}
                  onValueChange={(v) => setSelectedAlgorithm(v as SortingAlgorithm)}
                  disabled={isAnimating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bubble">Bubble Sort</SelectItem>
                    <SelectItem value="selection">Selection Sort</SelectItem>
                    <SelectItem value="insertion">Insertion Sort</SelectItem>
                    <SelectItem value="merge">Merge Sort </SelectItem>
                    <SelectItem value="quick">Quick Sort </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Array Size: {arraySize}</Label>
                <Slider
                  min={5}
                  max={100}
                  value={[arraySize]}
                  onValueChange={(v) => setArraySize(v[0])}
                  disabled={isAnimating}
                />
              </div>

              <div className="space-y-2">
                <Label>Animation Speed</Label>
                <Slider
                  min={1}
                  max={100}
                  value={[animationSpeed]}
                  onValueChange={(v) => setAnimationSpeed(v[0])}
                />
              </div>

              {/* 🆕 Custom input */}
              <div className="space-y-2">
                <Label>Custom Array</Label>
                <Input
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="e.g. 5, 3, 8, 1"
                  disabled={isAnimating}
                />
                <Button onClick={setCustomArray} variant="secondary" disabled={isAnimating}>
                  Set Custom Array
                </Button>
                <Button onClick={resetToInitialArray} variant="outline" disabled={isAnimating || initialArray.length === 0}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset to Initial Array
                  </Button>

              </div>

              <div className="flex flex-col space-y-2">
                <Button onClick={generateRandomArray} variant="outline" disabled={isAnimating}>
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
        </div>
      </div>
    </div>
  );
};

export default SortingVisualizer;
