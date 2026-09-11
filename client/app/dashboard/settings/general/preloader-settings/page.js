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
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="flex items-center gap-1 text-xs text-zinc-400 mb-4">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>Settings</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-500">Preloader Settings</span>
      </div>

      <h1 className="text-xl font-bold text-white mb-6">Preloader Settings</h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-6">Preloader Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          {/* Status */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase mb-3">PRELOADER STATUS</p>
            <div className="flex gap-6">
              {['show', 'hide'].map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setStatus(opt)}
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer ${status === opt ? 'border-zinc-600' : 'border-zinc-600'}`}
                  >
                    {status === opt && <div className="w-2 h-2 rounded-full bg-zinc-600" />}
                  </div>
                  <span className="text-sm text-zinc-300 capitalize">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase mb-3">PRELOADER TYPE</p>
            <div className="flex gap-6">
              {['animation', 'image'].map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setType(opt)}
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer ${type === opt ? 'border-zinc-600' : 'border-zinc-600'}`}
                  >
                    {type === opt && <div className="w-2 h-2 rounded-full bg-zinc-600" />}
                  </div>
                  <span className="text-sm text-zinc-300 capitalize">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm text-zinc-400 flex-1 border border-zinc-700 rounded px-3 py-2 bg-zinc-800">
            Preloader Image
          </span>
          <button
            onClick={() => fileRef.current.click()}
            className="bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold px-4 py-2 rounded"
          >
            BROWSE
          </button>
          <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFile} />
        </div>

        {/* Preview */}
        <div className="flex justify-center items-center bg-zinc-800 border border-zinc-700 rounded-lg p-8 mb-6 min-h-48">
          {preview ? (
            <img src={preview} alt="Preloader Preview" className="max-h-40 object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-600">
              <ImageIcon className="w-12 h-12" />
              <p className="text-xs">Image Preview</p>
            </div>
          )}
        </div>

        <button className="bg-zinc-800 hover:bg-zinc-800 text-white text-sm font-semibold px-6 py-2 rounded flex items-center gap-2">
          ✓ UPDATE
        </button>
      </div>
    </div>
  );
}
