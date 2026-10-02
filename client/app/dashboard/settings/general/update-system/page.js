'use client';
import { useState, useRef } from 'react';
import { ChevronRight, ExternalLink, Upload } from 'lucide-react';

export default function UpdateSystemPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef();

  const systemInfo = [
    { label: 'Software Version', value: '9.5' },
    { label: 'Check Update', value: 'update', isLink: true },
    { label: 'PHP Version', value: '8.2.30' },
    { label: 'CURL Enable', value: 'enable' },
    { label: 'Purchase Code', value: 'Verified' },
    { label: 'Install Domain', value: 'https://stoofi.pro' },
    { label: 'System Activation Date', value: '15th Aug, 2026' },
    { label: 'Last Update', value: '15th Aug, 2026' },
  ];

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-4">
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span>System Settings</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-950 font-bold">Update System</span>
      </div>

      <h1 className="text-2xl font-bold text-zinc-950 mb-6">Update System</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Upload */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
          <h2 className="text-sm font-bold text-zinc-950 mb-4">Upload From Local Directory</h2>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm text-zinc-900 flex-1 border border-zinc-300 rounded-lg px-3 py-2 bg-zinc-50 font-medium truncate">
              {selectedFile ? selectedFile.name : 'Upload File'}
            </span>
            <button
              onClick={() => fileRef.current.click()}
              className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              BROWSE
            </button>
            <input type="file" ref={fileRef} className="hidden" onChange={e => setSelectedFile(e.target.files[0])} />
          </div>
          <button className="w-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer">
            <Upload className="w-4 h-4" /> SAVE FILE
          </button>
        </div>

        {/* Right: System Info */}
        <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
          <h2 className="text-sm font-bold text-zinc-950 mb-1">Update Details</h2>
          <p className="text-xs font-semibold text-zinc-500 mb-4">System Info</p>
          <div className="divide-y divide-zinc-200">
            {systemInfo.map((item) => (
              <div key={item.label} className="flex items-center py-3">
                <span className="text-sm font-semibold text-zinc-700 w-56">{item.label}</span>
                {item.isLink ? (
                  <a href="#" className="text-sm font-bold text-emerald-600 hover:underline flex items-center gap-1">
                    Update <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-sm font-bold text-zinc-950">{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
