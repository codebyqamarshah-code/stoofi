'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { 
  ChevronRight, 
  Search, 
  Download, 
  Printer, 
  FileText, 
  Trash2, 
  Edit, 
  Boxes, 
  Plus, 
  Building,
  Layers,
  FlaskConical,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exportToCSV, exportToExcel, printData } from '@/lib/exportUtils';

export default function LabCategoriesPage() {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Computer Science & IT', code: 'CAT-CS', desc: 'Software development, programming, networking and database workstations', labsCount: 3, status: 'Active' },
    { id: 2, name: 'Physics & Mechanics', code: 'CAT-PHY', desc: 'Mechanics, optics, thermodynamics, electricity and electronics experiments', labsCount: 2, status: 'Active' },
    { id: 3, name: 'Chemistry & Reagents', code: 'CAT-CHEM', desc: 'Organic, inorganic and analytical chemistry with fume hoods and safety gear', labsCount: 1, status: 'Active' },
    { id: 4, name: 'Biology & Life Sciences', code: 'CAT-BIO', desc: 'Botany, zoology, microbiology, microscopic dissection and specimens', labsCount: 1, status: 'Active' },
    { id: 5, name: 'Robotics, IoT & Embedded Systems', code: 'CAT-ROB', desc: 'Microcontrollers, Arduino, Raspberry Pi, 3D printers and sensors', labsCount: 1, status: 'Active' },
    { id: 6, name: 'Language & Multimedia Lab', code: 'CAT-LANG', desc: 'Audio-visual headsets and pronunciation training systems', labsCount: 1, status: 'Active' },
  ]);

  const [formData, setFormData] = useState({ name: '', code: '', desc: '', status: 'Active' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Category Name is required');
      return;
    }

    if (isEditing) {
      setCategories(categories.map(c => c.id === editId ? { ...c, ...formData } : c));
      setIsEditing(false);
      setEditId(null);
    } else {
      setCategories([
        ...categories,
        {
          id: Date.now(),
          ...formData,
          code: formData.code || `CAT-${formData.name.substring(0, 3).toUpperCase()}`,
          labsCount: 0
        }
      ]);
    }
    setFormData({ name: '', code: '', desc: '', status: 'Active' });
  };

  const handleEdit = (cat) => {
    setFormData({ name: cat.name, code: cat.code, desc: cat.desc, status: cat.status });
    setIsEditing(true);
    setEditId(cat.id);
  };

  const handleDelete = (id) => {
    if (!confirm('Are you sure you want to delete this lab category?')) return;
    setCategories(categories.filter(c => c.id !== id));
  };

  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportData = filtered.map(c => ({
    'Category Name': c.name,
    'Category Code': c.code,
    'Description': c.desc,
    'Associated Labs': c.labsCount,
    'Status': c.status
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-950">Lab Categories</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Define flexible custom laboratory classifications for schools, colleges and universities</p>
        </div>
        <div className="flex items-center text-sm text-zinc-500 font-medium">
          <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <Link href="/dashboard/labs" className="hover:text-zinc-900 transition-colors">Labs</Link>
          <ChevronRight className="h-4 w-4 mx-1 text-zinc-400" />
          <span className="text-zinc-900 font-semibold">Categories</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
              <h2 className="text-base font-bold text-zinc-950">{isEditing ? 'Edit Lab Category' : 'Add New Category'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Category Name <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Electrical & Electronics, Physics"
                  className="bg-white border-zinc-300 text-zinc-950 font-medium focus-visible:ring-zinc-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Category Code
                </Label>
                <Input 
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. CAT-EEE"
                  className="bg-white border-zinc-300 text-zinc-950 font-medium focus-visible:ring-zinc-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  Description / Scope
                </Label>
                <textarea 
                  value={formData.desc}
                  onChange={e => setFormData({ ...formData, desc: e.target.value })}
                  placeholder="Describe the type of experiments, courses or equipment used in this lab category..."
                  rows={3}
                  className="w-full rounded-md border border-zinc-300 bg-white p-2.5 text-xs text-zinc-950 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Status</Label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 font-medium focus-visible:ring-2 focus-visible:ring-zinc-400"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <Button type="submit" className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2 rounded-lg shadow-xs">
                  {isEditing ? 'UPDATE CATEGORY' : 'SAVE CATEGORY'}
                </Button>
                {isEditing && (
                  <Button 
                    type="button" 
                    onClick={() => { setIsEditing(false); setFormData({ name: '', code: '', desc: '', status: 'Active' }); }}
                    variant="outline"
                    className="border-zinc-300 font-semibold"
                  >
                    CANCEL
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Table */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs h-full flex flex-col">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-zinc-950">Configured Categories</h2>
                <p className="text-xs text-zinc-500">Total: {filtered.length} categories</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search category..." 
                    className="pl-9 w-full sm:w-[200px] bg-white border-zinc-300 text-zinc-950 text-xs font-medium h-9"
                  />
                </div>

                <div className="flex items-center border border-zinc-200 rounded-md bg-white shadow-xs">
                  <button onClick={() => exportToCSV(exportData, 'Lab_Categories')} className="p-2 hover:bg-zinc-100 text-zinc-700 border-r border-zinc-200" title="CSV">
                    <FileText className="h-4 w-4" />
                  </button>
                  <button onClick={() => exportToExcel(exportData, 'Lab_Categories')} className="p-2 hover:bg-zinc-100 text-zinc-700 border-r border-zinc-200" title="Excel">
                    <Download className="h-4 w-4" />
                  </button>
                  <button onClick={() => printData('Lab Categories List', exportData)} className="p-2 hover:bg-zinc-100 text-zinc-700" title="Print">
                    <Printer className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200 font-bold">
                  <tr>
                    <th className="px-4 py-3">Category Name</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Labs Associated</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filtered.map((cat) => (
                    <tr key={cat.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-zinc-950">{cat.name}</div>
                        <div className="text-[11px] text-zinc-500 max-w-sm line-clamp-1">{cat.desc}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-zinc-800 font-bold">{cat.code}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 text-xs font-bold border border-zinc-200">
                          <FlaskConical className="h-3 w-3 text-emerald-600" />
                          {cat.labsCount} Labs
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {cat.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button onClick={() => handleEdit(cat)} variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button onClick={() => handleDelete(cat.id)} variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:bg-rose-50">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
