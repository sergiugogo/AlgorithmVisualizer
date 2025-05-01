import React, { useEffect, useState } from 'react';
import { Graph, updateNodeStatus, updateEdgeStatus, resetGraphStatus } from '../../utils/graphUtils';
import { bellmanFord } from '../../utils/graphAlgorithms';
import GraphBoard from './GraphBoard';

interface BellmanFordAnimatorProps {
  graph: Graph;
  startNodeId: string;
}

export default function BellmanFordAnimator({ graph, startNodeId }: BellmanFordAnimatorProps) {
  const [animatedGraph, setAnimatedGraph] = useState<Graph>(() => resetGraphStatus(graph));
  const [activeEdge, setActiveEdge] = useState<string | null>(null);

  useEffect(() => {
    const steps = bellmanFord(graph, startNodeId);
    let i = 0;

    const interval = setInterval(() => {
      if (i >= steps.length) {
        clearInterval(interval);
        setActiveEdge(null);
        return;
      }

      const step = steps[i];

      setAnimatedGraph((prev) => {
        let updated = { ...prev };

        // ✅ Always mark node as visited (no blinking)
        if (step.nodeId) {
          updated = updateNodeStatus(updated, step.nodeId, 'visited');
        }

        // Highlight the active edge
        if (step.edgeId) {
          updated = updateEdgeStatus(updated, step.edgeId, 'active');
          setActiveEdge(step.edgeId);
        }

        return updated;
      });

      i++;
    }, 600);

    return () => clearInterval(interval);
  }, [graph, startNodeId]);

  return <GraphBoard graph={animatedGraph} activeEdge={activeEdge} />;
}
