'use client';
import { useState, useRef } from 'react';
import { ChevronRight, Cloud, FileText, Monitor, Lock } from 'lucide-react';

const APPLICABLE_FOR_OPTIONS = ['Student', 'Parents', 'Teacher', 'Admin', 'Accountant', 'Receptionist', 'Librarian', 'Driver', 'Frontend/Website'];

const quickActions = [
  { label: 'Clear Cache', icon: Cloud, border: 'border-l-zinc-600' },
  { label: 'Clear Log', icon: FileText, border: 'border-l-zinc-500' },
  { label: 'Enable App Debug', icon: Monitor, border: 'border-l-zinc-600' },
  { label: 'Enable Force HTTPS', icon: Lock, border: 'border-l-rose-500' },
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
    <div className="space-y-6 p-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-zinc-800 text-zinc-950 text-sm px-4 py-2 rounded shadow-lg">
          {toast}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs text-zinc-400 mb-4">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>System Settings</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-950 font-bold">Utilities</span>
      </div>

      <h1 className="text-xl font-bold text-zinc-950 mb-6">Utilities</h1>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {quickActions.map(({ label, icon: Icon, border }) => (
          <button
            key={label}
            onClick={() => handleQuickAction(label)}
            className={`bg-white border border-zinc-200 shadow-xs border-l-4 ${border} rounded-lg p-5 flex flex-col items-center gap-3 hover:bg-zinc-100 transition-colors`}
          >
            <Icon className="w-7 h-7 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-950 text-center">{label}</span>
          </button>
        ))}
      </div>

      {/* Maintenance Mode Setting */}
      <div className="bg-white border border-zinc-200 shadow-xs rounded-lg p-6">
        <h2 className="text-base font-semibold text-zinc-950 text-center mb-6">Maintenance Mode Setting</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          {/* Mode */}
          <div>
            <p className="text-xs font-semibold text-zinc-700 uppercase font-bold mb-3">MAINTENANCE MODE</p>
            <div className="flex gap-6">
              {['enable', 'disable'].map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer" onClick={() => setMode(opt)}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${mode === opt ? 'border-zinc-600' : 'border-zinc-600'}`}>
                    {mode === opt && <div className="w-2 h-2 rounded-full bg-zinc-600" />}
                  </div>
                  <span className="text-sm text-zinc-950 capitalize">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase font-bold mb-1 block">TITLE</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>
        </div>

        {/* Sub Title */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-zinc-700 uppercase font-bold mb-1 block">SUB TITLE</label>
          <textarea
            value={subTitle}
            onChange={e => setSubTitle(e.target.value)}
            rows={3}
            className="w-full bg-zinc-800 border border-zinc-200 text-zinc-950 text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none"
          />
        </div>

        {/* Applicable For */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-zinc-700 uppercase font-bold mb-3">APPLICABLE FOR</p>
          <div className="flex flex-wrap gap-4">
            {APPLICABLE_FOR_OPTIONS.map(opt => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer" onClick={() => toggleApplicable(opt)}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${applicableFor.includes(opt) ? 'bg-zinc-800 border-zinc-200' : 'border-zinc-600 bg-transparent'}`}>
                  {applicableFor.includes(opt) && <span className="text-zinc-950 text-xs font-bold">✓</span>}
                </div>
                <span className="text-sm text-zinc-950">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          {preview && (
            <div className="flex justify-center mb-4 bg-zinc-800 border border-zinc-200 rounded-lg p-6">
              <img src={preview} alt="Maintenance" className="max-h-48 object-contain" />
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-700 flex-1 border border-zinc-200 rounded px-3 py-2 bg-zinc-800">Upload Image</span>
            <button onClick={() => fileRef.current.click()} className="bg-zinc-700 hover:bg-zinc-600 text-zinc-950 text-sm font-semibold px-4 py-2 rounded">BROWSE</button>
            <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={e => {
              const file = e.target.files[0];
              if (file) setPreview(URL.createObjectURL(file));
            }} />
          </div>
        </div>

        <button className="bg-zinc-800 hover:bg-zinc-100 text-zinc-950 text-sm font-semibold px-6 py-2 rounded flex items-center gap-2">
          ✓ UPDATE
        </button>
      </div>
    </div>
  );
}
