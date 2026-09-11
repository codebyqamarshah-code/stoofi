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
  Plus
} from 'lucide-react';

const INITIAL_CATEGORIES = [
  { id: 1, title: 'StoofiPro', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80' }
];

export default function CourseCategoryPage() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [search, setSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const fileRef = useRef();

  const handleSave = () => {
    if (!name) return alert('Please enter Category Name');
    const newCat = {
      id: Date.now(),
      title: name,
      image: file ? URL.createObjectURL(file) : 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=150&auto=format&fit=crop&q=80'
    };
    setCategories(prev => [...prev, newCat]);
    setName('');
    setFile(null);
  };

  const handleDelete = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setOpenDropdownId(null);
  };

  const filtered = categories.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400 mb-4">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>Frontend CMS</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-500">Course Category</span>
      </div>

      <h1 className="text-xl font-bold text-white mb-6">Course Category</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Add Category Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Add Category</h2>
          
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">CATEGORY NAME *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">CATEGORY IMAGE *</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400 border border-zinc-700 rounded px-3 py-2 bg-zinc-800 flex-1 truncate">
                {file ? file.name : 'Image'}
              </span>
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold px-4 py-2 rounded cursor-pointer"
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
            onClick={handleSave}
            className="w-full bg-zinc-800 hover:bg-zinc-800 text-white font-semibold text-sm py-2 rounded flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            ✓ SAVE
          </button>
        </div>

        {/* Right Table */}
        <div className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-300">Course Category List</h2>
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
                  <button key={i} className="p-1 text-zinc-400 hover:text-zinc-500">
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
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Category Title</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Image</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-zinc-500 text-sm">
                      No Data Available In Table
                    </td>
                  </tr>
                ) : (
                  filtered.map((cat) => (
                    <tr key={cat.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-3 px-3 text-zinc-200 font-medium">{cat.title}</td>
                      <td className="py-3 px-3">
                        <div className="w-24 h-12 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800">
                          <img src={cat.image} alt={cat.title} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="py-3 px-3 relative">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === cat.id ? null : cat.id)}
                            className="border border-zinc-600 text-zinc-300 text-xs px-3 py-1 rounded flex items-center gap-1 hover:border-zinc-600 hover:text-zinc-500 cursor-pointer"
                          >
                            SELECT <ChevronDown className="w-3 h-3" />
                          </button>
                          {openDropdownId === cat.id && (
                            <div className="absolute right-0 mt-1 w-28 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-20 py-1">
                              <button
                                onClick={() => handleDelete(cat.id)}
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
              <button className="px-2 py-1 border border-zinc-700 rounded hover:bg-zinc-800">←</button>
              <button className="px-2 py-1 bg-zinc-800 text-white rounded">1</button>
              <button className="px-2 py-1 border border-zinc-700 rounded hover:bg-zinc-800">→</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
