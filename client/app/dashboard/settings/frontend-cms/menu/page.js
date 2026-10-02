'use client';
import { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Plus, 
  Edit2, 
  GripVertical,
  Check
} from 'lucide-react';

const INITIAL_MENU_TREE = [
  { id: '1', title: 'Home', level: 0 },
  { id: '2', title: 'About', level: 0 },
  { id: '3', title: 'Course', level: 0 },
  { id: '4', title: 'Blog', level: 0 },
  { id: '5', title: 'Gallery', level: 0 },
  { id: '6', title: 'Result', level: 0 },
  { id: '7', title: 'Contact', level: 0 },
  { id: '8', title: 'Others', level: 0 },
  { id: '9', title: 'Student', level: 1 },
  { id: '10', title: 'Student List', level: 2 },
  { id: '11', title: 'Teacher', level: 1 },
  { id: '12', title: 'Teacher List', level: 2 },
  { id: '13', title: 'Academic Calendar', level: 1 },
  { id: '14', title: 'Routine', level: 1 },
  { id: '15', title: 'Class Routine', level: 2 },
  { id: '16', title: 'Exam Routine', level: 2 },
  { id: '17', title: 'Events', level: 1 },
  { id: '18', title: 'Facilities', level: 1 },
  { id: '19', title: 'Individual Result', level: 1 },
  { id: '20', title: 'Noticeboard', level: 1 },
  { id: '21', title: 'Tuition Fees', level: 1 },
  { id: '22', title: 'Donor List', level: 1 },
  { id: '23', title: 'Book a Visit', level: 1 },
  { id: '24', title: 'Form Download', level: 1 },
  { id: '25', title: 'Archive', level: 1 },
];

const STATIC_PAGES = [
  'Home', 'About Us', 'Courses', 'Admission Form', 'Notice Board', 'Contact Us', 'Photo Gallery', 'Academic Calendar'
];

export default function MenuManagerPage() {
  const [menuItems, setMenuItems] = useState(INITIAL_MENU_TREE);
  const [staticPagesOpen, setStaticPagesOpen] = useState(true);
  const [customLinksOpen, setCustomLinksOpen] = useState(false);
  const [selectedPages, setSelectedPages] = useState([]);
  const [customUrl, setCustomUrl] = useState('https://');
  const [customLabel, setCustomLabel] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const togglePageSelect = (page) => {
    setSelectedPages(prev => 
      prev.includes(page) ? prev.filter(p => p !== page) : [...prev, page]
    );
  };

  const handleAddStaticPages = () => {
    if (selectedPages.length === 0) return alert('Select at least one page');
    const newItems = selectedPages.map(page => ({
      id: Date.now() + Math.random().toString(),
      title: page,
      level: 0
    }));
    setMenuItems(prev => [...prev, ...newItems]);
    setSelectedPages([]);
  };

  const handleAddCustomLink = () => {
    if (!customLabel) return alert('Please enter Navigation Label');
    const newItem = {
      id: Date.now().toString(),
      title: customLabel,
      level: 0,
      url: customUrl
    };
    setMenuItems(prev => [...prev, newItem]);
    setCustomLabel('');
    setCustomUrl('https://');
  };

  const handleDeleteItem = (id) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  const handleStartEdit = (item) => {
    setEditingId(editingId === item.id ? null : item.id);
    setEditingTitle(item.title);
  };

  const handleSaveEdit = (id) => {
    setMenuItems(prev => prev.map(m => m.id === id ? { ...m, title: editingTitle } : m));
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>Frontend CMS</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-500">Menu</span>
      </div>

      <h1 className="text-xl font-bold text-white">Menu</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Add Header Menu Accordions */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">Add Header Menu</h2>

          {/* Static Pages Accordion */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setStaticPagesOpen(!staticPagesOpen)}
              className="w-full p-4 flex items-center justify-between text-sm font-semibold text-zinc-200 hover:bg-zinc-800/40 cursor-pointer"
            >
              <span>Static Pages</span>
              {staticPagesOpen ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </button>

            {staticPagesOpen && (
              <div className="p-4 border-t border-zinc-800/60 space-y-3 bg-zinc-900/50">
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {STATIC_PAGES.map((page) => (
                    <label
                      key={page}
                      onClick={() => togglePageSelect(page)}
                      className="flex items-center gap-2 text-xs text-zinc-300 hover:text-white cursor-pointer py-1"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedPages.includes(page) ? 'bg-zinc-800 border-zinc-600' : 'border-zinc-700 bg-zinc-800'}`}>
                        {selectedPages.includes(page) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span>{page}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddStaticPages}
                  className="w-full bg-zinc-800 hover:bg-zinc-800 text-white font-semibold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow mt-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Add to Menu
                </button>
              </div>
            )}
          </div>

          {/* Custom Links Accordion */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setCustomLinksOpen(!customLinksOpen)}
              className="w-full p-4 flex items-center justify-between text-sm font-semibold text-zinc-200 hover:bg-zinc-800/40 cursor-pointer"
            >
              <span>Custom Links</span>
              {customLinksOpen ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </button>

            {customLinksOpen && (
              <div className="p-4 border-t border-zinc-800/60 space-y-3 bg-zinc-900/50">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">URL</label>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={e => setCustomUrl(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white text-xs rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase block mb-1">Navigation Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Portal"
                    value={customLabel}
                    onChange={e => setCustomLabel(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white text-xs rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomLink}
                  className="w-full bg-zinc-800 hover:bg-zinc-800 text-white font-semibold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow mt-2"
                >
                  <Plus className="w-3.5 h-3.5" /> Add to Menu
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Menu List Tree */}
        <div className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h2 className="text-sm font-semibold text-zinc-300">Menu List</h2>
            <span className="text-xs text-zinc-400 font-mono">{menuItems.length} Items configured</span>
          </div>

          <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
            {menuItems.map((item) => {
              const paddingLeft = item.level === 0 ? 'ml-0' : item.level === 1 ? 'ml-8' : 'ml-16';
              const isEditing = editingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 rounded-md p-2.5 transition-all ${paddingLeft}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-3.5 h-3.5 text-zinc-600 cursor-grab" />
                      <span className="text-xs font-semibold text-zinc-300">
                        Title : <span className="text-white">{item.title}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="text-xs text-zinc-400 hover:text-zinc-500 flex items-center gap-1 cursor-pointer"
                      >
                        EDIT <ChevronDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-zinc-500 hover:text-rose-400 cursor-pointer p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Edit Panel */}
                  {isEditing && (
                    <div className="mt-3 pt-3 border-t border-zinc-700/50 flex items-center gap-2">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={e => setEditingTitle(e.target.value)}
                        className="flex-1 bg-zinc-900 border border-zinc-700 text-white text-xs rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                      />
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="bg-zinc-800 hover:bg-zinc-800 text-white text-xs font-semibold px-3 py-1.5 rounded cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

