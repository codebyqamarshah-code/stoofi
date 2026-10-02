'use client';
import { useState, useRef } from 'react';
import { ChevronRight, Cloud, FileText, Monitor, Lock } from 'lucide-react';

const APPLICABLE_FOR_OPTIONS = ['Student', 'Parents', 'Teacher', 'Admin', 'Accountant', 'Receptionist', 'Librarian', 'Driver', 'Frontend/Website'];

const quickActions = [
  { label: 'Clear Cache', icon: Cloud, border: 'border-l-emerald-600' },
  { label: 'Clear Log', icon: FileText, border: 'border-l-indigo-600' },
  { label: 'Enable App Debug', icon: Monitor, border: 'border-l-amber-600' },
  { label: 'Enable Force HTTPS', icon: Lock, border: 'border-l-rose-600' },
];

export default function UtilitiesPage() {
  const [mode, setMode] = useState('disable');
  const [title, setTitle] = useState('We will be back soon!');
  const [subTitle, setSubTitle] = useState('Sorry for the inconvenience but we are performing some maintenance at the moment.');
  const [applicableFor, setApplicableFor] = useState(['Student', 'Parents', 'Teacher', 'Admin', 'Accountant', 'Receptionist', 'Librarian', 'Driver', 'Frontend/Website']);
  const [preview, setPreview] = useState(null);
  const [toast, setToast] = useState('');
  const fileRef = useRef();

  const toggleApplicable = (opt) => {
    setApplicableFor(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]);
  };

  const handleQuickAction = (label) => {
    setToast(`${label} executed successfully!`);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white text-zinc-950 text-xs font-bold px-4 py-3 rounded-lg shadow-xl animate-in fade-in">
          {toast}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-4">
        <span>Dashboard</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>System Settings</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-950 font-bold">Utilities</span>
      </div>

      <h1 className="text-2xl font-bold text-zinc-950 mb-6">System Utilities & Maintenance</h1>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {quickActions.map(({ label, icon: Icon, border }) => (
          <button
            key={label}
            onClick={() => handleQuickAction(label)}
            className={`bg-white border border-zinc-200 border-l-4 ${border} rounded-xl p-5 flex flex-col items-center gap-3 hover:bg-zinc-50 shadow-xs transition-all cursor-pointer`}
          >
            <Icon className="w-7 h-7 text-zinc-700" />
            <span className="text-xs font-bold text-zinc-950 text-center">{label}</span>
          </button>
        ))}
      </div>

      {/* Maintenance Mode Setting */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs max-w-4xl">
        <h2 className="text-sm font-bold text-zinc-950 mb-6">Maintenance Mode Setting</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          {/* Mode */}
          <div>
            <p className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3">MAINTENANCE MODE</p>
            <div className="flex gap-6">
              {['enable', 'disable'].map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    checked={mode === opt}
                    onChange={() => setMode(opt)}
                    className="w-4 h-4 accent-zinc-950 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-zinc-900 capitalize">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1 block">TITLE</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-white border border-zinc-300 text-zinc-950 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Sub Title */}
        <div className="mb-6">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1 block">SUB TITLE</label>
          <textarea
            value={subTitle}
            onChange={e => setSubTitle(e.target.value)}
            rows={3}
            className="w-full bg-white border border-zinc-300 text-zinc-950 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none"
          />
        </div>

        {/* Applicable For */}
        <div className="mb-6">
          <p className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3">APPLICABLE FOR</p>
          <div className="flex flex-wrap gap-4">
            {APPLICABLE_FOR_OPTIONS.map(opt => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer" onClick={() => toggleApplicable(opt)}>
                <input
                  type="checkbox"
                  checked={applicableFor.includes(opt)}
                  onChange={() => toggleApplicable(opt)}
                  className="w-4 h-4 rounded accent-zinc-950 cursor-pointer"
                />
                <span className="text-sm font-medium text-zinc-900">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          {preview && (
            <div className="flex justify-center mb-4 bg-zinc-50 border border-zinc-200 rounded-xl p-6">
              <img src={preview} alt="Maintenance" className="max-h-48 object-contain" />
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-700 flex-1 border border-zinc-300 rounded-lg px-3 py-2 bg-zinc-50 truncate">
              {preview ? 'Custom Image Selected' : 'Upload Image'}
            </span>
            <button
              type="button"
              onClick={() => fileRef.current.click()}
              className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              BROWSE
            </button>
            <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={e => {
              const file = e.target.files[0];
              if (file) setPreview(URL.createObjectURL(file));
            }} />
          </div>
        </div>

        <button className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer">
          ✓ UPDATE UTILITIES
        </button>
      </div>
    </div>
  );
}
