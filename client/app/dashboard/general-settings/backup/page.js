'use client';
import { useState, useRef } from 'react';
import { UploadCloud, Database, Download } from 'lucide-react';

export default function Backup() {
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        }
    };

    return (
        <div className="space-y-6 p-6 text-zinc-100">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Backup</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-white border border-zinc-200 shadow-xs rounded-lg shadow-sm">
                        <div className="border-b border-zinc-200 px-6 py-4">
                            <h2 className="text-lg font-medium">Upload From Local Directory</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-900 font-semibold mb-2">Attach File *</label>
                                <div className="flex w-full">
                                    <div className="flex-1 px-3 py-2 bg-white border border-zinc-200 shadow-xs border-r-0 rounded-l-md text-sm text-zinc-400 truncate overflow-hidden flex items-center">
                                        {fileName || 'No file chosen'}
                                    </div>
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 bg-zinc-800 border border-zinc-200 rounded-r-md text-sm font-medium hover:bg-zinc-700 transition-colors whitespace-nowrap"
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
                            <button className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-100 text-zinc-950 text-sm font-medium rounded-md transition-colors">
                                UPDATE FILE
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white border border-zinc-200 shadow-xs rounded-lg shadow-sm overflow-hidden">
                        <div className="border-b border-zinc-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h2 className="text-lg font-medium">Database Backup List</h2>
                            
                            <div className="flex space-x-2">
                                <button className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-950 text-sm font-medium rounded-md transition-colors border border-zinc-200">
                                    <UploadCloud className="w-4 h-4" />
                                    <span>UPLOAD FILE BACKUP</span>
                                </button>
                                <button className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-100 text-zinc-950 text-sm font-medium rounded-md transition-colors">
                                    <Database className="w-4 h-4" />
                                    <span>DATABASE BACKUP</span>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-zinc-700 uppercase font-bold bg-zinc-50/50">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">SIZE</th>
                                        <th className="px-6 py-3 font-medium">CREATED DATE TIME</th>
                                        <th className="px-6 py-3 font-medium">BACKUP FILES</th>
                                        <th className="px-6 py-3 font-medium">FILE TYPE</th>
                                        <th className="px-6 py-3 font-medium text-right">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    <tr className="hover:bg-zinc-100">
                                        <td className="px-6 py-4">2.5 MB</td>
                                        <td className="px-6 py-4">2023-10-25 14:30:00</td>
                                        <td className="px-6 py-4">backup_20231025.sql</td>
                                        <td className="px-6 py-4">SQL</td>
                                        <td className="px-6 py-4 flex justify-end space-x-2">
                                            <button className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded transition-colors" title="Download">
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
