import React from 'react';

interface NodeProps {
  id: string;
  x: number;
  y: number;
  label?: string;
  status?: 'default' | 'active' | 'visited' | 'start' | 'end';
}

const getColor = (status?: NodeProps['status']) => {
  switch (status) {
    case 'start':
      return 'bg-orange-500';
    case 'end':
      return 'bg-red-500';
    case 'active':
      return 'bg-purple-500 animate-pulse';
    case 'visited':
      return 'bg-green-500';
    default:
      return 'bg-blue-500';
  }
};

export default function Node({ id, x, y, label, status }: NodeProps) {
  return (
    <div
      className={`absolute rounded-full w-10 h-10 text-white font-bold flex items-center justify-center shadow-lg transition-all duration-300 ${getColor(status)}`}
      style={{ left: x - 20, top: y - 20 }}
    >
      {label ?? id}
    </div>
  );
}
