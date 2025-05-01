import React from 'react';

interface EdgeProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  active?: boolean;
}

export default function Edge({ from, to, active }: EdgeProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return (
    <div
      className={`absolute h-1 origin-left transition-all duration-300 ${active ? 'bg-yellow-400' : 'bg-gray-400'}`}
      style={{
        left: from.x,
        top: from.y,
        width: length,
        transform: `rotate(${angle}deg)`,
      }}
    />
  );
}
