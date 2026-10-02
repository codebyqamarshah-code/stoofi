'use client';

import React from 'react';
import api from '@/services/api';
import { Copy, FileSpreadsheet, FileText, Printer, Download, Columns } from 'lucide-react';

export default function ApplyLeave() {
  return (
    <div className="space-y-6 text-zinc-950 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Apply Leave</h1>
      </div>

      <div className="flex flex-col gap-6">
        {/* Top Card */}
        <div className="bg-white border border-zinc-200 shadow-xs rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4 border-b border-zinc-200 pb-2">My Remaining Leaves</h2>
          <div className="overflow-x-auto border border-zinc-200 rounded-lg">
            <table className="w-full text-left text-sm text-zinc-400 border-collapse">
              <thead className="bg-zinc-50 text-zinc-950 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3 font-medium">TYPE</th>
                  <th className="px-4 py-3 font-medium">REMAINING DAYS</th>
                  <th className="px-4 py-3 font-medium">EXTRA TAKEN</th>
                  <th className="px-4 py-3 font-medium">LEAVE TAKEN</th>
                  <th className="px-4 py-3 font-medium">LEAVE DAYS</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-200 hover:bg-zinc-50/80">
                  <td className="px-4 py-3 text-zinc-950">Annual</td>
                  <td className="px-4 py-3">0</td>
                  <td className="px-4 py-3">0</td>
                  <td className="px-4 py-3">0</td>
                  <td className="px-4 py-3">0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bottom Left Card */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-zinc-200 shadow-xs rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4 border-b border-zinc-200 pb-2">Add Apply Leave</h2>
              <form>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-zinc-900 font-semibold mb-1">APPLY DATE *</label>
                  <input type="date" className="w-full bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-zinc-950 focus:outline-none focus:border-zinc-600" required />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-zinc-900 font-semibold mb-1">Leave Type *</label>
                  <select className="w-full bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-zinc-950 focus:outline-none focus:border-zinc-600" required>
                    <option value="">Select Leave Type</option>
                    <option value="casual">Casual Leave</option>
                    <option value="medical">Medical / Sick Leave</option>
                    <option value="annual">Annual Leave</option>
                    <option value="maternity">Maternity Leave</option>
                    <option value="paternity">Paternity Leave</option>
                    <option value="study">Study Leave</option>
                    <option value="emergency">Emergency Leave</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-zinc-900 font-semibold mb-1">LEAVE FROM *</label>
                  <input type="date" className="w-full bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-zinc-950 focus:outline-none focus:border-zinc-600" required />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-zinc-900 font-semibold mb-1">LEAVE TO *</label>
                  <input type="date" className="w-full bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-zinc-950 focus:outline-none focus:border-zinc-600" required />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-zinc-900 font-semibold mb-1">REASON</label>
                  <textarea className="w-full bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-zinc-950 focus:outline-none focus:border-zinc-600" rows="3"></textarea>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-zinc-900 font-semibold mb-1">BROWSE</label>
                  <input type="file" className="w-full bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-600" />
                </div>
                <button type="submit" className="w-full bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-medium py-2 px-4 rounded-md transition-colors">
                  SAVE APPLY LEAVE
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Right Card */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-zinc-200 shadow-xs rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4 border-b border-zinc-200 pb-2">Leave List</h2>
              
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <input type="text" placeholder="Search..." className="w-full sm:w-64 bg-white border border-zinc-200 shadow-xs rounded-md px-3 py-2 text-zinc-950 focus:outline-none focus:border-zinc-600" />
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
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">From</th>
                      <th className="px-4 py-3 font-medium">To</th>
                      <th className="px-4 py-3 font-medium">Apply Date</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center">No Data Available in Table</td>
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
