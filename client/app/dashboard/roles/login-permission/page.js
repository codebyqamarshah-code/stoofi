'use client';

import React from 'react';
import api from '@/services/api';
import { Copy, FileSpreadsheet, FileText, Printer, Download, Columns } from 'lucide-react';

export default function LoginPermission() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Login Permission</h1>
      </div>

      <div className="flex flex-col gap-6">
        {/* Top Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4 border-b border-zinc-800 pb-2">Select Criteria</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="w-full sm:w-1/2">
              <label className="block text-sm font-medium text-zinc-400 mb-1">Select Role *</label>
              <select className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-zinc-900 dark:text-zinc-900 font-medium focus:outline-none focus:border-zinc-600" required>
                <option value="">Select Role</option>
                {['Admin', 'Principal', 'Teacher', 'Staff', 'Accountant', 'Librarian', 'Student', 'Parent'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <button className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-800 text-white font-medium py-2 px-6 rounded-md transition-colors">
              SEARCH
            </button>
          </div>
        </div>

        {/* Bottom Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4 border-b border-zinc-800 pb-2">Login Access Control List</h2>
          
          <div className="flex justify-end mb-4 gap-2 text-zinc-400">
            <button className="p-2 hover:text-white transition-colors"><Copy size={18} /></button>
            <button className="p-2 hover:text-white transition-colors"><FileSpreadsheet size={18} /></button>
            <button className="p-2 hover:text-white transition-colors"><FileText size={18} /></button>
            <button className="p-2 hover:text-white transition-colors"><Printer size={18} /></button>
            <button className="p-2 hover:text-white transition-colors"><Download size={18} /></button>
            <button className="p-2 hover:text-white transition-colors"><Columns size={18} /></button>
          </div>

          <div className="overflow-x-auto border border-zinc-800 rounded-lg">
            <table className="w-full text-left text-sm text-zinc-400 border-collapse">
              <thead className="bg-zinc-950 text-white border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Access</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="3" className="px-4 py-8 text-center">No Data Available in Table</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
