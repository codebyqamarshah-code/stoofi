'use client';

import { useState, useEffect } from 'react';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { fetchCmsSection, mutateCmsSection } from '@/lib/frontendCmsApi';
import {
  ChevronRight,
  Search,
  Trash2,
  Edit3,
  Plus,
  X,
  Eye,
  CheckCircle2
} from 'lucide-react';

const DEFAULT_CUSTOM_PAGES = [
  {
    id: 'page-about',
    title: 'About Our Institution',
    subTitle: 'History, Mission & Vision',
    slug: '/about-us',
    content: 'Our institution is committed to delivering world-class education powered by modern digital learning.'
  },
  {
    id: 'page-admissions',
    title: 'Admissions Policy 2026',
    subTitle: 'Eligibility, Entrance Test & Scholarships',
    slug: '/admissions-policy',
    content: 'Applications are open for all grades. Merit and need-based scholarships are available for qualifying students.'
  },
  {
    id: 'page-privacy',
    title: 'Privacy Policy & Terms',
    subTitle: 'Student & Parent Data Protection Policy',
    slug: '/privacy-policy',
    content: 'We protect all student, parent, and faculty records using enterprise-grade encryption and role-based access.'
  }
];

export default function FrontendPagesListPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [previewPage, setPreviewPage] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchCmsSection('pages', DEFAULT_CUSTOM_PAGES);
      if (!data || data.length === 0) {
        const res = await mutateCmsSection('pages', 'replaceAll', { items: DEFAULT_CUSTOM_PAGES });
        setPages(res.data || DEFAULT_CUSTOM_PAGES);
      } else {
        setPages(data);
      }
      setLoading(false);
    })();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setSubTitle('');
    setSlug('');
    setContent('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setSubTitle(item.subTitle || '');
    setSlug(item.slug || '');
    setContent(item.content || '');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return alert('Please enter Page Title');
    const cleanSlug =
      slug.trim() ||
      '/' +
        title
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-');

    const payload = {
      id: editingId || `page-${Date.now()}`,
      title: title.trim(),
      subTitle: subTitle.trim() || 'Institutional Page',
      slug: cleanSlug,
      content: content.trim() || 'Official institutional page content.'
    };
    const res = await mutateCmsSection('pages', editingId ? 'updateItem' : 'addItem', {
      id: editingId,
      item: payload
    });
    if (res.success) {
      setPages(Array.isArray(res.data) ? res.data : []);
      showToast(editingId ? 'Page updated!' : 'Page created!');
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id) => {
    const res = await mutateCmsSection('pages', 'deleteItem', { id });
    if (res.success) {
      setPages(Array.isArray(res.data) ? res.data : []);
      showToast('Page deleted.');
    }
  };

  const filtered = pages.filter(
    (p) =>
      (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.subTitle || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1.5">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span>Frontend CMS</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-950 font-bold">Pages</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950">Custom Website Pages</h1>
        </div>
        {toast && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> {toast}
          </span>
        )}
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
            Page List ({filtered.length})
          </h2>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 border border-zinc-300 rounded-xl px-3 py-1.5 bg-white">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pages..."
                className="bg-transparent text-xs text-zinc-950 font-medium outline-none w-32"
              />
            </div>

            <TableExportToolbar />

            <button
              type="button"
              onClick={openAddModal}
              className="bg-[#009966] hover:bg-[#008055] text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> ADD PAGE
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">SL</th>
                <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Title</th>
                <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Sub Title</th>
                <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">URL Slug</th>
                <th className="text-right py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-zinc-500 text-sm">
                    Loading pages...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-zinc-500 text-sm">
                    No pages found.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-zinc-50/80">
                    <td className="py-3 px-4 text-zinc-950 font-bold w-12">{idx + 1}</td>
                    <td className="py-3 px-4 text-zinc-950 font-bold">{item.title}</td>
                    <td className="py-3 px-4 text-zinc-700 font-medium">{item.subTitle}</td>
                    <td className="py-3 px-4 text-zinc-600 font-mono text-xs">{item.slug || '/page'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewPage(item)}
                          className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-800 cursor-pointer"
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-800 cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="text-base font-black text-zinc-950">
                {editingId ? 'Edit Page' : 'Create New Page'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-950 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">TITLE *</label>
                <input
                  type="text"
                  placeholder="Page Title *"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">SUB TITLE</label>
                  <input
                    type="text"
                    placeholder="Sub Title"
                    value={subTitle}
                    onChange={(e) => setSubTitle(e.target.value)}
                    className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">URL SLUG</label>
                  <input
                    type="text"
                    placeholder="/custom-page"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">PAGE CONTENT</label>
                <textarea
                  rows={5}
                  placeholder="Write page content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl p-3.5 focus:outline-none focus:border-[#009966] resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="bg-[#009966] hover:bg-[#008055] text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
              >
                ✓ SAVE PAGE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewPage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div>
                <h3 className="text-lg font-black text-zinc-950">{previewPage.title}</h3>
                <p className="text-xs text-emerald-700 font-semibold">{previewPage.subTitle}</p>
              </div>
              <button onClick={() => setPreviewPage(null)} className="text-zinc-500 hover:text-zinc-950">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-sm text-zinc-900 leading-relaxed whitespace-pre-wrap">
              {previewPage.content || 'Official page content.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
