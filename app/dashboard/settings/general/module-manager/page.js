'use client';

import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, XCircle } from 'lucide-react';

export default function ModuleManager() {
  const [modules, setModules] = useState([
    { id: 1, title: 'Zoom Integration', version: 'v1.0.2', desc: 'Allows live virtual classes via Zoom', verified: true, status: 'ACTIVE' },
    { id: 2, title: 'Online Exam', version: 'v2.1.0', desc: 'Conduct online examinations securely', verified: true, status: 'ACTIVE' },
    { id: 3, title: 'Parent Registration', version: 'v1.0.0', desc: 'Allow parents to self-register', verified: true, status: 'DISABLE' },
    { id: 4, title: 'RazorPay Gateway', version: 'v1.5.2', desc: 'Indian payment gateway support', verified: false, status: 'DISABLE' },
    { id: 5, title: 'SMS Alerts Pro', version: 'v3.0.1', desc: 'Advanced SMS notification system', verified: true, status: 'ACTIVE' },
  ]);

  const toggleStatus = (id) => {
    setModules(modules.map(mod => mod.id === id ? { ...mod, status: mod.status === 'ACTIVE' ? 'DISABLE' : 'ACTIVE' } : mod));
  };

  return (
    <div className="p-6 bg-zinc-950 min-h-screen text-zinc-100">
      <h1 className="text-2xl font-semibold mb-6">Module manage</h1>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-medium">Module manage</h2>
          <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded text-sm transition-colors">
            <UploadCloud className="w-4 h-4" />
            UPLOAD/UPDATE MODULE
          </button>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-800/50 text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium border-b border-zinc-800 whitespace-nowrap">SL</th>
                  <th className="px-4 py-3 font-medium border-b border-zinc-800">NAME</th>
                  <th className="px-4 py-3 font-medium border-b border-zinc-800 whitespace-nowrap">STATUS</th>
                  <th className="px-4 py-3 font-medium border-b border-zinc-800 whitespace-nowrap text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {modules.map((mod, index) => (
                  <tr key={mod.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-4 text-zinc-300 align-top">{index + 1}</td>
                    <td className="px-4 py-4 align-top">
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 font-medium text-zinc-100">
                             {mod.title}
                             <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">{mod.version}</span>
                             {mod.verified ? (
                               <CheckCircle2 className="w-4 h-4 text-emerald-500" title="Verified" />
                             ) : (
                               <XCircle className="w-4 h-4 text-red-500" title="Unverified" />
                             )}
                          </div>
                          <div className="text-xs text-zinc-400">{mod.desc}</div>
                       </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      {mod.status === 'ACTIVE' ? (
                        <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-1 rounded border border-emerald-500/20 font-medium">ACTIVE</span>
                      ) : (
                        <span className="bg-zinc-800 text-zinc-400 text-[10px] px-2 py-1 rounded border border-zinc-700 font-medium">DISABLE</span>
                      )}
                    </td>
                    <td className="px-4 py-4 align-top text-right">
                       {mod.status === 'ACTIVE' ? (
                          <button 
                            onClick={() => toggleStatus(mod.id)}
                            className="relative inline-flex h-5 w-9 items-center rounded-full bg-emerald-600 transition-colors focus:outline-none"
                          >
                            <span className="inline-block h-4 w-4 translate-x-4 transform rounded-full bg-white transition-transform" />
                          </button>
                       ) : (
                          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs transition-colors font-medium">
                            BUY NOW
                          </button>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
