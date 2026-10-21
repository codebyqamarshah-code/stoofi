import React from 'react';

export function Spinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
    </div>
  );
}

export default Spinner;
