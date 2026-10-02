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
  GripVertical,
  Image as ImageIcon
} from 'lucide-react';

const INITIAL_GALLERY = [
  { id: 1, sl: 1, name: 'Pre-Primary', description: 'Fusce semper, nibh eu sollicitudin imperdiet, dolo', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=150&auto=format&fit=crop&q=80' },
  { id: 2, sl: 2, name: 'Kindergarden', description: 'Fusce semper, nibh eu sollicitudin imperdiet, dolo', image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=150&auto=format&fit=crop&q=80' },
  { id: 3, sl: 3, name: 'Celebration', description: 'Fusce semper, nibh eu sollicitudin imperdiet, dolo', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=150&auto=format&fit=crop&q=80' },
  { id: 4, sl: 4, name: 'Recreation Centre', description: 'Fusce semper, nibh eu sollicitudin imperdiet, dolo', image: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=150&auto=format&fit=crop&q=80' },
  { id: 5, sl: 5, name: 'Facilities', description: 'Fusce semper, nibh eu sollicitudin imperdiet, dolo', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=150&auto=format&fit=crop&q=80' },
  { id: 6, sl: 6, name: 'Activities', description: 'Fusce semper, nibh eu sollicitudin imperdiet, dolo', image: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=150&auto=format&fit=crop&q=80' },
];

export default function PhotoGalleryPage() {
  const [galleries, setGalleries] = useState(INITIAL_GALLERY);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [search, setSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const fileRef = useRef();
  const multiFileRef = useRef();

  const handleAdd = () => {
    if (!name) return alert('Please enter Gallery Name');
    const newGallery = {
      id: Date.now(),
      sl: galleries.length + 1,
      name,
      description: description || 'Fusce semper, nibh eu sollicitudin imperdiet',
      image: file ? URL.createObjectURL(file) : 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=150&auto=format&fit=crop&q=80'
    };
    setGalleries(prev => [...prev, newGallery]);
    setName('');
    setDescription('');
    setFile(null);
  };

  const handleDelete = (id) => {
    setGalleries(prev => prev.filter(g => g.id !== id));
    setOpenDropdownId(null);
  };

  const filtered = galleries.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400 mb-4">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>Frontend CMS</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-500">Photo Gallery</span>
      </div>

      <h1 className="text-xl font-bold text-white mb-6">Photo Gallery</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Add Gallery Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Photo Gallery</h2>
          
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">NAME *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">DESCRIPTION *</label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none"
            />
          </div>

          {/* Feature Image Upload */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">FEATURE IMAGE *</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400 border border-zinc-700 rounded px-3 py-2 bg-zinc-800 flex-1 truncate">
                {file ? file.name : 'Feature image *'}
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

          {/* Multi photo button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-zinc-300">Add Gallery Photos</span>
            <button
              type="button"
              onClick={() => multiFileRef.current.click()}
              className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-800 text-white flex items-center justify-center transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
            <input
              ref={multiFileRef}
              type="file"
              multiple
              className="hidden"
              accept="image/*"
              onChange={e => setGalleryPhotos(Array.from(e.target.files))}
            />
          </div>
          {galleryPhotos.length > 0 && (
            <p className="text-xs text-zinc-500">{galleryPhotos.length} photos selected</p>
          )}

          <button
            type="button"
            onClick={handleAdd}
            className="w-full bg-zinc-800 hover:bg-zinc-800 text-white font-semibold text-sm py-2 rounded flex items-center justify-center gap-2 mt-4"
          >
            <Plus className="w-4 h-4" /> ADD
          </button>
        </div>

        {/* Right Table */}
        <div className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-300">Photo Gallery List</h2>
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
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ SL</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Name</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Description</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Image</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500 text-sm">
                      No Data Available In Table
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-3 px-3 text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <GripVertical className="w-3.5 h-3.5 text-zinc-600 cursor-grab" />
                          <span className="text-zinc-600 font-medium">{idx + 1}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-zinc-200 font-medium">{item.name}</td>
                      <td className="py-3 px-3 text-zinc-400 max-w-xs truncate">{item.description}</td>
                      <td className="py-3 px-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="py-3 px-3 relative">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                            className="border border-zinc-600 text-zinc-300 text-xs px-3 py-1 rounded flex items-center gap-1 hover:border-zinc-600 hover:text-zinc-500"
                          >
                            SELECT <ChevronDown className="w-3 h-3" />
                          </button>
                          {openDropdownId === item.id && (
                            <div className="absolute right-0 mt-1 w-28 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-20 py-1">
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="w-full text-left px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
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

