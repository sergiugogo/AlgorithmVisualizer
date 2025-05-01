import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="p-6 max-w-xl w-full bg-white shadow-lg rounded-lg space-y-6 text-center">
        <h1 className="text-3xl font-bold">Algorithm Visualizer</h1>
        <p className="text-gray-600">Choose what you'd like to explore:</p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/sorting')}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
          >
            Sorting Algorithms
          </button>

          <button
            onClick={() => navigate('/input')}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded hover:bg-green-700"
          >
            Graph Traversal
          </button>
        </div>
      </div>
    </div>
  );
}
