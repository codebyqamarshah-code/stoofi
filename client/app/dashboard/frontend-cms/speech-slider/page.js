'use client';

import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { useState, useRef } from 'react';
import { 
  ChevronRight, 
  Search, 
  Copy, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Download, 
  Columns, 
  ChevronDown,
  Trash2,
  Plus,
  GripVertical
} from 'lucide-react';

const INITIAL_SPEECHES = [
  { id: 1, name: 'Dr. Arthur Mitchell', designation: 'Principal & Academic Director', speech: 'Education is the most powerful tool for transformative thinking and future leadership.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: 2, name: 'Prof. Sarah Jenkins', designation: 'Dean of Sciences', speech: 'Our vision is to empower young minds with hands-on research and world-class digital innovation.', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' }
];

export default function SpeechSliderPage() {
  const [speeches, setSpeeches] = useState(INITIAL_SPEECHES);
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [speech, setSpeech] = useState('');
  const [file, setFile] = useState(null);
  const [search, setSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const fileRef = useRef();

  const handleAdd = () => {
    if (!name || !designation || !speech) {
      alert('Please fill Name, Designation and Speech');
      return;
    }
    const newSpeech = {
      id: Date.now(),
      name,
      designation,
      speech,
      image: file ? URL.createObjectURL(file) : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    };
    setSpeeches(prev => [...prev, newSpeech]);
    setName('');
    setDesignation('');
    setSpeech('');
    setFile(null);
  };

  const handleDelete = (id) => {
    setSpeeches(prev => prev.filter(s => s.id !== id));
    setOpenDropdownId(null);
  };

  const filtered = speeches.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.speech.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>Frontend CMS</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-950 font-bold">Speech Slider</span>
      </div>

      <h1 className="text-xl font-bold text-zinc-950">Speech Slider</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form */}
        <div className="bg-white border border-zinc-200 shadow-xs rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-950">Add Speech Slider</h2>

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">NAME *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">DESIGNATION *</label>
            <input
              type="text"
              value={designation}
              onChange={e => setDesignation(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">SPEECH / QUOTE *</label>
            <textarea
              rows={4}
              value={speech}
              onChange={e => setSpeech(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none"
            />
          </div>

          {/* Image File Upload */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">IMAGE *</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-700 border border-zinc-200 rounded px-3 py-2 bg-zinc-800 flex-1 truncate">
                {file ? file.name : 'Image *'}
              </span>
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="bg-zinc-700 hover:bg-zinc-600 text-zinc-950 text-sm font-semibold px-4 py-2 rounded cursor-pointer"
              >
                BROWSE
              </button>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={e => setFile(e.target.files[0])}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="w-full bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-semibold text-sm py-2 rounded flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> ADD SPEECH
          </button>
        </div>

        {/* Right Table */}
        <div className="xl:col-span-2 bg-white border border-zinc-200 shadow-xs rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-950">Speech Slider List</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-zinc-200 rounded px-2 py-1">
                <Search className="w-3 h-3 text-zinc-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="SEARCH"
                  className="bg-transparent text-xs text-zinc-950 outline-none w-28"
                />
              </div>
              <TableExportToolbar />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ SL</th>
                  <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Name</th>
                  <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Designation</th>
                  <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Speech</th>
                  <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Image</th>
                  <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500 text-sm">
                      No Data Available In Table
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={item.id} className="border-b border-zinc-200/50 hover:bg-zinc-100">
                      <td className="py-3 px-3 text-zinc-700">
                        <div className="flex items-center gap-1.5">
                          <GripVertical className="w-3.5 h-3.5 text-zinc-600 cursor-grab" />
                          <span className="text-zinc-600 font-medium">{idx + 1}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-zinc-200 font-medium">{item.name}</td>
                      <td className="py-3 px-3 text-zinc-700">{item.designation}</td>
                      <td className="py-3 px-3 text-zinc-950 max-w-xs truncate">{item.speech}</td>
                      <td className="py-3 px-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-800">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="py-3 px-3 relative">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                            className="border border-zinc-600 text-zinc-950 text-xs px-3 py-1 rounded flex items-center gap-1 hover:border-zinc-600 hover:text-zinc-500 cursor-pointer"
                          >
                            SELECT <ChevronDown className="w-3 h-3" />
                          </button>
                          {openDropdownId === item.id && (
                            <div className="absolute right-0 mt-1 w-28 bg-white border border-zinc-200 shadow-xs rounded-lg shadow-xl z-20 py-1">
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-xs text-zinc-400">
            <span>Showing 1 to {filtered.length} of {filtered.length} entries</span>
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 border border-zinc-200 rounded hover:bg-zinc-100">←</button>
              <button className="px-2 py-1 bg-zinc-800 text-zinc-950 rounded">1</button>
              <button className="px-2 py-1 border border-zinc-200 rounded hover:bg-zinc-100">→</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}