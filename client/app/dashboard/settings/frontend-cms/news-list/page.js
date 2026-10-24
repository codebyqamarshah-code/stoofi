'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { formatDateDMY } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import TableExportToolbar from '@/components/ui/TableExportToolbar';
import { fetchCmsSection, mutateCmsSection, compressCmsImage } from '@/lib/frontendCmsApi';
import {
  ChevronRight,
  Search,
  Trash2,
  Edit3,
  Plus,
  ExternalLink,
  CheckCircle2,
  Upload
} from 'lucide-react';

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function NewsListPage() {
  const [newsList, setNewsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Academic Announcements');
  const [publishDate, setPublishDate] = useState(todayISO());
  const [description, setDescription] = useState('');
  const [showStatus, setShowStatus] = useState(true);
  const [image, setImage] = useState('');
  const [search, setSearch] = useState('');
  const fileRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [items, cats] = await Promise.all([
        fetchCmsSection('newsList', []),
        fetchCmsSection('newsCategory', [])
      ]);
      // Filter out any old Latin lorem ipsum if present
      const cleanItems = (Array.isArray(items) ? items : []).filter(
        (n) => !/^(Aut nostrum|Debitis voluptate|Dolores aperiam|Error eaque|Inventore veritatis|Molestiae quo|Non est nisi|Quia vel)/i.test(n.title || '')
      );
      setNewsList(cleanItems);
      setCategories(
        Array.isArray(cats) && cats.length > 0
          ? cats
          : [
              { id: '1', title: 'Academic Announcements' },
              { id: '2', title: 'Campus Events & Activities' },
              { id: '3', title: 'Sports & Athletics' },
              { id: '4', title: 'Admissions & Scholarships' }
            ]
      );
      setLoading(false);
    })();
  }, []);

  const handleImageChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const compressed = await compressCmsImage(f, 800, 0.82);
    setImage(compressed);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setCategory('Academic Announcements');
    setPublishDate(todayISO());
    setDescription('');
    setShowStatus(true);
    setImage('');
  };

  const handleSave = async () => {
    if (!title.trim()) return alert('Please enter News Title');
    setSaving(true);
    const payload = {
      id: editingId || `news-${Date.now()}`,
      title: title.trim(),
      category: category || 'Academic Announcements',
      date: publishDate || todayISO(),
      description: description.trim(),
      status: showStatus ? 'Published' : 'Draft',
      image:
        image ||
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80'
    };
    const res = await mutateCmsSection('newsList', editingId ? 'updateItem' : 'addItem', {
      id: editingId,
      item: payload
    });
    setSaving(false);
    if (res.success) {
      setNewsList(Array.isArray(res.data) ? res.data : []);
      showToast(editingId ? 'News article updated!' : 'News article published to Home Page!');
      resetForm();
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setCategory(item.category || 'Academic Announcements');
    setPublishDate(item.date || todayISO());
    setDescription(item.description || '');
    setShowStatus(item.status !== 'Draft');
    setImage(item.image || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const res = await mutateCmsSection('newsList', 'deleteItem', { id });
    if (res.success) {
      setNewsList(Array.isArray(res.data) ? res.data : []);
      showToast('News article deleted.');
    }
  };

  const filtered = newsList.filter(
    (n) =>
      (n.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (n.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1.5">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span>Frontend CMS</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-950 font-bold">News List</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950">Campus News & Announcements</h1>
          <p className="text-xs text-zinc-600 mt-0.5">
            Publish real institutional news, notices, and event updates to the Home Page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {toast && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> {toast}
            </span>
          )}
          <Link
            href="/#campus-showcase"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View on Home Page
          </Link>
        </div>
      </div>

      {/* Top Form: Add News */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
            {editingId ? 'Edit News Article' : 'Publish New Article'}
          </h2>
          {editingId && (
            <button onClick={resetForm} className="text-xs font-bold text-rose-600 hover:underline">
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">HEADLINE / TITLE *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Admissions Open for Academic Session 2026-27"
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">CATEGORY *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966]"
            >
              {categories.map((c) => (
                <option key={c.id || c.title} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">PUBLISH DATE *</label>
            <Input
              type="date"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">COVER IMAGE</label>
            <div className="flex items-center gap-2">
              {image && <img src={image} alt="Preview" className="w-10 h-10 rounded-lg object-cover border shrink-0" />}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex-1 bg-zinc-50 hover:bg-emerald-50/40 border border-dashed border-zinc-300 hover:border-[#009966] text-zinc-800 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#009966]" /> {image ? 'Change Image' : 'Upload Cover Image'}
              </button>
              <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">VISIBILITY STATUS</label>
            <select
              value={showStatus ? 'Published' : 'Draft'}
              onChange={(e) => setShowStatus(e.target.value === 'Published')}
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966]"
            >
              <option value="Published">Published (Show on Website)</option>
              <option value="Draft">Draft (Hidden)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">ARTICLE SUMMARY / CONTENT</label>
          <textarea
            rows={4}
            placeholder="Write the news announcement details here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl p-3.5 focus:outline-none focus:border-[#009966] resize-none"
          />
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="bg-[#009966] hover:bg-[#008055] disabled:opacity-50 text-white font-bold text-sm px-6 py-2.5 rounded-xl inline-flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {editingId ? 'UPDATE NEWS ARTICLE' : 'PUBLISH NEWS ARTICLE'}
        </button>
      </div>

      {/* Bottom Card: News List */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
            Published News List ({filtered.length})
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border border-zinc-300 rounded-xl px-3 py-1.5 bg-white">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search news..."
                className="bg-transparent text-xs text-zinc-950 font-medium outline-none w-36"
              />
            </div>
            <TableExportToolbar />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Image</th>
                <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Headline & Summary</th>
                <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Category</th>
                <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Publication Date</th>
                <th className="text-right py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-zinc-500 text-sm">
                    Loading news articles...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-zinc-500 text-sm">
                    No news articles published yet. Add your first campus announcement above!
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-zinc-50/80">
                    <td className="py-3 px-4 w-20">
                      <img
                        src={
                          item.image ||
                          'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=200&auto=format&fit=crop&q=80'
                        }
                        alt={item.title}
                        className="w-14 h-10 rounded-lg object-cover border border-zinc-200"
                      />
                    </td>
                    <td className="py-3 px-4 max-w-md">
                      <div className="text-zinc-950 font-bold">{item.title}</div>
                      {item.description && <div className="text-xs text-zinc-600 line-clamp-1 mt-0.5">{item.description}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-800 font-medium">{formatDateDMY(item.date)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-800 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
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
    </div>
  );
}
