'use client';

import React, { useState, useMemo } from 'react';
import { ChevronRight, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CourseLevelPage() {
  const [levels, setLevels] = useState([
    { id: 1, name: 'Advance', status: true },
    { id: 2, name: 'Beginner', status: true },
    { id: 3, name: 'Intermediate', status: true },
    { id: 4, name: 'Pro', status: true }
  ]);
  const [levelTitle, setLevelTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    if (!levelTitle.trim()) return;
    
    setLevels([{ id: Date.now(), name: levelTitle, status: true }, ...levels]);
    setLevelTitle('');
  };

  const handleDelete = (id) => {
    setLevels(levels.filter(l => l.id !== id));
  };

  const toggleStatus = (id) => {
    setLevels(levels.map(l => l.id === id ? { ...l, status: !l.status } : l));
  };

  const filteredLevels = useMemo(() => {
    return levels.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [levels, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Course Level</h1>
        <div className="flex items-center text-sm text-zinc-400">
          <span>Dashboard</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span>LMS</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-emerald-500">Course Level</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Add Form */}
        <div className="xl:col-span-1">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">Add Course Level</h2>
            </div>
            <form className="p-4 space-y-4" onSubmit={handleSave}>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-zinc-400 uppercase">Level Title <span className="text-rose-500">*</span></Label>
                <Input
                  placeholder="Level Title"
                  value={levelTitle}
                  onChange={(e) => setLevelTitle(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500"
                  required
                />
              </div>
              <div className="pt-2">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  ADD COURSE LEVEL
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Table */}
        <div className="xl:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">Course Level</h2>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input 
                  placeholder="SEARCH" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[180px] bg-zinc-900 border-zinc-800 focus-visible:ring-emerald-500 text-xs font-semibold uppercase" 
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLevels.length > 0 ? filteredLevels.map((lv) => (
                    <tr key={lv.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                      <td className="px-4 py-4 text-zinc-300">{lv.name}</td>
                      <td className="px-4 py-4">
                        <div
                          onClick={() => toggleStatus(lv.id)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${lv.status ? 'bg-emerald-600' : 'bg-zinc-700'}`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${lv.status ? 'translate-x-4' : 'translate-x-1'}`} />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button 
                          onClick={() => handleDelete(lv.id)}
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs text-rose-500 border-rose-500/50 hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> DELETE
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-zinc-500">
                        {searchQuery ? "No matching records found" : "No Data Available In Table"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
              <div>Showing {filteredLevels.length > 0 ? 1 : 0} to {filteredLevels.length} of {filteredLevels.length} entries</div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-800 bg-transparent hover:bg-zinc-800" disabled><ChevronRight className="h-4 w-4 rotate-180" /></Button>
                <Button variant="outline" size="sm" className="h-7 px-2 text-zinc-400 border-zinc-800 bg-transparent hover:bg-zinc-800" disabled><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
