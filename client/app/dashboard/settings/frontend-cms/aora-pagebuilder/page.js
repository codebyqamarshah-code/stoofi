'use client';

import Link from 'next/link';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { useState, useEffect } from 'react';
import {
  ChevronRight,
  Search,
  ChevronDown,
  Trash2,
  Plus,
  ExternalLink,
  Edit3,
  Eye,
  CheckCircle2,
  X,
  LayoutTemplate
} from 'lucide-react';
import { fetchCmsSection, mutateCmsSection } from '@/lib/frontendCmsApi';

export default function AoraPagebuilderPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [pageName, setPageName] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [isHomePage, setIsHomePage] = useState(false);
  const [search, setSearch] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [previewPage, setPreviewPage] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    let mounted = true;
    fetchCmsSection('aoraPagebuilder', []).then((data) => {
      if (mounted) {
        setPages(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setPageName('');
    setPageTitle('');
    setDescription('');
    setPageSlug('');
    setIsHomePage(false);
  };

  const handleSave = async () => {
    if (!pageName.trim() || !pageTitle.trim()) {
      alert('Please fill Page Name and Page Title');
      return;
    }
    const cleanSlug = (pageSlug || pageName).toLowerCase().trim().replace(/\s+/g, '-');
    const url = cleanSlug.startsWith('/') || cleanSlug.startsWith('http') ? cleanSlug : `/#${cleanSlug}`;

    const itemPayload = {
      name: pageName.trim(),
      title: pageTitle.trim(),
      description: description.trim() || 'Institutional portal section',
      slug: cleanSlug,
      url: isHomePage ? '/' : url,
      isHome: isHomePage,
      status: true
    };

    if (editingId) {
      const res = await mutateCmsSection('aoraPagebuilder', 'update', { id: editingId, item: itemPayload });
      if (res?.success) {
        setPages(res.data);
        showToast('Page updated successfully!');
        resetForm();
      }
    } else {
      const res = await mutateCmsSection('aoraPagebuilder', 'add', { item: itemPayload });
      if (res?.success) {
        setPages(res.data);
        showToast('New page added successfully!');
        resetForm();
      }
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setPageName(p.name || '');
    setPageTitle(p.title || p.name || '');
    setDescription(p.description || '');
    setPageSlug(p.slug || p.url || '');
    setIsHomePage(!!p.isHome);
    setOpenDropdownId(null);
  };

  const toggleStatus = async (p) => {
    const res = await mutateCmsSection('aoraPagebuilder', 'update', {
      id: p.id,
      item: { ...p, status: !p.status }
    });
    if (res?.success) {
      setPages(res.data);
      showToast('Page status updated!');
    }
  };

  const handleDelete = async (id) => {
    const res = await mutateCmsSection('aoraPagebuilder', 'delete', { id });
    if (res?.success) {
      setPages(res.data);
      showToast('Page deleted.');
    }
    setOpenDropdownId(null);
  };

  const filtered = pages.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.url || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span>Frontend CMS</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-950 font-bold">Page Builder & Page List</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-950">Page List & Aora Pagebuilder</h1>
        </div>

        <Link
          href="/dashboard/settings/frontend-cms"
          className="inline-flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs"
        >
          <LayoutTemplate className="w-4 h-4" /> Open Visual Page Builder
        </Link>
      </div>

      {toast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Form: Add / Edit page */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              {editingId ? 'Edit Page' : 'Add New Page'}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-xs font-bold text-rose-600 hover:underline cursor-pointer">
                Cancel
              </button>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">PAGE NAME *</label>
            <input
              type="text"
              placeholder="e.g. About Campus"
              value={pageName}
              onChange={e => {
                setPageName(e.target.value);
                if (!editingId) setPageSlug(e.target.value.toLowerCase().trim().replace(/\s+/g, '-'));
              }}
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">PAGE TITLE *</label>
            <input
              type="text"
              placeholder="e.g. About Pak Royal College Sharaqpur"
              value={pageTitle}
              onChange={e => setPageTitle(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">PAGE DESCRIPTION / CONTENT</label>
            <textarea
              rows={3}
              placeholder="Page summary or section content..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">PAGE SLUG / ROUTE *</label>
            <input
              type="text"
              placeholder="e.g. /#notices or about-us"
              value={pageSlug}
              onChange={e => setPageSlug(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">MAKE HOME PAGE?</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-800 font-bold">{isHomePage ? 'YES' : 'NO'}</span>
              <button
                type="button"
                onClick={() => setIsHomePage(!isHomePage)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${isHomePage ? 'bg-[#087f77]' : 'bg-zinc-300'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isHomePage ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2.5 rounded-xl shadow-xs text-sm flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {editingId ? 'UPDATE PAGE' : 'ADD NEW PAGE'}
          </button>
        </div>

        {/* Right Table */}
        <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-2xl shadow-xs p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">Page List ({filtered.length})</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border border-zinc-300 rounded-xl px-3 py-1.5 bg-white">
                <Search className="w-3.5 h-3.5 text-zinc-500" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="SEARCH PAGES..."
                  className="bg-transparent text-xs text-zinc-950 font-medium outline-none w-32"
                />
              </div>
              <TableExportToolbar />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="text-left py-2.5 px-3 text-zinc-800 font-bold text-xs uppercase">SL</th>
                  <th className="text-left py-2.5 px-3 text-zinc-800 font-bold text-xs uppercase">NAME & TITLE</th>
                  <th className="text-left py-2.5 px-3 text-zinc-800 font-bold text-xs uppercase">ROUTE / URL</th>
                  <th className="text-left py-2.5 px-3 text-zinc-800 font-bold text-xs uppercase">STATUS</th>
                  <th className="text-left py-2.5 px-3 text-zinc-800 font-bold text-xs uppercase">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-600 text-sm font-medium">
                      Loading pages...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-600 text-sm">
                      No Pages Found
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, idx) => (
                    <tr key={p.id || idx} className="border-b border-zinc-100 hover:bg-zinc-50/80">
                      <td className="py-3 px-3 text-zinc-900 font-bold">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-950 font-bold text-sm">{p.name}</span>
                          {p.isHome && (
                            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                              HOME
                            </span>
                          )}
                        </div>
                        {p.title && <p className="text-xs text-zinc-600 mt-0.5">{p.title}</p>}
                      </td>
                      <td className="py-3 px-3">
                        <a
                          href={p.url || '/'}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#087f77] font-semibold hover:underline flex items-center gap-1 text-xs"
                        >
                          {p.url || '/'} <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => toggleStatus(p)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${p.status !== false ? 'bg-[#087f77]' : 'bg-zinc-300'}`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${p.status !== false ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </td>
                      <td className="py-3 px-3 relative">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setOpenDropdownId(openDropdownId === p.id ? null : p.id)}
                            className="border border-zinc-300 bg-white text-zinc-900 text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-zinc-100 cursor-pointer"
                          >
                            SELECT <ChevronDown className="w-3 h-3" />
                          </button>
                          {openDropdownId === p.id && (
                            <div className="absolute right-0 mt-1 w-32 bg-white border border-zinc-200 rounded-xl shadow-xl z-20 py-1">
                              <button
                                onClick={() => { setPreviewPage(p); setOpenDropdownId(null); }}
                                className="w-full text-left px-3 py-1.5 text-xs text-zinc-900 font-semibold hover:bg-zinc-100 flex items-center gap-2 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" /> View Details
                              </button>
                              <button
                                onClick={() => handleEdit(p)}
                                className="w-full text-left px-3 py-1.5 text-xs text-zinc-900 font-semibold hover:bg-zinc-100 flex items-center gap-2 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="w-full text-left px-3 py-1.5 text-xs text-rose-600 font-semibold hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
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

          <div className="flex items-center justify-between mt-4 text-xs text-zinc-600 font-medium">
            <span>Showing {filtered.length > 0 ? 1 : 0} to {filtered.length} of {filtered.length} entries</span>
          </div>
        </div>
      </div>

      {previewPage && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-950">{previewPage.name}</h3>
              <button onClick={() => setPreviewPage(null)} className="text-zinc-500 hover:text-zinc-950 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong className="text-zinc-800">Page Title:</strong> <span className="text-zinc-950 font-semibold">{previewPage.title}</span></p>
              <p><strong className="text-zinc-800">Route / URL:</strong> <span className="text-[#087f77] font-mono">{previewPage.url}</span></p>
              <p className="text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-xl p-3 mt-2">{previewPage.description || 'No description provided.'}</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <a
                href={previewPage.url || '/'}
                target="_blank"
                rel="noreferrer"
                className="bg-[#087f77] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5"
              >
                Open Live Page <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setPreviewPage(null)}
                className="bg-zinc-900 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
