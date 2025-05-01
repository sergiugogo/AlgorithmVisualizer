import React, { useEffect, useState } from 'react';
import { Graph, updateNodeStatus, updateEdgeStatus, resetGraphStatus } from '../../utils/graphUtils';
import { dijkstra, Step } from '../../utils/graphAlgorithms';
import GraphBoard from './GraphBoard';

interface DijkstraAnimatorProps {
  graph: Graph;
  startNodeId: string;
}

export default function DijkstraAnimator({ graph, startNodeId }: DijkstraAnimatorProps) {
  const [animatedGraph, setAnimatedGraph] = useState<Graph>(() => resetGraphStatus(graph));
  const [activeEdge, setActiveEdge] = useState<string | null>(null);

  useEffect(() => {
    const steps = dijkstra(graph, startNodeId);
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

        if (step.nodeId) {
          updated = updateNodeStatus(updated, step.nodeId, step.type === 'visit-node' ? 'active' : 'visited');
        }

        if (step.edgeId) {
          updated = updateEdgeStatus(updated, step.edgeId, 'active');
          setActiveEdge(step.edgeId);
        }

        return updated;
      });

      i++;
    }, 700);

    return () => clearInterval(interval);
  }, [graph, startNodeId]);

  return <GraphBoard graph={animatedGraph} activeEdge={activeEdge} />;
}
