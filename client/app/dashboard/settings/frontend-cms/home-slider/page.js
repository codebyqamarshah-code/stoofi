'use client';
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
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import api from '@/services/api';

const INITIAL_SLIDERS = [
  { id: 1, sl: 1, image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&auto=format&fit=crop&q=60', link: 'https://eskooly.pro/admission' },
  { id: 2, sl: 2, image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300&auto=format&fit=crop&q=60', link: 'https://eskooly.pro/courses' },
  { id: 3, sl: 3, image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=300&auto=format&fit=crop&q=60', link: 'https://eskooly.pro/events' },
];

export default function HomeSliderPage() {
  const [sliders, setSliders] = useState(INITIAL_SLIDERS);
  const [link, setLink] = useState('');
  const [file, setFile] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const fileRef = useRef();

  const handleAdd = async () => {
    if (!file && !link) {
      alert('Please select an image or provide a link');
      return;
    }
    setLoading(true);
    const newSlider = {
      id: Date.now(),
      sl: sliders.length + 1,
      image: file ? URL.createObjectURL(file) : 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=300&auto=format&fit=crop&q=60',
      link: link || 'https://eskooly.pro/slider'
    };
    setSliders(prev => [...prev, newSlider]);
    setLink('');
    setFile(null);
    setLoading(false);
  };

  const handleDelete = (id) => {
    setSliders(prev => prev.filter(s => s.id !== id));
    setOpenDropdownId(null);
  };

  const filtered = sliders.filter(s => s.link.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400 mb-4">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>Frontend CMS</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-emerald-400">Home Slider</span>
      </div>

      <h1 className="text-xl font-bold text-white mb-6">Home Slider</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Add Slider Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Home Slider</h2>
          
          {/* File Upload */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">IMAGE *</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400 border border-zinc-700 rounded px-3 py-2 bg-zinc-800 flex-1 truncate">
                {file ? file.name : 'Image *'}
              </span>
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold px-4 py-2 rounded"
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

          {/* Link */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">LINK</label>
            <input
              type="text"
              value={link}
              placeholder="https://..."
              onChange={e => setLink(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-2 rounded flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> ADD
          </button>
        </div>

        {/* Right: Home Slider List Table */}
        <div className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-300">Home Slider List</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-zinc-700 rounded px-2 py-1">
                <Search className="w-3 h-3 text-zinc-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="SEARCH"
                  className="bg-transparent text-xs text-zinc-300 outline-none w-28"
                />
              </div>
              <div className="flex gap-1">
                {[Copy, FileSpreadsheet, FileText, Printer, Download, Columns].map((Icon, i) => (
                  <button key={i} className="p-1 text-zinc-400 hover:text-emerald-400">
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ SL</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Image</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Link</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-500 text-sm">
                      No Data Available In Table
                    </td>
                  </tr>
                ) : (
                  filtered.map((slider, idx) => (
                    <tr key={slider.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-3 px-3 text-emerald-500 font-medium">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="w-20 h-12 rounded overflow-hidden border border-zinc-700 bg-zinc-800">
                          <img src={slider.image} alt="Slider" className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="py-3 px-3 text-zinc-300">
                        <a href={slider.link} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1">
                          {slider.link} <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3 px-3 relative">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === slider.id ? null : slider.id)}
                            className="border border-zinc-600 text-zinc-300 text-xs px-3 py-1 rounded flex items-center gap-1 hover:border-emerald-500 hover:text-emerald-400"
                          >
                            SELECT <ChevronDown className="w-3 h-3" />
                          </button>
                          {openDropdownId === slider.id && (
                            <div className="absolute right-0 mt-1 w-28 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-20 py-1">
                              <button
                                onClick={() => handleDelete(slider.id)}
                                className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
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
              <button className="px-2 py-1 border border-zinc-700 rounded hover:bg-zinc-800">←</button>
              <button className="px-2 py-1 bg-emerald-600 text-white rounded">1</button>
              <button className="px-2 py-1 border border-zinc-700 rounded hover:bg-zinc-800">→</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
