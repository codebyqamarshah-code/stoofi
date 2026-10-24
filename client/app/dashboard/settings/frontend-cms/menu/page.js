'use client';

import { useState, useEffect } from 'react';
import { fetchCmsSection, mutateCmsSection } from '@/lib/frontendCmsApi';
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  GripVertical,
  Check,
  CheckCircle2
} from 'lucide-react';

const DEFAULT_MENU_TREE = [
  { id: '1', title: 'Home', level: 0, url: '#home' },
  { id: '2', title: 'About', level: 0, url: '#features' },
  { id: '3', title: 'Course', level: 0, url: '#campus-showcase' },
  { id: '4', title: 'Gallery', level: 0, url: '#photo-gallery' },
  { id: '5', title: 'Result & Routine', level: 0, url: '#academic-downloads' },
  { id: '6', title: 'Contact', level: 0, url: '#contact' },
  { id: '7', title: 'Academic Calendar', level: 1, url: '#academic-downloads' },
  { id: '8', title: 'Class Routine', level: 1, url: '#academic-downloads' },
  { id: '9', title: 'Exam Routine', level: 1, url: '#academic-downloads' },
  { id: '10', title: 'Form Download', level: 1, url: '#academic-downloads' }
];

const STATIC_PAGES = [
  'Home',
  'About Us',
  'Courses',
  'Admission Form',
  'Notice Board',
  'Contact Us',
  'Photo Gallery',
  'Video Gallery',
  'Academic Calendar'
];

export default function MenuManagerPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [staticPagesOpen, setStaticPagesOpen] = useState(true);
  const [customLinksOpen, setCustomLinksOpen] = useState(true);
  const [selectedPages, setSelectedPages] = useState([]);
  const [customUrl, setCustomUrl] = useState('https://');
  const [customLabel, setCustomLabel] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchCmsSection('menu', DEFAULT_MENU_TREE);
      if (!data || data.length === 0) {
        const res = await mutateCmsSection('menu', 'replaceAll', { items: DEFAULT_MENU_TREE });
        setMenuItems(res.data || DEFAULT_MENU_TREE);
      } else {
        setMenuItems(data);
      }
      setLoading(false);
    })();
  }, []);

  const saveMenuList = async (nextItems, msg) => {
    setMenuItems(nextItems);
    await mutateCmsSection('menu', 'replaceAll', { items: nextItems });
    if (msg) showToast(msg);
  };

  const togglePageSelect = (page) => {
    setSelectedPages((prev) => (prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page]));
  };

  const handleAddStaticPages = async () => {
    if (selectedPages.length === 0) return alert('Select at least one page');
    const newItems = selectedPages.map((page) => ({
      id: `menu-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: page,
      level: 0,
      url: '/'
    }));
    await saveMenuList([...menuItems, ...newItems], 'Pages added to navigation menu!');
    setSelectedPages([]);
  };

  const handleAddCustomLink = async () => {
    if (!customLabel.trim()) return alert('Please enter Navigation Label');
    const newItem = {
      id: `menu-${Date.now()}`,
      title: customLabel.trim(),
      level: 0,
      url: customUrl.trim() || '/'
    };
    await saveMenuList([...menuItems, newItem], 'Custom link added to menu!');
    setCustomLabel('');
    setCustomUrl('https://');
  };

  const handleDeleteItem = async (id) => {
    const next = menuItems.filter((item) => item.id !== id);
    await saveMenuList(next, 'Menu item removed.');
  };

  const handleStartEdit = (item) => {
    setEditingId(editingId === item.id ? null : item.id);
    setEditingTitle(item.title);
  };

  const handleSaveEdit = async (id) => {
    const next = menuItems.map((m) => (m.id === id ? { ...m, title: editingTitle } : m));
    await saveMenuList(next, 'Menu item updated!');
    setEditingId(null);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1.5">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span>Frontend CMS</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-950 font-bold">Menu</span>
          </div>
          <h1 className="text-2xl font-black text-zinc-950">Website Navigation Menu Manager</h1>
        </div>
        {toast && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> {toast}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">Add Header Menu Items</h2>

          {/* Static Pages Accordion */}
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden">
            <button
              onClick={() => setStaticPagesOpen(!staticPagesOpen)}
              className="w-full p-4 flex items-center justify-between text-sm font-bold text-zinc-950 hover:bg-zinc-50 cursor-pointer"
            >
              <span>Static Pages</span>
              {staticPagesOpen ? (
                <ChevronUp className="w-4 h-4 text-zinc-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-600" />
              )}
            </button>

            {staticPagesOpen && (
              <div className="p-4 border-t border-zinc-200 space-y-3 bg-zinc-50/60">
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {STATIC_PAGES.map((page) => {
                    const checked = selectedPages.includes(page);
                    return (
                      <label
                        key={page}
                        onClick={() => togglePageSelect(page)}
                        className="flex items-center gap-2.5 text-xs font-semibold text-zinc-900 hover:text-zinc-950 cursor-pointer py-1"
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            checked ? 'bg-[#009966] border-[#009966]' : 'border-zinc-300 bg-white'
                          }`}
                        >
                          {checked && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span>{page}</span>
                      </label>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleAddStaticPages}
                  className="w-full bg-[#009966] hover:bg-[#008055] text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Selected to Menu
                </button>
              </div>
            )}
          </div>

          {/* Custom Links Accordion */}
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden">
            <button
              onClick={() => setCustomLinksOpen(!customLinksOpen)}
              className="w-full p-4 flex items-center justify-between text-sm font-bold text-zinc-950 hover:bg-zinc-50 cursor-pointer"
            >
              <span>Custom Links</span>
              {customLinksOpen ? (
                <ChevronUp className="w-4 h-4 text-zinc-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-600" />
              )}
            </button>

            {customLinksOpen && (
              <div className="p-4 border-t border-zinc-200 space-y-3 bg-zinc-50/60">
                <div>
                  <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">URL</label>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#009966]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-1">
                    Navigation Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Student Portal"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    className="w-full bg-white border border-zinc-300 text-zinc-950 font-medium text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#009966]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomLink}
                  className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Custom Link
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Menu List Tree */}
        <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-2xl shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">Menu Structure</h2>
            <span className="text-xs text-zinc-600 font-bold">{menuItems.length} Items Configured</span>
          </div>

          {loading ? (
            <div className="py-10 text-center text-zinc-500 text-sm">Loading menu structure...</div>
          ) : (
            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
              {menuItems.map((item) => {
                const paddingLeft = item.level === 0 ? 'ml-0' : item.level === 1 ? 'ml-8' : 'ml-16';
                const isEditing = editingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200 rounded-xl p-3 transition-all ${paddingLeft}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <GripVertical className="w-4 h-4 text-zinc-400 cursor-grab" />
                        <span className="text-xs font-bold text-zinc-950">{item.title}</span>
                        {item.url && <span className="text-[11px] font-mono text-zinc-500">({item.url})</span>}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="text-xs font-bold text-[#009966] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          EDIT <ChevronDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-zinc-500 hover:text-rose-600 cursor-pointer p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="mt-3 pt-3 border-t border-zinc-200 flex items-center gap-2">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="flex-1 bg-white border border-zinc-300 text-zinc-950 font-semibold text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#009966]"
                        />
                        <button
                          onClick={() => handleSaveEdit(item.id)}
                          className="bg-[#009966] hover:bg-[#008055] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
