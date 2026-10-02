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
  Bold,
  Italic,
  Underline,
  List,
  Link2,
  ImageIcon,
  Code
} from 'lucide-react';

const INITIAL_NEWS = [
  { id: 1, title: 'Aut nostrum aut ad repudiandae.', date: '2nd Jun, 2019', category: 'Our mission and vision', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=150&auto=format&fit=crop&q=80' },
  { id: 2, title: 'Debitis voluptate sed hic.', date: '2nd Jun, 2019', category: 'International', image: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=150&auto=format&fit=crop&q=80' },
  { id: 3, title: 'Digital Transformation in Education: STOOFI PRO Paving the Way', date: '2nd Jun, 2019', category: 'International', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=150&auto=format&fit=crop&q=80' },
  { id: 4, title: 'Dolores aperiam dolor sed expedita.', date: '2nd Jun, 2019', category: 'Our history', image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=150&auto=format&fit=crop&q=80' },
  { id: 5, title: 'Error eaque qui voluptas aspernatur.', date: '2nd Jun, 2019', category: 'Our history', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=150&auto=format&fit=crop&q=80' },
  { id: 6, title: 'STOOFI PRO Launches Enhanced Features for a Seamless School Year', date: '2nd Jun, 2019', category: 'International', image: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=150&auto=format&fit=crop&q=80' },
  { id: 7, title: 'Inventore veritatis ea illo eius et.', date: '2nd Jun, 2019', category: 'Our history', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=150&auto=format&fit=crop&q=80' },
  { id: 8, title: 'Molestiae quo animi explicabo.', date: '2nd Jun, 2019', category: 'Our mission and vision', image: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=150&auto=format&fit=crop&q=80' },
  { id: 9, title: 'Non est nisi est consequatur vitae.', date: '2nd Jun, 2019', category: 'Our mission and vision', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=150&auto=format&fit=crop&q=80' },
  { id: 10, title: 'Quia vel consequatur et omnis.', date: '2nd Jun, 2019', category: 'Our mission and vision', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=150&auto=format&fit=crop&q=80' },
];

const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

export default function NewsListPage() {
  const [newsList, setNewsList] = useState(INITIAL_NEWS);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [publishDate, setPublishDate] = useState(today);
  const [description, setDescription] = useState('');
  const [showStatus, setShowStatus] = useState(true);
  const [globalCommentSettings, setGlobalCommentSettings] = useState(true);
  const [file, setFile] = useState(null);
  const [search, setSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const fileRef = useRef();

  const handleAdd = () => {
    if (!title) return alert('Please enter News Title');
    const newNews = {
      id: Date.now(),
      title,
      date: publishDate,
      category: category || 'International',
      image: file ? URL.createObjectURL(file) : 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=150&auto=format&fit=crop&q=80'
    };
    setNewsList(prev => [newNews, ...prev]);
    setTitle('');
    setDescription('');
    setCategory('');
    setFile(null);
  };

  const handleDelete = (id) => {
    setNewsList(prev => prev.filter(n => n.id !== id));
    setOpenDropdownId(null);
  };

  const filtered = newsList.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>Frontend CMS</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-950 font-bold">News List</span>
      </div>

      <h1 className="text-xl font-bold text-zinc-950">News List</h1>

      {/* Top Form: Add News */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-lg p-6 space-y-5">
        <h2 className="text-sm font-semibold text-zinc-950">Add News</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">TITLE *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">CATEGORY *</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            >
              <option value="">Select *</option>
              <option value="International">International</option>
              <option value="National">National</option>
              <option value="Our history">Our history</option>
              <option value="Our mission and vision">Our mission and vision</option>
              <option value="Sports">Sports</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold block mb-1">PUBLISH DATE *</label>
            <input
              type="date"
              value={publishDate}
              onChange={e => setPublishDate(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>
        </div>

        {/* Rich Description */}
        <div className="border border-zinc-200 rounded-lg overflow-hidden">
          <div className="bg-zinc-800/80 px-3 py-2 border-b border-zinc-200 flex items-center justify-between flex-wrap gap-2 text-zinc-400">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-zinc-950">Poppins</span>
              <Bold className="w-3.5 h-3.5 hover:text-zinc-500 cursor-pointer" />
              <Italic className="w-3.5 h-3.5 hover:text-zinc-500 cursor-pointer" />
              <Underline className="w-3.5 h-3.5 hover:text-zinc-500 cursor-pointer" />
              <List className="w-3.5 h-3.5 hover:text-zinc-500 cursor-pointer" />
              <Link2 className="w-3.5 h-3.5 hover:text-zinc-500 cursor-pointer" />
              <ImageIcon className="w-3.5 h-3.5 hover:text-zinc-500 cursor-pointer" />
              <Code className="w-3.5 h-3.5 hover:text-zinc-500 cursor-pointer" />
            </div>
          </div>
          <textarea
            rows={5}
            placeholder="Write here"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-white text-zinc-950 text-sm p-3 focus:outline-none resize-none placeholder:text-zinc-600"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-3 pt-2">
          <div>
            <p className="text-xs font-semibold text-zinc-700 uppercase font-bold mb-1.5">NEWS STATUS</p>
            <label className="flex items-center gap-2 cursor-pointer" onClick={() => setShowStatus(!showStatus)}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${showStatus ? 'border-zinc-600' : 'border-zinc-600'}`}>
                {showStatus && <div className="w-2 h-2 rounded-full bg-zinc-600" />}
              </div>
              <span className="text-xs text-zinc-950">Show</span>
            </label>
          </div>

          <div>
            <p className="text-xs font-semibold text-zinc-700 uppercase font-bold mb-1.5">USE GLOBAL SETTINGS FOR CAN COMMENT AND COMMENT AUTO APPROVAL</p>
            <label className="flex items-center gap-2 cursor-pointer" onClick={() => setGlobalCommentSettings(!globalCommentSettings)}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${globalCommentSettings ? 'border-zinc-600' : 'border-zinc-600'}`}>
                {globalCommentSettings && <div className="w-2 h-2 rounded-full bg-zinc-600" />}
              </div>
              <span className="text-xs text-zinc-950">Yes</span>
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="bg-zinc-800 hover:bg-zinc-100 text-zinc-950 font-semibold text-sm px-6 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer shadow-lg mt-4"
        >
          ✓ UPDATE
        </button>
      </div>

      {/* Bottom Card: News List */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-950">News List</h2>
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
              <tr className="border-b border-zinc-200">
                <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Title</th>
                <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Publication Date</th>
                <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Category</th>
                <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Image</th>
                <th className="text-left py-2 px-3 text-zinc-700 font-medium text-xs">↓ Action</th>
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
                filtered.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-200/50 hover:bg-zinc-100">
                    <td className="py-3 px-3 text-zinc-200 font-medium max-w-xs">{item.title}</td>
                    <td className="py-3 px-3 text-zinc-700">{item.date}</td>
                    <td className="py-3 px-3 text-zinc-950">{item.category}</td>
                    <td className="py-3 px-3">
                      <div className="w-12 h-10 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-800">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="py-3 px-3 relative">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                          className="border border-zinc-600 text-zinc-950 text-xs px-3 py-1 rounded flex items-center gap-1 hover:border-zinc-600 hover:text-zinc-500"
                        >
                          SELECT <ChevronDown className="w-3 h-3" />
                        </button>
                        {openDropdownId === item.id && (
                          <div className="absolute right-0 mt-1 w-28 bg-white border border-zinc-200 shadow-xs rounded-lg shadow-xl z-20 py-1">
                            <button
                              onClick={() => handleDelete(item.id)}
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
            <button className="px-2.5 py-1 bg-zinc-800 text-zinc-950 rounded font-bold">1</button>
            <button className="px-2.5 py-1 border border-zinc-200 rounded hover:bg-zinc-100">2</button>
            <button className="px-2.5 py-1 border border-zinc-200 rounded hover:bg-zinc-100">→</button>
          </div>
        </div>
      </div>
    </div>
  );
}
