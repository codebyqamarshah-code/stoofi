'use client';
import { useState } from 'react';
import { Copy, FileSpreadsheet, FileText, Printer, Download, Columns, Search, Settings, Download as DownloadIcon, Upload, Check, Trash2, ChevronRight } from 'lucide-react';

export default function LanguageSettings() {
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const toolbarIcons = [
        { icon: Copy, title: 'Copy' },
        { icon: FileSpreadsheet, title: 'Excel' },
        { icon: FileText, title: 'CSV' },
        { icon: Printer, title: 'Print' },
        { icon: Download, title: 'PDF' },
        { icon: Columns, title: 'Columns' }
    ];

    return (
        <div className="min-h-screen bg-white p-6 text-zinc-950">
            <div className="mb-6">
                <div className="flex items-center gap-1 text-xs font-semibold text-zinc-600 mb-2">
                    <span>Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span>General Settings</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-zinc-950 font-bold">Language Settings</span>
                </div>
                <h1 className="text-2xl font-bold text-zinc-950">Language Settings</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-white border border-zinc-200 rounded-xl shadow-xs">
                        <div className="border-b border-zinc-200 px-6 py-4">
                            <h2 className="text-sm font-bold text-zinc-950">Add Language</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-2">Select Language *</label>
                                <select 
                                    className="w-full p-2.5 rounded-lg bg-white border border-zinc-300 text-sm font-medium text-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                >
                                    <option value="">Select a language</option>
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="ar">Arabic</option>
                                    <option value="ur">Urdu</option>
                                </select>
                            </div>
                            <button className="w-full px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer">
                                SAVE LANGUAGE
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
                        <div className="border-b border-zinc-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h2 className="text-sm font-bold text-zinc-950">Active Languages</h2>
                            
                            <div className="flex items-center space-x-2">
                                <div className="relative">
                                    <input 
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 pr-4 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-medium text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 w-48"
                                    />
                                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                                </div>
                                <div className="flex space-x-1 border border-zinc-300 rounded-lg p-1 bg-white">
                                    {toolbarIcons.map((item, idx) => {
                                        const Icon = item.icon;
                                        return (
                                            <button key={idx} title={item.title} className="p-1 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded transition-colors cursor-pointer">
                                                <Icon className="w-3.5 h-3.5" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="text-xs font-bold text-zinc-700 uppercase bg-zinc-50 border-b border-zinc-200">
                                    <tr>
                                        <th className="px-6 py-3">SL</th>
                                        <th className="px-6 py-3">Language</th>
                                        <th className="px-6 py-3">Native</th>
                                        <th className="px-6 py-3">Universal</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 text-zinc-900">
                                    <tr className="hover:bg-zinc-50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-zinc-700">1</td>
                                        <td className="px-6 py-4 font-bold text-zinc-950">English</td>
                                        <td className="px-6 py-4 font-medium text-zinc-800">English</td>
                                        <td className="px-6 py-4 font-mono text-xs text-zinc-600">en</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                DEFAULT
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex justify-end space-x-2">
                                            <button className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800 rounded-lg transition-colors cursor-pointer shadow-xs">
                                                <Settings className="w-3.5 h-3.5" />
                                                <span>SETUP</span>
                                            </button>
                                            <button className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800 rounded-lg transition-colors cursor-pointer shadow-xs">
                                                <DownloadIcon className="w-3.5 h-3.5" />
                                                <span>EXPORT</span>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-zinc-50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-zinc-700">2</td>
                                        <td className="px-6 py-4 font-bold text-zinc-950">Spanish</td>
                                        <td className="px-6 py-4 font-medium text-zinc-800">Español</td>
                                        <td className="px-6 py-4 font-mono text-xs text-zinc-600">es</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-zinc-100 text-zinc-700 border border-zinc-300">
                                                ACTIVE
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex justify-end space-x-2">
                                            <button className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800 rounded-lg transition-colors cursor-pointer shadow-xs">
                                                <Settings className="w-3.5 h-3.5" />
                                                <span>SETUP</span>
                                            </button>
                                            <button className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 transition-colors cursor-pointer">
                                                <Check className="w-3.5 h-3.5" />
                                                <span>MAKE DEFAULT</span>
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
