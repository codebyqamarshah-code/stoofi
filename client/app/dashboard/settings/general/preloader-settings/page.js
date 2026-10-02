'use client';
import { useState, useRef } from 'react';
import { ChevronRight, ImageIcon } from 'lucide-react';

export default function PreloaderSettingsPage() {
  const [status, setStatus] = useState('show');
  const [type, setType] = useState('image');
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-2">
        <span>Dashboard</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>Settings</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-zinc-950 font-bold">Preloader Settings</span>
      </div>

      <h1 className="text-2xl font-bold text-zinc-950 mb-6">Preloader Settings</h1>

      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs max-w-4xl">
        <h2 className="text-sm font-bold text-zinc-950 mb-6">Preloader Configuration</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          {/* Status */}
          <div>
            <p className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3">PRELOADER STATUS</p>
            <div className="flex gap-6">
              {['show', 'hide'].map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === opt}
                    onChange={() => setStatus(opt)}
                    className="w-4 h-4 accent-zinc-950 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-zinc-900 capitalize">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <p className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3">PRELOADER TYPE</p>
            <div className="flex gap-6">
              {['animation', 'image'].map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={type === opt}
                    onChange={() => setType(opt)}
                    className="w-4 h-4 accent-zinc-950 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-zinc-900 capitalize">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm font-medium text-zinc-700 flex-1 border border-zinc-300 rounded-lg px-3 py-2 bg-zinc-50 truncate">
            {preview ? 'Custom Preloader Selected' : 'Preloader Image'}
          </span>
          <button
            type="button"
            onClick={() => fileRef.current.click()}
            className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            BROWSE
          </button>
          <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFile} />
        </div>

        {/* Preview */}
        <div className="flex justify-center items-center bg-zinc-50 border border-dashed border-zinc-300 rounded-xl p-8 mb-6 min-h-48">
          {preview ? (
            <img src={preview} alt="Preloader Preview" className="max-h-40 object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <ImageIcon className="w-12 h-12 stroke-[1.5]" />
              <p className="text-xs font-medium">Image Preview</p>
            </div>
          )}
        </div>

        <button className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer">
          ✓ UPDATE PRELOADER
        </button>
      </div>
    </div>
  );
}
