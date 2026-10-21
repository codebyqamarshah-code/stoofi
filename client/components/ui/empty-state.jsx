import React from 'react';

export function EmptyState({ message = 'No records found.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-zinc-500">
      <p>{message}</p>
    </div>
  );
}

export default EmptyState;
