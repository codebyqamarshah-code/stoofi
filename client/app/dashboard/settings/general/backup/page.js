'use client';
import { useState, useRef } from 'react';
import { UploadCloud, Database, Download, ChevronRight } from 'lucide-react';

export default function Backup() {
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        }
    };

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="mb-6">
                <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-2">
                    <span>Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span>System Settings</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-zinc-950 font-bold">Backup</span>
                </div>
                <h1 className="text-2xl font-bold text-zinc-950">Backup</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-white border border-zinc-200 rounded-xl shadow-xs">
                        <div className="border-b border-zinc-200 px-6 py-4">
                            <h2 className="text-sm font-bold text-zinc-950">Upload From Local Directory</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">Attach File *</label>
                                <div className="flex w-full">
                                    <div className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-300 border-r-0 rounded-l-lg text-sm text-zinc-900 font-medium truncate overflow-hidden flex items-center">
                                        {fileName || 'No file chosen'}
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-r-lg transition-colors whitespace-nowrap cursor-pointer"
                                    >
                                        BROWSE
                                    </button>
                                    <input 
                                        type="file"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                            <button className="w-full px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer">
                                UPDATE FILE
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
                        <div className="border-b border-zinc-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h2 className="text-sm font-bold text-zinc-950">Database Backup List</h2>
                            
                            <div className="flex space-x-2">
                                <button className="flex items-center space-x-2 px-3.5 py-2 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold uppercase tracking-wider rounded-lg border border-zinc-300 shadow-xs transition-colors cursor-pointer">
                                    <UploadCloud className="w-4 h-4 text-zinc-600" />
                                    <span>UPLOAD FILE BACKUP</span>
                                </button>
                                <button className="flex items-center space-x-2 px-3.5 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer">
                                    <Database className="w-4 h-4" />
                                    <span>DATABASE BACKUP</span>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs font-bold text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200">
                                    <tr>
                                        <th className="px-6 py-3 font-bold">SIZE</th>
                                        <th className="px-6 py-3 font-bold">CREATED DATE TIME</th>
                                        <th className="px-6 py-3 font-bold">BACKUP FILES</th>
                                        <th className="px-6 py-3 font-bold">FILE TYPE</th>
                                        <th className="px-6 py-3 font-bold text-right">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 text-zinc-900">
                                    <tr className="hover:bg-zinc-50 transition-colors">
                                        <td className="px-6 py-4 font-semibold">2.5 MB</td>
                                        <td className="px-6 py-4 text-zinc-700">2026-08-25 14:30:00</td>
                                        <td className="px-6 py-4 font-medium text-zinc-950">backup_20260825.sql</td>
                                        <td className="px-6 py-4 font-semibold text-emerald-700">SQL</td>
                                        <td className="px-6 py-4 flex justify-end space-x-2">
                                            <button className="p-2 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 rounded-lg transition-colors cursor-pointer shadow-xs" title="Download">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
