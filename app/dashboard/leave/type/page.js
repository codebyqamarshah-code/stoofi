'use client';

import React from 'react';
import api from '@/services/api';
import { Copy, FileSpreadsheet, FileText, Printer, Download, Columns } from 'lucide-react';

export default function LeaveType() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Leave Type</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4 border-b border-zinc-800 pb-2">Add Leave Type</h2>
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-400 mb-1">TYPE NAME *</label>
                <input
                  type="text"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                SAVE TYPE
              </button>
            </form>
          </div>
        </div>

        {/* Right Card */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4 border-b border-zinc-800 pb-2">Leave Type List</h2>
            
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <input
                type="text"
                placeholder="Search..."
                className="w-full sm:w-64 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
              <div className="flex gap-2 text-zinc-400">
                <button className="p-2 hover:text-white transition-colors"><Copy size={18} /></button>
                <button className="p-2 hover:text-white transition-colors"><FileSpreadsheet size={18} /></button>
                <button className="p-2 hover:text-white transition-colors"><FileText size={18} /></button>
                <button className="p-2 hover:text-white transition-colors"><Printer size={18} /></button>
                <button className="p-2 hover:text-white transition-colors"><Download size={18} /></button>
                <button className="p-2 hover:text-white transition-colors"><Columns size={18} /></button>
              </div>
            </div>

            <div className="overflow-x-auto border border-zinc-800 rounded-lg">
              <table className="w-full text-left text-sm text-zinc-400 border-collapse">
                <thead className="bg-zinc-950 text-white border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-800 hover:bg-zinc-950/50">
                    <td className="px-4 py-3 text-white">Casual Leave</td>
                    <td className="px-4 py-3 text-right">
                      <select className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1 rounded appearance-none cursor-pointer outline-none text-center">
                        <option>SELECT</option>
                        <option>Edit</option>
                        <option>Delete</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
