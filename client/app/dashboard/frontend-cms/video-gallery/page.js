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
  Video,
  ExternalLink,
  GripVertical
} from 'lucide-react';

const INITIAL_VIDEOS = [
  { id: 1, name: 'Annual Sports Day 2026', description: 'Highlights and awards ceremony from annual sports event', link: 'https://youtube.com/watch?v=sports2026', thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=150&auto=format&fit=crop&q=80' },
  { id: 2, name: 'Science & Robotics Exhibition', description: 'Students presenting advanced AI and robotics science models', link: 'https://youtube.com/watch?v=science2026', thumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=80' },
  { id: 3, name: 'Campus Virtual Tour', description: 'Complete 360 virtual tour of Stoofi pro school campus', link: 'https://youtube.com/watch?v=campustour', thumbnail: 'https://images.unsplash.com/photo-1562774053-701939374585?w=150&auto=format&fit=crop&q=80' },
];

export default function VideoGalleryPage() {
  const [videos, setVideos] = useState(INITIAL_VIDEOS);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [file, setFile] = useState(null);
  const [search, setSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const fileRef = useRef();

  const handleAdd = () => {
    if (!name || !link) return alert('Please enter Name and Video Link');
    const newVideo = {
      id: Date.now(),
      name,
      description: description || 'School activity video',
      link,
      thumbnail: file ? URL.createObjectURL(file) : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80'
    };
    setVideos(prev => [...prev, newVideo]);
    setName('');
    setDescription('');
    setLink('');
    setFile(null);
  };

  const handleDelete = (id) => {
    setVideos(prev => prev.filter(v => v.id !== id));
    setOpenDropdownId(null);
  };

  const filtered = videos.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) || 
    v.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>Frontend CMS</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-500">Video Gallery</span>
      </div>

      <h1 className="text-xl font-bold text-white">Video Gallery</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form: Add Video */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Add Video</h2>

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
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">VIDEO LINK (YOUTUBE/VIMEO) *</label>
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={link}
              onChange={e => setLink(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">DESCRIPTION</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none"
            />
          </div>

          {/* Thumbnail File Upload */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">THUMBNAIL IMAGE</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400 border border-zinc-700 rounded px-3 py-2 bg-zinc-800 flex-1 truncate">
                {file ? file.name : 'Choose image'}
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
            onClick={handleAdd}
            className="w-full bg-zinc-800 hover:bg-zinc-800 text-white font-semibold text-sm py-2 rounded flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> ADD VIDEO
          </button>
        </div>

        {/* Right Table */}
        <div className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-300">Video Gallery List</h2>
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
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Video Link</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">↓ Thumbnail</th>
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
                      <td className="py-3 px-3">
                        <span className="text-zinc-200 font-medium block">{item.name}</span>
                        <span className="text-zinc-500 text-xs truncate max-w-xs block">{item.description}</span>
                      </td>
                      <td className="py-3 px-3 text-zinc-300">
                        <a href={item.link} target="_blank" rel="noreferrer" className="text-zinc-500 hover:underline flex items-center gap-1 text-xs">
                          <Video className="w-3 h-3" /> Watch Video <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3 px-3">
                        <div className="w-14 h-10 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800">
                          <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="py-3 px-3 relative">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                            className="border border-zinc-600 text-zinc-300 text-xs px-3 py-1 rounded flex items-center gap-1 hover:border-zinc-600 hover:text-zinc-500 cursor-pointer"
                          >
                            SELECT <ChevronDown className="w-3 h-3" />
                          </button>
                          {openDropdownId === item.id && (
                            <div className="absolute right-0 mt-1 w-28 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-20 py-1">
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
