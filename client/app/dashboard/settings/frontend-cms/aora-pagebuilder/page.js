'use client';
import { useState } from 'react';
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
  ExternalLink
} from 'lucide-react';

const INITIAL_PAGES = [
  { id: 1, sl: 1, name: 'Home', isHome: true, url: 'https://stoofi.pro/home', status: true },
  { id: 2, sl: 2, name: 'About', isHome: false, url: 'https://stoofi.pro/about', status: true },
  { id: 3, sl: 3, name: 'About', isHome: false, url: 'https://stoofi.pro/aboutus-page', status: true },
  { id: 4, sl: 4, name: 'Academic Calendar', isHome: false, url: 'https://stoofi.pro/academic-calendars', status: true },
  { id: 5, sl: 5, name: 'Book a Visit', isHome: false, url: 'https://stoofi.pro/book-a-visit', status: true },
  { id: 6, sl: 6, name: 'Class Routine', isHome: false, url: 'https://stoofi.pro/class-routines', status: true },
  { id: 7, sl: 7, name: 'Contact Us', isHome: false, url: 'https://stoofi.pro/contact-us', status: true },
  { id: 8, sl: 8, name: 'Course', isHome: false, url: 'https://stoofi.pro/course', status: true },
  { id: 9, sl: 9, name: 'Donor List', isHome: false, url: 'https://stoofi.pro/donor-list', status: true },
  { id: 10, sl: 10, name: 'Events', isHome: false, url: 'https://stoofi.pro/events', status: true },
];

export default function AoraPagebuilderPage() {
  const [pages, setPages] = useState(INITIAL_PAGES);
  const [pageName, setPageName] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [isHomePage, setIsHomePage] = useState(false);
  const [search, setSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const handleAdd = () => {
    if (!pageName || !pageTitle || !pageSlug) {
      alert('Please fill Page Name, Page Title and Slug');
      return;
    }
    const newPage = {
      id: Date.now(),
      sl: pages.length + 1,
      name: pageName,
      isHome: isHomePage,
      url: `https://stoofi.pro/${pageSlug.toLowerCase().replace(/\s+/g, '-')}`,
      status: true
    };
    setPages(prev => [...prev, newPage]);
    setPageName('');
    setPageTitle('');
    setDescription('');
    setPageSlug('');
    setIsHomePage(false);
  };

  const toggleStatus = (id) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, status: !p.status } : p));
  };

  const handleDelete = (id) => {
    setPages(prev => prev.filter(p => p.id !== id));
    setOpenDropdownId(null);
  };

  const filtered = pages.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.url.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400 mb-4">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>Frontend CMS</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-emerald-400">Page List</span>
      </div>

      <h1 className="text-xl font-bold text-white mb-6">Page List</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form: Add new page */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Add new page</h2>
          
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">PAGE NAME *</label>
            <input
              type="text"
              placeholder="Page Name *"
              value={pageName}
              onChange={e => setPageName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">PAGE TITLE *</label>
            <input
              type="text"
              placeholder="Page Title *"
              value={pageTitle}
              onChange={e => setPageTitle(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">PAGE DESCRIPTION</label>
            <textarea
              rows={3}
              placeholder="Page Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">PAGE SLUG *</label>
            <input
              type="text"
              placeholder="Page Slug *"
              value={pageSlug}
              onChange={e => setPageSlug(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Make Home Page Toggle */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase">MAKE HOME PAGE?</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">{isHomePage ? 'YES' : 'NO'}</span>
              <button
                type="button"
                onClick={() => setIsHomePage(!isHomePage)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${isHomePage ? 'bg-emerald-600' : 'bg-zinc-700'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isHomePage ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-2 rounded flex items-center justify-center gap-2 mt-4"
          >
            <Plus className="w-4 h-4" /> ADD NEW PAGE
          </button>
        </div>

        {/* Right Table */}
        <div className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-300">Page List</h2>
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
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">SL</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">NAME</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">URL</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">STATUS</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">ACTIONS</th>
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
                  filtered.map((p, idx) => (
                    <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-3 px-3 text-emerald-500 font-medium">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-200 font-medium">{p.name}</span>
                          {p.isHome && (
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                              HOME
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-zinc-300">
                        <a href={p.url} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1 text-xs">
                          {p.url} <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => toggleStatus(p.id)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${p.status ? 'bg-emerald-600' : 'bg-zinc-700'}`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${p.status ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </td>
                      <td className="py-3 px-3 relative">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === p.id ? null : p.id)}
                            className="border border-zinc-600 text-zinc-300 text-xs px-3 py-1 rounded flex items-center gap-1 hover:border-emerald-500 hover:text-emerald-400"
                          >
                            SELECT <ChevronDown className="w-3 h-3" />
                          </button>
                          {openDropdownId === p.id && (
                            <div className="absolute right-0 mt-1 w-28 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-20 py-1">
                              <button
                                onClick={() => handleDelete(p.id)}
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
              <button className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold">1</button>
              <button className="px-2.5 py-1 border border-zinc-700 rounded hover:bg-zinc-800">2</button>
              <button className="px-2.5 py-1 border border-zinc-700 rounded hover:bg-zinc-800">3</button>
              <button className="px-2 py-1 border border-zinc-700 rounded hover:bg-zinc-800">→</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
