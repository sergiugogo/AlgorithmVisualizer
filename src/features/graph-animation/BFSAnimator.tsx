
import React, { useEffect, useState } from 'react';
import { Graph, updateNodeStatus, updateEdgeStatus, resetGraphStatus } from '../../utils/graphUtils';
import { bfs, Step } from '../../utils/graphAlgorithms';
import GraphBoard from './GraphBoard';

interface BFSAnimatorProps {
  graph: Graph;
  startNodeId: string;
  endNodeId?: string;
  delay?: number;
}

export default function BFSAnimator({ graph, startNodeId, endNodeId, delay = 700 }: BFSAnimatorProps) {
  const [animatedGraph, setAnimatedGraph] = useState<Graph>(() => resetGraphStatus(graph));
  const [activeEdge, setActiveEdge] = useState<string | null>(null);

  useEffect(() => {
    const steps = bfs(graph, startNodeId, endNodeId);

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
    }, delay);

    return () => clearInterval(interval);
  }, [graph, startNodeId, endNodeId, delay]);

  return (
    <div>
      <GraphBoard graph={animatedGraph} activeEdge={activeEdge} />
    </div>
  );
}
