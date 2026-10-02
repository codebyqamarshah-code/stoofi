'use client';

import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';

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
    <div className="p-6 bg-white min-h-screen text-zinc-950">
      <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-2">
        <span>Dashboard</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>General Settings</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-950 font-bold">Module Manager</span>
      </div>
      <h1 className="text-2xl font-bold text-zinc-950 mb-6">Module Manager</h1>
      
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center">
          <h2 className="text-sm font-bold text-zinc-950">Module Management</h2>
          <button className="flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm">
            <UploadCloud className="w-4 h-4" />
            UPLOAD/UPDATE MODULE
          </button>
        </div>
        
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-700 font-bold border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">SL</th>
                  <th className="px-4 py-3">NAME</th>
                  <th className="px-4 py-3 whitespace-nowrap">STATUS</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-900">
                {modules.map((mod, index) => (
                  <tr key={mod.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-4 text-zinc-600 font-semibold align-top">{index + 1}</td>
                    <td className="px-4 py-4 align-top">
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 font-bold text-zinc-950">
                             {mod.title}
                             <span className="text-[11px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">{mod.version}</span>
                             {mod.verified ? (
                               <CheckCircle2 className="w-4 h-4 text-emerald-600" title="Verified" />
                             ) : (
                               <XCircle className="w-4 h-4 text-rose-500" title="Unverified" />
                             )}
                          </div>
                          <div className="text-xs text-zinc-600 font-medium">{mod.desc}</div>
                       </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      {mod.status === 'ACTIVE' ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded border border-emerald-300">ACTIVE</span>
                      ) : (
                        <span className="bg-zinc-100 text-zinc-600 text-[10px] font-bold px-2.5 py-1 rounded border border-zinc-300">DISABLED</span>
                      )}
                    </td>
                    <td className="px-4 py-4 align-top text-right">
                       {mod.status === 'ACTIVE' ? (
                          <button 
                            type="button"
                            onClick={() => toggleStatus(mod.id)}
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-zinc-950 transition-colors focus:outline-none cursor-pointer"
                          >
                            <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition-transform shadow-xs" />
                          </button>
                       ) : (
                          <button 
                            type="button"
                            onClick={() => toggleStatus(mod.id)}
                            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300 px-3 py-1.5 rounded-lg text-xs transition-colors font-bold cursor-pointer"
                          >
                            ENABLE
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
