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
  CheckCircle2
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
  { id: 'ncat-academics', title: 'Academic Announcements' },
  { id: 'ncat-campus', title: 'Campus Events & Activities' },
  { id: 'ncat-sports', title: 'Sports & Athletics' },
  { id: 'ncat-achievements', title: 'Student Achievements' },
  { id: 'ncat-admissions', title: 'Admissions & Scholarships' }
];

export default function NewsCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchCmsSection('newsCategory', DEFAULT_CATEGORIES);
      if (!data || data.length === 0) {
        const res = await mutateCmsSection('newsCategory', 'replaceAll', { items: DEFAULT_CATEGORIES });
        setCategories(res.data || DEFAULT_CATEGORIES);
      } else {
        setCategories(data);
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return alert('Please enter Category Name');
    const payload = {
      id: editingId || `ncat-${Date.now()}`,
      title: name.trim()
    };
    const res = await mutateCmsSection('newsCategory', editingId ? 'updateItem' : 'addItem', {
      id: editingId,
      item: payload
    });
    if (res.success) {
      setCategories(Array.isArray(res.data) ? res.data : []);
      showToast(editingId ? 'Category updated!' : 'Category added!');
      setEditingId(null);
      setName('');
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setName(cat.title || '');
  };

  const handleDelete = async (id) => {
    const res = await mutateCmsSection('newsCategory', 'deleteItem', { id });
    if (res.success) {
      setCategories(Array.isArray(res.data) ? res.data : []);
      showToast('Category deleted.');
    }
  };

  const filtered = categories.filter((c) => (c.title || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1.5">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span>Frontend CMS</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-950 font-bold">News Category</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950">News Categories</h1>
        </div>
        {toast && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> {toast}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs p-6 space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              {editingId ? 'Edit Category' : 'Add Category'}
            </h2>
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setName('');
                }}
                className="text-xs font-bold text-rose-600 hover:underline"
              >
                Cancel
              </button>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1.5">CATEGORY NAME *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Science & Innovation"
              className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#009966]"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full bg-[#009966] hover:bg-[#008055] text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {editingId ? 'UPDATE CATEGORY' : 'SAVE CATEGORY'}
          </button>
        </div>

        <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-2xl shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
              Category List ({filtered.length})
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 border border-zinc-300 rounded-xl px-3 py-1.5 bg-white">
                <Search className="w-3.5 h-3.5 text-zinc-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search categories..."
                  className="bg-transparent text-xs text-zinc-950 font-medium outline-none w-32"
                />
              </div>
              <TableExportToolbar />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">SL</th>
                  <th className="text-left py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Category Title</th>
                  <th className="text-right py-2.5 px-4 text-zinc-800 font-bold text-xs uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-zinc-500 text-sm">
                      Loading categories...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-zinc-500 text-sm">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((cat, idx) => (
                    <tr key={cat.id || idx} className="hover:bg-zinc-50/80">
                      <td className="py-3 px-4 text-zinc-950 font-bold w-16">{idx + 1}</td>
                      <td className="py-3 px-4 text-zinc-950 font-bold">{cat.title}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-800 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
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
    </div>
  );
}
