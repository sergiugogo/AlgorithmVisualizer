import React, { useEffect, useState } from 'react';
import { Graph, updateNodeStatus, updateEdgeStatus, resetGraphStatus } from '../../utils/graphUtils';
import { aStar } from '../../utils/graphAlgorithms';
import GraphBoard from './GraphBoard';

interface AStarAnimatorProps {
  graph: Graph;
  startNodeId: string;
  endNodeId: string;
}

export default function AStarAnimator({ graph, startNodeId, endNodeId }: AStarAnimatorProps) {
  const [animatedGraph, setAnimatedGraph] = useState<Graph>(() => resetGraphStatus(graph));
  const [activeEdge, setActiveEdge] = useState<string | null>(null);

  useEffect(() => {
    const steps = aStar(graph, startNodeId, endNodeId);
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
          const status =
            step.type === 'visit-node' ? 'active' :
            step.type === 'complete-node' ? 'visited' : 'default';
          updated = updateNodeStatus(updated, step.nodeId, status);
        }

        if (step.edgeId) {
          updated = updateEdgeStatus(updated, step.edgeId, 'active');
          setActiveEdge(step.edgeId);
        }

        return updated;
      });

      i++;
    }, 600);

    return () => clearInterval(interval);
  }, [graph, startNodeId, endNodeId]);

  return <GraphBoard graph={animatedGraph} activeEdge={activeEdge} />;
}
