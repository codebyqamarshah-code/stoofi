'use client';
import React, { useState, useEffect } from 'react';
import { 
    Search, ChevronRight, Copy, FileSpreadsheet, FileText, Printer, Download, Columns, Trash2 
} from 'lucide-react';
import api from '@/services/api';

export default function PendingReportPage() {
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    useEffect(() => {
        // Fetch data
        const fetchData = async () => {
            try {
                // const res = await api.get('/teacher-evaluation/pending');
                // setData(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-zinc-950 p-6">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-zinc-400 mb-6">
                <span>Dashboard</span>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span>Teacher Evaluation</span>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span className="text-zinc-100">Teacher Pending Evaluation Report</span>
            </div>

            <h1 className="text-2xl font-semibold text-white mb-6">Teacher Pending Evaluation Report</h1>

            {/* Filter Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">CLASS *</label>
                        <select className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500">
                            <option value="">Select Class *</option>
                            {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'O-Levels'].map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">SUBJECT</label>
                        <select className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500">
                            <option value="">Select Subject</option>
                            {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English Language', 'Computer Science'].map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">SECTION</label>
                        <select className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500">
                            <option value="">Select Section</option>
                            {['A', 'B', 'C', 'D'].map(s => (
                                <option key={s} value={s}>Section {s}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">TEACHER</label>
                        <select className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500">
                            <option value="">Select Teacher</option>
                            {['Mudassir Bajwa', 'Fatima Zahra', 'Muhammad Ali', 'Ahmed Khan', 'Dr. Bilal Siddiqui'].map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">SUBMITTED BY</label>
                        <select className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500">
                            <option value="">Select Submitter</option>
                            {['Principal Office', 'Academic Coordinator', 'Vice Principal', 'HOD Science', 'Admin Officer'].map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <button className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded transition-colors">
                        <Search className="w-4 h-4 mr-2" />
                        SEARCH
                    </button>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <div className="relative w-full sm:w-auto">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 w-full sm:w-64 bg-zinc-900 border border-zinc-800 rounded text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="p-2 border border-zinc-800 rounded text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors" title="Copy"><Copy className="w-4 h-4" /></button>
                        <button className="p-2 border border-zinc-800 rounded text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors" title="Excel"><FileSpreadsheet className="w-4 h-4" /></button>
                        <button className="p-2 border border-zinc-800 rounded text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors" title="CSV"><FileText className="w-4 h-4" /></button>
                        <button className="p-2 border border-zinc-800 rounded text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors" title="Print"><Printer className="w-4 h-4" /></button>
                        <button className="p-2 border border-zinc-800 rounded text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors" title="Download"><Download className="w-4 h-4" /></button>
                        <button className="p-2 border border-zinc-800 rounded text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors" title="Columns"><Columns className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-400">
                        <thead className="text-xs text-zinc-400 uppercase bg-zinc-950 border-y border-zinc-800">
                            <tr>
                                <th className="px-4 py-3 font-medium">Staff Id</th>
                                <th className="px-4 py-3 font-medium">Teacher Name</th>
                                <th className="px-4 py-3 font-medium">Submitted By</th>
                                <th className="px-4 py-3 font-medium">Class(Section)</th>
                                <th className="px-4 py-3 font-medium">Rating</th>
                                <th className="px-4 py-3 font-medium">Comment</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center text-zinc-500">No data available in table</td>
                                </tr>
                            ) : (
                                data.map((item, idx) => (
                                    <tr key={idx} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                                        <td className="px-4 py-3 text-zinc-300">{item.staffId}</td>
                                        <td className="px-4 py-3 text-zinc-300">{item.teacherName}</td>
                                        <td className="px-4 py-3 text-zinc-300">{item.submittedBy}</td>
                                        <td className="px-4 py-3 text-zinc-300">{item.classSection}</td>
                                        <td className="px-4 py-3 text-zinc-300">{item.rating}</td>
                                        <td className="px-4 py-3 text-zinc-300">{item.comment}</td>
                                        <td className="px-4 py-3 text-zinc-300">{item.status}</td>
                                        <td className="px-4 py-3 text-right text-zinc-300">
                                            <button className="text-rose-500 hover:text-rose-400 transition-colors" title="Delete">
                                                <Trash2 className="w-4 h-4 ml-auto" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
