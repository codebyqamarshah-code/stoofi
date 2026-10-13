'use client';
import Link from 'next/link';
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Search, RotateCcw } from 'lucide-react';
import { sortClassesAcademic, normalizeClassName } from '@/lib/academicUtils';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';

export default function FeesCarryForwardPage() {
  const [formData, setFormData] = useState({ class: '', section: '' });
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/class').then(r => r?.success && Array.isArray(r.data) && setClasses(r.data)).catch(()=>{});
    api.get('/section').then(r => r?.success && Array.isArray(r.data) && setSections(r.data)).catch(()=>{});
  }, []);

  const handleSearch = () => {
    // Implement carry forward fetch
  };

  const handleReset = () => {
    setFormData({ class: '', section: '' });
  };

  const classOptions = useMemo(() => {
    return sortClassesAcademic(classes.map(c => ({ value: c.name, label: c.name })));
  }, [classes]);

  const availableSections = useMemo(() => {
    if (formData.class) {
      const selectedClassObj = classes.find(c => 
        c.name === formData.class || 
        normalizeClassName(c.name) === normalizeClassName(formData.class)
      );
      if (selectedClassObj?.sections && Array.isArray(selectedClassObj.sections) && selectedClassObj.sections.length > 0) {
        return selectedClassObj.sections.map(s => {
          const raw = typeof s === 'string' ? s : (s.name || '');
          const clean = raw.replace(/^section\s+/i, '');
          return { value: raw, label: `Section ${clean}` };
        });
      }
    }

    const allSecSet = new Set();
    (sections || []).forEach(s => {
      const name = typeof s === 'string' ? s : (s.name || '');
      if (name) allSecSet.add(name);
    });
    (classes || []).forEach(c => {
      (c.sections || []).forEach(s => {
        if (s) allSecSet.add(s);
      });
    });
    if (allSecSet.size === 0) {
      ['A', 'B', 'C', 'D'].forEach(s => allSecSet.add(s));
    }

    return Array.from(allSecSet).sort().map(s => {
      const clean = String(s).replace(/^section\s+/i, '');
      return { value: s, label: `Section ${clean}` };
    });
  }, [formData.class, classes, sections]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-950">Fees Carry Forward</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-500 transition-colors">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>Fees Collection</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-zinc-950 font-bold">Fees Carry Forward</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 shadow-xs rounded-xl overflow-visible">
        <div className="p-4 border-b border-zinc-200">
          <h2 className="text-lg font-semibold text-zinc-950">Select Criteria</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Select Class <span className="text-rose-500">*</span></Label>
            <SearchableSelect
              options={classOptions}
              value={formData.class}
              onChange={e => {
                const newClass = e.target.value;
                setFormData(prev => ({ ...prev, class: newClass, section: '' }));
              }}
              placeholder="Select Class"
              name="class"
              className="flex h-10 w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm focus:outline-none cursor-pointer shadow-xs hover:border-zinc-400"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-zinc-700 uppercase font-bold">Select Section <span className="text-rose-500">*</span></Label>
            <SearchableSelect
              options={availableSections}
              value={formData.section}
              onChange={e => setFormData({ ...formData, section: e.target.value })}
              placeholder="Select Section"
              name="section"
              className="flex h-10 w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-zinc-950 text-sm focus:outline-none cursor-pointer shadow-xs hover:border-zinc-400"
            />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleReset} 
              className="border-zinc-200 text-zinc-700 hover:bg-zinc-100 rounded-xl text-xs font-bold h-10 px-4 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> RESET
            </Button>
            <Button onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2 h-10 px-6 rounded-xl cursor-pointer">
              <Search className="h-4 w-4" /> SEARCH
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
