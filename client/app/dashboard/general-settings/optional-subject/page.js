'use client';
import React, { useState } from 'react';
import { Copy, FileSpreadsheet, FileText, Printer, Download, Columns, Search } from 'lucide-react';

export default function OptionalSubjectPage() {
  const [selectedClass, setSelectedClass] = useState('Class 1');
  const [gpaAbove, setGpaAbove] = useState('3.0');

  const classes = ['Play', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3'];

  return (
    <div className="p-6 bg-zinc-950 min-h-screen text-zinc-100 font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Assign Optional Subject</h1>
        <div className="text-sm text-zinc-400">Dashboard &gt; General Settings &gt; Assign Optional Subject</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Assign Optional Subject */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-lg shadow-sm">
            <div className="border-b border-zinc-200 px-6 py-4">
              <h2 className="text-lg font-medium text-zinc-950">Assign Optional Subject</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-950 mb-3">SELECT CLASS *</label>
                <div className="space-y-2">
                  {classes.map((cls) => (
                    <label key={cls} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="selectedClass" 
                        value={cls} 
                        checked={selectedClass === cls} 
                        onChange={() => setSelectedClass(cls)} 
                        className="w-4 h-4 text-zinc-800 bg-white border-zinc-300 text-zinc-950 focus:ring-zinc-600 focus:ring-offset-zinc-900" 
                      />
                      <span className="text-sm">{cls}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-950 mb-2">GPA ABOVE *</label>
                <input 
                  type="number" 
                  value={gpaAbove} 
                  onChange={(e) => setGpaAbove(e.target.value)} 
                  className="w-full bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600" 
                  step="0.01"
                />
              </div>

              <div className="flex justify-center pt-2">
                <button className="w-full bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-medium py-2 px-4 rounded transition-colors">
                  SAVE
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Optional Subject List */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-lg shadow-sm h-full">
            <div className="border-b border-zinc-200 px-6 py-4">
              <h2 className="text-lg font-medium text-zinc-950">Optional Subject</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex gap-2">
                  <button className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-200 rounded text-zinc-950 hover:text-zinc-950 transition-colors" title="Copy">
                    <Copy size={16} />
                  </button>
                  <button className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-200 rounded text-zinc-950 hover:text-zinc-950 transition-colors" title="Excel">
                    <FileSpreadsheet size={16} />
                  </button>
                  <button className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-200 rounded text-zinc-950 hover:text-zinc-950 transition-colors" title="CSV">
                    <FileText size={16} />
                  </button>
                  <button className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-200 rounded text-zinc-950 hover:text-zinc-950 transition-colors" title="PDF">
                    <Printer size={16} />
                  </button>
                  <button className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-200 rounded text-zinc-950 hover:text-zinc-950 transition-colors" title="Print">
                    <Printer size={16} />
                  </button>
                  <button className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-200 rounded text-zinc-950 hover:text-zinc-950 transition-colors" title="Columns">
                    <Columns size={16} />
                  </button>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-zinc-500" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="pl-9 pr-3 py-2 bg-white border border-zinc-200 shadow-xs rounded-md text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 w-full sm:w-64"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-zinc-200 rounded-md">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-950 border-b border-zinc-200">
                      <th className="p-3 text-sm font-semibold text-zinc-950">SL</th>
                      <th className="p-3 text-sm font-semibold text-zinc-950">Class Name</th>
                      <th className="p-3 text-sm font-semibold text-zinc-950">GPA Above</th>
                      <th className="p-3 text-sm font-semibold text-zinc-950">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-zinc-500 text-sm">
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
