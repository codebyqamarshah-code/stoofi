'use client';
import { Construction } from 'lucide-react';

export default function EmptyPage({ title, description, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="h-20 w-20 rounded-2xl bg-zinc-100 border border-zinc-600/20 flex items-center justify-center mb-6">
        {Icon ? (
          <Icon className="h-10 w-10 text-zinc-600" />
        ) : (
          <Construction className="h-10 w-10 text-zinc-600" />
        )}
      </div>
      <h1 className="text-2xl font-bold text-zinc-100 mb-2">{title}</h1>
      <p className="text-zinc-500 text-sm max-w-md">
        {description || 'This section is ready. Add records to see them here.'}
      </p>
    </div>
  );
}
