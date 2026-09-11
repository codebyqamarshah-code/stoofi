'use client';

import React from 'react';
import api from '@/services/api';
import { Copy, FileSpreadsheet, FileText, Printer, Download, Columns } from 'lucide-react';

export default function DueFeesPermission() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Fees Due User Login Permission</h1>
      </div>

      <div className="flex flex-col gap-6">
        {/* Top Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4 border-b border-zinc-800 pb-2">Select Criteria</h2>
          <form className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">CLASS</label>
                <select className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:border-zinc-600">
                  <option value="">Select Class</option>
                  {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">SECTION</label>
                <select className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:border-zinc-600">
                  <option value="">Select Section</option>
                  {['A', 'B', 'C', 'D'].map(s => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">SEARCH BY NAME</label>
                <input
                  type="text"
                  placeholder="Enter Name"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-zinc-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">ADMISSION NO</label>
                <input
                  type="text"
                  placeholder="Enter Admission No"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-zinc-600"
                />
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <button
                type="button"
                className="bg-zinc-800 hover:bg-zinc-800 text-white font-medium py-2 px-6 rounded-md transition-colors"
              >
                SEARCH
              </button>
            </div>
          </form>
        </div>

        {/* Bottom Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4 border-b border-zinc-800 pb-2">Student List</h2>
          
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
                  <th className="px-4 py-3 font-medium">Admission No</th>
                  <th className="px-4 py-3 font-medium">Student Name</th>
                  <th className="px-4 py-3 font-medium">Class</th>
                  <th className="px-4 py-3 font-medium">Due Fees</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center">No Data Available in Table</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
