'use client';
import React, { useState } from 'react';
import { Copy, FileSpreadsheet, FileText, Printer, Download, Columns, Search, ChevronRight } from 'lucide-react';

export default function OptionalSubjectPage() {
  const [selectedClass, setSelectedClass] = useState('Class 1');
  const [gpaAbove, setGpaAbove] = useState('3.0');

  const classes = ['Play', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3'];

  return (
    <div className="p-6 bg-white min-h-screen text-zinc-950 font-sans">
      <div className="mb-6">
        <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-2">
          <span>Dashboard</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>General Settings</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-zinc-950 font-bold">Assign Optional Subject</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-950">Assign Optional Subject</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Assign Optional Subject */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs">
            <div className="border-b border-zinc-200 px-6 py-4">
              <h2 className="text-sm font-bold text-zinc-950">Assign Optional Subject</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-3">SELECT CLASS *</label>
                <div className="space-y-2">
                  {classes.map((cls) => (
                    <label key={cls} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="selectedClass" 
                        value={cls} 
                        checked={selectedClass === cls} 
                        onChange={() => setSelectedClass(cls)} 
                        className="w-4 h-4 accent-zinc-950 cursor-pointer" 
                      />
                      <span className="text-sm font-medium text-zinc-900">{cls}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">GPA ABOVE *</label>
                <input 
                  type="number" 
                  value={gpaAbove} 
                  onChange={(e) => setGpaAbove(e.target.value)} 
                  className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-sm font-medium text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600" 
                  step="0.01"
                />
              </div>

              <div className="flex justify-center pt-2">
                <button className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg shadow-sm transition-colors cursor-pointer">
                  SAVE
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Optional Subject List */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xs h-full">
            <div className="border-b border-zinc-200 px-6 py-4">
              <h2 className="text-sm font-bold text-zinc-950">Optional Subject List</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex gap-1">
                  <button className="p-2 bg-white hover:bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-700 transition-colors cursor-pointer" title="Copy">
                    <Copy size={14} />
                  </button>
                  <button className="p-2 bg-white hover:bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-700 transition-colors cursor-pointer" title="Excel">
                    <FileSpreadsheet size={14} />
                  </button>
                  <button className="p-2 bg-white hover:bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-700 transition-colors cursor-pointer" title="CSV">
                    <FileText size={14} />
                  </button>
                  <button className="p-2 bg-white hover:bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-700 transition-colors cursor-pointer" title="PDF">
                    <Download size={14} />
                  </button>
                  <button className="p-2 bg-white hover:bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-700 transition-colors cursor-pointer" title="Print">
                    <Printer size={14} />
                  </button>
                  <button className="p-2 bg-white hover:bg-zinc-50 border border-zinc-300 rounded-lg text-zinc-700 transition-colors cursor-pointer" title="Columns">
                    <Columns size={14} />
                  </button>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={14} className="text-zinc-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="pl-9 pr-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-medium text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 w-full sm:w-64"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-zinc-200 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200">
                      <th className="p-3 text-xs font-bold text-zinc-700">SL</th>
                      <th className="p-3 text-xs font-bold text-zinc-700">Class Name</th>
                      <th className="p-3 text-xs font-bold text-zinc-700">GPA Above</th>
                      <th className="p-3 text-xs font-bold text-zinc-700 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-zinc-500 text-xs font-medium">
                        No Data Available In Table
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
