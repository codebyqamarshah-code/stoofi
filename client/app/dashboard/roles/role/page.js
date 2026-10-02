'use client';

import React from 'react';
import api from '@/services/api';
import { Copy, FileSpreadsheet, FileText, Printer, Download, Columns } from 'lucide-react';

export default function RolePermission() {
  return (
    <div className="space-y-6 text-zinc-950 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Role Permission</h1>
        <div className="text-sm text-zinc-400">Dashboard &gt; Role Permission &gt; Role</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4 border-b border-zinc-200 pb-2">Add Role</h2>
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-900 font-semibold mb-1">NAME *</label>
                <input
                  type="text"
                  className="w-full bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-zinc-950 focus:outline-none focus:border-zinc-600"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-medium py-2 px-4 rounded-md transition-colors"
              >
                SAVE
              </button>
            </form>
          </div>
        </div>

        {/* Right Card */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-zinc-200 shadow-xs rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4 border-b border-zinc-200 pb-2">Role List</h2>
            
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <input
                type="text"
                placeholder="Search..."
                className="w-full sm:w-64 bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-zinc-950 focus:outline-none focus:border-zinc-600"
              />
              <div className="flex gap-2 text-zinc-400">
                <button className="p-2 hover:text-zinc-950 transition-colors"><Copy size={18} /></button>
                <button className="p-2 hover:text-zinc-950 transition-colors"><FileSpreadsheet size={18} /></button>
                <button className="p-2 hover:text-zinc-950 transition-colors"><FileText size={18} /></button>
                <button className="p-2 hover:text-zinc-950 transition-colors"><Printer size={18} /></button>
                <button className="p-2 hover:text-zinc-950 transition-colors"><Download size={18} /></button>
                <button className="p-2 hover:text-zinc-950 transition-colors"><Columns size={18} /></button>
              </div>
            </div>

            <div className="overflow-x-auto border border-zinc-200 rounded-lg">
              <table className="w-full text-left text-sm text-zinc-400 border-collapse">
                <thead className="bg-zinc-50 text-zinc-950 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-200 hover:bg-zinc-50/80">
                    <td className="px-4 py-3 text-zinc-950">Admin</td>
                    <td className="px-4 py-3">System</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <button className="bg-zinc-800 hover:bg-zinc-100 text-zinc-950 text-xs px-3 py-1 rounded">SELECT</button>
                        <button className="bg-zinc-800 hover:bg-zinc-100 text-zinc-950 text-xs px-3 py-1 rounded w-full sm:w-auto">ASSIGN PERMISSION</button>
                      </div>
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
