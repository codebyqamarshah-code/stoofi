'use client';

import TableExportToolbar from '@/components/ui/TableExportToolbar';
import React, { useState, useEffect } from 'react';
import { Copy, FileSpreadsheet, FileText, Printer, Download, Columns, Search, Edit, Trash2 } from 'lucide-react';
import api from '@/services/api';

export default function StudentRegistrationFields() {
  const [formData, setFormData] = useState({ label: '', type: '', required: false, onlineReg: false });
  const [fields, setFields] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSave = () => {
    if (!formData.label || !formData.type) return;
    const newField = { ...formData, id: Date.now(), width: '100%', value: '' };
    setFields([...fields, newField]);
    setFormData({ label: '', type: '', required: false, onlineReg: false });
  };

  const handleDelete = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6 text-zinc-950 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Student Registration</h1>
        <p className="text-sm text-zinc-400">Dashboard &gt; Custom Field &gt; Student Registration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-zinc-200 shadow-xs rounded-lg p-6 lg:col-span-1 h-fit">
          <h2 className="text-lg font-semibold mb-4 text-zinc-950">Add Custom Field</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-900 font-semibold mb-1">LABEL *</label>
              <input 
                type="text" 
                className="w-full bg-white border border-zinc-200 shadow-xs rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                value={formData.label}
                onChange={(e) => setFormData({...formData, label: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-900 font-semibold mb-1">TYPE *</label>
              <select 
                className="w-full bg-white border border-zinc-200 shadow-xs rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="">Type</option>
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="select">Select</option>
              </select>
            </div>
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-zinc-200 bg-white text-zinc-800 focus:ring-zinc-600"
                  checked={formData.required}
                  onChange={(e) => setFormData({...formData, required: e.target.checked})}
                />
                <span className="text-sm text-zinc-950">Required</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-zinc-200 bg-white text-zinc-800 focus:ring-zinc-600"
                  checked={formData.onlineReg}
                  onChange={(e) => setFormData({...formData, onlineReg: e.target.checked})}
                />
                <span className="text-sm text-zinc-950">Available For Online Registration</span>
              </label>
            </div>
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSave}
                className="bg-zinc-800 hover:bg-zinc-100 text-zinc-950 px-6 py-2 rounded transition-colors text-sm font-medium"
              >
                SAVE
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 shadow-xs rounded-lg p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-zinc-950">Custom Field List</h2>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <div className="relative w-full md:w-64">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 shadow-xs rounded text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            </div>
            <TableExportToolbar />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50/50 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3">SL</th>
                  <th className="px-4 py-3">Label</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Width</th>
                  <th className="px-4 py-3">Required</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Available For Online Registration</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fields.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-zinc-500">
                      No custom fields found
                    </td>
                  </tr>
                ) : (
                  fields.map((field, idx) => (
                    <tr key={field.id} className="border-b border-zinc-200 hover:bg-zinc-100">
                      <td className="px-4 py-3">{idx + 1}</td>
                      <td className="px-4 py-3">{field.label}</td>
                      <td className="px-4 py-3 capitalize">{field.type}</td>
                      <td className="px-4 py-3">{field.width}</td>
                      <td className="px-4 py-3">{field.required ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-3">{field.value || '-'}</td>
                      <td className="px-4 py-3">{field.onlineReg ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button className="text-zinc-600 hover:text-zinc-500 p-1 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(field.id)} className="text-rose-500 hover:text-rose-400 p-1 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}