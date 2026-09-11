'use client';
import { useState } from 'react';
import { Copy, FileSpreadsheet, FileText, Printer, Download, Columns, Search, Settings, Download as DownloadIcon, Upload, Check, Trash2 } from 'lucide-react';

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
        <div className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Language Settings</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-sm">
                        <div className="border-b border-zinc-800 px-6 py-4">
                            <h2 className="text-lg font-medium">Add Language</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Select Language *</label>
                                <select 
                                    className="w-full p-2.5 rounded-md bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                >
                                    <option value="">Select a language</option>
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                </select>
                            </div>
                            <button className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-800 text-white text-sm font-medium rounded-md transition-colors">
                                SAVE LANGUAGE
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-sm overflow-hidden">
                        <div className="border-b border-zinc-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h2 className="text-lg font-medium">Language List</h2>
                            
                            <div className="flex items-center space-x-2">
                                <div className="relative">
                                    <input 
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 w-48 sm:w-64"
                                    />
                                    <Search className="w-4 h-4 text-zinc-500 absolute left-2.5 top-2.5" />
                                </div>
                                <div className="flex space-x-1 border border-zinc-800 rounded-md p-1 bg-zinc-950">
                                    {toolbarIcons.map((item, idx) => {
                                        const Icon = item.icon;
                                        return (
                                            <button key={idx} title={item.title} className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors">
                                                <Icon className="w-4 h-4" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="text-xs text-zinc-400 uppercase bg-zinc-950/50">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">SL</th>
                                        <th className="px-6 py-3 font-medium">Language</th>
                                        <th className="px-6 py-3 font-medium">Native</th>
                                        <th className="px-6 py-3 font-medium">Universal</th>
                                        <th className="px-6 py-3 font-medium">Status</th>
                                        <th className="px-6 py-3 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    <tr className="hover:bg-zinc-800/50">
                                        <td className="px-6 py-4">1</td>
                                        <td className="px-6 py-4">English</td>
                                        <td className="px-6 py-4">English</td>
                                        <td className="px-6 py-4">en</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs font-medium rounded-md bg-zinc-600/10 text-zinc-600 border border-zinc-600/20">
                                                DEFAULT
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex justify-end space-x-2">
                                            <button className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded transition-colors">
                                                <Settings className="w-3 h-3" />
                                                <span>SETUP</span>
                                            </button>
                                            <button className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded transition-colors">
                                                <DownloadIcon className="w-3 h-3" />
                                                <span>EXPORT</span>
                                            </button>
                                            <button className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded transition-colors">
                                                <Upload className="w-3 h-3" />
                                                <span>IMPORT</span>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-zinc-800/50">
                                        <td className="px-6 py-4">2</td>
                                        <td className="px-6 py-4">Spanish</td>
                                        <td className="px-6 py-4">Español</td>
                                        <td className="px-6 py-4">es</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs font-medium rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700">
                                                ACTIVE
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex justify-end space-x-2">
                                            <button className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded transition-colors">
                                                <Settings className="w-3 h-3" />
                                                <span>SETUP</span>
                                            </button>
                                            <button className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium bg-zinc-800/20 hover:bg-zinc-800/30 text-zinc-600 rounded border border-zinc-600/20 transition-colors">
                                                <Check className="w-3 h-3" />
                                                <span>MAKE DEFAULT</span>
                                            </button>
                                            <button className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded border border-rose-500/20 transition-colors">
                                                <Trash2 className="w-3 h-3" />
                                                <span>REMOVE</span>
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
